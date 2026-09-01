/**
 * Специализированный экстрактор для kolormarket.ru
 * 
 * Собирает:
 * 1. Карточки товаров со страниц каталога (список)
 * 2. Подробные данные со страниц каждого товара
 */

const cheerio = require('cheerio');

class KolormarketExtractor {
  constructor(config) {
    this.config = config;
    this.visitedProducts = new Set();
  }

  /**
   * Извлекает ссылки на товары со страницы каталога
   */
  extractProductLinks($, baseUrl) {
    const links = new Set();
    
    // Ссылки на товары из карточек
    $('ul.products li.product a[href*="/product/"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const absolute = new URL(href, baseUrl).href;
          // Убираем дубликаты и уже посещённые
          if (!this.visitedProducts.has(absolute)) {
            links.add(absolute);
          }
        } catch {}
      }
    });

    // Ссылки на подкатегории
    $('ul.products li.product-category a').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          links.add(new URL(href, baseUrl).href);
        } catch {}
      }
    });

    return [...links];
  }

  /**
   * Извлекает данные товара со страницы товара (/product/...)
   */
  extractProductData($, url) {
    // Пропускаем если уже парсили
    if (this.visitedProducts.has(url)) return null;
    this.visitedProducts.add(url);

    const product = {
      url,
      name: this.cleanText($('h1.product_title, h1.entry-title, .summary h1').first().text()),
      price: this.cleanText($('.price .woocommerce-Price-amount, .price').first().text()),
      priceNumeric: this.parsePrice($('.price .woocommerce-Price-amount, .price').first().text()),
      sku: this.cleanText($('.sku, [itemprop="sku"]').first().text()),
      availability: this.cleanText($('.stock, .availability').first().text()),
      description: this.cleanText($('.woocommerce-product-details__short-description, .entry-summary .description').first().text()),
      fullDescription: this.cleanText($('#tab-description, .woocommerce-Tabs-panel--description, .product-description').first().text()),
      image: this.resolveUrl($('img.wp-post-image, .woocommerce-product-gallery__image img').first().attr('src'), url),
      gallery: [],
      category: '',
      country: '',
      tags: [],
      attributes: {},
      relatedProducts: [],
    };

    // Галерея изображений
    $('.woocommerce-product-gallery__image img, .flex-viewport img').each((_, img) => {
      const src = $(img).attr('data-src') || $(img).attr('data-large_image') || $(img).attr('src');
      if (src) product.gallery.push(this.resolveUrl(src, url));
    });
    product.gallery = [...new Set(product.gallery)];

    // Категория
    const catEl = $('.posted_in a, .product_meta .posted_in a');
    if (catEl.length) {
      product.category = catEl.map((_, a) => $(a).text().trim()).get().join(' > ');
    }

    // Страна — ищем в мета-данных или тексте
    const metaText = $('.product_meta, .entry-summary, .summary').text();
    const countryMatch = metaText.match(/Страна[:\s]*([^\n,]+)/i);
    if (countryMatch) {
      product.country = this.cleanText(countryMatch[1]);
    }

    // Теги
    $('.tagged_as a, .product_meta .tagged_as a').each((_, a) => {
      product.tags.push($(a).text().trim());
    });

    // Характеристики (атрибуты WooCommerce)
    $('table.woocommerce-product-attributes tr, .woocommerce-product-attributes-item').each((_, row) => {
      const label = $(row).find('th, .woocommerce-product-attributes-item__label').text().trim();
      const value = $(row).find('td, .woocommerce-product-attributes-item__value').text().trim();
      if (label) product.attributes[label] = this.cleanText(value);
    });

    // Похожие товары
    $('.related.products a, .upsells.products a').each((_, a) => {
      const href = $(a).attr('href');
      if (href && href.includes('/product/')) {
        try {
          product.relatedProducts.push(new URL(href, url).href);
        } catch {}
      }
    });
    product.relatedProducts = [...new Set(product.relatedProducts)];

    return product;
  }

  /**
   * Извлекает данные из карточки товара на странице каталога (без перехода на страницу товара)
   */
  extractCardData($, cardEl, baseUrl) {
    const $card = $(cardEl);
    const linkEl = $card.find('a[href*="/product/"]').first();
    
    return {
      url: this.resolveUrl(linkEl.attr('href'), baseUrl),
      name: this.cleanText($card.find('h2, h3, h4, .woocommerce-loop-product__title').first().text()),
      price: this.cleanText($card.find('.price').first().text()),
      priceNumeric: this.parsePrice($card.find('.price').first().text()),
      image: this.resolveUrl($card.find('img').first().attr('src'), baseUrl),
      category: this.cleanText($card.find('.product-category').first().text()),
    };
  }

  /**
   * Извлекает ссылку на следующую страницу пагинации
   */
  extractNextPage($, currentUrl) {
    const next = $('a.next, a.next.page-numbers, .woocommerce-pagination .next').first().attr('href');
    if (next) {
      try {
        return new URL(next, currentUrl).href;
      } catch {}
    }
    return null;
  }

  // === Утилиты ===

  cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  }

  parsePrice(text) {
    if (!text) return null;
    const cleaned = text.replace(/[^\d.,]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  resolveUrl(href, baseUrl) {
    if (!href) return null;
    try {
      return new URL(href, baseUrl).href;
    } catch {
      return href;
    }
  }
}

module.exports = KolormarketExtractor;
