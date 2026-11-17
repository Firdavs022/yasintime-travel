import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category, Language } from '../../types';
import { pickLocalized } from '../../utils/format';

interface HeroSectionProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
  onExploreCatalog: () => void;
}

export function HeroSection({
  categories,
  onSelectCategory,
  onExploreCatalog,
}: HeroSectionProps) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'uz') as Language;
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const pillars = categories.slice(0, 4);

  return (
    <section
      id="directions"
      className="relative min-h-[88vh] flex flex-col justify-between bg-[#0A192F] overflow-hidden border-b border-[#C49A45]/20"
    >
      {/* Background Architectural Image + Measured Scrim */}
      <div className="absolute inset-0 z-0">
        {!imgError ? (
          <img
            src="/src/assets/images/hero_luxury_dubai_skyline_1794901381860.jpg"
            alt="YasinTime Travel Dubai Marina luxury dusk skyline"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#081224]" />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/85 via-[#0A192F]/65 to-[#0A192F]"
          aria-hidden="true"
        />
      </div>

      {/* Main Hero Statement */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12">
        <div className="max-w-3xl">
          <p className="text-xs tracking-[0.22em] uppercase text-[#C49A45] font-medium mb-5">
            {t('hero.kicker')}
          </p>
          <h1
            className="font-serif-display font-semibold text-[#F8FAFC] leading-[1.12] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.25rem, 4.3vw, 3.85rem)', textWrap: 'balance' }}
          >
            {t('hero.title')}
          </h1>
          <p className="text-base sm:text-lg text-[#E8DCC4]/85 leading-relaxed max-w-2xl mb-9">
            {t('hero.subtitle')}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onExploreCatalog}
              className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#C49A45] hover:bg-[#D4AF61] text-[#0A192F] text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{t('hero.primaryCta')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Signature Travel Directions Strip */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#C49A45]/25 bg-[#0A192F]/90 divide-y sm:divide-y-0 sm:divide-x divide-[#C49A45]/20">
          {pillars.map((pillar, idx) => {
            const isSelected = activePillar === pillar.id;
            return (
              <div
                key={pillar.id}
                onMouseEnter={() => setActivePillar(pillar.id)}
                onMouseLeave={() => setActivePillar(null)}
                onClick={() => onSelectCategory(pillar.id)}
                className={`group p-6 flex flex-col justify-between transition-colors duration-150 cursor-pointer ${
                  isSelected ? 'bg-[#112240]' : 'hover:bg-[#112240]/80'
                }`}
              >
                <div>
                  <div className="text-xs font-mono-nums text-[#C49A45] mb-3">
                    0{idx + 1}.
                  </div>
                  <h2 className="font-serif-display text-lg font-semibold text-[#F8FAFC] mb-2">
                    {pickLocalized(pillar.name, lang)}
                  </h2>
                  <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
                    {pickLocalized(pillar.subtitle, lang)}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-opacity duration-150 ${
                      isSelected
                        ? 'text-[#C49A45] opacity-100'
                        : 'text-[#E8DCC4]/75 group-hover:text-[#C49A45]'
                    }`}
                  >
                    {t('hero.discover')}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
