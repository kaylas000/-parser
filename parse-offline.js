#!/usr/bin/env node

/**
 * Парсит markdown-контент страниц каталога и извлекает URL товаров
 * Затем парсит markdown-контент страниц товаров и собирает данные
 * 
 * Использование:
 *   node parse-offline.js urls    — извлечь URL из сохранённых каталогов
 *   node parse-offline.js parse   — распарсить страницы товаров
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve('./output');
const CATALOG_DIR = path.resolve('./html/catalogs');
const PRODUCTS_DIR = path.resolve('./html/products');

// ============================================================
// Извлечение URL товаров из markdown каталогов
// ============================================================
function extractProductUrls(markdown) {
  const urls = new Set();
  // Ищем ссылки вида [text](https://kolormarket.ru/product/...)
  const regex = /\((https?:\/\/kolormarket\.ru\/product\/[^)]+)\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    urls.add(match[1]);
  }
  return [...urls];
}

// ============================================================
// Парсинг страницы товара из markdown
// ============================================================
function parseProductPage(markdown, url) {
  const product = { url };

  // Название — первый заголовок
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  product.name = h1Match ? h1Match[1].trim() : '';

  // Цена
  const priceMatch = markdown.match(/([\d\s]+[,.]?\d*)\s*(₽|руб|Р)/i);
  product.price = priceMatch ? priceMatch[0].trim() : '';
  product.priceNumeric = priceMatch ? parseFloat(priceMatch[1].replace(/\s/g, '').replace(',', '.')) : null;

  // Статус наличия
  const stockMatch = markdown.match(/(ПОД ЗАКАЗ|В НАЛИЧИИ|нет в наличии|в наличии|под заказ)/i);
  product.availability = stockMatch ? stockMatch[1].trim() : '';

  // Страна
  const countryMatch = markdown.match(/Страна[:\s]*([^\n,]+)/i);
  product.country = countryMatch ? countryMatch[1].trim() : '';

  // Категория
  const catMatch = markdown.match(/Категория[:\s]*\[?([^\n\]]+)/i);
  product.category = catMatch ? catMatch[1].trim() : '';

  // Артикул / SKU
  const skuMatch = markdown.match(/Артикул[:\s]*([^\n]+)/i);
  product.sku = skuMatch ? skuMatch[1].trim() : '';

  // Описание — текст между заголовком и "Похожие товары" или концом
  const descMatch = markdown.match(/(?:ПОД ЗАКАЗ|В НАЛИЧИИ|Страна[^\n]*\n)([\s\S]*?)(?=##\s*Похожие|$)/i);
  if (descMatch) {
    // Убираем мета-строки
    let desc = descMatch[1]
      .replace(/Категория[^\n]*/g, '')
      .replace(/Страна[^\n]*/g, '')
      .replace(/Артикул[^\n]*/g, '')
      .replace(/reCAPTCHA[\s\S]*$/g, '')
      .replace(/Ваше имя[\s\S]*$/g, '')
      .trim();
    product.description = desc;
  } else {
    product.description = '';
  }

  // Изображение — первое изображение
  const imgMatch = markdown.match(/!\[.*?\]\((https?:\/\/kolormarket\.ru\/wp-content\/uploads\/[^)]+)\)/);
  product.image = imgMatch ? imgMatch[1] : '';

  // Все изображения
  const allImgs = [];
  const imgRegex = /!\[.*?\]\((https?:\/\/kolormarket\.ru\/wp-content\/uploads\/[^)]+)\)/g;
  let m;
  while ((m = imgRegex.exec(markdown)) !== null) {
    if (!allImgs.includes(m[1])) allImgs.push(m[1]);
  }
  product.images = allImgs;

  return product;
}

// ============================================================
// MAIN
// ============================================================
const mode = process.argv[2];

if (mode === 'urls') {
  // Собираем все URL из каталогов
  const allUrls = new Set();
  
  if (fs.existsSync(CATALOG_DIR)) {
    const files = fs.readdirSync(CATALOG_DIR).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(CATALOG_DIR, file), 'utf-8');
      const urls = extractProductUrls(content);
      urls.forEach(u => allUrls.add(u));
      console.log(`📄 ${file}: ${urls.length} товаров`);
    }
  }

  const urlList = [...allUrls].sort();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'product-urls.json'), JSON.stringify(urlList, null, 2));
  console.log(`\n✅ Всего уникальных товаров: ${urlList.length}`);
  console.log(`💾 Сохранено: ${path.join(OUTPUT_DIR, 'product-urls.json')}`);

} else if (mode === 'parse') {
  // Парсим страницы товаров
  const allProducts = [];
  
  if (fs.existsSync(PRODUCTS_DIR)) {
    const files = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(PRODUCTS_DIR, file), 'utf-8');
      const url = content.match(/<!-- URL: (.+?) -->/)?.[1] || file.replace('.md', '');
      const product = parseProductPage(content, url);
      if (product.name) {
        allProducts.push(product);
        console.log(`✅ ${product.name} | ${product.country || '—'} | ${product.price || 'по запросу'}`);
      }
    }
  }

  // Сохраняем
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'kolormarket.json'), JSON.stringify({
    scrapedAt: new Date().toISOString(),
    site: 'kolormarket.ru',
    totalProducts: allProducts.length,
    products: allProducts,
  }, null, 2));

  console.log(`\n📊 Всего товаров: ${allProducts.length}`);
  console.log(`💾 Сохранено: ${path.join(OUTPUT_DIR, 'kolormarket.json')}`);

} else {
  console.log('Использование:');
  console.log('  node parse-offline.js urls   — извлечь URL из каталогов');
  console.log('  node parse-offline.js parse  — распарсить товары');
}
