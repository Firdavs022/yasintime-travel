import { UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { createAdminStaff, updateAdminStaffRole } from '../../services/api';
import type { AuditLog, StaffUser, UserRole } from '../../types';
import { formatDateTime } from '../../utils/format';

interface AuditAndStaffTabProps {
  auditLogs: AuditLog[];
  staff: StaffUser[];
  currentUserEmail: string;
  currentUserRole: UserRole;
  token: string;
  onRefresh: () => void;
}

export function AuditAndStaffTab({
  auditLogs,
  staff,
  currentUserEmail,
  currentUserRole,
  token,
  onRefresh,
}: AuditAndStaffTabProps) {
  const isAdmin = currentUserRole === 'Admin';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Manager');
  const [error, setError] = useState('');

  const handleAddStaff = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createAdminStaff(
        token,
        { name, email, password, role },
        { email: currentUserEmail, role: currentUserRole }
      );
      setName('');
      setEmail('');
      setPassword('');
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add staff');
    }
  };

  const handleRoleChange = async (id: string, nextRole: UserRole) => {
    await updateAdminStaffRole(token, id, nextRole, {
      email: currentUserEmail,
      role: currentUserRole,
    });
    onRefresh();
  };

  return (
    <div className="space-y-8">
      {/* Staff RBAC Management (Admin Only) */}
      {isAdmin && (
        <div className="border border-[#0A192F]/12 dark:border-white/10 bg-white dark:bg-[#112240] p-5 space-y-5">
          <h3 className="font-serif-display text-lg font-semibold text-[#0A192F] dark:text-[#F8FAFC]">
            Xodimlar va Huquqlar (RBAC)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#0A192F]/10 dark:border-white/10 text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  <th className="py-2.5 px-3">Ism</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Rol (RBAC)</th>
                  <th className="py-2.5 px-3">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A192F]/10 dark:divide-white/10">
                {staff.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 px-3 text-[#0A192F] dark:text-[#F8FAFC] font-medium">
                      {m.name}
                    </td>
                    <td className="py-3 px-3 font-mono-nums text-[#475569] dark:text-[#E8DCC4]">
                      {m.email}
                    </td>
                    <td className="py-3 px-3">
                      {m.email === 'ooo.yasintime@gmail.com' ? (
                        <span className="text-[#9E7823] dark:text-[#C49A45] font-semibold">
                          Admin (Owner)
                        </span>
                      ) : (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value as UserRole)}
                          className="bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-2.5 py-1 text-xs text-[#0A192F] dark:text-[#F8FAFC]"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Accountant">Accountant</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={
                          m.active
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-[#64748B] dark:text-[#94A3B8]'
                        }
                      >
                        {m.active ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form
            onSubmit={handleAddStaff}
            className="pt-4 border-t border-[#0A192F]/10 dark:border-white/10 grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs"
          >
            <input
              type="text"
              required
              placeholder="Xodim ismi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3 py-2 text-[#0A192F] dark:text-[#F8FAFC]"
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3 py-2 text-[#0A192F] dark:text-[#F8FAFC]"
            />
            <input
              type="password"
              required
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3 py-2 text-[#0A192F] dark:text-[#F8FAFC]"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-[#F7F5F0] dark:bg-[#0A192F] border border-[#0A192F]/15 dark:border-white/15 px-3 py-2 text-[#0A192F] dark:text-[#F8FAFC]"
            >
              <option value="Manager">Manager</option>
              <option value="Accountant">Accountant</option>
              <option value="Admin">Admin</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#C49A45] text-[#0A192F] font-semibold uppercase tracking-wider cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Qo‘shish
            </button>
          </form>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}

      {/* Audit Log */}
      <div className="border border-[#0A192F]/12 dark:border-white/10 bg-white dark:bg-[#112240] overflow-x-auto">
        <div className="p-4 border-b border-[#0A192F]/10 dark:border-white/10">
          <h3 className="font-serif-display text-lg font-semibold text-[#0A192F] dark:text-[#F8FAFC]">
            Tizim Audit Jurnali ({auditLogs.length})
          </h3>
        </div>
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-[#0A192F]/10 dark:border-white/10 text-[11px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] bg-[#F7F5F0] dark:bg-[#0A192F]/60">
              <th className="py-3 px-4 font-medium">Vaqt</th>
              <th className="py-3 px-4 font-medium">Foydalanuvchi</th>
              <th className="py-3 px-4 font-medium">Rol</th>
              <th className="py-3 px-4 font-medium">Harakat</th>
              <th className="py-3 px-4 font-medium">Tafsilotlar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0A192F]/10 dark:divide-white/10 text-xs">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[#64748B] dark:text-[#94A3B8]">
                  Audit yozuvlari hali mavjud emas.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F5F0]/70 dark:hover:bg-[#162B4D]/50">
                  <td className="py-3 px-4 font-mono-nums text-[#64748B] dark:text-[#94A3B8] whitespace-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="py-3 px-4 text-[#0A192F] dark:text-[#F8FAFC]">
                    {log.actorEmail}
                  </td>
                  <td className="py-3 px-4 text-[#9E7823] dark:text-[#C49A45]">
                    {log.actorRole}
                  </td>
                  <td className="py-3 px-4 text-[#0A192F] dark:text-[#E8DCC4] font-medium">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-[#64748B] dark:text-[#94A3B8]">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
