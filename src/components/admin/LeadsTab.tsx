import { Download, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { deleteAdminLead, updateAdminLead } from '../../services/api';
import type { Lead, LeadStatus, StaffUser, UserRole } from '../../types';
import { exportLeads } from '../../utils/export';
import { formatDateTime } from '../../utils/format';

interface LeadsTabProps {
  leads: Lead[];
  staff: StaffUser[];
  currentUserEmail: string;
  currentUserRole: UserRole;
  token: string;
  onRefresh: () => void;
}

const STATUSES: LeadStatus[] = ['Yangi', 'Aloqada', 'Bron qilindi', 'To‘lov qilindi'];

const STATUS_STYLE: Record<LeadStatus, string> = {
  Yangi:
    'border-[#C49A45]/60 text-[#9E7823] dark:text-[#C49A45] bg-[#C49A45]/10',
  Aloqada:
    'border-sky-600/40 dark:border-sky-400/50 text-sky-700 dark:text-sky-300 bg-sky-500/10',
  'Bron qilindi':
    'border-amber-600/40 dark:border-amber-400/50 text-amber-700 dark:text-amber-300 bg-amber-500/10',
  'To‘lov qilindi':
    'border-emerald-600/40 dark:border-emerald-400/50 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10',
};

export function LeadsTab({
  leads,
  staff,
  currentUserEmail,
  currentUserRole,
  token,
  onRefresh,
}: LeadsTabProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [query, setQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [amountDraft, setAmountDraft] = useState<number>(0);

  const canEdit = currentUserRole === 'Admin' || currentUserRole === 'Manager';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (!q) return true;
      return (
        l.customerName.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        (l.tourTitle || '').toLowerCase().includes(q) ||
        (l.email || '').toLowerCase().includes(q)
      );
    });
  }, [leads, statusFilter, query]);

  const updateLead = async (id: string, patch: Partial<Lead>) => {
    await updateAdminLead(token, id, patch, {
      email: currentUserEmail,
      role: currentUserRole,
    });
    onRefresh();
  };

  const deleteLead = async (id: string) => {
    await deleteAdminLead(token, id, {
      email: currentUserEmail,
      role: currentUserRole,
    });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-[#0A192F]/12 dark:border-white/10 bg-white dark:bg-[#112240] p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
              statusFilter === 'all'
                ? 'bg-[#C49A45] text-[#0A192F] border-[#C49A45] font-semibold'
                : 'bg-[#F7F5F0] dark:bg-[#0A192F] text-[#0A192F]/80 dark:text-[#E8DCC4]/80 border-[#0A192F]/12 dark:border-white/10 hover:border-[#C49A45]/50'
            }`}
          >
            Barchasi ({leads.length})
          </button>
          {STATUSES.map((st) => {
            const count = leads.filter((l) => l.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                  statusFilter === st
                    ? 'bg-[#C49A45] text-[#0A192F] border-[#C49A45] font-semibold'
                    : 'bg-[#F7F5F0] dark:bg-[#0A192F] text-[#0A192F]/80 dark:text-[#E8DCC4]/80 border-[#0A192F]/12 dark:border-white/10 hover:border-[#C49A45]/50'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ism, telefon yoki tur..."
              className="bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 pl-8 pr-3 py-1.5 text-xs text-[#0A192F] dark:text-[#F8FAFC] w-56 focus:outline-none focus:border-[#C49A45]"
            />
          </div>

          <button
            type="button"
            onClick={() => exportLeads(filtered, 'xlsx')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#C49A45]/50 text-xs font-medium text-[#9E7823] dark:text-[#C49A45] hover:bg-[#C49A45] hover:text-[#0A192F] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => exportLeads(filtered, 'csv')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#0A192F]/15 dark:border-white/15 text-xs font-medium text-[#0A192F] dark:text-[#E8DCC4] hover:border-[#C49A45] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="border border-[#0A192F]/12 dark:border-white/10 bg-white dark:bg-[#112240] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[960px]">
          <thead>
            <tr className="border-b border-[#0A192F]/10 dark:border-white/10 text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] bg-[#F7F5F0] dark:bg-[#0A192F]/60">
              <th className="py-3 px-4 font-medium">Mijoz & Aloqa</th>
              <th className="py-3 px-4 font-medium">Sayohat Paketi</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Menejer</th>
              <th className="py-3 px-4 font-medium text-right">Summa (USD)</th>
              <th className="py-3 px-4 font-medium">Izoh & Sana</th>
              {canEdit && <th className="py-3 px-4 font-medium text-right">Amal</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0A192F]/10 dark:divide-white/10 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                  Arizalar topilmadi.
                </td>
              </tr>
            ) : (
              filtered.map((lead) => {
                const isEditing = editingNoteId === lead.id;
                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-[#F7F5F0]/70 dark:hover:bg-[#162B4D]/50 align-top"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#0A192F] dark:text-[#F8FAFC]">
                        {lead.customerName}
                      </div>
                      <div className="font-mono-nums text-[#9E7823] dark:text-[#C49A45] mt-0.5">
                        {lead.phone}
                      </div>
                      {lead.email && (
                        <div className="text-[#64748B] dark:text-[#94A3B8] mt-0.5">{lead.email}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[#0A192F] dark:text-[#F8FAFC] font-medium">
                        {lead.tourTitle || 'Individual Consultation'}
                      </div>
                      <div className="text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-mono-nums">
                        {lead.travelers} kishi
                        {lead.preferredDate ? ` · ${lead.preferredDate}` : ''}
                      </div>
                      {lead.message && (
                        <div className="text-[#475569] dark:text-[#E8DCC4]/75 mt-1 max-w-xs line-clamp-2">
                          “{lead.message}”
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {canEdit ? (
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            updateLead(lead.id, { status: e.target.value as LeadStatus })
                          }
                          className={`border px-2.5 py-1 text-xs font-medium bg-[#F7F5F0] dark:bg-[#0A192F] focus:outline-none cursor-pointer ${
                            STATUS_STYLE[lead.status]
                          }`}
                        >
                          {STATUSES.map((s) => (
                            <option
                              key={s}
                              value={s}
                              className="bg-white dark:bg-[#0A192F] text-[#0A192F] dark:text-[#F8FAFC]"
                            >
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-block border px-2.5 py-1 ${STATUS_STYLE[lead.status]}`}>
                          {lead.status}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {canEdit ? (
                        <select
                          value={lead.assignedManager || ''}
                          onChange={(e) =>
                            updateLead(lead.id, { assignedManager: e.target.value })
                          }
                          className="bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-2.5 py-1 text-xs text-[#0A192F] dark:text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
                        >
                          <option value="">Tayinlanmagan</option>
                          {staff
                            .filter((s) => s.active)
                            .map((s) => (
                              <option key={s.id} value={s.name}>
                                {s.name} ({s.role})
                              </option>
                            ))}
                        </select>
                      ) : (
                        <span className="text-[#0A192F] dark:text-[#E8DCC4]">
                          {lead.assignedManager || 'Tayinlanmagan'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono-nums">
                      {isEditing ? (
                        <input
                          type="number"
                          value={amountDraft}
                          onChange={(e) => setAmountDraft(Number(e.target.value) || 0)}
                          className="w-24 bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#C49A45] px-2 py-1 text-right text-xs text-[#0A192F] dark:text-[#F8FAFC]"
                        />
                      ) : (
                        <span className="text-[#0A192F] dark:text-[#F8FAFC] font-medium">
                          ${lead.dealAmountUsd.toLocaleString('en-US')}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            className="w-full bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#C49A45] p-2 text-xs text-[#0A192F] dark:text-[#F8FAFC]"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                await updateLead(lead.id, {
                                  notes: noteDraft,
                                  dealAmountUsd: amountDraft,
                                });
                                setEditingNoteId(null);
                              }}
                              className="px-2.5 py-1 bg-[#C49A45] text-[#0A192F] font-semibold cursor-pointer"
                            >
                              Saqlash
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="px-2.5 py-1 border border-[#0A192F]/15 dark:border-white/15 text-[#64748B] dark:text-[#94A3B8] cursor-pointer"
                            >
                              Bekor
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-[#475569] dark:text-[#E8DCC4]/85">
                            {lead.notes || (
                              <span className="text-[#64748B] dark:text-[#94A3B8]">Izoh yo‘q</span>
                            )}
                          </div>
                          <div className="font-mono-nums text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                            {formatDateTime(lead.createdAt)}
                          </div>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteId(lead.id);
                                setNoteDraft(lead.notes || '');
                                setAmountDraft(lead.dealAmountUsd || 0);
                              }}
                              className="text-[11px] text-[#9E7823] dark:text-[#C49A45] hover:underline mt-1 cursor-pointer"
                            >
                              Izoh / Summa tahrirlash
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {canEdit && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => deleteLead(lead.id)}
                          className="p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
