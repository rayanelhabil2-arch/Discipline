/* Contenido de HARDMODE: códigos, retos, rangos, lecciones y frases de TANK. */
window.HM_DATA = {
  RANKS: [
    [0, '🧈', 'Blando'], [3, '🪖', 'Recluta'], [7, '🥊', 'Peleador'], [14, '🔩', 'Operador'],
    [30, '🐺', 'Salvaje'], [60, '⛓️', 'Inquebrantable'], [100, '🪨', 'Callo de acero'], [200, '💀', 'Leyenda']
  ],

  // Códigos: frases cortas para leer cada día (originales de HARDMODE)
  CODES: [
    'Nadie va a venir a salvarte. Ni hoy ni nunca. Eres tú.',
    'Cuando crees que no puedes más, vas por el 40 %.',
    'Las ganas son para aficionados. Tú tienes horario.',
    'El dolor de hoy es la fuerza de mañana. La comodidad de hoy es la deuda de mañana.',
    'Tu mente te miente para protegerte. No la escuches a la primera.',
    'Haz lo que odias hacer hasta que deje de mandar sobre ti.',
    'El espejo no acepta excusas. Tú tampoco deberías.',
    'Nadie recuerda el día que lo dejaste. Tú sí.',
    'Cada vez que cumples sin ganas, endureces la mente.',
    'Si fuera fácil, lo haría todo el mundo. Por eso lo haces tú.',
    'No te falta tiempo. Te sobra móvil.',
    'Ser duro no es no sentir. Es seguir sintiendo.',
    'Hoy es el día que vas a recordar cuando ganes.',
    'Tu excusa favorita es tu enemigo favorito.',
    'Gana la mañana y el día se rinde.',
    'No negocies contigo mismo. Siempre pierdes.'
  ],

  // Reto diario: rotan por fecha
  CHALLENGES: [
    ['Ducha helada', '2 minutos de agua fría. Sin gritar. Respira.'],
    ['100 flexiones', 'En las series que hagan falta, pero hoy.'],
    ['Móvil en otra habitación', 'Duerme hoy sin el móvil al lado.'],
    ['Lo que más odias', 'Haz primero la tarea que más llevas evitando.'],
    ['Madrugón', 'Despierta 1 hora antes de lo normal. Sin posponer.'],
    ['Cero quejas', 'Ni una queja en voz alta en todo el día.'],
    ['5 km', 'Andando o corriendo. Lo importante es terminar.'],
    ['Ayuno de dopamina', '3 horas sin pantallas, sin azúcar, sin música.'],
    ['Habla con miedo', 'Haz hoy esa llamada o esa conversación que evitas.'],
    ['Plancha al fallo', 'Aguanta la plancha hasta que no puedas. Luego 10 segundos más.'],
    ['Sin azúcar', 'Ni un gramo de azúcar añadido en 24 h.'],
    ['El espejo', 'Mírate 1 minuto al espejo y di en voz alta una verdad incómoda.']
  ],

  // Preguntas del espejo (cada día una)
  MIRROR: [
    '¿Qué excusa te has contado hoy?', '¿En qué te estás mintiendo?', '¿Qué estás evitando y por qué?',
    '¿Qué haría hoy la versión de ti que quieres ser?', '¿Qué te da miedo de verdad?', '¿Cuándo fue la última vez que te superaste?',
    '¿Quién se alegraría si lo dejas? Demuéstrale que se equivoca.'
  ],

  LESSONS: [
    { t: 'La regla del 40 %', b: 'Cuando tu mente dice «no puedo más», solo has gastado alrededor del 40 % de lo que tienes. El cuerpo aguanta mucho más que la cabeza. La próxima vez que quieras parar, haz un poco más. Ahí está el entrenamiento real.' },
    { t: 'El espejo de la verdad', b: 'Pega notas en tu espejo con tus objetivos y tus fallos, sin suavizarlos. Cada mañana los lees. No para castigarte, sino para no mentirte. Cuando cumplas uno, lo quitas y pones otro más difícil.' },
    { t: 'El frasco de victorias', b: 'Guarda cada cosa difícil que has superado. Cuando estés en tu peor momento, abre el frasco y recuerda quién eres. Tu pasado es tu mejor combustible.' },
    { t: 'Callo mental', b: 'Igual que la mano se endurece con el roce, la mente se endurece haciendo cosas incómodas a propósito. Cada día una. Sin falta. Eso es el callo.' },
    { t: 'La regla de las dos faltas', b: 'Fallar un día es humano. Fallar dos seguidos es empezar a ser otra persona. Si hoy fallas, mañana es innegociable.' },
    { t: 'Toma las almas', b: 'Cuando alguien duda de ti, no discutas. Cumple. Que tus resultados hablen. No hay venganza más elegante.' }
  ],

  AREAS: [
    { id: 'cuerpo', em: '🏋️', name: 'Cuerpo', habit: 'Entrenar al fallo' },
    { id: 'estudio', em: '📚', name: 'Estudios', habit: '2 h de estudio sin móvil' },
    { id: 'manana', em: '⏰', name: 'Madrugar', habit: 'Levantarme sin posponer' },
    { id: 'movil', em: '📵', name: 'Móvil', habit: 'Menos de 1 h de redes' },
    { id: 'frio', em: '🧊', name: 'Frío', habit: 'Ducha fría' },
    { id: 'correr', em: '🏃', name: 'Correr', habit: 'Correr o caminar 5 km' },
    { id: 'dinero', em: '💸', name: 'Dinero', habit: 'Cero gastos impulsivos' },
    { id: 'comida', em: '🥩', name: 'Comida', habit: 'Comer limpio todo el día' },
    { id: 'lectura', em: '📖', name: 'Leer', habit: 'Leer 20 páginas' },
    { id: 'sueno', em: '🌙', name: 'Dormir', habit: 'Cama antes de las 23:00' }
  ],

  TANK: {
    morning: ['Arriba. Nadie va a hacerlo por ti.', 'El día no te espera. Muévete.', '¿Ganas? No hacen falta.'],
    afternoon: ['¿Vas a cumplir o vas a explicar por qué no?', 'Mitad del día. Mitad del trabajo.', 'Te estoy mirando.'],
    night: ['Antes de dormir: el espejo.', 'Lo que no hiciste hoy, mañana el doble.', 'Cierra el día con la verdad.'],
    tap: ['¿Me tocas o te pones a trabajar?', 'Grrr. Vuelve a lo tuyo.', 'Ese hábito no se marca solo.', 'Menos tocar, más sudar.', 'Estoy aquí para que no pares.'],
    done: ['Eso.', 'Uno menos. Siguiente.', 'Así se endurece la mente.', 'Bien. No te relajes.'],
    all: ['Día ganado. Mañana más duro.', 'Hoy has sido quien dijiste que serías.'],
    fail: ['Ayer fallaste. Hoy no hay negociación.', 'Un fallo se perdona. Dos, no.']
  }
};
