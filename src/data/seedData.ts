import type {
  AuditLog,
  Category,
  Expense,
  Lead,
  NewsletterSubscriber,
  StaffUser,
  TourPackage,
} from '../types';

export const EXCHANGE_RATE_UZS = 12850;

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86400_000).toISOString();
}

function dateDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
}

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-vip',
    slug: 'vip-tours',
    name: {
      uz: 'Eksklyuziv VIP Turlar',
      ru: 'Эксклюзивные VIP-туры',
      en: 'Exclusive VIP Tours',
      tj: 'Сафарҳои истисноии VIP',
    },
    subtitle: {
      uz: 'Shaxsiy yaxta, biznes-klass parvoz va 5★ rezidensiyalar',
      ru: 'Частные яхты, перелеты бизнес-классом и резиденции 5★',
      en: 'Private yachts, business-class flights and 5★ residences',
      tj: 'Яхтаҳои хусусӣ, парвозҳои бизнес-класс ва қароргоҳҳои 5★',
    },
    order: 1,
  },
  {
    id: 'cat-family',
    slug: 'family-holidays',
    name: {
      uz: 'Oilaviy Dam Olish',
      ru: 'Семейный отдых',
      en: 'Family Holidays',
      tj: 'Истироҳати оилавӣ',
    },
    subtitle: {
      uz: 'Oila a’zolari uchun xavfsiz, qulay va unutilmas kurortlar',
      ru: 'Безопасные, комфортные и незабываемые курорты для всей семьи',
      en: 'Curated, comfortable and serene resorts for the entire family',
      tj: 'Курортҳои бехатар, бароҳат ва фаромӯшнашаванда барои оила',
    },
    order: 2,
  },
  {
    id: 'cat-umrah',
    slug: 'umrah-ziyorat',
    name: {
      uz: 'Umra & Ziyorat VIP',
      ru: 'Умра и Зиёрат VIP',
      en: 'Umrah & Ziyorat VIP',
      tj: 'Умра ва Зиёрат VIP',
    },
    subtitle: {
      uz: 'Haramga birinchi qator 5★ mehmonxonalar va shaxsiy gid hamrohligi',
      ru: 'Отели 5★ на первой линии у Харама и персональное сопровождение',
      en: 'Haram-front 5★ hospitality with dedicated spiritual & logistics guides',
      tj: 'Меҳмонхонаҳои 5★ дар назди Ҳарам ва роҳбаладии инфиродӣ',
    },
    order: 3,
  },
  {
    id: 'cat-business',
    slug: 'business-visa',
    name: {
      uz: 'Biznes & Visa Konsyerj',
      ru: 'Бизнес и Виза Консьерж',
      en: 'Business & Visa Concierge',
      tj: 'Бизнес ва Виза Консерж',
    },
    subtitle: {
      uz: 'Shengen, BAA, AQSh vizalari hamda korporativ safarlar menejmenti',
      ru: 'Оформление виз Шенген, ОАЭ, США и управление деловыми поездками',
      en: 'Schengen, UAE & global executive visas with corporate travel management',
      tj: 'Раводидҳои Шенген, АМА, ИМА ва ташкили сафарҳои корӣ',
    },
    order: 4,
  },
];

export const INITIAL_TOURS: TourPackage[] = [
  {
    id: 'tour-dubai-royal',
    categoryId: 'cat-vip',
    title: {
      uz: 'Dubay Royal Marina & Shaxsiy Yaxta',
      ru: 'Дубай Роял Марина и Частная Яхта',
      en: 'Dubai Royal Marina & Private Yacht',
      tj: 'Дубай Роял Марина ва Яхтаи Хусусӣ',
    },
    destination: {
      uz: 'Dubay, BAA',
      ru: 'Дубай, ОАЭ',
      en: 'Dubai, UAE',
      tj: 'Дубай, АМА',
    },
    countryCode: 'AE',
    priceUsd: 2850,
    priceUzs: 2850 * EXCHANGE_RATE_UZS,
    durationDays: 6,
    durationNights: 5,
    hotelName: 'Address Beach Resort JBR',
    hotelStars: 5,
    includesFlight: true,
    includesTransfer: true,
    includesInsurance: true,
    featured: true,
    active: true,
    photos: [
      '/src/assets/images/hero_luxury_dubai_skyline_1794901381860.jpg',
      '/src/assets/images/tour_maldives_private_villa_1794901381092.jpg',
    ],
    summary: {
      uz: 'Dubayning eng nufuzli qirg‘oq bo‘yidagi 5★ rezidensiyada yashash, shaxsiy Rolls-Royce transferi hamda quyosh botishida Dubay Marina bo‘ylab xususiy yaxta sayohati.',
      ru: 'Проживание в престижной резиденции 5★ на первой линии, персональный трансфер и приватный круиз на яхте вдоль гавани Dubai Marina на закате.',
      en: 'Stay in a premier waterfront 5★ residence with private executive transfers and a twilight private yacht charter along Dubai Marina.',
      tj: 'Истиқомат дар қароргоҳи 5★ дар соҳил, трансфери инфиродӣ ва сайри хусусӣ бо яхта дар Дубай Марина.',
    },
    itinerary: [
      {
        day: 1,
        title: {
          uz: 'Toshkentdan uchish va VIP kutib olish',
          ru: 'Вылет из Ташкента и VIP-встреча',
          en: 'Departure & Marhaba VIP Airport Arrival',
          tj: 'Парвоз аз Тошканд ва пешвозгирии VIP',
        },
        description: {
          uz: 'Aeroportda Fast Track xizmati, shaxsiy avtomobilda Address Beach Resort 5★ mehmonxonasiga joylashish.',
          ru: 'Ускоренное прохождение контроля в аэропорту, индивидуальный трансфер в Address Beach Resort 5★.',
          en: 'Fast-track Marhaba airport reception and private chauffeur transfer to Address Beach Resort 5★.',
          tj: 'Хизматрасонии Fast Track дар фурудгоҳ ва интиқоли хусусӣ ба меҳмонхонаи Address Beach Resort 5★.',
        },
      },
      {
        day: 2,
        title: {
          uz: 'Burj Khalifa Lounge va Dubai Mall Konsyerji',
          ru: 'Лаунж Бурдж-Халифа и шопинг-консьерж',
          en: 'Burj Khalifa Lounge & Personal Concierge',
          tj: 'Лаунжи Бурҷ Халифа ва консержи инфиродӣ',
        },
        description: {
          uz: '148-qavat At The Top Sky kuzatuv maydoni va shaxsiy restoran bandlovi.',
          ru: 'Посещение уровня 148 At The Top Sky и ужин в премиальном ресторане с видом на фонтаны.',
          en: 'Private access to Level 148 At The Top Sky followed by reserved fountain-front dining.',
          tj: 'Боздид аз ошёнаи 148 At The Top Sky ва зиёфати шом дар назди фаввораҳо.',
        },
      },
    ],
    createdAt: isoDaysAgo(25),
  },
  {
    id: 'tour-umrah-makkah',
    categoryId: 'cat-umrah',
    title: {
      uz: 'Umra Royal Haram — Makka & Madina VIP',
      ru: 'Умра Роял Харам — Мекка и Медина VIP',
      en: 'Umrah Royal Haram — Makkah & Madinah VIP',
      tj: 'Умра Роял Ҳарам — Макка ва Мадина VIP',
    },
    destination: {
      uz: 'Makka & Madina, Saudiya Arabistoni',
      ru: 'Мекка и Медина, Саудовская Аравия',
      en: 'Makkah & Madinah, Saudi Arabia',
      tj: 'Макка ва Мадина, Арабистони Саудӣ',
    },
    countryCode: 'SA',
    priceUsd: 2400,
    priceUzs: 2400 * EXCHANGE_RATE_UZS,
    durationDays: 10,
    durationNights: 9,
    hotelName: 'Fairmont Makkah Clock Royal Tower',
    hotelStars: 5,
    includesFlight: true,
    includesTransfer: true,
    includesInsurance: true,
    featured: true,
    active: true,
    photos: ['/src/assets/images/tour_umrah_vip_makkah_1794901382335.jpg'],
    summary: {
      uz: 'Masjidul Harom va Masjidun Nabaviyning bevosita yonidagi 5★ mehmonxonalar, Haramain tezyurar poyezdi, rasmiy Umra vizasi hamda tajribali ellikboshi xizmati.',
      ru: 'Отели 5★ в шаговой доступности от мечетей Харам и Набави, билеты на скоростной поезд Haramain, официальная виза и опытный духовный гид.',
      en: 'Direct Haram-front 5★ accommodation, Haramain high-speed rail transfers, official Umrah visa processing and dedicated scholar guidance.',
      tj: 'Меҳмонхонаҳои 5★ дар наздикии Ҳарам ва Масҷиди Набавӣ, қатораи баландсуръати Ҳарамайн ва раводиди расмӣ.',
    },
    itinerary: [
      {
        day: 1,
        title: {
          uz: 'Madinaga to‘g‘ridan-to‘g‘ri reys va joylashuv',
          ru: 'Прямой перелет в Медину и размещение',
          en: 'Direct Arrival in Madinah & Check-In',
          tj: 'Парвози мустақим ба Мадина ва ҷойгиршавӣ',
        },
        description: {
          uz: 'Masjidun Nabaviy yonidagi Oberoi / Hilton 5★ mehmonxonasiga joylashish.',
          ru: 'Размещение в отеле 5★ у мечети Пророка и вводная встреча с наставником.',
          en: 'Check-in steps away from Al-Masjid an-Nabawi with orientation briefing.',
          tj: 'Ҷойгиршавӣ дар меҳмонхонаи 5★ дар назди Масҷиди Набавӣ.',
        },
      },
    ],
    createdAt: isoDaysAgo(20),
  },
  {
    id: 'tour-maldives-villa',
    categoryId: 'cat-family',
    title: {
      uz: 'Maldiv Orollari — Shaxsiy Suv Ustidagi Villa',
      ru: 'Мальдивы — Приватная Вилла над Водой',
      en: 'Maldives — Private Overwater Pool Villa',
      tj: 'Малдив — Виллаи Хусусӣ рӯи об',
    },
    destination: {
      uz: 'Baa Atoll, Maldiv',
      ru: 'Баа Атолл, Мальдивы',
      en: 'Baa Atoll, Maldives',
      tj: 'Баа Атолл, Малдив',
    },
    countryCode: 'MV',
    priceUsd: 4200,
    priceUzs: 4200 * EXCHANGE_RATE_UZS,
    durationDays: 7,
    durationNights: 6,
    hotelName: 'Soneva Jani / Waldorf Astoria Ithaafushi',
    hotelStars: 5,
    includesFlight: true,
    includesTransfer: true,
    includesInsurance: true,
    featured: true,
    active: true,
    photos: ['/src/assets/images/tour_maldives_private_villa_1794901381092.jpg'],
    summary: {
      uz: 'Oilaviy xotirjamlik uchun shaxsiy basseynli suv usti villalari, gidrosamolyot transferi, bolalar klubi va all-inclusive gurme taomlari.',
      ru: 'Приватные водные виллы с бассейном для идеального семейного уединения, трансфер на гидросамолете и гурмэ-питание.',
      en: 'Secluded overwater family pool villas with private seaplane transfer, curated kids club and bespoke fine dining.',
      tj: 'Виллаҳои хусусӣ бо ҳавз дар рӯи об барои оилаҳо, трансфери гидросамолёт ва хӯрокҳои олӣ.',
    },
    itinerary: [],
    createdAt: isoDaysAgo(18),
  },
  {
    id: 'tour-istanbul-palace',
    categoryId: 'cat-family',
    title: {
      uz: 'Istanbul Bosfor Saroyi & Kappadokiya',
      ru: 'Дворцовый Босфор и Каппадокия',
      en: 'Istanbul Bosphorus Palace & Cappadocia',
      tj: 'Қасри Босфори Истанбул ва Кападокия',
    },
    destination: {
      uz: 'Istanbul & Kappadokiya, Turkiya',
      ru: 'Стамбул и Каппадокия, Турция',
      en: 'Istanbul & Cappadocia, Turkey',
      tj: 'Истанбул ва Кападокия, Туркия',
    },
    countryCode: 'TR',
    priceUsd: 1650,
    priceUzs: 1650 * EXCHANGE_RATE_UZS,
    durationDays: 6,
    durationNights: 5,
    hotelName: 'Çırağan Palace Kempinski Istanbul',
    hotelStars: 5,
    includesFlight: true,
    includesTransfer: true,
    includesInsurance: true,
    featured: false,
    active: true,
    photos: ['/src/assets/images/tour_istanbul_bosphorus_palace_1794901383251.jpg'],
    summary: {
      uz: 'Usmonli sultonlar saroyi — Çırağan Palace Kempinski’da yashash, Bosfor bo‘ylab xususiy kema sayohati va Kappadokiyada tonggi havo shari parvozi.',
      ru: 'Проживание во дворце османских султанов Çırağan Palace, приватная прогулка по Босфору и рассветный полет на шаре в Каппадокии.',
      en: 'Stay at the historic Ottoman Çırağan Palace on the Bosphorus paired with Cappadocia private cave-suite hospitality.',
      tj: 'Истиқомат дар қасри таърихии Çırağan Palace дар соҳили Босфор ва парвоз дар Кападокия.',
    },
    itinerary: [],
    createdAt: isoDaysAgo(14),
  },
  {
    id: 'tour-swiss-executive',
    categoryId: 'cat-business',
    title: {
      uz: 'Shveytsariya Alp Tog‘lari & Shengen VIP Konsyerj',
      ru: 'Швейцарские Альпы и Шенген VIP-Консьерж',
      en: 'Swiss Alps & Executive Schengen Concierge',
      tj: 'Кӯҳҳои Алпи Швейтсария ва Консержи Шенген',
    },
    destination: {
      uz: 'Syurix & Sankt-Morits, Shveytsariya',
      ru: 'Цюрих и Санкт-Мориц, Швейцария',
      en: 'Zurich & St. Moritz, Switzerland',
      tj: 'Сюрих ва Санкт-Моритс, Швейтсария',
    },
    countryCode: 'CH',
    priceUsd: 3900,
    priceUzs: 3900 * EXCHANGE_RATE_UZS,
    durationDays: 5,
    durationNights: 4,
    hotelName: "Badrutt's Palace Hotel St. Moritz",
    hotelStars: 5,
    includesFlight: true,
    includesTransfer: true,
    includesInsurance: true,
    featured: true,
    active: true,
    photos: ['/src/assets/images/tour_swiss_alps_retreat_1794901383317.jpg'],
    summary: {
      uz: 'Ishbilarmonlar uchun to‘liq Shengen viza ko‘magi, Syurix biznes uchrashuvlari logistikasi hamda Sankt-Moritsdagi 5★ Alp shaletida dam olish.',
      ru: 'Полное визовое сопровождение Шенген, деловая логистика в Цюрихе и уикенд в легендарном альпийском отеле Санкт-Морица.',
      en: 'End-to-end Schengen visa concierge, Zurich executive logistics and secluded alpine retreat at St. Moritz.',
      tj: 'Кӯмаки пурраи раводиди Шенген, логистикаи корӣ дар Сюрих ва истироҳат дар Алп.',
    },
    itinerary: [],
    createdAt: isoDaysAgo(9),
  },
];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_STAFF: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'YasinTime Director',
    email: 'ooo.yasintime@gmail.com',
    role: 'Admin',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_SUBSCRIBERS: NewsletterSubscriber[] = [];
