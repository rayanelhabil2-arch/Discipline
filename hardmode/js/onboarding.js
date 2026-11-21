/* Introducción de HARDMODE. Se ve una sola vez por cuenta. */
(function () {
  const { $, $$, esc, later, every, H, tone, count, type, burst, hold, bgMode } = U;
  const D = window.HM_DATA, C = window.HM_CONFIG;
  const LOGO = s => `<svg viewBox="0 0 64 64" width="${s}" height="${s}"><rect x="4" y="4" width="56" height="56" fill="none" stroke="#FF2A1F" stroke-width="3"/><path d="M14 44 L32 26 L50 44" fill="none" stroke="#f5f3ef" stroke-width="6" stroke-linecap="square"/><path d="M14 30 L32 12 L50 30" fill="none" stroke="#FF2A1F" stroke-width="6" stroke-linecap="square"/></svg>`;

  let root, steps, onDone, cur = -1, hist = [], run = 0, bar = null;
  const yearsLost = () => +(U.S.hours * (80 - U.S.age) / 24).toFixed(1);
  const btn = (label, cls, extra) => `<div class="foot"><button class="cta reveal ${cls || ''}" id="go">${label}</button>${extra || ''}</div>`;
  const setRange = r => r.style.setProperty('--v', ((r.value - r.min) / (r.max - r.min) * 100) + '%');
  const LEGAL = '<a href="legal.html" target="_blank" rel="noopener">Privacidad</a> · <a href="legal.html#condiciones" target="_blank" rel="noopener">Condiciones</a>';
  const fmt = n => String(n).replace('.', ',');

  // ---------- Barra superior: Volver · progreso · movimiento · Saltar ----------
  const visible = k => { const st = steps[k]; return st && !(st.when && !st.when()); };
  const counted = () => steps.map((st, k) => k).filter(k => visible(k) && !steps[k].auto);
  function mountBar() {
    bar = document.createElement('div'); bar.className = 'obar';
    bar.innerHTML = `<button id="ob-back" aria-label="Volver a la pantalla anterior">‹ Volver</button><div class="ob-prog" role="progressbar" aria-valuemin="0"><i></i></div><span id="ob-n"></span><button id="ob-calm" aria-label="Reducir movimiento"></button><button id="ob-skip">Saltar ›</button>`;
    document.body.appendChild(bar);
    $('#ob-back', bar).onclick = back;
    $('#ob-skip', bar).onclick = skipStep;
    const cb = $('#ob-calm', bar);
    const lab = () => { const on = U.calm(); cb.textContent = on ? '◼ Quieto' : '◐ Mov.'; cb.setAttribute('aria-pressed', on); cb.title = on ? 'Movimiento reducido. Toca para activar las animaciones.' : 'Toca para reducir el movimiento.'; };
    cb.onclick = () => { U.setCalm(!U.calm()); lab(); U.toast(U.calm() ? 'Movimiento reducido' : 'Animaciones activadas', U.calm() ? 'Sin animaciones ni textos que se escriben solos. Puedes cambiarlo en tu perfil.' : '', '◐'); }; lab();
  }
  function paintBar(st) {
    if (!bar) return;
    bar.classList.toggle('hide', !!st.auto || st.id === 'end');
    const list = counted(), n = list.indexOf(cur) + 1, N = list.length;
    $('.ob-prog i', bar).style.width = (Math.max(0, n) / N * 100) + '%';
    $('.ob-prog', bar).setAttribute('aria-valuenow', n); $('.ob-prog', bar).setAttribute('aria-valuemax', N);
    $('#ob-n', bar).textContent = n > 0 ? n + '/' + N : '';
    $('#ob-back', bar).style.visibility = hist.length > 1 ? 'visible' : 'hidden';
    const sk = $('#ob-skip', bar); sk.style.visibility = st.sk ? 'visible' : 'hidden';
    sk.textContent = st.sk === 'about' ? 'Saltar intro ›' : 'Saltar ›';
  }
  function skipStep() { const st = steps[cur]; if (!st || !st.sk) return; H.tick(); if (st.sk === 'about') goto('about'); else if (typeof st.sk === 'function') st.sk(); else next(); }
  function back() { if (hist.length < 2) return; H.tick(); hist.pop(); render(hist.pop()); }

  function goto(id) { const k = steps.findIndex(s => s.id === id); if (k >= 0) render(k); }
  function next() { let k = cur + 1; while (k < steps.length && !visible(k)) k++; if (k < steps.length) render(k); }
  function render(k) {
    const tok = ++run, old = Array.from(root.children);
    old.forEach(c => { c.classList.add('out'); later(() => c.remove(), 260); });
    cur = k; const st = steps[k];
    if (!st.auto) hist.push(k);
    paintBar(st);
    later(() => {
      if (tok !== run) return;
      const s = document.createElement('section'); s.className = 'scr' + (st.top ? ' top' : '') + (bar ? ' has-bar' : '');
      bgMode(st.bg || '');
      root.appendChild(s);
      st.run(s, () => { if (tok === run) next(); });
      const g = $('#go', s);
      if (g && !g.onclick) g.onclick = () => { H.tick(); tone(520, .06); next(); };
    }, old.length ? 240 : 0);
  }
  function finish() { run++; if (bar) { bar.remove(); bar = null; } bgMode(''); root.innerHTML = ''; onDone(); }
  const show = s => { const g = $('#go', s); g && g.classList.add('show'); };

  function typeScreen(id, lines, cta, bg) {
    return { id, bg, sk: 'about', run(s) {
      s.innerHTML = `<div class="big type" id="t"></div><p class="p reveal" id="sub"></p>${btn(cta || 'Sigue')}`;
      type($('#t', s), lines[0], { tick: true, speed: 40, done: () => { if (lines[1]) { const p = $('#sub', s); p.textContent = lines[1]; p.classList.add('show'); } later(() => show(s), 250); } });
    } };
  }

  steps = [
    { id: 'logo', auto: true, run(s, go) {
      const f = document.createElement('div'); f.className = 'flash'; document.body.appendChild(f); later(() => f.remove(), 600);
      H.thud(); tone(90, .35, .08);
      s.innerHTML = `<div class="logo" id="lg"></div><div class="brand">HARD<b>MODE</b></div><div class="brand-sub">Disciplina diaria</div>`;
      Mascot.mount($('#lg', s), { size: 150, mood: 'angry' });
      later(go, U.calm() ? 1200 : 2500);
    } },
    typeScreen('t1', ['La motivación se va.', 'La disciplina se queda.']),
    typeScreen('t2', ['Cada día eliges: lo que quieres ahora o lo que quieres de verdad.', 'Disciplina es elegir bien cuando no apetece.']),
    { id: 'stat', bg: 'alert', sk: 'about', run(s) {
      s.innerHTML = `<div class="kick">Dato</div><div class="p" style="margin-top:0">De media, quien usa internet pasa</div><div class="hero" id="h">0<small>H</small></div><div class="p" style="margin-top:4px">al día conectado desde el móvil. Si duermes 8 horas, es casi <b>una cuarta parte</b> de tu tiempo despierto.</div>
        <p class="src">Fuente: <a href="https://datareportal.com/reports/digital-2025-global-overview-report" target="_blank" rel="noopener">DataReportal · Digital 2025 Global Overview Report</a> (febrero de 2025). Media mundial de personas usuarias de internet; tiempo de uso de internet en el móvil.</p>${btn('Sigue', 'white')}`;
      const h = $('#h', s), T = 226, t0 = performance.now(), dur = U.calm() ? 1 : 1400;
      const paint = m => { h.innerHTML = Math.floor(m / 60) + '<small>H</small> ' + String(m % 60).padStart(2, '0') + '<small>MIN</small>'; };
      later(() => (function f(t) { if (!h.isConnected) return; const k = Math.min(1, (t - t0 - 400) / dur); paint(Math.round(T * (1 - Math.pow(1 - Math.max(0, k), 3)))); if (k < 1) requestAnimationFrame(f); else { H.thud(); if (!U.calm()) { $('#app').classList.add('shake-scr'); later(() => $('#app').classList.remove('shake-scr'), 450); } show(s); } })(performance.now()), 400);
    } },
    { id: 'raya', bg: 'alert', sk: 'about', run(s) {
      s.innerHTML = `<div class="big">Cada notificación<br>es una <em>raya</em>.</div><div class="raya"><canvas id="rc"></canvas></div><p class="p reveal" id="sub">Dopamina barata. La pagas con tu disciplina.</p>${btn('Sigue', 'white')}`;
      let n = 0;
      Raya.draw($('#rc', s), { onTick: () => { H.tick(); tone(1400 + Math.random() * 600, .02, .008); }, done: () => { H.thud(); $('#sub', s).classList.add('show'); show(s); } });
    } },
    { id: 'slot', bg: 'alert', sk: 'about', run(s) {
      const E = ['📱', '💬', '❤️', '🔥', '🎵', '👀'];
      s.innerHTML = `<div class="big">Tu cerebro está<br>en una <em>tragaperras</em>.</div><div class="slot"><div>📱</div><div>💬</div><div>❤️</div></div><p class="p reveal" id="sub">Y siempre gana la casa.</p>${btn('¿Y ahora qué?', 'white')}`;
      $$('.slot div', s).forEach((col, j) => {
        let n = U.calm() ? 99 : 0; const iv = every(() => { col.textContent = E[(n + j) % E.length]; H.tick(); if (++n > 14 + j * 6) { clearInterval(iv); col.textContent = '📱'; col.classList.add('stop'); tone(220 + j * 80, .1, .03); if (j === 2) { H.thud(); $('#sub', s).classList.add('show'); show(s); } } }, 70);
      });
    } },
    { id: 'forty', sk: 'about', run(s) {
      s.innerHTML = `<div class="kick">La regla del 40 %</div><div class="p" style="margin-top:0">Cuando tu mente dice «basta»,<br>muchas veces solo has dado el</div><div class="hero" id="h" style="color:var(--red)">0</div><div class="big md" style="margin-top:6px">Aquí entrenas<br>el <em>resto</em>.</div>
        <p class="src">Ojo: el 40 % no es una medida científica. Es una idea popular del entrenamiento mental: el primer «no puedo» suele llegar antes de tu límite real. Aquí se aplica con cabeza: a constancia y foco, nunca a ignorar dolor, lesiones o descanso.</p>${btn('Sigue')}`;
      count($('#h', s), 40, { suf: '%', dur: 1300, done() { H.thud(); tone(110, .3, .07); show(s); } });
    } },
    { id: 'about', top: true, run(s) {
      s.innerHTML = `<div class="kick">Qué es HARDMODE</div><div class="big md">Un entrenamiento diario de <em>disciplina</em>.</div>
        <div class="about">
          <div><b>Qué entrenas</b><span>Cumplir aunque no apetezca, concentrarte sin el móvil y volver rápido cuando fallas.</span></div>
          <div><b>Tu rutina</b><span><i>Mañana · 1 min</i> Tu prioridad del día y tus hábitos.<br><i>Durante el día</i> Bloques de foco con temporizador.<br><i>Noche · 2 min</i> El Espejo: qué hiciste y qué no.</span></div>
          <div><b>La primera semana</b><span>De 2 a 4 hábitos pequeños, tu progreso a la vista y avisos a tu hora. Fallar un día no rompe la racha.</span></div>
          <div><b>Precio</b><span>Gratis para empezar. PRO es opcional.</span></div>
        </div>${btn('Empezar mi plan · 2 min', '', '<button class="cta ghost" id="login">Ya tengo cuenta · Entrar</button>')}`;
      show(s);
      $('#login', s).onclick = () => { Onboarding.wantLogin = true; goto('account'); };
    } },
    { id: 'auth', bg: 'hazard', when: () => Cloud.AUTH, run(s) {
      s.innerHTML = `<div class="tape run" style="top:calc(var(--st) + 26px)"><span>ZONA RESTRINGIDA · SOLO MIEMBROS · ZONA RESTRINGIDA</span></div>
        <div class="auth"><div class="big" style="font-size:38px;margin:0 auto">Crea tu cuenta</div><p class="p" style="margin:10px auto 0">Tu progreso, tu firma y tu racha se guardan aquí. Si lo dejas, lo verás.</p>
        <div class="tabs2"><button class="on" data-m="up">Crear cuenta</button><button data-m="in">Ya tengo cuenta</button></div>
        <input class="field l" id="em" type="email" autocomplete="email" placeholder="Tu correo" inputmode="email">
        <input class="field l" id="pw" type="password" autocomplete="new-password" placeholder="Contraseña (mín. 6)" style="margin-top:8px">
        <div class="err" id="er"></div>
        <button class="cta" id="ok">Crear cuenta</button>
        <button class="lnk hide" id="fp">He olvidado mi contraseña</button>
        <p class="small">Al crear la cuenta aceptas las condiciones y la política de privacidad: ${LEGAL}.</p></div>`;
      let mode = 'up';
      const em = $('#em', s), pw = $('#pw', s), er = $('#er', s), ok = $('#ok', s);
      $$('.tabs2 button', s).forEach(b => b.onclick = () => { mode = b.dataset.m; $$('.tabs2 button', s).forEach(x => x.classList.toggle('on', x === b)); ok.textContent = mode === 'up' ? 'Crear cuenta' : 'Entrar'; pw.autocomplete = mode === 'up' ? 'new-password' : 'current-password'; $('#fp', s).classList.toggle('hide', mode === 'up'); er.textContent = ''; H.tick(); });
      $('#fp', s).onclick = async () => { if (!em.value) { er.textContent = 'Escribe tu correo arriba.'; return; } const r = await Cloud.resetPass(em.value.trim()); er.style.color = r.error ? '' : 'var(--green)'; er.textContent = r.error || 'Te hemos enviado un correo para cambiarla.'; };
      const submit = async () => {
        const e = em.value.trim(), p = pw.value;
        er.style.color = ''; if (!/^\S+@\S+\.\S+$/.test(e)) { er.textContent = 'Ese correo no es válido.'; return; }
        if (p.length < 6) { er.textContent = 'La contraseña debe tener al menos 6 caracteres.'; return; }
        ok.disabled = true; ok.innerHTML = '<span class="spin"></span>';
        const r = mode === 'up' ? await Cloud.signUp(e, p) : await Cloud.signIn(e, p);
        ok.disabled = false; ok.textContent = mode === 'up' ? 'Crear cuenta' : 'Entrar';
        if (r.error) { er.textContent = r.error; H.thud(); s.classList.add('shake-scr'); later(() => s.classList.remove('shake-scr'), 450); return; }
        if (r.confirm) { er.style.color = 'var(--green)'; er.textContent = 'Te hemos enviado un correo. Confírmalo y vuelve aquí para entrar.'; $$('.tabs2 button', s)[1].click(); er.style.color = 'var(--green)'; er.textContent = 'Confirma el correo que te hemos enviado y entra aquí.'; return; }
        H.success(); tone(660, .1);
        try { await Cloud.load(); } catch (x) { er.textContent = 'No se pudo cargar tu perfil. Revisa la conexión.'; return; }
        if (U.S.onboarded) finish(); else next();
      };
      ok.onclick = submit; pw.onkeydown = e => { if (e.key === 'Enter') submit(); };
    } },
    { id: 'name', run(s) {
      s.innerHTML = `<div class="kick">Empezamos</div><div class="big">¿Cómo te llamas?</div>
        <div class="fields"><input class="field" id="n" maxlength="18" autocomplete="given-name" placeholder="Tu nombre" value="${esc(U.S.name)}">
        <input class="field${Cloud.AUTH ? '' : ' hide'}" id="u" maxlength="20" autocomplete="username" placeholder="@usuario para el ranking" value="${esc(U.S.username)}" autocapitalize="off"></div><div class="err" id="er"></div>
        <p class="why-note">${Cloud.AUTH ? 'El nombre solo sirve para hablarte a ti; el @usuario aparece en el ranking. Se guardan en tu cuenta.' : 'Solo lo usamos para dirigirnos a ti. Se guarda en este dispositivo: no creamos cuenta ni lo enviamos a ningún servidor.'}<br>Al continuar aceptas las condiciones de uso. ${LEGAL}</p>${btn('Sigue')}`;
      const n = $('#n', s), u = $('#u', s), g = $('#go', s), er = $('#er', s);
      const clean = v => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/^@/, '').replace(/\s+/g, '_').replace(/[^A-Za-z0-9_.]/g, '').slice(0, 20);
      u.addEventListener('input', () => { const c = clean(u.value); if (c !== u.value) u.value = c; });
      const chk = () => { if (!Cloud.AUTH) { g.disabled = !n.value.trim(); g.classList.add('show'); return; } g.disabled = !(n.value.trim() && /^[A-Za-z0-9_.]{3,20}$/.test(u.value.trim())); g.classList.add('show'); er.textContent = u.value && !/^[A-Za-z0-9_.]{3,20}$/.test(u.value.trim()) ? 'Usuario: 3 a 20 letras, números, _ o .' : ''; };
      n.oninput = chk; u.oninput = chk; chk();
      n.onkeydown = e => { if (e.key === 'Enter' && !g.disabled) g.click(); };
      g.onclick = async () => { if (!Cloud.AUTH) { U.S.name = n.value.trim(); U.S.username = U.S.username || clean(n.value.trim()).toLowerCase() || 'yo'; U.save(); H.tick(); next(); return; } const un = u.value.trim(); g.disabled = true; const free = un.toLowerCase() === (U.S.username || '').toLowerCase() || await Cloud.usernameFree(un); g.disabled = false; if (!free) { er.textContent = 'Ese usuario ya está cogido.'; H.thud(); return; } U.S.name = n.value.trim(); U.S.username = un; U.save(); H.tick(); next(); };
      if (matchMedia('(min-width: 700px)').matches) later(() => n.focus(), 400);
    } },
    { id: 'account', top: true, sk: true, run(s) {
      let mode = s.dataset.mode || (Onboarding.wantLogin ? 'in' : 'up'); Onboarding.wantLogin = false;
      const me = Rank.me;
      if (me && me.acc) { s.innerHTML = `<div class="kick">Cuenta</div><div class="big md">Ya tienes cuenta</div><p class="p">Entras como <b>@${esc(me.username)}</b>. Tu progreso se guarda solo.</p>${btn('Sigue')}`; show(s); return; }
      s.innerHTML = `<div class="kick">Cuenta</div><div class="big md">${mode === 'up' ? 'Crea tu cuenta' : 'Entra en tu cuenta'}</div>
        <p class="p">Solo usuario y contraseña. Sirve para competir en el ranking y para no perder tu progreso si cambias de móvil.</p>
        <div class="tabs2"><button class="${mode === 'up' ? 'on' : ''}" data-m="up">Crear cuenta</button><button class="${mode === 'in' ? 'on' : ''}" data-m="in">Ya tengo cuenta</button></div>
        <div class="fields"><input class="field l" id="au" maxlength="20" autocomplete="username" autocapitalize="off" placeholder="@usuario" value="${esc(Rank.clean(U.S.username || U.S.name || ''))}">
        <input class="field l" id="ap" type="password" maxlength="72" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}" placeholder="Contraseña (mín. 6)"></div>
        <div class="err" id="ae"></div>
        <p class="why-note">${mode === 'up' ? 'En el ranking solo se ve tu @usuario, tu racha y tus puntos.' : ''} ¿Has olvidado la contraseña? Escríbenos a <a href="mailto:${Rank.SUPPORT}">${Rank.SUPPORT}</a> desde el correo que quieras, con tu @usuario.<br>${LEGAL}</p>
        ${btn(mode === 'up' ? 'Crear cuenta' : 'Entrar')}`;
      const au = $('#au', s), ap = $('#ap', s), ae = $('#ae', s), g = $('#go', s);
      au.oninput = () => { const c = Rank.clean(au.value); if (c !== au.value) au.value = c; };
      $$('.tabs2 button', s).forEach(b => b.onclick = () => { s.dataset.mode = b.dataset.m; H.tick(); steps[cur].run(s); });
      show(s);
      const submit = async () => {
        ae.textContent = ''; g.disabled = true; g.innerHTML = '<span class="spin"></span>';
        const r = mode === 'up' ? await Rank.register(au.value, ap.value) : await Rank.login(au.value, ap.value);
        g.disabled = false; g.textContent = mode === 'up' ? 'Crear cuenta' : 'Entrar';
        if (r.error) { ae.textContent = r.error; H.thud(); return; }
        H.success();
        if (r.restored) { U.toast('Bienvenido de vuelta', ' Hemos recuperado tu progreso.', '🦁'); finish(); return; }
        U.toast(mode === 'up' ? 'Cuenta creada' : 'Has entrado', ' Tu progreso se guarda en tu cuenta.', '🦁'); next();
      };
      g.onclick = submit; ap.onkeydown = e => { if (e.key === 'Enter') submit(); };
    } },
    { id: 'age', run(s) {
      s.innerHTML = `<div class="kick">${esc(U.S.name)}</div><div class="big">¿Cuántos años tienes?</div><div class="hero" id="v" style="margin-top:20px">${U.S.age}</div><input type="range" class="range" id="r" min="12" max="60" step="1" value="${U.S.age}">${btn('Sigue')}`;
      const r = $('#r', s), v = $('#v', s); setRange(r);
      r.oninput = () => { v.textContent = r.value; setRange(r); H.tick(); };
      show(s); $('#go', s).onclick = () => { U.S.age = +r.value; U.save(); next(); };
    } },
    { id: 'hours', run(s) {
      const col = h => h >= 6 ? 'var(--red)' : h >= 3.5 ? 'var(--yel)' : 'var(--green)';
      s.innerHTML = `<div class="kick">Sin mentir</div><div class="big">¿Cuántas horas al día usas el móvil?</div><div class="hero" id="v" style="margin-top:20px"></div><input type="range" class="range" id="r" min="1" max="10" step=".5" value="${U.S.hours}"><p class="p" style="font-size:13px">Míralo en Ajustes → Tiempo de uso. El número real duele más.</p>${btn('Calcular')}`;
      const r = $('#r', s), v = $('#v', s);
      const up = () => { v.innerHTML = String(r.value).replace('.', ',') + '<small>H</small>'; v.style.color = col(+r.value); setRange(r); };
      r.oninput = () => { up(); H.tick(); }; up();
      show(s); $('#go', s).onclick = () => { U.S.hours = +r.value; U.save(); next(); };
    } },
    { id: 'calc', auto: true, run(s, go) {
      const L = 2 * Math.PI * 70;
      s.innerHTML = `<div class="ring"><svg viewBox="0 0 160 160"><circle class="bgc" cx="80" cy="80" r="70"/><circle class="fg" cx="80" cy="80" r="70" style="stroke-dasharray:${L};stroke-dashoffset:${L}"/></svg><span id="pc">0</span></div><div class="big" style="font-size:30px">Analizando…</div><ul class="steps" style="margin-top:18px"><li>Horas despierto</li><li>Tiempo de pantalla</li><li>Años que te quedan</li><li>Lo que puedes recuperar</li></ul>`;
      const fg = $('.fg', s), pc = $('#pc', s), li = $$('li', s); let k = 0;
      const iv = every(() => { if (!fg.isConnected) return clearInterval(iv); k += U.calm() ? 10 : 2; fg.style.strokeDashoffset = L * (1 - k / 100); pc.textContent = k; if (k % 25 === 0 || (k % 10 === 0 && U.calm())) { const q = Math.min(3, Math.floor(k / 25) - 1); if (q >= 0) li[q].classList.add('ok'); H.tick(); } if (k >= 100) { clearInterval(iv); H.thud(); later(go, 450); } }, 50);
    } },
    { id: 'res', bg: 'alert', run(s) {
      const y = yearsLost(), d = Math.round(U.S.hours * 365 / 24);
      s.innerHTML = `<div class="kick">${esc(U.S.name)}, a este ritmo</div><div class="p" style="margin-top:0">este año regalarás</div><div class="hero" id="d">0</div><div class="p" style="margin-top:2px">y hasta los 80</div><div class="hero" id="y" style="font-size:84px">0</div><div class="p">de tu vida a una pantalla.</div>
        <p class="src">Cálculo con tu respuesta: ${fmt(U.S.hours)} h × 365 ÷ 24 = ${d} días al año. Hasta los 80: ${fmt(U.S.hours)} ÷ 24 × (80 − ${U.S.age}) = ${fmt(y)} años. Es una estimación: no separa el uso útil del móvil (trabajo, estudio, hablar con los tuyos).</p>${btn('Me niego', 'white')}`;
      count($('#d', s), d, { suf: 'DÍAS', dur: 1200, done() { H.thud(); count($('#y', s), y, { dec: 1, suf: 'AÑOS', dur: 1400, done() { H.thud(); tone(80, .4, .08); show(s); } }); } });
    } },
    { id: 'goals', top: true, run(s) {
      const g0 = U.S.goals || ['', '', ''];
      s.innerHTML = `<div class="kick">Objetivos</div><div class="big md">Escribe hasta 3 objetivos.<br><em>Sin miedo.</em></div><p class="p">Cosas que quieres conseguir este año. Concretas. Las verás cada día.</p>
        <div class="fields">${[0, 1, 2].map(k => `<div class="fnum"><b>${k + 1}</b><input class="field l" data-k="${k}" maxlength="70" placeholder="${['Ej.: Aprobar todo en junio', 'Ej.: Bajar a 75 kg', 'Ej.: Ahorrar 2.000 €'][k]}" value="${esc(g0[k] || '')}"></div>`).join('')}</div>${btn('Firmar mis objetivos')}`;
      const ins = $$('input', s), g = $('#go', s);
      const chk = () => { g.disabled = ins.every(x => x.value.trim().length < 2); g.classList.add('show'); };
      ins.forEach(x => x.oninput = chk); chk();
      g.onclick = () => { U.S.goals = ins.map(x => x.value.trim()).filter(Boolean); U.save(); H.thud(); next(); };
    } },
    { id: 'why', top: true, sk: true, run(s) {
      s.innerHTML = `<div class="kick">El porqué</div><div class="big md">¿Por qué lo quieres de verdad?</div><p class="p">Cuando no tengas ganas, esto es lo que leerás.</p>
        <div class="fields"><textarea class="ta" id="w" maxlength="240" style="min-height:110px" placeholder="Quiero demostrar que…">${esc(U.S.why)}</textarea></div>${btn('Sigue')}`;
      const w = $('#w', s), g = $('#go', s);
      const chk = () => { g.textContent = w.value.trim() ? 'Sigue' : 'Saltar'; g.classList.add('show'); };
      w.oninput = chk; chk();
      g.onclick = () => { U.S.why = w.value.trim(); U.save(); next(); };
    } },
    { id: 'excuse', top: true, bg: 'alert', sk: true, run(s) {
      const EX = ['Mañana empiezo', 'No tengo tiempo', 'Estoy cansado', 'No tengo ganas', 'No sirvo para esto', 'Ya es tarde'];
      s.innerHTML = `<div class="kick">El enemigo</div><div class="big md">¿Cuál es tu <em>excusa</em> favorita?</div><p class="p">Elígela. TANK la va a perseguir.</p>
        <div class="chips">${EX.map(e => `<button class="chip${U.S.excuse === e ? ' on' : ''}">${e}</button>`).join('')}</div>
        <div class="fields"><input class="field l" id="d" maxlength="40" placeholder="¿Quién dudó de ti? (opcional)" value="${esc(U.S.doubter)}"></div>${btn('Sigue', 'white')}`;
      const g = $('#go', s);
      const chk = () => { g.classList.add('show'); };
      $$('.chip', s).forEach(c => c.onclick = () => { $$('.chip', s).forEach(x => x.classList.remove('on')); c.classList.add('on'); H.tick(); tone(300, .05); chk(); });
      chk();
      g.onclick = () => { const ch = $('.chip.on', s); U.S.excuse = ch ? ch.textContent : 'Mañana empiezo'; U.S.doubter = $('#d', s).value.trim(); U.save(); next(); };
    } },
    { id: 'areas', top: true, run(s) {
      s.innerHTML = `<div class="kick">Campo de batalla</div><div class="big md">¿Dónde vas a pelear?</div><p class="p">Elige hasta 4. Te preparo los hábitos diarios.</p><div class="chips">${D.AREAS.map(a => `<button class="chip${U.S.areas.includes(a.id) ? ' on' : ''}" data-id="${a.id}">${a.em} ${a.name}</button>`).join('')}</div>${btn('Sigue')}`;
      const g = $('#go', s);
      const chk = () => { g.disabled = !$$('.chip.on', s).length; g.classList.add('show'); };
      $$('.chip', s).forEach(c => c.onclick = () => { if (!c.classList.contains('on') && $$('.chip.on', s).length >= 4) { c.animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], 200); H.thud(); return; } c.classList.toggle('on'); H.tick(); tone(c.classList.contains('on') ? 700 : 400, .05); chk(); });
      chk();
      g.onclick = () => {
        U.S.areas = $$('.chip.on', s).map(c => c.dataset.id);
        U.S.habits = U.S.areas.map(id => { const a = D.AREAS.find(x => x.id === id); return { id: a.id, name: a.habit, em: a.em }; });
        U.save(); next();
      };
    } },
    { id: 'life', top: true, sk: true, run(s) {
      const O = [['train', '🏋️', 'Mis entrenos', 'Con fotos, para ver tu progreso'], ['work', '💼', 'Mi trabajo', 'Horas, horas extra y cuánto cobras'], ['study', '📚', 'Mis estudios', 'Bloques de foco sin móvil']];
      const cur = U.S.track || [];
      s.innerHTML = `<div class="kick">Tu día a día</div><div class="big md">¿Qué quieres llevar controlado?</div><p class="p">Elige lo que encaje contigo. Adaptamos la app a ti.</p>
        <div class="rem">${O.map(o => `<label class="rem-row"><input type="checkbox" data-k="${o[0]}"${cur.includes(o[0]) ? ' checked' : ''}><span class="rem-t"><b>${o[1]} ${o[2]}</b><small>${o[3]}</small></span></label>`).join('')}</div>${btn('Sigue')}`;
      show(s);
      $('#go', s).onclick = () => { U.S.track = $$('input:checked', s).map(x => x.dataset.k); U.save(); H.tick(); next(); };
    } },
    { id: 'remind', top: true, sk: true, run(s) {
      const R = U.reminders();
      s.innerHTML = `<div class="kick">Recordatorios</div><div class="big md">¿Cuándo te aviso?</div><p class="p">Elige los momentos y la hora. Puedes cambiarlo cuando quieras en tu perfil.</p>
        <div class="rem">${R.items.map(r => `<label class="rem-row"><input type="checkbox" data-id="${r.id}"${r.on ? ' checked' : ''}><span class="rem-t"><b>${r.label}</b><small>${r.what}</small></span><input type="time" data-t="${r.id}" value="${r.t}"></label>`).join('')}</div>
        <p class="src">Los avisos llegan mientras HARDMODE está abierta o instalada como app. En iPhone, añádela antes a la pantalla de inicio (Compartir → Añadir a pantalla de inicio). Sin permiso de notificaciones, te los mostramos dentro de la app.</p>${btn('Guardar avisos')}`;
      show(s);
      $('#go', s).onclick = async () => {
        R.items.forEach(r => { r.on = $(`[data-id="${r.id}"]`, s).checked; r.t = $(`[data-t="${r.id}"]`, s).value || r.t; });
        R.on = R.items.some(r => r.on); U.S.reminders = R; U.save(); H.tick();
        if (R.on) await U.askNotify();
        next();
      };
    } },
    { id: 'tank', sk: true, run(s) {
      s.innerHTML = `<div id="mc" style="margin-top:-30px"></div><div class="big type" id="t" style="font-size:34px;margin-top:18px;min-height:3em"></div>${btn('Vamos, TANK')}`;
      const m = Mascot.mount($('#mc', s), { size: 210, mood: 'sleepy' });
      later(() => { m.mood('alert').jump(); H.thud(); tone(140, .2, .07); }, 700);
      later(() => { m.mood('angry'); type($('#t', s), `Soy TANK. «${U.S.excuse || 'Mañana empiezo'}» se acabó.`, { tick: true, speed: 38, done() { m.mood('calm'); m.jump(); later(() => show(s), 300); } }); }, 1400);
    } },
    { id: 'free', sk: true, run(s) {
      s.innerHTML = `<div class="kick">30 días</div><div class="big md">Lo que cambia cuando no negocias</div><div class="cmp"><div class="col"><div class="bars no">${'<i></i>'.repeat(5)}</div><small>Con excusas</small></div><div class="col"><div class="bars yes">${'<i></i>'.repeat(5)}</div><small>HARDMODE</small></div></div><p class="p reveal" id="sub">Pequeño cada día. Brutal en un año.</p><p class="src">Gráfico ilustrativo, no son datos reales.</p>${btn('Sigue')}`;
      const no = [70, 40, 55, 25, 15], yes = [22, 40, 58, 82, 100];
      $$('.no i', s).forEach((b, k) => later(() => { b.style.height = no[k] + '%'; H.tick(); }, 300 + k * 120));
      $$('.yes i', s).forEach((b, k) => later(() => { b.style.height = yes[k] + '%'; H.tick(); }, 950 + k * 120));
      later(() => { $('#sub', s).classList.add('show'); show(s); }, 1700);
    } },
    { id: 'sign', top: true, run(s) {
      const g = U.S.goals || [];
      s.innerHTML = `<div class="kick">Firma</div><div class="big md" style="margin-bottom:22px">Firma tu contrato.</div>
        <div class="contract">Yo, <b>${esc(U.S.name)}</b>, me comprometo a:<ol>${g.map(x => `<li><b>${esc(x)}</b></li>`).join('')}</ol>No negociaré conmigo. Si fallo un día, vuelvo al siguiente.</div>
        <div class="sigpad"><canvas id="cv"></canvas><div class="base"></div><div class="x">✕</div><div class="hint">Firma con el dedo</div><button class="clr" id="cl">Borrar</button></div>${btn('Firmar y sellar')}`;
      const cv = $('#cv', s), ctx = cv.getContext('2d'), gbtn = $('#go', s);
      const fit = () => { const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); cv.width = r.width * dpr; cv.height = r.height * dpr; ctx.scale(dpr, dpr); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#111'; };
      later(fit, 60);
      let drawing = false, last = null, ink = 0;
      const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; };
      cv.addEventListener('pointerdown', e => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); $('.hint', s).style.opacity = 0; });
      cv.addEventListener('pointermove', e => {
        if (!drawing) return; const p = pos(e), d = Math.hypot(p.x - last.x, p.y - last.y), v = d / Math.max(1, p.t - last.t);
        ctx.lineWidth = Math.max(1.4, 3.6 - v * 1.4); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        ink += d; last = p; if (ink > 60 && !gbtn.classList.contains('show')) { gbtn.classList.add('show'); H.tick(); }
      });
      const end = () => { drawing = false; };
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
      $('#cl', s).onclick = () => { ctx.clearRect(0, 0, cv.width, cv.height); ink = 0; gbtn.classList.remove('show'); $('.hint', s).style.opacity = 1; };
      gbtn.onclick = async () => {
        // firma reducida (PNG pequeño, fondo transparente)
        const o = document.createElement('canvas'); o.width = 360; o.height = Math.round(360 * cv.height / cv.width);
        o.getContext('2d').drawImage(cv, 0, 0, o.width, o.height);
        U.S.signature = o.toDataURL('image/png'); U.S.signedAt = new Date().toISOString(); U.S.created = U.dkey();
        gbtn.disabled = true; gbtn.innerHTML = '<span class="spin"></span>';
        U.S.onboarded = true; U.save();
        await Cloud.finishOnboarding(U.S.signature);
        H.success(); tone(140, .3, .08); hist = []; next();
      };
    } },
    { id: 'letter', sk: true, run(s) {
      const y = +(yearsLost() * .5).toFixed(1);
      const txt = `${U.S.name.toUpperCase()}:\n\nDesde hoy no te pregunto si tienes ganas. Te pregunto si lo has hecho.\n\nLa disciplina no es un día perfecto. Es volver al día siguiente.\n\nObjetivo nº 1: ${U.S.goals[0] || 'cumplir cada día'}.\nTu excusa, «${U.S.excuse}», está muerta.\n\nSi reduces el móvil a la mitad, recuperas ${fmt(y)} años. Empieza hoy.\n\n— TANK`;
      s.innerHTML = `<div class="letter"><div id="lt" style="white-space:pre-line"></div><img class="sigimg" id="sg" src="${U.S.signature}" alt="Tu firma"><div class="seal" id="se">FIRMADO</div></div>${btn('Sigue')}`;
      const lt = $('#lt', s);
      type(lt, txt, { speed: 16, tick: true, done() { const c = $('.caret', lt); c && c.remove(); $('#sg', s).classList.add('on'); later(() => { $('#se', s).classList.add('on'); H.thud(); tone(90, .3, .08); burst(30, ['#FF2A1F', '#fff']); }, 800); later(() => show(s), 1200); } });
    } },
    { id: 'pay', top: true, sk: () => { U.S.demoPro = false; U.save(); next(); }, run(s) {
      const P = C.PLANS; let sel = P.find(p => p.best) || P[0];
      s.innerHTML = `<div class="kick">Acceso total</div><div class="big md">Desbloquea <em>HARDMODE PRO</em></div>
        <ul class="perks"><li>Hábitos ilimitados</li><li>Modo 40 % y retos extremos</li><li>Todos los vídeos de entrenamiento mental</li><li>Sin anuncios</li></ul>
        <div class="plans">${P.map(p => `<button class="plan${p === sel ? ' on' : ''}" data-id="${p.id}">${p.best ? '<span class="badge">MÁS ELEGIDO</span>' : ''}<span class="rad"></span><span class="nm"><b>${esc(p.name)}</b><small>${esc(p.trial ? p.trial + ' · ' + p.note : p.note)}</small></span><span class="pr">${esc(p.price)}<small>${esc(p.per)}</small></span></button>`).join('')}</div>
        <div class="timeline"><div><b>HOY</b>Acceso completo desde ya.</div><div><b>DÍA 2</b>Te avisamos antes de cobrar.</div><div><b>DÍA 3</b>Empieza el plan. Cancela cuando quieras.</div></div>
        <p class="src" style="text-align:center">Pagos seguros con Stripe. ${LEGAL}</p>
        ${btn('Empezar ahora', '', `<button class="cta ghost" id="skip" style="opacity:0;transition:opacity .6s">Seguir gratis, con límites y anuncios</button>`)}`;
      const g = $('#go', s);
      const upd = () => { g.textContent = sel.trial ? 'Empezar ' + sel.trial : 'Empezar ahora'; };
      $$('.plan', s).forEach(b => b.onclick = () => { sel = P.find(p => p.id === b.dataset.id); $$('.plan', s).forEach(x => x.classList.toggle('on', x === b)); H.tick(); upd(); });
      upd(); show(s);
      later(() => { $('#skip', s).style.opacity = 1; }, C.HARD_PAYWALL ? 3500 : 300);
      g.onclick = () => {
        H.thud();
        if (sel.link) { const u = new URL(sel.link); if (Cloud.user) u.searchParams.set('client_reference_id', Cloud.user.id); if (U.S.email) u.searchParams.set('prefilled_email', U.S.email); location.href = u.toString(); return; }
        U.toast('Modo demo', 'Los pagos aún no están activados. Entras con todo desbloqueado para probar.', '💳');
        U.S.demoPro = true; U.save(); next();
      };
      $('#skip', s).onclick = () => { U.S.demoPro = false; U.save(); next(); };
    } },
    { id: 'end', bg: 'good', run(s) {
      s.innerHTML = `<div id="mc"></div><div class="big" style="margin-top:14px">Bienvenido,<br><em>${esc(U.S.name)}</em>.</div><p class="p">Día 1. La disciplina empieza hoy.</p>${btn('Empezar', 'green')}`;
      const m = Mascot.mount($('#mc', s), { size: 180, mood: 'happy' });
      later(() => { burst(70); H.success(); m.jump(); tone(660, .1); later(() => tone(990, .2), 120); }, 300);
      later(() => show(s), 900);
      $('#go', s).onclick = finish;
    } }
  ];

  window.Onboarding = {
    // from: id del paso inicial (p. ej. 'auth' o 'name')
    start(el, done, from) { root = el; onDone = done; cur = -1; hist = []; if (!bar) mountBar(); if (from) { const k = steps.findIndex(x => x.id === from); if (k >= 0) return render(k); } next(); },
    goto, wantLogin: false
  };
})();
