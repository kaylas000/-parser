# 🕷️ Full-Site Parser

Парсер для сбора структурированных данных (товары, цены, карточки) со **всех страниц** сайта.

## Два движка

| Движок | Когда использовать | Скорость |
|--------|-------------------|----------|
| **Cheerio** | Статические HTML-сайты | ⚡ Быстро |
| **Puppeteer** | SPA, React, Vue, Angular (JS-рендеринг) | 🐢 Медленнее |

## Быстрый старт

```bash
npm install
node index.js --url https://example.com --engine cheerio
```

## Настройка

### 1. Через файл `src/config.js`

Откройте `src/config.js` и настройте:

```js
module.exports = {
  targetUrl: 'https://your-shop.com',
  engine: 'puppeteer',           // или 'cheerio'
  maxPages: 0,                   // 0 = все страницы
  requestDelay: 1000,            // пауза между запросами (мс)
  
  selectors: {
    itemContainer: '.product-card',  // контейнер с элементами
    fields: {
      title: '.product-name',
      price: '.price',
      description: '.desc',
      image: 'img',
      link: 'a[href]',
    },
  },
};
```

### 2. Через аргументы командной строки

```bash
# Полный парсинг магазина
node index.js \
  --url https://shop.example.com \
  --engine cheerio \
  --selector ".product-card" \
  --max-pages 500 \
  --delay 1500

# SPA-сайт с Puppeteer
node index.js \
  --url https://spa-site.com \
  --engine puppeteer \
  --selector ".item" \
  --format json
```

## Все опции CLI

| Флаг | Сокращение | Описание |
|------|-----------|----------|
| `--url` | `-u` | URL сайта |
| `--engine` | `-e` | `puppeteer` или `cheerio` |
| `--max-pages` | `-m` | Лимит страниц |
| `--delay` | `-d` | Пауза между запросами (мс) |
| `--selector` | `-s` | CSS-селектор контейнера |
| `--output` | `-o` | Папка для вывода |
| `--format` | `-f` | `json`, `csv`, `both` |

## Результаты

Данные сохраняются в папку `output/`:

```
output/
├── parsed_data.json     # Все элементы в JSON
├── parsed_data.csv      # Все элементы в CSV
└── sitemap.json         # Карта сайта (все посещённые URL)
```

### Пример JSON-вывода

```json
{
  "scrapedAt": "2026-09-01T10:00:00.000Z",
  "totalItems": 1234,
  "totalPages": 50,
  "items": [
    {
      "_source_url": "https://shop.com/page/1",
      "title": "Товар 1",
      "price": "1 990 ₽",
      "_priceNumeric": 1990,
      "description": "Описание товара...",
      "image": "https://shop.com/img/1.jpg",
      "link": "https://shop.com/product/1"
    }
  ]
}
```

## Как найти нужные селекторы

1. Откройте сайт в браузере
2. Нажмите **F12** → вкладка **Elements**
3. Наведите на карточку товара/элемента
4. Правый клик → **Copy** → **Copy selector**
5. Вставьте в `config.js` → `selectors.itemContainer`

## Архитектура

```
index.js          ← Точка входа, CLI
src/
├── config.js     ← Настройки (URL, селекторы, лимиты)
├── crawler.js    ← Обход всех страниц (BFS)
├── extractor.js  ← Извлечение данных по селекторам
├── exporter.js   ← Сохранение в JSON/CSV
└── engines.js    ← Cheerio (быстрый) + Puppeteer (JS)
```

## Советы

- **Не бомбардируйте сервер** — ставьте `requestDelay: 1000` и выше
- **Проверьте robots.txt** — убедитесь, что парсинг разрешён
- **Начните с малого** — `--max-pages 10` для теста селекторов
- **Для SPA-сайтов** — используйте `--engine puppeteer`
- **Для простых сайтов** — `--engine cheerio` в 10 раз быстрее
