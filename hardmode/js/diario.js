/* Diario: fotos de tus entrenos y fichaje de trabajo (horas, horas extra y sueldo calculado).
   Todo se guarda en este dispositivo. Las fotos van comprimidas en IndexedDB. */
(function () {
  const { $, $$, esc, H, toast, sheet, dkey, addDays } = U;
  const S = () => U.S;
  const eur = n => (Math.round(n * 100) / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const hfmt = n => (Math.round(n * 100) / 100).toLocaleString('es-ES', { maximumFractionDigits: 2 }) + ' h';
  const fdate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }); };
  const nid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  let seg = null, monthOff = 0, ctx = null;

  // ---------- Fotos (IndexedDB) ----------
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open('hm-photos', 1); r.onupgradeneeded = () => r.result.createObjectStore('p'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
  const putPhoto = async (k, blob) => { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('p', 'readwrite'); t.objectStore('p').put(blob, k); t.oncomplete = res; t.onerror = () => rej(t.error); }); };
  const getPhoto = async k => { const d = await db(); return new Promise(res => { const r = d.transaction('p').objectStore('p').get(k); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); }); };
  const delPhoto = async k => { const d = await db(); return new Promise(res => { const t = d.transaction('p', 'readwrite'); t.objectStore('p').delete(k); t.oncomplete = res; t.onerror = res; }); };
  function shrink(file, max) {
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); c.toBlob(b => b ? res(b) : rej(new Error('blob')), 'image/jpeg', .8); };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
      img.src = url;
    });
  }

  // ---------- Datos ----------
  const train = () => (S().trainLog = S().trainLog || []);
  const work = () => (S().work = Object.assign({ mode: 'month', salary: 0, rate: 0, extraRate: 0, hours: 8 }, S().work || {}));
  const wlog = () => (S().workLog = S().workLog || []);
  const KINDS = [['gym', '🏋️', 'Gimnasio'], ['run', '🏃', 'Correr'], ['fight', '🥊', 'Combate'], ['home', '💪', 'En casa'], ['bike', '🚴', 'Bici'], ['other', '🔥', 'Otro']];

  function render(v, c) {
    ctx = c;
    const tr = S().track || [];
    if (!seg) seg = tr.includes('work') && !tr.includes('train') ? 'work' : 'train';
    v.innerHTML = `${c.topBar()}<div class="h1">Diario</div><div class="sub">Tus entrenos y tu trabajo, apuntados y sumados.</div>
      <div class="seg" id="dseg"><button data-k="train" class="${seg === 'train' ? 'on' : ''}">🏋️ Entrenos</button><button data-k="work" class="${seg === 'work' ? 'on' : ''}">💼 Trabajo</button></div>
      <div id="dbody"></div>`;
    c.wireTop(v);
    $$('#dseg button', v).forEach(b => b.onclick = () => { seg = b.dataset.k; H.tick(); render(v, c); });
    if (seg === 'train') renderTrain($('#dbody', v)); else renderWork($('#dbody', v));
  }

  // ---------- Entrenos ----------
  function renderTrain(el) {
    const L = train().slice().sort((a, b) => b.at - a.at);
    let wk = 0; for (let k = 0; k < 7; k++) if (L.some(x => x.d === addDays(dkey(), -k))) wk++;
    el.innerHTML = `<div class="stats"><div class="stat"><b>${L.length}</b><span>ENTRENOS</span></div><div class="stat"><b>${wk}/7</b><span>ESTA SEMANA</span></div><div class="stat"><b>${L.filter(x => x.photo).length}</b><span>FOTOS</span></div></div>
      ${(() => { const P = (S().weights || []).slice().sort((x, y) => x.d.localeCompare(y.d)), last = P[P.length - 1], first = P[0], diff = last && first && P.length > 1 ? Math.round((last.kg - first.kg) * 10) / 10 : null; return `<div class="card wcard"><div style="flex:1"><div class="sub" style="margin:0">Mi peso</div><b>${last ? String(last.kg).replace('.', ',') + ' kg' : '—'}</b>${diff !== null ? `<small class="${diff <= 0 ? 'dn' : 'up'}">${diff > 0 ? '+' : ''}${String(diff).replace('.', ',')} kg desde ${first.d.split('-').reverse().slice(0, 2).join('/')}</small>` : '<small>Apúntalo una vez por semana</small>'}</div><button class="btn ghost" id="wadd2">+ Peso</button></div>`; })()}
      <button class="btn red w" id="tadd">+ Subir entreno</button>
      <div class="sub" style="font-size:12px;text-align:center">Tus fotos se quedan en tu móvil. Puedes compartirlas con quien quieras desde cada entreno.</div>
      <div class="tfeed">${L.length ? L.map(x => { const k = KINDS.find(q => q[0] === x.kind) || KINDS[5]; return `<div class="tpost" data-id="${x.id}">${x.photo ? `<div class="tph"><img data-ph="${x.photo}" alt="Foto del entreno"></div>` : ''}<div class="tmeta"><span class="tk">${k[1]} ${esc(k[2])}${x.min ? ' · ' + x.min + ' min' : ''}</span><span class="td">${fdate(x.d)}</span></div>${x.t ? `<p>${esc(x.t)}</p>` : ''}<div class="tact"><button class="btn ghost sm" data-share="${x.id}">Compartir</button><button class="btn ghost sm" data-del="${x.id}">Borrar</button></div></div>`; }).join('') : '<div class="card" style="text-align:center;color:var(--mut);margin-top:12px">Aún no hay entrenos. Sube el primero: la foto de hoy es la prueba.</div>'}</div>`;
    $$('img[data-ph]', el).forEach(async im => { const b = await getPhoto(im.dataset.ph); if (b) im.src = URL.createObjectURL(b); else im.closest('.tph').remove(); });
    $('#tadd', el).onclick = () => addTrain(el);
    $('#wadd2', el).onclick = () => sheet(`<h3>Mi peso</h3><input class="field l" id="kg" type="number" inputmode="decimal" min="20" max="300" step="0.1" placeholder="Kg (ej.: 74,5)" style="margin-top:10px"><button class="cta" id="kgs" style="margin-top:14px">Guardar</button>`, (sh, close) => { $('#kgs', sh).onclick = () => { const kg = Math.round((+String($('#kg', sh).value).replace(',', '.') || 0) * 10) / 10; if (kg < 20 || kg > 300) return; const W = S().weights = (S().weights || []).filter(x => x.d !== dkey()); W.push({ d: dkey(), kg }); U.save(); H.success(); close(); renderTrain(el); }; });
    $$('[data-del]', el).forEach(b => b.onclick = () => sheet(`<h3>¿Borrar este entreno?</h3><p class="p">No se puede deshacer.</p><button class="cta" id="y" style="margin-top:16px">Borrar</button>`, (sh, close) => { $('#y', sh).onclick = async () => { const L2 = train(), i = L2.findIndex(x => x.id === b.dataset.del); if (i >= 0) { if (L2[i].photo) await delPhoto(L2[i].photo); L2.splice(i, 1); U.save(); } close(); renderTrain(el); }; }));
    $$('[data-share]', el).forEach(b => b.onclick = async () => {
      const x = train().find(q => q.id === b.dataset.share); if (!x) return;
      const k = KINDS.find(q => q[0] === x.kind) || KINDS[5];
      const text = `${k[1]} ${k[2]}${x.min ? ' · ' + x.min + ' min' : ''}${x.t ? ' — ' + x.t : ''} · Día ${window.HM_STREAK ? HM_STREAK() : ''} de racha en HARDMODE`;
      try {
        const blob = x.photo ? await getPhoto(x.photo) : null;
        const file = blob ? new File([blob], 'entreno.jpg', { type: 'image/jpeg' }) : null;
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text });
        else if (navigator.share) await navigator.share({ text, url: location.origin + location.pathname });
        else { await navigator.clipboard.writeText(text); toast('Texto copiado', ' Pégalo donde quieras.', '🔗'); }
      } catch (e) { }
    });
  }
  function addTrain(el) {
    let kind = 'gym', blob = null;
    sheet(`<h3>Subir entreno</h3>
      <label class="photo-pick" id="pp"><input type="file" accept="image/*" id="pf" hidden><span id="pt">📷 Añadir foto (opcional)</span><img id="pv" alt="" hidden></label>
      <div class="chips" style="margin-top:12px;justify-content:flex-start">${KINDS.map(k => `<button class="chip${k[0] === kind ? ' on' : ''}" data-k="${k[0]}">${k[1]} ${k[2]}</button>`).join('')}</div>
      <div class="prio-in" style="margin-top:12px"><input class="field l" id="tm" type="number" inputmode="numeric" min="0" max="600" placeholder="Minutos" style="max-width:120px"><input class="field l" id="tt" maxlength="140" placeholder="¿Qué has hecho? Ej.: Pierna, 5x5 sentadilla"></div>
      <button class="cta" id="ts" style="margin-top:16px">Guardar entreno</button>`, (sh, close) => {
      $$('.chip', sh).forEach(c => c.onclick = () => { kind = c.dataset.k; $$('.chip', sh).forEach(x => x.classList.toggle('on', x === c)); H.tick(); });
      $('#pf', sh).onchange = async e => { const f = e.target.files[0]; if (!f) return; $('#pt', sh).textContent = 'Procesando…'; try { blob = await shrink(f, 1280); const pv = $('#pv', sh); pv.src = URL.createObjectURL(blob); pv.hidden = false; $('#pt', sh).textContent = 'Cambiar foto'; } catch (x) { $('#pt', sh).textContent = 'No se ha podido leer la foto'; } };
      $('#ts', sh).onclick = async () => {
        const b = $('#ts', sh); b.disabled = true;
        const e = { id: nid(), d: dkey(), at: Date.now(), kind, min: Math.max(0, Math.min(600, +$('#tm', sh).value || 0)) || null, t: $('#tt', sh).value.trim() };
        if (blob) { try { e.photo = 'p_' + e.id; await putPhoto(e.photo, blob); } catch (x) { delete e.photo; toast('Sin foto', ' No hay espacio para guardar la foto; el entreno sí se guarda.', '📷'); } }
        const first = !train().some(x => x.d === e.d);
        train().push(e); U.save();
        if (first && ctx) ctx.xp(10);
        H.success(); close(); toast('Entreno guardado', first ? ' +10 ⚡ por entrenar hoy.' : ' Sumado a tu diario.', '🏋️');
        renderTrain(el);
      };
    });
  }

  // ---------- Trabajo ----------
  function monthKey(off) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + off); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
  function calc(mk) {
    const W = work(), L = wlog().filter(x => x.d.slice(0, 7) === mk);
    const normal = L.reduce((s, x) => s + (x.normal || 0), 0), extra = L.reduce((s, x) => s + (x.extra || 0), 0);
    const base = W.mode === 'hour' ? normal * (W.rate || 0) : (W.salary || 0);
    const extraPay = extra * (W.extraRate || 0);
    return { L, normal, extra, base, extraPay, total: base + extraPay, days: new Set(L.map(x => x.d)).size };
  }
  function renderWork(el) {
    const W = work(), mk = monthKey(monthOff), R = calc(mk), set = W.mode === 'hour' ? W.rate > 0 : W.salary > 0;
    const mname = new Date(+mk.slice(0, 4), +mk.slice(5) - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const clock = S().clockIn;
    el.innerHTML = `${set ? '' : `<div class="card comeback" style="border-left-color:var(--yel);margin-top:12px"><b style="font-size:20px">Configura tu sueldo</b><p>Pon cuánto cobras y cuánto te pagan la hora extra. Así todo sale calculado.</p><button class="btn w" id="wcfg1">Configurar</button></div>`}
      <div class="card clock${clock ? ' on' : ''}" style="margin-top:12px"><div><b>${clock ? 'Fichado desde las ' + new Date(clock).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'Fichar jornada'}</b><div class="sub" style="margin:2px 0 0">${clock ? 'Al salir, se suman las horas: las que pasen de ' + hfmt(W.hours) + ' cuentan como extra.' : 'Pulsa al entrar y al salir. O apúntalo a mano.'}</div></div><button class="btn ${clock ? 'red' : 'green'}" id="wclk">${clock ? 'Salir' : 'Entrar'}</button></div>
      <div class="mnav"><button id="mprev" aria-label="Mes anterior">‹</button><b>${mname}</b><button id="mnext" aria-label="Mes siguiente"${monthOff >= 0 ? ' disabled' : ''}>›</button></div>
      <div class="card paycard"><div class="sub" style="margin:0">Total estimado del mes</div><div class="pay">${eur(R.total)}</div>
        <div class="payrow"><span>${W.mode === 'hour' ? `Horas normales · ${hfmt(R.normal)} × ${eur(W.rate || 0)}` : 'Sueldo base'}</span><b>${eur(R.base)}</b></div>
        <div class="payrow"><span>Horas extra · ${hfmt(R.extra)} × ${eur(W.extraRate || 0)}</span><b>${eur(R.extraPay)}</b></div>
        <div class="sub" style="font-size:12px;margin-top:8px">${R.days} ${R.days === 1 ? 'día apuntado' : 'días apuntados'}. Cálculo bruto orientativo: no descuenta impuestos ni Seguridad Social.</div></div>
      <div class="row" style="gap:8px;margin-top:10px"><button class="btn red" id="wadd" style="flex:1">+ Apuntar horas</button><button class="btn ghost" id="wcfg">Sueldo</button></div>
      <div class="sec"><span>Registros del mes</span></div>
      <div>${R.L.length ? R.L.slice().sort((a, b) => b.d.localeCompare(a.d) || b.at - a.at).map(x => `<div class="wrow"><div style="flex:1"><b>${fdate(x.d)}</b><div class="sub" style="margin:2px 0 0">${x.normal ? hfmt(x.normal) + ' normales' : ''}${x.normal && x.extra ? ' · ' : ''}${x.extra ? '<span style="color:var(--yel)">' + hfmt(x.extra) + ' extra</span>' : ''}${x.note ? ' · ' + esc(x.note) : ''}</div></div><button class="btn ghost sm" data-wdel="${x.id}" aria-label="Borrar registro">✕</button></div>`).join('') : '<div class="card" style="text-align:center;color:var(--mut)">Nada apuntado este mes.</div>'}</div>`;
    const re = () => renderWork(el);
    $('#mprev', el).onclick = () => { monthOff--; re(); };
    $('#mnext', el).onclick = () => { if (monthOff < 0) { monthOff++; re(); } };
    $('#wcfg', el).onclick = () => cfgSheet(re); const c1 = $('#wcfg1', el); if (c1) c1.onclick = () => cfgSheet(re);
    $('#wadd', el).onclick = () => addSheet(re);
    $('#wclk', el).onclick = () => {
      if (!S().clockIn) { S().clockIn = Date.now(); U.save(); H.thud(); toast('Fichado', ' Que sea un buen día de trabajo.', '💼'); re(); return; }
      const hrs = Math.round((Date.now() - S().clockIn) / 36e5 * 4) / 4, lim = W.hours || 8;
      const d = dkey(new Date(S().clockIn));
      S().clockIn = null;
      if (hrs >= .25) { wlog().push({ id: nid(), d, at: Date.now(), normal: Math.min(hrs, lim), extra: Math.max(0, hrs - lim), note: 'Fichaje' }); }
      U.save(); H.success(); toast('Jornada guardada', hrs >= .25 ? ` ${hfmt(hrs)} apuntadas.` : ' Menos de 15 minutos: no se ha apuntado.', '💼'); re();
    };
    $$('[data-wdel]', el).forEach(b => b.onclick = () => { const L = wlog(), i = L.findIndex(x => x.id === b.dataset.wdel); if (i >= 0) { L.splice(i, 1); U.save(); H.tick(); re(); } });
  }
  function cfgSheet(done) {
    const W = work();
    sheet(`<h3>Tu sueldo</h3>
      <div class="seg" id="cm" style="margin-top:6px"><button data-k="month" class="${W.mode === 'month' ? 'on' : ''}">Sueldo al mes</button><button data-k="hour" class="${W.mode === 'hour' ? 'on' : ''}">Pago por hora</button></div>
      <label class="lbl" id="l1">${W.mode === 'hour' ? 'Cuánto te pagan la hora (€)' : 'Sueldo bruto al mes (€)'}</label><input class="field l" id="c1" type="number" inputmode="decimal" min="0" step="0.01" value="${(W.mode === 'hour' ? W.rate : W.salary) || ''}" placeholder="0" style="margin-top:6px">
      <label class="lbl">Hora extra (€)</label><input class="field l" id="c2" type="number" inputmode="decimal" min="0" step="0.01" value="${W.extraRate || ''}" placeholder="0" style="margin-top:6px">
      <label class="lbl">Horas de tu jornada normal</label><input class="field l" id="c3" type="number" inputmode="decimal" min="1" max="16" step="0.5" value="${W.hours || 8}" style="margin-top:6px">
      <button class="cta" id="cs" style="margin-top:16px">Guardar</button>`, (sh, close) => {
      let mode = W.mode;
      $$('#cm button', sh).forEach(b => b.onclick = () => { mode = b.dataset.k; $$('#cm button', sh).forEach(x => x.classList.toggle('on', x === b)); $('#l1', sh).textContent = mode === 'hour' ? 'Cuánto te pagan la hora (€)' : 'Sueldo bruto al mes (€)'; $('#c1', sh).value = (mode === 'hour' ? W.rate : W.salary) || ''; });
      $('#cs', sh).onclick = () => { const n = id => Math.max(0, +String($(id, sh).value).replace(',', '.') || 0); W.mode = mode; if (mode === 'hour') W.rate = n('#c1'); else W.salary = n('#c1'); W.extraRate = n('#c2'); W.hours = Math.min(16, Math.max(1, n('#c3') || 8)); S().work = W; U.save(); H.success(); close(); done(); };
    });
  }
  function addSheet(done) {
    sheet(`<h3>Apuntar horas</h3>
      <label class="lbl">Día</label><input class="field l" id="ad" type="date" value="${dkey()}" max="${dkey()}" style="margin-top:6px">
      <div class="prio-in" style="margin-top:12px"><div style="flex:1"><label class="lbl" style="margin-top:0">Normales</label><input class="field l" id="an" type="number" inputmode="decimal" min="0" max="24" step="0.25" placeholder="0" style="margin-top:6px"></div><div style="flex:1"><label class="lbl" style="margin-top:0">Extra</label><input class="field l" id="ax" type="number" inputmode="decimal" min="0" max="24" step="0.25" placeholder="0" style="margin-top:6px"></div></div>
      <input class="field l" id="ao" maxlength="60" placeholder="Nota (opcional)" style="margin-top:12px">
      <div class="err" id="ae"></div>
      <button class="cta" id="as" style="margin-top:8px">Guardar</button>`, (sh, close) => {
      $('#as', sh).onclick = () => {
        const n = id => Math.max(0, Math.min(24, +String($(id, sh).value).replace(',', '.') || 0));
        const d = $('#ad', sh).value || dkey(), nh = n('#an'), xh = n('#ax');
        if (!nh && !xh) { $('#ae', sh).textContent = 'Pon al menos unas horas.'; return; }
        wlog().push({ id: nid(), d, at: Date.now(), normal: nh, extra: xh, note: $('#ao', sh).value.trim() }); U.save(); H.success(); close(); done();
      };
    });
  }

  window.Diario = { render, set seg(v) { seg = v; } };
})();
