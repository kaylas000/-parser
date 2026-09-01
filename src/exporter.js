/**
 * Экспорт данных в JSON и CSV
 */

const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

class Exporter {
  constructor(config) {
    this.config = config;
    this.allItems = [];
    this.allMeta = [];
    
    // Создаём директорию для вывода
    const outDir = path.resolve(config.output.dir);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
  }

  /**
   * Добавляет данные со страницы
   */
  addPage(items, meta) {
    this.allItems.push(...items);
    this.allMeta.push(meta);
  }

  /**
   * Сохраняет все собранные данные
   */
  async save() {
    const format = this.config.output.format;
    const baseName = this.config.output.filename;
    const outDir = path.resolve(this.config.output.dir);

    if (this.allItems.length === 0) {
      console.log('\n⚠️  Не найдено ни одного элемента для экспорта.');
      console.log('   Проверьте CSS-селекторы в config.js → selectors');
      return;
    }

    if (format === 'json' || format === 'both') {
      await this.saveJSON(path.join(outDir, `${baseName}.json`));
    }

    if (format === 'csv' || format === 'both') {
      await this.saveCSV(path.join(outDir, `${baseName}.csv`));
    }

    // Всегда сохраняем карту сайта
    this.saveSitemap(path.join(outDir, 'sitemap.json'));

    console.log(`\n📊 Итого: ${this.allItems.length} элементов с ${this.allMeta.length} страниц`);
  }

  async saveJSON(filePath) {
    const data = {
      scrapedAt: new Date().toISOString(),
      totalItems: this.allItems.length,
      totalPages: this.allMeta.length,
      items: this.allItems,
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`💾 JSON сохранён: ${filePath}`);
  }

  async saveCSV(filePath) {
    if (this.allItems.length === 0) return;

    // Собираем все уникальные ключи
    const headers = new Set();
    this.allItems.forEach(item => {
      Object.keys(item).forEach(k => {
        if (!k.startsWith('_') || k === '_source_url') {
          headers.add(k);
        }
      });
    });

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [...headers].map(h => ({ id: h, title: h })),
    });

    // Преобразуем массивы и объекты в строки для CSV
    const records = this.allItems.map(item => {
      const record = {};
      for (const [key, value] of Object.entries(item)) {
        if (Array.isArray(value)) {
          record[key] = value.join('; ');
        } else if (typeof value === 'object' && value !== null) {
          record[key] = JSON.stringify(value);
        } else {
          record[key] = value ?? '';
        }
      }
      return record;
    });

    await csvWriter.writeRecords(records);
    console.log(`💾 CSV сохранён: ${filePath}`);
  }

  saveSitemap(filePath) {
    const sitemap = {
      scrapedAt: new Date().toISOString(),
      totalPages: this.allMeta.length,
      pages: this.allMeta,
    };
    fs.writeFileSync(filePath, JSON.stringify(sitemap, null, 2), 'utf-8');
    console.log(`🗺️  Карта сайта: ${filePath}`);
  }
}

module.exports = Exporter;
