/* ===========================================================
   TANK — la mascota de HARDMODE
   Un bulldog con gorro negro, cicatriz en la ceja y sudadera.
   No te anima: te exige.

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
  const FUR = '#c99a6b', FUR2 = '#a87a4f', FUR3 = '#7a5536', MUZ = '#f1e6d6', INK = '#141414';

  function face(mood) {
    const eye = (x, y, r) => `<g class="m-eyes"><circle cx="${x}" cy="${y}" r="${r || 7.5}" fill="${INK}"/><g class="m-pupil"><circle cx="${x + 2.4}" cy="${y - 2.6}" r="2.4" fill="#fff"/></g></g>`;
    const lidHalf = (x, y, s) => `<path d="M${x - 11} ${y - 1 + (s || 0)} L${x + 11} ${y - 4 - (s || 0)} L${x + 11} ${y - 14} L${x - 11} ${y - 14} Z" fill="${FUR}"/>`;
    const brow = (x1, y1, x2, y2, w) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${FUR3}" stroke-width="${w || 6}" stroke-linecap="round"/>`;
    const arc = (x, y, up) => `<path d="M${x - 9} ${y} Q${x} ${y + (up ? -8 : 6)} ${x + 9} ${y}" stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
    const fangs = `<path d="M104 176 l3 -9 l3 9 Z M130 176 l3 -9 l3 9 Z" fill="#fff" stroke="#d9d0c2" stroke-width=".8"/>`;
    const jaw = (open) => `<path d="M96 170 Q120 ${open ? 196 : 186} 144 170" fill="#3a1414" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>${open ? '<path d="M108 182 Q120 192 132 182" fill="#ff5a5a"/>' : ''}`;
    let eyes = '', brows = '', mouth = '', extra = '';
    switch (mood) {
      case 'happy':
        eyes = arc(94, 128, true) + arc(146, 128, true);
        brows = brow(82, 110, 104, 108) + brow(136, 108, 158, 110);
        mouth = jaw(true) + fangs; break;
      case 'proud':
        eyes = arc(94, 127, false) + arc(146, 127, false);
        brows = brow(82, 108, 104, 104) + brow(136, 104, 158, 108);
        mouth = jaw(false) + fangs; break;
      case 'alert':
        eyes = eye(94, 127, 9) + eye(146, 127, 9);
        brows = brow(82, 104, 104, 108) + brow(136, 108, 158, 104);
        mouth = `<ellipse cx="120" cy="178" rx="9" ry="8" fill="#3a1414" stroke="${INK}" stroke-width="3"/>`; break;
      case 'sleepy':
        eyes = `<path d="M84 128 H104 M136 128 H156" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>`;
        brows = brow(82, 114, 104, 114) + brow(136, 114, 158, 114);
        mouth = jaw(false);
        extra = `<g class="m-zz" fill="#ff2a1f" font-family="Anton,Impact,sans-serif"><text x="176" y="78" font-size="18">Z</text><text x="190" y="62" font-size="13">Z</text></g>`; break;
      case 'sad':
        eyes = eye(94, 130) + eye(146, 130);
        brows = brow(82, 114, 104, 108) + brow(136, 108, 158, 114);
        mouth = `<path d="M100 180 Q120 168 140 180" stroke="${INK}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
        extra = `<path d="M152 140 q4 8 0 12 q-4 -4 0 -12z" fill="#7cc4ff"/>`; break;
      case 'cool':
        eyes = `<path d="M74 118 H166 V124 Q164 144 146 144 Q128 144 124 128 H116 Q112 144 94 144 Q76 144 74 124 Z" fill="#0a0a0a"/><path d="M80 124 L92 124" stroke="#ff2a1f" stroke-width="2.4" stroke-linecap="round"/><path d="M132 124 L144 124" stroke="#ff2a1f" stroke-width="2.4" stroke-linecap="round"/>`;
        brows = brow(82, 108, 104, 110) + brow(136, 110, 158, 108);
        mouth = jaw(false) + fangs; break;
      case 'focus':
        eyes = arc(94, 128, false) + arc(146, 128, false);
        brows = brow(82, 112, 104, 116) + brow(136, 116, 158, 112);
        mouth = jaw(false) + fangs;
        extra = `<path class="m-sweat" d="M70 108 q6 10 0 15 q-6 -5 0 -15z" fill="#7cc4ff"/>`; break;
      case 'angry':
        eyes = eye(94, 130, 7) + eye(146, 130, 7) + lidHalf(94, 130, 2) + `<path d="M135 128 L157 124 L157 116 L135 116 Z" fill="${FUR}"/>`;
        brows = brow(80, 106, 106, 118, 7) + brow(134, 118, 160, 106, 7);
        mouth = jaw(false) + fangs; break;
      default: // calm: mirada de determinación
        eyes = eye(94, 129) + eye(146, 129) + lidHalf(94, 129) + `<path d="M135 125 L157 126 L157 115 L135 115 Z" fill="${FUR}"/>`;
        brows = brow(82, 112, 106, 116) + brow(134, 116, 158, 112);
        mouth = jaw(false) + fangs;
    }
    return extra + brows + eyes + mouth;
  }

  function svg(mood, id) {
    return `
<svg class="m-svg" viewBox="0 0 240 262" aria-hidden="true">
  <defs>
    <radialGradient id="fu${id}" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#ddb488"/><stop offset=".65" stop-color="${FUR}"/><stop offset="1" stop-color="${FUR2}"/></radialGradient>
    <linearGradient id="hd${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262626"/><stop offset="1" stop-color="#0b0b0b"/></linearGradient>
    <pattern id="kn${id}" width="7" height="10" patternUnits="userSpaceOnUse"><rect width="7" height="10" fill="#151515"/><path d="M0 0 L3.5 5 L7 0 M0 5 L3.5 10 L7 5" stroke="#262626" stroke-width="1.4" fill="none"/></pattern>
  </defs>
  <ellipse class="m-shadow" cx="120" cy="256" rx="76" ry="6" fill="#000" opacity=".55"/>
  <g class="m-body">
    <path d="M22 262 C22 210 60 186 120 186 C180 186 218 210 218 262 Z" fill="url(#hd${id})" stroke="#333" stroke-width="1.5"/>
    <path d="M70 196 C88 218 152 218 170 196" stroke="#3a3a3a" stroke-width="3" fill="none"/>
    <path d="M102 204 L99 238" stroke="#ff2a1f" stroke-width="3" stroke-linecap="round"/><path d="M138 204 L141 238" stroke="#ff2a1f" stroke-width="3" stroke-linecap="round"/>
    <rect x="95.5" y="236" width="7" height="8" rx="2" fill="#ddd"/><rect x="137.5" y="236" width="7" height="8" rx="2" fill="#ddd"/>
    <!-- emblema: chevrons -->
    <g fill="none" stroke="#ff2a1f" stroke-width="3.5" stroke-linejoin="round"><path d="M110 232 L120 224 L130 232"/><path d="M110 242 L120 234 L130 242"/></g>
  </g>
  <g class="m-head">
    <!-- orejas -->
    <path d="M58 98 C40 92 34 112 48 124 C54 116 60 110 66 106 Z" fill="${FUR3}"/>
    <path d="M182 98 C200 92 206 112 192 124 C186 116 180 110 174 106 Z" fill="${FUR3}"/>
    <!-- cabeza ancha con papada -->
    <path d="M52 132 C50 92 82 74 120 74 C158 74 190 92 188 132 C188 172 164 196 120 196 C76 196 52 172 52 132 Z" fill="url(#fu${id})"/>
    <path d="M58 150 C62 178 86 194 120 194 C154 194 178 178 182 150 C170 170 150 178 120 178 C90 178 70 170 58 150 Z" fill="${FUR2}" opacity=".55"/>
    <!-- arrugas -->
    <g stroke="${FUR2}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".9"><path d="M104 100 Q120 94 136 100"/><path d="M110 92 Q120 88 130 92"/><path d="M68 140 Q74 150 70 160"/><path d="M172 140 Q166 150 170 160"/></g>
    <!-- hocico -->
    <path d="M86 160 C84 138 100 132 120 132 C140 132 156 138 154 160 C154 178 140 188 120 188 C100 188 86 178 86 160 Z" fill="${MUZ}"/>
    <path d="M120 140 V158" stroke="#d8c8b2" stroke-width="2"/>
    <path d="M106 141 C106 134 134 134 134 141 C134 150 126 155 120 156 C114 155 106 150 106 141 Z" fill="${INK}"/>
    <ellipse cx="114" cy="140" rx="3.5" ry="2" fill="#555"/>
    <g fill="#8b6a4a" opacity=".55"><circle cx="100" cy="162" r="1.5"/><circle cx="96" cy="168" r="1.5"/><circle cx="104" cy="168" r="1.5"/><circle cx="140" cy="162" r="1.5"/><circle cx="144" cy="168" r="1.5"/><circle cx="136" cy="168" r="1.5"/></g>
    <g class="m-face">${face(mood)}</g>
    <!-- cicatriz -->
    <g class="m-scar" stroke="#e7867b" stroke-width="2.6" stroke-linecap="round"><path d="M150 100 L140 122"/><path d="M141 106 L150 110 M139 113 L148 117" stroke-width="1.8"/></g>
    <!-- gorro de lana -->
    <g transform="translate(0 -13)"><path d="M60 104 C58 60 92 40 120 40 C148 40 182 60 180 104 Z" fill="url(#kn${id})"/>
    <rect x="55" y="94" width="130" height="20" rx="9" fill="#1d1d1d" stroke="#2c2c2c" stroke-width="1.2"/>
    <g stroke="#2c2c2c" stroke-width="2">${Array.from({ length: 16 }, (_, k) => `<path d="M${62 + k * 7.6} 96 V112"/>`).join('')}</g>
    <rect x="150" y="97" width="22" height="14" rx="2" fill="#ff2a1f"/><path d="M155 104 L161 100 L167 104 M155 108 L161 104 L167 108" stroke="#fff" stroke-width="1.6" fill="none"/></g>
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
      el.style.setProperty('--lx', (dx * 2.6).toFixed(2) + 'px');
      el.style.setProperty('--ly', (dy * 2.2).toFixed(2) + 'px');
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
      destroy() { alive = false; window.removeEventListener('pointermove', look); window.removeEventListener('touchstart', look); }
    };
    el.addEventListener('click', () => { if (opts.onTap) opts.onTap(api); });
    return api;
  }
  window.Mascot = { mount, MOODS };
})();
