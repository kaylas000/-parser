/**
 * Движки парсинга: Puppeteer (JS-рендеринг) и Cheerio (статический HTML)
 */

const cheerio = require('cheerio');

// ============================================================
// CHEERIO — быстрый, для статических сайтов
// ============================================================
async function fetchWithCheerio(url, config) {
  // Node 18+ имеет встроенный fetch
  
  const headers = {
    'User-Agent': config.puppeteer.userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
  };

  let lastError;
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(url, {
        headers,
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      return { $, html };
    } catch (err) {
      lastError = err;
      if (attempt < config.maxRetries) {
        console.log(`  ⏳ Повтор ${attempt}/${config.maxRetries}...`);
        await new Promise(r => setTimeout(r, 2000 * attempt));
      }
    }
  }
  throw lastError;
}

// ============================================================
// PUPPETEER — для JS-рендеринга (SPA, React, Vue и т.д.)
// ============================================================
let browser = null;

async function getBrowser(config) {
  if (browser) return browser;
  
  const puppeteer = require('puppeteer');
  browser = await puppeteer.launch({
    headless: config.puppeteer.headless ? 'new' : false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
  });
  return browser;
}

async function fetchWithPuppeteer(url, config) {
  const b = await getBrowser(config);
  const page = await b.newPage();

  try {
    // Настройка viewport и User-Agent
    await page.setViewport(config.puppeteer.viewport);
    await page.setUserAgent(config.puppeteer.userAgent);

    // Установка cookies (если нужна авторизация)
    if (config.puppeteer.cookies.length > 0) {
      await page.setCookie(...config.puppeteer.cookies);
    }

    // Блокируем лишние ресурсы для ускорения
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Загружаем страницу
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: config.timeout,
    });

    // Ждём появления нужного селектора
    if (config.puppeteer.waitForSelector) {
      await page.waitForSelector(config.puppeteer.waitForSelector, {
        timeout: config.timeout,
      });
    }

    // Прокрутка вниз для lazy-load контента
    if (config.puppeteer.scrollToBottom) {
      await autoScroll(page);
    }

    // Получаем HTML после рендеринга
    const html = await page.content();
    const $ = cheerio.load(html);

    return { $, html };
  } finally {
    await page.close();
  }
}

/**
 * Прокрутка страницы вниз для загрузки lazy-load контента
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
      // Таймаут безопасности — 30 секунд
      setTimeout(() => { clearInterval(timer); resolve(); }, 30000);
    });
  });
  // Небольшая пауза после прокрутки
  await new Promise(r => setTimeout(r, 1000));
}

/**
 * Закрывает браузер (вызвать в конце работы)
 */
async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

module.exports = {
  fetchWithCheerio,
  fetchWithPuppeteer,
  closeBrowser,
};
