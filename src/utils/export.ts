import * as XLSX from 'xlsx';
import type { Expense, Lead, TourPackage } from '../types';

function downloadCsv(filename: string, rows: Record<string, string | number | boolean>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportLeads(leads: Lead[], format: 'xlsx' | 'csv') {
  const rows = leads.map((l) => ({
    ID: l.id,
    Mijoz: l.customerName,
    Telefon: l.phone,
    Email: l.email || '',
    Sayohat: l.tourTitle || 'General Consultation',
    Mehmonlar: l.travelers,
    Status: l.status,
    Menejer: l.assignedManager || 'Tayinlanmagan',
    Summa_USD: l.dealAmountUsd,
    Izoh: l.notes || '',
    Yaratilgan: l.createdAt,
  }));

  if (format === 'csv') {
    downloadCsv(`yasintime-leads-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    return;
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  XLSX.writeFile(wb, `yasintime-leads-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportTours(tours: TourPackage[], format: 'xlsx' | 'csv') {
  const rows = tours.map((t) => ({
    ID: t.id,
    Nomi_UZ: t.title.uz,
    Nomi_EN: t.title.en,
    Manzil_UZ: t.destination.uz,
    Narx_USD: t.priceUsd,
    Narx_UZS: t.priceUzs,
    Kunlar: t.durationDays,
    Tunlar: t.durationNights,
    Mehmonxona: `${t.hotelName} (${t.hotelStars}★)`,
    Faol: t.active ? 'Ha' : 'Yo‘q',
  }));

  if (format === 'csv') {
    downloadCsv(`yasintime-tours-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    return;
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tours');
  XLSX.writeFile(wb, `yasintime-tours-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportFinancials(
  leads: Lead[],
  expenses: Expense[],
  format: 'xlsx' | 'csv'
) {
  const paidLeads = leads.filter((l) => l.status === 'To‘lov qilindi');
  const revenueRows = paidLeads.map((l) => ({
    Turi: 'Kirim (Revenue)',
    Nomi: `${l.customerName} — ${l.tourTitle || 'VIP Service'}`,
    Kategoriya: 'Booking',
    Summa_USD: l.dealAmountUsd,
    Sana: l.updatedAt.slice(0, 10),
  }));
  const expenseRows = expenses.map((e) => ({
    Turi: 'Chiqim (Expense)',
    Nomi: e.title,
    Kategoriya: e.category,
    Summa_USD: -Math.abs(e.amountUsd),
    Sana: e.date,
  }));

  const combined = [...revenueRows, ...expenseRows].sort((a, b) => b.Sana.localeCompare(a.Sana));

  if (format === 'csv') {
    downloadCsv(`yasintime-finance-${new Date().toISOString().slice(0, 10)}.csv`, combined);
    return;
  }
  const wb = XLSX.utils.book_new();
  const wsCombined = XLSX.utils.json_to_sheet(combined);
  const wsRevenue = XLSX.utils.json_to_sheet(revenueRows);
  const wsExpenses = XLSX.utils.json_to_sheet(expenseRows);
  XLSX.utils.book_append_sheet(wb, wsCombined, 'Summary');
  XLSX.utils.book_append_sheet(wb, wsRevenue, 'Revenue');
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');
  XLSX.writeFile(wb, `yasintime-finance-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
