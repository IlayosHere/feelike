import { http, HttpResponse } from 'msw';
import type { MoodValue } from '@/types/api';
import {
  createEntry,
  db,
  deleteEntry,
  getEntriesForUser,
  getTagsForUser,
  updateEntry,
} from './db';

const BASE = 'http://localhost:8000';

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function extractUserId(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7) || null;
}

function unauthorizedResponse() {
  return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 });
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // POST /api/auth/signup
  http.post(`${BASE}/api/auth/signup`, async ({ request }) => {
    const body: unknown = await request.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      typeof (body as Record<string, unknown>).email !== 'string' ||
      typeof (body as Record<string, unknown>).password !== 'string'
    ) {
      return HttpResponse.json({ detail: 'Invalid request body' }, { status: 400 });
    }

    const { email, password } = body as { email: string; password: string };

    const existing = Array.from(db.users.values()).find((u) => u.email === email.toLowerCase());
    if (existing) {
      return HttpResponse.json({ detail: 'Email already registered' }, { status: 409 });
    }

    const id = `user-${Date.now()}`;
    const newUser = {
      id,
      email: email.toLowerCase(),
      display_name: null,
      created_at: new Date().toISOString(),
      passwordHash: password,
    };
    db.users.set(id, newUser);

    return HttpResponse.json({ access_token: id, token_type: 'bearer' }, { status: 201 });
  }),

  // POST /api/auth/login
  http.post(`${BASE}/api/auth/login`, async ({ request }) => {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const username = params.get('username');
    const password = params.get('password');

    if (!username || !password) {
      return HttpResponse.json({ detail: 'Invalid request body' }, { status: 400 });
    }

    const user = Array.from(db.users.values()).find(
      (u) => u.email === username.toLowerCase() && u.passwordHash === password,
    );

    if (!user) {
      return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
    }

    return HttpResponse.json({ access_token: user.id, token_type: 'bearer' });
  }),

  // GET /api/auth/me
  http.get(`${BASE}/api/auth/me`, ({ request }) => {
    const userId = extractUserId(request);
    if (!userId) return unauthorizedResponse();

    const user = db.users.get(userId);
    if (!user) return unauthorizedResponse();

    return HttpResponse.json({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      created_at: user.created_at ?? new Date().toISOString(),
    });
  }),

  // POST /api/auth/password
  http.post(`${BASE}/api/auth/password`, async ({ request }) => {
    const userId = extractUserId(request);
    if (!userId) return unauthorizedResponse();

    const body = await request.json() as { current_password?: string; new_password?: string };
    const user = db.users.get(userId);
    if (!user || user.passwordHash !== body.current_password) {
      return HttpResponse.json({ detail: 'Invalid password' }, { status: 401 });
    }

    db.users.set(userId, { ...user, passwordHash: body.new_password ?? user.passwordHash });
    return new HttpResponse(null, { status: 204 });
  }),

  // DELETE /api/auth/me
  http.delete(`${BASE}/api/auth/me`, ({ request }) => {
    const userId = extractUserId(request);
    if (!userId) return unauthorizedResponse();

    db.users.delete(userId);
    db.entries.forEach((entry, id) => {
      if (entry.userId === userId) db.entries.delete(id);
    });
    db.tags.forEach((tag, id) => {
      if (tag.userId === userId) db.tags.delete(id);
    });

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /api/entries
  http.post(`${BASE}/api/entries`, async ({ request }) => {
    const userId = extractUserId(request);
    if (!userId) return unauthorizedResponse();

    const body: unknown = await request.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      typeof (body as Record<string, unknown>).content !== 'string'
    ) {
      return HttpResponse.json({ detail: 'content is required' }, { status: 400 });
    }

    const raw = body as {
      content: string;
      mood?: MoodValue;
      tags?: string[];
    };

    const entry = createEntry(userId, {
      content: raw.content,
      mood: raw.mood,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
    });

    return HttpResponse.json(entry, { status: 201 });
  }),

  // GET /api/entries
  http.get(`${BASE}/api/entries`, ({ request }) => {
    const userId = extractUserId(request);
    if (!userId) return unauthorizedResponse();

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 100);
    const cursor = url.searchParams.get('cursor') ?? null;

    const result = getEntriesForUser(userId, limit, cursor);
    return HttpResponse.json(result);
  }),

  // GET /api/entries/:id
  http.get(`${BASE}/api/entries/:id`, ({ request, params }) => {
    const userId = extractUserId(request);
    if (!userId) return unauthorizedResponse();

    const { id } = params as { id: string };
    const entry = db.entries.get(id);

    if (!entry || entry.userId !== userId) {
      return HttpResponse.json({ detail: 'Entry not found' }, { status: 404 });
    }

    const { userId: _uid, ...clean } = entry;
    return HttpResponse.json(clean);
  }),

  // PATCH /api/entries/:id
  http.patch(`${BASE}/api/entries/:id`, async ({ request, params }) => {
    const userId = extractUserId(request);
    if (!userId) return unauthorizedResponse();

    const { id } = params as { id: string };
    const body: unknown = await request.json();

    const data = body as Partial<{
      content: string;
      mood: MoodValue | null;
      tags: string[];
    }>;

    const updated = updateEntry(userId, id, data);
    if (!updated) {
      return HttpResponse.json({ detail: 'Entry not found' }, { status: 404 });
    }

    return HttpResponse.json(updated);
  }),

  // DELETE /api/entries/:id
  http.delete(`${BASE}/api/entries/:id`, ({ request, params }) => {
    const userId = extractUserId(request);
    if (!userId) return unauthorizedResponse();

    const { id } = params as { id: string };
    const deleted = deleteEntry(userId, id);

    if (!deleted) {
      return HttpResponse.json({ detail: 'Entry not found' }, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/tags
  http.get(`${BASE}/api/tags`, ({ request }) => {
    const userId = extractUserId(request);
    if (!userId) return unauthorizedResponse();

    const tags = getTagsForUser(userId);
    return HttpResponse.json(tags);
  }),
];
