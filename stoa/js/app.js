/* STOA — la app principal (Hoy, Hábitos, Foco, Estoa, Tú). */
(function () {
  const { $, $$, esc, later, H, tone, count, burst, toast, sheet, dkey, addDays, dayIndex } = U;
  const D = window.STOA_DATA, C = window.STOA_CONFIG;
  const S = () => U.S;
  const today = () => dkey();
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const fmt = n => String(n).replace('.', ',');
  const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  let marco, curTab = 'hoy';

  /* ---------- Lógica ---------- */
  const doneOn = k => (S().log[k] || []).filter(id => S().habits.some(h => h.id === id));
  const need = () => Math.max(1, Math.ceil(S().habits.length * .8));
  const dayOk = k => S().habits.length > 0 && doneOn(k).length >= need();
  function streak() {
    let s = dayOk(today()) ? 1 : 0, k = addDays(today(), -1), miss = 0;
    while (k >= S().created) { if (dayOk(k)) { s++; miss = 0; } else if (++miss >= 2) break; k = addDays(k, -1); }
    return s;
  }
  function rankFor(n) { let idx = 0; D.RANKS.forEach((r, i) => { if (n >= r[0]) idx = i; }); return { idx, r: D.RANKS[idx], nx: D.RANKS[idx + 1] || null }; }
  const pct = () => S().habits.length ? Math.round(doneOn(today()).length / S().habits.length * 100) : 0;
  function xp(n, why) { S().xp = Math.max(0, (S().xp || 0) + n); U.save(); const p = $('#xp'); if (p) { p.innerHTML = '✦ ' + S().xp; p.animate([{ transform: 'scale(1.18)' }, { transform: 'none' }], { duration: 400, easing: 'cubic-bezier(.34,1.56,.64,1)' }); } }
  const hour = () => new Date().getHours();

  /* ---------- Anuncios ---------- */
  function ad(slot) {
    const A = C.ADS || {};
    if (A.enabled && A.client && A.slots && A.slots[slot]) {
      return `<div class="ad" style="display:block;border-style:solid"><div class="tag">Publicidad</div><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(A.client)}" data-ad-slot="${esc(A.slots[slot])}" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`;
    }
    if (A.house) return `<a class="ad" href="${esc(A.house.url)}" target="_blank" rel="noopener sponsored" style="color:inherit;text-decoration:none"><div class="ph"></div><div><div class="tag">Patrocinado</div><b>${esc(A.house.title)}</b><small>${esc(A.house.text)}</small></div></a>`;
    return `<div class="ad"><div class="ph"></div><div><div class="tag">Espacio patrocinado</div><b>Tu anuncio aquí</b><small>Hueco reservado para publicidad</small></div></div>`;
  }
  function pushAds() { if (C.ADS && C.ADS.enabled) $$('ins.adsbygoogle:not([data-done])').forEach(i => { i.dataset.done = 1; try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { } }); }

  /* ---------- Esqueleto ---------- */
  const ICONS = {
    hoy: '<svg viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/></svg>',
    hab: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>',
    foco: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 2"/><path d="M9.5 3h5"/></svg>',
    estoa: '<svg viewBox="0 0 24 24"><path d="M3.5 9 12 4.5 20.5 9"/><path d="M4 10h16"/><path d="M6.5 11v7M10.5 11v7M13.5 11v7M17.5 11v7"/><path d="M4 20h16"/></svg>',
    tu: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.3-3.8 4.2-5.5 7.5-5.5s6.2 1.7 7.5 5.5"/></svg>'
  };
  const TABS = [['hoy', 'Hoy'], ['hab', 'Hábitos'], ['foco', 'Foco'], ['estoa', 'Estoa'], ['tu', 'Tú']];

  function start() {
    const app = $('#app');
    app.innerHTML = `<div class="main scr" id="main">${TABS.map(t => `<section class="view" id="v-${t[0]}"></section>`).join('')}</div>`;
    let nav = $('nav.tabs'); if (!nav) { nav = document.createElement('nav'); nav.className = 'tabs'; document.body.appendChild(nav); }
    nav.innerHTML = TABS.map(t => `<button data-t="${t[0]}">${ICONS[t[0]]}${t[1]}</button>`).join('');
    $$('button', nav).forEach(b => b.onclick = () => { H.tick(); go(b.dataset.t); });
    const want = new URLSearchParams(location.search).get('go');
    go(TABS.some(t => t[0] === want) ? want : 'hoy');
  }
  function go(t) {
    curTab = t;
    $$('nav.tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
    $$('.view').forEach(v => { const on = v.id === 'v-' + t; v.classList.toggle('on', on); if (!on) v.innerHTML = ''; });
    ({ hoy: renderHoy, hab: renderHab, foco: renderFoco, estoa: renderEstoa, tu: renderTu })[t]();
    $('#main').scrollTop = 0;
    pushAds();
  }
  const topBar = () => `<div class="top"><div class="mark">STOA</div><div class="row"><span class="pill fire" id="fire">🔥 ${streak()}</span><span class="pill" id="xp">✦ ${S().xp || 0}</span></div></div>`;

  /* ---------- HOY ---------- */
  function greeting() { const h = hour(); return h < 6 ? 'Buenas noches' : h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches'; }
  function moodNow() {
    const p = pct(), h = hour();
    if (p === 100) return 'proud';
    if (h < 9 && p === 0) return 'sleepy';
    if (h >= 21 && p < 50) return 'sad';
    if (p >= 50) return 'happy';
    return 'calm';
  }
  function marcoLine() { const h = hour(); return pick(h < 13 ? D.MARCO.morning : h < 20 ? D.MARCO.afternoon : D.MARCO.night); }

  function renderHoy() {
    const v = $('#v-hoy'), st = streak(), rk = rankFor(st), q = D.QUOTES[dayIndex() % D.QUOTES.length], ch = D.CHALLENGES[dayIndex() % D.CHALLENGES.length];
    const rv = S().reviews[today()] || {}, retoDone = !!S().retos[today()], flipped = S().quoteSeen === today();
    let date = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    date = date.charAt(0).toUpperCase() + date.slice(1);
    v.innerHTML = `${topBar()}
      <div class="hoy-hero">
        <div class="txt"><div class="sub" style="margin:0">${date}</div><div class="h1" style="margin-top:4px">${greeting()},<br>${esc(S().name || 'estoico')}.</div>
        <div class="prog"><i id="pg"></i></div><div class="sub" id="pgt"></div></div>
        <div id="hm"></div>
      </div>
      <div class="stats">
        <div class="stat"><b id="sst">0</b><span>DÍAS SEGUIDOS</span></div>
        <div class="stat"><b>${rk.r[1]}</b><span>${rk.r[2].toUpperCase()}</span></div>
        <div class="stat"><b id="spc">0%</b><span>HOY</span></div>
      </div>
      <div class="sec">Hoy toca <button id="addh">+ Hábito</button></div>
      <div id="hlist"></div>
      <div class="sec">Frase del día</div>
      <div class="flip${flipped ? ' on' : ''}" id="flip"><div class="in">
        <div class="f"><div class="seal2">M</div><b>Toca para abrir</b><div class="sub">Una frase nueva cada día</div></div>
        <div class="b"><q>${esc(q[0])}</q><small>${esc(q[1]).toUpperCase()}</small></div>
      </div></div>
      <div class="sec">Reto del día</div>
      <div class="card"><div class="reto"><div class="ic">⚔️</div><div style="flex:1"><b>${esc(ch[0])}</b><p>${esc(ch[1])}</p></div></div>
        <button class="btn w ${retoDone ? 'ok' : ''}" id="reto">${retoDone ? '✓ Reto cumplido · +15' : 'Lo he cumplido'}</button></div>
      ${ad('hoy')}
      <div class="sec">Examen nocturno ${hour() >= 20 ? '<span style="color:var(--gold);letter-spacing:0;text-transform:none">· ahora</span>' : ''}</div>
      <div class="card">
        <label class="lbl">¿Qué he hecho bien hoy?</label><textarea class="ta" data-k="a" placeholder="Escribe sin pensar demasiado…">${esc(rv.a || '')}</textarea>
        <label class="lbl">¿En qué he fallado?</label><textarea class="ta" data-k="b" placeholder="Con honestidad.">${esc(rv.b || '')}</textarea>
        <label class="lbl">¿Qué haré mejor mañana?</label><textarea class="ta" data-k="c" placeholder="Una cosa concreta.">${esc(rv.c || '')}</textarea>
        <button class="btn w ${rv.done ? 'ok' : ''}" id="rvb">${rv.done ? '✓ Examen guardado' : 'Cerrar el día'}</button>
      </div>
      <p class="sub" style="text-align:center;margin:26px 0 0;font-family:var(--serif);font-style:italic;font-size:16px">«Memento mori.»</p>`;

    marco = Mascot.mount($('#hm', v), { size: 132, mood: moodNow(), onTap: m => { H.tick(); tone(520, .06); m.jump().say(pick(D.MARCO.tap)); } });
    later(() => marco.say(marcoLine(), 3600), 700);
    count($('#sst', v), st, { dur: 900 });
    drawHabits(); updProg(true);

    $('#addh', v).onclick = () => editHabit();
    $('#flip', v).onclick = e => { const f = e.currentTarget; if (!f.classList.contains('on')) { f.classList.add('on'); H.thud(); tone(440, .15); if (S().quoteSeen !== today()) { S().quoteSeen = today(); xp(5); } marco.mood('focus'); later(() => marco.mood(moodNow()), 2500); } else f.classList.remove('on'); };
    $('#reto', v).onclick = e => { if (S().retos[today()]) return; S().retos[today()] = 1; xp(15); U.save(); e.target.className = 'btn w ok'; e.target.textContent = '✓ Reto cumplido · +15'; H.success(); burst(30); marco.mood('cool').jump().say('Eso es un estoico.'); later(() => marco.mood(moodNow()), 3000); };
    $$('.ta', v).forEach(t => t.oninput = () => { const r = S().reviews[today()] = S().reviews[today()] || {}; r[t.dataset.k] = t.value; U.save(); });
    $('#rvb', v).onclick = e => {
      const r = S().reviews[today()] = S().reviews[today()] || {};
      if (!(r.a || r.b || r.c)) { marco.shake().say('Escribe al menos una línea.'); return; }
      if (!r.done) { r.done = 1; xp(20); }
      U.save(); e.target.className = 'btn w ok'; e.target.textContent = '✓ Examen guardado'; H.success(); marco.mood('proud').jump().say('Así cerraba el día Séneca.');
    };
  }

  function habitRow(h, done) {
    const wk = []; for (let k = 6; k >= 0; k--) { const d = addDays(today(), -k); wk.push(`<i class="${(S().log[d] || []).includes(h.id) ? 'y' : ''}${k === 0 ? ' t' : ''}"></i>`); }
    return `<div class="hab${done ? ' done' : ''}" data-id="${h.id}"><div class="em">${esc(h.em || '•')}</div><div class="nm">${esc(h.name)}<div class="week">${wk.join('')}</div></div><button class="ck" aria-label="Hecho">${CHECK}</button></div>`;
  }
  function drawHabits() {
    const L = $('#hlist'); if (!L) return;
    if (!S().habits.length) { L.innerHTML = `<div class="card" style="text-align:center;color:var(--mut)">Aún no tienes hábitos. Pulsa «+ Hábito».</div>`; return; }
    const d = S().log[today()] || [];
    L.innerHTML = S().habits.map(h => habitRow(h, d.includes(h.id))).join('');
    $$('.hab', L).forEach(r => {
      r.onclick = e => { if (e.target.closest('.ck') || !e.target.closest('.nm,.em')) toggle(r); else editHabit(S().habits.find(h => h.id === r.dataset.id)); };
    });
  }
  function toggle(r) {
    const id = r.dataset.id, d = S().log[today()] = S().log[today()] || [];
    const before = dayOk(today()), rk0 = rankFor(streak()).idx;
    const i = d.indexOf(id);
    if (i < 0) { d.push(id); r.classList.add('done'); xp(10); H.thud(); tone(660 + d.length * 60, .09, .05); }
    else { d.splice(i, 1); r.classList.remove('done'); xp(-10); H.tick(); }
    U.save();
    const t = r.querySelector('.week i.t'); if (t) t.classList.toggle('y', i < 0);
    updProg();
    if (i < 0) {
      if (pct() === 100) { burst(80); H.success(); marco.mood('proud').jump().say(pick(D.MARCO.all), 4000); later(() => marco.mood('cool'), 2600); }
      else { marco.mood(moodNow()).jump().say(pick(D.MARCO.done), 1800); }
    } else marco.mood(moodNow());
    if (!before && dayOk(today())) { toast('Día salvado', 'Has llegado al 80 %. La racha sigue viva.', '🔥'); }
    const st = streak(); $('#fire').innerHTML = '🔥 ' + st; const sst = $('#sst'); if (sst) sst.textContent = st;
    if (st > (S().bestStreak || 0)) { S().bestStreak = st; U.save(); }
    const rk = rankFor(st); if (rk.idx > rk0 && rk.idx > (S().rankSeen || 0)) { S().rankSeen = rk.idx; U.save(); rankUp(rk.r); }
  }
  function updProg(first) {
    const p = pct(), n = doneOn(today()).length, tot = S().habits.length;
    const pg = $('#pg'); if (pg) pg.style.width = p + '%';
    const t = $('#pgt'); if (t) t.textContent = tot ? `${n} de ${tot} hechos · necesitas ${need()} para salvar el día` : 'Añade tu primer hábito';
    const sp = $('#spc'); if (sp) { if (first) count(sp, p, { suf: '%', dur: 900 }); else sp.innerHTML = p + '<small>%</small>'; }
  }
  function rankUp(r) {
    const el = document.createElement('div'); el.className = 'rankup';
    el.innerHTML = `<div class="em">${r[1]}</div><div class="kick" style="margin-top:16px">Nuevo rango</div><div class="big">${esc(r[2])}</div><p class="p">${r[0]} días cumpliendo. Esto ya no es suerte.</p><button class="cta gold" style="margin-top:28px;max-width:300px">Seguir</button>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    burst(90); H.success(); tone(523, .15); later(() => tone(784, .3), 150);
    $('button', el).onclick = () => { el.classList.remove('on'); later(() => el.remove(), 400); };
  }

  /* ---------- HÁBITOS ---------- */
  const EMOJIS = ['📚', '🏋️', '🌙', '📵', '📖', '💰', '🧘', '☀️', '💧', '🥗', '🚿', '✍️', '🏃', '🎯', '🧹', '🙏'];
  function editHabit(h) {
    const isNew = !h; h = h || { id: 'h' + Date.now().toString(36), name: '', em: '🎯' };
    sheet(`<h3>${isNew ? 'Nuevo hábito' : 'Editar hábito'}</h3><p class="p">Algo concreto que puedas marcar como hecho cada día.</p>
      <input class="field" id="hn" style="font-size:17px;text-align:left;margin-top:16px" maxlength="40" placeholder="Ej.: Leer 10 páginas" value="${esc(h.name)}">
      <div class="emo">${EMOJIS.map(e => `<button class="${e === h.em ? 'on' : ''}">${e}</button>`).join('')}</div>
      <button class="cta" id="hs" style="margin-top:18px">${isNew ? 'Añadir' : 'Guardar'}</button>
      ${isNew ? '' : '<button class="cta ghost" id="hd" style="width:100%;margin-top:6px;color:var(--red)">Borrar hábito</button>'}`, (sh, close) => {
      let em = h.em;
      $$('.emo button', sh).forEach(b => b.onclick = () => { $$('.emo button', sh).forEach(x => x.classList.remove('on')); b.classList.add('on'); em = b.textContent; H.tick(); });
      $('#hs', sh).onclick = () => { const n = $('#hn', sh).value.trim(); if (!n) return; h.name = n; h.em = em; if (isNew) S().habits.push(h); U.save(); close(); H.thud(); refresh(); };
      const del = $('#hd', sh); if (del) del.onclick = () => { S().habits = S().habits.filter(x => x.id !== h.id); U.save(); close(); refresh(); };
      later(() => $('#hn', sh).focus(), 350);
    });
  }
  const refresh = () => go(curTab);

  function renderHab() {
    const v = $('#v-hab');
    const cells = []; for (let k = 34; k >= 0; k--) { const d = addDays(today(), -k); const n = doneOn(d).length, tot = S().habits.length || 1; const a = n / tot; cells.push(`<i title="${d}" style="background:${a ? `rgba(43,224,122,${(.18 + a * .82).toFixed(2)})` : 'rgba(255,255,255,.06)'};${k === 0 ? 'outline:1px solid var(--gold);' : ''}"></i>`); }
    v.innerHTML = `${topBar()}<div class="h1">Hábitos</div><div class="sub">Toca el nombre para editarlo. Toca el círculo para marcarlo.</div>
      <div class="card" style="margin-top:16px"><div class="sec" style="margin:0 0 10px">Últimos 35 días</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px" id="heat">${cells.join('')}</div></div>
      <div class="sec">Cada día <button id="addh2">+ Nuevo</button></div><div id="hlist"></div>
      <div class="card" style="margin-top:14px;display:flex;gap:12px;align-items:center"><div style="font-size:26px">⚖️</div><div class="sub" style="margin:0;line-height:1.45"><b style="color:var(--ink)">La regla de las dos faltas.</b> Un día fallado se perdona. Dos seguidos rompen la racha. Un día cuenta si cumples al menos el 80 %.</div></div>`;
    $$('#heat i', v).forEach(i => { i.style.aspectRatio = '1'; i.style.borderRadius = '6px'; i.style.display = 'block'; });
    marco = marco || Mascot.mount(document.createElement('div'));
    drawHabits();
    $('#addh2', v).onclick = () => editHabit();
  }

  /* ---------- FOCO ---------- */
  const F = { len: 25, left: 25 * 60, run: false, iv: null, m: null };
  function renderFoco() {
    const v = $('#v-foco'), R = 120, L = 2 * Math.PI * R;
    let ticks = ''; for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2, r1 = k % 5 ? 132 : 128; ticks += `<line x1="${135 + Math.cos(a) * r1}" y1="${135 + Math.sin(a) * r1}" x2="${135 + Math.cos(a) * 136}" y2="${135 + Math.sin(a) * 136}"/>`; }
    v.innerHTML = `${topBar()}<div class="h1">Foco</div><div class="sub">Móvil boca abajo. Marco vigila.</div>
      <div class="focus-wrap">
        <div class="timer"><svg class="t" viewBox="0 0 270 270"><defs><linearGradient id="tg" x1="0" x2="1"><stop offset="0" stop-color="#f6d27a"/><stop offset="1" stop-color="#E8B04A"/></linearGradient></defs><g class="ticks">${ticks}</g><circle class="bgc" cx="135" cy="135" r="${R}"/><circle class="fg" id="tfg" cx="135" cy="135" r="${R}" style="stroke-dasharray:${L}"/></svg>
          <div class="mid"><div id="fm"></div><div class="clock" id="clk"></div></div></div>
        <div class="seg" id="seg">${[15, 25, 50].map(n => `<button data-n="${n}" class="${n === F.len ? 'on' : ''}">${n} min</button>`).join('')}</div>
        <div class="row" style="margin-top:16px;justify-content:center"><button class="btn" id="fs" style="min-width:150px"></button><button class="btn ghost" id="fr">Reiniciar</button></div>
        <div class="stats" style="width:100%;margin-top:22px"><div class="stat"><b>${S().focusN || 0}</b><span>SESIONES</span></div><div class="stat"><b>${Math.round((S().focusMin || 0) / 60 * 10) / 10}</b><span>HORAS</span></div><div class="stat"><b>+25</b><span>✦ POR SESIÓN</span></div></div>
      </div>${ad('foco')}`;
    F.m = Mascot.mount($('#fm', v), { size: 92, mood: F.run ? 'focus' : 'calm', onTap: m => m.jump().say(F.run ? 'Silencio. Estamos trabajando.' : 'Cuando quieras.') });
    const draw = () => { const k = F.left / (F.len * 60); $('#tfg').style.strokeDashoffset = L * (1 - k); $('#clk').textContent = String(Math.floor(F.left / 60)).padStart(2, '0') + ':' + String(F.left % 60).padStart(2, '0'); $('#fs').textContent = F.run ? 'Pausa' : (F.left < F.len * 60 ? 'Seguir' : 'Empezar'); };
    F.draw = draw; draw();
    $$('#seg button', v).forEach(b => b.onclick = () => { if (F.run) return; F.len = +b.dataset.n; F.left = F.len * 60; $$('#seg button').forEach(x => x.classList.toggle('on', x === b)); H.tick(); draw(); });
    $('#fs', v).onclick = () => { F.run ? pause() : startF(); };
    $('#fr', v).onclick = () => { pause(); F.left = F.len * 60; draw(); F.m && F.m.mood('calm'); };
  }
  function startF() {
    F.run = true; H.thud(); tone(440, .12); F.m && F.m.mood('focus').say('Empezamos.', 1500);
    clearInterval(F.iv);
    F.iv = setInterval(() => {
      F.left--; if (F.draw && $('#clk')) F.draw();
      if (F.left <= 0) {
        clearInterval(F.iv); F.run = false; S().focusN = (S().focusN || 0) + 1; S().focusMin = (S().focusMin || 0) + F.len; xp(25); U.save();
        H.success(); burst(60); tone(660, .2); later(() => tone(880, .3), 200);
        toast('Sesión completada', `${F.len} minutos de foco. +25 ✦`, '⏳');
        F.left = F.len * 60; if (curTab === 'foco') renderFoco(); F.m && F.m.mood('proud').jump().say('Eso es trabajo de verdad.');
      }
    }, 1000);
    F.draw && F.draw();
  }
  function pause() { F.run = false; clearInterval(F.iv); F.draw && $('#clk') && F.draw(); F.m && F.m.mood('calm'); }

  /* ---------- ESTOA ---------- */
  function renderEstoa() {
    const v = $('#v-estoa'), vids = C.VIDEOS || [];
    const glyph = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ'];
    v.innerHTML = `${topBar()}<div class="h1">La Estoa</div><div class="sub">Vídeos, ejercicios y lecciones de un minuto.</div>
      <div class="sec">Vídeos</div>
      <div class="feed">${vids.map((x, k) => `<button class="vid${x.src || x.youtube ? '' : ' soon'}" data-k="${k}">${x.poster ? `<img src="${esc(x.poster)}" alt="">` : `<span class="glyph">${glyph[k % 10]}</span>`}<span class="play"></span><span class="tg">${esc(x.tag || '')}</span><b>${esc(x.title)}</b><small>${x.src || x.youtube ? esc(x.dur || '') : 'Próximamente'}</small></button>`).join('')}</div>
      <div class="sec">Ejercicio · ¿Depende de ti? <span class="score" id="cs"></span></div>
      <div class="card"><div class="ctl-card" id="cc"></div><div class="ctl"><button class="y" id="cy">Depende de mí</button><button class="n" id="cn">No depende</button></div></div>
      ${ad('estoa')}
      <div class="sec">Lecciones de un minuto</div>
      <div id="ls">${D.LESSONS.map((l, k) => `<button class="lesson${S().lessons[k] ? ' done' : ''}" data-k="${k}"><div class="n">${S().lessons[k] ? '✓' : glyph[k]}</div><div style="flex:1"><b>${esc(l.t)}</b><div class="sub" style="margin:2px 0 0">${S().lessons[k] ? 'Leída' : '1 min · +10 ✦'}</div></div></button>`).join('')}</div>
      <div class="sec">Frases</div>
      ${D.QUOTES.slice(0, 8).map(q => `<div class="card"><div class="serif" style="font-size:19px;line-height:1.35">«${esc(q[0])}»</div><div class="sub" style="font-family:var(--roman);letter-spacing:.16em;font-size:11px;margin-top:8px;color:var(--gold)">${esc(q[1]).toUpperCase()}</div></div>`).join('')}`;
    $$('.vid', v).forEach(b => b.onclick = () => openVideo(vids[+b.dataset.k]));
    $$('.lesson', v).forEach(b => b.onclick = () => openLesson(+b.dataset.k));
    controlGame(v);
  }
  function openVideo(x) {
    if (!x.src && !x.youtube) { toast('Próximamente', `«${x.title}» llega pronto.`, '🎬'); return; }
    const media = x.youtube ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(x.youtube)}?autoplay=1&playsinline=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>` : `<video src="${esc(x.src)}" ${x.poster ? `poster="${esc(x.poster)}"` : ''} controls autoplay playsinline></video>`;
    sheet(`<div class="kick" style="margin:0">${esc(x.tag || '')}</div><h3>${esc(x.title)}</h3>${media}`, (sh, close) => {
      const vd = $('video', sh); if (vd) vd.onended = () => { xp(5); toast('Vídeo visto', '+5 ✦', '🎬'); };
    });
  }
  function openLesson(k) {
    const l = D.LESSONS[k];
    sheet(`<div class="kick" style="margin:0">Lección ${k + 1}</div><h3>${esc(l.t)}</h3><p class="p serif" style="font-size:21px;line-height:1.45;color:var(--ink);max-width:none">${esc(l.b)}</p><button class="cta gold" id="ld" style="margin-top:22px">Entendido</button>`, (sh, close) => {
      $('#ld', sh).onclick = () => { if (!S().lessons[k]) { S().lessons[k] = 1; xp(10); U.save(); burst(26); H.success(); } close(); if (curTab === 'estoa') renderEstoa(); };
    });
  }
  function controlGame(v) {
    const deck = D.CONTROL.slice().sort(() => Math.random() - .5); let i = 0, ok = 0;
    const card = $('#cc', v), sc = $('#cs', v);
    const show = () => { card.className = 'ctl-card'; if (i >= deck.length) { card.innerHTML = `<div><div style="font-size:30px">${ok >= deck.length - 1 ? '🏛️' : '⚖️'}</div>${ok}/${deck.length} · ${ok >= deck.length - 1 ? 'Mente de emperador' : 'Otra vez mañana'}<div class="sub" style="font-weight:600;margin-top:4px;cursor:pointer;color:var(--gold)" id="again">Repetir</div></div>`; $('#again', v).onclick = () => { deck.sort(() => Math.random() - .5); i = 0; ok = 0; show(); }; if (ok > (S().ctlBest || 0)) { S().ctlBest = ok; U.save(); } return; } card.textContent = deck[i][0]; sc.textContent = `${i + 1}/${deck.length}`; };
    const ans = mine => { if (i >= deck.length) return; const right = deck[i][1] === mine; card.classList.add(mine ? 'goL' : 'goR'); if (right) { ok++; H.tick(); tone(760, .06); xp(2); } else { H.thud(); tone(180, .15); toast('Piénsalo', deck[i][1] ? `«${deck[i][0]}» sí depende de ti.` : `«${deck[i][0]}» no depende de ti. Suéltalo.`, '⚖️'); } i++; later(show, 320); };
    $('#cy', v).onclick = () => ans(true); $('#cn', v).onclick = () => ans(false);
    show();
  }

  /* ---------- TÚ ---------- */
  function renderTu() {
    const v = $('#v-tu'), st = streak(), rk = rankFor(st);
    const lived = Math.floor((S().age || 18) * 52.18), P = C.PREMIUM || {};
    v.innerHTML = `${topBar()}
      <div style="display:flex;align-items:center;gap:14px"><div id="tm"></div><div><div class="h1">${esc(S().name || 'Estoico')}</div><div class="sub">${rk.r[1]} ${rk.r[2]} · ✦ ${S().xp || 0}</div></div></div>
      <div class="stats"><div class="stat"><b>${st}</b><span>RACHA</span></div><div class="stat"><b>${Math.max(st, S().bestStreak || 0)}</b><span>MEJOR</span></div><div class="stat"><b>${Object.keys(S().reviews).filter(k => S().reviews[k].done).length}</b><span>EXÁMENES</span></div></div>
      <div class="sec">Rangos ${rk.nx ? `<span style="letter-spacing:0;text-transform:none;color:var(--mut)">${rk.nx[0] - st} días para ${rk.nx[2]}</span>` : ''}</div>
      <div class="card ladder">${D.RANKS.map((r, k) => `<div class="lad ${k === rk.idx ? 'on' : k < rk.idx ? 'past' : ''}"><span style="font-size:22px">${r[1]}</span><b>${r[2]}</b><small>${r[0]} días</small></div>`).join('')}</div>
      <div class="sec">Memento mori · tu vida en semanas</div>
      <div class="card"><div class="sub" style="margin:0 0 6px">Cada punto es una semana de 80 años. Las doradas ya pasaron. La roja es esta.</div><canvas id="mm"></canvas><div class="sub" style="margin-top:8px">${lived.toLocaleString('es-ES')} semanas vividas · ${Math.max(0, 4174 - lived).toLocaleString('es-ES')} por delante</div></div>
      ${P.enabled ? `<div class="sec">Premium</div><div class="card" style="border-color:rgba(232,176,74,.4)"><b>STOA Premium · ${esc(P.price)}</b><ul class="sub">${(P.perks || []).map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
      <div class="sec">Ajustes</div>
      <div class="card">
        <button class="btn ghost w" style="margin-top:0" id="noti">🔔 Activar recordatorios</button>
        <button class="btn ghost w" id="exp">Exportar mis datos</button>
        <button class="btn ghost w" id="imp">Importar datos</button>
        <button class="btn ghost w" id="intro">Ver la introducción otra vez</button>
        <button class="btn ghost w" id="rst" style="color:var(--red)">Borrar todo y empezar de cero</button>
      </div>
      <p class="sub" style="text-align:center;margin-top:22px">STOA · versión de prueba</p>`;
    Mascot.mount($('#tm', v), { size: 84, mood: st >= 7 ? 'cool' : 'calm', onTap: m => m.jump().say(pick(D.MARCO.tap)) });
    drawMM(lived);
    $('#noti', v).onclick = async () => {
      if (!('Notification' in window)) { toast('No disponible', 'En iPhone, añade la app a la pantalla de inicio primero.', '🔔'); return; }
      const p = await Notification.requestPermission();
      if (p === 'granted') { try { new Notification('STOA', { body: 'Así te avisará Marco. Hoy no tienes que tener ganas. Tienes que empezar.' }); } catch (e) { } toast('Recordatorios activados', 'Marco te avisará.', '🔔'); }
      else toast('Sin permiso', 'Puedes activarlos en los ajustes del navegador.', '🔔');
    };
    $('#exp', v).onclick = () => { const b = new Blob([JSON.stringify(S(), null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'stoa-' + today() + '.json'; a.click(); };
    $('#imp', v).onclick = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json'; i.onchange = () => { const f = i.files[0]; if (!f) return; f.text().then(t => { try { U.S = Object.assign({}, U.DEF, JSON.parse(t)); U.save(); toast('Datos importados', '', '✓'); go('hoy'); } catch (e) { toast('Archivo no válido', '', '⚠️'); } }); }; i.click(); };
    $('#intro', v).onclick = () => { S().onboarded = false; U.save(); location.reload(); };
    $('#rst', v).onclick = () => sheet(`<h3>¿Borrar todo?</h3><p class="p">Se perderán tus hábitos, rachas y exámenes de este móvil.</p><button class="cta" id="y" style="margin-top:18px;background:var(--red);color:#fff">Sí, borrar</button>`, (sh) => { $('#y', sh).onclick = () => { try { localStorage.removeItem(U.KEY); } catch (e) { } location.reload(); }; });
  }
  function drawMM(lived) {
    const c = $('#mm'); if (!c) return;
    const cols = 52, rows = 80, w = c.clientWidth || 340, cell = w / cols, dpr = devicePixelRatio || 1;
    c.width = w * dpr; c.height = rows * cell * dpr; c.style.height = rows * cell + 'px';
    const x = c.getContext('2d'); x.scale(dpr, dpr);
    let n = 0; const total = cols * rows;
    (function draw() {
      const end = Math.min(total, n + 260);
      for (; n < end; n++) { const r = Math.floor(n / cols), k = n % cols; x.fillStyle = n < lived ? '#E8B04A' : n === lived ? '#FF2D3A' : 'rgba(255,255,255,.12)'; x.beginPath(); x.arc(k * cell + cell / 2, r * cell + cell / 2, cell * .3, 0, Math.PI * 2); x.fill(); }
      if (n < total) requestAnimationFrame(draw);
    })();
  }

  window.STOA = { start, go };

  // Arranque
  document.addEventListener('DOMContentLoaded', () => {
    if (S().onboarded && new URLSearchParams(location.search).get('intro') !== '1') start();
    else Onboarding.start($('#app'));
  });
})();
