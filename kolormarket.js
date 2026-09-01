#!/usr/bin/env node

/**
 * 🎨 Парсер kolormarket.ru
 * 
 * Собирает ВСЕ товары со ВСЕХ страниц сайта:
 * 1. Обходит все категории и страницы каталога
 * 2. Переходит на страницу каждого товара
 * 3. Извлекает: название, цену, SKU, страну, описание, изображения, атрибуты
 * 4. Сохраняет в JSON + CSV
 *
 * Использование:
 *   node kolormarket.js                        # Полный парсинг
 *   node kolormarket.js --max-pages 50         # Ограничить страницы каталога
 *   node kolormarket.js --detail               # Парсить страницы товаров (подробно)
 *   node kolormarket.js --detail --delay 2000  # С увеличенной задержкой
 */

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

const config = require('./src/config');
const KolormarketExtractor = require('./src/kolormarket-extractor');

// CLI аргументы
const args = process.argv.slice(2);
const MAX_PAGES = getArg('--max-pages', 10000);
const REQUEST_DELAY = getArg('--delay', 1500);
const FETCH_DETAILS = args.includes('--detail');

function getArg(name, defaultVal) {
  const idx = args.indexOf(name);
  return idx >= 0 && args[idx + 1] ? parseInt(args[idx + 1], 10) : defaultVal;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  🎨 kolormarket.ru — Парсер товаров         ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log();
  console.log(`🌐 Сайт:         ${config.targetUrl}`);
  console.log(`📄 Лимит:        ${MAX_PAGES} страниц каталога`);
  console.log(`⏱️  Пауза:        ${REQUEST_DELAY}мс`);
  console.log(`📦 Подробности:  ${FETCH_DETAILS ? 'ДА (парсим страницы товаров)' : 'НЕТ (только карточки из каталога)'}`);
  console.log();

  const extractor = new KolormarketExtractor(config);
  const allProducts = [];
  const allCategories = [];
  const visitedPages = new Set();
  const visitedProducts = new Set();

  const startTime = Date.now();

  // Шаг 1: Собираем все ссылки на товары, обходя каталог
  console.log('═══ ШАГ 1: Обход каталога ═══\n');
  
  const catalogQueue = [config.targetUrl + '/katalog/'];
  const categoryLinks = new Set();
  const productLinks = new Set();

  // Начинаем с главной страницы каталога и всех категорий
  const startUrls = [
    config.targetUrl + '/katalog/',
    config.targetUrl + '/katalog/pigmenty/',
    config.targetUrl + '/katalog/dioksid-titana/',
    config.targetUrl + '/katalog/dobavki-v-beton/',
    config.targetUrl + '/katalog/plastikovye-formy/',
    config.targetUrl + '/katalog/soputstvuyushhie-tovary/',
    config.targetUrl + '/product-category/vipul-organics/',
  ];

  const pageQueue = [...startUrls];

  while (pageQueue.length > 0 && visitedPages.size < MAX_PAGES) {
    const url = pageQueue.shift();
    const normalized = normalizeUrl(url);
    
    if (!normalized || visitedPages.has(normalized)) continue;
    visitedPages.add(normalized);

    console.log(`📄 [${visitedPages.size}] ${normalized}`);

    try {
      const $ = await fetchPage(normalized);

      // Извлекаем ссылки на товары
      const products = extractor.extractProductLinks($, normalized);
      for (const p of products) {
        if (p.includes('/product/')) {
          productLinks.add(p);
        } else {
          categoryLinks.add(p);
        }
      }

      // Пагинация — следующая страница
      const nextPage = extractor.extractNextPage($, normalized);
      if (nextPage && !visitedPages.has(normalizeUrl(nextPage))) {
        pageQueue.push(nextPage);
      }

      // Добавляем найденные категории в очередь
      for (const cat of categoryLinks) {
        if (!visitedPages.has(normalizeUrl(cat))) {
          pageQueue.push(cat);
        }
      }
      categoryLinks.clear();

      await delay(REQUEST_DELAY);
    } catch (err) {
      console.error(`  ❌ Ошибка: ${err.message}`);
    }
  }

  console.log(`\n✅ Обход каталога завершён.`);
  console.log(`   Страниц обработано: ${visitedPages.size}`);
  console.log(`   Товаров найдено:    ${productLinks.size}`);
  console.log();

  // Шаг 2: Парсим страницы товаров
  if (FETCH_DETAILS && productLinks.size > 0) {
    console.log('═══ ШАГ 2: Парсинг страниц товаров ═══\n');

    let count = 0;
    for (const productUrl of productLinks) {
      count++;
      console.log(`📦 [${count}/${productLinks.size}] ${productUrl}`);

      try {
        const $ = await fetchPage(productUrl);
        const product = extractor.extractProductData($, productUrl);
        if (product) {
          allProducts.push(product);
          console.log(`  ✅ ${product.name} | ${product.country || '—'} | ${product.price || 'цена по запросу'}`);
        }
        await delay(REQUEST_DELAY);
      } catch (err) {
        console.error(`  ❌ Ошибка: ${err.message}`);
      }
    }
  } else {
    // Без --detail: собираем только карточки из каталога
    console.log('═══ ШАГ 2: Сбор карточек из каталога ═══\n');
    
    // Повторно обходим для сбора карточек
    const cardPages = [...visitedPages];
    visitedPages.clear();
    
    for (const pageUrl of cardPages) {
      try {
        const $ = await fetchPage(pageUrl);
        
        $('ul.products li.product').each((_, el) => {
          const card = extractor.extractCardData($, el, pageUrl);
          if (card && card.name && !visitedProducts.has(card.url)) {
            visitedProducts.add(card.url);
            allProducts.push(card);
          }
        });
      } catch {}
    }
    
    console.log(`  📦 Собрано карточек: ${allProducts.length}`);
  }

  // Шаг 3: Сохранение
  console.log('\n═══ ШАГ 3: Сохранение результатов ═══\n');
  await saveResults(allProducts, [...visitedPages]);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n⏱️  Время: ${elapsed}с`);
  console.log('🎉 Готово!');
}

// ============================================================
// HTTP запрос
// ============================================================
async function fetchPage(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        headers,
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      return cheerio.load(html);
    } catch (err) {
      if (attempt < 3) {
        console.log(`  ⏳ Повтор ${attempt}/3...`);
        await delay(2000 * attempt);
      } else {
        throw err;
      }
    }
  }
}

// ============================================================
// Сохранение
// ============================================================
async function saveResults(products, pages) {
  const outDir = path.resolve('./output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // JSON
  const jsonPath = path.join(outDir, 'kolormarket.json');
  fs.writeFileSync(jsonPath, JSON.stringify({
    scrapedAt: new Date().toISOString(),
    site: 'kolormarket.ru',
    totalProducts: products.length,
    totalPages: pages.length,
    products,
    pages,
  }, null, 2), 'utf-8');
  console.log(`💾 JSON: ${jsonPath}`);

  // CSV
  if (products.length > 0) {
    const csvPath = path.join(outDir, 'kolormarket.csv');
    
    // Собираем все ключи
    const headers = new Set();
    products.forEach(p => Object.keys(p).forEach(k => {
      if (typeof p[k] !== 'object' || Array.isArray(p[k])) headers.add(k);
    }));

    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [...headers].map(h => ({ id: h, title: h })),
    });

    const records = products.map(p => {
      const record = {};
      for (const [key, val] of Object.entries(p)) {
        if (Array.isArray(val)) record[key] = val.join('; ');
        else if (typeof val === 'object') record[key] = JSON.stringify(val);
        else record[key] = val ?? '';
      }
      return record;
    });

    await csvWriter.writeRecords(records);
    console.log(`💾 CSV: ${csvPath}`);
  }

  // Карта сайта
  const sitemapPath = path.join(outDir, 'kolormarket-sitemap.json');
  fs.writeFileSync(sitemapPath, JSON.stringify({
    scrapedAt: new Date().toISOString(),
    totalPages: pages.length,
    pages,
  }, null, 2), 'utf-8');
  console.log(`🗺️  Карта: ${sitemapPath}`);
}

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    let path = u.pathname.replace(/\/+$/, '') || '/';
    return `${u.protocol}//${u.host}${path}${u.search}`;
  } catch {
    return null;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Запуск
main().catch(err => {
  console.error('💥 Критическая ошибка:', err);
  process.exit(1);
});
