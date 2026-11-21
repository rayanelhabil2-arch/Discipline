/* Ranking público de rachas y XP. Sin cuenta: cada móvil tiene un id y una clave secreta propios
   (guardados aquí) y solo se publica el @usuario, la racha, la mejor racha y los puntos. */
(function () {
  const C = window.HM_CONFIG.SUPABASE, KEY = 'hm.rank';
  const rnd = n => { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, b => b.toString(16).padStart(2, '0')).join(''); };
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : rnd(4) + '-' + rnd(2) + '-4' + rnd(2).slice(1) + '-a' + rnd(2).slice(1) + '-' + rnd(6));
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const store = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { } };
  let me = load(), timer = null;

  async function rpc(fn, body) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 7000);
    try {
      const r = await fetch(`${C.url}/rest/v1/rpc/${fn}`, { method: 'POST', signal: ctl.signal, headers: { apikey: C.key, Authorization: 'Bearer ' + C.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }
  const stats = () => ({ p_streak: window.HM_STREAK ? HM_STREAK() : 0, p_xp: U.S.xp || 0, p_best: Math.max(U.S.bestStreak || 0, window.HM_STREAK ? HM_STREAK() : 0) });
  const clean = v => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^@/, '').replace(/\s+/g, '_').toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20);

  async function join(username) {
    const u = clean(username);
    if (!/^[a-z0-9_.]{3,20}$/.test(u)) return { error: 'De 3 a 20 letras, números, _ o .' };
    const cand = me || { id: uuid(), secret: rnd(24) };
    let res;
    try { res = await rpc('hm_rank_submit', Object.assign({ p_id: cand.id, p_secret: cand.secret, p_username: u }, stats())); }
    catch (e) { return { error: 'No hay conexión. Inténtalo en un momento.' }; }
    if (res === 'taken') return { error: 'Ese @usuario ya está cogido.' };
    if (res !== 'ok') return { error: 'No se ha podido guardar. Inténtalo otra vez.' };
    me = Object.assign(cand, { username: u }); store(me);
    U.S.username = u; U.save();
    return { ok: true };
  }
  const snapshot = () => { const d = Object.assign({}, U.S); delete d.email; delete d.plan; return d; };
  async function push() {
    if (!me) return;
    try { await rpc('hm_rank_submit', Object.assign({ p_id: me.id, p_secret: me.secret, p_username: me.username }, stats())); } catch (e) { }
    if (me.acc) { try { const r = await rpc('hm_acc_save', { p_id: me.id, p_secret: me.secret, p_data: snapshot() }); if (r === 'ok') { me.saved = Date.now(); store(me); } else if (r === 'bad') { me.stale = true; store(me); } } catch (e) { } }
  }
  // Cuenta con usuario y contraseña (sin correo)
  async function register(username, password) {
    const u = clean(username);
    if (!/^[a-z0-9_.]{3,20}$/.test(u)) return { error: 'Usuario: de 3 a 20 letras, números, _ o .' };
    if (!password || password.length < 6) return { error: 'La contraseña necesita al menos 6 caracteres.' };
    const cand = me || { id: uuid(), secret: rnd(24) };
    let res;
    try { res = await rpc('hm_acc_register', Object.assign({ p_id: cand.id, p_secret: cand.secret, p_username: u, p_password: password, p_data: snapshot() }, stats())); }
    catch (e) { return { error: 'No hay conexión. Inténtalo en un momento.' }; }
    if (res === 'taken') return { error: 'Ese usuario ya existe. Si es tuyo, entra con tu contraseña.' };
    if (res === 'short') return { error: 'La contraseña necesita al menos 6 caracteres.' };
    if (res !== 'ok') return { error: 'No se ha podido crear la cuenta. Inténtalo otra vez.' };
    me = Object.assign(cand, { username: u, acc: true, saved: Date.now(), stale: false }); store(me);
    U.S.username = u; U.save();
    return { ok: true };
  }
  async function login(username, password) {
    const u = clean(username);
    if (!u || !password) return { error: 'Escribe tu usuario y tu contraseña.' };
    let r;
    try { r = await rpc('hm_acc_login', { p_username: u, p_password: password }); }
    catch (e) { return { error: 'No hay conexión. Inténtalo en un momento.' }; }
    if (!r || r.error === 'locked') return { error: 'Demasiados intentos. Espera 15 minutos.' };
    if (r.error) return { error: 'Usuario o contraseña incorrectos.' };
    me = { id: r.id, secret: r.secret, username: r.username, acc: true, saved: Date.now() }; store(me);
    const data = r.data && typeof r.data === 'object' ? r.data : null;
    if (data && Object.keys(data).length) U.S = Object.assign({}, U.DEF, data, { username: r.username });
    else U.S.username = r.username;
    try { localStorage.setItem(U.KEY, JSON.stringify(U.S)); } catch (e) { }
    return { ok: true, restored: !!(data && data.onboarded) };
  }
  function queue() { if (!me) return; clearTimeout(timer); timer = setTimeout(push, 2500); }
  async function top(n) { try { const r = await rpc('hm_rank_top', { lim: n || 50 }); return Array.isArray(r) ? r : null; } catch (e) { return null; } }
  function leave() { me = null; try { localStorage.removeItem(KEY); } catch (e) { } }

  window.addEventListener('pagehide', () => { if (timer) { clearTimeout(timer); push(); } });
  window.Rank = { join, push, queue, top, leave, clean, register, login, SUPPORT: 'duolab.suport@gmail.com', get me() { return me; } };
})();
