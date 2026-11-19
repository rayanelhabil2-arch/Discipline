/* Introducción de STOA: una secuencia de pantallas, cada una con su detalle. */
(function () {
  const { $, $$, esc, later, every, H, tone, count, type, burst, hold, bgMode } = U;
  const D = window.STOA_DATA;
  const LOGO = s => `<svg viewBox="0 0 64 64" width="${s}" height="${s}" fill="none" stroke="#f4f1ec" stroke-width="2.6" stroke-linecap="round"><path d="M10 18 L32 8 L54 18"/><path d="M8 20 H56"/><path d="M16 25 V48 M26 25 V48 M38 25 V48 M48 25 V48"/><path d="M10 52 H54 M6 57 H58"/></svg>`;

  let root, i = 0, steps;
  const yearsLost = () => +(U.S.hours * (80 - U.S.age) / 24).toFixed(1);
  const btn = (label, cls) => `<div class="foot"><button class="cta reveal ${cls || ''}" id="go">${label}</button></div>`;

  function next() {
    const cur = root.firstElementChild;
    if (cur) { cur.classList.add('out'); later(() => cur.remove(), 280); }
    later(() => {
      const st = steps[i++]; if (!st) return;
      const s = document.createElement('section'); s.className = 'scr';
      bgMode(st.bg || '');
      root.appendChild(s);
      st.run(s, next);
      const g = $('#go', s);
      if (g && !g.onclick) g.onclick = () => { H.tick(); tone(520, .06); next(); };
    }, cur ? 260 : 0);
  }
  const show = s => { const g = $('#go', s); g && g.classList.add('show'); };

  function typeScreen(lines, cta) {
    return {
      run(s) {
        s.innerHTML = `<div class="big type" id="t"></div><p class="p reveal" id="sub"></p>${btn(cta || 'Continuar')}`;
        type($('#t', s), lines[0], { tick: true, done: () => { if (lines[1]) { const p = $('#sub', s); p.textContent = lines[1]; p.classList.add('show'); } later(() => show(s), 250); } });
      }
    };
  }

  steps = [
    { id: 'logo', run(s, go) {
      s.innerHTML = `<div class="logo">${LOGO(70)}</div><div class="brand">STOA</div><div class="brand-sub">Disciplina estoica</div>`;
      later(go, 2600);
    } },
    typeScreen(['Cada día eliges quién eres.']),
    typeScreen(['La mayoría elige sin darse cuenta.', 'Con el pulgar. Deslizando.']),
    { id: 'stat', bg: 'alert', run(s) {
      s.innerHTML = `<div class="kick">Dato</div><div class="p" style="margin-top:0">Una persona joven pasa de media</div><div class="hero" id="h">0</div><div class="p">al día mirando el móvil. Casi la cuarta parte del tiempo que estás despierto.</div>${btn('Sigue')}`;
      later(() => count($('#h', s), 4.5, { dec: 1, suf: 'h', dur: 1400, done() { H.thud(); show(s); } }), 400);
    } },
    { id: 'raya', bg: 'alert', run(s) {
      s.innerHTML = `<div class="big">Cada notificación<br>es una <em>raya</em>.</div><div class="line" id="l"></div><p class="p reveal" id="sub">Dopamina gratis. La pagas con tu tiempo.</p>${btn('Continuar')}`;
      const l = $('#l', s); let h = '';
      for (let k = 0; k < 160; k++) { const z = 2 + Math.random() * 5; h += `<b style="width:${z}px;height:${z}px;margin:0 ${(Math.random() * 1.6).toFixed(1)}px;transform-origin:center;transition-delay:${k * 9}ms;opacity:${(.45 + Math.random() * .55).toFixed(2)}"></b>`; }
      l.innerHTML = h;
      requestAnimationFrame(() => requestAnimationFrame(() => l.classList.add('go')));
      let n = 0; const iv = every(() => { H.tick(); tone(180 + n * 22, .04, .015); if (++n >= 14) { clearInterval(iv); H.thud(); $('#sub', s).classList.add('show'); show(s); } }, 80);
    } },
    { id: 'slot', bg: 'alert', run(s) {
      const E = ['📱', '💬', '❤️', '🔥', '🎵', '👀'];
      s.innerHTML = `<div class="big">Tu cerebro, en una <em>tragaperras</em>.</div><div class="slot"><div>📱</div><div>💬</div><div>❤️</div></div><p class="p reveal" id="sub">Las apps están hechas para que nunca pares de tirar de la palanca.</p>${btn('¿Y entonces?')}`;
      $$('.slot div', s).forEach((col, j) => {
        let n = 0; const iv = every(() => { col.textContent = E[(n + j) % E.length]; H.tick(); if (++n > 14 + j * 6) { clearInterval(iv); col.textContent = '📱'; col.classList.add('stop'); tone(220 + j * 80, .1, .03); if (j === 2) { H.thud(); $('#sub', s).classList.add('show'); show(s); } } }, 70);
      });
    } },
    { id: 'name', run(s) {
      s.innerHTML = `<div class="kick">Tú</div><div class="big">Antes de seguir,<br>¿cómo te llamas?</div><input class="field" id="n" maxlength="18" autocomplete="given-name" placeholder="Tu nombre" value="${esc(U.S.name)}">${btn('Continuar')}`;
      const n = $('#n', s), g = $('#go', s);
      const chk = () => { g.disabled = n.value.trim().length < 1; g.classList.add('show'); };
      n.oninput = chk; chk();
      n.onkeydown = e => { if (e.key === 'Enter' && !g.disabled) g.click(); };
      g.onclick = () => { U.S.name = n.value.trim(); U.save(); H.tick(); next(); };
      later(() => n.focus(), 400);
    } },
    { id: 'age', run(s) {
      s.innerHTML = `<div class="kick">Hola, ${esc(U.S.name)}</div><div class="big">¿Cuántos años tienes?</div><div class="hero" id="v" style="margin-top:26px">${U.S.age}</div><input type="range" class="range" id="r" min="12" max="60" step="1" value="${U.S.age}">${btn('Continuar')}`;
      const r = $('#r', s), v = $('#v', s);
      r.oninput = () => { v.textContent = r.value; H.tick(); };
      $('#go', s).classList.add('show');
      $('#go', s).onclick = () => { U.S.age = +r.value; U.save(); next(); };
    } },
    { id: 'hours', run(s) {
      const col = h => h >= 6 ? 'var(--red)' : h >= 3.5 ? 'var(--amber)' : 'var(--green)';
      s.innerHTML = `<div class="kick">Sé sincero</div><div class="big">¿Cuántas horas al día usas el móvil?</div><div class="hero" id="v" style="margin-top:26px">${U.S.hours}<small>h</small></div><input type="range" class="range" id="r" min="1" max="10" step=".5" value="${U.S.hours}"><p class="p" style="font-size:13px">Míralo en Ajustes → Tiempo de uso.</p>${btn('Calcular')}`;
      const r = $('#r', s), v = $('#v', s);
      const up = () => { v.innerHTML = String(r.value).replace('.', ',') + '<small>h</small>'; v.style.color = col(+r.value); };
      r.oninput = () => { up(); H.tick(); }; up();
      $('#go', s).classList.add('show');
      $('#go', s).onclick = () => { U.S.hours = +r.value; U.save(); next(); };
    } },
    { id: 'calc', run(s, go) {
      const L = 2 * Math.PI * 66;
      s.innerHTML = `<div class="ring"><svg viewBox="0 0 150 150"><circle class="bgc" cx="75" cy="75" r="66"/><circle class="fg" cx="75" cy="75" r="66" style="stroke-dasharray:${L};stroke-dashoffset:${L}"/></svg><span id="pc">0%</span></div><div class="big" style="font-size:22px">Calculando…</div><ul class="steps" style="margin-top:18px"><li>Tus horas despierto</li><li>Tu tiempo de pantalla</li><li>Lo que te queda por delante</li><li>Lo que puedes recuperar</li></ul>`;
      const fg = $('.fg', s), pc = $('#pc', s), li = $$('li', s); let k = 0;
      const iv = every(() => { k += 2; fg.style.strokeDashoffset = L * (1 - k / 100); pc.textContent = k + '%'; if (k % 25 === 0) { li[k / 25 - 1].classList.add('ok'); H.tick(); } if (k >= 100) { clearInterval(iv); H.thud(); later(go, 500); } }, 55);
    } },
    { id: 'res', bg: 'alert', run(s) {
      const y = yearsLost(), d = Math.round(U.S.hours * 365 / 24);
      s.innerHTML = `<div class="kick">${esc(U.S.name)}, a este ritmo</div><div class="p" style="margin-top:0">este año perderás</div><div class="hero" id="d">0</div><div class="p" style="margin-top:4px">y hasta los 80</div><div class="hero" id="y" style="font-size:64px">0</div><div class="p">de tu vida despierto, mirando una pantalla.</div>${btn('No quiero eso')}`;
      count($('#d', s), d, { suf: 'días', dur: 1200, done() { H.thud(); count($('#y', s), y, { dec: 1, suf: 'años', dur: 1400, done() { H.thud(); show(s); } }); } });
    } },
    { id: 'rec', bg: 'good', run(s) {
      const y = +(yearsLost() * .55).toFixed(1);
      s.innerHTML = `<div class="kick" style="color:var(--green)">La buena noticia</div><div class="p" style="margin-top:0">Con disciplina diaria puedes recuperar</div><div class="hero" id="y">+0</div><div class="p">para estudiar, entrenar, crear y vivir de verdad.</div>${btn('Recuperar ' + String(y).replace('.', ',') + ' años', 'green')}`;
      count($('#y', s), y, { dec: 1, pre: '+', suf: 'años', dur: 1600, done() { H.success(); show(s); } });
    } },
    { id: 'marco', bg: 'gold', run(s) {
      s.innerHTML = `<div id="mc" style="margin-top:-40px"></div><div class="big type" id="t" style="font-size:24px;margin-top:20px;min-height:3.6em"></div>${btn('Encantado, Marco', 'gold')}`;
      const m = Mascot.mount($('#mc', s), { size: 200, mood: 'sleepy' });
      later(() => { m.mood('alert').jump(); H.thud(); tone(660, .12); }, 700);
      later(() => { m.mood('calm'); type($('#t', s), 'Soy Marco. No vengo a motivarte. Vengo a que cumplas.', { tick: true, done() { m.mood('cool'); m.jump(); later(() => show(s), 300); } }); }, 1500);
    } },
    { id: 'areas', run(s) {
      s.innerHTML = `<div class="kick">Tu campo de batalla</div><div class="big">¿Qué quieres dominar?</div><p class="p">Elige hasta 4. Te preparo los hábitos.</p><div class="chips">${D.AREAS.map(a => `<button class="chip${U.S.areas.includes(a.id) ? ' on' : ''}" data-id="${a.id}">${a.em} ${a.name}</button>`).join('')}</div>${btn('Continuar')}`;
      const g = $('#go', s);
      const chk = () => { g.disabled = !$$('.chip.on', s).length; g.classList.add('show'); };
      $$('.chip', s).forEach(c => c.onclick = () => { if (!c.classList.contains('on') && $$('.chip.on', s).length >= 4) { c.animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], 200); return; } c.classList.toggle('on'); H.tick(); tone(c.classList.contains('on') ? 700 : 400, .05); chk(); });
      chk();
      g.onclick = () => {
        U.S.areas = $$('.chip.on', s).map(c => c.dataset.id);
        U.S.habits = U.S.areas.map(id => { const a = D.AREAS.find(x => x.id === id); return { id: a.id, name: a.habit, em: a.em }; });
        U.save(); next();
      };
    } },
    { id: 'free', run(s) {
      s.innerHTML = `<div class="kick">En 30 días</div><div class="big">Lo que cambia cuando cumples cada día</div><div class="cmp"><div class="col"><div class="bars no">${'<i></i>'.repeat(5)}</div><small>Sin método</small></div><div class="col"><div class="bars yes">${'<i></i>'.repeat(5)}</div><small>Con STOA</small></div></div><p class="p reveal" id="sub">Pequeño cada día. Enorme en un año.</p>${btn('Continuar')}`;
      const no = [70, 40, 62, 30, 24], yes = [26, 42, 60, 84, 100];
      $$('.no i', s).forEach((b, k) => later(() => { b.style.height = no[k] + '%'; H.tick(); }, 300 + k * 120));
      $$('.yes i', s).forEach((b, k) => later(() => { b.style.height = yes[k] + '%'; H.tick(); }, 950 + k * 120));
      later(() => { $('#sub', s).classList.add('show'); show(s); }, 1700);
    } },
    { id: 'metodo', run(s) {
      const P = [['Ⅰ', 'La regla de las dos faltas', 'Un fallo se perdona. Dos seguidos, no.'], ['Ⅱ', 'El examen nocturno', 'Tres preguntas antes de dormir, como Séneca.'], ['Ⅲ', 'Memento mori', 'Tu vida en semanas. Para no olvidar que se acaba.']];
      s.innerHTML = `<div class="kick">El método</div><div class="big">Tres reglas.<br>Dos mil años de prueba.</div><div style="width:100%;max-width:380px;margin-top:22px">${P.map((p, k) => `<div class="rev reveal" style="display:flex;gap:14px;align-items:center;transition-delay:${k * 380}ms"><div class="lesson" style="padding:0;border:0;background:none;width:auto;margin:0"><div class="n">${p[0]}</div></div><div><b>${p[1]}</b>${p[2]}</div></div>`).join('')}</div>${btn('Lo acepto')}`;
      later(() => { $$('.rev', s).forEach((r, k) => { r.classList.add('show'); later(H.tick, k * 380); }); }, 200);
      later(() => show(s), 1500);
    } },
    { id: 'hold', run(s, go) {
      s.innerHTML = `<div class="kick">El pacto</div><div class="big">Mantén pulsado para firmar tu compromiso.</div><p class="p">Contigo. Nadie más lo va a ver.</p><div class="hold" id="h"><svg viewBox="0 0 156 156"><circle cx="78" cy="78" r="72"/></svg>Mantén</div>`;
      hold($('#h', s), () => { $('#h', s).textContent = '✓'; burst(30); later(go, 700); });
    } },
    { id: 'letter', run(s) {
      const y = +(yearsLost() * .55).toFixed(1);
      const txt = `Querido ${U.S.name}:\n\nNo necesitas más motivación. Necesitas cumplir lo pequeño cuando no te apetece.\n\nCada día que cumples, recuperas un poco de esos ${String(y).replace('.', ',')} años. Cada día que fallas, mañana es innegociable.\n\nYo estaré aquí. Vigilando.`;
      s.innerHTML = `<div class="letter"><div id="lt" style="white-space:pre-line"></div><svg class="sign" id="sg" viewBox="0 0 140 60"><path d="M8 44 C14 20 20 12 22 30 C24 46 28 20 34 18 C40 16 38 42 44 40 C50 38 50 24 56 24 C62 24 58 40 66 38 C74 36 76 22 84 26 C92 30 86 42 96 40 C108 38 118 24 132 20"/></svg><div class="seal" id="se">M</div></div>${btn('Entrar en la Stoa', 'gold')}`;
      const lt = $('#lt', s);
      type(lt, txt, { speed: 18, tick: true, done() { $('.caret', lt) && $('.caret', lt).remove(); $('#sg', s).classList.add('go'); later(() => { $('#se', s).classList.add('on'); H.thud(); tone(140, .25, .06); }, 1700); later(() => show(s), 2100); } });
    } },
    { id: 'end', bg: 'good', run(s) {
      s.innerHTML = `<div id="mc"></div><div class="big" style="margin-top:14px">Bienvenido a la Stoa,<br><em>${esc(U.S.name)}</em>.</div><p class="p">Tu primer día empieza ahora.</p>${btn('Empezar', 'green')}`;
      const m = Mascot.mount($('#mc', s), { size: 170, mood: 'happy' });
      later(() => { burst(70); H.success(); m.jump(); tone(660, .1); later(() => tone(990, .2), 120); }, 300);
      later(() => show(s), 900);
      $('#go', s).onclick = () => { U.S.onboarded = true; U.save(); bgMode(''); root.innerHTML = ''; window.STOA.start(); };
    } }
  ];

  window.Onboarding = { start(el) { root = el; i = 0; next(); } };
})();
