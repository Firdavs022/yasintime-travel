import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  ClipboardList,
  LogOut,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminDashboardData, UserRole } from '../../types';
import { AuditAndStaffTab } from './AuditAndStaffTab';
import { FinanceTab } from './FinanceTab';
import { LeadsTab } from './LeadsTab';
import { ToursTab } from './ToursTab';

interface AdminPortalProps {
  onBackToSite: () => void;
}

type AdminTab = 'leads' | 'tours' | 'finance' | 'audit';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const TOKEN_STORAGE_KEY = 'yasintime_admin_token';

export function AdminPortal({ onBackToSite }: AdminPortalProps) {
  const { t } = useTranslation();

  const [token, setToken] = useState<string>(
    () => window.sessionStorage.getItem(TOKEN_STORAGE_KEY) || ''
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('leads');
  const [sseConnected, setSseConnected] = useState(false);

  const fetchDashboard = useCallback(async (authToken: string) => {
    const res = await fetch('/api/admin/dashboard', {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    if (res.ok) {
      const data = (await res.json()) as AdminDashboardData;
      setDashboard(data);
    }
  }, []);

  // Verify existing session on mount
  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setUser(data.user);
            if (data.user.role === 'Accountant') {
              setActiveTab('finance');
            }
            await fetchDashboard(token);
          }
        } else if (active) {
          setUser(null);
        }
      } finally {
        if (active) setAuthChecking(false);
      }
    };
    check();
    return () => {
      active = false;
    };
  }, [token, fetchDashboard]);

  // Real-time SSE listener when logged in
  useEffect(() => {
    if (!user) return;
    const url = token ? `/api/events?token=${encodeURIComponent(token)}` : '/api/events';
    const es = new EventSource(url);

    es.addEventListener('connected', () => setSseConnected(true));
    const handleUpdate = () => {
      fetchDashboard(token);
    };
    es.addEventListener('leads_updated', handleUpdate);
    es.addEventListener('tours_updated', handleUpdate);
    es.addEventListener('categories_updated', handleUpdate);
    es.addEventListener('finance_updated', handleUpdate);
    es.addEventListener('audit_updated', handleUpdate);
    es.onerror = () => setSseConnected(false);

    return () => {
      es.close();
      setSseConnected(false);
    };
  }, [user, token, fetchDashboard]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Kirish rad etildi');
      }
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      if (data.user.role === 'Accountant') {
        setActiveTab('finance');
      } else {
        setActiveTab('leads');
      }
      await fetchDashboard(data.token);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setUser(null);
    setDashboard(null);
  };

  const allowedTabs = useMemo(() => {
    if (!user) return [];
    const list: { id: AdminTab; label: string; icon: typeof ClipboardList }[] = [];
    if (user.role === 'Admin' || user.role === 'Manager') {
      list.push({ id: 'leads', label: t('admin.tabs.leads'), icon: ClipboardList });
      list.push({ id: 'tours', label: t('admin.tabs.tours'), icon: Package });
    }
    if (user.role === 'Admin' || user.role === 'Accountant') {
      list.push({ id: 'finance', label: t('admin.tabs.finance'), icon: BarChart3 });
      list.push({ id: 'audit', label: t('admin.tabs.audit'), icon: ShieldCheck });
    }
    return list;
  }, [user, t]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center text-xs text-[#94A3B8]">
        Loading YasinTime CRM...
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full border border-[#C49A45]/30 bg-[#112240] p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/Group_8_13159e01.png"
                alt="YasinTime Logo"
                className="h-10 w-10 object-contain"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-cinzel text-sm font-semibold tracking-[0.14em] text-[#E8DCC4]">
                  YASIN TIME TRAVEL
                </div>
                <div className="text-[11px] text-[#94A3B8]">CRM & Executive Admin</div>
              </div>
            </div>
          </div>

          <div>
            <h1 className="font-serif-display text-2xl font-semibold text-[#F8FAFC] mb-1">
              {t('admin.signInTitle')}
            </h1>
            <p className="text-xs text-[#94A3B8]">{t('admin.signInSubtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#E8DCC4]/85 mb-1.5">{t('admin.emailLabel')}</label>
              <input
                type="email"
                required
                placeholder="ooo.yasintime@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A192F] border border-white/15 px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
              />
            </div>

            <div>
              <label className="block text-[#E8DCC4]/85 mb-1.5">
                {t('admin.passwordLabel')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A192F] border border-white/15 px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#C49A45]"
              />
            </div>

            {loginError && <p className="text-xs text-red-400">{loginError}</p>}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 bg-[#C49A45] hover:bg-[#D4AF61] text-[#0A192F] font-semibold uppercase tracking-[0.15em] transition-colors cursor-pointer"
            >
              {loggingIn ? '...' : t('admin.signInBtn')}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 flex justify-between items-center">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#C49A45] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('admin.backToSite')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col lg:flex-row">
      {/* Left Sidebar (260px) */}
      <aside className="lg:w-[260px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#081224] flex flex-col justify-between">
        <div>
          <div className="h-16 px-5 border-b border-white/10 flex items-center gap-3">
            <img
              src="/assets/aistudio/Group_8_13159e01.png"
              alt="YasinTime Logo"
              className="h-8 w-8 object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="font-cinzel text-xs font-semibold tracking-[0.12em] text-[#E8DCC4]">
              YASINTIME CRM
            </span>
          </div>

          <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto">
            {allowedTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer text-left border ${
                    isActive
                      ? 'bg-[#112240] text-[#C49A45] border-[#C49A45]/40'
                      : 'text-[#94A3B8] border-transparent hover:text-[#F8FAFC] hover:bg-[#112240]/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-3 hidden lg:block">
          <div className="text-xs">
            <div className="font-medium text-[#F8FAFC] truncate">{user.name}</div>
            <div className="text-[11px] text-[#94A3B8] truncate">{user.email}</div>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#C49A45] mt-1">
              <Briefcase className="w-3 h-3" />
              <span>Role: {user.role}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onBackToSite}
              className="flex items-center gap-2 text-xs text-[#94A3B8] hover:text-[#C49A45] cursor-pointer py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('admin.backToSite')}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 cursor-pointer py-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('admin.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-6 border-b border-white/10 bg-[#0A192F] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <span>YasinTime CRM</span>
            <span>/</span>
            <span className="text-[#F8FAFC] font-medium">
              {allowedTabs.find((x) => x.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="font-mono-nums text-[11px] text-[#94A3B8]">
              {sseConnected ? 'Live Sync' : 'Syncing'}
            </span>
            <button
              type="button"
              onClick={onBackToSite}
              className="lg:hidden text-xs text-[#C49A45] cursor-pointer"
            >
              Website
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="lg:hidden text-xs text-red-400 cursor-pointer"
            >
              {t('admin.logout')}
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {!dashboard ? (
            <div className="text-xs text-[#94A3B8]">Ma’lumotlar yuklanmoqda...</div>
          ) : (
            <>
              {activeTab === 'leads' && (
                <LeadsTab
                  leads={dashboard.leads}
                  staff={dashboard.staff}
                  currentUserRole={user.role}
                  token={token}
                  onRefresh={() => fetchDashboard(token)}
                />
              )}
              {activeTab === 'tours' && (
                <ToursTab
                  categories={dashboard.categories}
                  tours={dashboard.tours}
                  exchangeRate={dashboard.exchangeRateUzs}
                  currentUserRole={user.role}
                  token={token}
                  onRefresh={() => fetchDashboard(token)}
                />
              )}
              {activeTab === 'finance' && (
                <FinanceTab
                  leads={dashboard.leads}
                  expenses={dashboard.expenses}
                  exchangeRate={dashboard.exchangeRateUzs}
                  currentUserRole={user.role}
                  token={token}
                  onRefresh={() => fetchDashboard(token)}
                />
              )}
              {activeTab === 'audit' && (
                <AuditAndStaffTab
                  auditLogs={dashboard.auditLogs}
                  staff={dashboard.staff}
                  currentUserRole={user.role}
                  token={token}
                  onRefresh={() => fetchDashboard(token)}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
