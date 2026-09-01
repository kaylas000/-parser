#!/usr/bin/env node

/**
 * 🕷️  Full-Site Parser — собирает структурированные данные со всех страниц сайта
 *
 * Использование:
 *   node index.js                          # Парсинг с настройками из config.js
 *   node index.js --url https://site.com   # Указать URL из командной строки
 *   node index.js --engine cheerio         # Выбрать движок
 *   node index.js --max-pages 50           # Ограничить количество страниц
 *   node index.js --selector ".product"    # Указать контейнер элементов
 */

const Crawler = require('./src/crawler');
const Extractor = require('./src/extractor');
const Exporter = require('./src/exporter');
const { fetchWithCheerio, fetchWithPuppeteer, closeBrowser } = require('./src/engines');

// Загружаем конфиг и переопределяем из CLI-аргументов
const config = require('./src/config');
applyCliArgs(config);

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     🕷️  Full-Site Parser v1.0.0          ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log();
  console.log(`🌐 Сайт:    ${config.targetUrl}`);
  console.log(`⚙️  Движок:  ${config.engine}`);
  console.log(`📄 Лимит:   ${config.maxPages || 'без ограничений'} страниц`);
  console.log(`⏱️  Пауза:   ${config.requestDelay}мс между запросами`);
  console.log();

  const crawler = new Crawler(config);
  const extractor = new Extractor(config);
  const exporter = new Exporter(config);

  // Выбираем функцию загрузки страницы
  const fetchPage = config.engine === 'puppeteer'
    ? (url) => fetchWithPuppeteer(url, config)
    : (url) => fetchWithCheerio(url, config);

  const startTime = Date.now();

  try {
    // Обходим все страницы
    for await (const { url, $ } of crawler.crawl(fetchPage)) {
      // Извлекаем элементы
      const items = extractor.extractItems($, url);
      const meta = extractor.extractMeta($, url);

      if (items.length > 0) {
        console.log(`  📦 Найдено элементов: ${items.length}`);
      }

      exporter.addPage(items, meta);
    }

    // Сохраняем результаты
    await exporter.save();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n⏱️  Время выполнения: ${elapsed}с`);
    console.log('🎉 Готово!');
  } catch (err) {
    console.error('\n💥 Критическая ошибка:', err.message);
    process.exit(1);
  } finally {
    await closeBrowser();
  }
}

// ============================================================
// CLI ARGUMENTS
// ============================================================
function applyCliArgs(config) {
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
      case '-u':
        config.targetUrl = args[++i];
        break;
      case '--engine':
      case '-e':
        config.engine = args[++i]; // 'puppeteer' или 'cheerio'
        break;
      case '--max-pages':
      case '-m':
        config.maxPages = parseInt(args[++i], 10);
        break;
      case '--delay':
      case '-d':
        config.requestDelay = parseInt(args[++i], 10);
        break;
      case '--selector':
      case '-s':
        config.selectors.itemContainer = args[++i];
        break;
      case '--output':
      case '-o':
        config.output.dir = args[++i];
        break;
      case '--format':
      case '-f':
        config.output.format = args[++i]; // 'json', 'csv', 'both'
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }
}

function printHelp() {
  console.log(`
🕷️  Full-Site Parser — парсер всех страниц сайта

Использование:
  node index.js [опции]

Опции:
  --url, -u <url>          URL сайта для парсинга
  --engine, -e <type>      Движок: 'puppeteer' (JS) или 'cheerio' (статика)
  --max-pages, -m <n>      Максимум страниц (0 = все)
  --delay, -d <ms>         Задержка между запросами в мс
  --selector, -s <css>     CSS-селектор контейнера элементов
  --output, -o <dir>       Директория для вывода
  --format, -f <type>      Формат: 'json', 'csv', 'both'
  --help, -h               Показать справку

Примеры:
  node index.js --url https://shop.example.com --engine cheerio
  node index.js --url https://shop.example.com --selector ".product-card" --max-pages 100
  node index.js --url https://spa-site.com --engine puppeteer --delay 2000
  `);
}

// Запуск
main();
