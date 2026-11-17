import { Download, Edit3, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { Category, ItineraryDay, TourPackage, UserRole } from '../../types';
import { exportTours } from '../../utils/export';

interface ToursTabProps {
  categories: Category[];
  tours: TourPackage[];
  exchangeRate: number;
  currentUserRole: UserRole;
  token: string;
  onRefresh: () => void;
}

const PRESET_PHOTOS = [
  { label: 'Dubai Marina', url: '/src/assets/images/hero_luxury_dubai_skyline_1794901381860.jpg' },
  { label: 'Makkah Haram', url: '/src/assets/images/tour_umrah_vip_makkah_1794901382335.jpg' },
  { label: 'Maldives Villa', url: '/src/assets/images/tour_maldives_private_villa_1794901381092.jpg' },
  { label: 'Istanbul Palace', url: '/src/assets/images/tour_istanbul_bosphorus_palace_1794901383251.jpg' },
  { label: 'Swiss Alps', url: '/src/assets/images/tour_swiss_alps_retreat_1794901383317.jpg' },
];

export function ToursTab({
  categories,
  tours,
  exchangeRate,
  currentUserRole,
  token,
  onRefresh,
}: ToursTabProps) {
  const isAdmin = currentUserRole === 'Admin';

  // Category creation state
  const [catNameUz, setCatNameUz] = useState('');
  const [catNameRu, setCatNameRu] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catSaving, setCatSaving] = useState(false);

  // Tour modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [titleUz, setTitleUz] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [destUz, setDestUz] = useState('');
  const [destEn, setDestEn] = useState('');
  const [countryCode, setCountryCode] = useState('AE');
  const [priceUsd, setPriceUsd] = useState(2500);
  const [durationDays, setDurationDays] = useState(6);
  const [durationNights, setDurationNights] = useState(5);
  const [hotelName, setHotelName] = useState('');
  const [hotelStars, setHotelStars] = useState(5);
  const [summaryUz, setSummaryUz] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [photos, setPhotos] = useState<string[]>([PRESET_PHOTOS[0].url]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [includesFlight, setIncludesFlight] = useState(true);
  const [includesTransfer, setIncludesTransfer] = useState(true);
  const [includesInsurance, setIncludesInsurance] = useState(true);
  const [active, setActive] = useState(true);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [savingTour, setSavingTour] = useState(false);

  const openCreateTour = () => {
    setEditingTourId(null);
    setCategoryId(categories[0]?.id || '');
    setTitleUz('');
    setTitleRu('');
    setTitleEn('');
    setDestUz('');
    setDestEn('');
    setCountryCode('AE');
    setPriceUsd(2500);
    setDurationDays(6);
    setDurationNights(5);
    setHotelName('5★ Luxury Residence');
    setHotelStars(5);
    setSummaryUz('');
    setSummaryEn('');
    setPhotos([PRESET_PHOTOS[0].url]);
    setIncludesFlight(true);
    setIncludesTransfer(true);
    setIncludesInsurance(true);
    setActive(true);
    setItinerary([]);
    setModalOpen(true);
  };

  const openEditTour = (t: TourPackage) => {
    setEditingTourId(t.id);
    setCategoryId(t.categoryId);
    setTitleUz(t.title.uz);
    setTitleRu(t.title.ru);
    setTitleEn(t.title.en);
    setDestUz(t.destination.uz);
    setDestEn(t.destination.en);
    setCountryCode(t.countryCode);
    setPriceUsd(t.priceUsd);
    setDurationDays(t.durationDays);
    setDurationNights(t.durationNights);
    setHotelName(t.hotelName);
    setHotelStars(t.hotelStars);
    setSummaryUz(t.summary.uz);
    setSummaryEn(t.summary.en);
    setPhotos(t.photos.length ? t.photos : [PRESET_PHOTOS[0].url]);
    setIncludesFlight(t.includesFlight);
    setIncludesTransfer(t.includesTransfer);
    setIncludesInsurance(t.includesInsurance);
    setActive(t.active);
    setItinerary(t.itinerary || []);
    setModalOpen(true);
  };

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!catNameUz.trim() || !catSlug.trim()) return;
    setCatSaving(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: catSlug,
          name: {
            uz: catNameUz,
            ru: catNameRu || catNameUz,
            en: catNameEn || catNameUz,
            tj: catNameUz,
          },
          subtitle: { uz: '', ru: '', en: '', tj: '' },
        }),
      });
      if (res.ok) {
        setCatNameUz('');
        setCatNameRu('');
        setCatNameEn('');
        setCatSlug('');
        onRefresh();
      }
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onRefresh();
  };

  const handleSaveTour = async (e: FormEvent) => {
    e.preventDefault();
    setSavingTour(true);
    try {
      const payload = {
        categoryId,
        title: {
          uz: titleUz,
          ru: titleRu || titleUz,
          en: titleEn || titleUz,
          tj: titleUz,
        },
        destination: {
          uz: destUz,
          ru: destUz,
          en: destEn || destUz,
          tj: destUz,
        },
        countryCode,
        priceUsd,
        priceUzs: priceUsd * exchangeRate,
        durationDays,
        durationNights,
        hotelName,
        hotelStars,
        includesFlight,
        includesTransfer,
        includesInsurance,
        active,
        photos,
        summary: {
          uz: summaryUz,
          ru: summaryUz,
          en: summaryEn || summaryUz,
          tj: summaryUz,
        },
        itinerary,
      };
      const url = editingTourId ? `/api/admin/tours/${editingTourId}` : '/api/admin/tours';
      const method = editingTourId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setModalOpen(false);
        onRefresh();
      }
    } finally {
      setSavingTour(false);
    }
  };

  const handleDeleteTour = async (id: string) => {
    const res = await fetch(`/api/admin/tours/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onRefresh();
  };

  return (
    <div className="space-y-8">
      {/* Categories CMS */}
      <div className="border border-white/10 bg-[#112240] p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif-display text-lg font-semibold text-[#F8FAFC]">
            Kategoriyalar boshqaruvi ({categories.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="border border-white/10 bg-[#0A192F] p-3.5 flex items-start justify-between gap-2"
            >
              <div>
                <div className="text-sm font-medium text-[#F8FAFC]">{cat.name.uz}</div>
                <div className="font-mono-nums text-[11px] text-[#C49A45] mt-0.5">
                  /{cat.slug}
                </div>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-[#94A3B8] hover:text-red-400 p-1 cursor-pointer"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {isAdmin && (
          <form
            onSubmit={handleCreateCategory}
            className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-5 gap-3"
          >
            <input
              type="text"
              required
              placeholder="Nomi (UZ)*"
              value={catNameUz}
              onChange={(e) => setCatNameUz(e.target.value)}
              className="bg-[#0A192F] border border-white/15 px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
            />
            <input
              type="text"
              placeholder="Название (RU)"
              value={catNameRu}
              onChange={(e) => setCatNameRu(e.target.value)}
              className="bg-[#0A192F] border border-white/15 px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
            />
            <input
              type="text"
              placeholder="Name (EN)"
              value={catNameEn}
              onChange={(e) => setCatNameEn(e.target.value)}
              className="bg-[#0A192F] border border-white/15 px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
            />
            <input
              type="text"
              required
              placeholder="Slug (e.g. honeymoon)"
              value={catSlug}
              onChange={(e) => setCatSlug(e.target.value)}
              className="bg-[#0A192F] border border-white/15 px-3 py-2 text-xs text-[#F8FAFC] font-mono-nums focus:outline-none focus:border-[#C49A45]"
            />
            <button
              type="submit"
              disabled={catSaving}
              className="px-4 py-2 bg-[#C49A45] hover:bg-[#D4AF61] text-[#0A192F] text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              + Kategoriya
            </button>
          </form>
        )}
      </div>

      {/* Tour Packages CMS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-[#112240] p-4">
          <h3 className="font-serif-display text-lg font-semibold text-[#F8FAFC]">
            Sayohat paketlari ({tours.length})
          </h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => exportTours(tours, 'xlsx')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#C49A45]/40 text-xs text-[#C49A45] hover:bg-[#C49A45] hover:text-[#0A192F] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => exportTours(tours, 'csv')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/15 text-xs text-[#E8DCC4] hover:border-[#C49A45] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={openCreateTour}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C49A45] hover:bg-[#D4AF61] text-[#0A192F] text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Yangi Tur Qo‘shish
              </button>
            )}
          </div>
        </div>

        <div className="border border-white/10 bg-[#112240] overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-[#94A3B8] bg-[#0A192F]/60">
                <th className="py-3 px-4 font-medium">Tur Nomi</th>
                <th className="py-3 px-4 font-medium">Manzil & Muddat</th>
                <th className="py-3 px-4 font-medium">Mehmonxona</th>
                <th className="py-3 px-4 font-medium text-right">Narx (USD)</th>
                <th className="py-3 px-4 font-medium text-right">Narx (UZS)</th>
                <th className="py-3 px-4 font-medium">Holat</th>
                {isAdmin && <th className="py-3 px-4 font-medium text-right">Amallar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs">
              {tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-[#162B4D]/50">
                  <td className="py-3 px-4 font-medium text-[#F8FAFC]">{tour.title.uz}</td>
                  <td className="py-3 px-4 text-[#94A3B8]">
                    {tour.destination.uz} ·{' '}
                    <span className="font-mono-nums">{tour.durationDays}k</span>
                  </td>
                  <td className="py-3 px-4 text-[#E8DCC4]">{tour.hotelName}</td>
                  <td className="py-3 px-4 text-right font-mono-nums text-[#C49A45] font-semibold">
                    ${tour.priceUsd.toLocaleString('en-US')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-nums text-[#94A3B8]">
                    {tour.priceUzs.toLocaleString('en-US').replace(/,/g, ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={tour.active ? 'text-emerald-400' : 'text-[#94A3B8]'}>
                      {tour.active ? 'Faol' : 'Yashirin'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditTour(tour)}
                        className="p-1.5 text-[#E8DCC4] hover:text-[#C49A45] cursor-pointer"
                        title="Edit tour"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTour(tour.id)}
                        className="p-1.5 text-[#94A3B8] hover:text-red-400 cursor-pointer"
                        title="Delete tour"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Tour Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A192F]/85 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full border border-[#C49A45]/40 bg-[#112240] p-6 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-serif-display text-xl font-semibold text-[#F8FAFC]">
                {editingTourId ? 'Turni tahrirlash' : 'Yangi sayohat paketi yaratish'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTour} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Kategoriya *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name.uz}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Narx (USD) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(Number(e.target.value) || 0)}
                    className="w-full bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC] font-mono-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Tur nomi (UZ) *</label>
                  <input
                    type="text"
                    required
                    value={titleUz}
                    onChange={(e) => setTitleUz(e.target.value)}
                    className="w-full bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Название (RU)</label>
                  <input
                    type="text"
                    value={titleRu}
                    onChange={(e) => setTitleRu(e.target.value)}
                    className="w-full bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Title (EN)</label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Manzil (UZ) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dubay, BAA"
                    value={destUz}
                    onChange={(e) => setDestUz(e.target.value)}
                    className="w-full bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Davlat kodi</label>
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC] font-mono-nums"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Kunlar</label>
                  <input
                    type="number"
                    min={1}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value) || 1)}
                    className="w-full bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC] font-mono-nums"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Tunlar</label>
                  <input
                    type="number"
                    min={0}
                    value={durationNights}
                    onChange={(e) => setDurationNights(Number(e.target.value) || 0)}
                    className="w-full bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC] font-mono-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[#94A3B8] mb-1">Mehmonxona nomi</label>
                  <input
                    type="text"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="w-full bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Yulduzlar (3–5)</label>
                  <input
                    type="number"
                    min={3}
                    max={5}
                    value={hotelStars}
                    onChange={(e) => setHotelStars(Number(e.target.value) || 5)}
                    className="w-full bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC] font-mono-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Tavsif (UZ)</label>
                <textarea
                  rows={2}
                  value={summaryUz}
                  onChange={(e) => setSummaryUz(e.target.value)}
                  className="w-full bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC]"
                />
              </div>

              {/* Multiple Photos */}
              <div className="space-y-2 border-t border-white/10 pt-3">
                <label className="block text-[#94A3B8]">Rasmlar (Multi-photo URL)</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PHOTOS.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() =>
                        setPhotos((prev) => (prev.includes(p.url) ? prev : [...prev, p.url]))
                      }
                      className="px-2.5 py-1 border border-white/15 bg-[#0A192F] text-[11px] text-[#E8DCC4] hover:border-[#C49A45] cursor-pointer"
                    >
                      + {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Rasm URL manzilini kiriting..."
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="flex-1 bg-[#0A192F] border border-white/15 px-3 py-2 text-[#F8FAFC]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPhotoUrl.trim()) {
                        setPhotos((prev) => [...prev, newPhotoUrl.trim()]);
                        setNewPhotoUrl('');
                      }
                    }}
                    className="px-3 py-2 border border-[#C49A45] text-[#C49A45] cursor-pointer"
                  >
                    Qo‘shish
                  </button>
                </div>
                <div className="space-y-1">
                  {photos.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="flex items-center justify-between bg-[#0A192F] px-3 py-1.5 border border-white/10"
                    >
                      <span className="truncate text-[11px] text-[#E8DCC4]">{url}</span>
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-red-400 ml-2 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-5 pt-2">
                <label className="flex items-center gap-2 text-[#E8DCC4] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includesFlight}
                    onChange={(e) => setIncludesFlight(e.target.checked)}
                  />
                  Aviachipta
                </label>
                <label className="flex items-center gap-2 text-[#E8DCC4] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includesTransfer}
                    onChange={(e) => setIncludesTransfer(e.target.checked)}
                  />
                  VIP Transfer
                </label>
                <label className="flex items-center gap-2 text-[#E8DCC4] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includesInsurance}
                    onChange={(e) => setIncludesInsurance(e.target.checked)}
                  />
                  Sug‘urta
                </label>
                <label className="flex items-center gap-2 text-[#E8DCC4] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  Saytda faol
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-white/15 text-[#94A3B8] cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={savingTour}
                  className="px-6 py-2 bg-[#C49A45] text-[#0A192F] font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {savingTour ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
