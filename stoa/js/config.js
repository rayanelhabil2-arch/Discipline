/* ===========================================================
   CONFIGURACIÓN DE STOA — lo que vas a querer cambiar está aquí.
   =========================================================== */
window.STOA_CONFIG = {

  /* ---------- MASCOTA ----------
     Por defecto se dibuja Marco (SVG animado, js/mascot.js).
     Si quieres usar tu propia mascota (por ejemplo, una hecha con ChatGPT):
       1. Sube las imágenes (PNG con fondo transparente) a la carpeta  img/mascota/
       2. Rellena "image" con una sola imagen, o "images" con una por estado de ánimo.
     Ejemplo:
       image: 'img/mascota/marco.png',
       images: { calm:'img/mascota/calm.png', happy:'img/mascota/happy.png', proud:'img/mascota/proud.png',
                 alert:'img/mascota/alert.png', sleepy:'img/mascota/sleepy.png', sad:'img/mascota/sad.png',
                 cool:'img/mascota/cool.png', focus:'img/mascota/focus.png' }
  */
  MASCOT: {
    name: 'Marco',
    image: null,
    images: null
  },

  /* ---------- VÍDEOS ----------
     Cada vídeo puede ser:
       - un archivo subido a la carpeta videos/  →  src: 'videos/mi-video.mp4'
       - un vídeo de YouTube                     →  youtube: 'ID_DEL_VIDEO'
     Si no tiene src ni youtube, aparece como «Próximamente».
     poster: imagen de portada opcional (img/...).
  */
  VIDEOS: [
    { id: 'v1', title: 'El juego que juegas sin saberlo', tag: 'Dopamina', dur: '0:58', src: null, youtube: null, poster: null },
    { id: 'v2', title: 'Marco Aurelio en 60 segundos', tag: 'Estoicos', dur: '1:00', src: null, youtube: null, poster: null },
    { id: 'v3', title: 'La regla de las dos faltas', tag: 'Hábitos', dur: '0:45', src: null, youtube: null, poster: null },
    { id: 'v4', title: 'Lo que depende de ti', tag: 'Mente', dur: '1:12', src: null, youtube: null, poster: null },
    { id: 'v5', title: 'Memento mori: por qué ayuda', tag: 'Estoicos', dur: '0:52', src: null, youtube: null, poster: null }
  ],

  /* ---------- ANUNCIOS ----------
     Mientras enabled = false se ven huecos discretos «Espacio patrocinado» para ver dónde irán.
     Cuando tengas Google AdSense aprobado:
       enabled: true, client: 'ca-pub-XXXXXXXXXXXXXXXX', y pon el id de cada bloque en slots.
     También puedes usar «house»: un patrocinador directo con texto y enlace propios.
  */
  ADS: {
    enabled: false,
    client: '',
    slots: { hoy: '', estoa: '', foco: '' },
    house: null // ej.: { title: 'Tu marca aquí', text: 'Patrocina STOA', url: 'https://...' }
  },

  /* ---------- PREMIUM (para más adelante) ---------- */
  PREMIUM: {
    enabled: false,
    price: '3,99 €/mes',
    perks: ['Sin anuncios', 'Vídeos y lecciones exclusivas', 'Estadísticas completas', 'Mascota con más estados']
  }
};
