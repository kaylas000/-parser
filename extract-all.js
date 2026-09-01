#!/usr/bin/env node

/**
 * Извлекает ВСЕ товары kolormarket.ru из markdown-контента каталогов
 * и сохраняет в JSON + CSV
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve('./output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Все страницы каталогов, которые мы собрали
const catalogPages = [
  // === ДИОКСИД ТИТАНА ===
  { category: 'Диоксид титана', subcategory: '', content: `
#### [PRETIOX FS](https://kolormarket.ru/product/pretiox-fs/)
#### [PRETIOX R-200M](https://kolormarket.ru/product/pretiox-r-200m/)
#### [PRETIOX RGU, RGZW, RGX](https://kolormarket.ru/product/pretiox-rgu-rgzw-rgx/)
#### [PRETIOX AV-01SF](https://kolormarket.ru/product/pretiox-av-01sf/)
#### [PRETIOX AV-01FG (ПИЩЕВАЯ ДОБАВКА е-171)](https://kolormarket.ru/product/pretiox-av-01fg/)
#### [TiOx-220](https://kolormarket.ru/product/tiox-220/)
#### [Диоксид титана BILLIONS LOMON BLR-698 (Китай)](https://kolormarket.ru/product/dioksid-titana-billions-lomon-blr-698-kitaj/)
#### [Диоксид титана BILLIONS LOMON BLR-699 (Китай)](https://kolormarket.ru/product/dioksid-titana-billions-lomon-blr-699-kitaj/)
#### [TiOx-230](https://kolormarket.ru/product/tiox-230/)
#### [TiOx-271](https://kolormarket.ru/product/tiox-271/)
#### [TiOx-280](https://kolormarket.ru/product/tiox-280/)
` },

  // === ДОБАВКИ В БЕТОН ===
  { category: 'Добавки в бетон', subcategory: '', content: `
#### [Суперпластификатор С-3](https://kolormarket.ru/product/superplastifikator-s-3/)
#### [Пластификатор ФОРТ УП-2](https://kolormarket.ru/product/plastifitsiruyushhaya-dobavka-up-2/)
#### [Пластификатор ФОРТ УП-3 (с противоморозной добавкой)](https://kolormarket.ru/product/plastifitsiruyushhaya-dobavka-up-3-s-protivomoroznoj-dobavkoj/)
#### [Пластификатор ФОРТ УП-2М](https://kolormarket.ru/product/plastifikator-fort-up-2m/)
#### [Пластификатор ФОРТ УСКОРИН](https://kolormarket.ru/product/plastifikator-fort-uskorin/)
` },

  // === СОПУТСТВУЮЩИЕ ТОВАРЫ ===
  { category: 'Сопутствующие товары', subcategory: '', content: `
#### [Лента упаковочная](https://kolormarket.ru/product/lenta-upakovochnaya/)
#### [Скрепа оцинкованная](https://kolormarket.ru/product/skrepa-otsinkovannaya/)
#### [Масло для форм (Эмульсол)](https://kolormarket.ru/product/maslo-dlya-form-emulsol/)
#### [Перчатки х/б с двойным латексным обливом](https://kolormarket.ru/product/perchatki-h-b-s-dvojnym-lateksnym-oblivom/)
#### [Фортрайс Аэро 200](https://kolormarket.ru/product/fortrajs-aero-200/)
#### [Машинка для ленты ПП](https://kolormarket.ru/product/mashinka-dlya-lenty-pp/)
#### [Стрейч плёнка (1,8 кг)](https://kolormarket.ru/product/strejch-plyonka-1-8-kg/)
` },

  // === ПИГМЕНТЫ — КИТАЙ ===
  { category: 'Пигменты', subcategory: 'Китай', content: `
#### [Tongchem GREEN 5605](https://kolormarket.ru/product/instrument-dlya-pp-kopiya/)
#### [Tongchem Middle Chrome Yellow](https://kolormarket.ru/product/tongchem-middle-chrome-yellow/)
#### [Tongchem Ultramarine Blue 463](https://kolormarket.ru/product/tongchem-ultramarine-blue-463/)
#### [Tongchem 886](https://kolormarket.ru/product/tongchem-ts-886/)
#### [Tongchem Chrome Green GX](https://kolormarket.ru/product/tongchem-gx/)
#### [Tongchem Orange 960](https://kolormarket.ru/product/tongchem-orange-960/)
#### [Tongchem Brown 686](https://kolormarket.ru/product/tongchem-brown-686-2/)
#### [Tongchem Black 722](https://kolormarket.ru/product/tongchem-black-722/)
#### [Tongchem Yellow 920G](https://kolormarket.ru/product/yellow-920g/)
#### [Tongchem Yellow 313](https://kolormarket.ru/product/tongchem-yellow-313-2/)
#### [Tongchem Red 110](https://kolormarket.ru/product/tongchem-red-110/)
#### [Tongchem Red 130](https://kolormarket.ru/product/tongchem-red-130/)
#### [Антикоррозийный пигмент Zinc Phosphate](https://kolormarket.ru/product/antikorrozijnyj-pigment-zinc-phosphate/)
#### [Hyrox Red 130](https://kolormarket.ru/product/hyrox-red-130/)
#### [Hyrox Red 303](https://kolormarket.ru/product/hyrox-red-303/)
#### [Tongchem Lemon Chrome Yellow](https://kolormarket.ru/product/tongchem-lemon-chrome-yellow/)
#### [Tongchem Red 190](https://kolormarket.ru/product/tongchem-red-190/)
#### [Tongchem Black 777](https://kolormarket.ru/product/tongchem-black-777/)
#### [Tongchem Black 725](https://kolormarket.ru/product/tongchem-black-725/)
` },

  // === ПИГМЕНТЫ — ЧЕХИЯ ===
  { category: 'Пигменты', subcategory: 'Чехия', content: '' },

  // === ПИГМЕНТЫ — ИНДИЯ ===
  { category: 'Пигменты', subcategory: 'Индия', content: `
#### [Ultramarine UMB E-5137 (Pigment Blue 29)](https://kolormarket.ru/product/umb-e-5137-pigment-blue-29/)
` },

  // === ПИГМЕНТЫ — УЗБЕКИСТАН ===
  { category: 'Пигменты', subcategory: 'Узбекистан', content: `
#### [IOX Y02 (Аналог Yellow-313)](https://kolormarket.ru/product/iox-y02-analog-yellow-313/)
` },

  // === VIPUL ORGANICS ===
  { category: 'Органические пигменты (VIPUL)', subcategory: '', content: `
#### [BLUE 9151 K. PB 15.1](https://kolormarket.ru/product/blue-9151-k-pb-15-1/)
#### [BLUE 9153 K. PB 15.3](https://kolormarket.ru/product/blue-9153-k-pb-15-3/)
#### [GREEN 107 K. PG 107](https://kolormarket.ru/product/green-107-k-pg-107/)
#### [ORANGE 7238. PO 34](https://kolormarket.ru/product/orange-7238-po-34/)
#### [VIOLET 1123. PV 23](https://kolormarket.ru/product/violet-1123-pv-23/)
#### [YELLOW 339 K. PY 13](https://kolormarket.ru/product/yellow-339-k-py-13/)
#### [YELLOW 3186. PY 62](https://kolormarket.ru/product/yellow-3186-py-62/)
#### [RED 51270. PR254](https://kolormarket.ru/product/red-51270-pr254/)
#### [YELLOW 3221. PY 74 (2GX)](https://kolormarket.ru/product/yellow-3221-py-74-2gx/)
#### [RED 5266 K. PR 53.1](https://kolormarket.ru/product/red-5266-k-pr-53-1/)
#### [RED 5850. PR 170](https://kolormarket.ru/product/red-5850-pr-170/)
#### [RED 5245. PR 48.3](https://kolormarket.ru/product/red-5245-pr-48-3/)
#### [Yellow 183 (3549)](https://kolormarket.ru/product/yellow-183-3549/)
#### [Yellow 151](https://kolormarket.ru/product/yellow-151/)
#### [Yellow 138 (138K)](https://kolormarket.ru/product/yellow-138-138k/)
#### [Yellow 83 (3249)](https://kolormarket.ru/product/yellow-83-3249/)
#### [Yellow 3](https://kolormarket.ru/product/yellow-1/)
#### [Violet 19](https://kolormarket.ru/product/violet-19/)
#### [Red PR112 (5562)](https://kolormarket.ru/product/red-pr112-5562/)
#### [Red 254 (51270)](https://kolormarket.ru/product/red-254-51270/)
#### [Red 122](https://kolormarket.ru/product/red-122/)
#### [Red 57.1](https://kolormarket.ru/product/red-57-1/)
#### [Red 48.2](https://kolormarket.ru/product/red-48-2/)
` },
];

// ============================================================
// Извлекаем товары из markdown
// ============================================================
function extractProducts(md, category, subcategory) {
  const products = [];
  const regex = /####\s*\[(.+?)\]\((https?:\/\/kolormarket\.ru\/product\/[^)]+)\)/g;
  let match;
  while ((match = regex.exec(md)) !== null) {
    products.push({
      name: match[1].trim(),
      url: match[2],
      category,
      subcategory,
      image: '',
      price: '',
      country: '',
      availability: '',
    });
  }
  return products;
}

// ============================================================
// Собираем все товары из каталогов
// ============================================================
let allProducts = [];

for (const page of catalogPages) {
  const products = extractProducts(page.content, page.category, page.subcategory);
  allProducts.push(...products);
}

// Добавляем формы для плитки (отдельно, т.к. их много)
// Собираем из всех fetch_page результатов выше
const formsPages = {
  'Пластиковые формы': {
    'Польша (Альфа)': [
      'Клевер гладкий 1/1|klever-gladkij-1-1',
      'Клевер рифлёный 1/2|klever-riflyonyj-1-2',
      'Клевер Краковский 1/3|klever-krakovskij-1-3',
      'Клевер Краковский 1/3 (половинки)|klever-krakovskij-1-3-polovinki',
      'Клевер узорчатый 1/4|klever-uzorchatyj-1-4',
      'Клевер Польский 1/5|klever-polskij-1-5',
      'Клевер Руно 1/6|klever-runo-1-6',
      'Ракушка 2/1|rakushka-2-1',
      'Чешуя 2/2|cheshuya-2-2',
      'Бикини 2/3|bikini-2-3',
      'Катушка гладкая 3/1|katushka-gladkaya-3-1',
      'Волна 5/1|volna-5-1',
      'Волна 5/3|volna-5-3',
      'Пазл 6/1|pazl-6-1',
      'Пазл 6/4|pazl-6-4',
      'Брук одинарный 7/1|bruk-odinarnyj-7-1',
      'Брук двойной 7/2|bruk-dvojnoj-7-2',
      'Английский булыжник 7/3|anglijskij-bulyzhnik-7-3',
      'Английский булыжник шагрень двойной 7/3/1|anglijskij-bulyzhnik-shagren-dvojnoj-7-3-1',
      'Старый брук I 7/4|staryj-bruk-i-7-4',
      'Старый брук II 7/5|staryj-bruk-ii-7-5',
      'Брук II 7/6|bruk-ii-7-6',
      'Брук Чешский 7/7|bruk-cheshskij-7-7',
      'Маг 8/1|mag-8-1',
      'Молоток 9/1|molotok-9-1',
      'Молоток 9/2|molotok-9-2',
      'Кирпич гладкий 10/1|kirpich-gladkij-10-1',
      'Кирпич шагрень 10/1|kirpich-shagren-10-1',
      'Кирпич шагрень половинка 10/1|kirpich-shagren-polovinka-10-1',
      'Ромб 10/2|romb-10-2',
      'Ромб узорчатый 10/3|romb-uzorchatyj-10-3',
      'Кирпич Версаче 10/4|kirpich-versache-10-4',
      'Кирпич шагрень 10/5 тонкий|kirpich-shagren-10-5-tonkij',
      'Соты 11/1|soty-11-1',
      'Шестигранник 12/1, 12/2|shestigrannik-12-1-12-2',
      'Шестигранник 12/3, 12/4|shestigrannik-12-3-12-4',
      'Восьмёрка 13/1|vosmyorka-13-1',
      'Лист клёна 14/1|list-klyona-14-1',
      'Молоток двойной 15/1|molotok-dvojnoj-15-1',
      'Кирпич шагрень ALPHA 15/5|kirpich-shagren-alpha-15-5',
      'Эко I 16/1|eko-i-16-1',
      'Эко II 16/2|eko-ii-16-2',
      'Эко III 16/3|eko-iii-16-3',
      'Антик 19|antik-19',
      'Круг 20/1|krug-20-1',
      'Круг Пазл 20/2|krug-pazl-20-2',
      'Крест 20/3|krest-20-3',
      'Крестик Пазл 20/4|krestik-pazl-20-4',
      'Крест половинка 20/5|krest-polovinka-20-5',
      'Крестик половинка 20/6|krestik-polovinka-20-6',
      'Вставка(добор) 20/7 креста|vstavka-dobor-20-7-kresta',
      'Кораблик 30/1|korablik-30-1',
      'Рыбка 30/2|rybka-30-2',
      'Ящерица 30/3|yashheritsa-30-3',
      'Вставка для квадрата 30/4|vstavka-dlya-kvadrata-30-4-30x30x3',
      'Стопа YETI 47/1 (правая)|stopa-yeti-47-1-pravaya',
      'Стопа BLACK FOOD 47/2 (левая)|stopa-black-food-47-2-levaya',
      'Круг большой 50/1|krug-bolshoj-50-1',
      'Круг пазл большой 50/2|krug-pazl-bolshoj-50-2',
      'Крест большой 50/3|krest-bolshoj-50-3',
      'Крестик пазл большой 50/4|krestik-pazl-bolshoj-50-4',
      'Крест большой 50/5 половинка|krest-bolshoj-50-5-polovinka',
      'Крестик пазл большой 50/6 половинка|krestik-pazl-bolshoj-50-6-polovinka',
      'Кирпич облицовочный 51/1|kirpich-oblitsovochnyj-51-1',
      'Камень облицовочный 52/1|kamen-oblitsovochnyj-52-1',
      'Камень облицовочный 52/2|kamen-oblitsovochnyj-52-2',
      'Камень облицовочный 52/3|kamen-oblitsovochnyj-52-3',
      'Камень облицовочный 52/4|kamen-oblitsovochnyj-52-4',
      'Камень облицовочный 52/5|kamen-oblitsovochnyj-52-5',
      'Камень облицовочный 52/6|kamen-oblitsovochnyj-52-6',
      'Камень облицовочный 52/7|kamen-oblitsovochnyj-52-7',
      'Сланец 52/8|slanets-52-8',
      'Сланец 52/9|slanets-52-9',
      'Камень 52/11|kamen-52-11',
      'Камень 52/12|kamen-52-12',
      'Камень 52/13|kamen-52-13',
      'Камень 52/14|kamen-52-14',
      'Камень 52/15|kamen-52-15',
      'Камень 52/16|kamen-52-16',
      'Камень 52/17|kamen-52-17',
      'Камень 52/18|kamen-52-18',
      'Квадрат Гладкий 71/1|kvadrat-gladkij-71-1',
      'Квадрат Сеть 71/2|kvadrat-set-71-2',
      'Квадрат Цветок 71/3|kvadrat-tsvetok-71-3',
      'Квадрат Ромб 71/4|kvadrat-romb-71-4',
      'Квадрат Паркет 71/5|kvadrat-parket-71-5',
      'Квадрат Паутинка 71/6|kvadrat-pautinka-71-6',
      'Квадрат Песчаник 71/7|kvadrat-peschanik-71-7',
      'Квадрат 71/8 Восточный орнамент|kvadrat-71-8-vostochnyj-ornament',
      'Квадрат 71/9 Дикий камень|kvadrat-71-9-dikij-kamen',
      'Квадрат Косичка 71/10|kvadrat-kosichka-71-10',
      'Квадрат Искра 71/11|kvadrat-iskra-71-11',
      'Квадрат Зубок 71/12|kvadrat-zubok-71-12',
      'Квадрат Круг 71/13|kvadrat-krug-71-13',
      'Квадрат Скальник 71/14|kvadrat-skalnik-71-14',
      'Квадрат Галька 71/15|kvadrat-galka-71-15',
      'Квадрат Тетрис 71/16|kvadrat-tetris-71-16',
      'Тактильная плитка 71/17 Сфера|taktilnaya-plitka-71-17-sfera',
      'Вставка (добор) клевера Краковского 71/18|vstavka-dobor-klevera-krakovskogo-71-18',
      'Квадрат Доска 71/19|kvadrat-doska-71-19',
      'Квадрат 71/21 Калифорния|kvadrat-71-21-kaliforniya',
      'Квадрат 71/22 Новая Калифорния|kvadrat-71-22-novaya-kaliforniya',
      'Квадрат Клетка 72/1|kvadrat-kletka-72-1',
      'Квадрат Окно 72/2|kvadrat-okno-72-2',
      'Квадрат Бабочка 72/3|kvadrat-babochka-72-3',
      'Квадрат Мозаика 72/4|kvadrat-mozaika-72-4',
      'Квадрат Облако 72/5|kvadrat-oblako-72-5',
      'Квадрат Орнамент 72/6|kvadrat-ornament-72-6',
      'Квадрат 72/7 8 Кирпичей|kvadrat-72-7-8-kirpichej',
      'Квадрат 72/7-1 8 Кирпичей кр.шагрень|kvadrat-72-7-1-8-kirpichej-kr-shagren',
      'Квадрат 72/8 Мозаика|kvadrat-72-8-mozaika',
      'Квадрат 72/9 Подсолнух|kvadrat-72-9-podsolnuh',
      'Квадрат 72/10 Дорожка|kvadrat-72-10-dorozhka',
      'Квадрат 72/11 Гладкий|kvadrat-72-11-gladkij',
      'Квадрат 72/12 Старый камень|kvadrat-72-12-staryj-kamen',
      'Квадрат 72/13 12 Кирпичей (гладкий)|kvadrat-72-13-12-kirpichej-gladkij',
      'Рогожка 72/14|rogozhka-72-14',
      'Квадрат Восток 72/15|kvadrat-vostok-72-15',
      'Тактильная плитка 72/16 Сфера|taktilnaya-plitka-72-16-sfera',
      'Тактильная плитка 72/17 Зебра|taktilnaya-plitka-72-17-zebra',
      'Квадрат Ковёр 72/18|kvadrat-kovyor-72-18',
      'Квадрат Тучка 72/19|kvadrat-tuchka-72-19',
      'Квадрат Радиус 72/20|kvadrat-radius-72-20',
      'Квадрат Спираль 72/21|kvadrat-spiral-72-21',
      'Квадрат «3 Доски» 72/22|kvadrat-3-doski-72-22',
      'Квадрат гладкий 72/23|kvadrat-gladkij-72-23',
      'Доска «Террасная» 73/0|doska-terrasnaya-73-0',
      'Брук Римский 74|bruk-rimskij-74',
      'Водосток садовый 81/0|vodostok-sadovyj-81-0',
      'Водосток малый 81/1|vodostok-malyj-81-1',
      'Водосток большой 81/2|vodostok-bolshoj-81-2',
      'Дренаж 81/3|drenazh-81-3',
      'Решётка дренажная 81/4|reshyotka-drenazhnaya-81-4',
      'Бордюр метровый 82/0|bordyur-metrovyj-82-0',
      'Бордюр толстый 82/1|bordyur-tolstyj-82-1',
      'Бордюр тонкий 82/2|bordyur-tonkij-82-2',
      'Бордюр 2-х стор 82/3|bordyur-2-h-stor-82-3',
      'Бордюр полукруг 82/4|bordyur-polukrug-82-4',
      'Балясина 91/1|balyasina-91-1',
      'Балясина 91/2|balyasina-91-2',
      'Балясина 91/3|balyasina-91-3',
      'Перила для балясин 91/4|perila-dlya-balyasin-91-4',
      'Крышка столба 92/1A шагрень|kryshka-stolba-92-1a-shagren',
      'Крышка столба 92/1B шагрень|kryshka-stolba-92-1b-shagren',
      'Крышка забора 92/1С гладкая|kryshka-zabora-92-1s-gladkaya',
      'Крышка забора 92/2A гладкая|kryshka-zabora-92-2a-gladkaya',
      'Решётка садовая 93/4 прямоугольная|reshyotka-sadovaya-93-4-pryamougolnaya',
      'Крышка забора 92/2B|kryshka-zabora-92-2b',
      'Крышка забора 92/2C шагрень|kryshka-zabora-92-2c-shagren',
      'Крышка Медуза 92/3|kryshka-meduza-92-3',
      'Крышка столба 92/4|kryshka-stolba-92-4',
      'Крышка столба 92/4 (вар.2)|kryshka-stolba-92-4-2',
      'Решётка садовая 93/1 малая|reshyotka-sadovaya-93-1-malaya',
      'Решётка садовая 93/2 большая|reshyotka-sadovaya-93-2-bolshaya',
      'Ступени 49/1|stupeni-49-1',
      'Ступени 49/2|stupeni-49-2',
      'Ступени 49/3|stupeni-49-3',
      'Ступени 49/4|stupeni-49-4',
      'Ступени 49/5|stupeni-49-5',
      'Ступени 49/6|stupeni-49-6',
      'Ступени 49 Комплект|stupeni-49-komplekt',
      'Брук шагрень 7/3/1|bruk-shagren-7-3-1',
      'Камень 52/11 (вар.2)|kamen-52-11-2',
    ],
    'Россия (Формасупер)': [
      'Квадрат Шахматная доска|kvadrat-shahmatnaya-doska',
      'Квадрат Гжель|kvadrat-gzhel',
      'Квадрат Орнамент|kvadrat-ornament',
      'Квадрат Лист осени|kvadrat-list-oseni',
      'Квадрат Лист осени (вар.2)|kvadrat-list-oseni-2',
      'Ластрико Галька|lastriko-galka',
      'Квадрат Коса+круги|kvadrat-kosa-krugi',
      'Квадрат Коса+квадрат|kvadrat-kosa-kvadrat',
      'Квадрат Коса+бабочка|kvadrat-kosa-babochka',
      'Квадрат Коса+узор|kvadrat-kosa-uzor',
      'Квадрат Орнамент (вар.2)|kvadrat-ornament-2',
      'Квадрат Веер|kvadrat-veer',
      'Квадрат Камни|kvadrat-kamni',
      'Квадрат гладкий|kvadrat-gladkij',
      'Бордюр (фаска 45 °С)|bordyur-faska-45-s',
      'Бордюр Дорожный|bordyur-dorozhnyj',
      'Ромб: Мороз|romb-moroz',
      'Ромб: Роза ветров|romb-roza-vetrov',
      'Мозаика|mozaika',
      'Волна шагрень|volna-shagren',
      'Бордюр газонный|bordyur-gazonnyj',
      'Колышек к газонному бордюру|kolyshek-k-gazonnomu-bordyuru',
      'Брук классика камень №2|bruk-klassika-kamen-2',
      'Брук классика камень №3|bruk-klassika-kamen-3',
      'Брук классика камень №4|bruk-klassika-kamen-4',
      'Природный камень (есть половинки)|prirodnyj-kamen-est-polovinki',
      'Секада малая (целая)|sekada-malaya-tselaya',
      'Ластрико Калифорния|lastriko-kaliforniya',
      'Ластрико Волна|lastriko-volna',
      'Ластрико Паркет|lastriko-parket',
      'Кирпич гладкий|kirpich-gladkij',
      'Кирпич шагрень|kirpich-shagren',
      'Ластрико Клевер Краковский|lastriko-klever-krakovskij',
      'Ластрико Тучка|lastriko-tuchka',
      'Ластрико Звезда Давида|lastriko-zvezda-davida',
      'Ластрико Клетка|lastriko-kletka-2',
      'Ластрико Колодец|lastriko-kolodets',
      'Ластрико Старый город|lastriko-staryj-gorod',
      'Ластрико 8 кирпичей|lastriko-8-kirpichej',
      'Ластрико Дворцовый камень|lastriko-dvortsovyj-kamen',
      'Ластрико Веер|lastriko-veer',
      'Кленовый лист|klenovyj-list',
      'Паркетик шагрень|parketik-shagren',
      'Паркетик сеточка|parketik-setochka',
      'Бумеранг|bumerang',
    ],
  },
};

// Добавляем формы
for (const [cat, subcats] of Object.entries(formsPages)) {
  for (const [subcat, items] of Object.entries(subcats)) {
    for (const item of items) {
      const [name, slug] = item.split('|');
      allProducts.push({
        name: name.trim(),
        url: `https://kolormarket.ru/product/${slug}/`,
        category: cat,
        subcategory: subcat,
        image: '',
        price: '',
        country: subcat.includes('Польша') ? 'Польша' : subcat.includes('Россия') ? 'Россия' : '',
        availability: '',
      });
    }
  }
}

// Убираем дубликаты по URL
const seen = new Set();
allProducts = allProducts.filter(p => {
  if (seen.has(p.url)) return false;
  seen.add(p.url);
  return true;
});

// Сортируем по категории и имени
allProducts.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.name.localeCompare(b.name);
});

// ============================================================
// Сохраняем
// ============================================================

// JSON
const jsonPath = path.join(OUTPUT_DIR, 'kolormarket.json');
fs.writeFileSync(jsonPath, JSON.stringify({
  scrapedAt: new Date().toISOString(),
  site: 'kolormarket.ru',
  totalProducts: allProducts.length,
  products: allProducts,
}, null, 2), 'utf-8');

// CSV
const csvHeader = 'name,url,category,subcategory,country,price,availability,image\n';
const csvRows = allProducts.map(p => {
  const escape = (s) => `"${(s || '').replace(/"/g, '""')}"`;
  return [escape(p.name), escape(p.url), escape(p.category), escape(p.subcategory), escape(p.country), escape(p.price), escape(p.availability), escape(p.image)].join(',');
}).join('\n');
fs.writeFileSync(path.join(OUTPUT_DIR, 'kolormarket.csv'), csvHeader + csvRows, 'utf-8');

// Статистика
const stats = {};
allProducts.forEach(p => {
  const key = p.category + (p.subcategory ? ` / ${p.subcategory}` : '');
  stats[key] = (stats[key] || 0) + 1;
});

console.log('╔══════════════════════════════════════════════╗');
console.log('║  🎨 kolormarket.ru — Результаты парсинга    ║');
console.log('╚══════════════════════════════════════════════╝');
console.log();
console.log(`📊 Всего товаров: ${allProducts.length}`);
console.log();
console.log('По категориям:');
for (const [cat, count] of Object.entries(stats)) {
  console.log(`  📦 ${cat}: ${count}`);
}
console.log();
console.log(`💾 JSON: ${jsonPath}`);
console.log(`💾 CSV:  ${path.join(OUTPUT_DIR, 'kolormarket.csv')}`);
console.log();
console.log('💡 Для парсинга страниц товаров (цена, описание, страна) запустите:');
console.log('   node kolormarket.js --url https://kolormarket.ru --detail');
