/**
 * Краулер — обходит все страницы сайта, собирает ссылки
 */

const { URL } = require('url');

class Crawler {
  constructor(config) {
    this.config = config;
    this.visited = new Set();
    this.queue = [];
    this.domain = new URL(config.targetUrl).hostname;
  }

  /**
   * Нормализация URL: убираем якоря, trailing slash, приводим к единому виду
   */
  normalizeUrl(url) {
    try {
      const u = new URL(url);
      u.hash = '';
      u.search = u.search || '';
      // Убираем trailing slash кроме корня
      let path = u.pathname.replace(/\/+$/, '') || '/';
      return `${u.protocol}//${u.host}${path}${u.search}`;
    } catch {
      return null;
    }
  }

  /**
   * Проверяет, нужно ли парсить этот URL
   */
  shouldVisit(url) {
    try {
      const u = new URL(url);
      
      // Только HTTP(S)
      if (!['http:', 'https:'].includes(u.protocol)) return false;
      
      // Тот же домен
      if (this.config.sameDomain && u.hostname !== this.domain) return false;
      
      // Исключённые паттерны
      for (const pattern of this.config.excludePatterns) {
        if (pattern.test(url)) return false;
      }
      
      // Включённые паттерны (если указаны)
      if (this.config.includePatterns.length > 0) {
        const matches = this.config.includePatterns.some(p => p.test(url));
        if (!matches) return false;
      }
      
      // Уже посещали
      const normalized = this.normalizeUrl(url);
      if (!normalized || this.visited.has(normalized)) return false;
      
      // Лимит страниц
      if (this.config.maxPages > 0 && this.visited.size >= this.config.maxPages) return false;
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Извлекает все ссылки со страницы
   */
  extractLinks($, baseUrl) {
    const links = [];
    $('a[href]').each((_, el) => {
      try {
        const href = $(el).attr('href');
        const absolute = new URL(href, baseUrl).href;
        if (this.shouldVisit(absolute)) {
          links.push(this.normalizeUrl(absolute));
        }
      } catch {}
    });
    return [...new Set(links)];
  }

  /**
   * Основной цикл обхода — возвращает async generator
   */
  async *crawl(fetchPage) {
    this.queue.push(this.config.targetUrl);
    this.visited.add(this.normalizeUrl(this.config.targetUrl));

    while (this.queue.length > 0) {
      const url = this.queue.shift();
      
      console.log(`📄 [${this.visited.size}] Парсинг: ${url}`);
      
      try {
        const { $, html } = await fetchPage(url);
        
        // Собираем новые ссылки
        const newLinks = this.extractLinks($, url);
        for (const link of newLinks) {
          if (!this.visited.has(link)) {
            this.visited.add(link);
            this.queue.push(link);
          }
        }
        
        yield { url, $, html };
        
        // Задержка между запросами
        if (this.config.requestDelay > 0) {
          await this.delay(this.config.requestDelay);
        }
      } catch (err) {
        console.error(`  ❌ Ошибка при парсинге ${url}: ${err.message}`);
      }
    }
    
    console.log(`\n✅ Обход завершён. Посещено страниц: ${this.visited.size}`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Crawler;
