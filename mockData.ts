
import { NomenclatureDetailResponse, NomenclatureListResponse } from "./types";

export const MOCK_CATALOG_ROOT: NomenclatureListResponse = {
  parent: [
    { ref: "cat_elec", name: "Электроника", parent: null },
    { ref: "cat_cloth", name: "Одежда и обувь", parent: null },
    { ref: "cat_home", name: "Товары для дома", parent: null },
  ],
  nomenclature: [
    { 
      ref: "item_promo", 
      parent: null, 
      name: "Подарочный сертификат", 
      price: [
        { name: "1000₽", ref: "char_1000", price: 1000 }, 
        { name: "3000₽", ref: "char_3000", price: 3000 },
        { name: "5000₽", ref: "char_5000", price: 5000 }
      ] 
    }
  ]
};

// Electronics Level 2
export const MOCK_CATALOG_ELEC: NomenclatureListResponse = {
  parent: [
    { ref: "cat_phones", name: "Смартфоны", parent: "cat_elec" },
    { ref: "cat_laptops", name: "Ноутбуки", parent: "cat_elec" },
    { ref: "cat_audio", name: "Аудио", parent: "cat_elec" },
  ],
  nomenclature: [
    { 
      ref: "item_powerbank", 
      parent: "cat_elec", 
      name: "Внешний аккумулятор PowerPro", 
      price: [
        { name: "10000mAh", ref: "char_10k", price: 1500 },
        { name: "20000mAh", ref: "char_20k", price: 2500 }
      ] 
    }
  ]
};

// Clothing Level 2
export const MOCK_CATALOG_CLOTH: NomenclatureListResponse = {
  parent: [
    { ref: "cat_men", name: "Мужская одежда", parent: "cat_cloth" },
    { ref: "cat_women", name: "Женская одежда", parent: "cat_cloth" },
  ],
  nomenclature: []
};

// Home Level 2
export const MOCK_CATALOG_HOME: NomenclatureListResponse = {
  parent: [],
  nomenclature: [
    {
      ref: "item_lamp",
      parent: "cat_home",
      name: "Настольная лампа LED",
      price: [
        { name: "Белая", ref: "char_white", price: 1200 }, 
        { name: "Черная", ref: "char_black", price: 1200 }
      ]
    },
    {
      ref: "item_chair",
      parent: "cat_home",
      name: "Стул офисный 'Комфорт'",
      price: [{ name: "", ref: "", price: 5990 }]
    },
    {
      ref: "item_pencil",
      parent: "cat_home",
      name: "Простой карандаш (Тест пустой хар-ки)",
      price: [{ name: "", ref: "", price: 15 }]
    }
  ]
};

// Phones Level 3
export const MOCK_CATALOG_PHONES: NomenclatureListResponse = {
  parent: [],
  nomenclature: [
    {
      ref: "item_phone_1",
      parent: "cat_phones",
      name: "Смартфон X-Phone 15",
      price: [
        { name: "128GB", ref: "char_128", price: 79990 },
        { name: "256GB", ref: "char_256", price: 89990 },
        { name: "512GB", ref: "char_512", price: 109990 }
      ]
    },
    {
      ref: "item_phone_2",
      parent: "cat_phones",
      name: "Смартфон Y-Droid Pro",
      price: [
        { name: "Black", ref: "char_black", price: 45000 },
        { name: "Silver", ref: "char_silver", price: 46000 }
      ]
    }
  ]
};

// Laptops Level 3
export const MOCK_CATALOG_LAPTOPS: NomenclatureListResponse = {
  parent: [],
  nomenclature: [
    {
      ref: "item_mac_air",
      parent: "cat_laptops",
      name: "Ультрабук Air M2",
      price: [
        { name: "8/256", ref: "char_8_256", price: 99000 },
        { name: "16/512", ref: "char_16_512", price: 129000 }
      ]
    }
  ]
};

// Audio Level 3
export const MOCK_CATALOG_AUDIO: NomenclatureListResponse = {
  parent: [],
  nomenclature: [
    {
      ref: "item_headphones",
      parent: "cat_audio",
      name: "Беспроводные наушники Pods Pro",
      price: [{ name: "White", ref: "char_white", price: 19990 }]
    }
  ]
};

// Men Clothing Level 3
export const MOCK_CATALOG_MEN: NomenclatureListResponse = {
  parent: [],
  nomenclature: [
    { 
      ref: "item_tshirt", 
      parent: "cat_men", 
      name: "Футболка Базовая", 
      price: [
        { name: "S", ref: "char_s", price: 800 },
        { name: "M", ref: "char_m", price: 800 },
        { name: "L", ref: "char_l", price: 900 },
        { name: "XL", ref: "char_xl", price: 900 }
      ] 
    },
    {
      ref: "item_jeans",
      parent: "cat_men",
      name: "Джинсы Классика",
      price: [
        { name: "30", ref: "char_30", price: 3500 },
        { name: "32", ref: "char_32", price: 3500 },
        { name: "34", ref: "char_34", price: 3500 }
      ]
    }
  ]
};

// Detailed Items
export const MOCK_DETAILS: Record<string, NomenclatureDetailResponse> = {
  "item_promo": {
    ref: "item_promo",
    parent: null,
    name: "Подарочный сертификат",
    article: "CERT-001",
    description: "Лучший подарок - возможность выбора. Сертификат действителен в течение 1 года.",
    price: [
        { name: "1000₽", ref: "char_1000", price: 1000 }, 
        { name: "3000₽", ref: "char_3000", price: 3000 },
        { name: "5000₽", ref: "char_5000", price: 5000 }
    ]
  },
  "item_powerbank": {
    ref: "item_powerbank",
    parent: "cat_elec",
    name: "Внешний аккумулятор PowerPro",
    article: "ACC-PB-001",
    description: "Мощный внешний аккумулятор с поддержкой PD 20W. Хватает на 3-4 полных зарядки телефона.",
    price: [
      { name: "10000mAh", ref: "char_10k", price: 1500 },
      { name: "20000mAh", ref: "char_20k", price: 2500 }
    ]
  },
  "item_phone_1": {
    ref: "item_phone_1",
    parent: "cat_phones",
    name: "Смартфон X-Phone 15",
    article: "PH-XP-15",
    description: "Флагманский смартфон с новейшим процессором, великолепной камерой и ярким дисплеем.",
    price: [
      { name: "128GB", ref: "char_128", price: 79990 },
      { name: "256GB", ref: "char_256", price: 89990 },
      { name: "512GB", ref: "char_512", price: 109990 }
    ]
  },
  "item_phone_2": {
    ref: "item_phone_2",
    parent: "cat_phones",
    name: "Смартфон Y-Droid Pro",
    article: "PH-YDR-PRO",
    description: "Отличное соотношение цены и качества. Батарея 5000mAh, экран 120Hz.",
    price: [
      { name: "Black", ref: "char_black", price: 45000 },
      { name: "Silver", ref: "char_silver", price: 46000 }
    ]
  },
  "item_mac_air": {
    ref: "item_mac_air",
    parent: "cat_laptops",
    name: "Ультрабук Air M2",
    article: "LAP-AIR-M2",
    description: "Невероятно тонкий и легкий ноутбук. Работает до 18 часов без подзарядки. Идеален для работы и учебы.",
    price: [
      { name: "8/256", ref: "char_8_256", price: 99000 },
      { name: "16/512", ref: "char_16_512", price: 129000 }
    ]
  },
  "item_headphones": {
    ref: "item_headphones",
    parent: "cat_audio",
    name: "Беспроводные наушники Pods Pro",
    article: "AUD-PODS-PRO",
    description: "Активное шумоподавление, прозрачный режим и пространственное аудио.",
    price: [{ name: "White", ref: "char_white", price: 19990 }]
  },
  "item_tshirt": {
    ref: "item_tshirt",
    parent: "cat_men",
    name: "Футболка Базовая",
    article: "CL-TS-BASIC",
    description: "100% хлопок. Прямой крой. Не садится после стирки.",
    price: [
      { name: "S", ref: "char_s", price: 800 },
      { name: "M", ref: "char_m", price: 800 },
      { name: "L", ref: "char_l", price: 900 },
      { name: "XL", ref: "char_xl", price: 900 }
    ]
  },
  "item_jeans": {
    ref: "item_jeans",
    parent: "cat_men",
    name: "Джинсы Классика",
    article: "CL-JNS-CLASSIC",
    description: "Классические прямые джинсы. Деним средней плотности.",
    price: [
      { name: "30", ref: "char_30", price: 3500 },
      { name: "32", ref: "char_32", price: 3500 },
      { name: "34", ref: "char_34", price: 3500 }
    ]
  },
  "item_lamp": {
    ref: "item_lamp",
    parent: "cat_home",
    name: "Настольная лампа LED",
    article: "HOME-LAMP-LED",
    description: "3 режима яркости, сенсорное управление, работа от аккумулятора.",
    price: [
        { name: "Белая", ref: "char_white", price: 1200 },
        { name: "Черная", ref: "char_black", price: 1200 }
    ]
  },
  "item_chair": {
    ref: "item_chair",
    parent: "cat_home",
    name: "Стул офисный 'Комфорт'",
    article: "HOME-CHAIR-01",
    description: "Эргономичная спинка, сетчатый материал, регулировка высоты.",
    price: [{ name: "", ref: "", price: 5990 }]
  },
  "item_pencil": {
    ref: "item_pencil",
    parent: "cat_home",
    name: "Простой карандаш (Тест пустой хар-ки)",
    article: "PENCIL-001",
    description: "Обычный карандаш. Тест отображения без характеристики.",
    price: [{ name: "", ref: "", price: 15 }]
  }
};
