import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitPublicLead } from '../../services/api';
import type { Language } from '../../types';

export type GuideSlug = 'useful' | 'visa' | 'destinations' | 'offers' | 'about';

interface GuideArticle {
  slug: GuideSlug;
  titleKey: string;
  summary: Record<Language, string>;
  bullets: Record<Language, string[]>;
}

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'useful',
    titleKey: 'guides.items.useful',
    summary: {
      uz: 'Parvoz oldidan pasport muddati, bagaj me’yorlari, Fast Track va VIP zal xizmatlaridan foydalanish bo‘yicha amaliy tavsiyalar.',
      ru: 'Практические рекомендации перед вылетом: срок действия паспорта, нормы багажа, Fast Track и доступ в бизнес-залы.',
      en: 'Practical pre-departure guidance covering passport validity, luggage allowances, Fast Track clearance and private lounge access.',
      tj: 'Тавсияҳои амалӣ пеш аз парвоз: мӯҳлати шиноснома, меъёри бағоҷ, Fast Track ва толорҳои тиҷоратӣ.',
    },
    bullets: {
      uz: [
        'Xalqaro safarlarda xorijga chiqish pasportining amal qilish muddati kamida 6 oy bo‘lishi shart.',
        'Dubay va Istanbul aeroportlarida YasinTime VIP mijozlari uchun Fast Track va shaxsiy kutib olish taqdim etiladi.',
        'Tibbiy sug‘urta polisi har bir sayohat paketiga avtomatik kiritilgan.',
      ],
      ru: [
        'Срок действия загранпаспорта должен составлять не менее 6 месяцев с даты возвращения.',
        'Для VIP-клиентов YasinTime в аэропортах Дубая и Стамбула доступен ускоренный проход Fast Track.',
        'Международный страховой полис включен в каждый туристический пакет.',
      ],
      en: [
        'Passports must remain valid for at least 6 months beyond your scheduled return date.',
        'Fast Track airport escort is arranged for YasinTime VIP guests in Dubai and Istanbul.',
        'Comprehensive international travel medical coverage is included across all packages.',
      ],
      tj: [
        'Мӯҳлати эътибори шиносномаи хориҷӣ бояд на камтар аз 6 моҳ бошад.',
        'Барои муштариёни VIP дар фурудгоҳҳои Дубай ва Истанбул хизмати Fast Track фаъол аст.',
        'Суғуртаи тиббии байналмилалӣ ба ҳар як бастаи сафар дохил мешавад.',
      ],
    },
  },
  {
    slug: 'visa',
    titleKey: 'guides.items.visa',
    summary: {
      uz: 'O‘zbekiston fuqarolari uchun BAA, Saudiya Arabistoni (Umra), Turkiya va Shengen davlatlariga viza rasmiylashtirish tartibi.',
      ru: 'Актуальные правила оформления виз в ОАЭ, Саудовскую Аравию (Умра), Турцию и страны Шенгена.',
      en: 'Current visa entry rules for UAE, Saudi Arabia (Umrah), Turkey, and Schengen zone destinations.',
      tj: 'Қоидаҳои имрӯзаи гирифтани раводид барои АМА, Арабистони Саудӣ (Умра), Туркия ва минтақаи Шенген.',
    },
    bullets: {
      uz: [
        'BAA (Dubay): O‘zbekiston fuqarolari uchun 30 kunlik vizasiz rejim amal qiladi.',
        'Turkiya & Maldiv: 30 kungacha vizasiz kirish imkoniyati mavjud.',
        'Saudiya Arabistoni (Umra): Rasmiy elektron Umra vizasi 24–48 soat ichida YasinTime Travel tomonidan rasmiylashtiriladi.',
        'Shengen & AQSh: To‘liq anketa, elchixona navbati va hujjatlar konsyerj paketi.',
      ],
      ru: [
        'ОАЭ (Дубай): для граждан Узбекистана действует безвизовый режим до 30 дней.',
        'Турция и Мальдивы: безвизовый въезд до 30 дней по действующему загранпаспорту.',
        'Саудовская Аравия (Умра): официальная электронная виза оформляется нами за 24–48 часов.',
        'Шенген и США: полное сопровождение досье, запись в консульство и подготовка интервью.',
      ],
      en: [
        'UAE (Dubai): 30-day visa-free entry applies for Uzbekistan passport holders.',
        'Turkey & Maldives: Visa-free arrival for stays up to 30 days.',
        'Saudi Arabia (Umrah): Official e-Umrah visa processed by YasinTime within 24–48 hours.',
        'Schengen & USA: Full concierge dossier review, embassy scheduling and itinerary verification.',
      ],
      tj: [
        'АМА (Дубай): Барои шаҳрвандони Ӯзбекистон низоми бевиза то 30 рӯз амал мекунад.',
        'Туркия ва Малдив: Вуруди бевиза то 30 рӯз.',
        'Арабистони Саудӣ (Умра): Раводиди электронӣ дар 24–48 соат омода мегардад.',
        'Шенген ва ИМА: Омодасозии пурраи ҳуҷҷатҳо ва сабти навбат дар сафорат.',
      ],
    },
  },
  {
    slug: 'destinations',
    titleKey: 'guides.items.destinations',
    summary: {
      uz: 'Yilning har bir fasli uchun eng qulay ob-havo va premium servisga ega sara yo‘nalishlar kalendari.',
      ru: 'Календарь лучших направлений по сезонам с оптимальной погодой и премиальным сервисом.',
      en: 'Seasonal destination calendar highlighting ideal climate windows and peak 5-star hospitality.',
      tj: 'Тақвими беҳтарин самтҳо мувофиқи фаслҳои сол ва сатҳи олии хизматрасонӣ.',
    },
    bullets: {
      uz: [
        'Kuz – Qish (Oktabr–Mart): Dubay, Abu-Dabi, Maldiv orollari va Umra ziyorati uchun eng ideal mavsum.',
        'Bahor (Aprel–May): Istanbul, Kappadokiya va Italiya shahar bo‘ylab sayohatlari.',
        'Yoz (Iyun–Avgust): Shveytsariya Alp tog‘lari, Antaliya Premium villalari va Yevropa.',
      ],
      ru: [
        'Осень – Зима (Октябрь–Март): идеальный сезон для Дубая, Абу-Даби, Мальдив и Умры.',
        'Весна (Апрель–Май): Стамбул, Каппадокия и культурные маршруты Европы.',
        'Лето (Июнь–Август): Швейцарские Альпы, приватные виллы Анталии и Бодрума.',
      ],
      en: [
        'Autumn – Winter (Oct–Mar): Prime season for Dubai, Abu Dhabi, Maldives and Umrah.',
        'Spring (Apr–May): Istanbul, Cappadocia and European heritage capitals.',
        'Summer (Jun–Aug): Swiss Alps, Bodrum and Antalya private coastal villas.',
      ],
      tj: [
        'Тирамоҳ – Зимистон (Окт–Мар): Беҳтарин мавсим барои Дубай, Малдив ва Умра.',
        'Баҳор (Апр–Май): Истанбул, Кападокия ва шаҳрҳои таърихии Аврупо.',
        'Тобистон (Июн–Авг): Кӯҳҳои Алпи Швейтсария ва виллаҳои Бодрум.',
      ],
    },
  },
  {
    slug: 'offers',
    titleKey: 'guides.items.offers',
    summary: {
      uz: 'Erta bronlash imtiyozlari, oilaviy paketlar uchun bepul bolalar joylashuvi va biznes-klass yangilanishlari.',
      ru: 'Привилегии раннего бронирования, специальные условия для семей и апгрейды в бизнес-класс.',
      en: 'Early-booking allocations, complimentary family suite upgrades and corporate travel privileges.',
      tj: 'Имтиёзҳои бронкунии пешакӣ, шароити махсус барои оилаҳо ва имкониятҳои бизнес-класс.',
    },
    bullets: {
      uz: [
        'Safardan 45 kun oldin band qilingan VIP turlarda bepul aeroport Fast Track va transfer.',
        '4 va undan ortiq kishilik Umra oilaviy guruhlari uchun shaxsiy ellikboshi ajratiladi.',
        'Doimiy korporativ hamkorlar uchun yillik shartnoma asosida ustuvor tariflar.',
      ],
      ru: [
        'При бронировании VIP-тура за 45 дней — бесплатный Fast Track и индивидуальный трансфер.',
        'Для семейных групп от 4 человек на Умру предоставляется персональный гид.',
        'Специальные корпоративные тарифы для компаний и делегаций.',
      ],
      en: [
        'Complimentary Fast Track & private transfer on VIP bookings confirmed 45+ days ahead.',
        'Dedicated private guide assigned for Umrah family groups of 4 or more guests.',
        'Preferential corporate retainers for recurring executive delegations.',
      ],
      tj: [
        'Ҳангоми бронкунии 45 рӯз пеш — Fast Track ва трансфери ройгон.',
        'Барои гурӯҳҳои оилавии Умра аз 4 нафар роҳбалади инфиродӣ ҷудо мешавад.',
        'Тарифҳои махсуси корпоративӣ барои ширкатҳо.',
      ],
    },
  },
  {
    slug: 'about',
    titleKey: 'guides.items.about',
    summary: {
      uz: 'YasinTime Travel — Toshkentda tashkil etilgan, shaxsiy yondashuv va halol shaffoflikka asoslangan premium sayohat agentligi.',
      ru: 'YasinTime Travel — премиальное туристическое агентство из Ташкента, объединяющее высокий сервис и прозрачность.',
      en: 'YasinTime Travel is a Tashkent-based luxury travel house built on discretion, precision logistics and transparent pricing.',
      tj: 'YasinTime Travel — агентии сайёҳии премиум дар Тошканд бо хизматрасонии олӣ ва шаффофияти комил.',
    },
    bullets: {
      uz: [
        'Har bir mijoz bilan shaffof shartnoma va 24/7 konsyerj qo‘llab-quvvatlashi.',
        'Faqat sinovdan o‘tgan 5★ mehmonxonalar va ishonchli aviakompaniyalar bilan hamkorlik.',
        'To‘g‘ridan-to‘g‘ri aloqa: +998 50 876 77 22 · ooo.yasintime@gmail.com',
      ],
      ru: [
        'Официальный договор с каждым клиентом и круглосуточная поддержка 24/7.',
        'Прямые контракты с проверенными отелями 5★ и ведущими авиакомпаниями.',
        'Прямая связь: +998 50 876 77 22 · ooo.yasintime@gmail.com',
      ],
      en: [
        'Transparent contracts and 24/7 live advisor support throughout your entire journey.',
        'Direct allocations with vetted 5★ properties and leading international carriers.',
        'Direct Desk: +998 50 876 77 22 · ooo.yasintime@gmail.com',
      ],
      tj: [
        'Шартномаи расмӣ бо ҳар як муштарӣ ва дастгирии шабонарӯзии 24/7.',
        'Ҳамкории мустақим бо меҳмонхонаҳои санҷидашудаи 5★ ва ширкатҳои ҳавоӣ.',
        'Тамоси мустақим: +998 50 876 77 22 · ooo.yasintime@gmail.com',
      ],
    },
  },
];

interface GuidesAndSupportProps {
  activeGuide: GuideSlug | null;
  onOpenGuide: (slug: GuideSlug | null) => void;
}

export function GuidesAndSupport({ activeGuide, onOpenGuide }: GuidesAndSupportProps) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'uz') as Language;

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedArticle = GUIDE_ARTICLES.find((g) => g.slug === activeGuide) || null;

  const handleConsultationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await submitPublicLead({
        customerName,
        phone,
        email,
        message,
        tourTitle: 'Individual Concierge Consultation',
        travelers: 2,
        source: 'consultation',
      });
      setSubmitted(true);
      setCustomerName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Aviasales-Style Guides & Travel Intelligence Section */}
      <section id="guides" className="py-20 bg-[#0A192F] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-[#C49A45] mb-2">
              {t('guides.eyebrow')}
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#F8FAFC] mb-3">
              {t('guides.title')}
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">{t('guides.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUIDE_ARTICLES.map((article, idx) => (
              <button
                key={article.slug}
                type="button"
                onClick={() => onOpenGuide(article.slug)}
                className="text-left border border-white/10 hover:border-[#C49A45]/60 bg-[#112240] p-6 flex flex-col justify-between transition-colors duration-150 cursor-pointer group"
              >
                <div>
                  <div className="text-xs font-mono-nums text-[#C49A45] mb-3">0{idx + 1}.</div>
                  <h3 className="font-serif-display text-xl font-semibold text-[#F8FAFC] mb-2.5">
                    {t(article.titleKey)}
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {article.summary[lang] || article.summary.uz}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#C49A45]">
                  <span>{t('guides.readGuide')}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation & Contact Center Section */}
      <section id="contact" className="py-20 bg-[#112240] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Direct Contact Center */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#C49A45] mb-2">
                  {t('consultation.officeTitle')}
                </p>
                <h2 className="font-serif-display text-3xl font-semibold text-[#F8FAFC] mb-3">
                  {t('consultation.title')}
                </h2>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  {t('consultation.subtitle')}
                </p>
              </div>

              <div className="divide-y divide-white/10 border border-white/10 bg-[#0A192F]">
                <a
                  href="tel:+998508767722"
                  className="p-4 flex items-center gap-4 hover:bg-[#162B4D]/60 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#C49A45] shrink-0" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-[#94A3B8]">
                      Hotline / Call Center
                    </div>
                    <div className="font-mono-nums text-sm font-semibold text-[#F8FAFC]">
                      +998 50 876 77 22
                    </div>
                  </div>
                </a>

                <a
                  href="mailto:ooo.yasintime@gmail.com"
                  className="p-4 flex items-center gap-4 hover:bg-[#162B4D]/60 transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#C49A45] shrink-0" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-[#94A3B8]">
                      Email
                    </div>
                    <div className="text-sm font-medium text-[#F8FAFC]">
                      ooo.yasintime@gmail.com
                    </div>
                  </div>
                </a>

                <div className="p-4 grid grid-cols-3 gap-2 text-xs">
                  <a
                    href="https://t.me/yasintime"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[#E8DCC4] hover:text-[#C49A45] py-1"
                  >
                    <Send className="w-3.5 h-3.5 text-[#C49A45]" />
                    <span>@yasintime</span>
                  </a>
                  <a
                    href="https://wa.me/998508767722"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[#E8DCC4] hover:text-[#C49A45] py-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#C49A45]" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="https://instagram.com/yasintime.travel"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[#E8DCC4] hover:text-[#C49A45] py-1"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#C49A45]" />
                    <span>@yasintime.travel</span>
                  </a>
                </div>

                <div className="p-4 space-y-2 text-xs text-[#94A3B8]">
                  <div className="flex items-center gap-2.5 text-[#E8DCC4]">
                    <MapPin className="w-3.5 h-3.5 text-[#C49A45] shrink-0" />
                    <span>{t('consultation.officeAddress')}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-[#C49A45] shrink-0" />
                    <span>{t('consultation.workingHours')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-Time Lead Capture Form */}
            <div className="lg:col-span-7 border border-[#C49A45]/30 bg-[#0A192F] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-[#C49A45] mb-1">
                {t('consultation.eyebrow')}
              </p>
              <h3 className="font-serif-display text-2xl font-semibold text-[#F8FAFC] mb-6">
                {t('consultation.sendRequest')}
              </h3>

              {submitted ? (
                <div className="border border-[#C49A45]/40 bg-[#112240] p-6 space-y-3">
                  <div className="flex items-center gap-2.5 text-[#C49A45]">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-semibold">{t('detail.successTitle')}</span>
                  </div>
                  <p className="text-xs text-[#E8DCC4]/85 leading-relaxed">
                    {t('detail.successDesc')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-medium text-[#C49A45] underline cursor-pointer pt-1"
                  >
                    + {t('consultation.sendRequest')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConsultationSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#E8DCC4]/80 mb-1.5">
                        {t('detail.fullName')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#112240] border border-white/15 px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#E8DCC4]/80 mb-1.5">
                        {t('detail.phone')} *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+998 50 876 77 22"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#112240] border border-white/15 px-3.5 py-2.5 text-sm text-[#F8FAFC] font-mono-nums focus:outline-none focus:border-[#C49A45]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#E8DCC4]/80 mb-1.5">
                      {t('detail.email')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#112240] border border-white/15 px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#E8DCC4]/80 mb-1.5">
                      {t('detail.notes')}
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#112240] border border-white/15 px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
                    />
                  </div>

                  {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-7 py-3.5 bg-[#C49A45] hover:bg-[#D4AF61] disabled:opacity-60 text-[#0A192F] text-xs font-semibold uppercase tracking-[0.16em] transition-colors cursor-pointer"
                  >
                    {submitting ? t('detail.submitting') : t('consultation.sendRequest')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Guide Reader Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 bg-[#0A192F]/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => onOpenGuide(null)}
        >
          <div
            className="max-w-2xl w-full border border-[#C49A45]/40 bg-[#112240] p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b border-white/10">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#C49A45] mb-1">
                  YasinTime Travel Guide
                </p>
                <h3 className="font-serif-display text-2xl font-semibold text-[#F8FAFC]">
                  {t(selectedArticle.titleKey)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onOpenGuide(null)}
                className="p-2 text-[#94A3B8] hover:text-[#F8FAFC] border border-white/10 cursor-pointer"
                aria-label={t('guides.closeGuide')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[#E8DCC4]/90 leading-relaxed mb-6">
              {selectedArticle.summary[lang] || selectedArticle.summary.uz}
            </p>

            <ul className="space-y-3 border-t border-white/10 pt-5">
              {(selectedArticle.bullets[lang] || selectedArticle.bullets.uz).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#F8FAFC]/90">
                  <span className="font-mono-nums text-xs text-[#C49A45] pt-0.5">0{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => onOpenGuide(null)}
                className="px-5 py-2 bg-[#C49A45] text-[#0A192F] text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                {t('guides.closeGuide')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
