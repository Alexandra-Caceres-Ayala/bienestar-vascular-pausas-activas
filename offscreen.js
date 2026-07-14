/* =================================================================
   BIENESTAR VASCULAR · offscreen.js
   Sintetiza los sonidos con la Web Audio API. Dos timbres distintos:
     · "normal"/"soft" -> campanilla de cristal (cambio de ejercicio)
     · "tip"           -> "ding-dong" descendente (píldoras / consejos)
   Ganancias altas + limitador (DynamicsCompressor) para sonar FUERTE
   sin saturar. El volumen (0–100) llega en el mensaje.
   ================================================================= */

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.target === "offscreen" && msg.type === "playSound") {
    playChime(msg.variant, msg.volume);
  }
});

function playChime(variant, volume) {
  try {
    const vol = (typeof volume === "number" ? volume : 50) / 100;
    if (vol <= 0) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (variant === "tip") playTip(ctx, vol);
    else playBell(ctx, variant, vol);
  } catch (e) {
    console.warn("No se pudo reproducir el sonido:", e);
  }
}

/* Limitador: deja subir mucho el volumen sin que sature/distorsione */
function makeLimiter(ctx) {
  const c = ctx.createDynamicsCompressor();
  c.threshold.value = -3;
  c.knee.value = 6;
  c.ratio.value = 12;
  c.attack.value = 0.003;
  c.release.value = 0.12;
  return c;
}

/* Campanilla de cristal: CAMBIO DE EJERCICIO ("normal") y transición ("soft") */
function playBell(ctx, variant, vol) {
  const now = ctx.currentTime;
  const isSoft = variant === "soft";
  const f0 = isSoft ? 1174.66 : 1318.51;   // Re6 / Mi6
  const decay = isSoft ? 0.7 : 1.1;
  const base = (isSoft ? 0.5 : 0.95) * vol; // mucho más volumen que antes

  const master = ctx.createGain();
  master.gain.value = base;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 600;
  const lim = makeLimiter(ctx);
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
}

/* "Ding-dong" descendente: PÍLDORAS / consejos (distinto a la campanilla) */
function playTip(ctx, vol) {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.85 * vol;           // mucho más volumen que antes
  const lim = makeLimiter(ctx);
  master.connect(lim); lim.connect(ctx.destination);

  const dur = 0.42;
  [{ f: 783.99, t: 0 }, { f: 523.25, t: 0.17 }].forEach((n) => {   // Sol5 -> Do5
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = n.f;
    const s = now + n.t;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.linearRampToValueAtTime(1, s + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    osc.connect(g); g.connect(master);
    osc.start(s); osc.stop(s + dur + 0.05);
  });
  setTimeout(() => ctx.close().catch(() => {}), 1300);
}
