# Disciplina · Panel de vida

App personal (PWA) para cumplir cada día: hábitos diarios, semanales y mensuales, agenda, estudios (notas por examen y nota necesaria), gym (rutina, peso corporal, calorías y récords), motivación y metas de ahorro.

Es una sola página estática (`index.html`), sin servidor ni registro.

## Datos

Todo se guarda en el navegador del móvil (`localStorage`, clave `panelVida.v1`). Para pasar los datos a otro móvil: **Metas → Copia de seguridad → Exportar** y luego **Importar** en el otro.

## Instalar en el móvil

1. Abre la dirección de Vercel en Safari.
2. Compartir → **Añadir a pantalla de inicio** → activa «Abrir como app web».

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Toda la app |
| `manifest.webmanifest` | Nombre, colores e icono de la app instalada |
| `sw.js` | Permite abrirla sin conexión. Si cambias algo y no se actualiza, sube la versión de `CACHE` |
| `icon-*.png` | Logo |
