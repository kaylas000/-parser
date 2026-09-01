/**
 * Конфигурация парсера для kolormarket.ru
 * WordPress/WooCommerce сайт — пигменты, диоксид титана, добавки в бетон, формы
 */

module.exports = {
  // === ОСНОВНЫЕ НАСТРОЙКИ ===
  targetUrl: 'https://kolormarket.ru',
  engine: 'cheerio',          // Статический WordPress — cheerio достаточно и быстро
  
  // === ОГРАНИЧЕНИЯ ===
  maxPages: 10000,
  requestDelay: 1500,         // 1.5 сек — не перегружаем сервер
  timeout: 30000,
  maxRetries: 3,
  
  // === ФИЛЬТРЫ ===
  sameDomain: true,
  excludePatterns: [
    /\.(jpg|jpeg|png|gif|svg|ico|css|js|pdf|zip|rar|mp4|mp3|doc|docx|xls|xlsx)$/i,
    /#/,
    /mailto:/,
    /tel:/,
    /javascript:/,
    /\/cart\//,
    /\/checkout\//,
    /\/my-account\//,
    /\/wp-admin\//,
    /\/wp-login/,
    /\/feed\//,
    /\/wp-json\//,
    /\/xmlrpc/,
    /\?replytocom=/,
    /\/wp-content\/uploads\//,  // Прямые ссылки на файлы
  ],
  includePatterns: [],
  
  // === CSS-СЕЛЕКТОРЫ (WooCommerce) ===
  selectors: {
    // Карточки товаров в каталоге
    itemContainer: '.products .product, ul.products > li, .product-category',

    fields: {
      title:       'h2 a, h3 a, h4 a, .woocommerce-loop-product__title, .product-title a',
      price:       '.price, .woocommerce-Price-amount',
      description: '.woocommerce-product-details__short-description, .product-short-description, .entry-summary p',
      image:       'img',
      link:        'h2 a, h3 a, h4 a, a.woocommerce-LoopProduct-link',
      category:    '.product-category a, .posted_in a, .product_meta .posted_in',
      sku:         '.sku, .product_meta .sku',
      availability:'.stock, .availability, .in-stock, .out-of-stock',
      country:     '.product_meta, .country',
    },

    // Пагинация WooCommerce
    pagination: {
      nextSelector: 'a.next, .woocommerce-pagination .next, a.next.page-numbers',
      pageParam: 'page/',
    },
  },
  
  // === ВЫВОД ===
  output: {
    dir: './output',
    format: 'both',
    filename: 'kolormarket',
  },
  
  // === PUPPETEER ===
  puppeteer: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    waitForSelector: null,
    scrollToBottom: false,
    cookies: [],
  },
};
