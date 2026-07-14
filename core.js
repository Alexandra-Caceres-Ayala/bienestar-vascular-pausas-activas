/* =================================================================
   BIENESTAR VASCULAR · core.js
   Lógica PURA (sin DOM ni APIs de Chrome) compartida por:
     · popup.js  (web + popup de la extensión) — vía <script src="core.js">
     · Node       — vía require() en los tests (tests/core.test.js)
   Patrón UMD: expone `BVCore` como global en el navegador y module.exports en Node.
   Mantener sincronizado con la copia espejo de background.js.
   ================================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;   // Node
  else root.BVCore = api;                                                       // navegador / SW
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const TRANSITION_MIN = 1;   // minutos de la pausa de transición entre fases

  /* ¿Estamos dentro del horario "No molestar"? (soporta rangos que cruzan medianoche) */
  function inQuietHours(s, date) {
    if (!s || !s.dnd) return false;
    date = date || new Date();
    const p = (t, d) => { const parts = String(t || d).split(":").map(Number); return (parts[0] || 0) * 60 + (parts[1] || 0); };
    const from = p(s.dndFrom, "21:00"), to = p(s.dndTo, "08:00");
    if (from === to) return false;
    const cur = date.getHours() * 60 + date.getMinutes();
    return from < to ? (cur >= from && cur < to) : (cur >= from || cur < to);
  }

  /* Micro-fase de transición ("Prepárate"). recovery:false => no cuenta en estadísticas. */
  function makeTransition(nextName, transitionMin) {
    return {
      name: "Prepárate", icon: "⏳", minutes: transitionMin || TRANSITION_MIN, recovery: false, transition: true,
      tip: `Prepárate para: ${nextName}. Colócate con calma (siéntate o ponte de pie) para el siguiente movimiento.`
    };
  }

  /* Fases base de un modo. Para "custom" usa la rutina del usuario si es válida. */
  function modeBasePhases(mode, s, MODES) {
    if (mode === "custom") {
      const r = (s && Array.isArray(s.customRoutine)) ? s.customRoutine : null;
      if (r && r.length) return r;
      return MODES.custom.phases;
    }
    return MODES[mode].phases;
  }

  /* Fases efectivas (con duraciones personalizadas) y, si procede, transiciones intercaladas. */
  function getPhases(mode, s, MODES, transitionMin) {
    const base = modeBasePhases(mode, s, MODES);
    const custom = s && s.durations && s.durations[mode];
    const real = base.map((p, i) => ({
      ...p,
      minutes: (custom && custom[i] > 0) ? custom[i] : p.minutes
    }));
    if (s && s.transition === false) return real;
    const out = [];
    real.forEach((p, i) => {
      if (i > 0) out.push(makeTransition(p.name, transitionMin));
      out.push(p);
    });
    out.push(makeTransition(real[0].name, transitionMin));
    return out;
  }

  /* Sanea una rutina personalizada antes de guardarla. */
  function sanitizeRoutine(phases) {
    return (phases || []).map((p) => ({
      name: (p.name || "Fase").slice(0, 24),
      icon: (p.icon || "⏱️").slice(0, 8),
      minutes: Math.min(180, Math.max(1, parseInt(p.minutes, 10) || 5)),
      recovery: !!p.recovery,
      tip: p.recovery ? "Es tu pausa: levántate y muévete un poco." : "Momento de concentrarte en tu tarea."
    }));
  }

  /* Minutos restantes de la fase actual (para la cuenta atrás del badge). */
  function remainingMinutes(state, now) {
    if (!state || !state.phaseEndTime) return 0;
    return Math.max(1, Math.ceil((state.phaseEndTime - (now || Date.now())) / 60000));
  }

  /* Aplica una actividad completada a las estadísticas (función pura). */
  function applyActivity(stats, minutes, today, yesterday) {
    stats = { lastActiveDate: null, streak: 0, days: {}, ...(stats || {}) };
    stats.days = { ...stats.days };
    const day = stats.days[today] || { activeMinutes: 0, breaks: 0 };
    day.activeMinutes += minutes;
    day.breaks += 1;
    stats.days[today] = day;
    if (stats.lastActiveDate === today) { /* ya contamos hoy: la racha no cambia */ }
    else if (stats.lastActiveDate === yesterday) stats.streak += 1;
    else stats.streak = 1;
    stats.lastActiveDate = today;
    return stats;
  }

  /* Elimina días anteriores a `limitDate` (YYYY-MM-DD). */
  function pruneOldDays(stats, limitDate) {
    Object.keys(stats.days).forEach((d) => { if (d < limitDate) delete stats.days[d]; });
    return stats;
  }

  /* Fecha local YYYY-MM-DD con desplazamiento en días (base inyectable para tests). */
  function localDateStr(offsetDays, base) {
    const d = base ? new Date(base.getTime()) : new Date();
    d.setDate(d.getDate() + (offsetDays || 0));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return {
    TRANSITION_MIN,
    inQuietHours, makeTransition, modeBasePhases, getPhases,
    sanitizeRoutine, remainingMinutes, applyActivity, pruneOldDays, localDateStr
  };
});
