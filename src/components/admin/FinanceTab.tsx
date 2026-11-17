import { Download, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { createAdminExpense, deleteAdminExpense } from '../../services/api';
import type { Expense, ExpenseCategory, Lead, UserRole } from '../../types';
import { exportFinancials } from '../../utils/export';

interface FinanceTabProps {
  leads: Lead[];
  expenses: Expense[];
  exchangeRate: number;
  currentUserEmail: string;
  currentUserRole: UserRole;
  token: string;
  onRefresh: () => void;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Flight',
  'Hotel',
  'Marketing',
  'Office',
  'Salary',
  'Visa',
  'Other',
];

export function FinanceTab({
  leads,
  expenses,
  exchangeRate,
  currentUserEmail,
  currentUserRole,
  token,
  onRefresh,
}: FinanceTabProps) {
  const canWrite = currentUserRole === 'Admin' || currentUserRole === 'Accountant';

  const [period, setPeriod] = useState<Period>('monthly');
  const [hoveredBucket, setHoveredBucket] = useState<number | null>(null);

  // New Expense Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Flight');
  const [amountUsd, setAmountUsd] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const paidLeads = useMemo(
    () => leads.filter((l) => l.status === 'To‘lov qilindi'),
    [leads]
  );

  // Build time buckets dynamically based on selected period
  const { buckets, periodRevenue, periodExpenses } = useMemo(() => {
    const now = new Date();
    const list: { label: string; revenue: number; expense: number }[] = [];

    if (period === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400_000);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const rev = paidLeads
          .filter((l) => l.updatedAt.slice(0, 10) === key)
          .reduce((sum, l) => sum + (l.dealAmountUsd || 0), 0);
        const exp = expenses
          .filter((e) => e.date === key)
          .reduce((sum, e) => sum + (e.amountUsd || 0), 0);
        list.push({ label, revenue: rev, expense: exp });
      }
    } else if (period === 'weekly') {
      for (let w = 3; w >= 0; w--) {
        const end = new Date(now.getTime() - w * 7 * 86400_000);
        const start = new Date(end.getTime() - 6 * 86400_000);
        const startKey = start.toISOString().slice(0, 10);
        const endKey = end.toISOString().slice(0, 10);
        const label = `W-${4 - w}`;
        const rev = paidLeads
          .filter((l) => {
            const d = l.updatedAt.slice(0, 10);
            return d >= startKey && d <= endKey;
          })
          .reduce((sum, l) => sum + (l.dealAmountUsd || 0), 0);
        const exp = expenses
          .filter((e) => e.date >= startKey && e.date <= endKey)
          .reduce((sum, e) => sum + (e.amountUsd || 0), 0);
        list.push({ label, revenue: rev, expense: exp });
      }
    } else if (period === 'monthly') {
      for (let m = 5; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
        const rev = paidLeads
          .filter((l) => l.updatedAt.slice(0, 7) === key)
          .reduce((sum, l) => sum + (l.dealAmountUsd || 0), 0);
        const exp = expenses
          .filter((e) => e.date.slice(0, 7) === key)
          .reduce((sum, e) => sum + (e.amountUsd || 0), 0);
        list.push({ label, revenue: rev, expense: exp });
      }
    } else {
      for (let y = 2; y >= 0; y--) {
        const yr = String(now.getFullYear() - y);
        const rev = paidLeads
          .filter((l) => l.updatedAt.slice(0, 4) === yr)
          .reduce((sum, l) => sum + (l.dealAmountUsd || 0), 0);
        const exp = expenses
          .filter((e) => e.date.slice(0, 4) === yr)
          .reduce((sum, e) => sum + (e.amountUsd || 0), 0);
        list.push({ label: yr, revenue: rev, expense: exp });
      }
    }

    const totalRev = list.reduce((s, b) => s + b.revenue, 0);
    const totalExp = list.reduce((s, b) => s + b.expense, 0);
    return { buckets: list, periodRevenue: totalRev, periodExpenses: totalExp };
  }, [period, paidLeads, expenses]);

  const netProfit = periodRevenue - periodExpenses;
  const margin = periodRevenue > 0 ? Math.round((netProfit / periodRevenue) * 100) : 0;
  const maxVal = Math.max(1000, ...buckets.map((b) => Math.max(b.revenue, b.expense)));

  const handleAddExpense = async (e: FormEvent) => {
    e.preventDefault();
    const num = Number(amountUsd);
    if (!title.trim() || !num || num <= 0) return;
    setSaving(true);
    try {
      await createAdminExpense(
        token,
        {
          title,
          category,
          amountUsd: num,
          amountUzs: num * exchangeRate,
          date,
          notes,
        },
        { email: currentUserEmail, role: currentUserRole }
      );
      setTitle('');
      setAmountUsd('');
      setNotes('');
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteAdminExpense(token, id, {
      email: currentUserEmail,
      role: currentUserRole,
    });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Period Selector + Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#0A192F]/12 dark:border-white/10 bg-white dark:bg-[#112240] p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'daily', label: 'Kunlik (7 kun)' },
              { id: 'weekly', label: 'Haftalik (4 hafta)' },
              { id: 'monthly', label: 'Oylik (6 oy)' },
              { id: 'yearly', label: 'Yillik' },
            ] as { id: Period; label: string }[]
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${
                period === p.id
                  ? 'bg-[#C49A45] text-[#0A192F] border-[#C49A45] font-semibold'
                  : 'bg-[#F7F5F0] dark:bg-[#0A192F] text-[#0A192F]/80 dark:text-[#E8DCC4]/85 border-[#0A192F]/12 dark:border-white/10 hover:border-[#C49A45]/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportFinancials(leads, expenses, 'xlsx')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#C49A45]/50 text-xs text-[#9E7823] dark:text-[#C49A45] hover:bg-[#C49A45] hover:text-[#0A192F] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => exportFinancials(leads, expenses, 'csv')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#0A192F]/15 dark:border-white/15 text-xs text-[#0A192F] dark:text-[#E8DCC4] hover:border-[#C49A45] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#0A192F]/12 dark:border-white/10 bg-white dark:bg-[#112240] divide-y sm:divide-y-0 sm:divide-x divide-[#0A192F]/10 dark:divide-white/10">
        <div className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Tushum (To‘lov qilindi)
          </div>
          <div className="font-mono-nums text-2xl font-semibold text-[#9E7823] dark:text-[#C49A45] mt-1.5">
            ${periodRevenue.toLocaleString('en-US')}
          </div>
          <div className="font-mono-nums text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            {(periodRevenue * exchangeRate).toLocaleString('en-US').replace(/,/g, ' ')} UZS
          </div>
        </div>

        <div className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Operatsion xarajatlar
          </div>
          <div className="font-mono-nums text-2xl font-semibold text-[#0A192F] dark:text-[#F8FAFC] mt-1.5">
            ${periodExpenses.toLocaleString('en-US')}
          </div>
          <div className="font-mono-nums text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            {(periodExpenses * exchangeRate).toLocaleString('en-US').replace(/,/g, ' ')} UZS
          </div>
        </div>

        <div className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Sof foyda
          </div>
          <div
            className={`font-mono-nums text-2xl font-semibold mt-1.5 ${
              netProfit >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toLocaleString('en-US')}
          </div>
          <div className="font-mono-nums text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            {(netProfit * exchangeRate).toLocaleString('en-US').replace(/,/g, ' ')} UZS
          </div>
        </div>

        <div className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Rentabellik (Margin)
          </div>
          <div className="font-mono-nums text-2xl font-semibold text-[#0A192F] dark:text-[#F8FAFC] mt-1.5">
            {margin}%
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            {paidLeads.length} ta yopilgan bitim
          </div>
        </div>
      </div>

      {/* Interactive Revenue vs Expenses Chart */}
      <div className="border border-[#0A192F]/12 dark:border-white/10 bg-white dark:bg-[#112240] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-serif-display text-lg font-semibold text-[#0A192F] dark:text-[#F8FAFC]">
              Tushum va Xarajatlar Dinamikasi
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              USD ekvivalentida davriy tahlil
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <span className="inline-flex items-center gap-2 text-[#0A192F] dark:text-[#E8DCC4]">
              <span className="w-3 h-3 bg-[#C49A45] inline-block" />
              Tushum
            </span>
            <span className="inline-flex items-center gap-2 text-[#64748B] dark:text-[#94A3B8]">
              <span className="w-3 h-3 bg-[#94A3B8] dark:bg-[#475569] inline-block" />
              Xarajat
            </span>
          </div>
        </div>

        <div className="h-64 flex items-end gap-4 sm:gap-8 pt-6 pb-2 border-b border-[#0A192F]/10 dark:border-white/10">
          {buckets.map((b, idx) => {
            const revH = Math.round((b.revenue / maxVal) * 180);
            const expH = Math.round((b.expense / maxVal) * 180);
            const isHovered = hoveredBucket === idx;
            return (
              <div
                key={b.label}
                onMouseEnter={() => setHoveredBucket(idx)}
                onMouseLeave={() => setHoveredBucket(null)}
                className="flex-1 flex flex-col items-center justify-end h-full relative"
              >
                {isHovered && (
                  <div className="absolute -top-2 z-10 bg-white dark:bg-[#0A192F] border border-[#C49A45]/50 px-2.5 py-1.5 text-[11px] font-mono-nums whitespace-nowrap">
                    <div className="text-[#9E7823] dark:text-[#C49A45]">
                      +${b.revenue.toLocaleString('en-US')}
                    </div>
                    <div className="text-[#64748B] dark:text-[#94A3B8]">
                      -${b.expense.toLocaleString('en-US')}
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-1.5 w-full justify-center h-[190px]">
                  <div
                    style={{ height: `${Math.max(4, revH)}px` }}
                    className="w-4 sm:w-6 bg-[#C49A45] transition-all duration-150"
                  />
                  <div
                    style={{ height: `${Math.max(4, expH)}px` }}
                    className="w-4 sm:w-6 bg-[#94A3B8] dark:bg-[#475569] transition-all duration-150"
                  />
                </div>
                <div className="text-[11px] font-mono-nums text-[#64748B] dark:text-[#94A3B8] mt-3">
                  {b.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Operational Expense Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {canWrite && (
          <form
            onSubmit={handleAddExpense}
            className="lg:col-span-4 border border-[#0A192F]/12 dark:border-white/10 bg-white dark:bg-[#112240] p-5 space-y-4 text-xs"
          >
            <h3 className="font-serif-display text-lg font-semibold text-[#0A192F] dark:text-[#F8FAFC]">
              Yangi xarajat kiritish
            </h3>

            <div>
              <label className="block text-[#475569] dark:text-[#94A3B8] mb-1">
                Xarajat nomi *
              </label>
              <input
                type="text"
                required
                placeholder="Masalan: Hotel booking Dubai"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3 py-2 text-[#0A192F] dark:text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#475569] dark:text-[#94A3B8] mb-1">Kategoriya</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3 py-2 text-[#0A192F] dark:text-[#F8FAFC]"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#475569] dark:text-[#94A3B8] mb-1">Sana</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3 py-2 text-[#0A192F] dark:text-[#F8FAFC] font-mono-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#475569] dark:text-[#94A3B8] mb-1">
                Summa (USD) *
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="500"
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3 py-2 text-[#0A192F] dark:text-[#F8FAFC] font-mono-nums"
              />
            </div>

            <div>
              <label className="block text-[#475569] dark:text-[#94A3B8] mb-1">Izoh</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3 py-2 text-[#0A192F] dark:text-[#F8FAFC]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-[#C49A45] hover:bg-[#D4AF61] text-[#0A192F] font-semibold uppercase tracking-wider cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {saving ? 'Saqlanmoqda...' : 'Xarajatni saqlash'}
            </button>
          </form>
        )}

        <div
          className={`${
            canWrite ? 'lg:col-span-8' : 'lg:col-span-12'
          } border border-[#0A192F]/12 dark:border-white/10 bg-white dark:bg-[#112240] overflow-x-auto`}
        >
          <div className="p-4 border-b border-[#0A192F]/10 dark:border-white/10">
            <h3 className="font-serif-display text-lg font-semibold text-[#0A192F] dark:text-[#F8FAFC]">
              Xarajatlar jurnali ({expenses.length})
            </h3>
          </div>
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-[#0A192F]/10 dark:border-white/10 text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] bg-[#F7F5F0] dark:bg-[#0A192F]/60">
                <th className="py-3 px-4 font-medium">Sana</th>
                <th className="py-3 px-4 font-medium">Xarajat nomi</th>
                <th className="py-3 px-4 font-medium">Kategoriya</th>
                <th className="py-3 px-4 font-medium text-right">Summa (USD)</th>
                {canWrite && <th className="py-3 px-4 font-medium text-right">Amal</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0A192F]/10 dark:divide-white/10 text-xs">
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={canWrite ? 5 : 4}
                    className="py-10 text-center text-[#64748B] dark:text-[#94A3B8]"
                  >
                    Hozircha xarajatlar kiritilmagan.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#F7F5F0]/70 dark:hover:bg-[#162B4D]/50">
                    <td className="py-3 px-4 font-mono-nums text-[#64748B] dark:text-[#94A3B8]">
                      {exp.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#0A192F] dark:text-[#F8FAFC] font-medium">
                        {exp.title}
                      </div>
                      {exp.notes && (
                        <div className="text-[#64748B] dark:text-[#94A3B8] text-[11px]">
                          {exp.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#9E7823] dark:text-[#C49A45]">{exp.category}</td>
                    <td className="py-3 px-4 text-right font-mono-nums text-[#0A192F] dark:text-[#F8FAFC] font-medium">
                      -${exp.amountUsd.toLocaleString('en-US')}
                    </td>
                    {canWrite && (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 text-[#64748B] dark:text-[#94A3B8] hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
