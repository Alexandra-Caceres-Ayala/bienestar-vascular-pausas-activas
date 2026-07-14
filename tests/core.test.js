/* =================================================================
   Tests de la lógica pura (core.js). Sin dependencias externas:
   usa el runner integrado de Node.  Ejecuta:  node --test
   ================================================================= */
const test = require("node:test");
const assert = require("node:assert");
const C = require("../core.js");

/* MODES mínimos (espejo de la app) para probar getPhases */
const MODES = {
  deep: { name: "Trabajo Profundo", phases: [
    { name: "Sentado", icon: "🪑", minutes: 30, recovery: false },
    { name: "De pie", icon: "🧍", minutes: 20, recovery: true },
    { name: "Movimiento", icon: "🚶", minutes: 10, recovery: true }
  ]},
  pomodoro: { name: "Pomodoro", phases: [
    { name: "Enfoque", icon: "🎯", minutes: 25, recovery: false },
    { name: "Descanso", icon: "☕", minutes: 5, recovery: true }
  ]},
  custom: { name: "Mi rutina", phases: [
    { name: "Trabajo", icon: "💻", minutes: 25, recovery: false },
    { name: "Pausa activa", icon: "🧍", minutes: 5, recovery: true }
  ]}
};

/* ---------- inQuietHours ---------- */
test("inQuietHours: desactivado siempre es false", () => {
  assert.equal(C.inQuietHours({ dnd: false, dndFrom: "00:00", dndTo: "23:59" }, at(12, 0)), false);
});
test("inQuietHours: rango nocturno (21:00→08:00)", () => {
  const s = { dnd: true, dndFrom: "21:00", dndTo: "08:00" };
  assert.equal(C.inQuietHours(s, at(23, 30)), true, "23:30 dentro");
  assert.equal(C.inQuietHours(s, at(7, 0)), true, "07:00 dentro");
  assert.equal(C.inQuietHours(s, at(8, 0)), false, "08:00 límite fuera");
  assert.equal(C.inQuietHours(s, at(15, 0)), false, "15:00 fuera");
});
test("inQuietHours: rango mismo día (12:00→14:00)", () => {
  const s = { dnd: true, dndFrom: "12:00", dndTo: "14:00" };
  assert.equal(C.inQuietHours(s, at(13, 0)), true);
  assert.equal(C.inQuietHours(s, at(11, 59)), false);
});
test("inQuietHours: from==to => false", () => {
  assert.equal(C.inQuietHours({ dnd: true, dndFrom: "09:00", dndTo: "09:00" }, at(9, 0)), false);
});

/* ---------- getPhases ---------- */
test("getPhases: sin transiciones devuelve las fases reales", () => {
  const s = { transition: false };
  assert.equal(C.getPhases("deep", s, MODES).length, 3);
  assert.equal(C.getPhases("pomodoro", s, MODES).length, 2);
});
test("getPhases: con transiciones intercala 'Prepárate'", () => {
  const s = { transition: true };
  const ph = C.getPhases("deep", s, MODES);
  assert.equal(ph.length, 6);                       // 3 reales + 3 transiciones
  assert.equal(ph.filter(p => p.transition).length, 3);
  assert.equal(ph[0].name, "Sentado");
  assert.equal(ph[1].name, "Prepárate");
});
test("getPhases: duraciones personalizadas se aplican por índice", () => {
  const s = { transition: false, durations: { deep: [30, 22, 10] } };
  const ph = C.getPhases("deep", s, MODES);
  assert.equal(ph[1].name, "De pie");
  assert.equal(ph[1].minutes, 22);                  // el índice 1 es "De pie"
});
test("getPhases: solo las fases recovery son pausas", () => {
  const s = { transition: false };
  const pausas = C.getPhases("deep", s, MODES).filter(p => p.recovery).map(p => p.name);
  assert.deepEqual(pausas, ["De pie", "Movimiento"]);
});

/* ---------- modeBasePhases (custom) ---------- */
test("modeBasePhases: usa customRoutine si es válida", () => {
  const s = { customRoutine: [{ name: "X", icon: "💻", minutes: 40, recovery: false }] };
  assert.equal(C.modeBasePhases("custom", s, MODES)[0].name, "X");
});
test("modeBasePhases: cae a la rutina de ejemplo si no hay custom", () => {
  assert.equal(C.modeBasePhases("custom", { customRoutine: null }, MODES)[0].name, "Trabajo");
});

/* ---------- sanitizeRoutine ---------- */
test("sanitizeRoutine: recorta y clampa valores", () => {
  const out = C.sanitizeRoutine([{ name: "  ".padEnd(40, "x"), icon: "💻extra", minutes: 999, recovery: 1 }]);
  assert.ok(out[0].name.length <= 24);
  assert.equal(out[0].minutes, 180);                // clamp máximo
  assert.equal(out[0].recovery, true);
});
test("sanitizeRoutine: minutos inválidos => 5", () => {
  assert.equal(C.sanitizeRoutine([{ name: "a", minutes: "xx" }])[0].minutes, 5);
});

/* ---------- remainingMinutes ---------- */
test("remainingMinutes: redondea hacia arriba y mínimo 1", () => {
  const now = 1_000_000;
  assert.equal(C.remainingMinutes({ phaseEndTime: now + 90_000 }, now), 2);   // 1.5 min -> 2
  assert.equal(C.remainingMinutes({ phaseEndTime: now + 10_000 }, now), 1);   // <1 min -> 1
});

/* ---------- applyActivity + racha ---------- */
test("applyActivity: suma minutos y arranca racha", () => {
  const s = C.applyActivity({}, 20, "2026-07-11", "2026-07-10");
  assert.equal(s.days["2026-07-11"].activeMinutes, 20);
  assert.equal(s.days["2026-07-11"].breaks, 1);
  assert.equal(s.streak, 1);
});
test("applyActivity: día consecutivo incrementa la racha", () => {
  const base = { lastActiveDate: "2026-07-10", streak: 3, days: {} };
  const s = C.applyActivity(base, 5, "2026-07-11", "2026-07-10");
  assert.equal(s.streak, 4);
});
test("applyActivity: mismo día no cambia la racha pero acumula minutos", () => {
  let s = C.applyActivity({}, 20, "2026-07-11", "2026-07-10");
  s = C.applyActivity(s, 10, "2026-07-11", "2026-07-10");
  assert.equal(s.days["2026-07-11"].activeMinutes, 30);
  assert.equal(s.days["2026-07-11"].breaks, 2);
  assert.equal(s.streak, 1);
});
test("applyActivity: hueco de días reinicia la racha a 1", () => {
  const base = { lastActiveDate: "2026-07-01", streak: 9, days: {} };
  const s = C.applyActivity(base, 5, "2026-07-11", "2026-07-10");
  assert.equal(s.streak, 1);
});

/* ---------- pruneOldDays / localDateStr ---------- */
test("pruneOldDays: elimina días anteriores al límite", () => {
  const stats = { days: { "2026-05-01": {}, "2026-07-11": {} } };
  C.pruneOldDays(stats, "2026-06-01");
  assert.deepEqual(Object.keys(stats.days), ["2026-07-11"]);
});
test("localDateStr: formato y desplazamiento", () => {
  const base = new Date(2026, 6, 11);               // 11 jul 2026 (mes 0-indexado)
  assert.equal(C.localDateStr(0, base), "2026-07-11");
  assert.equal(C.localDateStr(-1, base), "2026-07-10");
});

/* helper: Date de hoy con hora fija */
function at(hh, mm) { const d = new Date(); d.setHours(hh, mm, 0, 0); return d; }
