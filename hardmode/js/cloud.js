/* Cuentas y guardado en la nube (Supabase). Con ?mock=1 funciona sin servidor, para pruebas. */
(function () {
  const C = window.HM_CONFIG.SUPABASE;
  const MOCK = /[?&]mock=1/.test(location.search) || !window.supabase || !C.url;
  let sb = null, user = null, timer = null, ready = false;

  // ---------- Simulación local (solo pruebas) ----------
  const mk = {
    get db() { try { return JSON.parse(localStorage.getItem('hm.mock') || '{"users":{},"profiles":{},"session":null}'); } catch (e) { return { users: {}, profiles: {}, session: null }; } },
    set db(v) { localStorage.setItem('hm.mock', JSON.stringify(v)); }
  };

  async function init() {
    if (MOCK) { const d = mk.db; user = d.session ? { id: d.session, email: d.users[d.session] && d.users[d.session].email } : null; return user; }
    sb = window.supabase.createClient(C.url, C.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    const { data } = await sb.auth.getSession();
    user = data.session ? data.session.user : null;
    if (user && user.is_anonymous) { await sb.auth.signOut(); user = null; }
    return user;
  }

  const errEs = m => {
    m = String(m || '');
    if (/already registered|already exists/i.test(m)) return 'Ese correo ya tiene cuenta. Entra con él.';
    if (/invalid login|invalid credentials/i.test(m)) return 'Correo o contraseña incorrectos.';
    if (/email not confirmed/i.test(m)) return 'Confirma tu correo primero (revisa también spam).';
    if (/password/i.test(m) && /6|short|weak/i.test(m)) return 'La contraseña debe tener al menos 6 caracteres.';
    if (/rate|too many/i.test(m)) return 'Demasiados intentos. Espera un minuto.';
    if (/valid email|invalid email/i.test(m)) return 'Ese correo no es válido.';
    return m || 'Algo ha fallado. Inténtalo otra vez.';
  };

  async function signUp(email, pass) {
    if (MOCK) {
      const d = mk.db; const id = Object.keys(d.users).find(k => d.users[k].email === email);
      if (id) return { error: 'Ese correo ya tiene cuenta. Entra con él.' };
      const nid = 'u' + Date.now(); d.users[nid] = { email, pass }; d.session = nid; mk.db = d; user = { id: nid, email }; return { user };
    }
    const { data, error } = await sb.auth.signUp({ email, password: pass, options: { emailRedirectTo: location.origin + location.pathname } });
    if (error) return { error: errEs(error.message) };
    if (data.user && data.user.identities && data.user.identities.length === 0) return { error: 'Ese correo ya tiene cuenta. Entra con él.' };
    if (!data.session) return { confirm: true };
    user = data.user; return { user };
  }
  async function signIn(email, pass) {
    if (MOCK) {
      const d = mk.db; const id = Object.keys(d.users).find(k => d.users[k].email === email && d.users[k].pass === pass);
      if (!id) return { error: 'Correo o contraseña incorrectos.' };
      d.session = id; mk.db = d; user = { id, email }; return { user };
    }
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) return { error: errEs(error.message) };
    user = data.user; return { user };
  }
  async function resetPass(email) {
    if (MOCK) return {};
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    return error ? { error: errEs(error.message) } : {};
  }
  async function signOut() {
    if (MOCK) { const d = mk.db; d.session = null; mk.db = d; }
    else await sb.auth.signOut();
    user = null; try { localStorage.removeItem(U.KEY); } catch (e) { }
    location.reload();
  }

  // Carga el perfil y lo mezcla con el estado local
  async function load() {
    let row;
    if (MOCK) { row = mk.db.profiles[user.id]; }
    else {
      const { data, error } = await sb.from('hm_profiles').select('*').eq('id', user.id).maybeSingle();
      if (error) throw error;
      row = data;
      if (!row) { const r = await sb.from('hm_profiles').insert({ id: user.id }).select().single(); if (r.error) throw r.error; row = r.data; }
    }
    row = row || { data: {}, onboarded: false, plan: 'free' };
    const local = U.S;
    const remote = row.data || {};
    // Si la nube tiene datos, mandan ellos; si no, se suben los locales
    const base = Object.keys(remote).length ? remote : (local.onboarded ? local : {});
    U.S = Object.assign({}, U.DEF, base, { onboarded: !!row.onboarded, plan: row.plan || 'free', email: user.email });
    if (row.username) U.S.username = row.username;
    try { localStorage.setItem(U.KEY, JSON.stringify(U.S)); } catch (e) { }
    ready = true;
    return row;
  }

  function payload(extra) {
    const S = U.S, data = Object.assign({}, S); delete data.plan; delete data.email; delete data.signature;
    return Object.assign({ data, streak: window.HM_STREAK ? HM_STREAK() : 0, xp: S.xp || 0 }, extra || {});
  }
  async function push(extra) {
    if (!user || !ready) return;
    const p = payload(extra);
    if (MOCK) { const d = mk.db; const old = d.profiles[user.id] || {}; d.profiles[user.id] = Object.assign({ plan: 'free' }, old, p, old.onboarded ? { onboarded: true } : {}); mk.db = d; return { ok: true }; }
    const { error } = await sb.from('hm_profiles').update(p).eq('id', user.id);
    if (error) { console.warn('sync', error.message); return { error: error.message }; }
    return { ok: true };
  }
  function queue() { clearTimeout(timer); timer = setTimeout(() => push(), 1200); }

  async function finishOnboarding(signature) {
    return push({ onboarded: true, signature, username: U.S.username || null });
  }
  async function usernameFree(u) {
    if (MOCK) return !Object.values(mk.db.profiles).some(p => (p.username || '').toLowerCase() === u.toLowerCase());
    const { data, error } = await sb.rpc('hm_username_free', { u });
    return error ? true : !!data;
  }
  async function leaderboard() {
    if (MOCK) return Object.values(mk.db.profiles).filter(p => p.username && p.onboarded).map(p => ({ username: p.username, streak: p.streak, xp: p.xp })).sort((a, b) => b.streak - a.streak || b.xp - a.xp);
    const { data, error } = await sb.rpc('hm_leaderboard', { lim: 50 });
    return error ? [] : data;
  }

  window.addEventListener('pagehide', () => { if (timer) { clearTimeout(timer); push(); } });
  window.Cloud = { init, signUp, signIn, signOut, resetPass, load, push, queue, finishOnboarding, usernameFree, leaderboard, get user() { return user; }, MOCK };
})();
