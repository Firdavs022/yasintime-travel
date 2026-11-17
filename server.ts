import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { EXCHANGE_RATE_UZS, store } from './server/store.ts';
import type { Category, Expense, Lead, TourPackage, UserRole } from './src/types.ts';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'yasintime-travel-luxury-session-secret-2026';

interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  exp: number;
}

interface AuthedRequest extends Request {
  staff?: SessionPayload;
}

function signToken(payload: SessionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const expected = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as SessionPayload;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookies) {
      if (c.startsWith('yt_session=')) {
        return decodeURIComponent(c.slice('yt_session='.length));
      }
    }
  }
  if (typeof req.query.token === 'string' && req.query.token.length > 0) {
    return req.query.token;
  }
  return null;
}

function requireStaff(allowedRoles?: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }
    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for this action' });
    }
    req.staff = payload;
    next();
  };
}

// SSE clients for real-time CRM updates
const sseClients = new Set<Response>();

function broadcastEvent(event: string, data: unknown = {}) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Public bootstrap data
  app.get('/api/public/bootstrap', (_req, res) => {
    const state = store.getState();
    const categories = [...state.categories].sort((a, b) => a.order - b.order);
    const tours = state.tours.filter((t) => t.active);
    res.json({
      categories,
      tours,
      exchangeRateUzs: EXCHANGE_RATE_UZS,
    });
  });

  // Public lead capture (booking / consultation / quick inquiry)
  app.post('/api/leads', (req, res) => {
    const {
      customerName,
      phone,
      email,
      tourId,
      tourTitle,
      travelers,
      preferredDate,
      message,
      source,
    } = req.body || {};

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide your full name.' });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      return res.status(400).json({ error: 'Please provide a valid phone number.' });
    }

    const state = store.getState();
    const matchedTour = tourId ? state.tours.find((t) => t.id === tourId) : undefined;
    const numTravelers = Math.max(1, Math.min(50, Number(travelers) || 1));
    const estimatedUsd = matchedTour ? matchedTour.priceUsd * numTravelers : 0;

    const now = new Date().toISOString();
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: typeof email === 'string' ? email.trim() : '',
      tourId: matchedTour?.id || (typeof tourId === 'string' ? tourId : ''),
      tourTitle: matchedTour?.title.uz || (typeof tourTitle === 'string' ? tourTitle.trim() : ''),
      travelers: numTravelers,
      preferredDate: typeof preferredDate === 'string' ? preferredDate.trim() : '',
      message: typeof message === 'string' ? message.trim() : '',
      status: 'Yangi',
      assignedManager: '',
      notes: '',
      dealAmountUsd: estimatedUsd,
      source:
        source === 'booking' || source === 'consultation' || source === 'quick_inquiry'
          ? source
          : 'consultation',
      createdAt: now,
      updatedAt: now,
    };

    state.leads.unshift(newLead);
    store.logAudit(
      newLead.email || newLead.phone,
      'Public',
      'New Lead Submitted',
      'Lead',
      `${newLead.customerName} (${newLead.phone})${newLead.tourTitle ? ` — ${newLead.tourTitle}` : ''}`
    );

    broadcastEvent('leads_updated', { lead: newLead });
    res.status(201).json({ lead: newLead });
  });

  // Newsletter / Deal alerts subscription
  app.post('/api/newsletter', (req, res) => {
    const { contact, language } = req.body || {};
    if (!contact || typeof contact !== 'string' || contact.trim().length < 4) {
      return res.status(400).json({ error: 'Please enter a valid email or phone number.' });
    }
    const clean = contact.trim();
    const state = store.getState();
    const existing = state.subscribers.find(
      (s) => s.contact.toLowerCase() === clean.toLowerCase()
    );
    if (!existing) {
      state.subscribers.unshift({
        id: `sub-${Date.now()}`,
        contact: clean,
        language: language === 'ru' || language === 'en' || language === 'tj' ? language : 'uz',
        createdAt: new Date().toISOString(),
      });
      store.logAudit(clean, 'Public', 'Newsletter Subscribed', 'Newsletter', clean);
      broadcastEvent('subscribers_updated', {});
    }
    res.status(201).json({ ok: true });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email va parol kiritilishi shart.' });
    }
    const user = store.authenticateStaff(String(email), String(password));
    if (!user) {
      return res.status(401).json({ error: 'Email yoki parol noto‘g‘ri.' });
    }
    const payload: SessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    };
    const token = signToken(payload);
    res.cookie('yt_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });
    store.logAudit(user.email, user.role, 'Signed In', 'Auth', `${user.role} dashboard session`);
    broadcastEvent('audit_updated', {});
    res.json({ user, token });
  });

  // Auth: Current session
  app.get('/api/auth/me', requireStaff(), (req: AuthedRequest, res) => {
    res.json({ user: req.staff });
  });

  // Auth: Logout
  app.post('/api/auth/logout', (req: AuthedRequest, res) => {
    res.clearCookie('yt_session', { path: '/' });
    res.json({ ok: true });
  });

  // Real-time SSE stream for Admin CRM
  app.get('/api/events', requireStaff(), (req: AuthedRequest, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(`event: connected\ndata: ${JSON.stringify({ role: req.staff?.role })}\n\n`);
    sseClients.add(res);
    const keepAlive = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        clearInterval(keepAlive);
      }
    }, 25000);
    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  // Admin Dashboard bootstrap
  app.get('/api/admin/dashboard', requireStaff(), (_req, res) => {
    const state = store.getState();
    res.json({
      categories: [...state.categories].sort((a, b) => a.order - b.order),
      tours: state.tours,
      leads: state.leads,
      expenses: state.expenses,
      staff: store.getPublicStaff(),
      auditLogs: state.auditLogs,
      subscribers: state.subscribers,
      exchangeRateUzs: EXCHANGE_RATE_UZS,
    });
  });

  // CRM Leads: Update
  app.patch(
    '/api/admin/leads/:id',
    requireStaff(['Admin', 'Manager']),
    (req: AuthedRequest, res) => {
      const state = store.getState();
      const lead = state.leads.find((l) => l.id === req.params.id);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });

      const { status, assignedManager, notes, dealAmountUsd } = req.body || {};
      const validStatuses = ['Yangi', 'Aloqada', 'Bron qilindi', 'To‘lov qilindi'];
      if (status && validStatuses.includes(status)) {
        lead.status = status;
      }
      if (typeof assignedManager === 'string') {
        lead.assignedManager = assignedManager;
      }
      if (typeof notes === 'string') {
        lead.notes = notes;
      }
      if (typeof dealAmountUsd === 'number' && !Number.isNaN(dealAmountUsd) && dealAmountUsd >= 0) {
        lead.dealAmountUsd = dealAmountUsd;
      }
      lead.updatedAt = new Date().toISOString();

      store.logAudit(
        req.staff!.email,
        req.staff!.role,
        'Updated Lead',
        'Lead',
        `${lead.customerName}: status=${lead.status}, deal=$${lead.dealAmountUsd}`
      );
      broadcastEvent('leads_updated', { lead });
      broadcastEvent('audit_updated', {});
      res.json({ lead });
    }
  );

  // CRM Leads: Delete
  app.delete(
    '/api/admin/leads/:id',
    requireStaff(['Admin', 'Manager']),
    (req: AuthedRequest, res) => {
      const state = store.getState();
      const idx = state.leads.findIndex((l) => l.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Lead not found' });
      const [removed] = state.leads.splice(idx, 1);
      store.logAudit(
        req.staff!.email,
        req.staff!.role,
        'Deleted Lead',
        'Lead',
        `${removed.customerName} (${removed.phone})`
      );
      broadcastEvent('leads_updated', {});
      broadcastEvent('audit_updated', {});
      res.json({ ok: true });
    }
  );

  // Categories CMS: Create
  app.post(
    '/api/admin/categories',
    requireStaff(['Admin']),
    (req: AuthedRequest, res) => {
      const { slug, name, subtitle } = req.body || {};
      if (!name?.uz || !slug) {
        return res.status(400).json({ error: 'Category slug and Uzbek name are required.' });
      }
      const state = store.getState();
      const category: Category = {
        id: `cat-${Date.now()}`,
        slug: String(slug)
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, '-'),
        name: {
          uz: name.uz,
          ru: name.ru || name.uz,
          en: name.en || name.uz,
          tj: name.tj || name.uz,
        },
        subtitle: {
          uz: subtitle?.uz || '',
          ru: subtitle?.ru || subtitle?.uz || '',
          en: subtitle?.en || subtitle?.uz || '',
          tj: subtitle?.tj || subtitle?.uz || '',
        },
        order: state.categories.length + 1,
      };
      state.categories.push(category);
      store.logAudit(
        req.staff!.email,
        req.staff!.role,
        'Created Category',
        'Category',
        category.name.uz
      );
      broadcastEvent('categories_updated', {});
      broadcastEvent('audit_updated', {});
      res.status(201).json({ category });
    }
  );

  // Categories CMS: Delete
  app.delete(
    '/api/admin/categories/:id',
    requireStaff(['Admin']),
    (req: AuthedRequest, res) => {
      const state = store.getState();
      const idx = state.categories.findIndex((c) => c.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Category not found' });
      const [removed] = state.categories.splice(idx, 1);
      store.logAudit(
        req.staff!.email,
        req.staff!.role,
        'Deleted Category',
        'Category',
        removed.name.uz
      );
      broadcastEvent('categories_updated', {});
      broadcastEvent('audit_updated', {});
      res.json({ ok: true });
    }
  );

  // Tours CMS: Create
  app.post('/api/admin/tours', requireStaff(['Admin']), (req: AuthedRequest, res) => {
    const body = req.body || {};
    if (!body.title?.uz || !body.categoryId) {
      return res.status(400).json({ error: 'Tour title and category are required.' });
    }
    const priceUsd = Math.max(0, Number(body.priceUsd) || 0);
    const priceUzs =
      Number(body.priceUzs) > 0 ? Number(body.priceUzs) : priceUsd * EXCHANGE_RATE_UZS;

    const newTour: TourPackage = {
      id: `tour-${Date.now()}`,
      categoryId: String(body.categoryId),
      title: {
        uz: body.title.uz,
        ru: body.title.ru || body.title.uz,
        en: body.title.en || body.title.uz,
        tj: body.title.tj || body.title.uz,
      },
      destination: {
        uz: body.destination?.uz || 'Dubay, BAA',
        ru: body.destination?.ru || body.destination?.uz || 'Дубай, ОАЭ',
        en: body.destination?.en || body.destination?.uz || 'Dubai, UAE',
        tj: body.destination?.tj || body.destination?.uz || 'Дубай, АМА',
      },
      countryCode: body.countryCode || 'AE',
      priceUsd,
      priceUzs,
      durationDays: Math.max(1, Number(body.durationDays) || 5),
      durationNights: Math.max(0, Number(body.durationNights) ?? 4),
      hotelName: body.hotelName || '5★ Luxury Residence',
      hotelStars: Math.min(5, Math.max(3, Number(body.hotelStars) || 5)),
      includesFlight: Boolean(body.includesFlight ?? true),
      includesTransfer: Boolean(body.includesTransfer ?? true),
      includesInsurance: Boolean(body.includesInsurance ?? true),
      featured: Boolean(body.featured ?? false),
      active: Boolean(body.active ?? true),
      photos:
        Array.isArray(body.photos) && body.photos.length > 0
          ? body.photos.filter((p: unknown) => typeof p === 'string' && p.trim().length > 0)
          : ['/src/assets/images/hero_luxury_dubai_skyline_1794901381860.jpg'],
      summary: {
        uz: body.summary?.uz || '',
        ru: body.summary?.ru || body.summary?.uz || '',
        en: body.summary?.en || body.summary?.uz || '',
        tj: body.summary?.tj || body.summary?.uz || '',
      },
      itinerary: Array.isArray(body.itinerary) ? body.itinerary : [],
      createdAt: new Date().toISOString(),
    };

    const state = store.getState();
    state.tours.unshift(newTour);
    store.logAudit(
      req.staff!.email,
      req.staff!.role,
      'Created Tour Package',
      'Tour',
      `${newTour.title.uz} ($${newTour.priceUsd})`
    );
    broadcastEvent('tours_updated', {});
    broadcastEvent('audit_updated', {});
    res.status(201).json({ tour: newTour });
  });

  // Tours CMS: Update
  app.patch('/api/admin/tours/:id', requireStaff(['Admin']), (req: AuthedRequest, res) => {
    const state = store.getState();
    const idx = state.tours.findIndex((t) => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Tour not found' });

    const existing = state.tours[idx];
    const body = req.body || {};
    const priceUsd =
      body.priceUsd !== undefined ? Math.max(0, Number(body.priceUsd) || 0) : existing.priceUsd;
    const priceUzs =
      body.priceUzs !== undefined && Number(body.priceUzs) > 0
        ? Number(body.priceUzs)
        : body.priceUsd !== undefined
          ? priceUsd * EXCHANGE_RATE_UZS
          : existing.priceUzs;

    const updated: TourPackage = {
      ...existing,
      ...body,
      id: existing.id,
      priceUsd,
      priceUzs,
      photos:
        Array.isArray(body.photos) && body.photos.length > 0
          ? body.photos.filter((p: unknown) => typeof p === 'string' && p.trim().length > 0)
          : existing.photos,
    };

    state.tours[idx] = updated;
    store.logAudit(
      req.staff!.email,
      req.staff!.role,
      'Updated Tour Package',
      'Tour',
      `${updated.title.uz} ($${updated.priceUsd})`
    );
    broadcastEvent('tours_updated', {});
    broadcastEvent('audit_updated', {});
    res.json({ tour: updated });
  });

  // Tours CMS: Delete
  app.delete('/api/admin/tours/:id', requireStaff(['Admin']), (req: AuthedRequest, res) => {
    const state = store.getState();
    const idx = state.tours.findIndex((t) => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Tour not found' });
    const [removed] = state.tours.splice(idx, 1);
    store.logAudit(
      req.staff!.email,
      req.staff!.role,
      'Deleted Tour Package',
      'Tour',
      removed.title.uz
    );
    broadcastEvent('tours_updated', {});
    broadcastEvent('audit_updated', {});
    res.json({ ok: true });
  });

  // Finance: Add Expense
  app.post(
    '/api/admin/expenses',
    requireStaff(['Admin', 'Accountant']),
    (req: AuthedRequest, res) => {
      const { title, category, amountUsd, amountUzs, date, notes } = req.body || {};
      if (!title || !amountUsd) {
        return res.status(400).json({ error: 'Expense title and amount are required.' });
      }
      const usd = Math.max(0, Number(amountUsd) || 0);
      const uzs = Number(amountUzs) > 0 ? Number(amountUzs) : usd * EXCHANGE_RATE_UZS;
      const expense: Expense = {
        id: `exp-${Date.now()}`,
        title: String(title).trim(),
        category: category || 'Other',
        amountUsd: usd,
        amountUzs: uzs,
        date: typeof date === 'string' && date ? date : new Date().toISOString().slice(0, 10),
        notes: typeof notes === 'string' ? notes.trim() : '',
        createdBy: req.staff!.email,
        createdAt: new Date().toISOString(),
      };
      const state = store.getState();
      state.expenses.unshift(expense);
      store.logAudit(
        req.staff!.email,
        req.staff!.role,
        'Logged Expense',
        'Expense',
        `${expense.title} — $${expense.amountUsd}`
      );
      broadcastEvent('finance_updated', {});
      broadcastEvent('audit_updated', {});
      res.status(201).json({ expense });
    }
  );

  // Finance: Delete Expense
  app.delete(
    '/api/admin/expenses/:id',
    requireStaff(['Admin', 'Accountant']),
    (req: AuthedRequest, res) => {
      const state = store.getState();
      const idx = state.expenses.findIndex((e) => e.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Expense not found' });
      const [removed] = state.expenses.splice(idx, 1);
      store.logAudit(
        req.staff!.email,
        req.staff!.role,
        'Deleted Expense',
        'Expense',
        `${removed.title} — $${removed.amountUsd}`
      );
      broadcastEvent('finance_updated', {});
      broadcastEvent('audit_updated', {});
      res.json({ ok: true });
    }
  );

  // Staff RBAC: Create Staff (Admin only)
  app.post('/api/admin/staff', requireStaff(['Admin']), (req: AuthedRequest, res) => {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All staff fields are required.' });
    }
    try {
      const created = store.addStaff({ name, email, password, role });
      store.logAudit(
        req.staff!.email,
        req.staff!.role,
        'Added Staff Member',
        'Staff',
        `${created.email} (${created.role})`
      );
      broadcastEvent('audit_updated', {});
      res.status(201).json({ staff: created });
    } catch (err: unknown) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create staff' });
    }
  });

  // Staff RBAC: Update Role or Active State (Admin only)
  app.patch('/api/admin/staff/:id', requireStaff(['Admin']), (req: AuthedRequest, res) => {
    const state = store.getState();
    const member = state.staff.find((s) => s.id === req.params.id);
    if (!member) return res.status(404).json({ error: 'Staff member not found' });
    const { role, active } = req.body || {};
    if (role === 'Admin' || role === 'Manager' || role === 'Accountant') {
      member.role = role;
    }
    if (typeof active === 'boolean' && member.email !== 'ooo.yasintime@gmail.com') {
      member.active = active;
    }
    store.logAudit(
      req.staff!.email,
      req.staff!.role,
      'Updated Staff Permissions',
      'Staff',
      `${member.email}: role=${member.role}, active=${member.active}`
    );
    broadcastEvent('audit_updated', {});
    const { passwordHash: _ph, salt: _s, ...publicMember } = member;
    res.json({ staff: publicMember });
  });

  // Vite dev middleware or production static build
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YasinTime Travel server listening on http://localhost:${PORT}`);
  });
}

startServer();
