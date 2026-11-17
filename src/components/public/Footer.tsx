import { CheckCircle2, Instagram, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { subscribeNewsletter } from '../../services/api';
import type { Language } from '../../types';
import { GuideSlug } from './GuidesAndSupport';
import { LanguageSwitcher } from './LanguageSwitcher';

interface FooterProps {
  onOpenGuide: (slug: GuideSlug) => void;
}

export function Footer({ onOpenGuide }: FooterProps) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'uz') as Language;

  const [contact, setContact] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setSubmitting(true);
    try {
      await subscribeNewsletter(contact, lang);
      setSubscribed(true);
      setContact('');
    } finally {
      setSubmitting(false);
    }
  };

  const guideLinks: { slug: GuideSlug; labelKey: string }[] = [
    { slug: 'useful', labelKey: 'guides.items.useful' },
    { slug: 'visa', labelKey: 'guides.items.visa' },
    { slug: 'destinations', labelKey: 'guides.items.destinations' },
    { slug: 'offers', labelKey: 'guides.items.offers' },
    { slug: 'about', labelKey: 'guides.items.about' },
  ];

  return (
    <footer className="bg-[#081224] text-[#E8DCC4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/Group_8_13159e01.png"
                alt="YasinTime Travel Logo"
                className="h-11 w-11 object-contain"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-cinzel text-base font-semibold tracking-[0.14em] text-[#F8FAFC]">
                  YASIN TIME TRAVEL
                </div>
                <div className="text-[11px] text-[#94A3B8]">
                  Tashkent · Luxury & Spiritual Travel
                </div>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm">
              {t('hero.subtitle')}
            </p>
            <div className="pt-1">
              <LanguageSwitcher compact />
            </div>
          </div>

          {/* Aviasales-Style Quick Links / Guides */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C49A45] mb-4">
              {t('footer.guidesCol')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {guideLinks.map((g) => (
                <li key={g.slug}>
                  <button
                    type="button"
                    onClick={() => onOpenGuide(g.slug)}
                    className="text-[#E8DCC4]/80 hover:text-[#C49A45] transition-colors cursor-pointer text-left"
                  >
                    {t(g.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Contacts */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C49A45] mb-4">
              {t('footer.contactsCol')}
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <a
                  href="tel:+998508767722"
                  className="inline-flex items-center gap-2 font-mono-nums text-[#F8FAFC] hover:text-[#C49A45]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C49A45]" />
                  +998 50 876 77 22
                </a>
              </li>
              <li>
                <a
                  href="mailto:ooo.yasintime@gmail.com"
                  className="inline-flex items-center gap-2 text-[#E8DCC4]/85 hover:text-[#C49A45]"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C49A45]" />
                  ooo.yasintime@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/yasintime.travel"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[#E8DCC4]/85 hover:text-[#C49A45]"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#C49A45]" />
                  @yasintime.travel
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/yasintime"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[#E8DCC4]/85 hover:text-[#C49A45]"
                >
                  <Send className="w-3.5 h-3.5 text-[#C49A45]" />
                  @yasintime
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/998508767722"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[#E8DCC4]/85 hover:text-[#C49A45]"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#C49A45]" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C49A45] mb-3">
              {t('footer.newsletterTitle')}
            </h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
              {t('footer.newsletterDesc')}
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-[#C49A45] border border-[#C49A45]/30 bg-[#112240] p-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t('footer.subscribed')}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={t('footer.newsletterPlaceholder')}
                  className="w-full bg-[#112240] border border-white/15 px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-[#C49A45] hover:bg-[#D4AF61] text-[#0A192F] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {t('footer.subscribe')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div>{t('footer.copyright')}</div>
          <div>+998 50 876 77 22 · ooo.yasintime@gmail.com</div>
        </div>
      </div>
    </footer>
  );
}
