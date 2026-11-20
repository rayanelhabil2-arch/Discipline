# HARDMODE · Entrena la mente (prototipo)

Web estática (HTML, CSS y JS). Cuentas y datos en Supabase (tabla `hm_profiles` del proyecto existente).

**Enlace:** https://rayanelhabil2-arch.github.io/Discipline/hardmode/
(La app personal Disciplina sigue en la raíz, sin cambios. `/stoa/` redirige aquí.)

- **Ahora mismo se entra sin cuenta** (`AUTH_REQUIRED: false` en `js/config.js`): todo se guarda en el móvil y el ranking es una vista previa con usuarios de ejemplo. Pon `true` para exigir cuenta.
- La introducción se ve una sola vez. Para enseñarla otra vez en un móvil, abre el enlace con `?reset=1` (borra los datos de ese móvil).
- Con cuentas activadas, `?mock=1` simula cuentas en el navegador para probar sin servidor.
- La intro tiene **Volver**, **Saltar** y barra de progreso, y un botón para **reducir movimiento** (también en Perfil; se guarda en `hm.calm`).
- Recordatorios (mañana, tarde, noche) configurables en la intro y en Perfil. Llegan con la app abierta o instalada; si no hay permiso de notificaciones, salen dentro de la app.

## Lo que vas a querer cambiar: `js/config.js`

| Qué | Dónde |
|---|---|
| **Pagos** | Pega tus Stripe Payment Links en `PLANS[].link`. Sin enlaces = modo demo (no cobra, desbloquea PRO para probar) |
| **Muro de pago** | `HARD_PAYWALL` y `FREE_LIMITS` |
| **Tu mascota** | PNG en `img/mascota/` y `MASCOT.image` o `MASCOT.images` |
| **Vídeos** | `.mp4` en `videos/` → `src`, o `youtube: 'ID'`. `pro: true` para bloquearlo |
| **Legal** | `LEGAL.owner` y `LEGAL.contact` (salen en `legal.html`, borrador de privacidad y condiciones) |
| **Anuncios** | `ADS.enabled`, `client` y `slots` de AdSense (solo se ven en el plan gratis) |

Textos (códigos, retos, preguntas del espejo, lecciones, rangos y frases de TANK): `js/data.js`.

## Base de datos

- `hm_profiles`: una fila por usuario (estado de la app en `data`, firma, `onboarded`, `plan`, `streak`, `xp`). Cada usuario solo ve y cambia la suya.
- El usuario no puede cambiarse el `plan` a sí mismo (lo hará el webhook de Stripe) ni quitar `onboarded` ni su firma.
- `hm_leaderboard()`: ranking público (usuario, racha y puntos). `hm_username_free()`: comprueba si un @usuario está libre.

## Pendiente para lanzarlo de verdad

1. Stripe: crear los 3 Payment Links y un webhook que ponga `plan = 'pro'` en `hm_profiles`.
2. Supabase → Authentication → URL Configuration: añadir `https://rayanelhabil2-arch.github.io/Discipline/hardmode/` a Redirect URLs (para el correo de confirmación).
3. Revisar `legal.html` con un profesional y rellenar `LEGAL` en la config antes de cobrar.
4. Recordatorios con la app cerrada: hace falta un service worker con notificaciones push (servidor). Ahora solo funcionan con la app abierta o instalada.

## Fuentes de las cifras

- 3 h 46 min al día de internet en el móvil: DataReportal, *Digital 2025 Global Overview Report* (febrero de 2025), media mundial de usuarios de internet.
- «Regla del 40 %»: idea popular de entrenamiento mental, presentada como tal (no es un dato científico).
- Días y años «regalados»: cálculo con las respuestas de cada persona; la fórmula se enseña en pantalla.
