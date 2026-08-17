import { serve } from '@hono/node-server';
import Database from 'better-sqlite3';
import { betterAuth } from 'better-auth';
import { getMigrations } from 'better-auth/db/migration';
import { cors } from 'hono/cors';
import { Hono } from 'hono';

const port = Number.parseInt(process.env.PORT || '8080', 10);
const databasePath = process.env.DATABASE_PATH || '/data/nurse-quest.sqlite';
const publicOrigin = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
const trustedOrigins = (process.env.TRUSTED_ORIGINS || `${publicOrigin},http://localhost:3000`).split(',').map(origin => origin.trim()).filter(Boolean);
if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error('BETTER_AUTH_SECRET must be set to a value of at least 32 characters.');
}
const db = new Database(databasePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

const auth = betterAuth({
  database: db,
  baseURL: publicOrigin,
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  advanced: {
    cookiePrefix: 'nurse-quest',
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: 'lax',
      secure: publicOrigin.startsWith('https://'),
    },
  },
});

const { runMigrations } = await getMigrations(auth.options);
await runMigrations();

db.exec(`
  CREATE TABLE IF NOT EXISTS flashcards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    track TEXT NOT NULL CHECK(track IN ('SNLE', 'PNLE', 'USRN')),
    front TEXT NOT NULL CHECK(length(front) BETWEEN 1 AND 500),
    back TEXT NOT NULL CHECK(length(back) BETWEEN 1 AND 500),
    created_at TEXT NOT NULL,
    due_at TEXT NOT NULL,
    interval_days INTEGER NOT NULL CHECK(interval_days >= 0 AND interval_days <= 30),
    review_count INTEGER NOT NULL CHECK(review_count >= 0),
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );
  CREATE INDEX IF NOT EXISTS flashcards_user_updated_idx ON flashcards(user_id, updated_at);

  CREATE TABLE IF NOT EXISTS study_records (
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    correct INTEGER NOT NULL CHECK(correct IN (0, 1)),
    selected INTEGER NOT NULL CHECK(selected BETWEEN 0 AND 3),
    answered_at TEXT NOT NULL,
    alternate INTEGER NOT NULL CHECK(alternate IN (0, 1)),
    confidence TEXT NOT NULL DEFAULT 'unsure' CHECK(confidence IN ('confident', 'unsure', 'guessed')),
    PRIMARY KEY (user_id, question_id)
  );

  CREATE TABLE IF NOT EXISTS players (
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    track TEXT NOT NULL CHECK(track IN ('SNLE', 'PNLE', 'USRN')),
    xp INTEGER NOT NULL CHECK(xp >= 0),
    streak INTEGER NOT NULL CHECK(streak >= 0),
    best_streak INTEGER NOT NULL CHECK(best_streak >= 0),
    correct INTEGER NOT NULL CHECK(correct >= 0),
    unlocked_json TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (user_id, track)
  );

  CREATE TABLE IF NOT EXISTS saved_sessions (
    user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
    payload_json TEXT NOT NULL CHECK(length(payload_json) <= 20000),
    saved_at TEXT NOT NULL
  );
`);

const attempts = new Map();
const rateLimit = (windowMs, maxAttempts) => async (c, next) => {
  const forwarded = c.req.header('x-forwarded-for') || 'unknown';
  const address = forwarded.split(',')[0].trim();
  const key = `${address}:${c.req.path}`;
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter(timestamp => timestamp > now - windowMs);
  if (recent.length >= maxAttempts) return c.json({ error: 'Too many attempts. Please wait and try again.' }, 429, { 'Retry-After': String(Math.ceil(windowMs / 1000)) });
  recent.push(now);
  attempts.set(key, recent);
  await next();
};

const validTrack = value => value === 'SNLE' || value === 'PNLE' || value === 'USRN';
const validString = (value, limit) => typeof value === 'string' && value.length > 0 && value.length <= limit;
const validIso = value => typeof value === 'string' && !Number.isNaN(Date.parse(value));

function validCard(card) {
  return card && validString(card.id, 128) && validTrack(card.track) && validString(card.front, 500) && validString(card.back, 500) && validIso(card.createdAt) && validIso(card.dueAt) && validIso(card.updatedAt) && Number.isInteger(card.intervalDays) && card.intervalDays >= 0 && card.intervalDays <= 30 && Number.isInteger(card.reviewCount) && card.reviewCount >= 0;
}

function snapshot(userId) {
  const cards = db.prepare('SELECT id, track, front, back, created_at AS createdAt, due_at AS dueAt, interval_days AS intervalDays, review_count AS reviewCount, updated_at AS updatedAt FROM flashcards WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at').all(userId);
  const progressRows = db.prepare('SELECT question_id AS questionId, correct, selected, answered_at AS answeredAt, alternate, confidence FROM study_records WHERE user_id = ?').all(userId);
  const playerRows = db.prepare('SELECT track, xp, streak, best_streak AS bestStreak, correct, unlocked_json AS unlockedJson, updated_at AS updatedAt FROM players WHERE user_id = ?').all(userId);
  const session = db.prepare('SELECT payload_json AS payloadJson FROM saved_sessions WHERE user_id = ?').get(userId);
  return {
    flashcards: cards,
    progress: Object.fromEntries(progressRows.map(row => [row.questionId, { correct: Boolean(row.correct), selected: row.selected, answeredAt: row.answeredAt, alternate: Boolean(row.alternate), confidence: row.confidence }])),
    players: Object.fromEntries(playerRows.map(row => [row.track, { xp: row.xp, streak: row.streak, bestStreak: row.bestStreak, correct: row.correct, unlocked: JSON.parse(row.unlockedJson), updatedAt: row.updatedAt }])),
    savedSession: session ? JSON.parse(session.payloadJson) : null,
  };
}

const app = new Hono();
app.use('/api/*', cors({ origin: origin => trustedOrigins.includes(origin) ? origin : '', credentials: true, allowHeaders: ['Content-Type'], allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'] }));
app.get('/health', c => c.json({ status: 'ok' }));
app.use('/api/auth/sign-in/*', rateLimit(15 * 60 * 1000, 10));
app.use('/api/auth/sign-up/*', rateLimit(15 * 60 * 1000, 5));
app.on(['GET', 'POST'], '/api/auth/*', c => auth.handler(c.req.raw));

const requireSession = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: 'Sign in is required.' }, 401);
  c.set('userId', session.user.id);
  await next();
};
app.use('/api/sync', requireSession);
app.use('/api/sync/*', requireSession);

app.get('/api/sync', c => c.json(snapshot(c.get('userId'))));

app.put('/api/sync', async c => {
  const body = await c.req.json().catch(() => null);
  if (!body || !Array.isArray(body.flashcards) || !Array.isArray(body.deletedFlashcardIds) || typeof body.progress !== 'object' || !body.players || typeof body.players !== 'object') return c.json({ error: 'Invalid sync payload.' }, 400);
  if (body.flashcards.length > 5000 || body.deletedFlashcardIds.length > 5000) return c.json({ error: 'Sync payload is too large.' }, 413);
  if (!body.flashcards.every(validCard) || !body.deletedFlashcardIds.every(id => validString(id, 128))) return c.json({ error: 'Invalid flashcard data.' }, 400);
  const userId = c.get('userId');
  const upsertCard = db.prepare(`INSERT INTO flashcards (id, user_id, track, front, back, created_at, due_at, interval_days, review_count, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL) ON CONFLICT(id) DO UPDATE SET track = excluded.track, front = excluded.front, back = excluded.back, due_at = excluded.due_at, interval_days = excluded.interval_days, review_count = excluded.review_count, updated_at = excluded.updated_at, deleted_at = NULL WHERE flashcards.user_id = excluded.user_id AND excluded.updated_at >= flashcards.updated_at`);
  const upsertProgress = db.prepare(`INSERT INTO study_records (user_id, question_id, correct, selected, answered_at, alternate, confidence) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, question_id) DO UPDATE SET correct = excluded.correct, selected = excluded.selected, answered_at = excluded.answered_at, alternate = excluded.alternate, confidence = excluded.confidence WHERE excluded.answered_at >= study_records.answered_at`);
  const upsertPlayer = db.prepare(`INSERT INTO players (user_id, track, xp, streak, best_streak, correct, unlocked_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, track) DO UPDATE SET xp = excluded.xp, streak = excluded.streak, best_streak = excluded.best_streak, correct = excluded.correct, unlocked_json = excluded.unlocked_json, updated_at = excluded.updated_at WHERE excluded.updated_at >= players.updated_at`);
  const saveSession = db.prepare(`INSERT INTO saved_sessions (user_id, payload_json, saved_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET payload_json = excluded.payload_json, saved_at = excluded.saved_at WHERE excluded.saved_at >= saved_sessions.saved_at`);
  const softDelete = db.prepare('UPDATE flashcards SET deleted_at = ?, updated_at = ? WHERE user_id = ? AND id = ?');
  db.transaction(() => {
    for (const card of body.flashcards) upsertCard.run(card.id, userId, card.track, card.front, card.back, card.createdAt, card.dueAt, card.intervalDays, card.reviewCount, card.updatedAt);
    const now = new Date().toISOString();
    for (const id of body.deletedFlashcardIds) softDelete.run(now, now, userId, id);
    for (const [questionId, record] of Object.entries(body.progress)) {
      const confidence = record?.confidence === 'confident' || record?.confidence === 'guessed' || record?.confidence === 'unsure' ? record.confidence : 'unsure';
      if (validString(questionId, 200) && record && typeof record === 'object' && typeof record.correct === 'boolean' && Number.isInteger(record.selected) && record.selected >= 0 && record.selected <= 3 && validIso(record.answeredAt) && typeof record.alternate === 'boolean') upsertProgress.run(userId, questionId, record.correct ? 1 : 0, record.selected, record.answeredAt, record.alternate ? 1 : 0, confidence);
    }
    for (const [track, player] of Object.entries(body.players)) {
      if (validTrack(track) && player && Number.isInteger(player.xp) && Number.isInteger(player.streak) && Number.isInteger(player.bestStreak) && Number.isInteger(player.correct) && Array.isArray(player.unlocked) && player.unlocked.every(id => validString(id, 80)) && validIso(player.updatedAt)) upsertPlayer.run(userId, track, player.xp, player.streak, player.bestStreak, player.correct, JSON.stringify(player.unlocked), player.updatedAt);
    }
    if (body.savedSession && typeof body.savedSession === 'object' && validIso(body.savedSession.savedAt)) saveSession.run(userId, JSON.stringify(body.savedSession), body.savedSession.savedAt);
  })();
  return c.json(snapshot(userId));
});

app.notFound(c => c.json({ error: 'Not found.' }, 404));
serve({ fetch: app.fetch, port }, () => console.log(`nurse-quest-api listening on :${port}`));
