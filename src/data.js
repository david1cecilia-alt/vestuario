/* Capa de datos de Vestuario sobre Supabase.
 * La app trabaja con una copia en memoria (store.data) con la misma forma que el prototipo,
 * y cada cambio se escribe en Supabase. Si una escritura falla, se avisa y se recargan los datos. */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: { schema: 'vestuario' },
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'vestuario.auth' },
});

const CACHE_KEY = 'vestuario.cache.v1';
export const uid = () => crypto.randomUUID();
export const madridDay = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

const toTeam = (r) => ({ id: r.id, sport: r.sport, name: r.name, category: r.category, createdAt: Date.parse(r.created_at), players: [], quizzes: [] });
const toPlayer = (r) => ({ id: r.id, name: r.name, position: r.position, injured: r.injured, createdAt: Date.parse(r.created_at) });
const toQuiz = (r) => ({ id: r.id, title: r.title, type: r.type, active: r.active, targetPlayerIds: r.target_player_ids || [], questions: r.questions || [], createdAt: Date.parse(r.created_at) });
const toResponse = (r) => ({ id: r.id, teamId: r.team_id, playerId: r.player_id, playerName: r.player_name, ts: Date.parse(r.ts), day: r.day, mood: r.mood, injured: r.injured, answers: r.answers || [] });
const quizRow = (teamId, q) => ({ id: q.id, team_id: teamId, title: q.title, type: q.type, active: q.active, target_player_ids: q.targetPlayerIds || [], questions: q.questions });

let onError = (msg) => console.error(msg);
let onReload = () => {};
export function setErrorHandler(fn) { onError = fn; }
export function setReloadHandler(fn) { onReload = fn; }

/* Las escrituras van en fila, una detrás de otra: así un jugador nunca se guarda
 * antes que su equipo aunque se creen casi a la vez. */
let queue = Promise.resolve();
const enqueue = (task) => (queue = queue.then(task, task));

export const store = {
  data: { teams: [], responses: [], coach: { pinHash: null, email: '' } },
  userId: null,
  offline: false,

  /* ---- Sesión ---- */
  async session() { const { data } = await sb.auth.getSession(); return data.session; },
  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  },
  async signOut() {
    await sb.auth.signOut();
    try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
    this.data = { teams: [], responses: [], coach: { pinHash: null, email: '' } };
  },
  async verifyPassword(password) {
    const { error } = await sb.auth.signInWithPassword({ email: this.data.coach.email, password });
    return !error;
  },

  /* ---- Carga completa (los datos de un entrenador son pocos) ---- */
  async load() {
    const s = await this.session();
    this.userId = s?.user?.id || null;
    try {
      const [coach, teams, players, quizzes, responses] = await Promise.all([
        sb.from('coaches').select('user_id,email,pin_hash').maybeSingle(),
        sb.from('teams').select('*').order('created_at'),
        sb.from('players').select('*').order('created_at'),
        sb.from('quizzes').select('*').order('created_at'),
        sb.from('responses').select('*').order('ts'),
      ]);
      const err = [coach, teams, players, quizzes, responses].find((x) => x.error);
      if (err) throw err.error;
      if (!coach.data) return 'not_coach';
      const byId = {};
      const t = teams.data.map((r) => (byId[r.id] = toTeam(r)));
      players.data.forEach((r) => byId[r.team_id]?.players.push(toPlayer(r)));
      quizzes.data.forEach((r) => byId[r.team_id]?.quizzes.push(toQuiz(r)));
      this.data = { teams: t, responses: responses.data.map(toResponse), coach: { pinHash: coach.data.pin_hash, email: coach.data.email } };
      this.offline = false;
      this.cache();
      return 'ok';
    } catch (e) {
      // Sin conexión: usamos la última copia guardada para poder consultar
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) { const c = JSON.parse(raw); if (c.userId === this.userId) { this.data = c.data; this.offline = true; return 'offline'; } }
      } catch (_) {}
      throw e;
    }
  },
  cache() { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ userId: this.userId, data: this.data })); } catch (e) {} },

  run(query, msg) {
    return enqueue(async () => {
      const { error } = await query;
      if (error) {
        onError(msg + (this.offline || !navigator.onLine ? ' (sin conexión)' : ''));
        // Se vuelve a lo que hay de verdad en Supabase y se repinta la pantalla
        await this.load().catch(() => {});
        onReload();
        throw error;
      }
      this.cache();
    });
  },
  save() { this.cache(); },

  /* ---- Lectura ---- */
  teams(sport) { return this.data.teams.filter((t) => t.sport === sport); },
  team(id) { return this.data.teams.find((t) => t.id === id); },
  hasExamples() { return false; },
  clearExamples() {},
  respondedToday(pid) { const d = madridDay(); return this.data.responses.some((r) => r.playerId === pid && (r.day || madridDay(new Date(r.ts))) === d); },

  /* ---- Escritura (copia local inmediata + Supabase) ---- */
  addTeam(sport, name, category) {
    const t = { id: uid(), sport, name, category, players: [], quizzes: [], createdAt: Date.now() };
    this.data.teams.push(t);
    this.run(sb.from('teams').insert({ id: t.id, sport, name, category }), 'No se pudo guardar el equipo').catch(() => {});
    return t;
  },
  removeTeam(id) {
    this.data.teams = this.data.teams.filter((t) => t.id !== id);
    this.data.responses = this.data.responses.filter((r) => r.teamId !== id);
    this.run(sb.from('teams').delete().eq('id', id), 'No se pudo borrar el equipo').catch(() => {});
  },
  addPlayer(teamId, name, position) {
    const t = this.team(teamId);
    const p = { id: uid(), name, position, injured: false, createdAt: Date.now() };
    t.players.push(p);
    this.run(sb.from('players').insert({ id: p.id, team_id: teamId, name, position }), 'No se pudo guardar el jugador').catch(() => {});
    return p;
  },
  removePlayer(teamId, pid) {
    const t = this.team(teamId);
    t.players = t.players.filter((p) => p.id !== pid);
    this.run(sb.from('players').delete().eq('id', pid), 'No se pudo borrar el jugador').catch(() => {});
  },
  setInjured(teamId, pid, val) {
    const p = this.team(teamId).players.find((x) => x.id === pid);
    if (!p) return;
    p.injured = val;
    this.run(sb.from('players').update({ injured: val }).eq('id', pid), 'No se pudo guardar la lesión').catch(() => {});
  },
  saveQuiz(teamId, q) {
    const t = this.team(teamId);
    const i = t.quizzes.findIndex((x) => x.id === q.id);
    if (i >= 0) t.quizzes[i] = q; else t.quizzes.push(q);
    this.run(sb.from('quizzes').upsert(quizRow(teamId, q)), 'No se pudo guardar el cuestionario').catch(() => {});
  },
  removeQuiz(teamId, qid) {
    const t = this.team(teamId);
    t.quizzes = t.quizzes.filter((q) => q.id !== qid);
    this.run(sb.from('quizzes').delete().eq('id', qid), 'No se pudo borrar el cuestionario').catch(() => {});
  },
  async setPin(hash) {
    this.data.coach.pinHash = hash;
    return this.run(sb.from('coaches').update({ pin_hash: hash }).eq('user_id', this.userId), 'No se pudo guardar el PIN');
  },
  /* La reseña se espera: el jugador solo ve "¡Gracias!" si se guardó de verdad */
  addResponse(r) { return enqueue(() => this._addResponse(r)); },
  async _addResponse(r) {
    const { data, error } = await sb.from('responses')
      .insert({ id: r.id, team_id: r.teamId, player_id: r.playerId, player_name: r.playerName, mood: r.mood, injured: r.injured, answers: r.answers })
      .select().single();
    if (error) {
      if (error.code === '23505') { const e = new Error('Ya has enviado tu reseña de hoy'); e.code = 'duplicate'; throw e; }
      const e = new Error(navigator.onLine ? 'No se pudo guardar la reseña. Inténtalo otra vez.' : 'Sin conexión: no se pudo guardar la reseña.');
      throw e;
    }
    this.data.responses.push(toResponse(data));
    this.cache();
  },
};
