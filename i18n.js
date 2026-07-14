/* =================================================================
   BIENESTAR VASCULAR · i18n.js
   Sistema de idiomas SIN frameworks. Patrón UMD (navegador/extensión/Node).
   Uso en el HTML:  <b data-i18n="clave">texto</b>
                    <input data-i18n-attr="placeholder:clave">
   Uso en JS:       t("clave")
   Idioma en settings.lang ("es" | "en"); si no, se autodetecta del navegador.
   ================================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BVI18N = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const STRINGS = {
    es: {
      /* Cabecera */
      "hello": "Hola,",
      "sound_title": "Silenciar sonidos",
      "theme_title": "Cambiar tema",
      /* Navegación */
      "nav_home": "Inicio", "nav_progress": "Progreso", "nav_pills": "Píldoras",
      "nav_settings": "Ajustes", "nav_coffee": "Café",
      /* Inicio */
      "your_name": "Tu nombre", "name_ph": "Escribe tu nombre…",
      "your_avatar": "Tu avatar",
      "ready": "Listo para empezar", "pick_mode": "Elige un modo y pulsa Iniciar 🌿",
      "start": "▶️ Iniciar", "resume": "▶️ Reanudar", "pause": "⏸️ Pausar",
      "skip": "⏭️ Saltar", "stop": "⏹️ Detener",
      "endday": "🌙 Fin de Jornada",
      "web_note": "💡 En la web, mantén esta pestaña abierta para recibir los avisos a tiempo. Para recordatorios en segundo plano, instala la extensión de Chrome.",
      "exercises_suggested": "Ejercicios sugeridos",
      /* Progreso */
      "progress_title": "📊 Tu semana",
      "stat_movement": "Tiempo en movimiento",
      "stat_streak": "Racha de días seguidos",
      "breaks_week": "Pausas activas esta semana",
      "progress_hint": "Cada pausa de pie, movimiento o descanso que completas suma a tu progreso. 💪",
      "report_period": "Periodo del resumen del reporte",
      "last7": "Últimos 7 días", "last30": "Últimos 30 días", "last90": "Últimos 90 días",
      "report_ref": "Referencia / Nº de historia clínica (opcional)",
      "report_ref_ph": "Ej. HC-12345",
      "report_notes": "Observaciones para el profesional (opcional)",
      "report_notes_ph": "Ej. Molestias al final del día, medicación actual…",
      "btn_report": "📄 Descargar reporte médico (PDF)",
      "btn_export": "📥 Exportar datos crudos (CSV)",
      "pdf_csv_hint": "El PDF es el reporte para el médico (logo, paciente, datos y observaciones). El CSV son los datos en bruto para analizar.",
      /* Píldoras */
      "pills_title": "💊 Píldoras de salud",
      "more_pills": "🔀 Ver otros consejos",
      /* Ajustes */
      "settings_title": "⚙️ Ajustes",
      "how_it_works": "❔ ¿Cómo funciona?",
      "language": "Idioma",
      "dark_mode": "Modo oscuro",
      "dark_mode_hint": "Cambia entre tema claro y oscuro.",
      "sound_ex": "Sonido de ejercicio 🔔",
      "sound_ex_hint": "Campanilla de cristal al cambiar de fase o ejercicio.",
      "test_sound_ex": "🎵 Probar sonido de ejercicio",
      "sound_pill": "Sonido de píldora 💊",
      "sound_pill_hint": "Aviso distinto al recibir un consejo de salud.",
      "test_sound_pill": "💊 Probar sonido de píldora",
      "tips_toggle": "Recibir consejos emergentes",
      "tips_toggle_hint": "Notificaciones ocasionales con una píldora de salud al azar.",
      "freq_every": "Frecuencia: cada", "minutes": "min",
      "transition": "Pausa de transición ⏳",
      "transition_hint": "1 minuto entre fases para colocarte antes del siguiente movimiento.",
      "dnd": "No molestar 🌙",
      "dnd_hint": "Silencia avisos y sonidos en el horario que elijas (por ejemplo, tu descanso).",
      "from": "Desde", "to": "Hasta",
      "custom_durations": "⏱️ Personalizar duraciones",
      "custom_durations_hint": "Ajusta los minutos de cada fase. Las marcadas con cuenta son las pausas activas: solo esas suman a tu progreso y al reporte PDF.",
      "reset_durations": "↩️ Restablecer duraciones",
      "my_routine": "🛠️ Mi rutina personalizada",
      "my_routine_hint": "Crea tu propia secuencia. En cada fase elige si es 💻 Trabajo (concentración) o 🧍 Pausa (te levantas y te mueves). En las Pausas verás ejercicios guiados y contarán en tu progreso. Se usa en el modo 🛠️ Mi rutina.",
      "add_phase": "➕ Añadir fase",
      "reset_routine": "↩️ Restablecer rutina de ejemplo",
      "backup": "Copia de seguridad",
      "backup_hint": "Guarda o restaura todos tus datos (perfil, ajustes, historial y racha) en un archivo local. Útil al cambiar de navegador o antes de limpiar los datos del sitio.",
      "backup_export": "💾 Exportar copia de seguridad (JSON)",
      "backup_import": "📂 Importar copia de seguridad",
      "reset_stats": "🧹 Reiniciar estadísticas",
      "coffee_btn": "Invítame un café ☕",
      "support_hint": "¿Te ayuda a moverte y cuidarte? Puedes apoyar el proyecto 💚",
      "privacy_hint": "Toda tu información se guarda solo en tu dispositivo. Sin nube, sin cuentas.",
      "rt_work": "💻 Trabajo", "rt_pause": "🧍 Pausa", "rt_counts": "cuenta",
      /* Onboarding */
      "ob_welcome": "👋 Te damos la bienvenida",
      "ob_sub": "Pausas activas y píldoras de salud para cuidarte mientras trabajas o juegas.",
      "ob_1": "Elige un modo (Profundo, Pomodoro o Gaming) y pulsa Iniciar. Te avisamos cuándo moverte.",
      "ob_2": "En cada pausa verás ejercicios guiados: solo sigue los pasos.",
      "ob_3": "Recibe píldoras de salud: consejos rápidos para tu vista, postura y circulación.",
      "ob_4": "Consulta tu progreso y descarga un reporte para tu médico si lo necesitas.",
      "ob_note": "Es una herramienta de autocuidado y autorregistro. No sustituye el consejo de un profesional de la salud.",
      "ob_start": "¡Empezar! 🌿",
      "demo_btn": "▶ Ver demo guiada",
      "tour_next": "Siguiente", "tour_skip": "Saltar", "tour_done": "¡Listo! 🌿",
      "tour_modes": "Elige tu modo: Profundo, Pomodoro, Gaming o tu propia rutina.",
      "tour_start": "Pulsa Iniciar y el temporizador te avisará cuándo moverte.",
      "tour_ring": "Aquí ves la cuenta atrás y en qué fase estás.",
      "tour_progress": "En Progreso ves tu tiempo en movimiento y tu racha de días.",
      "tour_pills": "En Píldoras tienes consejos rápidos de salud para tu día.",
      "tour_settings": "En Ajustes cambias idioma, sonidos y creas tu propia rutina.",
      /* Fin de Jornada */
      "endday_title": "🌙 Fin de Jornada",
      "endday_text_html": "Túmbate y <strong>eleva las piernas contra la pared</strong> durante <strong>5–10 minutos</strong>. Ayuda al retorno venoso y descansa tus piernas tras un día sentad@.",
      "endday_close": "Cerrar 🌿",
      "breathe": "Respira",
      /* Alerts de copia de seguridad */
      "alert_invalid": "El archivo no parece una copia válida de Bienestar Vascular.",
      "alert_confirm_restore": "Esto reemplazará tus datos actuales (perfil, ajustes, historial y racha) por los de la copia. ¿Continuar?",
      "alert_restored": "Copia restaurada correctamente. Se recargará la aplicación.",
      "alert_read_error": "No se pudo leer el archivo: "
    },
    en: {
      "hello": "Hi,",
      "sound_title": "Mute sounds",
      "theme_title": "Switch theme",
      "nav_home": "Home", "nav_progress": "Progress", "nav_pills": "Tips",
      "nav_settings": "Settings", "nav_coffee": "Coffee",
      "your_name": "Your name", "name_ph": "Type your name…",
      "your_avatar": "Your avatar",
      "ready": "Ready to start", "pick_mode": "Pick a mode and press Start 🌿",
      "start": "▶️ Start", "resume": "▶️ Resume", "pause": "⏸️ Pause",
      "skip": "⏭️ Skip", "stop": "⏹️ Stop",
      "endday": "🌙 End of Day",
      "web_note": "💡 On the web, keep this tab open to get reminders on time. For background reminders, install the Chrome extension.",
      "exercises_suggested": "Suggested exercises",
      "progress_title": "📊 Your week",
      "stat_movement": "Time moving",
      "stat_streak": "Day streak",
      "breaks_week": "Active breaks this week",
      "progress_hint": "Every standing break, movement or rest you complete adds to your progress. 💪",
      "report_period": "Report summary period",
      "last7": "Last 7 days", "last30": "Last 30 days", "last90": "Last 90 days",
      "report_ref": "Reference / Medical record no. (optional)",
      "report_ref_ph": "e.g. MR-12345",
      "report_notes": "Notes for the professional (optional)",
      "report_notes_ph": "e.g. Discomfort at end of day, current medication…",
      "btn_report": "📄 Download medical report (PDF)",
      "btn_export": "📥 Export raw data (CSV)",
      "pdf_csv_hint": "The PDF is the report for the doctor (logo, patient, data and notes). The CSV is the raw data to analyze.",
      "pills_title": "💊 Health tips",
      "more_pills": "🔀 Show other tips",
      "settings_title": "⚙️ Settings",
      "how_it_works": "❔ How it works",
      "language": "Language",
      "dark_mode": "Dark mode",
      "dark_mode_hint": "Switch between light and dark theme.",
      "sound_ex": "Exercise sound 🔔",
      "sound_ex_hint": "Crystal chime when a phase or exercise changes.",
      "test_sound_ex": "🎵 Test exercise sound",
      "sound_pill": "Tip sound 💊",
      "sound_pill_hint": "A different alert when you get a health tip.",
      "test_sound_pill": "💊 Test tip sound",
      "tips_toggle": "Receive pop-up tips",
      "tips_toggle_hint": "Occasional notifications with a random health tip.",
      "freq_every": "Frequency: every", "minutes": "min",
      "transition": "Transition break ⏳",
      "transition_hint": "1 minute between phases to get set before the next movement.",
      "dnd": "Do not disturb 🌙",
      "dnd_hint": "Mutes alerts and sounds during the hours you choose (e.g. your rest time).",
      "from": "From", "to": "To",
      "custom_durations": "⏱️ Customize durations",
      "custom_durations_hint": "Adjust the minutes of each phase. Those marked counts are the active breaks: only those add to your progress and the PDF report.",
      "reset_durations": "↩️ Reset durations",
      "my_routine": "🛠️ My custom routine",
      "my_routine_hint": "Build your own sequence. For each phase choose 💻 Work (focus) or 🧍 Break (you stand up and move). Breaks show guided exercises and count toward your progress. Used in the 🛠️ My routine mode.",
      "add_phase": "➕ Add phase",
      "reset_routine": "↩️ Reset to sample routine",
      "backup": "Backup",
      "backup_hint": "Save or restore all your data (profile, settings, history and streak) to a local file. Handy when switching browsers or before clearing site data.",
      "backup_export": "💾 Export backup (JSON)",
      "backup_import": "📂 Import backup",
      "reset_stats": "🧹 Reset statistics",
      "coffee_btn": "Buy me a coffee ☕",
      "support_hint": "Does it help you move and take care of yourself? You can support the project 💚",
      "privacy_hint": "All your information is stored only on your device. No cloud, no accounts.",
      "rt_work": "💻 Work", "rt_pause": "🧍 Break", "rt_counts": "counts",
      "ob_welcome": "👋 Welcome",
      "ob_sub": "Active breaks and health tips to take care of yourself while you work or play.",
      "ob_1": "Pick a mode (Deep, Pomodoro or Gaming) and press Start. We'll tell you when to move.",
      "ob_2": "On each break you'll see guided exercises: just follow the steps.",
      "ob_3": "Get health tips: quick advice for your eyes, posture and circulation.",
      "ob_4": "Check your progress and download a report for your doctor if you need it.",
      "ob_note": "This is a self-care and self-tracking tool. It does not replace advice from a health professional.",
      "ob_start": "Get started! 🌿",
      "demo_btn": "▶ Watch guided demo",
      "tour_next": "Next", "tour_skip": "Skip", "tour_done": "Done! 🌿",
      "tour_modes": "Pick your mode: Deep, Pomodoro, Gaming or your own routine.",
      "tour_start": "Press Start and the timer will tell you when to move.",
      "tour_ring": "Here you see the countdown and which phase you're in.",
      "tour_progress": "In Progress you see your time moving and your day streak.",
      "tour_pills": "In Tips you get quick health advice for your day.",
      "tour_settings": "In Settings you change language, sounds and build your routine.",
      "endday_title": "🌙 End of Day",
      "endday_text_html": "Lie down and <strong>raise your legs against the wall</strong> for <strong>5–10 minutes</strong>. It helps venous return and rests your legs after a day sitting.",
      "endday_close": "Close 🌿",
      "breathe": "Breathe",
      "alert_invalid": "The file doesn't look like a valid Bienestar Vascular backup.",
      "alert_confirm_restore": "This will replace your current data (profile, settings, history and streak) with the backup. Continue?",
      "alert_restored": "Backup restored successfully. The app will reload.",
      "alert_read_error": "Couldn't read the file: "
    }
  };

  /* ---------------------------------------------------------------
     CONTENIDO (modos, fases, ejercicios) traducido.
     Para "es" se usa el contenido original de la app (MODES/EXERCISES);
     aquí solo van las traducciones de "en", indexadas por el nombre
     ESPAÑOL de la fase (que es la clave estable interna).
     --------------------------------------------------------------- */
  const CONTENT = {
    en: {
      modes: {
        deep:     { name: "Deep Work",  label: "Deep" },
        pomodoro: { name: "Pomodoro",   label: "Pomodoro" },
        gaming:   { name: "Gaming",     label: "Gaming" },
        custom:   { name: "My routine", label: "My routine" }
      },
      phaseNames: {
        "Sentado": "Sitting", "De pie": "Standing", "Movimiento": "Movement",
        "Enfoque": "Focus", "Descanso": "Break",
        "Partida": "Match", "Micro-movimiento": "Micro-movement",
        "Trabajo": "Work", "Pausa activa": "Active break",
        "Prepárate": "Get ready"
      },
      phaseTips: {
        "Sentado": "Keep your back supported and your feet flat on the floor.",
        "De pie": "Stand up: get your legs' circulation going.",
        "Movimiento": "Walk and stretch. Your muscle pump moves the blood.",
        "Enfoque": "Focus on a single task, no distractions.",
        "Descanso": "Look away from the screen and move a little.",
        "Partida": "Game on! Keep a comfy, relaxed posture.",
        "Micro-movimiento": "Circle your ankles and flex your toes.",
        "Trabajo": "Focus on your task.",
        "Pausa activa": "Stand up and move a little.",
        "Prepárate": "Get ready for the next movement. Settle in calmly (sit or stand up)."
      },
      exercises: {
        "De pie": [
          "Stand up and stretch your arms toward the ceiling (10s).",
          "Roll your shoulders backward, 8 times.",
          "March in place lifting your knees, 20 steps.",
          "Shift your weight from one leg to the other."
        ],
        "Movimiento": [
          "Walk a bit: get some water or take a stroll.",
          "Stretch your calves with your hands on the wall.",
          "Do ankle circles, 10 with each foot.",
          "Bring your ear to your shoulder and stretch your neck (both sides)."
        ],
        "Descanso": [
          "Look at a distant point for 20s (20-20-20 rule).",
          "Stand up and stretch your back upward.",
          "Roll your shoulders and open your chest.",
          "Take a sip of water."
        ],
        "Micro-movimiento": [
          "Ankle circles, 10 in each direction.",
          "Curl and stretch your toes.",
          "Shrug and release your shoulders, 8 times.",
          "Squeeze and release your glutes, 10 times."
        ],
        "_default": [
          "Stand up and stretch your arms toward the ceiling (10s).",
          "Gently roll your shoulders and neck.",
          "Walk or march in place for 20–30 seconds.",
          "Take a sip of water and look away from the screen."
        ]
      },
      routineTips: {
        pause: "It's your break: stand up and move a little.",
        work: "Time to focus on your task."
      },
      pills: {
        visual: {
          label: "Eye health",
          tips: [
            "20-20-20 rule: every 20 minutes, look at something 6 meters away for 20 seconds.",
            "Blink on purpose: we blink up to 60% less in front of a screen.",
            "Lower the brightness and enable your screen's warm mode at dusk.",
            "Place the monitor an arm's length away, top edge at eye level.",
            "Look away and focus on a distant object for 10 seconds to relax the lens.",
            "Use soft ambient light: avoid glare and harsh contrast on the screen.",
            "Enlarge the text a bit so you don't lean in or strain your eyes.",
            "Drink water: dry eyes get worse with dehydration.",
            "Do 'palming': cover your closed eyes with your palms for 20 seconds to rest them.",
            "Move your eyes in slow circles and side to side to relax the eye muscles.",
            "Avoid looking at your phone in the dark; turn on a soft background light.",
            "Clean your screen: dust and smudges make your eyes work harder.",
            "Place the monitor perpendicular to windows to reduce glare.",
            "Every hour, look out the window for 30 seconds: natural light relaxes your eyes.",
            "If you feel eye strain, close your eyes and breathe deeply for a few seconds.",
            "Increase text contrast to read without strain (dark letters on a light background).",
            "Rest your eyes by looking at the horizon or something green for a few seconds.",
            "Avoid the screen reflecting a window or lamp behind you.",
            "Reduce screen time in the last hour before sleep.",
            "If you wear glasses, keep the lenses clean: dirty ones tire your eyes.",
            "Blink ten times slowly in a row to spread your tears evenly.",
            "Put your phone at eye level so you don't lower your head.",
            "Increase the cursor size if you often lose sight of it.",
            "Alternate close-up tasks with looking into the distance every so often.",
            "Enable the system's night mode when the ambient light drops.",
            "Avoid rubbing your eyes; if they itch, close them and rest a moment.",
            "Work with even lighting, not a single spotlight aimed at the screen.",
            "If your vision blurs at the end of the day, it's a sign to rest your eyes.",
            "Look away from the screen while you think of your answer.",
            "Every couple of hours, step into a spot with more natural light for a moment."
          ]
        },
        ergonomia: {
          label: "Ergonomics",
          tips: [
            "Rest your lower back against the backrest and keep your feet flat on the floor.",
            "Elbows at 90°: the keyboard should be at your forearms' height.",
            "Avoid crossing your legs for long: it hampers venous return.",
            "Change your posture every 30 minutes; the best seat is the one you change often.",
            "Place the screen right in front so you don't turn your neck.",
            "Relax your shoulders: consciously drop them away from your ears.",
            "Keep your wrists straight when typing; use a wrist rest if it helps.",
            "Keep the mouse close to the keyboard so you don't reach with your arm.",
            "If you can, alternate working standing for a while with a raised desk.",
            "Your feet should reach the floor; if not, use a footrest.",
            "The head is heavy: keep it aligned over your shoulders, not forward.",
            "Adjust the chair so your knees are at hip height.",
            "Use headphones for the phone and don't tilt your neck to hold it.",
            "Every hour, gently arch your back backward to relieve your lower back.",
            "Keep what you use most within reach to avoid repeated twisting.",
            "Rest the soles of your feet fully, no tiptoes or heels in the air.",
            "Distribute your weight evenly on both glutes when sitting.",
            "Don't hunch your shoulders when using the mouse; keep your arm relaxed.",
            "Adjust the chair until your forearms are parallel to the floor.",
            "Avoid resting your chin on your hand for long: it strains the neck.",
            "Use a laptop stand and an external keyboard if you work for hours.",
            "Stand up to talk on the phone and relieve your back.",
            "Turn your whole body, not just your neck, to look to the side.",
            "If you can, switch spots for a while to vary your body's support points.",
            "Stretch your hands and open and close your fingers every so often.",
            "Place documents on a stand at screen height.",
            "Don't sit on the edge of the chair; use the whole seat.",
            "Relax your jaw: we tend to clench it when concentrating.",
            "Do gentle backward shoulder rolls several times a day.",
            "Adjust the armrests so they don't force you to hunch your shoulders."
          ]
        },
        circulacion: {
          label: "Circulation",
          tips: [
            "Do 10 circles with each ankle: activate the calf pump.",
            "Rise onto your toes 15 times to push blood from your legs to your heart.",
            "Stay hydrated: free-flowing blood circulates better through your veins.",
            "Stand up and walk for 2 minutes every hour to prevent venous stasis.",
            "At the end of the day, raise your legs against the wall for 5–10 minutes.",
            "Avoid sitting for long with your legs crossed or dangling.",
            "Tense and release your calves and glutes while seated to move the blood.",
            "Wiggle your toes inside your shoes several times a day.",
            "March in place for 30 seconds to reactivate circulation.",
            "Stretch your calves by resting the ball of your foot on a step.",
            "If your legs feel heavy, walk a bit: movement relieves them.",
            "Wear clothes and socks that don't squeeze your calves and ankles.",
            "Alternate sitting and standing so you don't slow the flow in your legs.",
            "Breathe deeply with your diaphragm: it also helps venous return.",
            "Shift your weight from one foot to the other while standing.",
            "Take the stairs instead of the elevator when you can: they work your legs.",
            "Stretch your quad while standing, bringing your heel toward your glute for a few seconds.",
            "Seated, raise and lower your heels repeatedly (calf pump).",
            "Take a short walk after eating to boost circulation.",
            "Avoid crossing your ankles for long under the desk.",
            "If your legs feel tired, rest a few minutes with your feet up.",
            "Squeeze and release a soft ball with your foot to move your ankle.",
            "Walk a few steps on your toes and then a few on your heels.",
            "Avoid prolonged direct heat on your legs.",
            "Stretch behind your knee by pulling your toes toward you.",
            "Standing, do small hip sways to activate your legs.",
            "Spread out your breaks: better to move a little and often than a lot at once.",
            "If you travel or sit a lot, move your ankles and legs every so often.",
            "Finish your shower with cool-ish water on your legs if it feels good.",
            "Move daily and keep a healthy weight: your circulation will thank you."
          ]
        },
        desconexion: {
          label: "Unplug",
          tips: [
            "4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. Repeat 4 times.",
            "Screen-free micro-break: look out the window and drop your shoulders.",
            "Set a clear end to your workday: your brain needs to know it's over.",
            "Stretch your neck, bringing your ear to your shoulder, 20s per side.",
            "Take 5 slow breaths through your nose before the next task.",
            "Stand up and drink a glass of water without looking at your phone.",
            "Name 3 things you can hear right now: it anchors you to the present.",
            "Close your eyes for 30 seconds and relax your jaw and forehead.",
            "Think while walking for a minute, instead of sitting.",
            "Jot down what's worrying you in a note to get it off your mind.",
            "Stretch your arms to the ceiling and inhale deeply as you get up from the chair.",
            "Take a real break mid-morning and mid-afternoon, screen-free.",
            "Step into natural light for a few minutes: it regulates your energy.",
            "Slow down when eating and chew screen-free for a few minutes.",
            "End the day by noting one good thing you did today.",
            "Do one thing at a time for a while: it reduces mental fatigue.",
            "Mute non-urgent notifications while you focus.",
            "Take 3 deep breaths before replying to something that stressed you.",
            "Relax your jaw and lower your tongue from your palate to unwind.",
            "Cross one arm over your chest and stretch it for 15 seconds per side.",
            "Look at a pleasant photo or memory for 20 seconds to lower stress.",
            "Tidy your desk for a minute: a clear space calms the mind.",
            "Drink water or tea calmly, without doing anything else at the same time.",
            "Silently give thanks for one small thing from your day.",
            "Take a standing break looking out the window, without your phone.",
            "Stretch your fingers and shake out your hands to release tension.",
            "Play some calm music for a couple of minutes between tasks.",
            "Smile on purpose for a few seconds: it relaxes your face and mood.",
            "Walk to get water and come back: a micro-break for body and mind.",
            "Before sleep, put screens away and breathe slowly for a few minutes."
          ]
        }
      }
    }
  };

  /* Devuelve el bloque de contenido traducido del idioma, o null (=> usar original en español). */
  function content(lang) { return CONTENT[lang] || null; }

  function detectLang() {
    try {
      const l = (navigator.language || "es").slice(0, 2).toLowerCase();
      return STRINGS[l] ? l : "es";
    } catch (e) { return "es"; }
  }

  function t(lang, key) {
    const L = STRINGS[lang] ? lang : "es";
    return (STRINGS[L] && STRINGS[L][key]) || STRINGS.es[key] || key;
  }

  return { STRINGS, CONTENT, content, detectLang, t, langs: ["es", "en"] };
});
