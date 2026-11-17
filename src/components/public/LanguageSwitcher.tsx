import { useTranslation } from 'react-i18next';
import { persistLanguage } from '../../i18n';
import type { Language } from '../../types';

const LANGS: { code: Language; label: string }[] = [
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'tj', label: 'TJ' },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const current = (i18n.language || 'uz') as Language;

  const handleSelect = (code: Language) => {
    i18n.changeLanguage(code);
    persistLanguage(code);
  };

  return (
    <div
      className={`inline-flex items-center border border-[#C49A45]/25 bg-[#112240]/70 ${
        compact ? 'p-0.5' : 'p-1'
      }`}
      role="group"
      aria-label="Language selector"
    >
      {LANGS.map((l) => {
        const active = current === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => handleSelect(l.code)}
            className={`px-2.5 py-1 text-xs font-medium tracking-wider transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
              active
                ? 'bg-[#C49A45] text-[#0A192F] font-semibold'
                : 'text-[#E8DCC4]/80 hover:text-[#F8FAFC]'
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
