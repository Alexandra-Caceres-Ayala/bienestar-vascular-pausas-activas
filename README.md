# 🌿 Bienestar Vascular · Pausas Activas

> **Micro-pausas activas, ejercicios guiados y píldoras de salud para cuidar tu circulación mientras trabajas o juegas — sin salir del navegador.**

![Dependencias](https://img.shields.io/badge/dependencias-0-4FB79A)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-f7df1e)
![PWA](https://img.shields.io/badge/PWA-instalable%20%2B%20offline-5A67D8)
![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-34A853)
![i18n](https://img.shields.io/badge/i18n-ES%20%7C%20EN-8a847b)
![Tests](https://img.shields.io/badge/tests-node%3Atest-success)

**Aplicación híbrida** desarrollada **desde cero y sin frameworks** (HTML + CSS + JavaScript Vanilla): un mismo código base funciona como **Web / PWA instalable** y como **extensión de Chrome (Manifest V3)**.

### 🔗 Pruébala ahora
**▶️ Demo en vivo:** https://alexandra-caceres-ayala.github.io/bienestar-vascular/
🧩 *En revisión para la Chrome Web Store.*

---

## 🎯 El problema que resuelve
Quienes pasan muchas horas frente a la pantalla acumulan sedentarismo, fatiga visual y mala circulación. **Bienestar Vascular** convierte los descansos en **pausas activas guiadas**: te avisa cuándo moverte, te dice **qué ejercicio hacer** y registra tu progreso — todo **local y privado**.

## ✨ Características

| Área | Qué ofrece |
|------|-----------|
| ⏱️ **Temporizador** | 3 modos (Profundo · Pomodoro · Gaming) + **editor de rutina personalizable** (crea tus propias fases de trabajo/pausa) |
| 🧍 **Ejercicios guiados** | En cada pausa, pasos concretos para moverte y estirar |
| 💊 **Píldoras de salud** | 120 consejos en 4 áreas: vista, ergonomía, circulación y desconexión mental |
| 📊 **Datos y seguimiento** | Estadísticas semanales, racha de días y **reporte PDF** de autoseguimiento |
| 🌍 **Bilingüe** | Interfaz y contenidos completos en **Español / English** (sistema i18n propio) |
| ♿ **Accesibilidad** | Tema claro/oscuro, foco visible por teclado y soporte de `prefers-reduced-motion` |
| 🔔 **Control fino** | Sonidos configurables e independientes, modo **«No molestar»** y atajos de teclado |
| 💾 **Tus datos** | **Copia de seguridad** (exportar/importar JSON) y tour interactivo de bienvenida |
| 🔒 **Privacidad** | 100% local — sin cuentas, sin servidores, sin analítica, sin anuncios |

## 🧠 Aspectos técnicos destacados
Proyecto diseñado y construido de punta a punta:

- **Arquitectura híbrida** Web/PWA + extensión MV3 con **código compartido** y un adaptador que enruta almacenamiento y notificaciones según el entorno (`localStorage` ↔ `chrome.storage.local`).
- **Sin dependencias ni frameworks** — HTML5, CSS3 y JavaScript Vanilla; fundamentos sólidos sin cajas negras.
- **Lógica pura y testeada:** el motor del temporizador y el cálculo de estadísticas viven en un módulo aislado (`core.js`), **cubierto por pruebas** con el runner nativo de Node (`node --test`).
- **Modelado de datos local:** perfil, ajustes, historial diario y racha, con **exportación a JSON** y generación de **reporte PDF** listo para imprimir.
- **PWA offline-first:** Service Worker con estrategia *network-first*, instalable en móvil y escritorio.
- **Internacionalización (i18n) a medida** (ES/EN): interfaz, ejercicios y las 120 píldoras.
- **UX cuidada:** diseño *Soft Productivity* (paleta pastel, accesible), onboarding y tour interactivo.

> Aunque es una app de bienestar, el proyecto integra **modelado de datos, persistencia local, generación de reportes, testing, i18n, accesibilidad y arquitectura de software** en un producto real y usable.

## 🗂️ Estructura
```
bienestar-vascular/
├── index.html              # entrada Web / PWA
├── popup.html              # entrada de la extensión
├── popup.css               # estilos (compartidos)
├── popup.js                # UI y lógica (compartida)
├── core.js                 # lógica pura del temporizador (con tests)
├── i18n.js                 # sistema de idiomas (ES / EN)
├── background.js           # service worker de la extensión (MV3)
├── offscreen.html / .js    # audio de la extensión (Web Audio)
├── sw.js                   # service worker de la PWA (offline)
├── manifest.json           # manifiesto de la extensión
├── manifest.webmanifest    # manifiesto de la PWA
├── privacy.html            # política de privacidad
├── icons/ · img/           # iconos e imágenes
└── tests/ · package.json   # pruebas (node --test)
```

## ▶️ Cómo usarlo

**Web / PWA** — ábrela desde la [demo en vivo](https://alexandra-caceres-ayala.github.io/bienestar-vascular/) y pulsa **«Instalar app»** en móvil o escritorio.
*(En la web los avisos llegan con la pestaña abierta; para recordatorios en segundo plano, usa la extensión.)*

**Extensión de Chrome (modo desarrollador)**
1. Entra en `chrome://extensions` y activa **Modo de desarrollador**.
2. Pulsa **Cargar descomprimida** → selecciona esta carpeta.
3. Fija el icono y ábrela.

## 🧪 Tests
```bash
npm test        # o: node --test
```

## 🔒 Privacidad
Toda la información se guarda **solo en tu dispositivo** (`localStorage` en la web, `chrome.storage.local` en la extensión). Sin cuentas, sin nube, sin seguimiento. Consulta la **[política de privacidad](https://alexandra-caceres-ayala.github.io/bienestar-vascular/privacy.html)**.

---

*Herramienta de **autocuidado y autorregistro**. No constituye un diagnóstico ni sustituye el consejo de un profesional de la salud.*

<sub>Desarrollado con foco en calidad, accesibilidad y privacidad · HTML + CSS + JavaScript Vanilla.</sub>
