/* Menú «Más» y secciones extra: Metas (semana, mes, año y ahorro) y Estudios (exámenes). */
(function () {
  const { $, $$, esc, H, toast, sheet, dkey, burst } = U;
  const S = () => U.S;
  const nid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const eur = n => (Math.round(n * 100) / 100).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €';
  const weekKey = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); const w1 = new Date(d.getFullYear(), 0, 4); return d.getFullYear() + '-S' + (1 + Math.round(((d - w1) / 864e5 - 3 + (w1.getDay() + 6) % 7) / 7)); };
  const monthKey = () => dkey().slice(0, 7);
  const back = ctx => `<button class="back-mas" id="bm">‹ Menú</button>`;
  const wireBack = (v, ctx) => { const b = $('#bm', v); if (b) b.onclick = () => { H.tick(); ctx.go('mas'); }; };

  // ---------- Menú ----------
  function renderMenu(v, ctx) {
    const items = [
      ['espejo', '🪞', 'El Espejo', 'Examen de cada noche, 2 min'],
      ['metas', '🎯', 'Metas', 'Semana, mes, año y ahorro'],
      ['estudios', '📚', 'Estudios', 'Exámenes con cuenta atrás'],
      ['arsenal', '🎬', 'Vídeos y lecciones', 'Entrenamiento mental'],
      ['tu', '🦁', 'Perfil y cuenta', 'Racha, rangos y copia'],
      ['ajustes', '⚙️', 'Ajustes', 'Avisos y movimiento']
    ];
    v.innerHTML = `${ctx.topBar()}<div class="h1">Menú</div><div class="sub">Todo HARDMODE en un sitio.</div>
      <div class="menu">${items.map(x => `<button class="mi" data-go="${x[0]}"><span class="ic">${x[1]}</span><b>${x[2]}</b><small>${x[3]}</small></button>`).join('')}</div>
      <div class="sec"><span>Comunidad</span></div>
      <button class="card mrow" id="minv"><span>📣</span><div><b>Invita a un amigo</b><small>Compite con él en el ranking</small></div><i>›</i></button>
      <a class="card mrow" href="mailto:${Rank.SUPPORT}"><span>✉️</span><div><b>Soporte</b><small>${Rank.SUPPORT}</small></div><i>›</i></a>
      <a class="card mrow" href="legal.html" target="_blank" rel="noopener"><span>📄</span><div><b>Privacidad y condiciones</b><small>Qué guardamos y para qué</small></div><i>›</i></a>
      <p class="sub" style="text-align:center;margin-top:20px;font-family:var(--mono);font-size:11px">HARDMODE · versión de pruebas</p>`;
    ctx.wireTop(v);
    $$('.mi', v).forEach(b => b.onclick = () => { H.tick(); const g = b.dataset.go; if (g === 'ajustes') { ctx.go('tu'); setTimeout(() => { const r = $('#rem'); if (r) r.scrollIntoView({ block: 'start' }); }, 60); } else ctx.go(g); });
    $('#minv', v).onclick = async () => { const u = Rank.me ? ' Búscame: @' + Rank.me.username : ''; const d = { title: 'HARDMODE', text: 'Te reto a no fallar ni un día en HARDMODE.' + u, url: location.origin + location.pathname }; try { if (navigator.share) await navigator.share(d); else { await navigator.clipboard.writeText(d.text + ' ' + d.url); toast('Enlace copiado', ' Pégalo en un chat.', '🔗'); } } catch (e) { } };
  }

  // ---------- Metas ----------
  function list(key, period) { const o = S()[key]; if (!o || o.p !== period) S()[key] = { p: period, items: [] }; return S()[key]; }
  function renderMetas(v, ctx) {
    const W = list('wgoals', weekKey()), M = list('mgoals', monthKey()), Y = (S().goals || []).filter(Boolean);
    const sv = S().savings = Object.assign({ goal: 0, name: '', items: [] }, S().savings || {});
    const saved = sv.items.reduce((a, x) => a + x.amt, 0), pc = sv.goal ? Math.min(100, Math.round(saved / sv.goal * 100)) : 0;
    const blk = (id, title, L) => `<div class="sec"><span>${title}</span><button data-add="${id}">+ AÑADIR</button></div>
      <div class="card glist">${L.items.length ? L.items.map((x, k) => `<button class="gi${x.done ? ' done' : ''}" data-l="${id}" data-k="${k}"><i>${x.done ? '✓' : ''}</i><span>${esc(x.t)}</span></button>`).join('') : `<div class="sub" style="margin:0">Nada todavía. Pon 1 a 3 cosas concretas.</div>`}
      ${L.items.length ? `<div class="gprog"><b style="width:${Math.round(L.items.filter(x => x.done).length / L.items.length * 100)}%"></b></div>` : ''}</div>`;
    v.innerHTML = `${ctx.topBar()}${back()}<div class="h1">Metas</div><div class="sub">De lo grande a lo de esta semana.</div>
      <div class="sec"><span>Este año</span></div>
      <div class="card">${Y.length ? Y.map((g, k) => `<div class="ygoal"><b>${k + 1}</b><span>${esc(g)}</span></div>`).join('') : '<div class="sub" style="margin:0">Sin objetivos del año.</div>'}<button class="btn ghost w" id="yedit">Editar objetivos del año</button></div>
      ${blk('wgoals', 'Esta semana', W)}${blk('mgoals', 'Este mes', M)}
      <div class="sec"><span>Ahorro</span><button id="svcfg">${sv.goal ? 'EDITAR' : 'CREAR META'}</button></div>
      <div class="card">${sv.goal ? `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><b style="font-size:15px">${esc(sv.name || 'Mi meta')}</b><span class="sub" style="margin:0">${eur(saved)} de ${eur(sv.goal)}</span></div><div class="gprog big"><b style="width:${pc}%"></b></div><div class="sub" style="margin:6px 0 0">${pc} % · faltan ${eur(Math.max(0, sv.goal - saved))}</div><button class="btn green w" id="svadd">+ Apartar dinero</button>` : '<div class="sub" style="margin:0">Ponte una meta de ahorro: un viaje, un coche, un colchón para emergencias.</div>'}</div>`;
    ctx.wireTop(v); wireBack(v, ctx);
    const re = () => renderMetas(v, ctx);
    $$('.gi', v).forEach(b => b.onclick = () => { const L = S()[b.dataset.l], x = L.items[+b.dataset.k]; x.done = !x.done; U.save(); if (x.done) { ctx.xp(10); H.success(); if (L.items.every(q => q.done)) { burst(50); toast('Todo cumplido', ' +10 ⚡ por cada una.', '🎯'); } } else { ctx.xp(-10); H.tick(); } re(); });
    $$('[data-add]', v).forEach(b => b.onclick = () => sheet(`<h3>Nueva meta</h3><input class="field l" id="gt" maxlength="80" placeholder="Ej.: Entrenar 4 días" style="margin-top:10px"><button class="cta" id="gs" style="margin-top:14px">Añadir</button>`, (sh, close) => { const i = $('#gt', sh); setTimeout(() => i.focus(), 300); const add = () => { const t = i.value.trim(); if (!t) return; S()[b.dataset.add].items.push({ t, done: false }); U.save(); close(); re(); }; $('#gs', sh).onclick = add; i.onkeydown = e => { if (e.key === 'Enter') add(); }; }));
    $('#yedit', v).onclick = () => { const g = (S().goals || []).concat(['', '', '']).slice(0, 3); sheet(`<h3>Objetivos del año</h3>${g.map((x, k) => `<input class="field l" data-k="${k}" maxlength="70" value="${esc(x)}" placeholder="Objetivo ${k + 1}" style="margin-top:10px">`).join('')}<button class="cta" id="ys" style="margin-top:14px">Guardar</button>`, (sh, close) => { $('#ys', sh).onclick = () => { S().goals = $$('input', sh).map(i => i.value.trim()).filter(Boolean); U.save(); close(); re(); }; }); };
    $('#svcfg', v).onclick = () => sheet(`<h3>Meta de ahorro</h3><input class="field l" id="sn" maxlength="40" value="${esc(sv.name)}" placeholder="Para qué (ej.: Viaje a Japón)" style="margin-top:10px"><input class="field l" id="sg" type="number" inputmode="decimal" min="0" value="${sv.goal || ''}" placeholder="Cantidad objetivo (€)" style="margin-top:10px"><button class="cta" id="ss" style="margin-top:14px">Guardar</button>`, (sh, close) => { $('#ss', sh).onclick = () => { sv.name = $('#sn', sh).value.trim(); sv.goal = Math.max(0, +String($('#sg', sh).value).replace(',', '.') || 0); S().savings = sv; U.save(); close(); re(); }; });
    const sa = $('#svadd', v); if (sa) sa.onclick = () => sheet(`<h3>Apartar dinero</h3><input class="field l" id="sa" type="number" inputmode="decimal" placeholder="Cantidad (€). Negativo si sacas." style="margin-top:10px"><button class="cta" id="ss" style="margin-top:14px">Guardar</button>`, (sh, close) => { $('#ss', sh).onclick = () => { const a = +String($('#sa', sh).value).replace(',', '.') || 0; if (!a) return; sv.items.push({ d: dkey(), amt: a }); S().savings = sv; U.save(); if (a > 0) { ctx.xp(5); H.success(); } close(); re(); }; });
  }

  // ---------- Estudios ----------
  function renderEstudios(v, ctx) {
    const E = S().exams = S().exams || [], today = dkey();
    const days = d => { const [y, m, dd] = d.split('-').map(Number), [a, b, c] = today.split('-').map(Number); return Math.round((new Date(y, m - 1, dd) - new Date(a, b - 1, c)) / 864e5); };
    const up = E.filter(x => x.d >= today).sort((a, b) => a.d.localeCompare(b.d)), past = E.filter(x => x.d < today).sort((a, b) => b.d.localeCompare(a.d)).slice(0, 10);
    v.innerHTML = `${ctx.topBar()}${back()}<div class="h1">Estudios</div><div class="sub">Exámenes con cuenta atrás y horas de estudio.</div>
      <div class="stats"><div class="stat"><b>${Math.round((S().focusMin || 0) / 6) / 10}</b><span>HORAS DE FOCO</span></div><div class="stat"><b>${S().focusN || 0}</b><span>SESIONES</span></div><div class="stat"><b>${up.length}</b><span>EXÁMENES</span></div></div>
      <button class="btn red w" id="foc">▶ Sesión de estudio (Foco)</button>
      <div class="sec"><span>Próximos exámenes</span><button id="eadd">+ AÑADIR</button></div>
      ${up.length ? up.map(x => { const n = days(x.d); return `<div class="wrow exam${n <= 3 ? ' near' : ''}"><div class="cd"><b>${n === 0 ? 'HOY' : n}</b>${n ? `<small>${n === 1 ? 'DÍA' : 'DÍAS'}</small>` : ''}</div><div style="flex:1;min-width:0"><b>${esc(x.s)}</b><div class="sub" style="margin:2px 0 0;text-transform:capitalize">${new Date(x.d + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div><button class="btn ghost sm" data-x="${x.id}" aria-label="Borrar examen">✕</button></div>`; }).join('') : '<div class="card" style="text-align:center;color:var(--mut)">Sin exámenes a la vista. Añade el próximo y empieza a contar.</div>'}
      ${past.length ? `<div class="sec"><span>Ya pasados</span></div>${past.map(x => `<div class="wrow" style="opacity:.6"><div style="flex:1"><b>${esc(x.s)}</b><div class="sub" style="margin:2px 0 0">${x.d.split('-').reverse().join('/')}</div></div><button class="btn ghost sm" data-x="${x.id}" aria-label="Borrar examen">✕</button></div>`).join('')}` : ''}`;
    ctx.wireTop(v); wireBack(v, ctx);
    const re = () => renderEstudios(v, ctx);
    $('#foc', v).onclick = () => ctx.go('foco');
    $$('[data-x]', v).forEach(b => b.onclick = () => { const i = E.findIndex(x => x.id === b.dataset.x); if (i >= 0) { E.splice(i, 1); U.save(); re(); } });
    $('#eadd', v).onclick = () => sheet(`<h3>Nuevo examen</h3><input class="field l" id="es" maxlength="50" placeholder="Asignatura (ej.: Matemáticas)" style="margin-top:10px"><label class="lbl">Fecha</label><input class="field l" id="ed" type="date" min="${today}" value="${today}" style="margin-top:6px"><div class="err" id="ee"></div><button class="cta" id="eg" style="margin-top:8px">Guardar</button>`, (sh, close) => { $('#eg', sh).onclick = () => { const sname = $('#es', sh).value.trim(), d = $('#ed', sh).value; if (!sname || !d) { $('#ee', sh).textContent = 'Pon la asignatura y la fecha.'; return; } E.push({ id: nid(), s: sname, d }); U.save(); H.success(); close(); re(); }; });
  }

  window.Mas = { renderMenu, renderMetas, renderEstudios };
})();
