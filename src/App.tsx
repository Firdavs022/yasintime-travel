import { useCallback, useEffect, useState } from 'react';
import { AdminPortal } from './components/admin/AdminPortal';
import { Footer } from './components/public/Footer';
import { GuideSlug, GuidesAndSupport } from './components/public/GuidesAndSupport';
import { HeroSection } from './components/public/HeroSection';
import { Navbar } from './components/public/Navbar';
import { TourCatalog } from './components/public/TourCatalog';
import { TourDetailView } from './components/public/TourDetailView';
import { useTheme } from './hooks/useTheme';
import { fetchPublicBootstrap } from './services/api';
import type { Category, Currency, TourPackage } from './types';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [pathname, setPathname] = useState<string>(() => window.location.pathname || '/');
  const [hash, setHash] = useState<string>(() => window.location.hash || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(12850);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [activeGuide, setActiveGuide] = useState<GuideSlug | null>(null);

  const loadPublicData = useCallback(async () => {
    try {
      const data = await fetchPublicBootstrap();
      setCategories(data.categories);
      setTours(data.tours);
      setExchangeRate(data.exchangeRateUzs || 12850);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname || '/');
      setHash(window.location.hash || '');
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onPopState);
    };
  }, []);

  const navigate = useCallback(
    (nextPath: string) => {
      if (nextPath !== pathname) {
        window.history.pushState({}, '', nextPath);
        setPathname(nextPath);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (nextPath === '/') {
        loadPublicData();
      }
    },
    [pathname, loadPublicData]
  );

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  if (pathname.startsWith('/admin') || hash.startsWith('#/admin')) {
    return (
      <AdminPortal
        theme={theme}
        onToggleTheme={toggleTheme}
        onBackToSite={() => {
          setHash('');
          navigate('/');
        }}
      />
    );
  }

  const tourMatch = pathname.match(/^\/tours\/([^/]+)$/);
  const activeTour = tourMatch ? tours.find((t) => t.id === tourMatch[1]) || null : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#0A192F] dark:bg-[#0A192F] dark:text-[#F8FAFC] transition-colors duration-150">
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        onScrollTo={scrollToSection}
      />

      <main className="flex-1">
        {activeTour ? (
          <TourDetailView
            tour={activeTour}
            currency={currency}
            exchangeRate={exchangeRate}
            onBack={() => navigate('/')}
          />
        ) : (
          <>
            <HeroSection
              categories={categories}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                scrollToSection('catalog');
              }}
              onExploreCatalog={() => scrollToSection('catalog')}
            />

            {loading ? (
              <div className="py-24 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                YasinTime Travel...
              </div>
            ) : (
              <TourCatalog
                categories={categories}
                tours={tours}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                currency={currency}
                onCurrencyChange={setCurrency}
                exchangeRate={exchangeRate}
                onSelectTour={(tour) => navigate(`/tours/${tour.id}`)}
              />
            )}

            <GuidesAndSupport activeGuide={activeGuide} onOpenGuide={setActiveGuide} />
          </>
        )}
      </main>

      <Footer onOpenGuide={setActiveGuide} />
    </div>
  );
}
