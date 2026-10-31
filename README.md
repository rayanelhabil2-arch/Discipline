# Disciplina · Panel de vida

App personal (PWA) para cumplir cada día: hábitos diarios, semanales y mensuales, agenda, estudios (notas por examen y nota necesaria), gym (rutina, peso corporal, calorías y récords), motivación y metas de ahorro.

Es una sola página estática (`index.html`), sin servidor ni registro.

## Dónde está publicada

https://rayanelhabil2-arch.github.io/Discipline/ (GitHub Pages, rama `gh-pages`). Cada cambio se sube a `main` y a `gh-pages`; la web se actualiza en un minuto más o menos.

## Datos

Todo se guarda en el navegador del móvil (`localStorage`, clave `panelVida.v1`). Para pasar los datos a otro móvil: **Metas → Copia de seguridad → Exportar** y luego **Importar** en el otro.

## Notificaciones

El sargento manda una frase a las 8, 15, 18, 21 y 23 h (hora de Madrid), aunque la app esté cerrada. Se activan en **Metas → Notificaciones** (en iPhone, solo abriendo la app desde el icono de la pantalla de inicio, iOS 16.4 o más).

- Servidor: Supabase (mismo proyecto que Habita). Tablas `disciplina_push_subs` (suscripciones; la app solo puede añadir) y `disciplina_config` (claves VAPID y secreto del cron; sin acceso público).
- Envío: función `supabase/functions/disciplina-push`, que `pg_cron` llama cada hora (tarea `disciplina-push-cada-hora`). Para cambiar frases u horas, edita `SLOTS` y vuelve a desplegarla.

## Instalar en el móvil

1. Abre https://rayanelhabil2-arch.github.io/Discipline/ en Safari.
2. Compartir → **Añadir a pantalla de inicio** → activa «Abrir como app web».

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Toda la app |
| `manifest.webmanifest` | Nombre, colores e icono de la app instalada |
| `sw.js` | Permite abrirla sin conexión. Si cambias algo y no se actualiza, sube la versión de `CACHE` |
| `icon-*.png` | Logo |
