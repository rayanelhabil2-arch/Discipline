/* Utilidades: estado guardado, vibración, animaciones pequeñas. */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const later = (f, ms) => setTimeout(f, ms);
  const every = (f, ms) => setInterval(f, ms);
  // Movimiento reducido: preferencia del sistema o interruptor propio (hm.calm = '1' activa, '0' fuerza animaciones)
  const sysReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const calmPref = () => { try { return localStorage.getItem('hm.calm'); } catch (e) { return null; } };
  const calm = () => { const p = calmPref(); return p === '1' || (p !== '0' && sysReduce); };
  const setCalm = on => { try { localStorage.setItem('hm.calm', on ? '1' : '0'); } catch (e) { } document.documentElement.classList.toggle('calm', on); };
  document.documentElement.classList.toggle('calm', calm());

  // Fechas en hora local
  const dkey = d => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const addDays = (k, n) => { const [y, m, d] = k.split('-').map(Number); const x = new Date(y, m - 1, d + n); return dkey(x); };
  const dayIndex = () => Math.floor((new Date() - new Date(2024, 0, 1)) / 864e5);

  // Estado
  const KEY = 'hm.v1';
  const DEF = { v: 1, onboarded: false, name: '', username: '', age: 18, hours: 4, areas: [], goals: ['', '', ''], why: '', excuse: '', doubter: '', habits: [], log: {}, reviews: {}, retos: {}, jar: [], xp: 0, focusMin: 0, focusN: 0, push40: 0, lessons: {}, codeSeen: '', bestStreak: 0, rankSeen: 0, plan: 'free', created: dkey() };
  let S;
  try { S = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = Object.assign({}, DEF); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } if (window.Cloud) Cloud.queue(); };

  // Vibración (Android; en iPhone no hace nada)
  const vib = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { } };
  const H = { tick: () => vib(6), thud: () => vib(28), success: () => vib([12, 60, 18, 60, 30]) };

  // Pequeño "clic" sonoro sintetizado (solo tras interacción del usuario)
  let ac;
  function tone(f, d, v) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f; g.gain.value = v || .04;
      o.connect(g); g.connect(ac.destination); o.start();
      g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + (d || .12)); o.stop(ac.currentTime + (d || .12));
    } catch (e) { }
  }

  // Contador animado
  function count(el, to, o) {
    o = o || {}; const dur = calm() ? 1 : (o.dur || 1200), dec = o.dec || 0, from = o.from || 0, t0 = performance.now();
    (function f(t) {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3), v = from + (to - from) * e;
      el.innerHTML = (o.pre || '') + v.toFixed(dec).replace('.', ',') + (o.suf ? '<small>' + o.suf + '</small>' : '');
      if (k < 1) requestAnimationFrame(f); else o.done && o.done();
    })(t0);
  }

  // Máquina de escribir
  function type(el, text, o) {
    o = o || {}; const sp = calm() ? 0 : (o.speed || 34); let i = 0;
    el.innerHTML = '<span></span><i class="caret"></i>';
    const sp1 = el.firstChild;
    if (!sp) { sp1.textContent = text; o.done && o.done(); return; }
    (function step() {
      sp1.textContent = text.slice(0, ++i);
      if (o.tick && i % 3 === 0) H.tick();
      if (i < text.length) setTimeout(step, text[i - 1] === '.' || text[i - 1] === ',' ? sp * 6 : sp);
      else o.done && o.done();
    })();
  }

  // Confeti
  function burst(n, colors) {
    if (calm()) return;
    const b = document.createElement('div'); b.className = 'burst';
    colors = colors || ['#FF2A1F', '#FFD60A', '#ffffff', '#ff7a1f', '#2BE07A'];
    for (let i = 0; i < (n || 46); i++) {
      const p = document.createElement('i'); const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 220;
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--x', Math.cos(a) * d + 'px'); p.style.setProperty('--y', Math.sin(a) * d + 160 * Math.random() + 'px');
      p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      p.style.animationDelay = Math.random() * 120 + 'ms';
      b.appendChild(p);
    }
    document.body.appendChild(b); later(() => b.remove(), 1600);
  }

  // Botón de mantener pulsado
  function hold(el, done, ms) {
    ms = ms || 1600; let t0, raf, fin = false;
    const c = el.querySelector('circle'), L = 2 * Math.PI * 72;
    c.style.strokeDasharray = L; c.style.strokeDashoffset = L;
    let lastTick = 0;
    const step = t => {
      const k = Math.min(1, (t - t0) / ms); c.style.strokeDashoffset = L * (1 - k);
      if (t - lastTick > 90) { H.tick(); tone(300 + k * 500, .05, .02); lastTick = t; }
      if (k >= 1) { fin = true; el.classList.add('done'); H.success(); tone(880, .3, .05); done(); return; }
      raf = requestAnimationFrame(step);
    };
    const start = e => { if (fin) return; e.preventDefault(); t0 = performance.now(); el.classList.add('on'); raf = requestAnimationFrame(step); };
    const stop = () => { if (fin) return; cancelAnimationFrame(raf); el.classList.remove('on'); c.style.transition = 'stroke-dashoffset .4s'; c.style.strokeDashoffset = L; later(() => c.style.transition = '', 400); };
    el.addEventListener('pointerdown', start); el.addEventListener('pointerup', stop); el.addEventListener('pointerleave', stop); el.addEventListener('pointercancel', stop);
  }

  // Aviso tipo notificación
  let tt;
  function toast(title, text, icon) {
    let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.innerHTML = `<div class="ti">${icon || '⛓️'}</div><div><b>${esc(title)}</b>${esc(text || '')}</div>`;
    requestAnimationFrame(() => t.classList.add('on'));
    clearTimeout(tt); tt = later(() => t.classList.remove('on'), 3200);
  }

  // Hoja inferior
  function sheet(html, onOpen) {
    const bg = document.createElement('div'); bg.className = 'sheet-bg';
    const sh = document.createElement('div'); sh.className = 'sheet'; sh.innerHTML = '<div class="grab"></div>' + html;
    document.body.append(bg, sh);
    requestAnimationFrame(() => { bg.classList.add('on'); sh.classList.add('on'); });
    const close = () => { bg.classList.remove('on'); sh.classList.remove('on'); later(() => { bg.remove(); sh.remove(); }, 450); };
    bg.onclick = close;
    onOpen && onOpen(sh, close);
    return close;
  }

  // Recordatorios configurables (funcionan con la app abierta o instalada)
  const REM = [
    { id: 'am', label: 'Mañana', what: 'Prioridad del día y hábitos', t: '08:00', on: true },
    { id: 'pm', label: 'Tarde', what: 'Un bloque de foco', t: '17:30', on: false },
    { id: 'night', label: 'Noche', what: 'El Espejo, 2 minutos', t: '21:30', on: true }
  ];
  const reminders = () => {
    const cur = S.reminders && S.reminders.items ? S.reminders : { on: false, items: [] };
    return { on: !!cur.on, items: REM.map(d => Object.assign({}, d, cur.items.find(x => x.id === d.id) || {}, { label: d.label, what: d.what })) };
  };
  const askNotify = async () => { try { if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission(); } catch (e) { } };
  const REM_TXT = { am: ['Buenos días', 'Elige tu prioridad de hoy y marca el primer hábito.'], pm: ['Hora de foco', 'Un bloque de 25 minutos sin móvil. Solo uno.'], night: ['El Espejo', 'Dos minutos: qué hiciste hoy y qué no.'] };
  function remindTick() {
    const R = reminders(); if (!R.on) return;
    const now = new Date(), hm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'), today = dkey();
    S.remSent = S.remSent || {};
    R.items.forEach(r => {
      if (!r.on || S.remSent[r.id] === today || hm < r.t) return;
      // Solo avisa en los 90 minutos siguientes a la hora elegida
      const [h, m] = r.t.split(':').map(Number); if ((now.getHours() * 60 + now.getMinutes()) - (h * 60 + m) > 90) return;
      S.remSent[r.id] = today; save();
      const [title, body] = REM_TXT[r.id];
      let shown = false;
      try { if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') { new Notification('HARDMODE · ' + title, { body, icon: 'icon.svg', tag: 'hm-' + r.id }); shown = true; } } catch (e) { }
      if (!shown) toast(title, ' ' + body, '⏰');
    });
  }
  const startReminders = () => { remindTick(); setInterval(remindTick, 60000); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') remindTick(); }); };

  const bgMode = m => { document.body.classList.remove('alert', 'good', 'gold', 'hazard'); if (m) document.body.classList.add(m); };

  window.U = { $, $$, esc, later, every, calm, setCalm, get reduce() { return calm(); }, dkey, addDays, dayIndex, get S() { return S; }, set S(v) { S = v; }, DEF, KEY, save, H, tone, count, type, burst, hold, toast, sheet, bgMode, reminders, askNotify, startReminders };
})();
