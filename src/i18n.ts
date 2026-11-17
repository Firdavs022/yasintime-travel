import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Language } from './types';

const STORAGE_KEY = 'yasintime_lang';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'uz';
  const fromStorage = window.localStorage.getItem(STORAGE_KEY);
  const fromCookie = readCookie(STORAGE_KEY);
  const candidate = fromStorage || fromCookie || 'uz';
  if (candidate === 'uz' || candidate === 'ru' || candidate === 'en' || candidate === 'tj') {
    return candidate;
  }
  return 'uz';
}

export function persistLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }
  if (typeof document !== 'undefined') {
    document.cookie = `${STORAGE_KEY}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

const resources = {
  uz: {
    translation: {
      nav: {
        directions: 'Yo‘nalishlar',
        tours: 'Sayohatlar',
        guides: 'Qo‘llanmalar',
        contact: 'Aloqa',
        cta: 'Konsultatsiya',
      },
      hero: {
        kicker: 'Toshkent · Dubay · Makka · Jeneva',
        title: 'Dunyo bo‘ylab benuqson va xotirjam sayohat san’ati',
        subtitle:
          'YasinTime Travel — shaxsiy VIP marshrutlar, Haram yonidagi Umra ziyorati, oilaviy kurortlar va korporativ viza konsyerj xizmatlari.',
        primaryCta: 'Paketni tanlash',
        discover: 'Kashf etish',
      },
      catalog: {
        eyebrow: 'Tanlangan kolleksiya',
        title: 'Sayohat paketlari katalogi',
        allCategories: 'Barcha yo‘nalishlar',
        allDestinations: 'Barcha manzillar',
        allDurations: 'Har qanday muddat',
        shortTrip: '1–5 kun',
        mediumTrip: '6–8 kun',
        longTrip: '9+ kun',
        maxPrice: 'Maksimal narx',
        anyPrice: 'Cheklovsiz',
        days: 'Kun',
        nights: 'Tun',
        perGuest: '1 mehmon uchun',
        viewDetails: 'Batafsil',
        empty: 'Tanlangan mezonlar bo‘yicha sayohatlar topilmadi.',
        resetFilters: 'Filtrlarni tozalash',
        flight: 'Aviachipta',
        transfer: 'VIP Transfer',
        insurance: 'Sug‘urta',
      },
      detail: {
        back: 'Katalogga qaytish',
        hotelInfo: 'Mehmonxona darajasi',
        included: 'Paket tarkibi',
        itineraryTitle: 'Kunlik sayohat dasturi',
        dayLabel: '-kun',
        bookTitle: 'Shaxsiy bron qilish',
        bookSubtitle: 'Menejerimiz 15 daqiqa ichida siz bilan bog‘lanadi',
        travelers: 'Sayohatchilar soni',
        totalEstimate: 'Taxminiy jami qiymat',
        fullName: 'Ism va familiyangiz',
        phone: 'Telefon raqamingiz',
        email: 'Email (ixtiyoriy)',
        preferredDate: 'Rejalashtirilgan sana',
        notes: 'Qo‘shimcha istaklar',
        submitBooking: 'So‘rov yuborish',
        submitting: 'Yuborilmoqda...',
        successTitle: 'So‘rovingiz muvaffaqiyatli qabul qilindi',
        successDesc:
          'Shaxsiy travel-konsyerjimiz tez orada +998 50 876 77 22 raqami orqali siz bilan bog‘lanadi.',
      },
      guides: {
        eyebrow: 'Sayohat kutubxonasi va yordam markazi',
        title: 'Foydali qo‘llanmalar va viza qoidalari',
        subtitle:
          'Safar oldidan bilishingiz zarur bo‘lgan viza talablari, eng sara yo‘nalishlar va shaxsiy tavsiyalar.',
        readGuide: 'Qo‘llanmani o‘qish',
        closeGuide: 'Yopish',
        items: {
          useful: 'Foydali qo‘llanmalar',
          visa: 'Viza olish qoidalari',
          destinations: 'Eng yaxshi yo‘nalishlar',
          offers: 'Maxsus takliflar',
          about: 'Biz haqimizda',
        },
      },
      consultation: {
        eyebrow: 'Shaxsiy konsyerj xizmati',
        title: 'Individual marshrut buyurtma qiling',
        subtitle:
          'Qayerga borishni rejalashtirayotganingizni yozib qoldiring — mutaxassislarimiz sizning didingiz va jadvalingizga mos tayyor taklif tayyorlaydi.',
        officeTitle: 'Bosh ofis va aloqa markazi',
        workingHours: 'Ish vaqti: Du–Sha, 09:00 – 20:00',
        officeAddress: 'Toshkent sh., Amir Temur shoh ko‘chasi, 107B',
        sendRequest: 'Konsultatsiya olish',
      },
      footer: {
        newsletterTitle: 'Yopiq takliflarga obuna bo‘ling',
        newsletterDesc: 'Eng sara mavsumiy turlar va VIP chegirmalar haqida birinchi bo‘lib xabardor bo‘ling.',
        newsletterPlaceholder: 'Email yoki telefon raqamingiz',
        subscribe: 'Obuna bo‘lish',
        subscribed: 'Siz muvaffaqiyatli obuna bo‘ldingiz.',
        guidesCol: 'Qo‘llanmalar',
        contactsCol: 'To‘g‘ridan-to‘g‘ri aloqa',
        adminLink: 'Xodimlar CRM portali',
        copyright: 'YasinTime Travel © 2026. Barcha huquqlar himoyalangan.',
      },
      admin: {
        portalTitle: 'YasinTime Travel CRM',
        signInTitle: 'Xodimlar tizimiga kirish',
        signInSubtitle: 'Boshqaruv paneliga kirish uchun xizmat hisobingizni kiriting',
        emailLabel: 'Elektron pochta',
        passwordLabel: 'Parol',
        signInBtn: 'Tizimga kirish',
        backToSite: 'Asosiy saytga qaytish',
        logout: 'Chiqish',
        tabs: {
          leads: 'Arizalar (CRM)',
          tours: 'Turlar va Kategoriyalar',
          finance: 'Moliya va Xarajatlar',
          audit: 'Audit va Xodimlar',
        },
      },
    },
  },
  ru: {
    translation: {
      nav: {
        directions: 'Направления',
        tours: 'Туры',
        guides: 'Путеводители',
        contact: 'Контакты',
        cta: 'Консультация',
      },
      hero: {
        kicker: 'Ташкент · Дубай · Мекка · Женева',
        title: 'Искусство безупречных и спокойных путешествий по миру',
        subtitle:
          'YasinTime Travel — индивидуальные VIP-маршруты, паломничество Умра у Харама, семейные курорты и деловой визовый консьерж.',
        primaryCta: 'Выбрать пакет',
        discover: 'Открыть',
      },
      catalog: {
        eyebrow: 'Избранная коллекция',
        title: 'Каталог туров и пакетов',
        allCategories: 'Все направления',
        allDestinations: 'Все страны',
        allDurations: 'Любая длительность',
        shortTrip: '1–5 дней',
        mediumTrip: '6–8 дней',
        longTrip: '9+ дней',
        maxPrice: 'Макс. бюджет',
        anyPrice: 'Без лимита',
        days: 'Дней',
        nights: 'Ночей',
        perGuest: 'за 1 гостя',
        viewDetails: 'Подробнее',
        empty: 'По выбранным фильтрам туры не найдены.',
        resetFilters: 'Сбросить фильтры',
        flight: 'Авиаперелет',
        transfer: 'VIP Трансфер',
        insurance: 'Страховка',
      },
      detail: {
        back: 'Вернуться в каталог',
        hotelInfo: 'Категория отеля',
        included: 'Включено в пакет',
        itineraryTitle: 'Программа по дням',
        dayLabel: '-й день',
        bookTitle: 'Индивидуальное бронирование',
        bookSubtitle: 'Персональный менеджер свяжется с вами в течение 15 минут',
        travelers: 'Количество гостей',
        totalEstimate: 'Ориентировочная стоимость',
        fullName: 'Имя и фамилия',
        phone: 'Номер телефона',
        email: 'Email (необязательно)',
        preferredDate: 'Желаемая дата вылета',
        notes: 'Особые пожелания',
        submitBooking: 'Отправить заявку',
        submitting: 'Отправка...',
        successTitle: 'Заявка успешно принята',
        successDesc:
          'Ваш персональный консьерж скоро свяжется с вами по номеру +998 50 876 77 22.',
      },
      guides: {
        eyebrow: 'Библиотека путешественника',
        title: 'Полезные гайды и визовые правила',
        subtitle:
          'Актуальные визовые требования, лучшие сезонные направления и экспертные рекомендации перед поездкой.',
        readGuide: 'Читать гид',
        closeGuide: 'Закрыть',
        items: {
          useful: 'Полезные руководства',
          visa: 'Правила получения виз',
          destinations: 'Лучшие направления',
          offers: 'Специальные предложения',
          about: 'О компании',
        },
      },
      consultation: {
        eyebrow: 'Персональный консьерж',
        title: 'Закажите индивидуальный маршрут',
        subtitle:
          'Укажите направление и даты — наши специалисты подготовят персональное предложение под ваш график.',
        officeTitle: 'Главный офис и поддержка',
        workingHours: 'Часы работы: Пн–Сб, 09:00 – 20:00',
        officeAddress: 'г. Ташкент, проспект Амира Темура, 107Б',
        sendRequest: 'Получить консультацию',
      },
      footer: {
        newsletterTitle: 'Закрытые предложения для подписчиков',
        newsletterDesc: 'Узнавайте первыми о сезонных маршрутах и привилегиях VIP-бронирования.',
        newsletterPlaceholder: 'Email или номер телефона',
        subscribe: 'Подписаться',
        subscribed: 'Вы успешно подписались.',
        guidesCol: 'Путеводители',
        contactsCol: 'Прямые контакты',
        adminLink: 'CRM-портал сотрудников',
        copyright: 'YasinTime Travel © 2026. Все права защищены.',
      },
      admin: {
        portalTitle: 'YasinTime Travel CRM',
        signInTitle: 'Вход для сотрудников',
        signInSubtitle: 'Введите корпоративные данные для доступа к панели управления',
        emailLabel: 'Электронная почта',
        passwordLabel: 'Пароль',
        signInBtn: 'Войти в систему',
        backToSite: 'На основной сайт',
        logout: 'Выйти',
        tabs: {
          leads: 'Лиды (CRM)',
          tours: 'Туры и Категории',
          finance: 'Финансы и Расходы',
          audit: 'Аудит и Команда',
        },
      },
    },
  },
  en: {
    translation: {
      nav: {
        directions: 'Directions',
        tours: 'Tours',
        guides: 'Guides',
        contact: 'Contact',
        cta: 'Consultation',
      },
      hero: {
        kicker: 'Tashkent · Dubai · Makkah · Geneva',
        title: 'The art of effortless, private global travel',
        subtitle:
          'YasinTime Travel curates bespoke VIP itineraries, Haram-front Umrah pilgrimages, family retreats, and executive visa concierge.',
        primaryCta: 'Explore Packages',
        discover: 'Discover',
      },
      catalog: {
        eyebrow: 'Curated Collection',
        title: 'Signature Tour Packages',
        allCategories: 'All Directions',
        allDestinations: 'All Destinations',
        allDurations: 'Any Duration',
        shortTrip: '1–5 Days',
        mediumTrip: '6–8 Days',
        longTrip: '9+ Days',
        maxPrice: 'Max Budget',
        anyPrice: 'No Limit',
        days: 'Days',
        nights: 'Nights',
        perGuest: 'per guest',
        viewDetails: 'View Details',
        empty: 'No tours match your selected criteria.',
        resetFilters: 'Reset Filters',
        flight: 'Flights',
        transfer: 'VIP Transfer',
        insurance: 'Insurance',
      },
      detail: {
        back: 'Back to Catalog',
        hotelInfo: 'Accommodation Standard',
        included: 'Package Inclusions',
        itineraryTitle: 'Day-by-Day Itinerary',
        dayLabel: 'Day ',
        bookTitle: 'Private Reservation Request',
        bookSubtitle: 'Your dedicated travel advisor responds within 15 minutes',
        travelers: 'Number of Travelers',
        totalEstimate: 'Estimated Total',
        fullName: 'Full Name',
        phone: 'Phone Number',
        email: 'Email (optional)',
        preferredDate: 'Preferred Departure Date',
        notes: 'Special Requests',
        submitBooking: 'Submit Request',
        submitting: 'Submitting...',
        successTitle: 'Request Confirmed',
        successDesc:
          'Our concierge team has received your inquiry and will reach out via +998 50 876 77 22.',
      },
      guides: {
        eyebrow: 'Travel Library & Support Center',
        title: 'Essential Guides & Visa Intelligence',
        subtitle:
          'Structured entry rules, seasonal destination advisories, and insider guidance before departure.',
        readGuide: 'Read Guide',
        closeGuide: 'Close',
        items: {
          useful: 'Useful Travel Guides',
          visa: 'Visa Entry Rules',
          destinations: 'Top Destinations',
          offers: 'Special Offers',
          about: 'About Us',
        },
      },
      consultation: {
        eyebrow: 'Private Concierge Desk',
        title: 'Commission a Bespoke Itinerary',
        subtitle:
          'Share your destination and dates—our senior advisors will prepare a tailored proposal around your schedule.',
        officeTitle: 'Head Office & Hotline',
        workingHours: 'Working Hours: Mon–Sat, 09:00 – 20:00',
        officeAddress: '107B Amir Temur Avenue, Tashkent',
        sendRequest: 'Request Consultation',
      },
      footer: {
        newsletterTitle: 'Private Travel Briefings',
        newsletterDesc: 'Receive seasonal routes and priority VIP availability updates.',
        newsletterPlaceholder: 'Email or phone number',
        subscribe: 'Subscribe',
        subscribed: 'Subscribed successfully.',
        guidesCol: 'Guides',
        contactsCol: 'Direct Contacts',
        adminLink: 'Staff CRM Portal',
        copyright: 'YasinTime Travel © 2026. All rights reserved.',
      },
      admin: {
        portalTitle: 'YasinTime Travel CRM',
        signInTitle: 'Staff Portal Sign In',
        signInSubtitle: 'Authenticate to access real-time leads, CMS, and financials',
        emailLabel: 'Email Address',
        passwordLabel: 'Password',
        signInBtn: 'Sign In',
        backToSite: 'Return to Website',
        logout: 'Sign Out',
        tabs: {
          leads: 'Leads CRM',
          tours: 'Tours & Categories',
          finance: 'Financials & Expenses',
          audit: 'Audit & Staff',
        },
      },
    },
  },
  tj: {
    translation: {
      nav: {
        directions: 'Самтҳо',
        tours: 'Сафарҳо',
        guides: 'Роҳнамоҳо',
        contact: 'Тамос',
        cta: 'Машварат',
      },
      hero: {
        kicker: 'Тошканд · Дубай · Макка · Женева',
        title: 'Санъати сафарҳои бенуқсон ва ором дар саросари ҷаҳон',
        subtitle:
          'YasinTime Travel — хатсайрҳои инфиродии VIP, зиёрати Умра дар назди Ҳарам, истироҳатгоҳҳои оилавӣ ва консержи раводид.',
        primaryCta: 'Интихоби сафар',
        discover: 'Кашф кардан',
      },
      catalog: {
        eyebrow: 'Маҷмӯаи интихобшуда',
        title: 'Феҳристи бастаҳои сафар',
        allCategories: 'Ҳамаи самтҳо',
        allDestinations: 'Ҳамаи кишварҳо',
        allDurations: 'Ҳар гуна муддат',
        shortTrip: '1–5 рӯз',
        mediumTrip: '6–8 рӯз',
        longTrip: '9+ рӯз',
        maxPrice: 'Буҷаи ниҳоӣ',
        anyPrice: 'Бе маҳдудият',
        days: 'Рӯз',
        nights: 'Шаб',
        perGuest: 'барои 1 меҳмон',
        viewDetails: 'Муфассал',
        empty: 'Мувофиқи интихоби шумо сафар ёфт нашуд.',
        resetFilters: 'Тоза кардани филтрҳо',
        flight: 'Чиптаи ҳавоӣ',
        transfer: 'Трансфери VIP',
        insurance: 'Суғурта',
      },
      detail: {
        back: 'Бозгашт ба феҳрист',
        hotelInfo: 'Сатҳи меҳмонхона',
        included: 'Ба баста дохил мешавад',
        itineraryTitle: 'Барномаи рӯз ба рӯз',
        dayLabel: '-рӯз',
        bookTitle: 'Дархости бронкунии инфиродӣ',
        bookSubtitle: 'Менеҷери мо дар давоми 15 дақиқа бо шумо тамос мегирад',
        travelers: 'Шумораи сайёҳон',
        totalEstimate: 'Арзиши тахминӣ',
        fullName: 'Ном ва насаб',
        phone: 'Рақами телефон',
        email: 'Email (ихтиёрӣ)',
        preferredDate: 'Санаи парвоз',
        notes: 'Хоҳишҳои иловагӣ',
        submitBooking: 'Фиристодани дархост',
        submitting: 'Фиристода мешавад...',
        successTitle: 'Дархости шумо бо муваффақият қабул шуд',
        successDesc:
          'Консержи инфиродии мо ба зудӣ тавассути рақами +998 50 876 77 22 бо шумо тамос мегирад.',
      },
      guides: {
        eyebrow: 'Китобхонаи сайёҳ ва маркази кӯмак',
        title: 'Роҳнамоҳои муфид ва қоидаҳои раводид',
        subtitle:
          'Талаботи раводид, беҳтарин самтҳои мавсимӣ ва тавсияҳои коршиносон пеш аз сафар.',
        readGuide: 'Хондани роҳнамо',
        closeGuide: 'Пӯшидан',
        items: {
          useful: 'Роҳнамоҳои муфид',
          visa: 'Қоидаҳои гирифтани раводид',
          destinations: 'Беҳтарин самтҳо',
          offers: 'Пешниҳодҳои махсус',
          about: 'Дар бораи мо',
        },
      },
      consultation: {
        eyebrow: 'Хизмати консержи инфиродӣ',
        title: 'Хатсайри инфиродӣ фармоиш диҳед',
        subtitle:
          'Самт ва санаи сафарро нависед — мутахассисони мо барои шумо пешниҳоди махсус омода мекунанд.',
        officeTitle: 'Идораи марказӣ ва маркази тамос',
        workingHours: 'Вақти корӣ: Дш–Шн, 09:00 – 20:00',
        officeAddress: 'ш. Тошканд, хиёбони Амир Темур, 107Б',
        sendRequest: 'Гирифтани машварат',
      },
      footer: {
        newsletterTitle: 'Ба пешниҳодҳои махсус обуна шавед',
        newsletterDesc: 'Аз хатсайрҳои нави мавсимӣ ва тахфифҳои VIP аввалин шуда хабардор шавед.',
        newsletterPlaceholder: 'Email ё рақами телефон',
        subscribe: 'Обуна шудан',
        subscribed: 'Шумо бо муваффақият обуна шудед.',
        guidesCol: 'Роҳнамоҳо',
        contactsCol: 'Тамоси мустақим',
        adminLink: 'Портали CRM-и кормандон',
        copyright: 'YasinTime Travel © 2026. Ҳамаи ҳуқуқҳо маҳфузанд.',
      },
      admin: {
        portalTitle: 'YasinTime Travel CRM',
        signInTitle: 'Вуруд ба низоми кормандон',
        signInSubtitle: 'Барои дастрасӣ ба панели идоракунӣ маълумотро ворид кунед',
        emailLabel: 'Почтаи электронӣ',
        passwordLabel: 'Рамз',
        signInBtn: 'Ворид шудан',
        backToSite: 'Бозгашт ба сомонаи асосӣ',
        logout: 'Баромад',
        tabs: {
          leads: 'Дархостҳо (CRM)',
          tours: 'Сафарҳо ва Гурӯҳҳо',
          finance: 'Молия ва Хароҷот',
          audit: 'Аудит ва Кормандон',
        },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'uz',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
