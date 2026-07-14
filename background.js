/* =================================================================
   BIENESTAR VASCULAR · background.js  (Service Worker · Manifest V3)
   Mantiene el temporizador vivo (chrome.alarms), avanza fases,
   notifica, suena (campanilla vía offscreen) y guarda estadísticas.
   Toda la persistencia se hace con chrome.storage.local.
   ================================================================= */

// Contenido traducido (modos/fases) para las notificaciones en inglés.
try { importScripts("i18n.js"); } catch (e) { /* si falla, se usa el texto en español */ }

const MODES = {
  deep: {
    name: "Trabajo Profundo",
    phases: [
      { name: "Sentado",    icon: "🪑", minutes: 30, recovery: false, tip: "Mantén la espalda apoyada y los pies planos en el suelo." },
      { name: "De pie",     icon: "🧍", minutes: 20, recovery: true,  tip: "Ponte de pie: activa la circulación de las piernas." },
      { name: "Movimiento", icon: "🚶", minutes: 10, recovery: true,  tip: "Camina y estira. Tu bomba muscular hace circular la sangre." }
    ]
  },
  pomodoro: {
    name: "Pomodoro",
    phases: [
      { name: "Enfoque",  icon: "🎯", minutes: 25, recovery: false, tip: "Concéntrate en una sola tarea, sin distracciones." },
      { name: "Descanso", icon: "☕", minutes: 5,  recovery: true,  tip: "Aparta la vista de la pantalla y muévete un poco." }
    ]
  },
  gaming: {
    name: "Gaming",
    phases: [
      { name: "Partida",          icon: "🕹️", minutes: 45, recovery: false, tip: "¡A jugar! Mantén una postura cómoda y relajada." },
      { name: "Micro-movimiento", icon: "🦶", minutes: 2,  recovery: true,  tip: "Mueve los tobillos en círculos y flexiona los dedos de los pies." }
    ]
  },
  custom: {
    name: "Mi rutina",
    phases: [
      { name: "Trabajo",      icon: "💻", minutes: 25, recovery: false, tip: "Concéntrate en tu tarea." },
      { name: "Pausa activa", icon: "🧍", minutes: 5,  recovery: true,  tip: "Levántate y muévete un poco." }
    ]
  }
};

const PILLS = {
  visual:      { label: "Salud Visual", icon: "👁️", tips: [
    "Regla 20-20-20: cada 20 minutos mira algo a 6 metros durante 20 segundos.",
    "Parpadea a conciencia: frente a la pantalla parpadeamos hasta un 60% menos.",
    "Baja el brillo y activa el modo cálido de tu pantalla al anochecer.",
    "Coloca el monitor a un brazo de distancia, con el borde superior a la altura de los ojos.",
    "Aleja la vista y enfoca un objeto lejano 10 segundos para relajar el cristalino.",
    "Usa luz ambiental suave: evita reflejos y contrastes fuertes en la pantalla.",
    "Agranda un poco el texto para no acercarte ni forzar la vista.",
    "Bebe agua: la sequedad ocular empeora con la deshidratación.",
    "Haz 'palming': cubre los ojos cerrados con las palmas 20 segundos para descansarlos.",
    "Mueve los ojos en círculos lentos y de lado a lado para relajar los músculos oculares.",
    "Evita mirar el móvil a oscuras; enciende una luz suave de fondo.",
    "Limpia la pantalla: el polvo y las huellas obligan a esforzar la vista.",
    "Sitúa el monitor perpendicular a las ventanas para reducir deslumbramientos.",
    "Cada hora, mira por la ventana 30 segundos: la luz natural relaja la vista.",
    "Si notas fatiga visual, cierra los ojos y respira hondo unos segundos.",
    "Sube el contraste del texto para leer sin forzar (letras oscuras sobre fondo claro).",
    "Descansa la vista mirando el horizonte o algo verde unos segundos.",
    "Evita que la pantalla refleje una ventana o lámpara situada detrás de ti.",
    "Reduce el tiempo de pantalla la última hora antes de dormir.",
    "Si usas gafas, mantén los cristales limpios: sucios cansan la vista.",
    "Parpadea diez veces seguidas y lentas para repartir bien la lágrima.",
    "Coloca el móvil a la altura de los ojos para no bajar la cabeza.",
    "Aumenta el tamaño del cursor si lo pierdes de vista a menudo.",
    "Alterna tareas de cerca con miradas a lo lejos cada cierto tiempo.",
    "Activa el modo nocturno del sistema cuando baje la luz del ambiente.",
    "Evita frotarte los ojos; si pican, ciérralos y descansa un momento.",
    "Trabaja con luz repartida, no con un único foco apuntando a la pantalla.",
    "Si ves borroso al final del día, es señal de descansar la vista.",
    "Aparta la mirada de la pantalla mientras piensas la respuesta.",
    "Cada dos horas, asómate a un espacio con más luz natural un momento."
  ]},
  ergonomia:   { label: "Ergonomía", icon: "🦴", tips: [
    "Apoya la zona lumbar en el respaldo y mantén los pies planos en el suelo.",
    "Codos a 90°: el teclado debe quedar a la altura de tus antebrazos.",
    "Evita cruzar las piernas mucho rato: dificulta el retorno venoso.",
    "Alterna la postura cada 30 minutos; el mejor asiento es el que cambias a menudo.",
    "Sitúa la pantalla justo enfrente para no girar el cuello.",
    "Relaja los hombros: bájalos y aléjalos de las orejas conscientemente.",
    "Muñecas rectas al teclear; usa un reposamuñecas si te ayuda.",
    "Mantén el ratón cerca del teclado para no estirar el brazo.",
    "Si puedes, alterna trabajar de pie un rato con el escritorio elevado.",
    "Los pies deben llegar al suelo; si no, usa un reposapiés.",
    "La cabeza pesa: mantenla alineada sobre los hombros, no adelantada.",
    "Ajusta la silla para que las rodillas queden a la altura de las caderas.",
    "Usa auriculares para el teléfono y no inclines el cuello para sujetarlo.",
    "Cada hora, estira la espalda hacia atrás suavemente para descargar la lumbar.",
    "Coloca lo que más usas al alcance para evitar torsiones repetidas.",
    "Apoya bien las plantas de los pies, sin puntas ni talones al aire.",
    "Reparte el peso por igual en ambos glúteos al sentarte.",
    "No encojas los hombros al usar el ratón; deja el brazo relajado.",
    "Regula la silla hasta que los antebrazos queden paralelos al suelo.",
    "Evita sostener el mentón con la mano mucho rato: carga el cuello.",
    "Usa un soporte para el portátil y un teclado externo si trabajas horas.",
    "Levántate para hablar por teléfono y descarga la espalda.",
    "Gira todo el cuerpo, no solo el cuello, para mirar a un lado.",
    "Si puedes, cambia de zona un rato para variar los apoyos del cuerpo.",
    "Estira las manos y abre y cierra los dedos cada cierto tiempo.",
    "Coloca los documentos en un atril a la altura de la pantalla.",
    "No te sientes en el borde de la silla; usa todo el asiento.",
    "Relaja la mandíbula: solemos apretarla al concentrarnos.",
    "Haz rotaciones suaves de hombros hacia atrás varias veces al día.",
    "Ajusta los apoyabrazos para que no te obliguen a encoger los hombros."
  ]},
  circulacion: { label: "Circulación", icon: "🫀", tips: [
    "Haz 10 círculos con cada tobillo: activa la bomba de la pantorrilla.",
    "Ponte de puntillas 15 veces para impulsar la sangre de las piernas al corazón.",
    "Hidrátate: la sangre bien fluida circula mejor por tus venas.",
    "Levántate y camina 2 minutos cada hora para prevenir la estasis venosa.",
    "Al final del día, eleva las piernas contra la pared 5–10 minutos.",
    "Evita estar mucho rato con las piernas cruzadas o colgando.",
    "Contrae y relaja gemelos y glúteos estando sentado para mover la sangre.",
    "Mueve los dedos de los pies dentro del zapato varias veces al día.",
    "Marcha en el sitio 30 segundos para reactivar la circulación.",
    "Estira las pantorrillas apoyando la punta del pie en un escalón.",
    "Si notas las piernas pesadas, camina un poco: el movimiento las alivia.",
    "Usa ropa y calcetines que no aprieten en pantorrilla y tobillo.",
    "Alterna sentarte y ponerte de pie para no frenar el flujo de las piernas.",
    "Respira hondo con el diafragma: también favorece el retorno venoso.",
    "Balancea el peso de un pie a otro mientras esperas de pie.",
    "Sube escaleras en vez del ascensor cuando puedas: activan las piernas.",
    "Estira el cuádriceps de pie llevando el talón hacia el glúteo unos segundos.",
    "Sentado, sube y baja los talones repetidamente (bomba de gemelos).",
    "Da un paseo corto después de comer para activar la circulación.",
    "Evita cruzar los tobillos mucho tiempo debajo de la mesa.",
    "Si notas las piernas cansadas, descansa unos minutos con los pies en alto.",
    "Aprieta y suelta una pelota blanda con el pie para mover el tobillo.",
    "Camina unos pasos de puntillas y luego otros sobre los talones.",
    "Evita el calor directo prolongado sobre las piernas.",
    "Estira detrás de la rodilla llevando la punta del pie hacia ti.",
    "De pie, haz pequeños balanceos de cadera para activar las piernas.",
    "Reparte las pausas: mejor moverte poco y a menudo que mucho de golpe.",
    "Si viajas o estás sentado mucho, mueve tobillos y piernas cada rato.",
    "Termina la ducha con agua templada-fresca en las piernas si te sienta bien.",
    "Muévete a diario y mantén un peso saludable: tu circulación lo agradece."
  ]},
  desconexion: { label: "Desconexión", icon: "🧠", tips: [
    "Respiración 4-7-8: inhala 4s, retén 7s, exhala 8s. Repite 4 veces.",
    "Micro-pausa sin pantallas: mira por la ventana y suelta los hombros.",
    "Marca un final de jornada claro: tu cerebro necesita saber que terminó.",
    "Estira el cuello llevando la oreja al hombro, 20s por lado.",
    "Haz 5 respiraciones lentas por la nariz antes de la siguiente tarea.",
    "Levántate y bebe un vaso de agua sin mirar el móvil.",
    "Nombra 3 cosas que oyes ahora mismo: te ancla al presente.",
    "Cierra los ojos 30 segundos y afloja la mandíbula y la frente.",
    "Piensa caminando un minuto, en vez de sentado.",
    "Apunta en una nota lo que te preocupa para soltarlo de la mente.",
    "Estira los brazos hacia el techo e inspira profundo al levantarte de la silla.",
    "Haz una pausa real a media mañana y a media tarde, sin pantallas.",
    "Sal a que te dé la luz natural unos minutos: regula tu energía.",
    "Baja el ritmo al comer y mastica sin pantallas unos minutos.",
    "Termina el día apuntando una cosa buena que hiciste hoy.",
    "Haz una sola cosa a la vez un rato: reduce la fatiga mental.",
    "Silencia las notificaciones no urgentes mientras te concentras.",
    "Toma 3 respiraciones profundas antes de responder algo que te tensó.",
    "Suelta la mandíbula y baja la lengua del paladar para relajarte.",
    "Cruza un brazo frente al pecho y estíralo 15 segundos por lado.",
    "Mira una foto o recuerdo agradable 20 segundos para bajar el estrés.",
    "Ordena tu mesa un minuto: un espacio despejado calma la mente.",
    "Bebe agua o un té con calma, sin hacer nada más a la vez.",
    "Da las gracias mentalmente por algo pequeño del día.",
    "Haz una pausa de pie mirando por la ventana, sin el móvil.",
    "Estira los dedos y sacude las manos para soltar la tensión.",
    "Pon una música tranquila un par de minutos entre tareas.",
    "Sonríe a propósito unos segundos: relaja la cara y el ánimo.",
    "Camina hasta beber agua y vuelve: micro-pausa de cuerpo y mente.",
    "Antes de dormir, aparta las pantallas y respira lento unos minutos."
  ]}
};

/* ----- Valores por defecto ----- */
const DEFAULT_PROFILE  = { name: "", avatar: "🌱" };
const DEFAULT_SETTINGS = { theme: "light", tips: true, sound: true, volume: 50, soundTip: true, volTip: 50, tipInterval: 60, transition: true, dnd: false, dndFrom: "21:00", dndTo: "08:00", onboarded: false, customRoutine: null, reportDays: 30, reportRef: "", reportNotes: "", durations: {} };

/* ¿Estamos dentro del horario "No molestar"? (soporta rangos que cruzan medianoche) */
function inQuietHours(s, date = new Date()) {
  if (!s || !s.dnd) return false;
  const p = (t, d) => { const [h, m] = String(t || d).split(":").map(Number); return (h || 0) * 60 + (m || 0); };
  const from = p(s.dndFrom, "21:00"), to = p(s.dndTo, "08:00");
  if (from === to) return false;
  const cur = date.getHours() * 60 + date.getMinutes();
  return from < to ? (cur >= from && cur < to) : (cur >= from || cur < to);
}

/* Sonido independiente por tipo: "tip" = píldora, resto = ejercicio */
function soundOnFor(variant, s) {
  if (!s) return true;
  return variant === "tip" ? s.soundTip !== false : s.sound !== false;
}
function volFor(variant, s) {
  const v = variant === "tip" ? (s && s.volTip) : (s && s.volume);
  return (typeof v === "number") ? v : 50;
}
const DEFAULT_STATS    = { lastActiveDate: null, streak: 0, days: {} };
const DEFAULT_TIMER    = { mode: null, phaseIndex: 0, phaseEndTime: null, running: false, paused: false, remainingMs: null };

const ICON = "icons/icon128.png";
const TIP_INTERVAL_MIN = 60;     // valor por defecto si el usuario no ha elegido
const PHASE_ALARM = "phaseEnd";
const TIP_ALARM   = "healthTip";
const BADGE_ALARM = "badgeTick";   // refresca la cuenta atrás del ícono cada minuto

/* =================================================================
   BADGE DEL ÍCONO · muestra los minutos restantes de la fase actual
   (verde = pausa activa · ámbar = trabajo · "II" = en pausa)
   ================================================================= */
async function updateBadge(state) {
  if (!chrome.action) return;
  if (!state) state = (await get(["timerState"])).timerState;
  if (!state || !state.running) {
    await chrome.action.setBadgeText({ text: "" });
    return;
  }
  if (state.paused) {
    await chrome.action.setBadgeText({ text: "II" });
    await chrome.action.setBadgeBackgroundColor({ color: "#928C82" });
    return;
  }
  const { settings } = await get(["settings"]);
  const phases = getPhases(state.mode, settings);
  const phase = phases[state.phaseIndex] || {};
  const remMin = Math.max(1, Math.ceil((state.phaseEndTime - Date.now()) / 60000));
  await chrome.action.setBadgeText({ text: String(remMin) });
  await chrome.action.setBadgeBackgroundColor({ color: phase.recovery ? "#4FB79A" : "#C99A5B" });
}

function startBadgeTicker() { chrome.alarms.create(BADGE_ALARM, { periodInMinutes: 1 }); }
function stopBadgeTicker()  { chrome.alarms.clear(BADGE_ALARM); }

const get = (keys) => chrome.storage.local.get(keys);
const set = (obj)  => chrome.storage.local.set(obj);

const TRANSITION_MIN = 1;   // minutos de la pausa de transición entre fases

/* Micro-fase de "transición" (prepararse). recovery:false -> no suma a las stats. */
function makeTransition(nextName) {
  return {
    name: "Prepárate", icon: "⏳", minutes: TRANSITION_MIN, recovery: false, transition: true,
    tip: `Prepárate para: ${nextName}. Colócate con calma (siéntate o ponte de pie) para el siguiente movimiento.`
  };
}

/* Fases base de un modo. Para "custom" usa la rutina del usuario si es válida. */
function modeBasePhases(mode, s) {
  if (mode === "custom") {
    const r = s && Array.isArray(s.customRoutine) ? s.customRoutine : null;
    if (r && r.length) return r;
    return MODES.custom.phases;
  }
  return MODES[mode].phases;
}

/* Fases de un modo con duraciones efectivas y, si está activada, transición de 1 min */
function getPhases(mode, settings) {
  const base = modeBasePhases(mode, settings);
  const custom = settings && settings.durations && settings.durations[mode];
  const real = base.map((p, i) => ({
    ...p,
    minutes: (custom && custom[i] > 0) ? custom[i] : p.minutes
  }));
  if (settings && settings.transition === false) return real;
  const out = [];
  real.forEach((p, i) => {
    if (i > 0) out.push(makeTransition(p.name));
    out.push(p);
  });
  out.push(makeTransition(real[0].name));
  return out;
}

/* =================================================================
   INSTALACIÓN / ARRANQUE
   ================================================================= */
chrome.runtime.onInstalled.addListener(async () => {
  const data = await get(["profile", "settings", "stats", "timerState"]);
  const patch = {};
  if (!data.profile)    patch.profile    = DEFAULT_PROFILE;
  if (!data.settings)   patch.settings   = DEFAULT_SETTINGS;
  if (!data.stats)      patch.stats      = DEFAULT_STATS;
  if (!data.timerState) patch.timerState = DEFAULT_TIMER;
  if (Object.keys(patch).length) await set(patch);
  await refreshTipAlarm();
  await restoreBadge();
});

chrome.runtime.onStartup.addListener(async () => {
  await refreshTipAlarm();
  await restoreBadge();
});

/* Recupera el estado del badge tras reiniciar el service worker */
async function restoreBadge() {
  const { timerState } = await get(["timerState"]);
  await updateBadge(timerState);
  if (timerState && timerState.running && !timerState.paused) startBadgeTicker();
}

/* =================================================================
   MENSAJES DESDE EL POPUP
   ================================================================= */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.target === "offscreen") return false; // no es para nosotros
  handleMessage(msg).then(sendResponse);
  return true; // respuesta asíncrona
});

async function handleMessage(msg) {
  switch (msg.type) {
    case "start":           return startTimer(msg.mode);
    case "pause":           return pauseTimer();
    case "resume":          return resumeTimer();
    case "skip":            return advancePhase(false); // saltar: no cuenta como completada
    case "stop":            return stopTimer();
    case "getState":        return getTimerState();
    case "endOfDay":        return endOfDay();
    case "settingsChanged": await refreshTipAlarm(); return { ok: true };
    case "testSound":       await playChime(msg.variant || "normal"); return { ok: true };
    default:                return { error: "unknown" };
  }
}

/* =================================================================
   LÓGICA DEL TEMPORIZADOR
   ================================================================= */
async function getTimerState() {
  const { timerState } = await get(["timerState"]);
  return { state: timerState || DEFAULT_TIMER };
}

async function startTimer(mode) {
  if (!MODES[mode]) return { error: "modo inválido" };
  const { settings } = await get(["settings"]);
  const phases = getPhases(mode, settings);
  const phase = phases[0];
  const state = {
    mode,
    phaseIndex: 0,
    phaseEndTime: Date.now() + phase.minutes * 60000,
    running: true,
    paused: false,
    remainingMs: null
  };
  await set({ timerState: state, lastMode: mode });
  await setPhaseAlarm(state);
  await updateBadge(state);
  startBadgeTicker();
  return { state };
}

async function pauseTimer() {
  const { timerState } = await get(["timerState"]);
  if (!timerState || !timerState.running || timerState.paused) return { state: timerState };
  timerState.remainingMs = Math.max(0, timerState.phaseEndTime - Date.now());
  timerState.paused = true;
  timerState.phaseEndTime = null;
  await set({ timerState });
  await chrome.alarms.clear(PHASE_ALARM);
  await updateBadge(timerState);
  stopBadgeTicker();
  return { state: timerState };
}

async function resumeTimer() {
  const { timerState } = await get(["timerState"]);
  if (!timerState || !timerState.running || !timerState.paused) return { state: timerState };
  timerState.phaseEndTime = Date.now() + (timerState.remainingMs ?? 0);
  timerState.paused = false;
  timerState.remainingMs = null;
  await set({ timerState });
  await setPhaseAlarm(timerState);
  await updateBadge(timerState);
  startBadgeTicker();
  return { state: timerState };
}

async function stopTimer() {
  await set({ timerState: { ...DEFAULT_TIMER } });
  await chrome.alarms.clear(PHASE_ALARM);
  await updateBadge({ ...DEFAULT_TIMER });
  stopBadgeTicker();
  return { state: { ...DEFAULT_TIMER } };
}

async function setPhaseAlarm(state) {
  await chrome.alarms.clear(PHASE_ALARM);
  chrome.alarms.create(PHASE_ALARM, { when: state.phaseEndTime });
}

/* Avanza a la siguiente fase (en bucle). record=true => cuenta estadística */
async function advancePhase(record) {
  const data = await get(["timerState", "stats", "settings"]);
  const timerState = data.timerState;
  if (!timerState || !timerState.running) return { state: timerState || DEFAULT_TIMER };

  const mode = timerState.mode;
  const phases = getPhases(mode, data.settings);
  const completed = phases[timerState.phaseIndex];

  if (record && completed.recovery) {
    await recordActivity(completed.minutes, data.stats || DEFAULT_STATS);
  }

  const nextIndex = (timerState.phaseIndex + 1) % phases.length;
  const next = phases[nextIndex];
  const newState = {
    mode,
    phaseIndex: nextIndex,
    phaseEndTime: Date.now() + next.minutes * 60000,
    running: true,
    paused: false,
    remainingMs: null
  };
  await set({ timerState: newState });
  await setPhaseAlarm(newState);
  await updateBadge(newState);
  startBadgeTicker();

  const soft = next.transition || mode === "gaming";   // transición y gaming = aviso suave
  // Traducción para las notificaciones (si el idioma es inglés)
  const lc = (typeof BVI18N !== "undefined" && data.settings) ? BVI18N.content(data.settings.lang) : null;
  const pName = (lc && lc.phaseNames[next.name]) || next.name;
  const mName = (lc && lc.modes[mode]) ? lc.modes[mode].name : MODES[mode].name;
  const pTip  = (lc && lc.phaseTips[next.name]) || next.tip;
  const title = soft
    ? `${next.icon} ${pName}`
    : `${next.icon} ${pName} · ${mName}`;
  await notify(title, pTip, soft ? "soft" : "normal");

  return { state: newState };
}

/* =================================================================
   FIN DE JORNADA
   ================================================================= */
async function endOfDay() {
  await stopTimer();
  const { stats } = await get(["stats"]);
  await recordActivity(5, stats || DEFAULT_STATS); // recompensa por cerrar el día
  return { ok: true };
}

/* =================================================================
   ESTADÍSTICAS
   ================================================================= */
function localDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function recordActivity(minutes, stats) {
  stats = { ...DEFAULT_STATS, ...(stats || {}) };
  stats.days = { ...stats.days };

  const today = localDateStr(0);
  const yesterday = localDateStr(-1);

  const day = stats.days[today] || { activeMinutes: 0, breaks: 0 };
  day.activeMinutes += minutes;
  day.breaks += 1;
  stats.days[today] = day;

  if (stats.lastActiveDate === today) {
    // ya contamos hoy: la racha no cambia
  } else if (stats.lastActiveDate === yesterday) {
    stats.streak += 1;
  } else {
    stats.streak = 1;
  }
  stats.lastActiveDate = today;

  pruneOldDays(stats, 60);
  await set({ stats });
}

function pruneOldDays(stats, keepDays) {
  const limit = localDateStr(-keepDays);
  Object.keys(stats.days).forEach((d) => {
    if (d < limit) delete stats.days[d];
  });
}

/* =================================================================
   CONSEJOS EMERGENTES  (alarma periódica con intervalo configurable)
   ================================================================= */
async function refreshTipAlarm() {
  const { settings } = await get(["settings"]);
  await chrome.alarms.clear(TIP_ALARM);
  if (settings && settings.tips) {
    // Usa el intervalo elegido por el usuario (mínimo de seguridad 1 min)
    const minutes = Math.max(1, Number(settings.tipInterval) || TIP_INTERVAL_MIN);
    chrome.alarms.create(TIP_ALARM, {
      delayInMinutes: minutes,
      periodInMinutes: minutes
    });
  }
}

async function sendRandomTip() {
  const { settings } = await get(["settings"]);
  if (!settings || !settings.tips) return;
  const keys = Object.keys(PILLS);
  const catKey = keys[Math.floor(Math.random() * keys.length)];
  const cat = PILLS[catKey];
  // Traducción del consejo si el idioma es inglés
  const lc = (typeof BVI18N !== "undefined") ? BVI18N.content(settings.lang) : null;
  const locCat = (lc && lc.pills && lc.pills[catKey]) ? lc.pills[catKey] : cat;
  const label = locCat.label || cat.label;
  const tips = locCat.tips || cat.tips;
  const tip = tips[Math.floor(Math.random() * tips.length)];
  await notify(`${cat.icon} ${label}`, tip, "tip");   // sonido distinto (píldora)
  // Suma 1 al contador de ESA categoría (badges por categoría en el popup)
  const { tipBadges } = await get(["tipBadges"]);
  const badges = { ...(tipBadges || {}) };
  badges[catKey] = (badges[catKey] || 0) + 1;
  await set({ tipBadges: badges });
}

/* =================================================================
   NOTIFICACIONES + SONIDO
   ================================================================= */
async function notify(title, message, variant) {
  const { settings } = await get(["settings"]);
  if (inQuietHours(settings)) return;   // "No molestar": ni aviso ni sonido

  chrome.notifications.create("", {
    type: "basic",
    iconUrl: ICON,
    title,
    message,
    silent: true,                          // el sonido lo pone nuestra campanilla
    priority: variant === "soft" ? 0 : 1
  });

  if (soundOnFor(variant, settings)) await playChime(variant);
}

/* =================================================================
   SONIDO vía documento OFFSCREEN (Web Audio)
   El volumen se lee de settings.volume (0–100) y se pasa al offscreen.
   ================================================================= */
let creatingOffscreen = null;

async function ensureOffscreen() {
  if (!chrome.offscreen) return false;
  const has = await chrome.offscreen.hasDocument?.();
  if (has) return true;
  if (creatingOffscreen) { await creatingOffscreen; return true; }
  creatingOffscreen = chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Reproducir una campanilla suave al cambiar de fase o recibir un consejo."
  });
  try {
    await creatingOffscreen;
  } catch (e) {
    console.warn("offscreen:", e && e.message);
  } finally {
    creatingOffscreen = null;
  }
  return true;
}

async function playChime(variant) {
  try {
    const ok = await ensureOffscreen();
    if (!ok) return;
    const { settings } = await get(["settings"]);
    const volume = volFor(variant || "normal", settings || {});
    chrome.runtime.sendMessage({
      target: "offscreen",
      type: "playSound",
      variant: variant || "normal",
      volume
    });
  } catch (e) {
    console.warn("No se pudo reproducir la campanilla:", e);
  }
}

/* =================================================================
   MANEJADOR DE ALARMAS
   ================================================================= */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === PHASE_ALARM) {
    await advancePhase(true);
  } else if (alarm.name === TIP_ALARM) {
    await sendRandomTip();
  } else if (alarm.name === BADGE_ALARM) {
    await updateBadge();
  }
});

/* =================================================================
   ATAJOS DE TECLADO (manifest "commands")
     · toggle-timer: inicia (último modo o "deep") o detiene el temporizador
     · skip-phase:   salta a la siguiente fase ("pausa ya"); si está parado, inicia
   ================================================================= */
chrome.commands.onCommand.addListener(async (command) => {
  const { timerState, lastMode } = await get(["timerState", "lastMode"]);
  const running = timerState && timerState.running;
  if (command === "toggle-timer") {
    if (running) await stopTimer();
    else await startTimer((timerState && timerState.mode) || lastMode || "deep");
  } else if (command === "skip-phase") {
    if (running) await advancePhase(false);
    else await startTimer((timerState && timerState.mode) || lastMode || "deep");
  }
});
