/* Contenido de STOA: frases, retos, rangos, lecciones. */
window.STOA_DATA = {
  RANKS: [
    [0, '🪖', 'Recluta'], [3, '🛡️', 'Soldado'], [7, '🗡️', 'Hoplita'], [14, '⚔️', 'Guerrero'],
    [30, '🦅', 'Centurión'], [60, '🏛️', 'Legado'], [100, '🔱', 'Espartano'], [200, '👑', 'Emperador']
  ],

  QUOTES: [
    ['Tienes poder sobre tu mente, no sobre lo que pasa fuera. Date cuenta y encontrarás tu fuerza.', 'Marco Aurelio'],
    ['Al amanecer, cuando te cueste levantarte, piensa: me levanto para hacer mi trabajo.', 'Marco Aurelio'],
    ['No pierdas más tiempo hablando de cómo debe ser una buena persona. Sé una.', 'Marco Aurelio'],
    ['Lo que se interpone en el camino se convierte en el camino.', 'Marco Aurelio'],
    ['La felicidad de tu vida depende de la calidad de tus pensamientos.', 'Marco Aurelio'],
    ['No es que tengamos poco tiempo, es que perdemos mucho.', 'Séneca'],
    ['Sufrimos más en la imaginación que en la realidad.', 'Séneca'],
    ['Ningún viento es favorable para quien no sabe a qué puerto va.', 'Séneca'],
    ['Mientras aplazamos, la vida pasa.', 'Séneca'],
    ['La suerte es lo que ocurre cuando la preparación se encuentra con la oportunidad.', 'Séneca'],
    ['Primero decide quién quieres ser. Después haz lo que tengas que hacer.', 'Epicteto'],
    ['¿Hasta cuándo vas a esperar para exigirte lo mejor de ti?', 'Epicteto'],
    ['Nadie es libre si no es dueño de sí mismo.', 'Epicteto'],
    ['Las circunstancias no hacen al hombre; lo revelan.', 'Epicteto'],
    ['No son las cosas las que nos perturban, sino la opinión que tenemos de ellas.', 'Epicteto'],
    ['Si quieres mejorar, conténtate con parecer tonto en las cosas externas.', 'Epicteto']
  ],

  // Un reto pequeño cada día. Rotan por fecha.
  CHALLENGES: [
    ['Móvil fuera del cuarto', 'Duerme hoy con el móvil en otra habitación.'],
    ['Primera hora limpia', 'Nada de redes durante la primera hora después de despertarte.'],
    ['Agua fría', 'Termina la ducha con 30 segundos de agua fría.'],
    ['Una cosa incómoda', 'Haz hoy la tarea que más llevas evitando. Solo 10 minutos.'],
    ['Silencio', 'Camina 15 minutos sin música ni móvil. Solo piensa.'],
    ['Premeditatio malorum', 'Escribe lo peor que puede pasar hoy y cómo responderías.'],
    ['Sin quejas', 'Pasa el día entero sin quejarte en voz alta.'],
    ['Escribe a alguien', 'Da las gracias a una persona que te ayudó.'],
    ['Pantalla en gris', 'Pon el móvil en escala de grises todo el día.'],
    ['Ayuno de dopamina', 'Dos horas sin pantallas, sin comida basura, sin música.'],
    ['Orden', 'Deja tu mesa y tu cuarto impecables antes de dormir.'],
    ['Lee 20 páginas', 'De un libro de papel. Nada de resúmenes.']
  ],

  // Ejercicio de la dicotomía del control
  CONTROL: [
    ['Tu esfuerzo de hoy', true], ['Lo que piensen de ti', false], ['Cómo respondes a un insulto', true],
    ['El tiempo que hará mañana', false], ['A qué hora te acuestas', true], ['El pasado', false],
    ['Lo que comes', true], ['Si te eligen o no', false], ['Tus hábitos', true], ['La suerte', false],
    ['Cuánto usas el móvil', true], ['Las notas de los demás', false]
  ],

  // Lecciones cortas (pastillas de 1 minuto)
  LESSONS: [
    { t: 'La dicotomía del control', b: 'Divide todo en dos montones: lo que depende de ti y lo que no. Toda tu energía va al primero. Lo segundo lo aceptas sin pelear. Esto no es rendirse; es apuntar bien.' },
    { t: 'Memento mori', b: 'Recuerda que vas a morir. No para deprimirte, sino para dejar de actuar como si tuvieras tiempo infinito. Cada día que desperdicias no vuelve.' },
    { t: 'Amor fati', b: 'Ama lo que te pasa, también lo malo. Cada obstáculo es material de entrenamiento. Lo que te frena es exactamente lo que te va a hacer fuerte.' },
    { t: 'La regla de las dos faltas', b: 'Fallar un día es humano. Fallar dos seguidos es empezar un hábito nuevo. Si hoy fallas, mañana es innegociable.' },
    { t: 'El examen nocturno', b: 'Séneca, cada noche: ¿qué hice bien?, ¿en qué fallé?, ¿qué haré mejor mañana? Tres preguntas. Dos minutos. La diferencia en un año es enorme.' },
    { t: 'Premeditatio malorum', b: 'Imagina por la mañana lo que puede salir mal. Cuando pase, ya lo habrás vivido una vez y no te pillará desprevenido.' }
  ],

  // Hábitos sugeridos según lo que elige la persona en la introducción
  AREAS: [
    { id: 'estudio', em: '📚', name: 'Estudios', habit: 'Estudiar 1 h sin móvil' },
    { id: 'gym', em: '🏋️', name: 'Cuerpo', habit: 'Entrenar o caminar 30 min' },
    { id: 'sueno', em: '🌙', name: 'Sueño', habit: 'A la cama antes de las 23:30' },
    { id: 'movil', em: '📵', name: 'Móvil', habit: 'Menos de 2 h de pantalla' },
    { id: 'lectura', em: '📖', name: 'Lectura', habit: 'Leer 10 páginas' },
    { id: 'dinero', em: '💰', name: 'Dinero', habit: 'Ningún gasto impulsivo' },
    { id: 'mente', em: '🧘', name: 'Mente', habit: '10 min de silencio' },
    { id: 'manana', em: '☀️', name: 'Mañanas', habit: 'Levantarme sin posponer' }
  ],

  // Frases de Marco según el momento
  MARCO: {
    morning: ['Hoy no tienes que tener ganas. Tienes que empezar.', 'El día es tuyo. Todavía.', 'Levántate. El emperador ya está despierto.'],
    afternoon: ['¿Vas bien o vas a remontar? Las dos valen.', 'Media jornada. La otra media decide.', 'Un hábito más y hoy cuenta.'],
    night: ['Antes de dormir, el examen. Dos minutos.', 'Lo que no hiciste hoy, mañana sin excusas.', 'Cierra el día como un estoico.'],
    tap: ['No me toques, estoy siendo estoico.', 'Eso no depende de ti. Esto sí: tu siguiente hábito.', 'Ya. ¿Y tus hábitos?', 'Memento mori. Pero primero, el gym.', 'Respira. Vuelve a lo tuyo.'],
    done: ['Así se hace.', 'Uno más. Así se construye.', 'Disciplina es libertad.', 'Eso es. Sin ruido.'],
    all: ['Día cumplido. Hoy has ganado.', 'Perfecto. Esto es lo que eres ahora.']
  }
};
