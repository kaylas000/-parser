#!/usr/bin/env node
/**
 * Обновляет kolormarket.json подробными данными со страниц товаров
 */
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve('./output');
const jsonPath = path.join(OUTPUT_DIR, 'kolormarket.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Данные, собранные со страниц товаров
const details = {
  // === ДИОКСИД ТИТАНА ===
  'https://kolormarket.ru/product/pretiox-fs/': { country: 'Чехия', availability: 'ПОД ЗАКАЗ', producer: 'Precheza', category_full: 'Диоксид титана' },
  'https://kolormarket.ru/product/pretiox-r-200m/': { country: 'Чехия', availability: '', producer: 'Precheza', category_full: 'Диоксид титана' },
  'https://kolormarket.ru/product/pretiox-rgu-rgzw-rgx/': { country: 'Чехия', availability: 'ПОД ЗАКАЗ', producer: 'Precheza', category_full: 'Диоксид титана' },
  'https://kolormarket.ru/product/pretiox-av-01sf/': { country: 'Чехия', availability: '', producer: 'Precheza', category_full: 'Диоксид титана' },
  'https://kolormarket.ru/product/pretiox-av-01fg/': { country: 'Чехия', availability: '', producer: 'Precheza', type: 'пищевой', category_full: 'Диоксид титана' },
  'https://kolormarket.ru/product/tiox-220/': { country: 'Крым', availability: 'ПОД ЗАКАЗ', producer: 'TiOx', category_full: 'Диоксид титана, Другие диоксиды', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/tiox-230/': { country: 'Крым', availability: 'ПОД ЗАКАЗ', producer: 'TiOx', category_full: 'Диоксид титана, Другие диоксиды', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/tiox-271/': { country: 'Крым', availability: 'ПОД ЗАКАЗ', producer: 'TiOx', category_full: 'Диоксид титана, Другие диоксиды', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/tiox-280/': { country: 'Крым', availability: 'ПОД ЗАКАЗ', producer: 'TiOx', category_full: 'Диоксид титана, Другие диоксиды', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/dioksid-titana-billions-lomon-blr-698-kitaj/': { country: 'Китай', availability: 'ПОД ЗАКАЗ', producer: 'Lomon Billions', weight: '25 кг', packaging: 'мешок', category_full: 'Диоксид титана', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'], specs: 'TiO2≥92%, Rutile≥98%, Oil absorption≤20g/100g' },
  'https://kolormarket.ru/product/dioksid-titana-billions-lomon-blr-699-kitaj/': { country: 'Китай', availability: 'ПОД ЗАКАЗ', producer: 'Lomon Billions', weight: '25 кг', packaging: 'мешок', category_full: 'Диоксид титана', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'], specs: 'TiO2≥92%, Rutile≥98%, Oil absorption≤20g/100g' },

  // === ДОБАВКИ В БЕТОН ===
  'https://kolormarket.ru/product/superplastifikator-s-3/': { country: 'Россия', producer: 'Суперпласт', category_full: 'Добавки в бетон' },
  'https://kolormarket.ru/product/plastifitsiruyushhaya-dobavka-up-2/': { country: 'Россия', producer: 'ФОРТ (Брянск)', category_full: 'Добавки в бетон' },
  'https://kolormarket.ru/product/plastifitsiruyushhaya-dobavka-up-3-s-protivomoroznoj-dobavkoj/': { country: 'Россия', producer: 'ФОРТ (Брянск)', price_note: 'Цена за 1 тонну', category_full: 'Добавки в бетон' },
  'https://kolormarket.ru/product/plastifikator-fort-up-2m/': { country: 'Россия', producer: 'ФОРТ (Брянск)', category_full: 'Добавки в бетон' },
  'https://kolormarket.ru/product/plastifikator-fort-uskorin/': { country: 'Россия', producer: 'ФОРТ (Брянск)', category_full: 'Добавки в бетон' },

  // === СОПУТСТВУЮЩИЕ ===
  'https://kolormarket.ru/product/lenta-upakovochnaya/': { color: 'белая', length: '1800 м', category_full: 'Сопутствующие товары' },
  'https://kolormarket.ru/product/skrepa-otsinkovannaya/': { packaging: '1000 шт.', category_full: 'Сопутствующие товары' },
  'https://kolormarket.ru/product/maslo-dlya-form-emulsol/': { packaging: 'канистра 5 л', category_full: 'Сопутствующие товары' },
  'https://kolormarket.ru/product/perchatki-h-b-s-dvojnym-lateksnym-oblivom/': { price: '16 руб./пара (от 100 пар — 15 руб.)', category_full: 'Сопутствующие товары' },
  'https://kolormarket.ru/product/fortrajs-aero-200/': { packaging: 'канистра 20 л', category_full: 'Сопутствующие товары' },
  'https://kolormarket.ru/product/mashinka-dlya-lenty-pp/': { category_full: 'Сопутствующие товары' },
  'https://kolormarket.ru/product/strejch-plyonka-1-8-kg/': { weight: '1,8 кг', category_full: 'Сопутствующие товары' },

  // === ПИГМЕНТЫ — КИТАЙ ===
  'https://kolormarket.ru/product/instrument-dlya-pp-kopiya/': { color: 'зеленый', country: 'Китай', producer: 'Tongchem', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-middle-chrome-yellow/': { country: 'Китай', producer: 'Tongchem', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-ultramarine-blue-463/': { country: 'Китай', producer: 'Tongchem', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-ts-886/': { color: 'синий', country: 'Китай', producer: 'Tongchem', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-gx/': { country: 'Китай', producer: 'Tongchem', description: 'Оксид хрома, зеленый', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-orange-960/': { color: 'оранжевый', country: 'Китай', producer: 'Tongchem', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-brown-686-2/': { color: 'коричневый', country: 'Китай', producer: 'Tongchem', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-black-722/': { color: 'черный', country: 'Китай', producer: 'Tongchem', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/yellow-920g/': { color: 'желтый', country: 'Китай', producer: 'Tongchem', weight: '25 кг', packaging: 'мешок', description: 'Гранулированный желтый', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-yellow-313-2/': { color: 'желтый', country: 'Китай', producer: 'Tongchem', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-red-110/': { color: 'красный', country: 'Китай', producer: 'Tongchem', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-red-130/': { color: 'красный', country: 'Китай', producer: 'Tongchem', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/antikorrozijnyj-pigment-zinc-phosphate/': { color: 'белый', country: 'Китай' },
  'https://kolormarket.ru/product/hyrox-red-130/': { color: 'красный', country: 'Китай', producer: 'Hyrox', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/hyrox-red-303/': { color: 'красный', country: 'Китай', producer: 'Hyrox', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-lemon-chrome-yellow/': { country: 'Китай', producer: 'Tongchem', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-red-190/': { color: 'красный', country: 'Китай', producer: 'Tongchem', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-black-777/': { color: 'черный', country: 'Китай', producer: 'Tongchem', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },
  'https://kolormarket.ru/product/tongchem-black-725/': { color: 'черный', country: 'Китай', producer: 'Tongchem', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'MSDS (RUS)', 'TDS', 'TDS (RUS)'] },

  // === ПИГМЕНТЫ — ИНДИЯ ===
  'https://kolormarket.ru/product/umb-e-5137-pigment-blue-29/': { color: 'синий', country: 'Индия', producer: 'Ashoka Pigments Private Limited', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'COA'] },

  // === ПИГМЕНТЫ — УЗБЕКИСТАН ===
  'https://kolormarket.ru/product/iox-y02-analog-yellow-313/': { color: 'желтый', country: 'Узбекистан', producer: 'HYROX — UZB', weight: '20 кг', packaging: 'мешок', docs: ['Технический паспорт'] },

  // === VIPUL ORGANICS ===
  'https://kolormarket.ru/product/blue-9151-k-pb-15-1/': { color: 'синий', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS', 'COA', 'Контакт с пищей'], subcategory_full: 'Пигмент для пластика' },
  'https://kolormarket.ru/product/blue-9153-k-pb-15-3/': { color: 'синий', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS', 'COA', 'Контакт с пищей'], subcategory_full: 'Пигмент для пластика' },
  'https://kolormarket.ru/product/green-107-k-pg-107/': { color: 'зеленый', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS', 'COA', 'Контакт с пищей'], subcategory_full: 'Пигмент для пластика' },
  'https://kolormarket.ru/product/orange-7238-po-34/': { color: 'оранжевый', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS'], subcategory_full: 'Пигменты для краски' },
  'https://kolormarket.ru/product/violet-1123-pv-23/': { color: 'фиолетовый', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS', 'COA'], subcategory_full: 'Пигменты для чернил' },
  'https://kolormarket.ru/product/yellow-339-k-py-13/': { color: 'желтый', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS', 'COA'], subcategory_full: 'Пигмент для пластика' },
  'https://kolormarket.ru/product/yellow-3186-py-62/': { color: 'желтый', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS', 'COA'], subcategory_full: 'Пигмент для пластика' },
  'https://kolormarket.ru/product/red-51270-pr254/': { color: 'красный', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS', 'COA'], subcategory_full: 'Пигменты для краски' },
  'https://kolormarket.ru/product/yellow-3221-py-74-2gx/': { color: 'желтый', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS', 'COA'], subcategory_full: 'Пигменты для краски' },
  'https://kolormarket.ru/product/red-5266-k-pr-53-1/': { color: 'красный', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS', 'COA'], subcategory_full: 'Пигмент для пластика' },
  'https://kolormarket.ru/product/red-5850-pr-170/': { color: 'красный', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS', 'COA'], subcategory_full: 'Пигменты для краски' },
  'https://kolormarket.ru/product/red-5245-pr-48-3/': { color: 'красный', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS', 'COA'], subcategory_full: 'Пигмент для пластика' },
  'https://kolormarket.ru/product/yellow-183-3549/': { color: 'желтый', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/yellow-151/': { color: 'желтый', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/yellow-138-138k/': { color: 'желтый', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/yellow-83-3249/': { color: 'желтый', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/yellow-1/': { color: 'желтый', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/violet-19/': { color: 'фиолетовый', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/red-pr112-5562/': { color: 'красный', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/red-254-51270/': { color: 'красный', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/red-122/': { color: 'красный', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/red-57-1/': { color: 'красный', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS'] },
  'https://kolormarket.ru/product/red-48-2/': { color: 'красный', country: 'Индия', producer: 'Vipul Organics', weight: '25 кг', packaging: 'мешок', docs: ['MSDS', 'TDS'] },

  // === ФОРМЫ — ПОЛЬША (примеры) ===
  'https://kolormarket.ru/product/klever-gladkij-1-1/': { country: 'Польша', producer: 'Zaklad Slusarski (ALPHA)', size: '26,7 x 21,8 cm', thickness: '2,5; 4,5; 6,0; 8,0 cm', pieces_per_m2: 27 },
  'https://kolormarket.ru/product/kvadrat-shahmatnaya-doska/': { country: 'Россия', producer: 'Формасупер', size: '30x30x3 cm', pieces_per_m2: 11 },
};

// Обновляем товары
let updated = 0;
for (const product of data.products) {
  const detail = details[product.url];
  if (detail) {
    Object.assign(product, detail);
    updated++;
  }
  // Для форм Польша — ставим страну по умолчанию
  if (product.subcategory && product.subcategory.includes('Польша') && !product.country) {
    product.country = 'Польша';
    product.producer = 'Zaklad Slusarski (ALPHA)';
  }
  if (product.subcategory && product.subcategory.includes('Россия') && !product.country) {
    product.country = 'Россия';
    product.producer = 'Формасупер';
  }
}

// Сохраняем
fs.writeFileSync(jsonPath, JSON.stringify({
  ...data,
  scrapedAt: new Date().toISOString(),
  note: 'Данные собраны парсером kolormarket.ru. Цены на сайте не публикуются (B2B). Только перчатки: 16 руб./пара.',
  products: data.products,
}, null, 2), 'utf-8');

// CSV
const csvHeader = 'name,url,category,subcategory,country,producer,color,weight,packaging,price,availability,image\n';
const csvRows = data.products.map(p => {
  const esc = (s) => `"${(s || '').replace(/"/g, '""')}"`;
  return [esc(p.name), esc(p.url), esc(p.category), esc(p.subcategory), esc(p.country), esc(p.producer), esc(p.color), esc(p.weight), esc(p.packaging), esc(p.price), esc(p.availability), esc(p.image)].join(',');
}).join('\n');
fs.writeFileSync(path.join(OUTPUT_DIR, 'kolormarket.csv'), csvHeader + csvRows, 'utf-8');

console.log(`✅ Обновлено товаров: ${updated} из ${data.products.length}`);
console.log(`💾 JSON: ${jsonPath}`);
console.log(`💾 CSV:  ${path.join(OUTPUT_DIR, 'kolormarket.csv')}`);
