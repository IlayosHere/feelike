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

function unauthorizedResponse(): HttpResponse {
  return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
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
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { email, password } = body as { email: string; password: string };

    const existing = Array.from(db.users.values()).find((u) => u.email === email);
    if (existing) {
      return HttpResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    const id = `user-${Date.now()}`;
    const newUser = {
      id,
      email,
      display_name: null,
      passwordHash: password,
    };
    db.users.set(id, newUser);

    return HttpResponse.json({ access_token: id }, { status: 201 });
  }),

  // POST /api/auth/login
  http.post(`${BASE}/api/auth/login`, async ({ request }) => {
    const body: unknown = await request.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      typeof (body as Record<string, unknown>).email !== 'string' ||
      typeof (body as Record<string, unknown>).password !== 'string'
    ) {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { email, password } = body as { email: string; password: string };

    const user = Array.from(db.users.values()).find(
      (u) => u.email === email && u.passwordHash === password,
    );

    if (!user) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    return HttpResponse.json({ access_token: user.id });
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
    });
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
      return HttpResponse.json({ message: 'content is required' }, { status: 400 });
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
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10), 100);
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
      return HttpResponse.json({ message: 'Entry not found' }, { status: 404 });
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
      return HttpResponse.json({ message: 'Entry not found' }, { status: 404 });
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
      return HttpResponse.json({ message: 'Entry not found' }, { status: 404 });
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
