/* HARDMODE · efectos: fondo vivo (brasas + parallax) y rugido sintetizado de TANK */
(function () {
  'use strict';
  const calm = () => document.documentElement.classList.contains('calm');

  /* ---------- Audio: el navegador solo deja sonar tras un toque ---------- */
  let ac = null;
  function ctx() {
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; }
    return ac;
  }
  const unlock = () => { ctx(); };
  ['pointerdown', 'touchstart', 'keydown'].forEach(ev => window.addEventListener(ev, unlock, { once: true, passive: true }));

  // Rugido: ruido grave filtrado (aliento) + dos dientes de sierra distorsionados con trémolo (gruñido)
  function roar(o) {
    o = o || {};
    const a = ctx(); if (!a || a.state !== 'running') return false;
    const big = !!o.big, dur = big ? 1.9 : 0.9, vol = big ? 0.55 : 0.3, t = a.currentTime + 0.02, sr = a.sampleRate;

    const out = a.createGain(); out.gain.value = 0; out.connect(a.destination);
    const comp = a.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 6; comp.connect(out);
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(vol, t + (big ? 0.18 : 0.08));
    out.gain.setValueAtTime(vol, t + dur * 0.55);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    // aliento: ruido marrón
    const n = Math.floor(sr * dur), buf = a.createBuffer(1, n, sr), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < n; i++) { last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04; d[i] = last * 3.2; }
    const noise = a.createBufferSource(); noise.buffer = buf;
    const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(260, t); bp.frequency.linearRampToValueAtTime(big ? 900 : 700, t + dur * 0.3); bp.frequency.exponentialRampToValueAtTime(180, t + dur);
    const ng = a.createGain(); ng.gain.value = 1.1;
    noise.connect(bp); bp.connect(ng); ng.connect(comp);

    // gruñido
    const shaper = a.createWaveShaper(), curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 4.5); }
    shaper.curve = curve;
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 3;
    lp.frequency.setValueAtTime(400, t); lp.frequency.linearRampToValueAtTime(big ? 1500 : 1100, t + dur * 0.28); lp.frequency.exponentialRampToValueAtTime(220, t + dur);
    const trem = a.createGain(); trem.gain.value = 0.55;
    const lfo = a.createOscillator(), lfoG = a.createGain(); lfo.frequency.value = big ? 27 : 32; lfoG.gain.value = 0.45; lfo.connect(lfoG); lfoG.connect(trem.gain);
    const g2 = a.createGain(); g2.gain.value = 0.32;
    trem.connect(shaper); shaper.connect(lp); lp.connect(g2); g2.connect(comp);
    const oscs = [55, 83, 111].map((f, i) => {
      const s = a.createOscillator(); s.type = i === 2 ? 'square' : 'sawtooth';
      s.frequency.setValueAtTime(f * 0.8, t);
      s.frequency.linearRampToValueAtTime(f * (big ? 1.35 : 1.2), t + dur * 0.3);
      s.frequency.exponentialRampToValueAtTime(f * 0.62, t + dur);
      s.detune.value = (Math.random() - 0.5) * 30;
      const sg = a.createGain(); sg.gain.value = i === 2 ? 0.25 : 0.5; s.connect(sg); sg.connect(trem);
      return s;
    });

    [noise, lfo, ...oscs].forEach(s => { s.start(t); s.stop(t + dur + 0.05); });
    return true;
  }

  /* ---------- Fondo: brasas que suben + parallax suave ---------- */
  function embers() {
    const cv = document.getElementById('embers'); if (!cv || !cv.getContext) return;
    const g = cv.getContext('2d'), DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0, H = 0, P = [], raf = 0, prev = 0, col = '255,90,40';
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
    function paintSprite() {
      const s = sprite.getContext('2d'), r = s.createRadialGradient(16, 16, 0, 16, 16, 16);
      r.addColorStop(0, `rgba(255,240,220,1)`); r.addColorStop(0.18, `rgba(${col},.95)`); r.addColorStop(0.5, `rgba(${col},.25)`); r.addColorStop(1, `rgba(${col},0)`);
      s.clearRect(0, 0, 32, 32); s.fillStyle = r; s.fillRect(0, 0, 32, 32);
    }
    function mode() {
      const b = document.body.classList, c = b.contains('good') ? '43,224,122' : b.contains('hazard') ? '255,200,40' : b.contains('alert') ? '255,60,30' : '255,90,40';
      if (c !== col) { col = c; paintSprite(); }
    }
    const spawn = (y) => ({ x: Math.random() * W, y: y == null ? H + 10 : y, s: 0.6 + Math.random() * 2.2, v: 10 + Math.random() * 28, ph: Math.random() * 6.28, sw: 6 + Math.random() * 18, f: Math.random() * 6.28 });
    function size() {
      W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      g.setTransform(DPR, 0, 0, DPR, 0, 0);
      const want = Math.round(Math.min(46, Math.max(18, W * H / 26000)));
      while (P.length < want) P.push(spawn(Math.random() * H)); P.length = want;
    }
    function frame(ts) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (ts - (prev || ts)) / 1000); prev = ts;
      g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
      for (const p of P) {
        p.y -= p.v * dt; p.ph += dt * 1.3; p.f += dt * (4 + p.s);
        if (p.y < -12) Object.assign(p, spawn());
        const life = Math.min(1, p.y / H * 1.6), a = Math.max(0, life) * (0.45 + 0.35 * Math.sin(p.f)), r = p.s * 5;
        g.globalAlpha = a; g.drawImage(sprite, p.x + Math.sin(p.ph) * p.sw - r / 2, p.y - r / 2, r, r);
      }
      g.globalAlpha = 1;
    }
    function start() { if (raf || calm() || document.hidden) return; prev = 0; raf = requestAnimationFrame(frame); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    paintSprite(); size(); start();
    addEventListener('resize', size);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    new MutationObserver(() => { mode(); calm() ? (stop(), g.clearRect(0, 0, W, H)) : start(); })
      .observe(document.body, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(() => { calm() ? (stop(), g.clearRect(0, 0, W, H)) : start(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  function parallax() {
    const par = document.querySelector('#bg .par'); if (!par) return;
    let tx = 0, ty = 0, pend = false;
    function move(e) {
      if (calm()) return;
      const p = e.touches ? e.touches[0] : e;
      tx = (p.clientX / innerWidth - 0.5) * -26; ty = (p.clientY / innerHeight - 0.5) * -20;
      if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; par.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0)`; }); }
    }
    addEventListener('pointermove', move, { passive: true });
    addEventListener('touchmove', move, { passive: true });
  }

  // Sacudida de pantalla
  function quake(ms) {
    if (calm()) return;
    const app = document.getElementById('app'); if (!app) return;
    app.classList.remove('quake'); void app.offsetWidth; app.classList.add('quake');
    setTimeout(() => app.classList.remove('quake'), ms || 650);
  }

  function init() { embers(); parallax(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.FX = { roar, quake, unlock, get audioReady() { return !!ac && ac.state === 'running'; } };
})();
