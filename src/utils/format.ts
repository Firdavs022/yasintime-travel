import type { Currency, Language, LocalizedText } from '../types';

export function pickLocalized(text: LocalizedText | undefined, lang: Language): string {
  if (!text) return '';
  return text[lang] || text.uz || text.en || '';
}

export function formatMoney(amountUsd: number, currency: Currency, exchangeRate = 12850): string {
  if (currency === 'UZS') {
    const uzs = Math.round(amountUsd * exchangeRate);
    return `${uzs.toLocaleString('en-US').replace(/,/g, ' ')} UZS`;
  }
  return `$${Math.round(amountUsd).toLocaleString('en-US')}`;
}

export function formatDateShort(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
