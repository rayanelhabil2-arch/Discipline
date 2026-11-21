/* ===========================================================
   TANK — la mascota de HARDMODE
   Un león con melena dorada y una cicatriz sobre el ojo.
   No te anima: te exige. Y cuando fallas, te espera.

   Uso:
     const m = Mascot.mount(elemento, { size: 180 });
     m.mood('happy');   // calm · happy · proud · alert · sleepy · sad · cool · focus · angry
     m.say('Texto', 3000);
     m.jump(); m.shake();

   Para usar tu propia mascota: js/config.js → MASCOT.image o MASCOT.images.
   =========================================================== */
(function () {
  const MOODS = ['calm', 'happy', 'proud', 'alert', 'sleepy', 'sad', 'cool', 'focus', 'angry'];
  let uid = 0;
  const FACE = '#d9a764', FACE2 = '#b7843f', MUZ = '#f4e2bf', BROW = '#6e4316', INK = '#1a0f08';
  const IRIS = '#f2a81d', MOUTH = '#3a1010';
  const CX = 120, CY = 132;

  // ---------- Melena: mechones en punta, generados en anillos ----------
  const rad = d => d * Math.PI / 180;
  const pt = (a, r) => [CX + Math.cos(rad(a)) * r, CY + Math.sin(rad(a)) * r];
  const f = n => n.toFixed(1);
  // Más larga abajo (barba) y a los lados, más corta arriba
  const reach = a => 90 + 28 * Math.max(0, Math.sin(rad(a))) + 10 * Math.abs(Math.cos(rad(a)));
  function lock(a, r0, r1, w, fill, curl) {
    const [b1x, b1y] = pt(a - w, r0), [b2x, b2y] = pt(a + w, r0), [tx, ty] = pt(a + curl, r1);
    const [c1x, c1y] = pt(a - w * .2 + curl * .2, (r0 + r1) / 2), [c2x, c2y] = pt(a + w * 1.1, (r0 + r1) / 2 + 4);
    return `<path d="M${f(b1x)} ${f(b1y)} Q${f(c1x)} ${f(c1y)} ${f(tx)} ${f(ty)} Q${f(c2x)} ${f(c2y)} ${f(b2x)} ${f(b2y)} Z" fill="${fill}"/>`;
  }
  function strand(a, r0, r1, curl) {
    const [x0, y0] = pt(a, r0), [x1, y1] = pt(a + curl * .8, r1), [cx, cy] = pt(a + curl * .1, (r0 + r1) / 2);
    return `<path d="M${f(x0)} ${f(y0)} Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}"/>`;
  }
  // Los mechones caen hacia abajo a los dos lados (simétrico)
  const sw = a => 26 * Math.cos(rad(a));
  const MANE = (() => {
    let back = '', mid = '', front = '', lines = '';
    for (let k = 0; k < 15; k++) { const a = k * 24 + 6; back += lock(a, 56, reach(a) + 8, 17, '#7a4a15', sw(a)); }
    for (let k = 0; k < 15; k++) { const a = k * 24 + 18; mid += lock(a, 54, reach(a) - 2, 16, `url(#mn${'{ID}'})`, sw(a)); lines += strand(a + 3, 62, reach(a) - 16, sw(a)) + strand(a - 5, 60, reach(a) - 24, sw(a) * .8); }
    for (let k = 0; k < 12; k++) { const a = k * 30 + 2; front += lock(a, 50, reach(a) - 30, 15, '#e4ae52', sw(a) * .9); }
    return `<g class="m-mane">${back}${mid}<g stroke="#f6cf80" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".55">${lines}</g>${front}</g>`;
  })();

  function face(mood) {
    const eye = (x, y, s) => { s = (s || 1) * 1.15; return `<g class="m-eyes"><path d="M${x - 11 * s} ${y + 1} Q${x} ${y - 9 * s} ${x + 11 * s} ${y - 1} Q${x} ${y + 8 * s} ${x - 11 * s} ${y + 1} Z" fill="${IRIS}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><g class="m-pupil"><circle cx="${x}" cy="${y}" r="${3.8 * s}" fill="${INK}"/><circle cx="${x + 1.6}" cy="${y - 1.8}" r="1.3" fill="#fff"/></g></g>`; };
    // párpado: tapa la parte de arriba del ojo (mirada dura)
    const lid = (x, y, tilt) => `<path d="M${x - 13} ${y - 2 + tilt} L${x + 13} ${y - 2 - tilt} L${x + 13} ${y - 13} L${x - 13} ${y - 13} Z" fill="${FACE}"/>`;
    const brow = (x1, y1, x2, y2, w) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${BROW}" stroke-width="${w || 5.5}" stroke-linecap="round"/>`;
    const arc = (x, y, up) => `<path d="M${x - 10} ${y} Q${x} ${y + (up ? -9 : 6)} ${x + 10} ${y}" stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
    const closed = `<path d="M106 180 Q113 186 120 180 Q127 186 134 180" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    const grin = `<path d="M102 178 Q120 200 138 178 Q120 186 102 178 Z" fill="${MOUTH}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M106 180 l3 7 l3 -6 Z M128 180 l3 6 l3 -7 Z" fill="#fff"/>`;
    // rugido: boca abierta con colmillos, como en la imagen de referencia
    const roar = `<path d="M98 176 Q120 170 142 176 Q144 196 120 204 Q96 196 98 176 Z" fill="${MOUTH}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="M108 194 Q120 200 132 194 Q120 190 108 194 Z" fill="#c9474a"/><path d="M102 177 l4 11 l4 -10 Z M130 177 l4 10 l4 -11 Z" fill="#fff" stroke="#e6dccb" stroke-width=".6"/><path d="M106 200 l3 -6 l3 6 Z M128 200 l3 -6 l3 6 Z" fill="#fff"/>`;
    let eyes = '', brows = '', mouth = '', extra = '';
    switch (mood) {
      case 'happy':
        eyes = arc(98, 124, true) + arc(142, 124, true);
        brows = brow(86, 106, 108, 104) + brow(132, 104, 154, 106);
        mouth = grin; break;
      case 'proud':
        eyes = arc(98, 123, false) + arc(142, 123, false);
        brows = brow(86, 104, 108, 100) + brow(132, 100, 154, 104);
        mouth = closed; break;
      case 'alert':
        eyes = eye(98, 124, 1.15) + eye(142, 124, 1.15);
        brows = brow(86, 100, 108, 104) + brow(132, 104, 154, 100);
        mouth = `<ellipse cx="120" cy="184" rx="8" ry="7" fill="${MOUTH}" stroke="${INK}" stroke-width="2.6"/>`; break;
      case 'sleepy':
        eyes = `<path d="M88 125 H108 M132 125 H152" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>`;
        brows = brow(86, 112, 108, 112) + brow(132, 112, 154, 112);
        mouth = closed;
        extra = `<g class="m-zz" fill="#ff2a1f" font-family="Anton,Impact,sans-serif"><text x="186" y="56" font-size="20">Z</text><text x="202" y="40" font-size="14">Z</text></g>`; break;
      case 'sad':
        eyes = eye(98, 127) + eye(142, 127);
        brows = brow(86, 112, 108, 105) + brow(132, 105, 154, 112);
        mouth = `<path d="M106 186 Q120 176 134 186" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
        extra = `<path d="M150 136 q4 8 0 12 q-4 -4 0 -12z" fill="#7cc4ff"/>`; break;
      case 'cool':
        eyes = `<path d="M80 114 H160 V120 Q158 140 141 140 Q125 140 122 124 H118 Q115 140 99 140 Q82 140 80 120 Z" fill="#0a0a0a"/><path d="M86 120 L98 120 M128 120 L140 120" stroke="#ff2a1f" stroke-width="2.4" stroke-linecap="round"/>`;
        brows = brow(86, 104, 108, 106) + brow(132, 106, 154, 104);
        mouth = closed; break;
      case 'focus':
        eyes = eye(98, 125, .9) + eye(142, 125, .9) + lid(98, 125, 1) + lid(142, 125, -1);
        brows = brow(86, 108, 108, 113) + brow(132, 113, 154, 108);
        mouth = closed;
        extra = `<path class="m-sweat" d="M76 104 q6 10 0 15 q-6 -5 0 -15z" fill="#7cc4ff"/>`; break;
      case 'angry':
        eyes = eye(98, 126) + eye(142, 126) + lid(98, 126, 3) + lid(142, 126, -3);
        brows = brow(84, 102, 110, 115, 6.5) + brow(130, 115, 156, 102, 6.5);
        mouth = roar; break;
      default: // calm: mirada de determinación
        eyes = eye(98, 125) + eye(142, 125) + lid(98, 125, 1) + lid(142, 125, -1);
        brows = brow(86, 109, 109, 113) + brow(131, 113, 154, 109);
        mouth = closed;
    }
    return extra + brows + eyes + mouth;
  }

  function svg(mood, id) {
    return `
<svg class="m-svg" viewBox="0 0 240 262" aria-hidden="true">
  <defs>
    <radialGradient id="mn${id}" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#f0c165"/><stop offset=".7" stop-color="#cf8f2f"/><stop offset="1" stop-color="#9c6220"/></radialGradient>
    <radialGradient id="fc${id}" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#ebc184"/><stop offset=".7" stop-color="${FACE}"/><stop offset="1" stop-color="${FACE2}"/></radialGradient>
  </defs>
  <ellipse class="m-shadow" cx="120" cy="256" rx="70" ry="5" fill="#000" opacity=".55"/>
  <g class="m-head">
    ${MANE.split('{ID}').join(id)}
    <!-- orejas -->
    <g><circle cx="80" cy="80" r="15" fill="${FACE2}"/><circle cx="81" cy="82" r="8" fill="#5a3410"/><circle cx="160" cy="80" r="15" fill="${FACE2}"/><circle cx="159" cy="82" r="8" fill="#5a3410"/></g>
    <!-- cara -->
    <path d="M68 116 C68 80 92 64 120 64 C148 64 172 80 172 116 C172 146 162 170 150 187 C141 200 131 207 120 207 C109 207 99 200 90 187 C78 170 68 146 68 116 Z" fill="url(#fc${id})"/>
    <!-- ceño y frente -->
    <g stroke="${FACE2}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".9"><path d="M120 78 V138"/><path d="M110 86 Q114 100 112 116"/><path d="M130 86 Q126 100 128 116"/><path d="M84 138 Q90 150 88 162"/><path d="M156 138 Q150 150 152 162"/></g>
    <!-- hocico -->
    <ellipse cx="106" cy="166" rx="18" ry="14" fill="${MUZ}"/><ellipse cx="134" cy="166" rx="18" ry="14" fill="${MUZ}"/>
    <path d="M104 186 Q120 214 136 186 Q120 194 104 186 Z" fill="#efe0c4"/>
    <g fill="#8d6538" opacity=".7"><circle cx="98" cy="164" r="1.4"/><circle cx="104" cy="170" r="1.4"/><circle cx="94" cy="170" r="1.4"/><circle cx="142" cy="164" r="1.4"/><circle cx="136" cy="170" r="1.4"/><circle cx="146" cy="170" r="1.4"/></g>
    <g stroke="#f7efe0" stroke-width="1" opacity=".7" stroke-linecap="round"><path d="M88 166 L58 160 M88 170 L56 172 M152 166 L182 160 M152 170 L184 172"/></g>
    <path d="M120 156 V172" stroke="${INK}" stroke-width="2.2"/>
    <path d="M105 146 Q120 140 135 146 Q131 157 120 161 Q109 157 105 146 Z" fill="#6e3b2c" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <ellipse cx="114" cy="147" rx="4" ry="1.8" fill="#a7675a"/>
    <g class="m-face">${face(mood)}</g>
    <!-- cicatriz sobre el ojo derecho -->
    <g class="m-scar" stroke="#d9574a" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M152 92 L145 112"/><path d="M150 135 L155 152"/><path d="M144 98 L153 102 M142 105 L151 109 M148 142 L157 140" stroke-width="1.6"/></g>
  </g>
</svg>`;
  }

  function mount(el, opts) {
    opts = opts || {};
    const id = ++uid;
    const cfg = (window.HM_CONFIG && window.HM_CONFIG.MASCOT) || {};
    let mood = opts.mood || 'calm';
    el.classList.add('mascot');
    el.style.setProperty('--m-size', (opts.size || 160) + 'px');
    el.innerHTML = `<div class="m-wrap"></div><div class="m-bubble" role="status"></div>`;
    const wrap = el.querySelector('.m-wrap'), bubble = el.querySelector('.m-bubble');
    const custom = cfg.images || cfg.image;
    function render() {
      if (custom) {
        const src = (cfg.images && (cfg.images[mood] || cfg.images.calm)) || cfg.image;
        wrap.innerHTML = `<img class="m-img" src="${src}" alt="${cfg.name || 'Mascota'}">`;
      } else wrap.innerHTML = svg(mood, id);
      el.dataset.mood = mood;
    }
    render();
    function look(e) {
      const p = e.touches ? e.touches[0] : e, r = el.getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, (p.clientX - (r.left + r.width / 2)) / 260));
      const dy = Math.max(-1, Math.min(1, (p.clientY - (r.top + r.height / 2.4)) / 260));
      el.style.setProperty('--lx', (dx * 2.2).toFixed(2) + 'px');
      el.style.setProperty('--ly', (dy * 1.6).toFixed(2) + 'px');
      el.style.setProperty('--tilt', (dx * 4).toFixed(2) + 'deg');
    }
    window.addEventListener('pointermove', look, { passive: true });
    window.addEventListener('touchstart', look, { passive: true });
    let alive = true;
    (function blink() { if (!alive || !el.isConnected && uid > id + 50) return; el.classList.add('blink'); setTimeout(() => el.classList.remove('blink'), 130); setTimeout(blink, 2600 + Math.random() * 3000); })();
    let bt;
    const api = {
      el,
      mood(m) { if (MOODS.includes(m) && m !== mood) { mood = m; render(); } return api; },
      get current() { return mood; },
      say(text, ms) { clearTimeout(bt); bubble.textContent = text; bubble.classList.add('on'); if (ms !== 0) bt = setTimeout(() => bubble.classList.remove('on'), ms || 3200); return api; },
      hush() { bubble.classList.remove('on'); return api; },
      jump() { el.classList.remove('jump'); void el.offsetWidth; el.classList.add('jump'); return api; },
      shake() { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); return api; },
      // Rugido: retrocede, embiste, ondas de choque, brillo rojo, sonido y vibración
      roar(o) {
        o = o || {}; if (el.classList.contains('roar')) return api;
        const before = mood; if (mood !== 'angry') { mood = 'angry'; render(); }
        el.classList.remove('jump', 'shake'); el.classList.add('roar'); if (o.big) el.classList.add('big');
        ['w1', 'w2', 'w3'].slice(0, o.big ? 3 : 2).forEach((w, i) => { const r = document.createElement('i'); r.className = 'm-wave ' + w; r.style.animationDelay = (0.22 + i * 0.14) + 's'; el.appendChild(r); setTimeout(() => r.remove(), 1700); });
        if (window.FX) { FX.roar({ big: o.big }); if (o.big) setTimeout(() => FX.quake(), 230); }
        try { navigator.vibrate && navigator.vibrate(o.big ? [30, 40, 120, 30, 60] : [20, 30, 50]); } catch (e) { }
        setTimeout(() => { el.classList.remove('roar', 'big'); if (o.keep !== true && before !== mood) { mood = before; render(); } }, o.big ? 1500 : 1000);
        return api;
      },
      destroy() { alive = false; window.removeEventListener('pointermove', look); window.removeEventListener('touchstart', look); }
    };
    el.addEventListener('click', () => { if (opts.onTap) opts.onTap(api); });
    return api;
  }
  window.Mascot = { mount, MOODS, svg };
})();
