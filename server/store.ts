import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type {
  AuditLog,
  Category,
  Expense,
  Lead,
  NewsletterSubscriber,
  StaffUser,
  TourPackage,
  UserRole,
} from '../src/types.ts';

export const EXCHANGE_RATE_UZS = 12850;

interface StoredStaffUser extends StaffUser {
  passwordHash: string;
  salt: string;
}

export interface DatabaseState {
  categories: Category[];
  tours: TourPackage[];
  leads: Lead[];
  expenses: Expense[];
  staff: StoredStaffUser[];
  auditLogs: AuditLog[];
  subscribers: NewsletterSubscriber[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'yasintime-db.json');

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(hash, 'hex'));
}

function isoDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 86400_000);
  return d.toISOString();
}

function dateDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 86400_000);
  return d.toISOString().slice(0, 10);
}

function createInitialState(): DatabaseState {
  const categories: Category[] = [
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

  const tours: TourPackage[] = [
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
        {
          day: 3,
          title: {
            uz: 'Shaxsiy yaxta kruizi va Palm Jumeirah',
            ru: 'Приватный яхт-круиз вокруг Пальмы Джумейра',
            en: 'Private Yacht Charter & Palm Jumeirah',
            tj: 'Круизи хусусии яхта дар Палм Ҷумейра',
          },
          description: {
            uz: '3 soatlik shaxsiy yaxtada Dubay qirg‘oqlari bo‘ylab sayohat va kechki dam olish.',
            ru: 'Трехчасовой приватный чартер на яхте вдоль побережья Пальмы и Бурдж-аль-Араб.',
            en: 'Three-hour private yacht charter past Atlantis and Burj Al Arab with onboard hospitality.',
            tj: 'Сайри 3-соата бо яхтаи хусусӣ дар соҳили Палм Ҷумейра ва Бурҷ ал-Араб.',
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
            uz: 'Masjidun Nabaviy yonidagi Oberoi / Hilton 5★ mehmonxonasiga joylashish va ziyorat odoblari suhbati.',
            ru: 'Размещение в отеле 5★ у мечети Пророка и вводная встреча с наставником.',
            en: 'Check-in steps away from Al-Masjid an-Nabawi with orientation briefing.',
            tj: 'Ҷойгиршавӣ дар меҳмонхонаи 5★ дар назди Масҷиди Набавӣ.',
          },
        },
        {
          day: 4,
          title: {
            uz: 'Haramain tezyurar poyezdida Makkaga safar',
            ru: 'Переезд в Мекку на скоростном поезде Haramain',
            en: 'Haramain High-Speed Rail to Makkah',
            tj: 'Сафар ба Макка бо қатораи баландсуръати Ҳарамайн',
          },
          description: {
            uz: 'Biznes-klass vagonida qulay safar, Fairmont Clock Tower mehmonxonasiga joylashish va Umra amallarini ado etish.',
            ru: 'Комфортный переезд в бизнес-классе, заселение в Fairmont Clock Tower и совершение обряда Умры.',
            en: 'Business-class rail transfer, Fairmont Clock Tower check-in and guided Umrah rituals.',
            tj: 'Сафари роҳат дар бизнес-класс, ҷойгиршавӣ дар Fairmont Clock Tower ва адои Умра.',
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
      itinerary: [
        {
          day: 1,
          title: {
            uz: 'Male aeroporti va gidrosamolyot parvozi',
            ru: 'Прилет в Мале и перелет на гидросамолете',
            en: 'Malé Arrival & Seaplane Transfer',
            tj: 'Вуруд ба Мале ва парвоз бо гидросамолёт',
          },
          description: {
            uz: 'VIP zalda dam olish va 35 daqiqalik manzarali gidrosamolyot parvozi orqali kurortga yetib borish.',
            ru: 'Отдых в приватном лаунже и живописный 35-минутный перелет на гидросамолете до острова.',
            en: 'Private lounge welcome followed by a scenic 35-minute seaplane transfer to the atoll.',
            tj: 'Истироҳат дар толори VIP ва парвози 35-дақиқагӣ ба ҷазира.',
          },
        },
      ],
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
      itinerary: [
        {
          day: 1,
          title: {
            uz: 'Istanbulda kutib olish va Bosfor kechki ovqati',
            ru: 'Прибытие в Стамбул и ужин на Босфоре',
            en: 'Istanbul Arrival & Bosphorus Evening',
            tj: 'Вуруд ба Истанбул ва зиёфат дар Босфор',
          },
          description: {
            uz: 'Shaxsiy Mercedes Vito transferi va Bosfor sohilidagi saroy terrasida kechki ziyofat.',
            ru: 'Индивидуальный трансфер на Mercedes V-Class и ужин на террасе с видом на Босфор.',
            en: 'Chauffeured Mercedes V-Class transfer and waterfront terrace dinner overlooking the strait.',
            tj: 'Трансфери инфиродӣ ва зиёфати шом дар соҳили Босфор.',
          },
        },
      ],
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
      itinerary: [
        {
          day: 1,
          title: {
            uz: 'Viza tayyorgarligi va Syurixga parvoz',
            ru: 'Визовая поддержка и прилет в Цюрих',
            en: 'Schengen Clearance & Zurich Arrival',
            tj: 'Омодагии раводид ва парвоз ба Сюрих',
          },
          description: {
            uz: 'Hujjatlarni to‘liq rasmiylashtirish, biznes-klass parvoz va Sankt-Moritsga shaxsiy transfer.',
            ru: 'Полная подготовка визового досье, перелет и трансфер в альпийский курорт.',
            en: 'Priority visa dossier handling, executive flight and private alpine transfer.',
            tj: 'Омодасозии пурраи ҳуҷҷатҳо, парвоз ва интиқол ба курорти кӯҳӣ.',
          },
        },
      ],
      createdAt: isoDaysAgo(9),
    },
  ];

  const leads: Lead[] = [
    {
      id: 'lead-101',
      customerName: 'Sardorbek Alimov',
      phone: '+998 90 912 44 10',
      email: 's.alimov@uzcorp.uz',
      tourId: 'tour-dubai-royal',
      tourTitle: 'Dubay Royal Marina & Shaxsiy Yaxta',
      travelers: 2,
      preferredDate: dateDaysAgo(-18),
      message: 'Biznes-klass chiptalar va Address Beach dengiz manzarali xona kerak.',
      status: 'To‘lov qilindi',
      assignedManager: 'Malika Karimova',
      notes: 'Shartnoma #YT-408 imzolandi. 100% to‘lov qabul qilindi.',
      dealAmountUsd: 5700,
      source: 'booking',
      createdAt: isoDaysAgo(16),
      updatedAt: isoDaysAgo(12),
    },
    {
      id: 'lead-102',
      customerName: 'Dilshodbek Rahimov',
      phone: '+998 93 550 18 90',
      email: 'dilshod.r@mail.uz',
      tourId: 'tour-umrah-makkah',
      tourTitle: 'Umra Royal Haram — Makka & Madina VIP',
      travelers: 4,
      preferredDate: dateDaysAgo(-25),
      message: 'Ota-onam bilan 4 kishilik Haram manzarali xona uchun narx hisoblab bering.',
      status: 'To‘lov qilindi',
      assignedManager: 'YasinTime Director',
      notes: 'Viza hujjatlari topshirildi, to‘lov naqd va o‘tkazma orqali yakunlandi.',
      dealAmountUsd: 9600,
      source: 'booking',
      createdAt: isoDaysAgo(11),
      updatedAt: isoDaysAgo(6),
    },
    {
      id: 'lead-103',
      customerName: 'Madina Usmanova',
      phone: '+998 97 701 33 21',
      email: 'madina.u@gmail.com',
      tourId: 'tour-maldives-villa',
      tourTitle: 'Maldiv Orollari — Shaxsiy Suv Ustidagi Villa',
      travelers: 2,
      preferredDate: dateDaysAgo(-35),
      message: 'Asal oyi uchun Soneva Jani suv usti villasi narxi va transfer tafsilotlari.',
      status: 'Bron qilindi',
      assignedManager: 'Malika Karimova',
      notes: 'Avans $2,000 kutilmoqda, villa vaqtincha band qilindi.',
      dealAmountUsd: 8400,
      source: 'booking',
      createdAt: isoDaysAgo(5),
      updatedAt: isoDaysAgo(2),
    },
    {
      id: 'lead-104',
      customerName: 'Rustam Nurmatov',
      phone: '+998 99 840 77 12',
      email: 'r.nurmatov@invest.uz',
      tourId: 'tour-swiss-executive',
      tourTitle: 'Shveytsariya Alp Tog‘lari & Shengen VIP Konsyerj',
      travelers: 1,
      preferredDate: dateDaysAgo(-20),
      message: 'Syurixdagi forum uchun Shengen vizasi va mehmonxona konsyerj xizmati.',
      status: 'Aloqada',
      assignedManager: 'Malika Karimova',
      notes: 'Elchixona navbati tekshirilmoqda, pasport nusxasi olindi.',
      dealAmountUsd: 3900,
      source: 'consultation',
      createdAt: isoDaysAgo(3),
      updatedAt: isoDaysAgo(1),
    },
    {
      id: 'lead-105',
      customerName: 'Farrukhjon Mirzoev',
      phone: '+998 91 312 09 88',
      tourId: 'tour-istanbul-palace',
      tourTitle: 'Istanbul Bosfor Saroyi & Kappadokiya',
      travelers: 3,
      preferredDate: dateDaysAgo(-14),
      message: 'Oila uchun 6 kunlik paket va Kappadokiya ichki reyslari bilan.',
      status: 'Yangi',
      assignedManager: '',
      notes: '',
      dealAmountUsd: 4950,
      source: 'quick_inquiry',
      createdAt: isoDaysAgo(0),
      updatedAt: isoDaysAgo(0),
    },
    {
      id: 'lead-106',
      customerName: 'Kamola Azizova',
      phone: '+998 94 611 25 40',
      tourId: 'tour-dubai-royal',
      tourTitle: 'Dubay Royal Marina & Shaxsiy Yaxta',
      travelers: 2,
      preferredDate: dateDaysAgo(-10),
      message: 'Dekabr oxiriga mavjud o‘rinlar haqida ma’lumot.',
      status: 'To‘lov qilindi',
      assignedManager: 'YasinTime Director',
      notes: 'O‘tgan oydagi yakunlangan bron.',
      dealAmountUsd: 5400,
      source: 'booking',
      createdAt: isoDaysAgo(34),
      updatedAt: isoDaysAgo(32),
    },
  ];

  const expenses: Expense[] = [
    {
      id: 'exp-201',
      title: 'Uzbekistan Airways Charter Block (Dubai)',
      category: 'Flight',
      amountUsd: 2150,
      amountUzs: 2150 * EXCHANGE_RATE_UZS,
      date: dateDaysAgo(12),
      notes: 'Sardorbek Alimov VIP chipta to‘lovi',
      createdBy: 'aziz.finance@yasintime.uz',
      createdAt: isoDaysAgo(12),
    },
    {
      id: 'exp-202',
      title: 'Fairmont Makkah Hotel Allotment',
      category: 'Hotel',
      amountUsd: 4200,
      amountUzs: 4200 * EXCHANGE_RATE_UZS,
      date: dateDaysAgo(6),
      notes: '4 kishilik Haram-view xonalar to‘lovi',
      createdBy: 'ooo.yasintime@gmail.com',
      createdAt: isoDaysAgo(6),
    },
    {
      id: 'exp-203',
      title: 'Instagram & Meta Premium Campaign',
      category: 'Marketing',
      amountUsd: 650,
      amountUzs: 650 * EXCHANGE_RATE_UZS,
      date: dateDaysAgo(3),
      notes: 'Qishki VIP Dubay va Umra reklamasi',
      createdBy: 'ooo.yasintime@gmail.com',
      createdAt: isoDaysAgo(3),
    },
    {
      id: 'exp-204',
      title: 'Toshkent Bosh Ofis Ijarasi va Kommunal',
      category: 'Office',
      amountUsd: 1200,
      amountUzs: 1200 * EXCHANGE_RATE_UZS,
      date: dateDaysAgo(1),
      notes: 'Oylik ofis xarajatlari',
      createdBy: 'aziz.finance@yasintime.uz',
      createdAt: isoDaysAgo(1),
    },
    {
      id: 'exp-205',
      title: 'Saudiya Umra Viza & Sug‘urta Paketi',
      category: 'Visa',
      amountUsd: 480,
      amountUzs: 480 * EXCHANGE_RATE_UZS,
      date: dateDaysAgo(0),
      notes: 'Tezkor rasmiylashtirish boji',
      createdBy: 'aziz.finance@yasintime.uz',
      createdAt: isoDaysAgo(0),
    },
    {
      id: 'exp-206',
      title: 'O‘tgan oylik mehmonxona va aviabilet xarajatlari',
      category: 'Hotel',
      amountUsd: 2900,
      amountUzs: 2900 * EXCHANGE_RATE_UZS,
      date: dateDaysAgo(32),
      notes: 'Kamola Azizova safari xarajatlari',
      createdBy: 'aziz.finance@yasintime.uz',
      createdAt: isoDaysAgo(32),
    },
  ];

  const adminCreds = hashPassword('yasin4545');
  const managerCreds = hashPassword('manager2026');
  const accountantCreds = hashPassword('finance2026');

  const staff: StoredStaffUser[] = [
    {
      id: 'staff-1',
      name: 'YasinTime Director',
      email: 'ooo.yasintime@gmail.com',
      role: 'Admin',
      active: true,
      createdAt: isoDaysAgo(60),
      passwordHash: adminCreds.hash,
      salt: adminCreds.salt,
    },
    {
      id: 'staff-2',
      name: 'Malika Karimova',
      email: 'malika.manager@yasintime.uz',
      role: 'Manager',
      active: true,
      createdAt: isoDaysAgo(45),
      passwordHash: managerCreds.hash,
      salt: managerCreds.salt,
    },
    {
      id: 'staff-3',
      name: 'Azizbek Tursunov',
      email: 'aziz.finance@yasintime.uz',
      role: 'Accountant',
      active: true,
      createdAt: isoDaysAgo(45),
      passwordHash: accountantCreds.hash,
      salt: accountantCreds.salt,
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud-1',
      actorEmail: 'ooo.yasintime@gmail.com',
      actorRole: 'Admin',
      action: 'Updated Lead Status',
      targetType: 'Lead',
      details: 'Dilshodbek Rahimov status set to To‘lov qilindi ($9,600)',
      timestamp: isoDaysAgo(6),
    },
    {
      id: 'aud-2',
      actorEmail: 'aziz.finance@yasintime.uz',
      actorRole: 'Accountant',
      action: 'Logged Expense',
      targetType: 'Expense',
      details: 'Toshkent Bosh Ofis Ijarasi — $1,200',
      timestamp: isoDaysAgo(1),
    },
    {
      id: 'aud-3',
      actorEmail: 'malika.manager@yasintime.uz',
      actorRole: 'Manager',
      action: 'Assigned Lead',
      targetType: 'Lead',
      details: 'Rustam Nurmatov assigned to Malika Karimova',
      timestamp: isoDaysAgo(1),
    },
  ];

  const subscribers: NewsletterSubscriber[] = [
    {
      id: 'sub-1',
      contact: 'sarvar.t@mail.uz',
      language: 'uz',
      createdAt: isoDaysAgo(4),
    },
  ];

  return {
    categories,
    tours,
    leads,
    expenses,
    staff,
    auditLogs,
    subscribers,
  };
}

class PersistentStore {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseState;
        // Ensure requested admin user always exists with the requested login
        const adminExists = parsed.staff?.some(
          (u) => u.email.toLowerCase() === 'ooo.yasintime@gmail.com'
        );
        if (!adminExists) {
          const initial = createInitialState();
          parsed.staff = [...initial.staff, ...(parsed.staff || [])];
          this.saveState(parsed);
        }
        return parsed;
      }
    } catch (err) {
      console.error('Failed to read database file, reinitializing:', err);
    }
    const initial = createInitialState();
    this.saveState(initial);
    return initial;
  }

  private saveState(state: DatabaseState): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database state:', err);
    }
  }

  public commit(): void {
    this.saveState(this.state);
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public getPublicStaff(): StaffUser[] {
    return this.state.staff.map(({ passwordHash: _ph, salt: _s, ...rest }) => rest);
  }

  public authenticateStaff(email: string, password: string): StaffUser | null {
    const normalized = email.trim().toLowerCase();
    const user = this.state.staff.find((u) => u.email.toLowerCase() === normalized && u.active);
    if (!user) return null;
    if (!verifyPassword(password, user.passwordHash, user.salt)) return null;
    const { passwordHash: _ph, salt: _s, ...publicUser } = user;
    return publicUser;
  }

  public addStaff(input: { name: string; email: string; password: string; role: UserRole }): StaffUser {
    const normalized = input.email.trim().toLowerCase();
    if (this.state.staff.some((s) => s.email.toLowerCase() === normalized)) {
      throw new Error('Bu email manzili allaqachon ro‘yxatdan o‘tgan');
    }
    const { hash, salt } = hashPassword(input.password);
    const created: StoredStaffUser = {
      id: `staff-${Date.now()}`,
      name: input.name.trim(),
      email: normalized,
      role: input.role,
      active: true,
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt,
    };
    this.state.staff.push(created);
    this.commit();
    const { passwordHash: _ph, salt: _s, ...publicUser } = created;
    return publicUser;
  }

  public logAudit(
    actorEmail: string,
    actorRole: UserRole | 'Public',
    action: string,
    targetType: AuditLog['targetType'],
    details: string
  ): void {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actorEmail,
      actorRole,
      action,
      targetType,
      details,
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(entry);
    if (this.state.auditLogs.length > 500) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 500);
    }
    this.commit();
  }
}

export const store = new PersistentStore();
