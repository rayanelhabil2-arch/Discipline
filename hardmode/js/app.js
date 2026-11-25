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
  const AX = C.ADSTERRA || {};
  // Consentimiento de cookies: los anuncios solo se cargan si la persona acepta
  const CK = 'hm.consent';
  const consent = () => { try { return localStorage.getItem(CK) || ''; } catch (e) { return ''; } };
  const setConsent = v => { try { localStorage.setItem(CK, v); } catch (e) { } };
  const axOn = () => !!AX.enabled && !isPro() && consent() === 'yes';
  function consentBar() {
    if (!AX.enabled || isPro() || consent() || $('#ck')) return;
    const el = document.createElement('div'); el.id = 'ck'; el.className = 'cookie'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Cookies y anuncios');
    el.innerHTML = `<b>Cookies y anuncios</b><p>HARDMODE gratis se paga con anuncios de Adsterra, que usan cookies y datos técnicos de tu dispositivo. ¿Los aceptas? Puedes cambiarlo cuando quieras en Perfil. <a href="legal.html#privacidad" target="_blank" rel="noopener">Más info</a></p><div class="cookie-b"><button class="btn ghost" id="ckno">Rechazar</button><button class="btn red" id="ckyes">Aceptar</button></div>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    const done = v => { setConsent(v); H.tick(); el.classList.remove('on'); setTimeout(() => el.remove(), 400); if (v === 'yes') placeAds(); };
    $('#ckyes', el).onclick = () => done('yes');
    $('#ckno', el).onclick = () => done('no');
  }
  // Native Banner de Adsterra: un único contenedor que se mueve a la pestaña abierta (Hoy o Arsenal)
  let axNode = null, axSocial = false;
  function axScript(src, opts) {
    const s = document.createElement('script'); s.src = src; s.setAttribute('data-cfasync', 'false');
    if (opts && opts.async) { s.async = true; s.setAttribute('fetchpriority', 'high'); }
    return s;
  }
  function placeAds() {
    if (!axOn()) { if (axNode) axNode.remove(); axNode = null; consentBar(); return; }
    if (AX.social && !axSocial) { axSocial = true; document.body.appendChild(axScript(AX.social)); }
    const n = AX.native; if (!n) return;
    const anchor = $('.view.on .ax-anchor');
    if (!axNode) {
      axNode = document.createElement('div'); axNode.className = 'ad ax';
      axNode.innerHTML = '<div class="tag">Publicidad</div>';
      const c = document.createElement('div'); c.id = n.id; axNode.appendChild(c);
      const node = axNode; new MutationObserver(() => node.classList.toggle('filled', c.childElementCount > 0)).observe(c, { childList: true, subtree: true });
      (anchor || document.body).appendChild(axNode);
      axNode.insertBefore(axScript(n.src, { async: true }), c);
      if (!anchor) axNode.style.display = 'none';
    } else if (anchor) { axNode.style.display = ''; anchor.appendChild(axNode); }
  }
  function parkAds() { if (axNode && axNode.isConnected && axNode.parentNode !== document.body) { axNode.style.display = 'none'; document.body.appendChild(axNode); } }

  function ad(slot) {
    if (isPro()) return '';
    if (AX.enabled && AX.native) return (AX.native.slots || []).includes(slot) ? '<div class="ax-anchor"></div>' : '';
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
      <button class="cta" id="pg" style="margin-top:14px">Desbloquear</button>
      <p class="src" style="text-align:center">Cancela cuando quieras. <a href="legal.html" target="_blank" rel="noopener">Privacidad</a> · <a href="legal.html#condiciones" target="_blank" rel="noopener">Condiciones</a></p>`, (sh, close) => {
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
  ICONS.diario = '<svg viewBox="0 0 24 24"><path d="M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z"/><path d="M6 3v18"/><path d="M10 8h5M10 12h5"/></svg>';
  ICONS.mas = '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></svg>';
  const TABS = [['hoy', 'Hoy'], ['diario', 'Diario'], ['foco', 'Foco'], ['rank', 'Ranking'], ['mas', 'Menú']];
  // Secciones a las que se llega desde el menú (la pestaña «Menú» queda marcada)
  const SUBS = ['espejo', 'arsenal', 'metas', 'estudios', 'tu'];
  const VIEWS = TABS.map(t => t[0]).concat(SUBS);

  function start() {
    const app = $('#app');
    app.innerHTML = `<div class="main scr" id="main">${VIEWS.map(t => `<section class="view" id="v-${t}"></section>`).join('')}</div>`;
    let nav = $('nav.tabs'); if (!nav) { nav = document.createElement('nav'); nav.className = 'tabs'; document.body.appendChild(nav); }
    nav.innerHTML = TABS.map(t => `<button data-t="${t[0]}">${ICONS[t[0]]}${t[1]}</button>`).join('');
    $$('button', nav).forEach(b => b.onclick = () => { H.tick(); go(b.dataset.t); });
    const want = new URLSearchParams(location.search).get('go');
    go(VIEWS.includes(want) ? want : 'hoy');
    if (!started) { started = true; U.startReminders(); }
  }
  let started = false;
  function go(t) {
    curTab = t;
    const navT = SUBS.includes(t) ? 'mas' : t;
    $$('nav.tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === navT));
    parkAds();
    $$('.view').forEach(v => { const on = v.id === 'v-' + t; v.classList.toggle('on', on); if (!on) v.innerHTML = ''; });
    ({ hoy: renderHoy, espejo: renderEspejo, foco: renderFoco, diario: () => Diario.render($('#v-diario'), { topBar, wireTop, xp }), arsenal: renderArsenal, rank: renderRank, tu: renderTu, mas: () => Mas.renderMenu($('#v-mas'), mctx), metas: () => Mas.renderMetas($('#v-metas'), mctx), estudios: () => Mas.renderEstudios($('#v-estudios'), mctx) })[t]();
    if (['espejo', 'arsenal', 'tu'].includes(t)) { const tp = $('#v-' + t + ' .top'); if (tp && !$('#v-' + t + ' .back-mas')) { tp.insertAdjacentHTML('afterend', '<button class="back-mas">‹ Menú</button>'); $('#v-' + t + ' .back-mas').onclick = () => { H.tick(); go('mas'); }; } }
    $('#main').scrollTop = 0;
    pushAds(); placeAds();
  }
  const refresh = () => go(curTab);
  const mctx = { get topBar() { return topBar; }, get wireTop() { return wireTop; }, get xp() { return xp; }, go: t => go(t) };
  const topBar = () => `<div class="top"><div class="mark">HARD<b>MODE</b></div><div class="row"><span class="pill fire" id="fire">🔥 ${streak()}</span><span class="pill" id="xp">⚡ ${S().xp || 0}</span>${isPro() ? '<span class="pill pro">PRO</span>' : ''}<button class="pill" id="me" aria-label="Perfil">👤</button></div></div>`;
  function wireTop(v) { const m = $('#me', v); if (m) m.onclick = () => { H.tick(); go('tu'); }; }

  /* ---------- HOY ---------- */
  function moodNow() {
    const p = pct(), h = hour();
    if (p === 100) return 'cool';
    if (failedYesterday() && p < 50) return 'calm';
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
      ${comebackCard()}
      <div class="hoy-hero">
        <div class="txt"><div class="sub" style="margin:0;font-family:var(--mono);font-size:11px;letter-spacing:.2em">${esc((S().name || '').toUpperCase())} · ${rk.r[1]} ${rk.r[2].toUpperCase()}</div>
        <div class="h1" style="font-size:clamp(40px,13vw,58px);margin-top:4px">DÍA <em>${dayN()}</em></div>
        <div class="prog"><i id="pg"></i></div><div class="sub" id="pgt" style="font-size:12.5px"></div></div>
        <div id="hm"></div>
      </div>
      <div class="stats">
        <div class="stat"><b id="sst">0</b><span>RACHA</span></div>
        <div class="stat"><b id="spc">0</b><span>HOY</span></div>
        <div class="stat"><b>${rk.nx ? rk.nx[0] - st : '∞'}</b><span>${rk.nx ? 'PARA ' + rk.nx[2].toUpperCase() : 'LEYENDA'}</span></div>
      </div>
      <div class="sec"><span>Prioridad de hoy</span></div>
      <div id="prio"></div>
      <div class="sec"><span>Misiones de hoy</span><button id="addh">+ AÑADIR</button></div>
      <div id="hlist"></div>
      ${(S().track || []).some(k => k === 'train' || k === 'work') ? `<div class="quick">${(S().track || []).includes('train') ? '<button class="card qk" data-q="train"><span>🏋️</span><b>Subir entreno</b></button>' : ''}${(S().track || []).includes('work') ? `<button class="card qk" data-q="work"><span>💼</span><b>${S().clockIn ? 'Fichado · salir' : 'Fichar jornada'}</b></button>` : ''}</div>` : ''}
      <div class="sec"><span>Tu semana</span></div>
      <div id="wk7"></div>
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
    tank = Mascot.mount($('#hm', v), { size: 132, mood: moodNow(), onTap: m => { H.tick(); m.roar().say(pick(D.TANK.tap)); } });
    later(() => tank.say(tankLine(), 3600), 700);
    count($('#sst', v), st, { dur: 800 });
    drawHabits(); updProg(true); drawPrio(); drawWeek();
    $('#addh', v).onclick = () => editHabit();
    $$('.qk', v).forEach(b => b.onclick = () => { Diario.seg = b.dataset.q; go('diario'); });
    const cb = $('#cbgo', v); if (cb) cb.onclick = () => { const r = $(`.hab[data-id="${cb.dataset.id}"]`, v); if (r && !r.classList.contains('done')) toggle(r); const c = $('#cb', v); if (c) c.style.display = 'none'; };
    $('#flip', v).onclick = e => { const f = e.currentTarget; if (!f.classList.contains('on')) { f.classList.add('on'); H.thud(); tone(110, .2, .06); if (S().codeSeen !== today()) { S().codeSeen = today(); xp(5); } tank.mood('alert'); later(() => tank.mood(moodNow()), 2200); } else f.classList.remove('on'); };
    $('#reto', v).onclick = e => { if (S().retos[today()]) return; S().retos[today()] = 1; xp(15); U.save(); e.target.className = 'btn w ok'; e.target.textContent = '✓ Reto cumplido · +15 ⚡'; H.success(); burst(36); tank.mood('cool').jump().say('Eso es callo mental.'); later(() => tank.mood(moodNow()), 3000); };
    $('#toMirror', v).onclick = () => go('espejo');
  }

  // Volver tras faltar un día: sin bronca, con un primer paso pequeño
  function easiest() {
    const n = {}; for (let k = 1; k <= 14; k++) (S().log[addDays(today(), -k)] || []).forEach(id => n[id] = (n[id] || 0) + 1);
    const pend = S().habits.filter(h => !doneOn(today()).includes(h.id));
    return pend.sort((a, b) => (n[b.id] || 0) - (n[a.id] || 0))[0];
  }
  function comebackCard() {
    if (!S().habits.length || !failedYesterday() || pct() >= 100) return '';
    const st = streak(), best = Math.max(S().bestStreak || 0, st), e = easiest();
    const msg = st > 0 ? 'Tu racha sigue viva: un día suelto se perdona. Solo cuenta lo que haces hoy.'
      : best > 0 ? `La racha se ha reiniciado, pero tu mejor marca, ${best} ${best === 1 ? 'día' : 'días'}, sigue siendo tuya. Hoy empieza la siguiente.`
      : 'No pasa nada. No hace falta compensar: basta con volver.';
    return `<div class="card comeback" id="cb"><div class="kick g" style="margin:0 0 6px">Retomar</div><b>Ayer no salió. Hoy vuelves.</b><p>${msg}</p>${e ? `<button class="btn w green" id="cbgo" data-id="${esc(e.id)}">Empieza por lo fácil: ${esc(e.em || '')} ${esc(e.name)}</button>` : ''}</div>`;
  }
  // Prioridad del día: una sola cosa importante
  function drawPrio() {
    const el = $('#prio'); if (!el) return;
    const P = S().prio && S().prio.d === today() ? S().prio : null;
    if (!P) {
      el.innerHTML = `<div class="card prio"><div class="sub" style="margin:0 0 8px">Lo único que, si lo haces hoy, hace que el día valga la pena.</div><div class="prio-in"><input class="field l" id="pin" maxlength="80" placeholder="Ej.: Estudiar el tema 4 · 1 h"><button class="btn red" id="pset">Fijar</button></div></div>`;
      const i = $('#pin', el), set = () => { const t = i.value.trim(); if (!t) { i.focus(); return; } S().prio = { d: today(), t, done: false }; U.save(); H.tick(); drawPrio(); };
      $('#pset', el).onclick = set; i.onkeydown = e => { if (e.key === 'Enter') set(); };
      return;
    }
    el.innerHTML = `<div class="card prio${P.done ? ' ok' : ''}"><div class="prio-t">${P.done ? '✓ ' : '◆ '}${esc(P.t)}</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn ${P.done ? 'ok' : 'green'}" id="pdone" style="flex:1">${P.done ? '✓ Hecho · +15 ⚡' : 'Hecho · +15 ⚡'}</button>${P.done ? '' : '<button class="btn ghost" id="pedit">Cambiar</button>'}</div></div>`;
    $('#pdone', el).onclick = () => { if (P.done) return; P.done = true; U.save(); xp(15); H.success(); burst(30); if (tank) tank.mood('proud').jump().say('Lo importante, primero.'); drawPrio(); };
    const pe = $('#pedit', el); if (pe) pe.onclick = () => { S().prio = null; U.save(); drawPrio(); };
  }
  // Progreso de los últimos 7 días
  function drawWeek() {
    const el = $('#wk7'); if (!el) return;
    const L = ['D', 'L', 'M', 'X', 'J', 'V', 'S'], days = [];
    for (let k = 6; k >= 0; k--) { const d = addDays(today(), -k), [y, m, dd] = d.split('-').map(Number); days.push({ l: L[new Date(y, m - 1, dd).getDay()], p: S().habits.length ? doneOn(d).length / S().habits.length : 0, ok: dayOk(d), t: k === 0, pre: d < (S().created || today()) }); }
    const won = days.filter(x => x.ok).length;
    let prev = 0; for (let k = 13; k >= 7; k--) if (dayOk(addDays(today(), -k))) prev++;
    const n = need(), tot = S().habits.length;
    el.innerHTML = `<div class="card wk7"><div class="wk7-h"><b>${won}/7</b><span>días ganados${S().created && addDays(today(), -7) >= S().created ? ` · semana anterior: ${prev}/7` : ''}</span></div>
      <div class="wk7-b">${days.map(x => `<div class="${x.t ? 't' : ''}${x.pre ? ' pre' : ''}"><i style="height:${Math.round(6 + x.p * 94)}%" class="${x.ok ? 'ok' : ''}"></i><small>${x.l}</small></div>`).join('')}</div>
      <div class="sub" style="margin:8px 0 0;font-size:12px">${tot ? `Un día cuenta como ganado cuando completas ${n} de tus ${tot} misiones.` : 'Añade misiones para empezar a contar días.'}</div></div>`;
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
    updProg(); drawWeek();
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
      <div class="feed">${vids.map((x, k) => `<button class="vid${x.src || x.youtube || (D.REELS && D.REELS[x.id]) ? '' : ' soon'}" data-k="${k}">${x.poster ? `<img src="${esc(x.poster)}" alt="">` : `<span class="glyph">${String(k + 1).padStart(2, '0')}</span>`}${x.pro && !isPro() ? '<span class="lock">PRO</span>' : ''}<span class="play"></span><span class="tg">${esc(x.tag || '')}</span><b>${esc(x.title)}</b><small>${x.src || x.youtube ? esc(x.dur || '') : D.REELS && D.REELS[x.id] ? (S().reelsSeen && S().reelsSeen[x.id] ? '✓ VISTO' : 'VÍDEO CORTO · 40 S') : 'PRÓXIMAMENTE'}</small></button>`).join('')}</div>
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
    if (!x.src && !x.youtube) { if (D.REELS && D.REELS[x.id]) return playReel(x); toast('Próximamente', `«${x.title}» llega pronto.`, '🎬'); return; }
    const media = x.youtube ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(x.youtube)}?autoplay=1&playsinline=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>` : `<video src="${esc(x.src)}" ${x.poster ? `poster="${esc(x.poster)}"` : ''} controls autoplay playsinline></video>`;
    sheet(`<div class="kick" style="margin:0">${esc(x.tag || '')}</div><h3>${esc(x.title)}</h3>${media}`, sh => { const vd = $('video', sh); if (vd) vd.onended = () => { xp(5); toast('Vídeo visto', '+5 ⚡', '🎬'); }; });
  }
  // Reproductor de vídeos de texto: tarjetas a pantalla completa, toca para avanzar
  function playReel(x) {
    const L = D.REELS[x.id], el = document.createElement('div'); let i = 0, t = null, done = false;
    el.className = 'reel'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', x.title);
    el.innerHTML = `<div class="reel-bars">${L.map(() => '<i><b></b></i>').join('')}</div><button class="reel-x" aria-label="Cerrar">✕</button><div class="reel-tag">${esc(x.tag || '')} · ${esc(x.title)}</div><div class="reel-t" id="rt"></div><div class="reel-m" id="rm"></div><div class="reel-hint">Toca para avanzar</div>`;
    document.body.appendChild(el);
    const m = Mascot.mount($('#rm', el), { size: 110, mood: 'focus' });
    const close = () => { clearTimeout(t); el.remove(); };
    const show = k => {
      clearTimeout(t); i = k;
      if (i >= L.length) { if (!done) { done = true; S().reelsSeen = S().reelsSeen || {}; if (!S().reelsSeen[x.id]) { S().reelsSeen[x.id] = 1; xp(5); toast('Vídeo visto', ' +5 ⚡', '🎬'); } } close(); return; }
      $$('.reel-bars i', el).forEach((b, j) => { b.className = j < i ? 'full' : j === i ? 'run' : ''; });
      const rt = $('#rt', el); rt.classList.remove('in'); void rt.offsetWidth; rt.textContent = L[i]; rt.classList.add('in');
      if (i === L.length - 1) m.mood('angry').jump(); else if (i % 3 === 0) m.mood('alert');
      const dur = Math.max(2600, 900 + L[i].length * 55); $$('.reel-bars i b', el)[i].style.animationDuration = dur + 'ms';
      H.tick(); t = later(() => show(i + 1), dur);
    };
    el.addEventListener('click', e => { if (e.target.closest('.reel-x')) return close(); const r = el.getBoundingClientRect(); show(e.clientX < r.width * .3 ? Math.max(0, i - 1) : i + 1); });
    document.addEventListener('keydown', function k(e) { if (!el.isConnected) return document.removeEventListener('keydown', k); if (e.key === 'Escape') close(); if (e.key === 'ArrowRight' || e.key === ' ') show(i + 1); if (e.key === 'ArrowLeft') show(Math.max(0, i - 1)); });
    show(0);
  }
  function openLesson(k) {
    const l = D.LESSONS[k];
    sheet(`<div class="kick" style="margin:0">Lección ${k + 1}</div><h3>${esc(l.t)}</h3><p class="p" style="font-size:18px;line-height:1.5;color:var(--ink);max-width:none">${esc(l.b)}</p><button class="cta" id="ld" style="margin-top:20px">Entendido</button>`, (sh, close) => {
      $('#ld', sh).onclick = () => { if (!S().lessons[k]) { S().lessons[k] = 1; xp(10); U.save(); burst(26); H.success(); } close(); if (curTab === 'arsenal') renderArsenal(); };
    });
  }

  /* ---------- RANKING ---------- */
  let rankSort = 'streak', joinMode = 'up';
  async function renderRank() {
    const v = $('#v-rank'), me = window.Rank && Rank.me;
    v.innerHTML = `${topBar()}<div class="h1">Ranking</div><div class="sub">Los que no negocian. Compite con tus amigos por racha y puntos.</div>
      ${me ? '' : `<div class="card join"><b>${joinMode === 'up' ? 'Entra en el ranking' : 'Entra en tu cuenta'}</b><p>${joinMode === 'up' ? 'Crea tu cuenta con usuario y contraseña. En el ranking solo se ve tu @usuario, tu racha y tus puntos.' : 'Recupera tu progreso en este móvil.'}</p>
        <input class="field l" id="ru" maxlength="20" autocapitalize="off" autocomplete="username" placeholder="@usuario" value="${esc(Rank.clean(S().username || S().name || ''))}" style="margin:0">
        <input class="field l" id="rp" type="password" maxlength="72" autocomplete="${joinMode === 'up' ? 'new-password' : 'current-password'}" placeholder="Contraseña (mín. 6)" style="margin:8px 0 0">
        <button class="btn red w" id="rj">${joinMode === 'up' ? 'Crear cuenta y competir' : 'Entrar'}</button><div class="err" id="rer"></div>
        <button class="lnk2" id="rmode">${joinMode === 'up' ? '¿Ya tienes cuenta? Entra' : '¿No tienes cuenta? Créala'}</button></div>`}
      <div class="seg" id="rseg"><button data-k="streak" class="${rankSort === 'streak' ? 'on' : ''}">🔥 Racha</button><button data-k="xp" class="${rankSort === 'xp' ? 'on' : ''}">⚡ Puntos</button></div>
      <div class="card" style="margin-top:10px;padding:6px" id="lbx"><div class="sub" style="padding:14px;text-align:center"><span class="spin"></span></div></div>
      ${me ? `<div class="sub" style="text-align:center;font-size:12px;margin-top:10px">Compites como <b>@${esc(me.username)}</b>. Comparte la app para que tus amigos entren.</div><button class="btn ghost w" id="rshare">Invitar a un amigo</button>` : ''}
      <div class="card" style="margin-top:10px;display:flex;gap:12px;align-items:center"><div style="font-size:24px">📈</div><div class="sub" style="margin:0">Cada día ganado sube tu racha. Un día suelto se perdona; dos seguidos la reinician. Los puntos salen de misiones, retos, foco y el Espejo.</div></div>`;
    wireTop(v);
    $$('#rseg button', v).forEach(b => b.onclick = () => { rankSort = b.dataset.k; H.tick(); renderRank(); });
    const rj = $('#rj', v);
    if (rj) {
      const ru = $('#ru', v), rp = $('#rp', v), lab = rj.textContent;
      ru.oninput = () => { const c = Rank.clean(ru.value); if (c !== ru.value) ru.value = c; };
      $('#rmode', v).onclick = () => { joinMode = joinMode === 'up' ? 'in' : 'up'; H.tick(); renderRank(); };
      const go2 = async () => { rj.disabled = true; rj.innerHTML = '<span class="spin"></span>'; const r = joinMode === 'up' ? await Rank.register(ru.value, rp.value) : await Rank.login(ru.value, rp.value); rj.disabled = false; rj.textContent = lab; if (r.error) { $('#rer', v).textContent = r.error; H.thud(); return; } H.success(); burst(40); toast(joinMode === 'up' ? 'Estás dentro' : 'Has entrado', joinMode === 'up' ? ' Ya compites en el ranking.' : ' Progreso recuperado.', '🏆'); if (joinMode === 'in') { start(); go('rank'); } else renderRank(); };
      rj.onclick = go2; rp.onkeydown = e => { if (e.key === 'Enter') go2(); };
    }
    const sh = $('#rshare', v); if (sh) sh.onclick = async () => { const d = { title: 'HARDMODE', text: `Te reto en HARDMODE. Búscame en el ranking: @${me.username}`, url: location.origin + location.pathname }; try { if (navigator.share) await navigator.share(d); else { await navigator.clipboard.writeText(d.text + ' ' + d.url); toast('Enlace copiado', ' Pégalo en un chat.', '🔗'); } } catch (e) { } };
    if (me) await Rank.push();
    let rows = await Rank.top(100);
    const box = $('#lbx'); if (!box || curTab !== 'rank') return;
    if (rows === null) { box.innerHTML = '<div class="sub" style="padding:14px;text-align:center">No se ha podido cargar el ranking. Revisa la conexión.</div>'; return; }
    rows = rows.slice().sort(rankSort === 'xp' ? (a, b) => b.xp - a.xp || b.streak - a.streak : (a, b) => b.streak - a.streak || b.xp - a.xp);
    if (!rows.length) { box.innerHTML = '<div class="sub" style="padding:14px;text-align:center">Aún no hay nadie. Sé el primero.</div>'; return; }
    const mine = me ? me.username : null;
    box.innerHTML = rows.slice(0, 50).map((r, k) => `<div class="lb${r.username === mine ? ' me' : ''}"><span class="pos">${k < 3 ? ['🥇', '🥈', '🥉'][k] : k + 1}</span><b>@${esc(r.username)}</b><span class="s">🔥 ${r.streak} · ⚡ ${r.xp}</span></div>`).join('');
    const pos = mine ? rows.findIndex(r => r.username === mine) : -1;
    if (pos >= 50) box.insertAdjacentHTML('beforeend', `<div class="lb me"><span class="pos">${pos + 1}</span><b>@${esc(mine)}</b><span class="s">🔥 ${rows[pos].streak} · ⚡ ${rows[pos].xp}</span></div>`);
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
      <div class="card">${Rank.me && Rank.me.acc ? `<b>@${esc(Rank.me.username)}</b><div class="sub" style="margin:4px 0 0">${Rank.me.stale ? '⚠️ Has entrado en otro móvil. Vuelve a entrar aquí para seguir guardando.' : 'Tu progreso se guarda en tu cuenta' + (Rank.me.saved ? ' · última copia ' + new Date(Rank.me.saved).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '') + '.'} Las fotos de entrenos se quedan en el móvil.</div><button class="btn ghost w" id="accout">Cerrar sesión en este móvil</button>` : `<div class="sub" style="margin:0">Sin cuenta: tu progreso solo está en este móvil. Crea una con usuario y contraseña para competir en el ranking y no perder nada.</div><button class="btn red w" id="accnew">Crear cuenta o entrar</button>`}
        <div class="sub" style="font-size:12px;margin-top:10px">¿Problemas con tu cuenta? Escribe a <a href="mailto:${Rank.SUPPORT}" style="color:var(--ink)">${Rank.SUPPORT}</a></div></div>
      <div class="sec"><span>Recordatorios</span></div>
      <div class="card"><div class="rem" id="rem">${U.reminders().items.map(r => `<label class="rem-row"><input type="checkbox" data-id="${r.id}"${U.reminders().on && r.on ? ' checked' : ''}><span class="rem-t"><b>${r.label}</b><small>${r.what}</small></span><input type="time" data-t="${r.id}" value="${r.t}"></label>`).join('')}</div>
        <p class="src" style="margin-bottom:0">Llegan mientras HARDMODE está abierta o instalada. En iPhone, añádela a la pantalla de inicio. ${'Notification' in window ? (Notification.permission === 'granted' ? 'Notificaciones permitidas.' : 'Sin permiso de notificaciones: se muestran dentro de la app.') : 'Este navegador no admite notificaciones: se muestran dentro de la app.'}</p></div>
      <div class="sec"><span>Ajustes</span></div>
      <div class="card">
        <label class="rem-row"><input type="checkbox" id="calm"${U.calm() ? ' checked' : ''}><span class="rem-t"><b>Reducir movimiento</b><small>Sin animaciones, sacudidas ni texto que se escribe solo</small></span></label>
        <div class="sub" style="margin:10px 0 4px">${Cloud.AUTH ? esc(S().email || (Cloud.user && Cloud.user.email) || '') : 'Prototipo sin cuenta: tus datos se guardan solo en este dispositivo.'}</div>
        ${AX.enabled && !isPro() ? `<label class="rem-row"><input type="checkbox" id="ckads"${consent() === 'yes' ? ' checked' : ''}><span class="rem-t"><b>Anuncios con cookies</b><small>Aceptar los anuncios de Adsterra. Si lo quitas, no se carga ninguno.</small></span></label>` : ''}
        <a class="btn ghost w" href="legal.html" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;text-decoration:none">Privacidad y condiciones</a>
        ${Cloud.AUTH ? '<button class="btn ghost w" id="out">Cerrar sesión</button>' : ''}
      </div>
      <p class="sub" style="text-align:center;margin-top:20px;font-family:var(--mono);font-size:11px">HARDMODE · prototipo${Cloud.MOCK ? ' · modo local' : ''}</p>`;
    wireTop(v);
    Mascot.mount($('#tm', v), { size: 84, mood: st >= 7 ? 'cool' : 'calm', onTap: m => m.roar().say(pick(D.TANK.tap)) });
    drawMM(lived);
    const saveRem = async () => {
      const R = U.reminders(), was = R.on; R.items.forEach(r => { r.on = $(`[data-id="${r.id}"]`, v).checked; r.t = $(`[data-t="${r.id}"]`, v).value || r.t; });
      R.on = R.items.some(r => r.on); S().reminders = R; U.save();
      if (R.on && !was) { await U.askNotify(); toast('Recordatorios guardados', ' Te aviso a la hora elegida.', '⏰'); }
    };
    $$('#rem input', v).forEach(i => i.onchange = saveRem);
    const ck = $('#ckads', v); if (ck) ck.onchange = () => { const was = consent(); setConsent(ck.checked ? 'yes' : 'no'); H.tick(); if (ck.checked) { placeAds(); toast('Anuncios aceptados', 'Gracias por apoyar HARDMODE.', '✓'); } else if (was === 'yes') location.reload(); };
    $('#calm', v).onchange = e => { U.setCalm(e.target.checked); H.tick(); };
    const an = $('#accnew', v); if (an) an.onclick = () => go('rank');
    const ao = $('#accout', v); if (ao) ao.onclick = () => sheet(`<h3>¿Cerrar sesión?</h3><p class="p">Tu progreso sigue guardado en tu cuenta. En este móvil se borran tus datos y vuelves a empezar; para recuperarlos, entra con tu usuario y contraseña.</p><button class="cta" id="y" style="margin-top:16px">Cerrar sesión</button>`, sh => { $('#y', sh).onclick = async () => { await Rank.push(); Rank.leave(); try { localStorage.removeItem(U.KEY); } catch (e) { } location.reload(); }; });
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
