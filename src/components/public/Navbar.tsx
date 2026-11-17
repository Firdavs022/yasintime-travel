import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  onNavigate: (path: string) => void;
  onScrollTo: (sectionId: string) => void;
}

export function Navbar({ onNavigate, onScrollTo }: NavbarProps) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLink = (sectionId: string) => {
    setMobileOpen(false);
    onNavigate('/');
    setTimeout(() => onScrollTo(sectionId), 60);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#C49A45]/20 bg-[#0A192F]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark + logo */}
        <button
          type="button"
          onClick={() => {
            onNavigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C49A45]"
        >
          <img
            src="/assets/aistudio/Group_8_13159e01.png"
            alt="YasinTime Travel Logo"
            className="h-10 w-10 object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <span className="font-cinzel text-base sm:text-lg font-semibold tracking-[0.12em] text-[#E8DCC4]">
            YASIN TIME TRAVEL
          </span>
        </button>

        {/* Zone 2: 4 single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium tracking-wider uppercase text-[#E8DCC4]/85">
          <button
            type="button"
            onClick={() => handleLink('directions')}
            className="hover:text-[#C49A45] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('nav.directions')}
          </button>
          <button
            type="button"
            onClick={() => handleLink('catalog')}
            className="hover:text-[#C49A45] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('nav.tours')}
          </button>
          <button
            type="button"
            onClick={() => handleLink('guides')}
            className="hover:text-[#C49A45] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('nav.guides')}
          </button>
          <button
            type="button"
            onClick={() => handleLink('contact')}
            className="hover:text-[#C49A45] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('nav.contact')}
          </button>
        </nav>

        {/* Zone 3: Language Switcher + Primary CTA */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <LanguageSwitcher compact />
          <button
            type="button"
            onClick={() => handleLink('contact')}
            className="px-5 py-2.5 text-xs font-semibold tracking-wider uppercase bg-[#C49A45] text-[#0A192F] hover:bg-[#D4AF61] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('nav.cta')}
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden p-2 text-[#E8DCC4] border border-[#C49A45]/25 cursor-pointer"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#C49A45]/15 bg-[#0A192F] px-4 py-5 space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-medium text-[#E8DCC4]">
            <button
              type="button"
              onClick={() => handleLink('directions')}
              className="text-left py-1.5 hover:text-[#C49A45]"
            >
              {t('nav.directions')}
            </button>
            <button
              type="button"
              onClick={() => handleLink('catalog')}
              className="text-left py-1.5 hover:text-[#C49A45]"
            >
              {t('nav.tours')}
            </button>
            <button
              type="button"
              onClick={() => handleLink('guides')}
              className="text-left py-1.5 hover:text-[#C49A45]"
            >
              {t('nav.guides')}
            </button>
            <button
              type="button"
              onClick={() => handleLink('contact')}
              className="text-left py-1.5 hover:text-[#C49A45]"
            >
              {t('nav.contact')}
            </button>
          </div>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-4">
            <LanguageSwitcher compact />
            <button
              type="button"
              onClick={() => handleLink('contact')}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#C49A45] text-[#0A192F]"
            >
              {t('nav.cta')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
