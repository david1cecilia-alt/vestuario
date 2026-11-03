/* Versión de demostración: misma interfaz que src/data.js, pero sin Supabase.
 * Los datos viven en memoria y en el localStorage del navegador. PIN: 1234 */
const KEY = 'vestuario.demo.v1';
const PIN_1234 = '07c6727abd14670667508edd796d07a8faa09dfd979c50e07ab698b1b26c407e';

export const sb = null;
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
export const madridDay = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
export function setErrorHandler() {}
export function setReloadHandler() {}

const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/* ---------- Datos de ejemplo ---------- */
function seed() {
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const start = addDays(today, -84); // unas 12 semanas de historial
  const o = (emoji, label, color) => ({ id: uid(), emoji, label, color });
  const qSalto = { id: uid(), title: 'Sesión de saltos', type: 'normal', active: true, targetPlayerIds: [], createdAt: Date.now(),
    questions: [
      { id: uid(), text: '¿Qué tal el nuevo ejercicio de salto?', style: 'emoji', options: [o('😫', 'Cansado', 'red'), o('😐', 'Normal', 'yellow'), o('🤩', 'Muy útil', 'green')], scale: { steps: 5, minLabel: 'Nada', maxLabel: 'Mucho' } },
      { id: uid(), text: '¿Cuánto te ha costado?', style: 'scale', options: [], scale: { steps: 5, minLabel: 'Nada', maxLabel: 'Mucho' } },
    ] };
  const qRecu = { id: uid(), title: 'Recuperación', type: 'injured', active: true, targetPlayerIds: [], createdAt: Date.now(),
    questions: [
      { id: uid(), text: '¿Qué has trabajado hoy?', style: 'multi', options: [o('🦶', 'Propiocepción', 'blue'), o('💪', 'Fuerza', 'purple'), o('🏃', 'Carrera suave', 'green')], scale: { steps: 5, minLabel: 'Nada', maxLabel: 'Mucho' } },
    ] };

  const teams = [];
  const responses = [];
  const mkTeam = (sport, name, category, players, quizzes) => {
    const t = { id: uid(), sport, name, category, createdAt: start.getTime(), quizzes,
      players: players.map(([n, pos]) => ({ id: uid(), name: n, position: pos, injured: false, injuryMode: false, injury: '', injurySince: null, createdAt: start.getTime() })) };
    teams.push(t); return t;
  };
  const hand = mkTeam('hand', 'Infantil', 'Infantil femenino', [['Carla', 'Portera'], ['Noa', 'Central'], ['Irene', 'Lateral izq.'], ['Marta', 'Extremo'], ['Elena', 'Pivote'], ['Lucía', 'Lateral der.']], [qSalto, qRecu]);
  mkTeam('basket', 'Cadete A', 'Cadete masculino', [['Hugo', 'Base'], ['Mario', 'Escolta'], ['Leo', 'Alero'], ['Dani', 'Ala-pívot'], ['Álex', 'Pívot']],
    [{ ...JSON.parse(JSON.stringify(qSalto)), id: uid() }]);

  // Historial: lunes y miércoles; Marta pasa por una lesión real (modo lesión) e Irene se marcó lesionada unas semanas
  const sessions = [];
  for (let d = new Date(start); d < today; d = addDays(d, 1)) if ([1, 3].includes(d.getDay())) sessions.push(new Date(d));
  const p = (t, n) => t.players.find((x) => x.name === n);
  const marta = p(hand, 'Marta'), irene = p(hand, 'Irene');
  const injStart = sessions[Math.floor(sessions.length * 0.55)];
  marta.injuryMode = true; marta.injured = true; marta.injury = 'Esguince de tobillo'; marta.injurySince = iso(injStart);
  const ireneFrom = sessions[Math.floor(sessions.length * 0.2)], ireneTo = sessions[Math.floor(sessions.length * 0.38)];
  const comments = ['Me duele al apoyar el pie', '', 'Algo mejor que el otro día', '', 'Molestia al girar', '', 'Ya casi no noto nada', ''];

  teams.forEach((t) => t.players.forEach((pl, pi) => {
    let base = 5 + ((pi * 7) % 4);
    sessions.forEach((d, si) => {
      if ((pi * 5 + si * 3) % 11 === 0) return; // ausente
      const k = iso(d), noise = ((pi * 13 + si * 7) % 5) - 2;
      const quiz = t.quizzes.find((q) => q.type === 'normal');
      if (pl === marta && d >= injStart) {
        const j = sessions.filter((x) => x >= injStart).indexOf(d);
        const mood = Math.min(10, 2 + j);
        responses.push({ id: uid(), teamId: t.id, playerId: pl.id, playerName: pl.name, ts: d.getTime() + 70200000, day: k, mood, injured: true, mode: 'injury',
          injury: marta.injury, checklist: { pain: j < 4, warmup: j % 3 !== 1, stretch: j !== 2 }, comment: comments[j % comments.length],
          answers: [{ quizId: qRecu.id, quizTitle: qRecu.title, questionId: qRecu.questions[0].id, question: qRecu.questions[0].text, style: 'multi', value: null, steps: null,
            options: j < 3 ? ['Propiocepción'] : ['Propiocepción', j > 5 ? 'Carrera suave' : 'Fuerza'], colors: j < 3 ? ['blue'] : ['blue', j > 5 ? 'green' : 'purple'] }] });
        return;
      }
      const flagged = pl === irene && d >= ireneFrom && d <= ireneTo;
      const mood = Math.max(1, Math.min(10, Math.round((flagged ? 3 : base) + si * 0.08 + noise * 0.8)));
      const pick = mood <= 4 ? 0 : mood <= 7 ? 1 : 2;
      const answers = si >= sessions.length - 6 && quiz ? [
        { quizId: quiz.id, quizTitle: quiz.title, questionId: quiz.questions[0].id, question: quiz.questions[0].text, style: 'emoji', value: null, steps: null,
          options: [quiz.questions[0].options[pick].label], colors: [quiz.questions[0].options[pick].color] },
        { quizId: quiz.id, quizTitle: quiz.title, questionId: quiz.questions[1].id, question: quiz.questions[1].text, style: 'scale', value: Math.max(1, Math.min(5, 6 - Math.round(mood / 2))), steps: 5, options: [], colors: [] },
      ] : [];
      responses.push({ id: uid(), teamId: t.id, playerId: pl.id, playerName: pl.name, ts: d.getTime() + 70200000, day: k, mood, injured: flagged, mode: 'general', injury: '', checklist: null, comment: '', answers });
    });
  }));
  return { teams, responses, coach: { pinHash: PIN_1234, email: 'demo@vestuario' } };
}

export const store = {
  data: { teams: [], responses: [], coach: { pinHash: PIN_1234, email: 'demo@vestuario' } },
  userId: 'demo',
  offline: false,
  async session() { return { user: { id: 'demo' } }; },
  async signIn() { return { user: { id: 'demo' } }; },
  async signOut() { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); },
  async verifyPassword(pw) { return pw === 'demo'; },
  async load() {
    if (this.data.teams.length) return 'ok';
    try { const raw = localStorage.getItem(KEY); if (raw) this.data = JSON.parse(raw); } catch (e) {}
    if (!this.data.teams.length) { this.data = seed(); this.save(); }
    return 'ok';
  },
  save() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {} },
  cache() { this.save(); },
  teams(sport) { return this.data.teams.filter((t) => t.sport === sport); },
  team(id) { return this.data.teams.find((t) => t.id === id); },
  hasExamples() { return false; },
  clearExamples() {},
  respondedToday(pid) { const d = madridDay(); return this.data.responses.some((r) => r.playerId === pid && r.day === d); },
  addTeam(sport, name, category) { const t = { id: uid(), sport, name, category, players: [], quizzes: [], createdAt: Date.now() }; this.data.teams.push(t); this.save(); return t; },
  removeTeam(id) { this.data.teams = this.data.teams.filter((t) => t.id !== id); this.data.responses = this.data.responses.filter((r) => r.teamId !== id); this.save(); },
  addPlayer(teamId, name, position) { const p = { id: uid(), name, position, injured: false, injuryMode: false, injury: '', injurySince: null, createdAt: Date.now() }; this.team(teamId).players.push(p); this.save(); return p; },
  removePlayer(teamId, pid) { const t = this.team(teamId); t.players = t.players.filter((p) => p.id !== pid); this.save(); },
  setInjuryMode(teamId, pid, on) {
    const p = this.team(teamId).players.find((x) => x.id === pid); if (!p) return;
    Object.assign(p, on ? { injuryMode: true, injured: true } : { injuryMode: false, injured: false, injury: '', injurySince: null }); this.save();
  },
  setPlayerInjury(teamId, pid, text) { const p = this.team(teamId).players.find((x) => x.id === pid); if (!p) return; p.injury = text; p.injurySince = p.injurySince || madridDay(); this.save(); },
  setInjured(teamId, pid, val) { const p = this.team(teamId).players.find((x) => x.id === pid); if (p) { p.injured = val; this.save(); } },
  saveQuiz(teamId, q) { const t = this.team(teamId); const i = t.quizzes.findIndex((x) => x.id === q.id); if (i >= 0) t.quizzes[i] = q; else t.quizzes.push(q); this.save(); },
  removeQuiz(teamId, qid) { const t = this.team(teamId); t.quizzes = t.quizzes.filter((q) => q.id !== qid); this.save(); },
  async setPin(hash) { this.data.coach.pinHash = hash; this.save(); },
  async addResponse(r) {
    if (this.respondedToday(r.playerId)) { const e = new Error('Ya has enviado tu reseña de hoy'); e.code = 'duplicate'; throw e; }
    this.data.responses.push({ ...r, ts: Date.now(), day: madridDay() }); this.save();
  },
};
