/* ===========================================================
   MARCO — la mascota de STOA
   Un busto de mármol de Marco Aurelio, en versión mini, con sudadera negra.
   Estoico por dentro, moderno por fuera.

   Uso:
     const m = Mascot.mount(elemento, { size: 180 });
     m.mood('happy');          // calm · happy · proud · alert · sleepy · sad · cool · focus
     m.say('Texto', 3000);     // bocadillo (opcional)
     m.jump();                 // pequeño salto de alegría

   Para usar tu propia mascota (por ejemplo, una hecha con ChatGPT):
     edita js/config.js → MASCOT.image o MASCOT.images.
   =========================================================== */
(function () {
  const MOODS = ['calm', 'happy', 'proud', 'alert', 'sleepy', 'sad', 'cool', 'focus'];
  let uid = 0;

  // Hojas de laurel colocadas sobre un arco alrededor de la cabeza
  function laurel(cx, cy, r, from, to, n, flip) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (from + (to - from) * (i / (n - 1))) * Math.PI / 180;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      const rot = (a * 180 / Math.PI) + 90 + (flip ? -32 : 32);
      const sz = 1 - Math.abs(i - (n - 1) / 2) / n * 0.5;
      s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(9.5 * sz).toFixed(1)}" ry="${(4.2 * sz).toFixed(1)}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" />`;
    }
    return s;
  }
  // Rizos (pelo y barba)
  function curls(cx, cy, r, from, to, n, cr) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (from + (to - from) * (i / (n - 1))) * Math.PI / 180;
      s += `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${cr}" />`;
    }
    return s;
  }

  // Cara según el estado de ánimo
  function face(mood, id) {
    const pupil = (x, y) => `<g class="m-pupil"><ellipse cx="${x}" cy="${y}" rx="6" ry="7.6" fill="#17171b"/><circle cx="${x + 1.8}" cy="${y - 2.4}" r="1.7" fill="#fff"/></g>`;
    const lid = (x, y) => `<path d="M${x - 8} ${y - 3.5} Q${x} ${y - 7.5} ${x + 8} ${y - 3.5} L${x + 8} ${y - 10} L${x - 8} ${y - 10} Z" fill="url(#mb${id})"/><path d="M${x - 8} ${y - 3.5} Q${x} ${y - 7.5} ${x + 8} ${y - 3.5}" stroke="#a79e90" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    const brow = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#b3a998" stroke-width="4" stroke-linecap="round"/>`;
    const closed = (x, y, up) => `<path d="M${x - 7} ${y} Q${x} ${y + (up ? -6 : 5)} ${x + 7} ${y}" stroke="#2a2a30" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const blush = `<ellipse cx="88" cy="140" rx="8" ry="4.5" fill="#ff8a7a" opacity=".28"/><ellipse cx="152" cy="140" rx="8" ry="4.5" fill="#ff8a7a" opacity=".28"/>`;
    let eyes = '', brows = '', mouth = '', extra = '';
    switch (mood) {
      case 'happy':
        eyes = closed(100, 127, true) + closed(140, 127, true);
        brows = brow(91, 108, 107, 106) + brow(133, 106, 149, 108);
        mouth = `<path d="M110 156 Q120 166 130 156" stroke="#5a5048" stroke-width="3" fill="#7a3b33" stroke-linecap="round"/>`;
        extra = blush; break;
      case 'proud':
        eyes = closed(100, 126, false) + closed(140, 126, false);
        brows = brow(91, 106, 107, 103) + brow(133, 103, 149, 106);
        mouth = `<path d="M110 156 Q121 162 131 154" stroke="#5a5048" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        extra = blush; break;
      case 'alert':
        eyes = `<g class="m-eyes">${pupil(100, 126)}${pupil(140, 126)}</g>`;
        brows = brow(91, 104, 107, 107) + brow(133, 107, 149, 104);
        mouth = `<ellipse cx="120" cy="158" rx="5" ry="6" fill="#5a2f2a"/>`; break;
      case 'sleepy':
        eyes = `<path d="M93 127 L107 127 M133 127 L147 127" stroke="#2a2a30" stroke-width="3" stroke-linecap="round"/>`;
        brows = brow(91, 112, 107, 112) + brow(133, 112, 149, 112);
        mouth = `<path d="M114 157 Q120 160 126 157" stroke="#5a5048" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        extra = `<g class="m-zz" fill="#e8b04a" font-family="Cinzel,serif" font-weight="700"><text x="172" y="86" font-size="16">z</text><text x="184" y="70" font-size="12">z</text></g>`; break;
      case 'sad':
        eyes = `<g class="m-eyes">${pupil(100, 128)}${pupil(140, 128)}</g>`;
        brows = brow(91, 111, 106, 106) + brow(134, 106, 149, 111);
        mouth = `<path d="M111 160 Q120 153 129 160" stroke="#5a5048" stroke-width="3" fill="none" stroke-linecap="round"/>`; break;
      case 'cool':
        eyes = `<g><path d="M82 118 H158 V124 Q156 140 140 140 Q126 140 123 126 H117 Q114 140 100 140 Q84 140 82 124 Z" fill="#0b0b0d"/><path d="M88 122 L96 122" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/><path d="M128 122 L136 122" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/></g>`;
        brows = brow(91, 108, 107, 108) + brow(133, 108, 149, 108);
        mouth = `<path d="M110 156 Q122 162 132 152" stroke="#5a5048" stroke-width="3" fill="none" stroke-linecap="round"/>`; break;
      case 'focus':
        eyes = closed(100, 127, false) + closed(140, 127, false);
        brows = brow(91, 110, 107, 109) + brow(133, 109, 149, 110);
        mouth = `<path d="M114 157 L126 157" stroke="#5a5048" stroke-width="3" stroke-linecap="round"/>`; break;
      default: // calm: mirada serena, párpados a media altura
        eyes = `<g class="m-eyes">${pupil(100, 127)}${pupil(140, 127)}</g>${lid(100, 127)}${lid(140, 127)}`;
        brows = brow(91, 109, 107, 108) + brow(133, 108, 149, 109);
        mouth = `<path d="M113 157 Q120 160 127 157" stroke="#5a5048" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
    return `${extra}${brows}${eyes}<path d="M103 150 Q111 144 120 149 Q129 144 137 150" stroke="#cfc6b8" stroke-width="5" fill="none" stroke-linecap="round"/>${mouth}`;
  }

  function svg(mood, id) {
    return `
<svg class="m-svg" viewBox="0 0 240 262" aria-hidden="true">
  <defs>
    <radialGradient id="mb${id}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#fbf8f3"/><stop offset=".6" stop-color="#e7e1d7"/><stop offset="1" stop-color="#c9c0b2"/></radialGradient>
    <linearGradient id="hd${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26262b"/><stop offset="1" stop-color="#0c0c0e"/></linearGradient>
    <linearGradient id="gd${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d27a"/><stop offset=".5" stop-color="#e2a93b"/><stop offset="1" stop-color="#a8761f"/></linearGradient>
    <clipPath id="hc${id}"><ellipse cx="120" cy="124" rx="52" ry="56"/></clipPath>
  </defs>
  <ellipse class="m-shadow" cx="120" cy="256" rx="70" ry="6" fill="#000" opacity=".45"/>
  <g class="m-body">
    <!-- capucha y sudadera -->
    <path d="M58 204 C44 150 66 86 120 82 C174 86 196 150 182 204 Z" fill="url(#hd${id})" stroke="#3b3b42" stroke-width="1.5"/>
    <path d="M26 262 C26 214 60 190 120 190 C180 190 214 214 214 262 Z" fill="url(#hd${id})" stroke="#3b3b42" stroke-width="1.5"/>
    <path d="M78 196 C92 214 148 214 162 196" stroke="#34343a" stroke-width="3" fill="none"/>
    <path d="M104 204 L101 236" stroke="#9a9aa2" stroke-width="2.5" stroke-linecap="round"/><rect x="98.5" y="235" width="5" height="9" rx="2" fill="#e2a93b"/>
    <path d="M136 204 L139 236" stroke="#9a9aa2" stroke-width="2.5" stroke-linecap="round"/><rect x="136.5" y="235" width="5" height="9" rx="2" fill="#e2a93b"/>
    <!-- emblema: columna -->
    <g transform="translate(120 238)" fill="url(#gd${id})" opacity=".95"><rect x="-9" y="-10" width="18" height="3" rx="1"/><rect x="-6" y="-6.5" width="3" height="11"/><rect x="-1.5" y="-6.5" width="3" height="11"/><rect x="3" y="-6.5" width="3" height="11"/><rect x="-10" y="5" width="20" height="3" rx="1"/></g>
    <!-- cuello -->
    <path d="M106 168 L106 196 Q120 204 134 196 L134 168 Z" fill="#d2cabd"/>
  </g>
  <g class="m-head">
    <ellipse cx="69" cy="132" rx="8" ry="11" fill="#ddd6ca"/><ellipse cx="171" cy="132" rx="8" ry="11" fill="#ddd6ca"/>
    <ellipse cx="120" cy="124" rx="52" ry="56" fill="url(#mb${id})"/>
    <g clip-path="url(#hc${id})" stroke="#bfb5a5" stroke-width=".8" fill="none" opacity=".55">
      <path d="M150 74 C140 96 158 104 146 128"/><path d="M84 92 C96 100 88 112 98 118"/><path d="M160 140 C150 146 156 160 146 168"/>
    </g>
    <!-- pelo rizado -->
    <g fill="#e9e3d9" stroke="#c7bdae" stroke-width="1.2">${curls(120, 116, 50, 192, 348, 14, 11)}${curls(120, 104, 44, 232, 308, 5, 9)}</g>
    <!-- barba -->
    <path d="M70 130 C72 176 98 190 120 190 C142 190 168 176 170 130 C160 150 142 158 120 158 C98 158 80 150 70 130 Z" fill="#e4ddd1"/>
    <g fill="#e4ddd1" stroke="#c7bdae" stroke-width="1.1">${curls(120, 140, 46, 22, 158, 11, 8)}</g>
    <!-- laurel dorado -->
    <g class="m-laurel" fill="url(#gd${id})" stroke="#8e6418" stroke-width=".6">
      ${laurel(120, 118, 58, 178, 262, 8, false)}${laurel(120, 118, 58, 362, 278, 8, true)}
    </g>
    <circle cx="120" cy="61" r="3.5" fill="url(#gd${id})"/>
    <g class="m-face">${face(mood, id)}</g>
  </g>
</svg>`;
  }

  function mount(el, opts) {
    opts = opts || {};
    const id = ++uid;
    const cfg = (window.STOA_CONFIG && window.STOA_CONFIG.MASCOT) || {};
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

    // Los ojos siguen al dedo / ratón
    function look(e) {
      const p = e.touches ? e.touches[0] : e;
      const r = el.getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, (p.clientX - (r.left + r.width / 2)) / 260));
      const dy = Math.max(-1, Math.min(1, (p.clientY - (r.top + r.height / 2.4)) / 260));
      el.style.setProperty('--lx', (dx * 3.2).toFixed(2) + 'px');
      el.style.setProperty('--ly', (dy * 2.6).toFixed(2) + 'px');
      el.style.setProperty('--tilt', (dx * 4).toFixed(2) + 'deg');
    }
    window.addEventListener('pointermove', look, { passive: true });
    window.addEventListener('touchstart', look, { passive: true });

    // Parpadeo natural
    let alive = true;
    (function blink() {
      if (!alive) return;
      el.classList.add('blink');
      setTimeout(() => el.classList.remove('blink'), 140);
      setTimeout(blink, 2400 + Math.random() * 3200);
    })();

    let bt;
    const api = {
      el,
      mood(m) { if (MOODS.includes(m) && m !== mood) { mood = m; render(); } return api; },
      get current() { return mood; },
      say(text, ms) {
        clearTimeout(bt);
        bubble.textContent = text;
        bubble.classList.add('on');
        if (ms !== 0) bt = setTimeout(() => bubble.classList.remove('on'), ms || 3200);
        return api;
      },
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
