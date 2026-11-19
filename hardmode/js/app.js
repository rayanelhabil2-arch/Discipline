/* HARDMODE — la app (Hoy, Espejo, Foco, Arsenal, Ranking, Perfil). */
(function () {
  const { $, $$, esc, later, H, tone, count, burst, toast, sheet, dkey, addDays, dayIndex } = U;
  const D = window.HM_DATA, C = window.HM_CONFIG;
  const S = () => U.S;
  const today = () => dkey();
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  let tank, curTab = 'hoy';

  /* ---------- Lógica ---------- */
  const isPro = () => S().plan === 'pro' || !!S().demoPro;
  const doneOn = k => (S().log[k] || []).filter(id => S().habits.some(h => h.id === id));
  const need = () => Math.max(1, Math.ceil(S().habits.length * .8));
  const dayOk = k => S().habits.length > 0 && doneOn(k).length >= need();
  function streak() {
    let s = dayOk(today()) ? 1 : 0, k = addDays(today(), -1), miss = 0;
    while (k >= (S().created || today())) { if (dayOk(k)) { s++; miss = 0; } else if (++miss >= 2) break; k = addDays(k, -1); }
    return s;
  }
  window.HM_STREAK = streak;
  const dayN = () => { const c = S().created || today(); const [y, m, d] = c.split('-').map(Number); return Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(y, m - 1, d)) / 864e5) + 1; };
  function rankFor(n) { let idx = 0; D.RANKS.forEach((r, i) => { if (n >= r[0]) idx = i; }); return { idx, r: D.RANKS[idx], nx: D.RANKS[idx + 1] || null }; }
  const pct = () => S().habits.length ? Math.round(doneOn(today()).length / S().habits.length * 100) : 0;
  function xp(n) { S().xp = Math.max(0, (S().xp || 0) + n); U.save(); const p = $('#xp'); if (p) { p.innerHTML = '⚡ ' + S().xp; p.animate([{ transform: 'scale(1.2)' }, { transform: 'none' }], { duration: 350, easing: 'cubic-bezier(.34,1.56,.64,1)' }); } }
  const hour = () => new Date().getHours();
  const failedYesterday = () => { const y = addDays(today(), -1); return y >= (S().created || today()) && !dayOk(y); };

  /* ---------- Anuncios (solo gratis) ---------- */
  function ad(slot) {
    if (isPro()) return '';
    const A = C.ADS || {};
    if (A.enabled && A.client && A.slots && A.slots[slot]) return `<div class="ad" style="display:block;border-style:solid"><div class="tag">Publicidad</div><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(A.client)}" data-ad-slot="${esc(A.slots[slot])}" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`;
    if (A.house) return `<a class="ad" href="${esc(A.house.url)}" target="_blank" rel="noopener sponsored" style="color:inherit;text-decoration:none"><div class="ph"></div><div><div class="tag">Patrocinado</div><b>${esc(A.house.title)}</b><small>${esc(A.house.text)}</small></div></a>`;
    return `<div class="ad"><div class="ph"></div><div><div class="tag">Espacio patrocinado</div><b>Tu anuncio aquí</b><small>Hueco para publicidad</small></div><button class="rm" data-pro>QUITAR ›</button></div>`;
  }
  function pushAds() { if (C.ADS && C.ADS.enabled && !isPro()) $$('ins.adsbygoogle:not([data-done])').forEach(i => { i.dataset.done = 1; try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { } }); }

  /* ---------- Muro de pago en hoja ---------- */
  function paywall(reason) {
    const P = C.PLANS; let sel = P.find(p => p.best) || P[0];
    sheet(`<div class="kick" style="margin:0">PRO</div><h3>${esc(reason || 'Pásate a PRO')}</h3>
      <ul class="perks"><li>Hábitos ilimitados</li><li>Modo 40 % sin límite</li><li>Todos los vídeos</li><li>Sin anuncios</li></ul>
      <div class="plans">${P.map(p => `<button class="plan${p === sel ? ' on' : ''}" data-id="${p.id}">${p.best ? '<span class="badge">MÁS ELEGIDO</span>' : ''}<span class="rad"></span><span class="nm"><b>${esc(p.name)}</b><small>${esc(p.trial ? p.trial + ' · ' + p.note : p.note)}</small></span><span class="pr">${esc(p.price)}<small>${esc(p.per)}</small></span></button>`).join('')}</div>
      <button class="cta" id="pg" style="margin-top:14px">Desbloquear</button>`, (sh, close) => {
      $$('.plan', sh).forEach(b => b.onclick = () => { sel = P.find(p => p.id === b.dataset.id); $$('.plan', sh).forEach(x => x.classList.toggle('on', x === b)); H.tick(); });
      $('#pg', sh).onclick = () => {
        if (sel.link) { const u = new URL(sel.link); if (Cloud.user) u.searchParams.set('client_reference_id', Cloud.user.id); location.href = u.toString(); return; }
        S().demoPro = true; U.save(); close(); toast('Modo demo', 'Pagos aún no activados: PRO desbloqueado para probar.', '💳'); burst(50); refresh();
      };
    });
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-pro]')) paywall('Quita los anuncios'); });

  /* ---------- Esqueleto ---------- */
  const ICONS = {
    hoy: '<svg viewBox="0 0 24 24"><path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/></svg>',
    espejo: '<svg viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="6"/><path d="M10 8l4-2M10 12l4-2"/></svg>',
    foco: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l3 2"/><path d="M9 3h6"/></svg>',
    arsenal: '<svg viewBox="0 0 24 24"><path d="M5 19L19 5"/><path d="M15 5h4v4"/><path d="M5 5l14 14"/><path d="M5 15v4h4"/></svg>',
    rank: '<svg viewBox="0 0 24 24"><path d="M4 20h16"/><path d="M6 20v-6h4v6M10 20V9h4v11M14 20v-8h4v8"/></svg>'
  };
  const TABS = [['hoy', 'Hoy'], ['espejo', 'Espejo'], ['foco', 'Foco'], ['arsenal', 'Arsenal'], ['rank', 'Ranking']];

  function start() {
    const app = $('#app');
    app.innerHTML = `<div class="main scr" id="main">${TABS.concat([['tu']]).map(t => `<section class="view" id="v-${t[0]}"></section>`).join('')}</div>`;
    let nav = $('nav.tabs'); if (!nav) { nav = document.createElement('nav'); nav.className = 'tabs'; document.body.appendChild(nav); }
    nav.innerHTML = TABS.map(t => `<button data-t="${t[0]}">${ICONS[t[0]]}${t[1]}</button>`).join('');
    $$('button', nav).forEach(b => b.onclick = () => { H.tick(); go(b.dataset.t); });
    const want = new URLSearchParams(location.search).get('go');
    go(TABS.concat([['tu']]).some(t => t[0] === want) ? want : 'hoy');
    if (S().habits.length && failedYesterday() && pct() === 0) later(() => toast('Ayer fallaste', 'Hoy es innegociable. Dos seguidos rompen la racha.', '⚠️'), 1200);
  }
  function go(t) {
    curTab = t;
    $$('nav.tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
    $$('.view').forEach(v => { const on = v.id === 'v-' + t; v.classList.toggle('on', on); if (!on) v.innerHTML = ''; });
    ({ hoy: renderHoy, espejo: renderEspejo, foco: renderFoco, arsenal: renderArsenal, rank: renderRank, tu: renderTu })[t]();
    $('#main').scrollTop = 0;
    pushAds();
  }
  const refresh = () => go(curTab);
  const topBar = () => `<div class="top"><div class="mark">HARD<b>MODE</b></div><div class="row"><span class="pill fire" id="fire">🔥 ${streak()}</span><span class="pill" id="xp">⚡ ${S().xp || 0}</span>${isPro() ? '<span class="pill pro">PRO</span>' : ''}<button class="pill" id="me" aria-label="Perfil">👤</button></div></div>`;
  function wireTop(v) { const m = $('#me', v); if (m) m.onclick = () => { H.tick(); go('tu'); }; }

  /* ---------- HOY ---------- */
  function moodNow() {
    const p = pct(), h = hour();
    if (p === 100) return 'cool';
    if (failedYesterday() && p < 50) return 'angry';
    if (h < 8 && p === 0) return 'sleepy';
    if (h >= 21 && p < 50) return 'sad';
    if (p >= 50) return 'happy';
    return 'calm';
  }
  function tankLine() { if (failedYesterday() && pct() < 50) return pick(D.TANK.fail); const h = hour(); return pick(h < 13 ? D.TANK.morning : h < 20 ? D.TANK.afternoon : D.TANK.night); }

  function renderHoy() {
    const v = $('#v-hoy'), st = streak(), rk = rankFor(st), code = D.CODES[dayIndex() % D.CODES.length], ch = D.CHALLENGES[dayIndex() % D.CHALLENGES.length];
    const retoDone = !!S().retos[today()], flipped = S().codeSeen === today();
    const goals = (S().goals || []).filter(Boolean), gi = dayIndex() % Math.max(1, goals.length);
    v.innerHTML = `${topBar()}
      ${failedYesterday() && pct() < 100 ? `<div class="tape red" style="position:relative;left:0;right:0;transform:none;margin:0 0 12px;height:34px"><span style="background:var(--red);color:#fff;margin-left:12px">AYER FALLASTE · HOY ES INNEGOCIABLE</span></div>` : ''}
      <div class="hoy-hero">
        <div class="txt"><div class="sub" style="margin:0;font-family:var(--mono);font-size:11px;letter-spacing:.2em">${esc((S().name || '').toUpperCase())} · ${rk.r[1]} ${rk.r[2].toUpperCase()}</div>
        <div class="h1" style="font-size:58px;margin-top:4px">DÍA <em>${dayN()}</em></div>
        <div class="prog"><i id="pg"></i></div><div class="sub" id="pgt" style="font-size:12.5px"></div></div>
        <div id="hm"></div>
      </div>
      <div class="stats">
        <div class="stat"><b id="sst">0</b><span>RACHA</span></div>
        <div class="stat"><b id="spc">0</b><span>HOY</span></div>
        <div class="stat"><b>${rk.nx ? rk.nx[0] - st : '∞'}</b><span>${rk.nx ? 'PARA ' + rk.nx[2].toUpperCase() : 'LEYENDA'}</span></div>
      </div>
      <div class="sec"><span>Misiones de hoy</span><button id="addh">+ AÑADIR</button></div>
      <div id="hlist"></div>
      ${goals.length ? `<div class="sec"><span>Por esto peleas</span></div><div class="card" style="border-left:4px solid var(--yel)"><div style="font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--yel);font-weight:700">OBJETIVO ${gi + 1}/${goals.length}</div><div style="font-family:var(--disp);font-size:28px;line-height:1.02;text-transform:uppercase;margin-top:6px">${esc(goals[gi])}</div>${S().why ? `<div class="sub" style="margin-top:8px">«${esc(S().why)}»</div>` : ''}</div>` : ''}
      <div class="sec"><span>Código del día</span></div>
      <div class="flip${flipped ? ' on' : ''}" id="flip"><div class="in">
        <div class="f"><div class="seal2"><span>!</span></div><b>Toca para abrir</b><div class="sub" style="font-family:var(--mono);font-size:11px">+5 ⚡ · uno nuevo cada día</div></div>
        <div class="b"><q>${esc(code)}</q><small>CÓDIGO Nº ${dayIndex() % D.CODES.length + 1}</small></div>
      </div></div>
      <div class="sec"><span>Reto del día</span></div>
      <div class="card"><div class="reto"><div class="ic">⚔</div><div style="flex:1"><b>${esc(ch[0])}</b><p>${esc(ch[1])}</p></div></div>
        <button class="btn w ${retoDone ? 'ok' : 'red'}" id="reto">${retoDone ? '✓ Reto cumplido · +15 ⚡' : 'Lo he hecho'}</button></div>
      ${ad('hoy')}
      <button class="card" id="toMirror" style="width:100%;text-align:left;margin-top:14px;display:flex;align-items:center;gap:12px"><div style="font-size:26px">🪞</div><div style="flex:1"><b style="font-family:var(--disp);font-size:20px;font-weight:400;text-transform:uppercase">${hour() >= 19 ? 'Hora del espejo' : 'El espejo'}</b><div class="sub" style="margin:2px 0 0">${(S().reviews[today()] || {}).done ? '✓ Hecho hoy' : 'Di la verdad antes de dormir · +20 ⚡'}</div></div><span style="color:var(--red);font-family:var(--disp);font-size:24px">›</span></button>`;
    wireTop(v);
    tank = Mascot.mount($('#hm', v), { size: 132, mood: moodNow(), onTap: m => { H.tick(); tone(200, .08); m.jump().say(pick(D.TANK.tap)); } });
    later(() => tank.say(tankLine(), 3600), 700);
    count($('#sst', v), st, { dur: 800 });
    drawHabits(); updProg(true);
    $('#addh', v).onclick = () => editHabit();
    $('#flip', v).onclick = e => { const f = e.currentTarget; if (!f.classList.contains('on')) { f.classList.add('on'); H.thud(); tone(110, .2, .06); if (S().codeSeen !== today()) { S().codeSeen = today(); xp(5); } tank.mood('alert'); later(() => tank.mood(moodNow()), 2200); } else f.classList.remove('on'); };
    $('#reto', v).onclick = e => { if (S().retos[today()]) return; S().retos[today()] = 1; xp(15); U.save(); e.target.className = 'btn w ok'; e.target.textContent = '✓ Reto cumplido · +15 ⚡'; H.success(); burst(36); tank.mood('cool').jump().say('Eso es callo mental.'); later(() => tank.mood(moodNow()), 3000); };
    $('#toMirror', v).onclick = () => go('espejo');
  }

  function habitRow(h, done) {
    const wk = []; for (let k = 6; k >= 0; k--) { const d = addDays(today(), -k); wk.push(`<i class="${(S().log[d] || []).includes(h.id) ? 'y' : ''}${k === 0 ? ' t' : ''}"></i>`); }
    return `<div class="hab${done ? ' done' : ''}" data-id="${h.id}"><div class="em">${esc(h.em || '•')}</div><div class="nm">${esc(h.name)}<div class="week">${wk.join('')}</div></div><button class="ck" aria-label="Hecho">${CHECK}</button></div>`;
  }
  function drawHabits() {
    const L = $('#hlist'); if (!L) return;
    if (!S().habits.length) { L.innerHTML = `<div class="card" style="text-align:center;color:var(--mut)">Sin misiones. Pulsa «+ AÑADIR».</div>`; return; }
    const d = S().log[today()] || [];
    L.innerHTML = S().habits.map(h => habitRow(h, d.includes(h.id))).join('');
    $$('.hab', L).forEach(r => { r.onclick = e => { if (e.target.closest('.ck') || !e.target.closest('.nm,.em')) toggle(r); else editHabit(S().habits.find(h => h.id === r.dataset.id)); }; });
  }
  function toggle(r) {
    const id = r.dataset.id, d = S().log[today()] = S().log[today()] || [];
    const before = dayOk(today()), rk0 = rankFor(streak()).idx, i = d.indexOf(id);
    if (i < 0) { d.push(id); r.classList.add('done'); xp(10); H.thud(); tone(300 + d.length * 80, .09, .05); }
    else { d.splice(i, 1); r.classList.remove('done'); xp(-10); H.tick(); }
    U.save();
    const t = r.querySelector('.week i.t'); if (t) t.classList.toggle('y', i < 0);
    updProg();
    if (i < 0) {
      if (pct() === 100) { burst(90); H.success(); tank.mood('cool').jump().say(pick(D.TANK.all), 4000); }
      else tank.mood(moodNow()).jump().say(pick(D.TANK.done), 1800);
    } else tank.mood(moodNow());
    if (!before && dayOk(today())) toast('Día ganado', 'Has llegado al 80 %. La racha sigue viva.', '🔥');
    const st = streak(); $('#fire').innerHTML = '🔥 ' + st; const sst = $('#sst'); if (sst) sst.textContent = st;
    if (st > (S().bestStreak || 0)) { S().bestStreak = st; U.save(); }
    const rk = rankFor(st); if (rk.idx > rk0 && rk.idx > (S().rankSeen || 0)) { S().rankSeen = rk.idx; U.save(); rankUp(rk.r); }
  }
  function updProg(first) {
    const p = pct(), n = doneOn(today()).length, tot = S().habits.length;
    const pg = $('#pg'); if (pg) pg.style.width = p + '%';
    const t = $('#pgt'); if (t) t.textContent = tot ? `${n}/${tot} misiones · mínimo ${need()} para que el día cuente` : 'Añade tu primera misión';
    const sp = $('#spc'); if (sp) { if (first) count(sp, p, { suf: '%', dur: 800 }); else sp.innerHTML = p + '<small>%</small>'; }
  }
  function rankUp(r) {
    const el = document.createElement('div'); el.className = 'rankup';
    el.innerHTML = `<div class="em">${r[1]}</div><div class="kick" style="margin-top:16px">Nuevo rango</div><div class="big" style="font-size:60px">${esc(r[2])}</div><p class="p">${r[0]} días sin negociar. Esto ya no es suerte.</p><button class="cta">Seguir</button>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    burst(100); H.success(); tone(220, .2, .07); later(() => tone(440, .3), 150);
    $('button', el).onclick = () => { el.classList.remove('on'); later(() => el.remove(), 400); };
  }

  const EMOJIS = ['🏋️', '📚', '⏰', '📵', '🧊', '🏃', '💸', '🥩', '📖', '🌙', '💧', '✍️', '🧘', '🎯', '🥊', '🚫'];
  function editHabit(h) {
    const isNew = !h;
    if (isNew && !isPro() && S().habits.length >= (C.FREE_LIMITS.habits || 3)) { paywall(`Más de ${C.FREE_LIMITS.habits} misiones es PRO`); return; }
    h = h || { id: 'h' + Date.now().toString(36), name: '', em: '🎯' };
    sheet(`<h3>${isNew ? 'Nueva misión' : 'Editar misión'}</h3><p class="p">Algo que puedas marcar como hecho cada día. Sin trampas.</p>
      <input class="field l" id="hn" style="margin-top:14px" maxlength="40" placeholder="Ej.: 50 flexiones" value="${esc(h.name)}">
      <div class="emo">${EMOJIS.map(e => `<button class="${e === h.em ? 'on' : ''}">${e}</button>`).join('')}</div>
      <button class="cta" id="hs" style="margin-top:18px">${isNew ? 'Añadir' : 'Guardar'}</button>
      ${isNew ? '' : '<button class="cta ghost" id="hd" style="color:var(--red)">Borrar misión</button>'}`, (sh, close) => {
      let em = h.em;
      $$('.emo button', sh).forEach(b => b.onclick = () => { $$('.emo button', sh).forEach(x => x.classList.remove('on')); b.classList.add('on'); em = b.textContent; H.tick(); });
      $('#hs', sh).onclick = () => { const n = $('#hn', sh).value.trim(); if (!n) return; h.name = n; h.em = em; if (isNew) S().habits.push(h); U.save(); close(); H.thud(); refresh(); };
      const del = $('#hd', sh); if (del) del.onclick = () => { S().habits = S().habits.filter(x => x.id !== h.id); U.save(); close(); refresh(); };
      later(() => $('#hn', sh).focus(), 350);
    });
  }

  /* ---------- ESPEJO ---------- */
  function renderEspejo() {
    const v = $('#v-espejo'), rv = S().reviews[today()] || {}, q = D.MIRROR[dayIndex() % D.MIRROR.length], jar = S().jar || [];
    const goals = (S().goals || []).filter(Boolean);
    v.innerHTML = `${topBar()}<div class="h1">El <em>espejo</em></div><div class="sub">No miente. Tú tampoco deberías.</div>
      <div class="mirror" style="margin-top:14px">
        ${goals.map((g, k) => `<span class="note" style="--rot:${[-1.5, 1, -.5][k % 3]}deg"><small>Objetivo ${k + 1}</small>${esc(g)}</span>`).join('')}
        ${S().why ? `<span class="note w" style="--rot:1.2deg"><small>Por qué</small>${esc(S().why)}</span>` : ''}
        ${S().excuse ? `<span class="note red" style="--rot:-1deg"><small>Excusa · muerta</small><s>${esc(S().excuse)}</s></span>` : ''}
        ${S().doubter ? `<span class="note w" style="--rot:.6deg"><small>Le vas a callar la boca a</small>${esc(S().doubter)}</span>` : ''}
        <button class="btn ghost sm" id="edg" style="margin-top:12px">Editar notas</button>
      </div>
      <div class="sec"><span>La verdad de hoy</span></div>
      <div class="card">
        <label class="lbl" style="color:var(--red)">${esc(q)}</label><textarea class="ta" data-k="q" placeholder="Sin adornos.">${esc(rv.q || '')}</textarea>
        <label class="lbl">¿Dónde has fallado hoy?</label><textarea class="ta" data-k="b" placeholder="Con honestidad.">${esc(rv.b || '')}</textarea>
        <label class="lbl">¿Qué harás mañana sin negociar?</label><textarea class="ta" data-k="c" placeholder="Una cosa concreta.">${esc(rv.c || '')}</textarea>
        <button class="btn w ${rv.done ? 'ok' : 'red'}" id="rvb">${rv.done ? '✓ Verdad guardada' : 'Cerrar el día · +20 ⚡'}</button>
      </div>
      <div class="sec"><span>Frasco de victorias</span><button id="addj">+ VICTORIA</button></div>
      <div class="card" style="text-align:center">
        <div class="jar"><svg viewBox="0 0 150 180"><rect x="40" y="6" width="70" height="16" rx="3" fill="#2a2a2a" stroke="#444"/><path d="M34 26 h82 v8 c12 6 18 18 18 34 v86 c0 12 -8 20 -20 20 h-78 c-12 0 -20 -8 -20 -20 v-86 c0 -16 6 -28 18 -34 z" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.3)" stroke-width="2"/>${jar.slice(-24).map((_, k) => `<circle cx="${36 + (k % 6) * 15.5}" cy="${162 - Math.floor(k / 6) * 14}" r="6.5" fill="${['#FFD60A', '#FF2A1F', '#f5f3ef', '#ff7a1f'][k % 4]}"/>`).join('')}<path d="M44 40 v100" stroke="rgba(255,255,255,.18)" stroke-width="5" stroke-linecap="round"/></svg><div class="cnt">${jar.length}</div></div>
        <div class="sub" style="margin-top:0">Cada cosa difícil que superas va aquí. Cuando quieras rendirte, ábrelo.</div>
        <button class="btn ghost w" id="openj" ${jar.length ? '' : 'disabled style="opacity:.4"'}>Abrir el frasco</button>
      </div>
      <div id="jl">${jar.slice().reverse().slice(0, 6).map(j => `<div class="jitem">${esc(j.t)}<small>${esc(j.d)}</small></div>`).join('')}</div>`;
    wireTop(v);
    $$('.ta', v).forEach(t => t.oninput = () => { const r = S().reviews[today()] = S().reviews[today()] || {}; r[t.dataset.k] = t.value; U.save(); });
    $('#rvb', v).onclick = e => {
      const r = S().reviews[today()] = S().reviews[today()] || {};
      if (!(r.q || r.b || r.c)) { toast('Vacío', 'Escribe al menos una verdad.', '🪞'); H.thud(); return; }
      if (!r.done) { r.done = 1; xp(20); }
      U.save(); e.target.className = 'btn w ok'; e.target.textContent = '✓ Verdad guardada'; H.success(); burst(30);
    };
    $('#addj', v).onclick = () => sheet(`<h3>Nueva victoria</h3><p class="p">Algo difícil que hayas superado. Hoy o hace años.</p><textarea class="ta" id="jt" maxlength="160" style="min-height:90px" placeholder="Ej.: Entrené con fiebre y no lo dejé."></textarea><button class="cta" id="js" style="margin-top:12px">Al frasco · +10 ⚡</button>`, (sh, close) => {
      $('#js', sh).onclick = () => { const t = $('#jt', sh).value.trim(); if (t.length < 3) return; S().jar = (S().jar || []).concat([{ t, d: today() }]); xp(10); U.save(); close(); H.success(); tone(880, .15); refresh(); };
      later(() => $('#jt', sh).focus(), 350);
    });
    $('#openj', v).onclick = () => { const j = pick(S().jar || []); if (!j) return; H.thud(); sheet(`<div class="kick" style="margin:0">Del frasco · ${esc(j.d)}</div><h3 style="font-size:36px">${esc(j.t)}</h3><p class="p">Si pudiste con eso, puedes con lo de hoy.</p><button class="cta" style="margin-top:16px" onclick="this.closest('.sheet').previousElementSibling.click()">Vuelvo a la guerra</button>`); };
    $('#edg', v).onclick = () => sheet(`<h3>Tus notas</h3>${[0, 1, 2].map(k => `<input class="field l" data-k="${k}" style="margin-top:8px" maxlength="70" placeholder="Objetivo ${k + 1}" value="${esc((S().goals || [])[k] || '')}">`).join('')}<textarea class="ta" id="ew" maxlength="240" placeholder="Por qué">${esc(S().why)}</textarea><input class="field l" id="ed" style="margin-top:8px" maxlength="40" placeholder="Quién dudó de ti" value="${esc(S().doubter)}"><button class="cta" id="es" style="margin-top:14px">Guardar</button>`, (sh, close) => {
      $('#es', sh).onclick = () => { S().goals = $$('input[data-k]', sh).map(x => x.value.trim()); S().why = $('#ew', sh).value.trim(); S().doubter = $('#ed', sh).value.trim(); U.save(); close(); refresh(); };
    });
  }

  /* ---------- FOCO + 40 % ---------- */
  const F = { len: 25, left: 25 * 60, run: false, iv: null, m: null, extra: 0 };
  function renderFoco() {
    const v = $('#v-foco'), R = 120, L = 2 * Math.PI * R;
    let ticks = ''; for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2, r1 = k % 5 ? 131 : 126; ticks += `<line x1="${136 + Math.cos(a) * r1}" y1="${136 + Math.sin(a) * r1}" x2="${136 + Math.cos(a) * 136}" y2="${136 + Math.sin(a) * 136}"/>`; }
    v.innerHTML = `${topBar()}<div class="h1">Foco</div><div class="sub">Móvil boca abajo. Si quieres parar antes, TANK no te deja tan fácil.</div>
      <div class="focus-wrap">
        <div class="timer"><svg class="t" viewBox="0 0 272 272"><g class="ticks">${ticks}</g><circle class="bgc" cx="136" cy="136" r="${R}"/><circle class="fg" id="tfg" cx="136" cy="136" r="${R}" style="stroke-dasharray:${L}"/></svg>
          <div class="mid"><div id="fm"></div><div class="clock" id="clk"></div></div></div>
        <div class="seg" id="seg">${[15, 25, 50].map(n => `<button data-n="${n}" class="${n === F.len ? 'on' : ''}">${n} MIN</button>`).join('')}</div>
        <div class="row" style="margin-top:14px;justify-content:center"><button class="btn red" id="fs" style="min-width:160px"></button><button class="btn ghost" id="fr">Parar</button></div>
        <div class="stats" style="width:100%;margin-top:20px"><div class="stat"><b>${S().focusN || 0}</b><span>SESIONES</span></div><div class="stat"><b>${Math.round((S().focusMin || 0) / 60 * 10) / 10}</b><span>HORAS</span></div><div class="stat"><b>${S().push40 || 0}</b><span>VECES +40 %</span></div></div>
      </div>
      <div class="sec"><span>La regla del 40 %</span></div>
      <div class="card"><div class="sub" style="margin:0">Cuando pulses «Parar» antes de tiempo, te pediremos 5 minutos más. Si aguantas, ganas +40 ⚡. Ahí se hace el callo.</div></div>
      ${ad('foco')}`;
    wireTop(v);
    F.m = Mascot.mount($('#fm', v), { size: 92, mood: F.run ? 'focus' : 'calm', onTap: m => m.jump().say(F.run ? 'Silencio. Trabaja.' : '¿Empezamos o qué?') });
    const draw = () => { const k = F.left / (F.len * 60); const fg = $('#tfg'); if (!fg) return; fg.style.strokeDashoffset = L * (1 - Math.min(1, k)); $('#clk').textContent = String(Math.floor(F.left / 60)).padStart(2, '0') + ':' + String(F.left % 60).padStart(2, '0'); $('#fs').textContent = F.run ? 'Pausa' : (F.left < F.len * 60 ? 'Seguir' : 'Empezar'); };
    F.draw = draw; draw();
    $$('#seg button', v).forEach(b => b.onclick = () => { if (F.run) return; F.len = +b.dataset.n; F.left = F.len * 60; $$('#seg button').forEach(x => x.classList.toggle('on', x === b)); H.tick(); draw(); });
    $('#fs', v).onclick = () => { F.run ? pause() : startF(); };
    $('#fr', v).onclick = () => { if (F.run && F.left > 0 && F.left < F.len * 60 - 30) forty(); else { pause(); F.left = F.len * 60; draw(); } };
  }
  function startF() {
    F.run = true; H.thud(); tone(140, .15, .06); F.m && F.m.mood('focus').say('A muerte.', 1500);
    clearInterval(F.iv);
    F.iv = setInterval(() => {
      F.left--; F.draw && F.draw();
      if (F.left <= 0) {
        clearInterval(F.iv); F.run = false; S().focusN = (S().focusN || 0) + 1; S().focusMin = (S().focusMin || 0) + F.len; xp(25); U.save();
        H.success(); burst(60); tone(440, .2); later(() => tone(660, .3), 200);
        toast('Sesión completada', `${F.len} minutos de foco. +25 ⚡`, '⏱️');
        F.left = F.len * 60; if (curTab === 'foco') renderFoco(); F.m && F.m.mood('cool').jump().say('Eso es trabajo de verdad.');
      }
    }, 1000);
    F.draw && F.draw();
  }
  function pause() { F.run = false; clearInterval(F.iv); F.draw && F.draw(); F.m && F.m.mood('calm'); }
  function forty() {
    pause();
    if (!isPro() && S().last40 === today()) { paywall('El modo 40 % ilimitado es PRO'); return; }
    const el = document.createElement('div'); el.className = 'forty';
    el.innerHTML = `<div class="kick">Alto</div><div class="big" style="font-size:40px">¿Ya?<br>Vas por el <em>40&nbsp;%</em>.</div><div class="hero" id="fx" style="margin-top:16px">05:00</div><p class="p">Cinco minutos más. Solo cinco. Aquí es donde te haces duro.</p><div id="fmc" style="margin-top:10px"></div><div class="foot"><button class="cta" id="fy">Aguanto</button><button class="cta ghost" id="fn">Me rindo</button></div>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    H.thud(); tone(90, .4, .08);
    const m = Mascot.mount($('#fmc', el), { size: 110, mood: 'angry' });
    let left = 300, iv;
    const close = () => { clearInterval(iv); el.classList.remove('on'); later(() => el.remove(), 350); };
    $('#fy', el).onclick = () => {
      S().last40 = today(); U.save();
      $('#fy', el).disabled = true; $('#fy', el).textContent = 'Aguantando…'; m.mood('focus'); H.thud();
      iv = setInterval(() => { left--; $('#fx', el).textContent = '0' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'); if (left <= 0) { clearInterval(iv); S().push40 = (S().push40 || 0) + 1; xp(40); U.save(); m.mood('cool').jump(); burst(80); H.success(); toast('+40 %', 'Has ido más allá. +40 ⚡', '💥'); later(() => { close(); F.left = F.len * 60; if (curTab === 'foco') renderFoco(); }, 1600); } }, 1000);
    };
    $('#fn', el).onclick = () => { m.mood('sad').say('Lo apunto.'); later(() => { close(); F.left = F.len * 60; F.draw && F.draw(); }, 900); };
  }

  /* ---------- ARSENAL ---------- */
  function renderArsenal() {
    const v = $('#v-arsenal'), vids = C.VIDEOS || [];
    v.innerHTML = `${topBar()}<div class="h1">Arsenal</div><div class="sub">Vídeos, lecciones y retos para endurecer la mente.</div>
      <div class="sec"><span>Vídeos</span></div>
      <div class="feed">${vids.map((x, k) => `<button class="vid${x.src || x.youtube ? '' : ' soon'}" data-k="${k}">${x.poster ? `<img src="${esc(x.poster)}" alt="">` : `<span class="glyph">${String(k + 1).padStart(2, '0')}</span>`}${x.pro && !isPro() ? '<span class="lock">PRO</span>' : ''}<span class="play"></span><span class="tg">${esc(x.tag || '')}</span><b>${esc(x.title)}</b><small>${x.src || x.youtube ? esc(x.dur || '') : 'PRÓXIMAMENTE'}</small></button>`).join('')}</div>
      <div class="sec"><span>Lecciones de 1 minuto</span></div>
      <div>${D.LESSONS.map((l, k) => `<button class="lesson${S().lessons[k] ? ' done' : ''}" data-k="${k}"><div class="n">${S().lessons[k] ? '✓' : k + 1}</div><div style="flex:1"><b>${esc(l.t)}</b><div class="sub" style="margin:2px 0 0">${S().lessons[k] ? 'Leída' : '1 min · +10 ⚡'}</div></div></button>`).join('')}</div>
      ${ad('guerra')}
      <div class="sec"><span>Todos los retos</span></div>
      ${D.CHALLENGES.map((c, k) => `<div class="card" style="display:flex;gap:12px;align-items:center;padding:12px 14px"><div style="font-family:var(--disp);font-size:24px;color:var(--red);width:34px">${String(k + 1).padStart(2, '0')}</div><div><b>${esc(c[0])}</b><div class="sub" style="margin:2px 0 0">${esc(c[1])}</div></div></div>`).join('')}`;
    wireTop(v);
    $$('.vid', v).forEach(b => b.onclick = () => openVideo(vids[+b.dataset.k]));
    $$('.lesson', v).forEach(b => b.onclick = () => openLesson(+b.dataset.k));
  }
  function openVideo(x) {
    if (x.pro && !isPro()) { paywall('Este vídeo es PRO'); return; }
    if (!x.src && !x.youtube) { toast('Próximamente', `«${x.title}» llega pronto.`, '🎬'); return; }
    const media = x.youtube ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(x.youtube)}?autoplay=1&playsinline=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>` : `<video src="${esc(x.src)}" ${x.poster ? `poster="${esc(x.poster)}"` : ''} controls autoplay playsinline></video>`;
    sheet(`<div class="kick" style="margin:0">${esc(x.tag || '')}</div><h3>${esc(x.title)}</h3>${media}`, sh => { const vd = $('video', sh); if (vd) vd.onended = () => { xp(5); toast('Vídeo visto', '+5 ⚡', '🎬'); }; });
  }
  function openLesson(k) {
    const l = D.LESSONS[k];
    sheet(`<div class="kick" style="margin:0">Lección ${k + 1}</div><h3>${esc(l.t)}</h3><p class="p" style="font-size:18px;line-height:1.5;color:var(--ink);max-width:none">${esc(l.b)}</p><button class="cta" id="ld" style="margin-top:20px">Entendido</button>`, (sh, close) => {
      $('#ld', sh).onclick = () => { if (!S().lessons[k]) { S().lessons[k] = 1; xp(10); U.save(); burst(26); H.success(); } close(); if (curTab === 'arsenal') renderArsenal(); };
    });
  }

  /* ---------- RANKING ---------- */
  async function renderRank() {
    const v = $('#v-rank');
    v.innerHTML = `${topBar()}<div class="h1">Ranking</div><div class="sub">Los que no negocian. Ordenados por racha.</div><div class="card" style="margin-top:14px;padding:6px" id="lbx"><div class="sub" style="padding:14px;text-align:center"><span class="spin"></span></div></div>
      <div class="card" style="margin-top:10px;display:flex;gap:12px;align-items:center"><div style="font-size:24px">📈</div><div class="sub" style="margin:0">Cada día que cumples sube tu racha. Si fallas dos seguidos, vuelves a cero y bajas en la tabla.</div></div>`;
    wireTop(v);
    await Cloud.push();
    let rows = await Cloud.leaderboard(), demo = false;
    if (rows === null) { demo = true; const me = { username: S().username || 'tú', streak: streak(), xp: S().xp || 0 }; rows = [{ username: 'ejemplo_1', streak: 41, xp: 2380 }, { username: 'ejemplo_2', streak: 27, xp: 1610 }, { username: 'ejemplo_3', streak: 12, xp: 790 }, { username: 'ejemplo_4', streak: 5, xp: 260 }, me].sort((a, b) => b.streak - a.streak || b.xp - a.xp); }
    const box = $('#lbx'); if (!box) return;
    if (demo) box.insertAdjacentHTML('beforebegin', '<div class="sub" style="font-family:var(--mono);font-size:11px;letter-spacing:.1em;margin-top:10px">VISTA PREVIA · LOS DEMÁS SON DE EJEMPLO HASTA ACTIVAR LAS CUENTAS</div>');
    if (!rows.length) { box.innerHTML = '<div class="sub" style="padding:14px;text-align:center">Aún no hay nadie. Sé el primero.</div>'; return; }
    box.innerHTML = rows.map((r, k) => `<div class="lb${r.username === S().username ? ' me' : ''}"><span class="pos">${k + 1}</span><b>@${esc(r.username)}</b><span class="s">🔥 ${r.streak} · ⚡ ${r.xp}</span></div>`).join('');
  }

  /* ---------- PERFIL ---------- */
  function renderTu() {
    const v = $('#v-tu'), st = streak(), rk = rankFor(st), lived = Math.floor((S().age || 18) * 52.18);
    const cells = []; for (let k = 34; k >= 0; k--) { const d = addDays(today(), -k); const a = doneOn(d).length / (S().habits.length || 1); cells.push(`<i style="display:block;aspect-ratio:1;background:${a ? `rgba(255,42,31,${(.2 + a * .8).toFixed(2)})` : 'rgba(255,255,255,.06)'};${k === 0 ? 'outline:1px solid #fff;' : ''}"></i>`); }
    v.innerHTML = `${topBar()}
      <div style="display:flex;align-items:center;gap:12px"><div id="tm"></div><div><div class="h1">${esc(S().name || '')}</div><div class="sub" style="font-family:var(--mono);font-size:12px">@${esc(S().username || '')} · ${rk.r[1]} ${rk.r[2].toUpperCase()}</div></div></div>
      <div class="stats"><div class="stat"><b>${st}</b><span>RACHA</span></div><div class="stat"><b>${Math.max(st, S().bestStreak || 0)}</b><span>MEJOR</span></div><div class="stat"><b>${S().xp || 0}</b><span>⚡ TOTAL</span></div></div>
      <div class="sec"><span>Plan</span></div>
      <div class="card" style="display:flex;align-items:center;gap:12px"><div style="flex:1"><b style="font-family:var(--disp);font-size:22px;font-weight:400">${isPro() ? 'PRO' + (S().plan !== 'pro' ? ' (demo)' : '') : 'GRATIS'}</b><div class="sub" style="margin:2px 0 0">${isPro() ? 'Todo desbloqueado. Sin anuncios.' : `Máx. ${C.FREE_LIMITS.habits} misiones, anuncios y vídeos bloqueados.`}</div></div>${isPro() ? '' : '<button class="btn red sm" data-pro>Mejorar</button>'}</div>
      <div class="sec"><span>Últimos 35 días</span></div>
      <div class="card"><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px">${cells.join('')}</div></div>
      <div class="sec"><span>Rangos</span>${rk.nx ? `<span style="letter-spacing:0;text-transform:none;color:var(--mut)">${rk.nx[0] - st} días para ${rk.nx[2]}</span>` : ''}</div>
      <div class="card ladder">${D.RANKS.map((r, k) => `<div class="lad ${k === rk.idx ? 'on' : k < rk.idx ? 'past' : ''}"><span style="font-size:22px">${r[1]}</span><b>${r[2]}</b><small>${r[0]} d</small></div>`).join('')}</div>
      <div class="sec"><span>Tu contrato</span></div>
      <div class="card"><div class="sub" style="margin:0">Firmado el ${S().signedAt ? new Date(S().signedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}.</div>${S().signature ? `<div class="sigshow"><img src="${S().signature}" alt="Tu firma"></div>` : ''}</div>
      <div class="sec"><span>Tu vida en semanas</span></div>
      <div class="card"><div class="sub" style="margin:0 0 6px">80 años. Las rojas ya se fueron. La blanca es esta.</div><canvas id="mm"></canvas><div class="sub" style="margin-top:8px;font-family:var(--mono);font-size:12px">${lived.toLocaleString('es-ES')} vividas · ${Math.max(0, 4174 - lived).toLocaleString('es-ES')} por delante</div></div>
      <div class="sec"><span>Cuenta</span></div>
      <div class="card">
        <div class="sub" style="margin:0 0 4px">${Cloud.AUTH ? esc(S().email || (Cloud.user && Cloud.user.email) || '') : 'Prototipo sin cuenta: tus datos se guardan en este móvil.'}</div>
        <button class="btn ghost w" id="noti">🔔 Activar avisos</button>
        ${Cloud.AUTH ? '<button class="btn ghost w" id="out">Cerrar sesión</button>' : ''}
      </div>
      <p class="sub" style="text-align:center;margin-top:20px;font-family:var(--mono);font-size:11px">HARDMODE · prototipo${Cloud.MOCK ? ' · modo local' : ''}</p>`;
    wireTop(v);
    Mascot.mount($('#tm', v), { size: 84, mood: st >= 7 ? 'cool' : 'calm', onTap: m => m.jump().say(pick(D.TANK.tap)) });
    drawMM(lived);
    $('#noti', v).onclick = async () => {
      if (!('Notification' in window)) { toast('No disponible', 'En iPhone, añade la app a la pantalla de inicio primero.', '🔔'); return; }
      const p = await Notification.requestPermission();
      if (p === 'granted') { try { new Notification('HARDMODE', { body: 'TANK: la disciplina no se negocia. Abre la app.' }); } catch (e) { } toast('Avisos activados', 'TANK te va a perseguir.', '🔔'); }
      else toast('Sin permiso', 'Actívalos en los ajustes del navegador.', '🔔');
    };
    if ($('#out', v)) $('#out', v).onclick = () => sheet(`<h3>¿Cerrar sesión?</h3><p class="p">Tu progreso se queda guardado en tu cuenta.</p><button class="cta" id="y" style="margin-top:16px">Cerrar sesión</button>`, sh => { $('#y', sh).onclick = async () => { await Cloud.push(); Cloud.signOut(); }; });
  }
  function drawMM(lived) {
    const c = $('#mm'); if (!c) return;
    const cols = 52, rows = 80, w = c.clientWidth || 340, cell = w / cols, dpr = devicePixelRatio || 1;
    c.width = w * dpr; c.height = rows * cell * dpr; c.style.height = rows * cell + 'px';
    const x = c.getContext('2d'); x.scale(dpr, dpr);
    let n = 0; const total = cols * rows;
    (function draw() {
      const end = Math.min(total, n + 300);
      for (; n < end; n++) { const r = Math.floor(n / cols), k = n % cols; x.fillStyle = n < lived ? '#FF2A1F' : n === lived ? '#ffffff' : 'rgba(255,255,255,.1)'; x.fillRect(k * cell + cell * .18, r * cell + cell * .18, cell * .64, cell * .64); }
      if (n < total) requestAnimationFrame(draw);
    })();
  }

  /* ---------- Arranque ---------- */
  async function boot() {
    const app = $('#app');
    if (!Cloud.AUTH) { if (/[?&]reset=1/.test(location.search)) { try { localStorage.removeItem(U.KEY); } catch (e) { } U.S = Object.assign({}, U.DEF); history.replaceState(null, '', location.pathname); } if (S().onboarded) start(); else Onboarding.start(app, start); return; }
    let user = null;
    try { user = await Cloud.init(); } catch (e) { console.warn(e); }
    if (user) {
      try { await Cloud.load(); } catch (e) { console.warn(e); }
      if (S().onboarded) { start(); return; }
      Onboarding.start(app, start, 'name');
      return;
    }
    Onboarding.start(app, start);
  }
  window.HM = { start, go, paywall };
  document.addEventListener('DOMContentLoaded', boot);
})();
