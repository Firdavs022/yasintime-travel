import {
  ArrowLeft,
  Building2,
  Car,
  CheckCircle2,
  Compass,
  Plane,
  ShieldCheck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitPublicLead } from '../../services/api';
import type { Currency, Language, TourPackage } from '../../types';
import { formatMoney, pickLocalized } from '../../utils/format';

interface TourDetailViewProps {
  tour: TourPackage;
  currency: Currency;
  exchangeRate: number;
  onBack: () => void;
}

export function TourDetailView({
  tour,
  currency,
  exchangeRate,
  onBack,
}: TourDetailViewProps) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'uz') as Language;

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [travelers, setTravelers] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [brokenPhoto, setBrokenPhoto] = useState(false);

  const photos =
    tour.photos.length > 0
      ? tour.photos
      : ['/src/assets/images/hero_luxury_dubai_skyline_1794901381860.jpg'];
  const currentPhoto = photos[activePhotoIndex] || photos[0];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await submitPublicLead({
        customerName,
        phone,
        email,
        tourId: tour.id,
        tourTitle: tour.title.uz,
        travelers,
        preferredDate,
        message,
        source: 'booking',
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
    <div className="bg-[#F7F5F0] dark:bg-[#0A192F] min-h-screen py-10 sm:py-14 border-b border-[#0A192F]/10 dark:border-white/10 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#9E7823] dark:text-[#C49A45] hover:underline mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('detail.back')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-3">
              <div className="aspect-[16/10] bg-white dark:bg-[#112240] border border-[#0A192F]/12 dark:border-white/10 overflow-hidden">
                {!brokenPhoto ? (
                  <img
                    src={currentPhoto}
                    alt={pickLocalized(tour.title, lang)}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setBrokenPhoto(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#EAE6DC] dark:bg-[#112240]">
                    <Compass className="w-10 h-10 text-[#9E7823] dark:text-[#C49A45]/70 mb-2" />
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {pickLocalized(tour.destination, lang)}
                    </span>
                  </div>
                )}
              </div>

              {photos.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {photos.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => {
                        setBrokenPhoto(false);
                        setActivePhotoIndex(i);
                      }}
                      className={`aspect-[4/3] overflow-hidden border cursor-pointer transition-colors ${
                        activePhotoIndex === i
                          ? 'border-[#C49A45]'
                          : 'border-[#0A192F]/12 dark:border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-[#9E7823] dark:text-[#C49A45] mb-3">
                <span>{pickLocalized(tour.destination, lang)}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {tour.durationDays} {t('catalog.days')} / {tour.durationNights}{' '}
                  {t('catalog.nights')}
                </span>
              </div>
              <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#0A192F] dark:text-[#F8FAFC] mb-4">
                {pickLocalized(tour.title, lang)}
              </h1>
              <p className="text-sm sm:text-base text-[#334155] dark:text-[#E8DCC4]/85 leading-relaxed">
                {pickLocalized(tour.summary, lang)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-[#0A192F]/12 dark:border-white/10 py-6">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-[#9E7823] dark:text-[#C49A45] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                    {t('detail.hotelInfo')}
                  </div>
                  <div className="text-sm font-medium text-[#0A192F] dark:text-[#F8FAFC] mt-0.5">
                    {tour.hotelName} · {tour.hotelStars}★
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#9E7823] dark:text-[#C49A45] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                    {t('detail.included')}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#0A192F] dark:text-[#F8FAFC] mt-1">
                    {tour.includesFlight && (
                      <span className="inline-flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5 text-[#9E7823] dark:text-[#C49A45]" />
                        {t('catalog.flight')}
                      </span>
                    )}
                    {tour.includesTransfer && (
                      <span className="inline-flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-[#9E7823] dark:text-[#C49A45]" />
                        {t('catalog.transfer')}
                      </span>
                    )}
                    {tour.includesInsurance && (
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#9E7823] dark:text-[#C49A45]" />
                        {t('catalog.insurance')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-serif-display text-2xl font-semibold text-[#0A192F] dark:text-[#F8FAFC] mb-6">
                {t('detail.itineraryTitle')}
              </h2>
              <div className="divide-y divide-[#0A192F]/10 dark:divide-white/10 border border-[#0A192F]/12 dark:border-white/10 bg-white dark:bg-[#112240]">
                {tour.itinerary.length > 0 ? (
                  tour.itinerary.map((item) => (
                    <div key={item.day} className="p-6 flex gap-5">
                      <div className="font-mono-nums text-xs font-semibold text-[#9E7823] dark:text-[#C49A45] whitespace-nowrap shrink-0 pt-1">
                        {lang === 'en'
                          ? `${t('detail.dayLabel')}${item.day}`
                          : `${item.day}${t('detail.dayLabel')}`}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#0A192F] dark:text-[#F8FAFC] mb-1.5">
                          {pickLocalized(item.title, lang)}
                        </h3>
                        <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                          {pickLocalized(item.description, lang)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-sm text-[#475569] dark:text-[#94A3B8]">
                    {pickLocalized(tour.summary, lang)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sticky Booking Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="border border-[#C49A45]/45 bg-white dark:bg-[#112240] p-6 sm:p-8">
              <div className="pb-5 mb-6 border-b border-[#0A192F]/10 dark:border-white/10 flex items-baseline justify-between gap-4">
                <div>
                  <div className="font-mono-nums text-2xl font-semibold text-[#0A192F] dark:text-[#F8FAFC]">
                    {formatMoney(tour.priceUsd, currency, exchangeRate)}
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    {t('catalog.perGuest')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                    {t('detail.totalEstimate')}
                  </div>
                  <div className="font-mono-nums text-base font-semibold text-[#9E7823] dark:text-[#C49A45]">
                    {formatMoney(tour.priceUsd * travelers, currency, exchangeRate)}
                  </div>
                </div>
              </div>

              <h2 className="font-serif-display text-xl font-semibold text-[#0A192F] dark:text-[#F8FAFC] mb-1">
                {t('detail.bookTitle')}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-6">
                {t('detail.bookSubtitle')}
              </p>

              {submitted ? (
                <div className="border border-[#C49A45]/45 bg-[#F7F5F0] dark:bg-[#0A192F] p-6 space-y-3">
                  <div className="flex items-center gap-2.5 text-[#9E7823] dark:text-[#C49A45]">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-semibold">{t('detail.successTitle')}</span>
                  </div>
                  <p className="text-xs text-[#334155] dark:text-[#E8DCC4]/85 leading-relaxed">
                    {t('detail.successDesc')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-medium text-[#9E7823] dark:text-[#C49A45] underline cursor-pointer pt-2"
                  >
                    + {t('detail.submitBooking')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#334155] dark:text-[#E8DCC4]/80 mb-1.5">
                      {t('detail.travelers')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={travelers}
                      onChange={(e) => setTravelers(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3.5 py-2.5 text-sm text-[#0A192F] dark:text-[#F8FAFC] font-mono-nums focus:outline-none focus:border-[#C49A45]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#334155] dark:text-[#E8DCC4]/80 mb-1.5">
                      {t('detail.fullName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3.5 py-2.5 text-sm text-[#0A192F] dark:text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#334155] dark:text-[#E8DCC4]/80 mb-1.5">
                        {t('detail.phone')} *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+998 90 123 45 67"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3.5 py-2.5 text-sm text-[#0A192F] dark:text-[#F8FAFC] font-mono-nums focus:outline-none focus:border-[#C49A45]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#334155] dark:text-[#E8DCC4]/80 mb-1.5">
                        {t('detail.preferredDate')}
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3.5 py-2.5 text-sm text-[#0A192F] dark:text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#334155] dark:text-[#E8DCC4]/80 mb-1.5">
                      {t('detail.email')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3.5 py-2.5 text-sm text-[#0A192F] dark:text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#334155] dark:text-[#E8DCC4]/80 mb-1.5">
                      {t('detail.notes')}
                    </label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3.5 py-2 text-sm text-[#0A192F] dark:text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
                    />
                  </div>

                  {errorMsg && <p className="text-xs text-red-500 dark:text-red-400">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#C49A45] hover:bg-[#D4AF61] disabled:opacity-60 text-[#0A192F] text-xs font-semibold uppercase tracking-[0.16em] transition-colors cursor-pointer"
                  >
                    {submitting ? t('detail.submitting') : t('detail.submitBooking')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
