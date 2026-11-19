# STOA · Disciplina estoica

Versión pública y monetizable de Disciplina. Web estática (HTML, CSS y JS, sin servidor). Todo se guarda en el navegador.

**Enlace:** https://rayanelhabil2-arch.github.io/Discipline/stoa/
(La app personal original sigue en https://rayanelhabil2-arch.github.io/Discipline/ y no se ha tocado.)

- Volver a ver la introducción: añade `?intro=1` al enlace.
- Abrir una pestaña directamente: `?go=foco`, `?go=estoa`, `?go=tu`, `?go=hab`.

## Lo que vas a querer cambiar: `js/config.js`

| Qué | Dónde |
|---|---|
| **Tu propia mascota** (por ejemplo, hecha con ChatGPT) | Sube los PNG a `img/mascota/` y rellena `MASCOT.image` o `MASCOT.images` (una imagen por estado de ánimo) |
| **Vídeos** | Sube el `.mp4` a `videos/` y pon `src: 'videos/nombre.mp4'`, o usa `youtube: 'ID'` |
| **Anuncios** | `ADS.enabled: true` con tu `client` de AdSense y el id de cada bloque. Hay 3 huecos: Hoy, Foco y Estoa. También puedes poner un patrocinador directo en `ADS.house` |
| **Premium** | `PREMIUM.enabled: true` muestra la tarjeta en «Tú» |

Frases, retos diarios, lecciones, rangos y frases de Marco: `js/data.js`.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Página |
| `css/app.css` | Todo el diseño |
| `js/mascot.js` | Marco, la mascota (SVG animado, 8 estados de ánimo) |
| `js/onboarding.js` | La introducción (18 pantallas) |
| `js/app.js` | Hoy, Hábitos, Foco, Estoa, Tú |
| `js/core.js` | Guardado, vibración, sonidos, animaciones |
