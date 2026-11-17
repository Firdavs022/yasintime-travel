import { ArrowUpRight, Compass, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category, Currency, Language, TourPackage } from '../../types';
import { formatMoney, pickLocalized } from '../../utils/format';

interface TourCatalogProps {
  categories: Category[];
  tours: TourPackage[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  exchangeRate: number;
  onSelectTour: (tour: TourPackage) => void;
}

export function TourCatalog({
  categories,
  tours,
  selectedCategory,
  onCategoryChange,
  currency,
  onCurrencyChange,
  exchangeRate,
  onSelectTour,
}: TourCatalogProps) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'uz') as Language;

  const [destinationFilter, setDestinationFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [maxPriceUsd, setMaxPriceUsd] = useState<number>(0);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const destinations = useMemo(() => {
    const map = new Map<string, string>();
    for (const tour of tours) {
      map.set(tour.countryCode, pickLocalized(tour.destination, lang));
    }
    return Array.from(map.entries());
  }, [tours, lang]);

  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      if (selectedCategory !== 'all' && tour.categoryId !== selectedCategory) return false;
      if (destinationFilter !== 'all' && tour.countryCode !== destinationFilter) return false;
      if (durationFilter === 'short' && tour.durationDays > 5) return false;
      if (durationFilter === 'medium' && (tour.durationDays < 6 || tour.durationDays > 8))
        return false;
      if (durationFilter === 'long' && tour.durationDays < 9) return false;
      if (maxPriceUsd > 0 && tour.priceUsd > maxPriceUsd) return false;
      return true;
    });
  }, [tours, selectedCategory, destinationFilter, durationFilter, maxPriceUsd]);

  const handleReset = () => {
    onCategoryChange('all');
    setDestinationFilter('all');
    setDurationFilter('all');
    setMaxPriceUsd(0);
  };

  return (
    <section
      id="catalog"
      className="py-20 bg-[#F7F5F0] dark:bg-[#0A192F] border-b border-[#0A192F]/10 dark:border-white/10 transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header + Currency Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9E7823] dark:text-[#C49A45] mb-2">
              {t('catalog.eyebrow')}
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#0A192F] dark:text-[#F8FAFC]">
              {t('catalog.title')}
            </h2>
          </div>

          <div className="flex items-center gap-2 border border-[#C49A45]/35 bg-white dark:bg-[#112240] p-1 self-start md:self-auto">
            <button
              type="button"
              onClick={() => onCurrencyChange('USD')}
              className={`px-3.5 py-1.5 text-xs font-mono-nums font-medium transition-colors cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#C49A45] text-[#0A192F] font-semibold'
                  : 'text-[#334155] dark:text-[#E8DCC4]/80 hover:text-[#0A192F] dark:hover:text-[#F8FAFC]'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => onCurrencyChange('UZS')}
              className={`px-3.5 py-1.5 text-xs font-mono-nums font-medium transition-colors cursor-pointer ${
                currency === 'UZS'
                  ? 'bg-[#C49A45] text-[#0A192F] font-semibold'
                  : 'text-[#334155] dark:text-[#E8DCC4]/80 hover:text-[#0A192F] dark:hover:text-[#F8FAFC]'
              }`}
            >
              UZS
            </button>
          </div>
        </div>

        {/* Category Tabs + Multi-Filter Bar */}
        <div className="border border-[#0A192F]/12 dark:border-white/10 bg-white dark:bg-[#112240] p-4 sm:p-5 mb-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onCategoryChange('all')}
              className={`px-4 py-2 text-xs font-medium tracking-wide transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                selectedCategory === 'all'
                  ? 'bg-[#C49A45] text-[#0A192F] border-[#C49A45] font-semibold'
                  : 'bg-[#F7F5F0] dark:bg-[#0A192F] text-[#334155] dark:text-[#E8DCC4]/85 border-[#0A192F]/12 dark:border-white/10 hover:border-[#C49A45]/60'
              }`}
            >
              {t('catalog.allCategories')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 text-xs font-medium tracking-wide transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-[#C49A45] text-[#0A192F] border-[#C49A45] font-semibold'
                    : 'bg-[#F7F5F0] dark:bg-[#0A192F] text-[#334155] dark:text-[#E8DCC4]/85 border-[#0A192F]/12 dark:border-white/10 hover:border-[#C49A45]/60'
                }`}
              >
                {pickLocalized(cat.name, lang)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#0A192F]/10 dark:border-white/10">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                {t('catalog.allDestinations')}
              </label>
              <select
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3 py-2.5 text-sm text-[#0A192F] dark:text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
              >
                <option value="all">{t('catalog.allDestinations')}</option>
                {destinations.map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                {t('catalog.allDurations')}
              </label>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3 py-2.5 text-sm text-[#0A192F] dark:text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
              >
                <option value="all">{t('catalog.allDurations')}</option>
                <option value="short">{t('catalog.shortTrip')}</option>
                <option value="medium">{t('catalog.mediumTrip')}</option>
                <option value="long">{t('catalog.longTrip')}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                {t('catalog.maxPrice')}
              </label>
              <select
                value={maxPriceUsd}
                onChange={(e) => setMaxPriceUsd(Number(e.target.value))}
                className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3 py-2.5 text-sm text-[#0A192F] dark:text-[#F8FAFC] focus:outline-none focus:border-[#C49A45] tabular-nums"
              >
                <option value={0}>{t('catalog.anyPrice')}</option>
                <option value={2000}>≤ $2,000</option>
                <option value={3000}>≤ $3,000</option>
                <option value={4500}>≤ $4,500</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tour Grid */}
        {filteredTours.length === 0 ? (
          <div className="border border-[#0A192F]/12 dark:border-white/10 bg-white dark:bg-[#112240] py-16 px-6 text-center">
            <Compass className="w-8 h-8 text-[#9E7823] dark:text-[#C49A45] mx-auto mb-3" />
            <p className="text-sm text-[#334155] dark:text-[#E8DCC4] mb-5">{t('catalog.empty')}</p>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#C49A45] text-xs font-semibold uppercase tracking-wider text-[#9E7823] dark:text-[#C49A45] hover:bg-[#C49A45] hover:text-[#0A192F] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('catalog.resetFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour) => {
              const photo = tour.photos[0];
              const isBroken = !photo || brokenImages[tour.id];
              return (
                <article
                  key={tour.id}
                  onClick={() => onSelectTour(tour)}
                  className="group border border-[#0A192F]/12 dark:border-white/10 hover:border-[#C49A45] bg-white dark:bg-[#112240] flex flex-col transition-colors duration-150 cursor-pointer"
                >
                  <div className="relative aspect-[4/3] bg-[#EAE6DC] dark:bg-[#081224] overflow-hidden border-b border-[#0A192F]/10 dark:border-white/10">
                    {!isBroken ? (
                      <img
                        src={photo}
                        alt={pickLocalized(tour.title, lang)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenImages((prev) => ({ ...prev, [tour.id]: true }))
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#EAE6DC] dark:bg-[#112240] p-6 text-center">
                        <Compass className="w-8 h-8 text-[#9E7823] dark:text-[#C49A45]/70 mb-2" />
                        <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                          {pickLocalized(tour.destination, lang)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center flex-wrap gap-2 text-xs text-[#64748B] dark:text-[#94A3B8] mb-3">
                        <span className="text-[#9E7823] dark:text-[#C49A45] font-medium">
                          {pickLocalized(tour.destination, lang)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {tour.durationDays} {t('catalog.days')} / {tour.durationNights}{' '}
                          {t('catalog.nights')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{tour.hotelStars}★</span>
                      </div>

                      <h3 className="font-serif-display text-xl font-semibold text-[#0A192F] dark:text-[#F8FAFC] group-hover:text-[#9E7823] dark:group-hover:text-[#E8DCC4] transition-colors mb-2.5 leading-snug">
                        {pickLocalized(tour.title, lang)}
                      </h3>

                      <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed line-clamp-2 mb-4">
                        {pickLocalized(tour.summary, lang)}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#0A192F]/10 dark:border-white/10 flex items-end justify-between gap-4">
                      <div>
                        <div className="font-mono-nums text-lg font-semibold text-[#0A192F] dark:text-[#F8FAFC]">
                          {formatMoney(tour.priceUsd, currency, exchangeRate)}
                        </div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {t('catalog.perGuest')}
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9E7823] dark:text-[#C49A45] group-hover:translate-x-0.5 transition-transform">
                        {t('catalog.viewDetails')}
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
