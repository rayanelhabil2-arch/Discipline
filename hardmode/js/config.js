/* ===========================================================
   CONFIGURACIÓN DE HARDMODE — lo que vas a querer cambiar está aquí.
   =========================================================== */
window.HM_CONFIG = {

  /* ---------- CUENTA ----------
     false = prototipo: se entra sin cuenta y todo se guarda en el móvil.
     true  = hay que crear cuenta (Supabase) antes de empezar, con ranking real entre usuarios. */
  AUTH_REQUIRED: false,

  /* ---------- CUENTAS (Supabase) ----------
     Tabla: hm_profiles. Clave pública (se puede ver; la seguridad está en las reglas de la base de datos). */
  SUPABASE: {
    url: 'https://dffavtchgwwrepunyids.supabase.co',
    key: 'sb_publishable_07Pc-ZT16chbdMX_pCzvKg_v_VIiL2z'
  },

  /* ---------- PAGOS (Stripe) ----------
     1. Crea en Stripe 3 «Payment Links» (semanal, mensual, anual) con prueba gratis si quieres.
     2. Pega cada enlace en "link". Al pagar, Stripe vuelve a la app.
     3. Para que el plan se active solo, falta un webhook de Stripe → Supabase (te lo monto cuando tengas Stripe).
     Mientras los enlaces estén vacíos, la app funciona en «modo demo»: enseña los planes pero no cobra. */
  PLANS: [
    { id: 'week',  name: 'Semanal', price: '2,99 €', per: '/semana', note: 'Para probar',          link: '' },
    { id: 'year',  name: 'Anual',   price: '29,99 €', per: '/año',   note: '2,50 €/mes · ahorra 75 %', best: true, trial: '3 días gratis', link: '' },
    { id: 'month', name: 'Mensual', price: '7,99 €', per: '/mes',    note: 'Cancela cuando quieras', link: '' }
  ],
  // true: hay que elegir plan para entrar (con «seguir gratis» escondido). false: el muro se puede saltar fácil.
  HARD_PAYWALL: true,
  // Lo que se queda sin pagar
  FREE_LIMITS: { habits: 3 },

  /* ---------- MASCOTA ----------
     Por defecto, TANK (SVG animado, js/mascot.js). Para usar tu propia mascota:
     sube los PNG a img/mascota/ y rellena image o images (una por estado de ánimo:
     calm, happy, proud, alert, sleepy, sad, cool, focus, angry). */
  MASCOT: { name: 'TANK', image: 'img/tank.webp', images: null },

  /* ---------- VÍDEOS ----------
     src: 'videos/archivo.mp4'  o  youtube: 'ID'.  pro: true = solo para quien paga. */
  VIDEOS: [
    { id: 'v1', title: 'La disciplina no se siente, se hace', tag: 'Disciplina', dur: '0:58', src: null, youtube: null, poster: null },
    { id: 'v2', title: 'La regla del 40 %', tag: 'Dolor', dur: '1:00', src: null, youtube: null, poster: null, pro: true },
    { id: 'v3', title: 'El espejo no miente', tag: 'Verdad', dur: '0:45', src: null, youtube: null, poster: null, pro: true },
    { id: 'v4', title: 'Callo mental: cómo se hace', tag: 'Dureza', dur: '1:12', src: null, youtube: null, poster: null, pro: true },
    { id: 'v5', title: '5 a. m. sin excusas', tag: 'Rutina', dur: '0:52', src: null, youtube: null, poster: null, pro: true }
  ],

  /* ---------- LEGAL ----------
     Rellena con tu nombre (o el de tu empresa) y un correo de contacto. Aparecen en legal.html. */
  LEGAL: { owner: '[Tu nombre o empresa]', contact: '[tu-correo@ejemplo.com]', updated: '20/11/2026' },

  /* ---------- ANUNCIOS (solo plan gratis) ----------
     enabled: true + client de AdSense + id de cada bloque. house: patrocinador directo. */
  ADS: { enabled: false, client: '', slots: { hoy: '', guerra: '', foco: '' }, house: null }
};
