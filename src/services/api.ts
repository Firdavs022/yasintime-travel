import {
  EXCHANGE_RATE_UZS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_EXPENSES,
  INITIAL_LEADS,
  INITIAL_STAFF,
  INITIAL_SUBSCRIBERS,
  INITIAL_TOURS,
} from '../data/seedData';
import type {
  AdminDashboardData,
  Category,
  Expense,
  Language,
  Lead,
  PublicBootstrapData,
  StaffUser,
  TourPackage,
  UserRole,
} from '../types';

const LOCAL_DB_KEY = 'yasintime_local_db_v1';
const LOCAL_PASSWORDS_KEY = 'yasintime_local_pw_v1';

interface LocalDbState extends AdminDashboardData {}

function loadLocalDb(): LocalDbState {
  try {
    const raw = window.localStorage.getItem(LOCAL_DB_KEY);
    if (raw) {
      return JSON.parse(raw) as LocalDbState;
    }
  } catch {
    // ignore
  }
  const initial: LocalDbState = {
    categories: INITIAL_CATEGORIES,
    tours: INITIAL_TOURS,
    leads: INITIAL_LEADS,
    expenses: INITIAL_EXPENSES,
    staff: INITIAL_STAFF,
    auditLogs: INITIAL_AUDIT_LOGS,
    subscribers: INITIAL_SUBSCRIBERS,
    exchangeRateUzs: EXCHANGE_RATE_UZS,
  };
  saveLocalDb(initial);
  return initial;
}

function saveLocalDb(db: LocalDbState): void {
  try {
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
  } catch {
    // ignore
  }
}

function loadLocalPasswords(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(LOCAL_PASSWORDS_KEY);
    if (raw) {
      return JSON.parse(raw) as Record<string, string>;
    }
  } catch {
    // ignore
  }
  const initial: Record<string, string> = {
    'ooo.yasintime@gmail.com': 'yasin4545',
    'malika.manager@yasintime.uz': 'manager2026',
    'aziz.finance@yasintime.uz': 'finance2026',
  };
  window.localStorage.setItem(LOCAL_PASSWORDS_KEY, JSON.stringify(initial));
  return initial;
}

function saveLocalPasswords(map: Record<string, string>): void {
  window.localStorage.setItem(LOCAL_PASSWORDS_KEY, JSON.stringify(map));
}

async function tryApiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; status: number; error?: string; isStaticHost: boolean }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    if (!isJson) {
      return { ok: false, status: res.status, isStaticHost: true };
    }
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, status: res.status, error: data.error, isStaticHost: false };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, isStaticHost: true };
  }
}

function addLocalAudit(
  db: LocalDbState,
  actorEmail: string,
  actorRole: UserRole | 'Public',
  action: string,
  targetType: LocalDbState['auditLogs'][0]['targetType'],
  details: string
) {
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorEmail,
    actorRole,
    action,
    targetType,
    details,
    timestamp: new Date().toISOString(),
  });
}

export async function fetchPublicBootstrap(): Promise<PublicBootstrapData> {
  const remote = await tryApiFetch<PublicBootstrapData>('/api/public/bootstrap');
  if (remote.ok) return remote.data;

  const db = loadLocalDb();
  return {
    categories: [...db.categories].sort((a, b) => a.order - b.order),
    tours: db.tours.filter((t) => t.active),
    exchangeRateUzs: db.exchangeRateUzs,
  };
}

export async function submitPublicLead(payload: {
  customerName: string;
  phone: string;
  email?: string;
  tourId?: string;
  tourTitle?: string;
  travelers: number;
  preferredDate?: string;
  message?: string;
  source: 'booking' | 'consultation' | 'quick_inquiry';
}): Promise<void> {
  const remote = await tryApiFetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (remote.ok) return;
  if (!remote.isStaticHost) {
    throw new Error(remote.error || 'Submission failed');
  }

  const db = loadLocalDb();
  const tour = payload.tourId ? db.tours.find((t) => t.id === payload.tourId) : undefined;
  const now = new Date().toISOString();
  const newLead: Lead = {
    id: `lead-${Date.now()}`,
    customerName: payload.customerName.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || '',
    tourId: tour?.id || payload.tourId || '',
    tourTitle: tour?.title.uz || payload.tourTitle || '',
    travelers: Math.max(1, payload.travelers || 1),
    preferredDate: payload.preferredDate || '',
    message: payload.message || '',
    status: 'Yangi',
    assignedManager: '',
    notes: '',
    dealAmountUsd: tour ? tour.priceUsd * Math.max(1, payload.travelers || 1) : 0,
    source: payload.source,
    createdAt: now,
    updatedAt: now,
  };
  db.leads.unshift(newLead);
  addLocalAudit(
    db,
    newLead.email || newLead.phone,
    'Public',
    'New Lead Submitted',
    'Lead',
    `${newLead.customerName} (${newLead.phone})`
  );
  saveLocalDb(db);
}

export async function subscribeNewsletter(contact: string, language: Language): Promise<void> {
  const remote = await tryApiFetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contact, language }),
  });
  if (remote.ok) return;
  if (!remote.isStaticHost) throw new Error(remote.error || 'Failed');

  const db = loadLocalDb();
  db.subscribers.unshift({
    id: `sub-${Date.now()}`,
    contact: contact.trim(),
    language,
    createdAt: new Date().toISOString(),
  });
  saveLocalDb(db);
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<{ user: StaffUser; token: string; isStatic: boolean }> {
  const remote = await tryApiFetch<{ user: StaffUser; token: string }>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (remote.ok) {
    return { ...remote.data, isStatic: false };
  }
  if (!remote.isStaticHost) {
    throw new Error(remote.error || 'Email yoki parol noto‘g‘ri.');
  }

  const db = loadLocalDb();
  const passwords = loadLocalPasswords();
  const normalized = email.trim().toLowerCase();
  const member = db.staff.find((s) => s.email.toLowerCase() === normalized && s.active);
  if (!member || passwords[normalized] !== password) {
    throw new Error('Email yoki parol noto‘g‘ri.');
  }
  const token = `local:${btoa(JSON.stringify({ id: member.id, email: member.email, name: member.name, role: member.role }))}`;
  addLocalAudit(db, member.email, member.role, 'Signed In', 'Auth', `${member.role} session`);
  saveLocalDb(db);
  return { user: member, token, isStatic: true };
}

export async function verifyAdminSession(
  token: string
): Promise<{ user: StaffUser; isStatic: boolean } | null> {
  if (token.startsWith('local:')) {
    try {
      const parsed = JSON.parse(atob(token.slice(6))) as StaffUser;
      return { user: parsed, isStatic: true };
    } catch {
      return null;
    }
  }
  const remote = await tryApiFetch<{ user: StaffUser }>('/api/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (remote.ok) {
    return { user: remote.data.user, isStatic: false };
  }
  return null;
}

export async function fetchAdminDashboard(token: string): Promise<AdminDashboardData | null> {
  if (token.startsWith('local:')) {
    return loadLocalDb();
  }
  const remote = await tryApiFetch<AdminDashboardData>('/api/admin/dashboard', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (remote.ok) return remote.data;
  if (remote.isStaticHost) return loadLocalDb();
  return null;
}

export async function updateAdminLead(
  token: string,
  id: string,
  patch: Partial<Lead>,
  actor: { email: string; role: UserRole }
): Promise<void> {
  if (!token.startsWith('local:')) {
    const remote = await tryApiFetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    });
    if (remote.ok) return;
    if (!remote.isStaticHost) throw new Error(remote.error);
  }
  const db = loadLocalDb();
  const lead = db.leads.find((l) => l.id === id);
  if (lead) {
    Object.assign(lead, patch, { updatedAt: new Date().toISOString() });
    addLocalAudit(db, actor.email, actor.role, 'Updated Lead', 'Lead', lead.customerName);
    saveLocalDb(db);
  }
}

export async function deleteAdminLead(
  token: string,
  id: string,
  actor: { email: string; role: UserRole }
): Promise<void> {
  if (!token.startsWith('local:')) {
    const remote = await tryApiFetch(`/api/admin/leads/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (remote.ok) return;
    if (!remote.isStaticHost) throw new Error(remote.error);
  }
  const db = loadLocalDb();
  db.leads = db.leads.filter((l) => l.id !== id);
  addLocalAudit(db, actor.email, actor.role, 'Deleted Lead', 'Lead', id);
  saveLocalDb(db);
}

export async function createAdminCategory(
  token: string,
  payload: Omit<Category, 'id' | 'order'>,
  actor: { email: string; role: UserRole }
): Promise<void> {
  if (!token.startsWith('local:')) {
    const remote = await tryApiFetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (remote.ok) return;
    if (!remote.isStaticHost) throw new Error(remote.error);
  }
  const db = loadLocalDb();
  db.categories.push({
    ...payload,
    id: `cat-${Date.now()}`,
    order: db.categories.length + 1,
  });
  addLocalAudit(db, actor.email, actor.role, 'Created Category', 'Category', payload.name.uz);
  saveLocalDb(db);
}

export async function deleteAdminCategory(
  token: string,
  id: string,
  actor: { email: string; role: UserRole }
): Promise<void> {
  if (!token.startsWith('local:')) {
    const remote = await tryApiFetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (remote.ok) return;
    if (!remote.isStaticHost) throw new Error(remote.error);
  }
  const db = loadLocalDb();
  db.categories = db.categories.filter((c) => c.id !== id);
  addLocalAudit(db, actor.email, actor.role, 'Deleted Category', 'Category', id);
  saveLocalDb(db);
}

export async function saveAdminTour(
  token: string,
  editingId: string | null,
  payload: Omit<TourPackage, 'id' | 'createdAt'>,
  actor: { email: string; role: UserRole }
): Promise<void> {
  if (!token.startsWith('local:')) {
    const url = editingId ? `/api/admin/tours/${editingId}` : '/api/admin/tours';
    const method = editingId ? 'PATCH' : 'POST';
    const remote = await tryApiFetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (remote.ok) return;
    if (!remote.isStaticHost) throw new Error(remote.error);
  }
  const db = loadLocalDb();
  if (editingId) {
    const idx = db.tours.findIndex((t) => t.id === editingId);
    if (idx !== -1) {
      db.tours[idx] = { ...db.tours[idx], ...payload };
    }
  } else {
    db.tours.unshift({
      ...payload,
      id: `tour-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
  }
  addLocalAudit(
    db,
    actor.email,
    actor.role,
    editingId ? 'Updated Tour' : 'Created Tour',
    'Tour',
    payload.title.uz
  );
  saveLocalDb(db);
}

export async function deleteAdminTour(
  token: string,
  id: string,
  actor: { email: string; role: UserRole }
): Promise<void> {
  if (!token.startsWith('local:')) {
    const remote = await tryApiFetch(`/api/admin/tours/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (remote.ok) return;
    if (!remote.isStaticHost) throw new Error(remote.error);
  }
  const db = loadLocalDb();
  db.tours = db.tours.filter((t) => t.id !== id);
  addLocalAudit(db, actor.email, actor.role, 'Deleted Tour', 'Tour', id);
  saveLocalDb(db);
}

export async function createAdminExpense(
  token: string,
  payload: Omit<Expense, 'id' | 'createdBy' | 'createdAt'>,
  actor: { email: string; role: UserRole }
): Promise<void> {
  if (!token.startsWith('local:')) {
    const remote = await tryApiFetch('/api/admin/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (remote.ok) return;
    if (!remote.isStaticHost) throw new Error(remote.error);
  }
  const db = loadLocalDb();
  db.expenses.unshift({
    ...payload,
    id: `exp-${Date.now()}`,
    createdBy: actor.email,
    createdAt: new Date().toISOString(),
  });
  addLocalAudit(db, actor.email, actor.role, 'Logged Expense', 'Expense', payload.title);
  saveLocalDb(db);
}

export async function deleteAdminExpense(
  token: string,
  id: string,
  actor: { email: string; role: UserRole }
): Promise<void> {
  if (!token.startsWith('local:')) {
    const remote = await tryApiFetch(`/api/admin/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (remote.ok) return;
    if (!remote.isStaticHost) throw new Error(remote.error);
  }
  const db = loadLocalDb();
  db.expenses = db.expenses.filter((e) => e.id !== id);
  addLocalAudit(db, actor.email, actor.role, 'Deleted Expense', 'Expense', id);
  saveLocalDb(db);
}

export async function createAdminStaff(
  token: string,
  payload: { name: string; email: string; password: string; role: UserRole },
  actor: { email: string; role: UserRole }
): Promise<void> {
  if (!token.startsWith('local:')) {
    const remote = await tryApiFetch('/api/admin/staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (remote.ok) return;
    if (!remote.isStaticHost) throw new Error(remote.error || 'Failed to create staff');
  }
  const db = loadLocalDb();
  const normalized = payload.email.trim().toLowerCase();
  if (db.staff.some((s) => s.email.toLowerCase() === normalized)) {
    throw new Error('Bu email manzili allaqachon ro‘yxatdan o‘tgan');
  }
  db.staff.push({
    id: `staff-${Date.now()}`,
    name: payload.name.trim(),
    email: normalized,
    role: payload.role,
    active: true,
    createdAt: new Date().toISOString(),
  });
  const pw = loadLocalPasswords();
  pw[normalized] = payload.password;
  saveLocalPasswords(pw);
  addLocalAudit(db, actor.email, actor.role, 'Added Staff', 'Staff', normalized);
  saveLocalDb(db);
}

export async function updateAdminStaffRole(
  token: string,
  id: string,
  role: UserRole,
  actor: { email: string; role: UserRole }
): Promise<void> {
  if (!token.startsWith('local:')) {
    const remote = await tryApiFetch(`/api/admin/staff/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    if (remote.ok) return;
    if (!remote.isStaticHost) throw new Error(remote.error);
  }
  const db = loadLocalDb();
  const m = db.staff.find((s) => s.id === id);
  if (m) {
    m.role = role;
    addLocalAudit(db, actor.email, actor.role, 'Updated Staff Role', 'Staff', `${m.email} -> ${role}`);
    saveLocalDb(db);
  }
}
