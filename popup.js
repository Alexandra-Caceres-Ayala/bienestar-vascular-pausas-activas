/* =================================================================
   BIENESTAR VASCULAR · popup.js
   Interfaz del popup: perfil, temporizador, estadísticas,
   píldoras de salud y ajustes. Todo se guarda en chrome.storage.local.
   La lógica que debe seguir viva con el popup cerrado (temporizador,
   notificaciones y sonido) está en background.js (chrome.alarms).
   ================================================================= */

/* -------------------------------------------------------------
   DATOS DE MODOS  (name/icon/minutes/recovery/tip deben coincidir
   con los de background.js). "desc" es SOLO para el popup: es la
   explicación sencilla que se muestra como tooltip en "Personalizar
   duraciones" (qué controla ese número de minutos).
------------------------------------------------------------- */
const MODES = {
  deep: {
    name: "Trabajo Profundo",
    icon: "🧑‍💻",
    label: "Profundo",
    phases: [
      { name: "Sentado",    icon: "🪑", minutes: 30, recovery: false, tip: "Mantén la espalda apoyada y los pies planos en el suelo.",       desc: "Minutos que trabajas sentad@ antes de la primera pausa." },
      { name: "De pie",     icon: "🧍", minutes: 20, recovery: true,  tip: "Ponte de pie: activa la circulación de las piernas.",            desc: "Minutos trabajando de pie para descansar las piernas." },
      { name: "Movimiento", icon: "🚶", minutes: 10, recovery: true,  tip: "Camina y estira. Tu bomba muscular hace circular la sangre.",    desc: "Minutos para levantarte, caminar y estirar." }
    ]
  },
  pomodoro: {
    name: "Pomodoro",
    icon: "🍅",
    label: "Pomodoro",
    phases: [
      { name: "Enfoque",  icon: "🎯", minutes: 25, recovery: false, tip: "Concéntrate en una sola tarea, sin distracciones.",  desc: "Minutos de concentración sin interrupciones." },
      { name: "Descanso", icon: "☕", minutes: 5,  recovery: true,  tip: "Aparta la vista de la pantalla y muévete un poco.",   desc: "Minutos de pausa corta para despejarte." }
    ]
  },
  gaming: {
    name: "Gaming",
    icon: "🎮",
    label: "Gaming",
    phases: [
      { name: "Partida",          icon: "🕹️", minutes: 45, recovery: false, tip: "¡A jugar! Mantén una postura cómoda y relajada.",                  desc: "Minutos de juego seguido antes del aviso." },
      { name: "Micro-movimiento", icon: "🦶", minutes: 2,  recovery: true,  tip: "Mueve los tobillos en círculos y flexiona los dedos de los pies.", desc: "Pausa breve para mover los tobillos sin dejar de jugar." }
    ]
  },
  custom: {
    name: "Mi rutina",
    icon: "🛠️",
    label: "Mi rutina",
    phases: [
      { name: "Trabajo",      icon: "💻", minutes: 25, recovery: false, tip: "Concéntrate en tu tarea.",    desc: "Minutos de trabajo antes de la pausa." },
      { name: "Pausa activa", icon: "🧍", minutes: 5,  recovery: true,  tip: "Levántate y muévete un poco.", desc: "Pausa para moverte." }
    ]
  }
};

/* -------------------------------------------------------------
   EJERCICIOS GUIADOS por fase de recuperación (qué hacer en la pausa).
   La clave es el `name` de la fase (ver MODES). Movimientos suaves,
   sencillos y sin contraindicaciones; no son consejo médico.
------------------------------------------------------------- */
const EXERCISES = {
  "De pie": [
    "Ponte de pie y estira los brazos hacia el techo (10 s).",
    "Rota los hombros hacia atrás, 8 veces.",
    "Marcha en el sitio levantando las rodillas, 20 pasos.",
    "Alterna tu peso de una pierna a la otra."
  ],
  "Movimiento": [
    "Camina un poco: ve por agua o date una vuelta.",
    "Estira los gemelos con las manos apoyadas en la pared.",
    "Haz círculos de tobillo, 10 con cada pie.",
    "Lleva la oreja al hombro y estira el cuello (a ambos lados)."
  ],
  "Descanso": [
    "Mira un punto lejano 20 s (regla 20-20-20).",
    "Ponte de pie y estira la espalda hacia arriba.",
    "Rota los hombros y abre el pecho.",
    "Bebe un sorbo de agua."
  ],
  "Micro-movimiento": [
    "Círculos de tobillo, 10 en cada sentido.",
    "Flexiona y estira los dedos de los pies.",
    "Encoge y suelta los hombros, 8 veces.",
    "Aprieta y suelta los glúteos, 10 veces."
  ],
  // Genérico: para pausas de rutinas personalizadas sin ejercicios propios
  _default: [
    "Ponte de pie y estira los brazos hacia el techo (10 s).",
    "Rota los hombros y el cuello con suavidad.",
    "Camina o marcha en el sitio 20–30 segundos.",
    "Bebe un sorbo de agua y aparta la vista de la pantalla."
  ]
};

/* -------------------------------------------------------------
   PÍLDORAS DE SALUD  (deben coincidir con las de background.js)
------------------------------------------------------------- */
const PILLS = {
  visual: {
    label: "Salud Visual", icon: "👁️",
    tips: [
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
    ]
  },
  ergonomia: {
    label: "Ergonomía", icon: "🦴",
    tips: [
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
    ]
  },
  circulacion: {
    label: "Circulación", icon: "🫀",
    tips: [
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
    ]
  },
  desconexion: {
    label: "Desconexión", icon: "🧠",
    tips: [
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
    ]
  }
};

/* ----- Valores por defecto ----- */
const DEFAULT_PROFILE  = { name: "", avatar: "🌱" };
const DEFAULT_SETTINGS = { theme: "light", lang: null, tips: true, sound: true, volume: 50, soundTip: true, volTip: 50, tipInterval: 60, transition: true, dnd: false, dndFrom: "21:00", dndTo: "08:00", onboarded: false, customRoutine: null, reportDays: 30, reportRef: "", reportNotes: "", durations: {} };

/* ---------- Idiomas (i18n) ---------- */
let lang = "es";
function t(key) { return BVI18N.t(lang, key); }
function LC() { return BVI18N.content(lang); }   // contenido traducido (o null => español original)
function locPhaseName(name) { const c = LC(); return (c && c.phaseNames[name]) || name; }
function locModeName(key)   { const c = LC(); return (c && c.modes[key]) ? c.modes[key].name  : MODES[key].name; }
function locModeLabel(key)  { const c = LC(); return (c && c.modes[key]) ? c.modes[key].label : MODES[key].label; }
function pillLabel(key) { const c = LC(); return (c && c.pills && c.pills[key]) ? c.pills[key].label : PILLS[key].label; }
function pillTips(key)  { const c = LC(); return (c && c.pills && c.pills[key]) ? c.pills[key].tips  : PILLS[key].tips; }
function applyI18n() {
  document.documentElement.setAttribute("lang", lang);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const val = t(key);
    if (key.endsWith("_html")) el.innerHTML = val; else el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.getAttribute("data-i18n-attr").split(",").forEach((pair) => {
      const [attr, key] = pair.split(":");
      if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
    });
  });
}

/* ¿Estamos dentro del horario "No molestar"? (soporta rangos que cruzan medianoche) */
function inQuietHours(s, date) { return BVCore.inQuietHours(s, date); }   // lógica en core.js (probada)
const DEFAULT_STATS    = { lastActiveDate: null, streak: 0, days: {} };
const DEFAULT_TIMER    = { mode: null, phaseIndex: 0, phaseEndTime: null, running: false, paused: false, remainingMs: null };
const AVATARS = ["🌱","😊","🧘","🎮","💻","🐢","🦊","🐨","🌸","🚀","🐳","⭐"];

/* ----- Estado en memoria del popup ----- */
let profile      = { ...DEFAULT_PROFILE };
let settings     = { ...DEFAULT_SETTINGS };
let timerState   = { ...DEFAULT_TIMER };
let selectedMode = "deep";     // modo elegido cuando NO hay temporizador activo
let selectedCat  = "visual";   // categoría de píldoras seleccionada
let tipBadges    = {};         // consejos sin leer por categoría { visual: n, ... }
let tickInterval = null;       // intervalo local para el conteo visual
let enddayInterval = null;     // intervalo local del overlay Fin de Jornada
let currentStats  = { ...DEFAULT_STATS };  // caché de estadísticas (para el reporte PDF)

/* =================================================================
   ADAPTADOR UNIVERSAL (híbrido Extensión ↔ WebApp/PWA)
   - Si existen las APIs de Chrome (extensión) => se usa la lógica
     ORIGINAL: chrome.storage.local + mensajes al background.js.
   - Si NO existen (navegador web) => se usa window.localStorage,
     la API nativa Notification y un "backend" local que replica el
     temporizador (en la web NO se carga background.js ni offscreen.js).
   La lógica de la extensión queda intacta.
   ================================================================= */
const IS_EXTENSION =
  typeof chrome !== "undefined" &&
  !!chrome.runtime && !!chrome.runtime.id &&
  !!chrome.storage && !!chrome.storage.local;

/* ---- Almacenamiento (extensión: chrome.storage.local · web: localStorage) ---- */
const LS_PREFIX = "bv:";

function webGet(keys) {
  const list = Array.isArray(keys) ? keys : [keys];
  const out = {};
  list.forEach((k) => {
    const raw = localStorage.getItem(LS_PREFIX + k);
    if (raw !== null) { try { out[k] = JSON.parse(raw); } catch (e) { /* ignora */ } }
  });
  return out;
}
function webSet(obj) {
  const changes = {};
  Object.keys(obj).forEach((k) => {
    localStorage.setItem(LS_PREFIX + k, JSON.stringify(obj[k]));
    changes[k] = { newValue: obj[k] };
  });
  // Equivalente a chrome.storage.onChanged dentro de la misma pestaña
  window.dispatchEvent(new CustomEvent("bv-storage", { detail: changes }));
}

const Store = {
  get(keys) {
    if (IS_EXTENSION) return new Promise((res) => chrome.storage.local.get(keys, res));
    return Promise.resolve(webGet(keys));
  },
  set(obj) {
    if (IS_EXTENSION) return new Promise((res) => chrome.storage.local.set(obj, res));
    webSet(obj);
    return Promise.resolve();
  },
  onChanged(cb) {
    if (IS_EXTENSION) { chrome.storage.onChanged.addListener(cb); return; }
    window.addEventListener("bv-storage", (e) => cb(e.detail, "local"));
  }
};

/* ---- Notificaciones (web: API nativa Notification; en extensión notifica el background) ---- */
const Notify = {
  async ensurePermission() {
    if (IS_EXTENSION) return true;
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    try { return (await Notification.requestPermission()) === "granted"; }
    catch (e) { return false; }
  },
  show(title, message, opts = {}) {
    if (IS_EXTENSION) return; // en la extensión ya notifica background.js
    try {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      new Notification(title, { body: message, icon: "icons/icon128.png", silent: !!opts.silent });
    } catch (e) { /* ignora */ }
  }
};

/* ---- Sonido en la WEB (mismo "chime" de cristal que offscreen.js) ---- */
function playChimeWeb(variant, volume) {
  try {
    const vol = (typeof volume === "number" ? volume : 50) / 100;
    if (vol <= 0) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const makeLimiter = () => {   // sube el volumen sin saturar
      const c = ctx.createDynamicsCompressor();
      c.threshold.value = -3; c.knee.value = 6; c.ratio.value = 12;
      c.attack.value = 0.003; c.release.value = 0.12;
      return c;
    };

    // "tip" (píldoras): ding-dong descendente cálido, distinto a la campanilla
    if (variant === "tip") {
      const now = ctx.currentTime;
      const master = ctx.createGain(); master.gain.value = 0.85 * vol;
      const lim = makeLimiter();
      master.connect(lim); lim.connect(ctx.destination);
      const dur = 0.42;
      [{ f: 783.99, t: 0 }, { f: 523.25, t: 0.17 }].forEach((n) => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = "triangle"; osc.frequency.value = n.f;
        const s = now + n.t;
        g.gain.setValueAtTime(0.0001, s);
        g.gain.linearRampToValueAtTime(1, s + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
        osc.connect(g); g.connect(master);
        osc.start(s); osc.stop(s + dur + 0.05);
      });
      setTimeout(() => ctx.close().catch(() => {}), 1300);
      return;
    }

    // "normal"/"soft": campanilla de cristal para cambio de ejercicio / transición
    const now = ctx.currentTime;
    const isSoft = variant === "soft";
    const f0 = isSoft ? 1174.66 : 1318.51;
    const decay = isSoft ? 0.7 : 1.1;
    const base = (isSoft ? 0.5 : 0.95) * vol;
    const master = ctx.createGain();
    master.gain.value = base;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 600;
    const lim = makeLimiter();
    master.connect(hp); hp.connect(lim); lim.connect(ctx.destination);
    [{ mult: 1.0, gain: 1.0 }, { mult: 2.0, gain: 0.55 }, { mult: 2.76, gain: 0.30 }, { mult: 3.76, gain: 0.16 }]
      .forEach((pt) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f0 * pt.mult;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(pt.gain, now + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
        osc.connect(g); g.connect(master);
        osc.start(now); osc.stop(now + decay + 0.05);
      });
    setTimeout(() => ctx.close().catch(() => {}), (decay + 0.3) * 1000);
  } catch (e) { /* ignora */ }
}

/* ---- Backend LOCAL para la web (replica el temporizador de background.js) ---- */
let webPhaseTimeout = null;
let webTipTimer = null;

function webClearPhaseTimeout() { if (webPhaseTimeout) { clearTimeout(webPhaseTimeout); webPhaseTimeout = null; } }
function webSchedulePhaseEnd(endTime) {
  webClearPhaseTimeout();
  webPhaseTimeout = setTimeout(() => webAdvancePhase(true), Math.max(0, endTime - Date.now()));
}

function webNotify(title, message, variant) {
  if (inQuietHours(settings)) return;   // "No molestar": ni aviso ni sonido
  Notify.show(title, message, { silent: true });
  if (soundOnFor(variant)) playChimeWeb(variant, volFor(variant));
}

async function webRecordActivity(minutes, stats) {
  stats = { ...DEFAULT_STATS, ...(stats || {}) };
  stats.days = { ...stats.days };
  const today = localDateStr(0);
  const yesterday = localDateStr(-1);
  const day = stats.days[today] || { activeMinutes: 0, breaks: 0 };
  day.activeMinutes += minutes; day.breaks += 1;
  stats.days[today] = day;
  if (stats.lastActiveDate === today) { /* misma jornada */ }
  else if (stats.lastActiveDate === yesterday) stats.streak += 1;
  else stats.streak = 1;
  stats.lastActiveDate = today;
  const limit = localDateStr(-60);
  Object.keys(stats.days).forEach((dd) => { if (dd < limit) delete stats.days[dd]; });
  await setStorage({ stats });
}

async function webStart(mode) {
  if (!MODES[mode]) return { error: "modo inválido" };
  await Notify.ensurePermission();
  const phase = getPhases(mode)[0];
  const state = { mode, phaseIndex: 0, phaseEndTime: Date.now() + phase.minutes * 60000, running: true, paused: false, remainingMs: null };
  await setStorage({ timerState: state });
  webSchedulePhaseEnd(state.phaseEndTime);
  return { state };
}
async function webPause() {
  const { timerState: ts } = await getStorage(["timerState"]);
  if (!ts || !ts.running || ts.paused) return { state: ts };
  ts.remainingMs = Math.max(0, ts.phaseEndTime - Date.now());
  ts.paused = true; ts.phaseEndTime = null;
  await setStorage({ timerState: ts });
  webClearPhaseTimeout();
  return { state: ts };
}
async function webResume() {
  const { timerState: ts } = await getStorage(["timerState"]);
  if (!ts || !ts.running || !ts.paused) return { state: ts };
  ts.phaseEndTime = Date.now() + (ts.remainingMs ?? 0);
  ts.paused = false; ts.remainingMs = null;
  await setStorage({ timerState: ts });
  webSchedulePhaseEnd(ts.phaseEndTime);
  return { state: ts };
}
async function webStop() {
  await setStorage({ timerState: { ...DEFAULT_TIMER } });
  webClearPhaseTimeout();
  return { state: { ...DEFAULT_TIMER } };
}
async function webAdvancePhase(record) {
  const data = await getStorage(["timerState", "stats"]);
  const ts = data.timerState;
  if (!ts || !ts.running) return { state: ts || DEFAULT_TIMER };
  const mode = ts.mode;
  const phases = getPhases(mode);
  const completed = phases[ts.phaseIndex];
  if (record && completed.recovery) await webRecordActivity(completed.minutes, data.stats || DEFAULT_STATS);
  const nextIndex = (ts.phaseIndex + 1) % phases.length;
  const next = phases[nextIndex];
  const newState = { mode, phaseIndex: nextIndex, phaseEndTime: Date.now() + next.minutes * 60000, running: true, paused: false, remainingMs: null };
  await setStorage({ timerState: newState });
  webSchedulePhaseEnd(newState.phaseEndTime);
  const soft = next.transition || mode === "gaming";   // transición y gaming = aviso suave
  const title = soft ? `${next.icon} ${next.name}` : `${next.icon} ${next.name} · ${MODES[mode].name}`;
  webNotify(title, next.tip, soft ? "soft" : "normal");
  return { state: newState };
}
async function webEndOfDay() {
  await webStop();
  const { stats } = await getStorage(["stats"]);
  await webRecordActivity(5, stats || DEFAULT_STATS);
  return { ok: true };
}
async function webSendRandomTip() {
  if (settings.tips === false) return;
  const keys = Object.keys(PILLS);
  const catKey = keys[Math.floor(Math.random() * keys.length)];
  const cat = PILLS[catKey];
  const tip = cat.tips[Math.floor(Math.random() * cat.tips.length)];
  webNotify(`${cat.icon} ${cat.label}`, tip, "tip");   // sonido distinto (píldora)
  // Suma 1 al contador de ESA categoría (badge por categoría)
  const { tipBadges: tb } = await getStorage(["tipBadges"]);
  const badges = { ...(tb || {}) };
  badges[catKey] = (badges[catKey] || 0) + 1;
  await setStorage({ tipBadges: badges });
}
function startWebTips() {
  if (IS_EXTENSION) return;
  if (webTipTimer) { clearInterval(webTipTimer); webTipTimer = null; }
  if (settings.tips === false) return;
  const mins = Math.max(1, Number(settings.tipInterval) || 60);
  webTipTimer = setInterval(webSendRandomTip, mins * 60000);
}

/* ---- Enrutador de "mensajes": extensión -> background.js · web -> backend local ---- */
const Backend = {
  handle(msg) {
    if (IS_EXTENSION) return new Promise((res) => chrome.runtime.sendMessage(msg, res));
    switch (msg.type) {
      case "start":           return webStart(msg.mode);
      case "pause":           return webPause();
      case "resume":          return webResume();
      case "skip":            return webAdvancePhase(false);
      case "stop":            return webStop();
      case "getState":        return getStorage(["timerState"]).then((d) => ({ state: d.timerState || DEFAULT_TIMER }));
      case "endOfDay":        return webEndOfDay();
      case "settingsChanged": Notify.ensurePermission(); startWebTips(); return Promise.resolve({ ok: true });
      case "testSound":       playChimeWeb(msg.variant || "normal", volFor(msg.variant || "normal")); return Promise.resolve({ ok: true });
      default:                return Promise.resolve({ error: "unknown" });
    }
  }
};

/* ---- Helpers usados por el resto del popup (ahora pasan por el adaptador) ---- */
const getStorage = (keys) => Store.get(keys);
const setStorage = (obj)  => Store.set(obj);
const sendMsg    = (msg)  => Backend.handle(msg);

const TRANSITION_MIN = 1;   // minutos de la pausa de transición entre fases

/* Crea una micro-fase de "transición" (prepararse para el siguiente movimiento).
   recovery:false -> NO cuenta como movilización en las estadísticas. */
/* Lógica de fases en core.js (probada en tests). Se mantienen las mismas firmas
   para no tocar el resto del popup. */
function makeTransition(nextName)  { return BVCore.makeTransition(nextName, TRANSITION_MIN); }
function modeBasePhases(mode, s)   { return BVCore.modeBasePhases(mode, s, MODES); }
function getPhases(mode)           { return BVCore.getPhases(mode, settings, MODES, TRANSITION_MIN); }

/* =================================================================
   INICIALIZACIÓN
   ================================================================= */
document.addEventListener("DOMContentLoaded", init);

async function init() {
  const data = await getStorage(["profile", "settings", "timerState", "stats", "tipBadges"]);
  profile    = { ...DEFAULT_PROFILE,  ...(data.profile    || {}) };
  settings   = { ...DEFAULT_SETTINGS, ...(data.settings   || {}) };
  timerState = { ...DEFAULT_TIMER,    ...(data.timerState || {}) };
  tipBadges  = data.tipBadges || {};
  if (timerState.mode) selectedMode = timerState.mode;

  lang = settings.lang || BVI18N.detectLang();
  applyI18n();
  applyTheme(settings.theme);
  renderProfile();
  renderAvatarPicker();
  renderModeSelector();
  renderPillCategories();
  renderPills();
  renderSettingsToggles();
  renderLangUI();
  renderSoundUI();
  renderVolume();
  renderTipInterval();
  renderDnd();
  renderDurationsConfig();
  renderRoutineConfig();
  renderReportControls();
  renderStats(data.stats || DEFAULT_STATS);
  renderNavBadge();
  updatePrintReport();
  renderTimer();

  bindEvents();
  startTick();

  // Modo captura para la tienda: sin bienvenida, con datos de ejemplo.
  // Parámetros: ?shot=1&view=&lang=es|en&theme=light|dark&panel=routine&tour=1
  const _params = new URLSearchParams(location.search);
  const _shot = _params.get("shot");
  if (_shot) {
    settings.onboarded = true;
    const _th = _params.get("theme"); if (_th) settings.theme = _th;
    const _lg = _params.get("lang"); if (_lg) { lang = _lg; settings.lang = _lg; }
    if (!profile.name) profile.name = "Alex";
    const demo = { streak: 5, lastActiveDate: localDateStr(0), days: {} };
    [30, 25, 40, 20, 35, 15, 30].forEach((m, i) => { demo.days[localDateStr(-i)] = { activeMinutes: m, breaks: 4 }; });
    currentStats = demo;
    applyTheme(settings.theme);
    applyI18n();
    renderProfile(); renderModeSelector(); renderPillCategories(); renderPills();
    renderStats(demo); renderSoundUI(); renderLangUI();
    renderDurationsConfig(); renderRoutineConfig(); renderTimer(); updatePrintReport();
  }

  // Primera vez: muestra la bienvenida (onboarding)
  if (!settings.onboarded) openOnboarding();

  // Deep-link a una vista concreta (?view=pildoras)
  const _view = _params.get("view");
  if (_view) switchView(_view);

  // Extras de captura: abrir "Mi rutina" (movida arriba, sin scroll) o lanzar el tour
  if (_shot) {
    if (_params.get("panel") === "routine") {
      const view = document.getElementById("view-ajustes");
      const d = [...view.querySelectorAll("details.details-card")].find((x) => x.querySelector("#routine-config"));
      if (d) {
        d.open = true;
        const title = view.querySelector(".view-title");
        view.insertBefore(d, title ? title.nextSibling : view.firstChild);
      }
    }
    if (_params.get("tour")) {
      startTour();
      const ts = parseInt(_params.get("tourstep") || "1", 10);
      tourIndex = Math.max(0, Math.min(ts - 1, TOUR_STEPS.length - 1));
      renderTourStep();
    }
  }

  // Reacciona a cambios de storage (extensión: background avanza de fase · web: backend local)
  Store.onChanged(onStorageChanged);

  // Modo WebApp: no hay background.js, así que el propio popup retoma el
  // temporizador (si venía corriendo) y programa los consejos emergentes.
  if (!IS_EXTENSION) {
    if (timerState.running && !timerState.paused) webSchedulePhaseEnd(timerState.phaseEndTime);
    startWebTips();
  }
}

/* =================================================================
   PERFIL
   ================================================================= */
function renderProfile() {
  document.getElementById("name-input").value = profile.name || "";
  document.getElementById("header-name").textContent = profile.name || "amig@";
  document.getElementById("header-avatar").textContent = profile.avatar || "🌱";
  updatePrintReport();
}

function renderAvatarPicker() {
  const wrap = document.getElementById("avatar-picker");
  wrap.innerHTML = "";
  AVATARS.forEach((emoji) => {
    const btn = document.createElement("button");
    btn.className = "avatar-option" + (emoji === profile.avatar ? " selected" : "");
    btn.textContent = emoji;
    btn.addEventListener("click", async () => {
      profile.avatar = emoji;
      await setStorage({ profile });
      renderProfile();
      renderAvatarPicker();
    });
    wrap.appendChild(btn);
  });
}

/* =================================================================
   SELECTOR DE MODO
   ================================================================= */
function renderModeSelector() {
  const wrap = document.getElementById("mode-selector");
  wrap.innerHTML = "";
  Object.keys(MODES).forEach((key) => {
    const m = MODES[key];
    const btn = document.createElement("button");
    btn.className = "mode-btn" + (key === selectedMode ? " selected" : "");
    btn.innerHTML = `<span class="m-icon">${m.icon}</span><span class="m-text">${locModeLabel(key)}</span>`;
    btn.disabled = timerState.running;   // no se cambia de modo con el timer activo
    btn.addEventListener("click", () => {
      selectedMode = key;
      renderModeSelector();
      renderTimer();
    });
    wrap.appendChild(btn);
  });
}

/* =================================================================
   TEMPORIZADOR (conteo visual + control por mensajes al background)
   ================================================================= */
function currentPhase() {
  const modeKey = timerState.running ? timerState.mode : selectedMode;
  const idx = timerState.running ? timerState.phaseIndex : 0;
  return getPhases(modeKey)[idx];
}

function remainingMs() {
  const phase = currentPhase();
  const fullMs = phase.minutes * 60000;
  if (!timerState.running) return fullMs;
  if (timerState.paused)   return timerState.remainingMs ?? fullMs;
  return Math.max(0, timerState.phaseEndTime - Date.now());
}

function renderTimer() {
  const phase  = currentPhase();
  const fullMs = phase.minutes * 60000;
  const remMs  = remainingMs();

  const totalSec = Math.round(remMs / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  document.getElementById("time-left").textContent = `${mm}:${ss}`;

  const progress = fullMs > 0 ? (1 - remMs / fullMs) * 100 : 0;
  document.getElementById("ring").style.setProperty("--progress", `${progress}%`);

  document.getElementById("phase-icon").textContent = phase.icon;
  const c = LC();
  const pTip = timerState.running
    ? ((c && c.phaseTips[phase.name]) || phase.tip)
    : t("pick_mode");
  document.getElementById("phase-name").textContent = timerState.running
    ? `${locPhaseName(phase.name)} · ${locModeName(timerState.mode)}`
    : t("ready");
  document.getElementById("phase-tip").textContent = pTip;

  // Panel de ejercicios guiados: solo en fases de recuperación (pausa/movimiento)
  const panel = document.getElementById("exercise-panel");
  if (panel) {
    let steps = null;
    if (timerState.running && phase.recovery) {
      steps = (c && (c.exercises[phase.name] || c.exercises._default)) || EXERCISES[phase.name] || EXERCISES._default;
    }
    if (steps && steps.length) {
      document.getElementById("exercise-title").textContent = `${phase.icon} ${t("exercises_suggested")}`;
      if (panel.dataset.phase !== phase.name + "|" + lang) {   // reconstruir al cambiar de fase o idioma
        document.getElementById("exercise-steps").innerHTML = steps.map((s) => `<li>${s}</li>`).join("");
        panel.dataset.phase = phase.name + "|" + lang;
      }
      panel.classList.remove("hidden");
    } else {
      panel.classList.add("hidden");
      panel.dataset.phase = "";
    }
  }

  const show = (id, on) => document.getElementById(id).classList.toggle("hidden", !on);
  show("btn-start",  !timerState.running);
  show("btn-pause",  timerState.running && !timerState.paused);
  show("btn-resume", timerState.running && timerState.paused);
  show("btn-skip",   timerState.running);
  show("btn-stop",   timerState.running);
}

function startTick() {
  clearInterval(tickInterval);
  tickInterval = setInterval(() => {
    if (timerState.running && !timerState.paused) renderTimer();
  }, 250);
}

/* =================================================================
   ESTADÍSTICAS SEMANALES
   ================================================================= */
function localDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekDates() {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 0 = lunes
  const monday = new Date(now);
  monday.setDate(now.getDate() - dow);
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return out;
}

const MONTHS_ABBR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/* Convierte "YYYY-MM-DD" en { y, m (0-11), d } */
function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m: m - 1, d };
}

function renderStats(stats) {
  stats = { ...DEFAULT_STATS, ...(stats || {}) };
  currentStats = stats;
  updatePrintReport();
  const week = getWeekDates();                 // lunes → domingo (YYYY-MM-DD)
  const dayNames = ["L", "M", "X", "J", "V", "S", "D"];
  const today = localDateStr(0);
  let totalMin = 0, totalBreaks = 0, maxMin = 1;

  const rows = week.map((dateStr) => {
    const d = stats.days[dateStr];
    const min = d ? d.activeMinutes : 0;
    totalMin += min;
    totalBreaks += d ? d.breaks : 0;
    maxMin = Math.max(maxMin, min);
    return min;
  });

  // Tiempo EXACTO en horas y minutos (sin redondear a 0.1 h, que perdía precisión:
  // p. ej. 5 min mostraba "0.1" ≈ 6 min). totalMin es la suma de minutos EFECTIVOS.
  const totalH = Math.floor(totalMin / 60);
  const totalM = totalMin % 60;
  document.getElementById("stat-hours").textContent  = `${totalH}h ${totalM}m`;
  document.getElementById("stat-streak").textContent = `${stats.streak} 🔥`;
  document.getElementById("stat-breaks").textContent = totalBreaks;

  // Rango de fechas de la semana (ej. "6 – 12 jul 2026")
  const a = parseDate(week[0]);
  const b = parseDate(week[6]);
  const rangeEl = document.getElementById("week-range");
  if (rangeEl) {
    rangeEl.textContent = (a.m === b.m)
      ? `${a.d} – ${b.d} ${MONTHS_ABBR[b.m]} ${b.y}`
      : `${a.d} ${MONTHS_ABBR[a.m]} – ${b.d} ${MONTHS_ABBR[b.m]} ${b.y}`;
  }

  // Gráfico de barras: número de día bajo la letra, "hoy" resaltado y fecha en el tooltip
  const chart = document.getElementById("week-chart");
  chart.innerHTML = "";
  week.forEach((dateStr, i) => {
    const min = rows[i];
    const h = min > 0 ? Math.max(8, (min / maxMin) * 100) : 4;
    const p = parseDate(dateStr);
    const isToday = dateStr === today;
    const wrap = document.createElement("div");
    wrap.className = "day-bar-wrap" + (isToday ? " today" : "");
    wrap.innerHTML =
      `<div class="day-bar ${min === 0 ? "empty" : ""}" style="height:${h}%" title="${p.d} ${MONTHS_ABBR[p.m]}: ${min} min"></div>` +
      `<span class="day-label">${dayNames[i]}<span class="day-num">${p.d}</span></span>`;
    chart.appendChild(wrap);
  });
}

/* =================================================================
   EXPORTAR CSV  (universal: funciona igual en la extensión y en la web)
   Lee todo el historial (stats.days) y descarga un CSV con columnas:
   Fecha, Minutos_Activos, Pausas_Completadas.
   ================================================================= */
async function exportCSV() {
  const { stats } = await getStorage(["stats"]);
  const days = (stats && stats.days) ? stats.days : {};

  const rows = [["Fecha", "Minutos_Activos", "Pausas_Completadas"]];
  Object.keys(days).sort().forEach((date) => {   // orden cronológico
    const d = days[date] || {};
    rows.push([date, d.activeMinutes || 0, d.breaks || 0]);
  });

  // BOM (﻿) para que Excel abra el UTF-8 correctamente; saltos CRLF
  const csv = "﻿" + rows.map((r) => r.join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  // Descarga vía enlace temporal (compatible con extensión MV3 y con la web)
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bienestar-vascular_${localDateStr(0)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* =================================================================
   COPIA DE SEGURIDAD (JSON)  ·  exporta/importa TODO el estado local
   (perfil, ajustes, historial y racha). No incluye timerState (temporal).
   Funciona igual en la extensión (chrome.storage.local) y en la web
   (localStorage) porque usa el adaptador getStorage/setStorage.
   ================================================================= */
async function exportBackup() {
  const data = await getStorage(["profile", "settings", "stats", "tipBadges"]);
  const payload = {
    app: "bienestar-vascular",
    type: "backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    data
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bienestar-vascular_copia_${localDateStr(0)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function triggerRestore() {
  const input = document.getElementById("restore-file");
  if (input) input.click();
}

async function handleRestoreFile(ev) {
  const file = ev.target.files && ev.target.files[0];
  ev.target.value = "";                 // permite reimportar el mismo archivo
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const d = (parsed && parsed.data) ? parsed.data : parsed;
    if (!d || typeof d !== "object" || (!d.stats && !d.settings && !d.profile)) {
      alert(t("alert_invalid"));
      return;
    }
    if (!confirm(t("alert_confirm_restore"))) return;
    const toSet = {};
    if (d.profile)   toSet.profile   = d.profile;
    if (d.settings)  toSet.settings  = d.settings;
    if (d.stats)     toSet.stats     = d.stats;
    if (d.tipBadges) toSet.tipBadges = d.tipBadges;
    await setStorage(toSet);
    alert(t("alert_restored"));
    location.reload();
  } catch (e) {
    alert(t("alert_read_error") + (e && e.message ? e.message : e));
  }
}

/* =================================================================
   REPORTE MÉDICO (PDF)  ·  ventana autónoma con estilos incrustados
   Inmune a la caché de popup.css; funciona en web y como respaldo usa
   window.print() (que aplica el @media print) si el navegador bloquea
   las ventanas emergentes (p. ej. dentro del popup de la extensión).
   ================================================================= */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildReportHTML() {
  const d = new Date();
  const fecha = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  const N = Number(settings.reportDays) || 30;
  const ref = (settings.reportRef || "").trim();
  const notes = (settings.reportNotes || "").trim();
  const days = currentStats.days || {};
  const hm = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;

  let totalMin = 0, totalBreaks = 0, activeDays = 0;
  for (let i = 0; i < N; i++) {
    const dd = days[localDateStr(-i)];
    if (dd && dd.activeMinutes > 0) { totalMin += dd.activeMinutes; totalBreaks += dd.breaks || 0; activeDays++; }
  }
  const avg = activeDays > 0 ? Math.round(totalMin / activeDays) : 0;
  const metrics = [
    ["Tiempo total de movilización", hm(totalMin)],
    ["Pausas activas completadas", String(totalBreaks)],
    [`Días con actividad (de ${N})`, String(activeDays)],
    ["Media diaria en días activos", `${avg} min`],
    ["Racha actual de días seguidos", `${currentStats.streak || 0} días`]
  ];
  const metricsHTML = metrics.map((r) => `<div class="pm-row"><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`).join("");

  let max = 1; const cols = [];
  for (let i = 13; i >= 0; i--) {
    const key = localDateStr(-i);
    const p = parseDate(key);
    const min = (days[key] && days[key].activeMinutes) || 0;
    max = Math.max(max, min);
    cols.push({ label: `${p.d}/${p.m + 1}`, min });
  }
  const chartHTML = cols.map((c) => {
    const h = c.min > 0 ? Math.max(6, (c.min / max) * 100) : 3;
    return `<div class="pc-col"><div class="pc-bar" style="height:${h}%"></div><span class="pc-lab">${c.label}</span></div>`;
  }).join("");

  const seen = {}; const exItems = [];
  Object.keys(MODES).forEach((mk) => MODES[mk].phases.forEach((p) => {
    if (p.recovery && !seen[p.name]) { seen[p.name] = 1; exItems.push(`<li><b>${esc(p.name)}:</b> ${esc(p.tip)}</li>`); }
  }));
  exItems.push(`<li><b>Fin de jornada:</b> elevar las piernas contra la pared 5–10 minutos para favorecer el retorno venoso.</li>`);

  const notesHTML = notes
    ? `<div class="sec"><div class="h">Observaciones del usuario</div><p class="notes">${esc(notes)}</p></div>` : "";
  const refHTML = ref ? `&nbsp;&nbsp;·&nbsp;&nbsp;Ref.: ${esc(ref)}` : "";
  const logoUrl = new URL("icons/icon128.png", document.baseURI).href;
  const patient = `${esc(profile.avatar || "🌱")} ${esc(profile.name || "amig@")}`;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<title>Reporte · Bienestar Vascular</title>
<style>
  * { box-sizing: border-box; }
  body { font-family:-apple-system,"Segoe UI",Roboto,Helvetica,sans-serif; color:#1c1c1c; margin:0; padding:28px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .header { display:flex; align-items:center; gap:16px; border-bottom:2px solid #4FB79A; padding-bottom:14px; margin-bottom:16px; }
  .logo { width:62px; height:62px; border-radius:14px; }
  .title { font-size:21px; font-weight:700; }
  .subtitle { font-size:12.5px; color:#555; }
  .meta { font-size:12px; color:#333; margin-top:5px; }
  .sec { margin-top:16px; }
  .h { font-size:13.5px; font-weight:700; color:#2E9A82; border-bottom:1px solid #ddd; padding-bottom:4px; margin-bottom:8px; }
  .pm-row { display:flex; justify-content:space-between; padding:5px 2px; border-bottom:1px dotted #ccc; font-size:12.5px; color:#333; }
  .pm-row b { color:#1c1c1c; }
  .chart { display:flex; align-items:flex-end; gap:5px; height:96px; margin-top:4px; }
  .pc-col { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; }
  .pc-bar { width:100%; background:#4FB79A; border-radius:3px 3px 0 0; }
  .pc-lab { font-size:8px; color:#666; margin-top:3px; }
  ul.list { margin:4px 0 0 18px; font-size:12px; line-height:1.65; color:#333; }
  ul.list b { color:#1c1c1c; }
  .notes { margin:0; font-size:12px; color:#333; line-height:1.55; white-space:pre-wrap; border-left:3px solid #4FB79A; padding:4px 0 4px 12px; }
  .proflines { margin-top:10px; }
  .proflines div { border-bottom:1px solid #bbb; height:28px; }
  .disclaimer { margin-top:20px; padding-top:10px; border-top:1px solid #ccc; font-size:10px; color:#777; line-height:1.5; }
  @media print { body { padding:14mm; } }
</style></head>
<body>
  <div class="header">
    <img class="logo" src="${logoUrl}" alt="Bienestar Vascular">
    <div>
      <div class="title">Bienestar Vascular · Pausas Activas</div>
      <div class="subtitle">Reporte de seguimiento de actividad · apoyo para consulta médica</div>
      <div class="meta">Paciente: ${patient}&nbsp;&nbsp;·&nbsp;&nbsp;Fecha del reporte: ${fecha}${refHTML}</div>
    </div>
  </div>
  <div class="sec"><div class="h">Resumen del periodo (últimos ${N} días)</div>${metricsHTML}</div>
  <div class="sec"><div class="h">Actividad diaria (últimas 2 semanas · minutos de movilización)</div><div class="chart">${chartHTML}</div></div>
  <div class="sec"><div class="h">Ejercicios y pausas que realiza el usuario</div><ul class="list">${exItems.join("")}</ul></div>
  ${notesHTML}
  <div class="sec"><div class="h">Observaciones del profesional (a rellenar en consulta)</div><div class="proflines"><div></div><div></div><div></div><div></div></div></div>
  <p class="disclaimer">Documento generado automáticamente por la aplicación <b>Bienestar Vascular · Pausas Activas</b> con fines de autoseguimiento personal. Refleja el registro de pausas activas y tiempo de movilización introducido por el usuario; no constituye un diagnóstico médico ni sustituye la valoración de un profesional sanitario.</p>
</body></html>`;
}

function openReport() {
  try {
    const w = window.open("", "_blank");
    if (w) {
      w.document.open();
      w.document.write(buildReportHTML());
      w.document.close();
      const doPrint = () => { try { w.focus(); w.print(); } catch (e) { /* ignora */ } };
      w.onload = doPrint;
      setTimeout(doPrint, 700);   // respaldo si onload no dispara
      return;
    }
  } catch (e) { /* cae al respaldo */ }
  // Respaldo: imprime la página actual (aplica el @media print del reporte)
  updatePrintReport();
  window.print();
}

/* =================================================================
   PÍLDORAS DE SALUD
   ================================================================= */
function renderPillCategories() {
  const wrap = document.getElementById("pill-categories");
  wrap.innerHTML = "";
  Object.keys(PILLS).forEach((key) => {
    const c = PILLS[key];
    // Mostramos el nº de pendientes de CADA categoría (también la seleccionada),
    // para que al entrar se vea cuántas notificaciones nuevas hay por área.
    const count = tipBadges[key] || 0;
    const btn = document.createElement("button");
    btn.className = "pill-cat" + (key === selectedCat ? " selected" : "");
    btn.innerHTML =
      `<span class="pc-icon">${c.icon}</span><span class="pc-text">${pillLabel(key)}</span>` +
      (count > 0 ? `<span class="cat-badge">${count > 9 ? "9+" : count}</span>` : "");
    btn.addEventListener("click", () => selectCategory(key));
    wrap.appendChild(btn);
  });
}

/* Selecciona una categoría y marca sus consejos como leídos (su badge -> 0) */
function selectCategory(key) {
  selectedCat = key;
  if (tipBadges[key]) {
    tipBadges = { ...tipBadges, [key]: 0 };
    setStorage({ tipBadges });
  }
  renderPillCategories();
  renderPills();
  renderNavBadge();
}

function renderPills() {
  const list = document.getElementById("pill-list");
  list.innerHTML = "";
  // Baraja las píldoras de la categoría y muestra una selección: así cada visita
  // (o pulsar "Ver otros consejos") enseña píldoras distintas.
  const all = pillTips(selectedCat).slice();
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  all.slice(0, 5).forEach((tip) => {
    const el = document.createElement("div");
    el.className = "pill-item";
    el.textContent = tip;
    list.appendChild(el);
  });
}

/* =================================================================
   AJUSTES · Tema (Modo Oscuro)
   ================================================================= */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
}

async function setTheme(theme) {
  settings.theme = theme;
  await setStorage({ settings });          // ← guardado local
  applyTheme(theme);
  renderSettingsToggles();
}

function renderSettingsToggles() {
  document.getElementById("toggle-theme").checked = settings.theme === "dark";
  document.getElementById("toggle-tips").checked  = !!settings.tips;
  document.getElementById("toggle-transition").checked = settings.transition !== false;
  document.getElementById("theme-icon").textContent = settings.theme === "dark" ? "☀️" : "🌙";
}

/* Marca el idioma activo en el selector de Ajustes */
function renderLangUI() {
  document.querySelectorAll("#lang-select .lang-btn").forEach((b) => {
    b.classList.toggle("sel", b.dataset.lang === lang);
  });
}

async function setLang(newLang) {
  lang = BVI18N.langs.includes(newLang) ? newLang : "es";
  settings.lang = lang;
  await setStorage({ settings });
  applyI18n();
  renderLangUI();
  // re-render de las partes que construyen texto en JS
  renderModeSelector();
  renderTimer();
  renderDurationsConfig();
  renderRoutineConfig();
  renderPillCategories();
  renderPills();
}

/* Controles del reporte médico (periodo, referencia y observaciones) */
function renderReportControls() {
  const sel = document.getElementById("report-days");
  if (sel) sel.value = String(settings.reportDays || 30);
  const ref = document.getElementById("report-ref");
  if (ref) ref.value = settings.reportRef || "";
  const notes = document.getElementById("report-notes");
  if (notes) notes.value = settings.reportNotes || "";
}

/* =================================================================
   AJUSTES · Sonido (Silenciar)
   ================================================================= */
function renderSoundUI() {
  const exOn = settings.sound !== false;      // sonido de ejercicio
  const tipOn = settings.soundTip !== false;  // sonido de píldora
  const anyOn = exOn || tipOn;
  document.getElementById("sound-icon").textContent = anyOn ? "🔊" : "🔇";
  document.getElementById("sound-toggle").title = anyOn ? "Silenciar todos los sonidos" : "Activar sonidos";
  document.getElementById("toggle-sound").checked = exOn;
  document.getElementById("toggle-sound-tip").checked = tipOn;
}

/* ¿Suena esta variante? y ¿a qué volumen? (independiente: ejercicio vs píldora) */
function soundOnFor(variant) {
  return variant === "tip" ? settings.soundTip !== false : settings.sound !== false;
}
function volFor(variant) {
  return clampVolume(variant === "tip" ? settings.volTip : settings.volume);
}

async function setSound(on) {                 // sonido de EJERCICIO
  settings.sound = on;
  await setStorage({ settings });
  renderSoundUI();
  if (on) sendMsg({ type: "testSound", variant: "normal" });
}
async function setSoundTip(on) {              // sonido de PÍLDORA
  settings.soundTip = on;
  await setStorage({ settings });
  renderSoundUI();
  if (on) sendMsg({ type: "testSound", variant: "tip" });
}
async function setMasterSound(on) {           // botón de la cabecera = silenciar/activar TODO
  settings.sound = on;
  settings.soundTip = on;
  await setStorage({ settings });
  renderSoundUI();
  if (on) sendMsg({ type: "testSound", variant: "normal" });
}

/* =================================================================
   AJUSTES · Volumen (slider 0–100)
   ================================================================= */
function clampVolume(v) {
  v = parseInt(v, 10);
  if (isNaN(v)) v = 50;
  return Math.min(100, Math.max(0, v));
}

/* Pinta el número (%) y el "relleno" pastel del slider */
function updateVolumeVisual(sliderId, valueId, v) {
  document.getElementById(valueId).textContent = v + "%";
  const slider = document.getElementById(sliderId);
  slider.style.background =
    `linear-gradient(to right, var(--accent) 0%, var(--accent) ${v}%, var(--surface-2) ${v}%, var(--surface-2) 100%)`;
}

function renderVolume() {
  const ve = clampVolume(settings.volume);
  document.getElementById("volume-slider").value = ve;
  updateVolumeVisual("volume-slider", "volume-value", ve);
  const vt = clampVolume(settings.volTip);
  document.getElementById("volume-slider-tip").value = vt;
  updateVolumeVisual("volume-slider-tip", "volume-value-tip", vt);
}

/* Guarda el volumen (por tipo) y, opcionalmente, reproduce una muestra */
async function setVolume(v, playSample) {         // volumen de EJERCICIO
  settings.volume = clampVolume(v);
  updateVolumeVisual("volume-slider", "volume-value", settings.volume);
  await setStorage({ settings });
  if (playSample) sendMsg({ type: "testSound", variant: "normal" });
}
async function setVolumeTip(v, playSample) {      // volumen de PÍLDORA
  settings.volTip = clampVolume(v);
  updateVolumeVisual("volume-slider-tip", "volume-value-tip", settings.volTip);
  await setStorage({ settings });
  if (playSample) sendMsg({ type: "testSound", variant: "tip" });
}

/* =================================================================
   AJUSTES · Frecuencia de los consejos emergentes
   ================================================================= */
function renderTipInterval() {
  document.getElementById("tip-interval").value = settings.tipInterval || 60;
}

/* AJUSTES · Horario "No molestar" */
function renderDnd() {
  const t = document.getElementById("toggle-dnd");
  if (!t) return;
  t.checked = !!settings.dnd;
  document.getElementById("dnd-from").value = settings.dndFrom || "21:00";
  document.getElementById("dnd-to").value   = settings.dndTo   || "08:00";
}

async function setTipInterval(minutes) {
  let val = parseInt(minutes, 10);
  if (isNaN(val) || val < 15) val = 15;
  if (val > 480) val = 480;
  settings.tipInterval = val;
  document.getElementById("tip-interval").value = val;
  await setStorage({ settings });          // ← guardado local
  sendMsg({ type: "settingsChanged" });    // reprograma la alarma en background
}

/* =================================================================
   AJUSTES · Duraciones personalizadas
   ================================================================= */
function renderDurationsConfig() {
  const wrap = document.getElementById("durations-config");
  wrap.innerHTML = "";
  Object.keys(MODES).filter((k) => k !== "custom").forEach((key) => {   // "custom" se edita en su propia sección
    const m = MODES[key];
    const phases = m.phases;                        // solo fases reales (sin transiciones "Prepárate")
    const custom = settings.durations && settings.durations[key];
    const block = document.createElement("div");
    block.className = "dur-mode";
    let html = `<div class="dur-title">${m.icon} ${m.name}</div><div class="dur-fields">`;
    phases.forEach((p, i) => {
      // Tooltip propio (data-tip): explicación sencilla de qué controla ese campo
      const help = (p.desc || p.tip || "").replace(/"/g, "&quot;");
      const val = (custom && custom[i] > 0) ? custom[i] : p.minutes;   // duración efectiva
      const counts = !!p.recovery;                 // solo las fases de PAUSA suman al progreso
      html += `<label class="dur-field${counts ? " counts" : ""}" data-tip="${help}">
        <span>${p.icon} ${locPhaseName(p.name)}${counts ? ` <em class="dur-badge">${t("rt_counts")}</em>` : ``}</span>
        <input type="number" min="1" max="180" step="1" value="${val}"
               data-mode="${key}" data-idx="${i}" class="dur-input" /> </label>`;
    });
    html += `</div>`;
    block.innerHTML = html;
    wrap.appendChild(block);
  });
  wrap.querySelectorAll(".dur-input").forEach((inp) => {
    inp.addEventListener("change", onDurationChange);
  });
}

async function onDurationChange(e) {
  const mode = e.target.dataset.mode;
  const idx = parseInt(e.target.dataset.idx, 10);
  let val = parseInt(e.target.value, 10);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 180) val = 180;
  e.target.value = val;

  settings.durations = { ...(settings.durations || {}) };
  const base = MODES[mode].phases.map((p) => p.minutes);
  const arr = (settings.durations[mode] || base).slice();
  arr[idx] = val;
  settings.durations[mode] = arr;

  await setStorage({ settings });          // ← guardado local
  if (!timerState.running) renderTimer();  // refleja la nueva duración de la fase 0
}

async function resetDurations() {
  settings.durations = {};
  await setStorage({ settings });
  renderDurationsConfig();
  if (!timerState.running) renderTimer();
}

/* =================================================================
   AJUSTES · MI RUTINA PERSONALIZADA (modo "custom")
   El usuario define su propia secuencia de fases (nombre, emoji, minutos
   y si es una "pausa" de movimiento). Se guarda en settings.customRoutine.
   ================================================================= */
let routineDraft = null;   // copia de trabajo de la rutina

/* Iconos para elegir en cada fase (sin teclado de emojis) */
const ROUTINE_ICONS = [
  "💻","⌨️","📊","📚","✍️","🎨","🧠","🎯","📞","🧑‍💻",
  "🧍","🚶","🏃","🤸","🧘","💪","🦶","🙆","☕","💧",
  "👀","🌿","🌙","⏱️","🍅","🎮","🕹️","🎵"
];

function loadRoutineDraft() {
  const src = (Array.isArray(settings.customRoutine) && settings.customRoutine.length)
    ? settings.customRoutine
    : MODES.custom.phases;
  routineDraft = src.map((p) => ({
    name: p.name || "Fase",
    icon: p.icon || "⏱️",
    minutes: Math.min(180, Math.max(1, parseInt(p.minutes, 10) || 5)),
    recovery: !!p.recovery
  }));
}

async function saveRoutine() {
  settings.customRoutine = BVCore.sanitizeRoutine(routineDraft);   // saneo en core.js (probado)
  await setStorage({ settings });
  renderModeSelector();
  if (!timerState.running) renderTimer();
}

function renderRoutineConfig() {
  const wrap = document.getElementById("routine-config");
  if (!wrap) return;
  if (!routineDraft) loadRoutineDraft();
  wrap.innerHTML = "";
  routineDraft.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "routine-row" + (p.recovery ? " is-pause" : "");
    const palette = ROUTINE_ICONS
      .map((ic) => `<button type="button" class="rt-ic${ic === p.icon ? " sel" : ""}" data-ic="${ic}" data-i="${i}" aria-label="Icono ${ic}">${ic}</button>`)
      .join("");
    row.innerHTML =
      `<button type="button" class="rt-emoji" data-act="pick" data-i="${i}" aria-label="Elegir icono">${esc(p.icon)}</button>
       <input class="rt-name" type="text" maxlength="24" value="${esc(p.name)}" placeholder="Nombre de la fase" data-i="${i}" data-f="name" />
       <input class="rt-min" type="number" min="1" max="180" value="${p.minutes}" aria-label="Minutos" data-i="${i}" data-f="minutes" />
       <div class="rt-type" role="group" aria-label="Tipo de fase">
         <button type="button" class="rt-type-btn ${p.recovery ? "" : "sel"}" data-act="type" data-type="work" data-i="${i}">${t("rt_work")}</button>
         <button type="button" class="rt-type-btn ${p.recovery ? "sel" : ""}" data-act="type" data-type="pause" data-i="${i}">${t("rt_pause")}</button>
       </div>
       <div class="rt-actions">
         <button type="button" class="rt-btn" data-act="up" data-i="${i}" ${i === 0 ? "disabled" : ""} aria-label="Subir">↑</button>
         <button type="button" class="rt-btn" data-act="down" data-i="${i}" ${i === routineDraft.length - 1 ? "disabled" : ""} aria-label="Bajar">↓</button>
         <button type="button" class="rt-btn rt-del" data-act="del" data-i="${i}" ${routineDraft.length <= 1 ? "disabled" : ""} aria-label="Eliminar fase">✕</button>
       </div>
       <div class="rt-palette hidden">${palette}</div>`;
    wrap.appendChild(row);
  });
  wrap.querySelectorAll("input[data-f]").forEach((inp) => inp.addEventListener("change", onRoutineFieldChange));
  wrap.querySelectorAll(".rt-btn, .rt-emoji, .rt-type-btn").forEach((b) => b.addEventListener("click", onRoutineAction));
  wrap.querySelectorAll(".rt-ic").forEach((b) => b.addEventListener("click", onRoutineIconPick));
}

async function onRoutineFieldChange(e) {
  const i = parseInt(e.target.dataset.i, 10);
  const f = e.target.dataset.f;
  if (!routineDraft[i]) return;
  if (f === "recovery") routineDraft[i].recovery = e.target.checked;
  else if (f === "minutes") { routineDraft[i].minutes = Math.min(180, Math.max(1, parseInt(e.target.value, 10) || 1)); e.target.value = routineDraft[i].minutes; }
  else routineDraft[i][f] = e.target.value;
  await saveRoutine();
}

async function onRoutineAction(e) {
  const btn = e.currentTarget;
  const i = parseInt(btn.dataset.i, 10);
  const act = btn.dataset.act;
  if (act === "pick") {                       // abre/cierra la paleta de iconos de esa fila
    const pal = btn.closest(".routine-row").querySelector(".rt-palette");
    if (pal) pal.classList.toggle("hidden");
    return;
  }
  if (act === "type") { routineDraft[i].recovery = btn.dataset.type === "pause"; }
  else if (act === "up" && i > 0) { [routineDraft[i - 1], routineDraft[i]] = [routineDraft[i], routineDraft[i - 1]]; }
  else if (act === "down" && i < routineDraft.length - 1) { [routineDraft[i + 1], routineDraft[i]] = [routineDraft[i], routineDraft[i + 1]]; }
  else if (act === "del" && routineDraft.length > 1) { routineDraft.splice(i, 1); }
  await saveRoutine();
  renderRoutineConfig();
}

async function onRoutineIconPick(e) {
  const btn = e.currentTarget;
  const i = parseInt(btn.dataset.i, 10);
  if (!routineDraft[i]) return;
  routineDraft[i].icon = btn.dataset.ic;
  await saveRoutine();
  renderRoutineConfig();     // actualiza el botón y cierra la paleta
}

async function addRoutinePhase() {
  if (!routineDraft) loadRoutineDraft();
  const isPause = routineDraft.length % 2 === 1;   // alterna trabajo/pausa por comodidad
  routineDraft.push({ name: isPause ? "Pausa activa" : "Trabajo", icon: isPause ? "🧍" : "💻", minutes: isPause ? 5 : 25, recovery: isPause });
  await saveRoutine();
  renderRoutineConfig();
}

async function resetRoutine() {
  settings.customRoutine = null;
  await setStorage({ settings });
  loadRoutineDraft();
  renderRoutineConfig();
  renderModeSelector();
  if (!timerState.running) renderTimer();
}

/* =================================================================
   INSIGNIAS (BADGES) de consejos sin leer
   - Por categoría: se dibujan en cada tarjeta (ver renderPillCategories).
   - Total: se muestra en el icono del menú Píldoras (suma de todas).
   ================================================================= */
function renderNavBadge() {
  const el = document.getElementById("pill-badge");
  if (!el) return;
  const total = Object.values(tipBadges).reduce((a, b) => a + (Number(b) || 0), 0);
  if (total > 0) {
    el.textContent = total > 9 ? "9+" : String(total);
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

/* Rellena el REPORTE de impresión/PDF (paciente, métricas, gráfico, ejercicios) */
function updatePrintReport() {
  const N = Number(settings.reportDays) || 30;
  const ref = (settings.reportRef || "").trim();

  // --- Encabezado: paciente + fecha (+ referencia opcional) ---
  const meta = document.getElementById("print-meta");
  if (meta) {
    const d = new Date();
    const fecha = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    meta.textContent =
      `Paciente: ${profile.avatar || "🌱"} ${profile.name || "amig@"}   ·   Fecha del reporte: ${fecha}` +
      (ref ? `   ·   Ref.: ${ref}` : "");
  }

  const days = currentStats.days || {};
  const hm = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;

  // --- Resumen de los últimos N días (periodo elegido por el usuario) ---
  const periodTitle = document.getElementById("print-period-title");
  if (periodTitle) periodTitle.textContent = `Resumen del periodo (últimos ${N} días)`;

  let totalMin = 0, totalBreaks = 0, activeDays = 0;
  for (let i = 0; i < N; i++) {
    const dd = days[localDateStr(-i)];
    if (dd && dd.activeMinutes > 0) { totalMin += dd.activeMinutes; totalBreaks += dd.breaks || 0; activeDays++; }
  }
  const avg = activeDays > 0 ? Math.round(totalMin / activeDays) : 0;
  const metricsEl = document.getElementById("print-metrics");
  if (metricsEl) {
    const rows = [
      ["Tiempo total de movilización", hm(totalMin)],
      ["Pausas activas completadas", String(totalBreaks)],
      [`Días con actividad (de ${N})`, String(activeDays)],
      ["Media diaria en días activos", `${avg} min`],
      ["Racha actual de días seguidos", `${currentStats.streak || 0} días`]
    ];
    metricsEl.innerHTML = rows.map((r) => `<div class="pm-row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("");
  }

  // --- Gráfico de las últimas 2 semanas ---
  const chartEl = document.getElementById("print-chart");
  if (chartEl) {
    let max = 1;
    const cols = [];
    for (let i = 13; i >= 0; i--) {
      const key = localDateStr(-i);
      const p = parseDate(key);
      const min = (days[key] && days[key].activeMinutes) || 0;
      max = Math.max(max, min);
      cols.push({ label: `${p.d}/${p.m + 1}`, min });
    }
    chartEl.innerHTML = cols.map((c) => {
      const h = c.min > 0 ? Math.max(6, (c.min / max) * 100) : 3;
      return `<div class="pc-col"><div class="pc-bar" style="height:${h}%" title="${c.min} min"></div><span class="pc-lab">${c.label}</span></div>`;
    }).join("");
  }

  // --- Ejercicios / pausas que realiza el usuario ---
  const exEl = document.getElementById("print-exercises");
  if (exEl) {
    const seen = {};
    const items = [];
    Object.keys(MODES).forEach((mk) => {
      MODES[mk].phases.forEach((p) => {
        if (p.recovery && !seen[p.name]) { seen[p.name] = 1; items.push(`<li><b>${p.name}:</b> ${p.tip}</li>`); }
      });
    });
    items.push(`<li><b>Fin de jornada:</b> elevar las piernas contra la pared 5–10 minutos para favorecer el retorno venoso.</li>`);
    exEl.innerHTML = items.join("");
  }

  // --- Observaciones del usuario (opcional; solo aparece si hay texto) ---
  const notes = (settings.reportNotes || "").trim();
  const notesSection = document.getElementById("print-notes-section");
  const notesEl = document.getElementById("print-notes");
  if (notesEl) notesEl.textContent = notes;
  if (notesSection) notesSection.style.display = notes ? "" : "none";
}

/* =================================================================
   NAVEGACIÓN ENTRE VISTAS
   ================================================================= */
function switchView(view) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.getElementById(`view-${view}`).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === view)
  );
  // Al entrar en Píldoras NO se limpia nada: mostramos los pendientes por categoría.
  // El badge de una categoría se marca como leído solo al pulsarla (ver selectCategory).
  if (view === "pildoras") {
    renderPillCategories();
    renderNavBadge();
  }
}

/* =================================================================
   OVERLAY FIN DE JORNADA
   ================================================================= */
function openEndDay() {
  sendMsg({ type: "endOfDay" });
  timerState = { ...DEFAULT_TIMER };
  renderModeSelector();
  renderTimer();

  document.getElementById("endday-overlay").classList.remove("hidden");
  let secs = 5 * 60; // guía de 5 minutos
  const label = document.getElementById("endday-timer");
  label.textContent = "05:00";
  clearInterval(enddayInterval);
  enddayInterval = setInterval(() => {
    secs--;
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    label.textContent = `${mm}:${ss}`;
    if (secs <= 0) {
      clearInterval(enddayInterval);
      label.textContent = "¡Bien hecho! 🌿";
    }
  }, 1000);
}

function closeEndDay() {
  clearInterval(enddayInterval);
  document.getElementById("endday-overlay").classList.add("hidden");
}

/* =================================================================
   ONBOARDING / BIENVENIDA (se muestra la primera vez; reabrible en Ajustes)
   ================================================================= */
function openOnboarding() {
  document.getElementById("onboarding-overlay").classList.remove("hidden");
}
async function closeOnboarding() {
  document.getElementById("onboarding-overlay").classList.add("hidden");
  if (!settings.onboarded) {
    settings.onboarded = true;
    await setStorage({ settings });   // no volver a mostrarla automáticamente
  }
}

/* =================================================================
   TOUR INTERACTIVO (demo guiada) · resalta partes clave con globos
   ================================================================= */
const TOUR_STEPS = [
  { view: "inicio",   sel: "#mode-selector",                  key: "tour_modes" },
  { view: "inicio",   sel: "#btn-start",                      key: "tour_start" },
  { view: "inicio",   sel: "#ring",                           key: "tour_ring" },
  { view: "progreso", sel: '.nav-btn[data-view="progreso"]',  key: "tour_progress" },
  { view: "pildoras", sel: '.nav-btn[data-view="pildoras"]',  key: "tour_pills" },
  { view: "ajustes",  sel: '.nav-btn[data-view="ajustes"]',   key: "tour_settings" }
];
let tourIndex = 0;

function startTour() {
  document.getElementById("onboarding-overlay").classList.add("hidden");
  if (!settings.onboarded) { settings.onboarded = true; setStorage({ settings }); }
  tourIndex = 0;
  document.getElementById("tour").classList.remove("hidden");
  renderTourStep();
}

function endTour() {
  document.getElementById("tour").classList.add("hidden");
  switchView("inicio");
}

function renderTourStep() {
  const step = TOUR_STEPS[tourIndex];
  switchView(step.view);
  setTimeout(() => {
    const el = document.querySelector(step.sel);
    if (!el) { return advanceTour(); }
    // Asegura que el objetivo esté visible (clave en el popup de la extensión, que se desplaza)
    try { el.scrollIntoView({ block: "center", inline: "nearest" }); } catch (e) { /* ignora */ }
    // Mide y posiciona tras el desplazamiento
    requestAnimationFrame(() => positionTour(el, step));
  }, 45);
}

function positionTour(el, step) {
  const r = el.getBoundingClientRect();
  const pad = 8;
  const hole = document.getElementById("tour-hole");
  hole.style.left   = (r.left - pad) + "px";
  hole.style.top    = (r.top - pad) + "px";
  hole.style.width  = (r.width + pad * 2) + "px";
  hole.style.height = (r.height + pad * 2) + "px";

  document.getElementById("tour-text").textContent  = t(step.key);
  document.getElementById("tour-count").textContent = (tourIndex + 1) + " / " + TOUR_STEPS.length;
  const isLast = tourIndex === TOUR_STEPS.length - 1;
  document.getElementById("tour-next").textContent  = isLast ? t("tour_done") : t("tour_next");

  // Posiciona el globo cerca del objetivo (debajo si cabe, si no encima; acotado al viewport)
  const pop = document.getElementById("tour-pop");
  pop.style.visibility = "hidden";
  pop.style.left = "0px"; pop.style.top = "0px";
  const pw = pop.offsetWidth, ph = pop.offsetHeight;
  const vw = window.innerWidth, vh = window.innerHeight;
  let top = r.bottom + 12;
  if (top + ph > vh - 12) top = r.top - ph - 12;
  top = Math.max(12, Math.min(top, vh - ph - 12));
  let left = r.left + r.width / 2 - pw / 2;
  left = Math.max(12, Math.min(left, vw - pw - 12));
  pop.style.top = top + "px";
  pop.style.left = left + "px";
  pop.style.visibility = "visible";
}

function advanceTour() {
  tourIndex++;
  if (tourIndex >= TOUR_STEPS.length) endTour();
  else renderTourStep();
}

/* =================================================================
   EVENTOS
   ================================================================= */
function bindEvents() {
  // Perfil: nombre (con guardado ligero al escribir)
  const nameInput = document.getElementById("name-input");
  let nameTimer;
  nameInput.addEventListener("input", (e) => {
    profile.name = e.target.value.trim();
    document.getElementById("header-name").textContent = profile.name || "amig@";
    clearTimeout(nameTimer);
    nameTimer = setTimeout(() => setStorage({ profile }), 300);
  });

  // Botón rápido de tema (cabecera)
  document.getElementById("theme-toggle").addEventListener("click", () => {
    setTheme(settings.theme === "dark" ? "light" : "dark");
  });

  // Botón rápido de sonido (cabecera) = silenciar/activar TODOS los sonidos
  document.getElementById("sound-toggle").addEventListener("click", () => {
    const anyOn = settings.sound !== false || settings.soundTip !== false;
    setMasterSound(!anyOn);
  });

  // Controles del temporizador -> mensajes al background
  document.getElementById("btn-start").addEventListener("click", async () => {
    const res = await sendMsg({ type: "start", mode: selectedMode });
    if (res && res.state) { timerState = res.state; renderModeSelector(); renderTimer(); }
  });
  document.getElementById("btn-pause").addEventListener("click", async () => {
    const res = await sendMsg({ type: "pause" });
    if (res && res.state) { timerState = res.state; renderTimer(); }
  });
  document.getElementById("btn-resume").addEventListener("click", async () => {
    const res = await sendMsg({ type: "resume" });
    if (res && res.state) { timerState = res.state; renderTimer(); }
  });
  document.getElementById("btn-skip").addEventListener("click", async () => {
    const res = await sendMsg({ type: "skip" });
    if (res && res.state) { timerState = res.state; renderTimer(); }
  });
  document.getElementById("btn-stop").addEventListener("click", async () => {
    const res = await sendMsg({ type: "stop" });
    if (res && res.state) { timerState = res.state; renderModeSelector(); renderTimer(); }
  });

  // Fin de Jornada
  document.getElementById("btn-endday").addEventListener("click", openEndDay);
  document.getElementById("btn-endday-close").addEventListener("click", closeEndDay);

  // Onboarding / bienvenida
  document.getElementById("btn-onboarding-close").addEventListener("click", closeOnboarding);
  document.getElementById("btn-how").addEventListener("click", openOnboarding);

  // Tour interactivo (demo guiada)
  document.getElementById("btn-demo").addEventListener("click", startTour);
  document.getElementById("btn-demo2").addEventListener("click", startTour);
  document.getElementById("tour-next").addEventListener("click", advanceTour);
  document.getElementById("tour-skip").addEventListener("click", endTour);

  // Selector de idioma
  document.querySelectorAll("#lang-select .lang-btn").forEach((b) => {
    b.addEventListener("click", () => setLang(b.dataset.lang));
  });

  // Ajustes: tema
  document.getElementById("toggle-theme").addEventListener("change", (e) => {
    setTheme(e.target.checked ? "dark" : "light");
  });

  // Ajustes: SONIDO DE EJERCICIO (toggle + prueba + volumen propios)
  document.getElementById("toggle-sound").addEventListener("change", (e) => setSound(e.target.checked));
  document.getElementById("btn-test-sound").addEventListener("click", () => sendMsg({ type: "testSound", variant: "normal" }));
  const volSlider = document.getElementById("volume-slider");
  volSlider.addEventListener("input", (e) => {
    const v = clampVolume(e.target.value);
    settings.volume = v;
    updateVolumeVisual("volume-slider", "volume-value", v);
  });
  volSlider.addEventListener("change", (e) => setVolume(e.target.value, true));

  // Ajustes: SONIDO DE PÍLDORA (toggle + prueba + volumen propios)
  document.getElementById("toggle-sound-tip").addEventListener("change", (e) => setSoundTip(e.target.checked));
  document.getElementById("btn-test-tip").addEventListener("click", () => sendMsg({ type: "testSound", variant: "tip" }));
  const volSliderTip = document.getElementById("volume-slider-tip");
  volSliderTip.addEventListener("input", (e) => {
    const v = clampVolume(e.target.value);
    settings.volTip = v;
    updateVolumeVisual("volume-slider-tip", "volume-value-tip", v);
  });
  volSliderTip.addEventListener("change", (e) => setVolumeTip(e.target.value, true));

  // Ajustes: consejos emergentes
  document.getElementById("toggle-tips").addEventListener("change", async (e) => {
    settings.tips = e.target.checked;
    await setStorage({ settings });        // ← guardado local
    sendMsg({ type: "settingsChanged" });  // (re)programa o cancela las notificaciones
  });
  document.getElementById("tip-interval").addEventListener("change", (e) => {
    setTipInterval(e.target.value);
  });

  // Pausa de transición de 1 min entre fases
  document.getElementById("toggle-transition").addEventListener("change", async (e) => {
    settings.transition = e.target.checked;
    await setStorage({ settings });
  });

  // No molestar (horario silencioso)
  document.getElementById("toggle-dnd").addEventListener("change", async (e) => {
    settings.dnd = e.target.checked;
    await setStorage({ settings });
    sendMsg({ type: "settingsChanged" });
  });
  document.getElementById("dnd-from").addEventListener("change", async (e) => {
    settings.dndFrom = e.target.value || "21:00";
    await setStorage({ settings });
    sendMsg({ type: "settingsChanged" });
  });
  document.getElementById("dnd-to").addEventListener("change", async (e) => {
    settings.dndTo = e.target.value || "08:00";
    await setStorage({ settings });
    sendMsg({ type: "settingsChanged" });
  });

  // Reporte médico: periodo, referencia y observaciones
  document.getElementById("report-days").addEventListener("change", async (e) => {
    settings.reportDays = parseInt(e.target.value, 10) || 30;
    await setStorage({ settings });
    updatePrintReport();
  });
  const refInput = document.getElementById("report-ref");
  let refTimer;
  refInput.addEventListener("input", (e) => {
    settings.reportRef = e.target.value;
    updatePrintReport();
    clearTimeout(refTimer);
    refTimer = setTimeout(() => setStorage({ settings }), 300);
  });
  const notesInput = document.getElementById("report-notes");
  let notesTimer;
  notesInput.addEventListener("input", (e) => {
    settings.reportNotes = e.target.value;
    updatePrintReport();
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => setStorage({ settings }), 300);
  });

  // Duraciones
  document.getElementById("btn-reset-durations").addEventListener("click", resetDurations);
  document.getElementById("btn-add-phase").addEventListener("click", addRoutinePhase);
  document.getElementById("btn-reset-routine").addEventListener("click", resetRoutine);

  // Reporte médico en PDF (ventana propia + imprimir)
  document.getElementById("btn-report").addEventListener("click", openReport);
  // Exportar CSV (datos crudos · universal: extensión y web)
  document.getElementById("btn-export").addEventListener("click", exportCSV);

  // Reiniciar estadísticas
  document.getElementById("btn-reset").addEventListener("click", async () => {
    await setStorage({ stats: { ...DEFAULT_STATS } });
    renderStats(DEFAULT_STATS);
  });

  // Copia de seguridad (exportar / importar JSON)
  document.getElementById("btn-backup").addEventListener("click", exportBackup);
  document.getElementById("btn-restore").addEventListener("click", triggerRestore);
  document.getElementById("restore-file").addEventListener("change", handleRestoreFile);

  // Píldoras: mostrar otra selección de consejos
  document.getElementById("btn-more-pills").addEventListener("click", renderPills);

  // Navegación inferior (solo los botones con vista; el de "Café" es un enlace)
  document.querySelectorAll(".nav-btn[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });
}

/* =================================================================
   Sincronización con el background vía storage
   ================================================================= */
function onStorageChanged(changes, area) {
  if (area !== "local") return;
  if (changes.timerState) {
    timerState = { ...DEFAULT_TIMER, ...(changes.timerState.newValue || {}) };
    if (timerState.mode) selectedMode = timerState.mode;
    renderModeSelector();
    renderTimer();
  }
  if (changes.stats) {
    renderStats(changes.stats.newValue || DEFAULT_STATS);
  }
  if (changes.tipBadges) {
    tipBadges = changes.tipBadges.newValue || {};
    renderPillCategories();
    renderNavBadge();
  }
  if (changes.settings) {
    settings = { ...DEFAULT_SETTINGS, ...(changes.settings.newValue || {}) };
    lang = settings.lang || BVI18N.detectLang();
    applyI18n();
    applyTheme(settings.theme);
    renderSettingsToggles();
    renderLangUI();
    renderSoundUI();
    renderVolume();
    renderTipInterval();
    renderDnd();
    renderModeSelector();
    renderTimer();
    renderDurationsConfig();
  }
}
