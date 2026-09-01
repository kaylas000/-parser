/**
 * Экстрактор — извлекает структурированные данные со страницы
 */

class Extractor {
  constructor(config) {
    this.config = config;
    this.selectors = config.selectors;
  }

  /**
   * Извлекает все элементы со страницы по настроенным селекторам
   */
  extractItems($, url) {
    const items = [];
    const containerSelector = this.selectors.itemContainer;

    if (!containerSelector) {
      // Если контейнер не задан — извлекаем данные со всей страницы как один элемент
      const item = this.extractFields($, url, $('body'));
      if (this.isValidItem(item)) {
        items.push(item);
      }
      return items;
    }

    $(containerSelector).each((index, el) => {
      const $el = $(el);
      const item = this.extractFields($, url, $el, index);
      if (this.isValidItem(item)) {
        items.push(item);
      }
    });

    return items;
  }

  /**
   * Извлекает поля из одного элемента
   */
  extractFields($, url, $el, index = 0) {
    const fields = this.selectors.fields;
    const item = {
      _source_url: url,
      _index: index,
    };

    for (const [fieldName, selector] of Object.entries(fields)) {
      if (!selector) continue;

      try {
        switch (fieldName) {
          case 'image':
            item[fieldName] = this.resolveUrl($el.find(selector).first().attr('src'), url);
            // Собираем все изображения
            const images = [];
            $el.find(selector).each((_, img) => {
              const src = $(img).attr('src') || $(img).attr('data-src') || $(img).attr('data-lazy-src');
              if (src) images.push(this.resolveUrl(src, url));
            });
            item.images = [...new Set(images)];
            break;

          case 'link':
            const href = $el.find(selector).first().attr('href');
            item[fieldName] = this.resolveUrl(href, url);
            break;

          case 'price':
            const priceText = $el.find(selector).first().text().trim();
            item[fieldName] = priceText;
            item._priceNumeric = this.parsePrice(priceText);
            break;

          case 'rating':
            const ratingEl = $el.find(selector).first();
            const ratingText = ratingEl.text().trim();
            const ratingData = ratingEl.attr('data-rating') || ratingEl.attr('aria-label');
            item[fieldName] = ratingData || ratingText;
            item._ratingNumeric = parseFloat(item[fieldName]) || null;
            break;

          default:
            // Текстовое поле — берём текст
            const text = $el.find(selector).first().text().trim();
            item[fieldName] = this.cleanText(text);
        }
      } catch {
        item[fieldName] = null;
      }
    }

    return item;
  }

  /**
   * Парсит цену из текста: "1 234,56 ₽" → 1234.56
   */
  parsePrice(text) {
    if (!text) return null;
    // Убираем всё кроме цифр, точек, запятых
    const cleaned = text.replace(/[^\d.,]/g, '');
    // Заменяем запятую на точку
    const normalized = cleaned.replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
  }

  /**
   * Очищает текст от лишних пробелов и переносов
   */
  cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Преобразует относительный URL в абсолютный
   */
  resolveUrl(href, baseUrl) {
    if (!href) return null;
    try {
      return new URL(href, baseUrl).href;
    } catch {
      return href;
    }
  }

  /**
   * Проверяет, что элемент содержит хоть какие-то полезные данные
   */
  isValidItem(item) {
    const fields = Object.keys(item).filter(k => !k.startsWith('_'));
    return fields.some(k => item[k] && item[k] !== '');
  }

  /**
   * Извлекает данные о пагинации
   */
  extractNextPage($, currentUrl) {
    const nextSelector = this.selectors.pagination.nextSelector;
    if (nextSelector) {
      const nextHref = $(nextSelector).first().attr('href');
      if (nextHref) {
        try {
          return new URL(nextHref, currentUrl).href;
        } catch {}
      }
    }
    return null;
  }

  /**
   * Извлекает метаданные страницы
   */
  extractMeta($, url) {
    return {
      url,
      title: $('title').text().trim(),
      description: $('meta[name="description"]').attr('content') || '',
      ogTitle: $('meta[property="og:title"]').attr('content') || '',
      ogImage: $('meta[property="og:image"]').attr('content') || '',
      canonical: $('link[rel="canonical"]').attr('href') || '',
      h1: $('h1').first().text().trim(),
    };
  }
}

module.exports = Extractor;
