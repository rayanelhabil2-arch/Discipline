/* La raya: una línea de polvo blanco dibujada grano a grano sobre un espejo negro,
   con una tarjeta que la va formando. Todo en canvas, sin imágenes. */
(function () {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function draw(cv, o) {
    o = o || {};
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2.5, devicePixelRatio || 1);
    const W = cv.clientWidth || 360, Hh = cv.clientHeight || 150;
    cv.width = W * dpr; cv.height = Hh * dpr;
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);

    // Capa donde se acumulan los granos
    const layer = document.createElement('canvas'); layer.width = cv.width; layer.height = cv.height;
    const lc = layer.getContext('2d'); lc.scale(dpr, dpr);

    // Geometría de la línea
    const x0 = W * .1, x1 = W * .9, cy = Hh * .5, maxW = Math.max(7, W * .022);
    const ph = [rnd(0, 6), rnd(0, 6), rnd(0, 6)];
    const yAt = t => cy + Math.sin(t * 3.1 + ph[0]) * 1.6;
    const wAt = t => {
      const taper = Math.pow(Math.min(1, t / .07, (1 - t) / .05), .55);
      const n = 1 + .18 * Math.sin(t * 23 + ph[1]) + .12 * Math.sin(t * 57 + ph[2]) + .08 * Math.sin(t * 131);
      return maxW * taper * n;
    };

    // Granos
    const G = [];
    const N = Math.round(W * 46);
    for (let k = 0; k < N; k++) {
      const t = Math.random(), w = wAt(t);
      let off = gauss() * w / 3; off = Math.max(-w / 1.5, Math.min(w / 1.5, off));
      const l = 222 + Math.random() * 33;
      G.push({ t, x: x0 + (x1 - x0) * t + rnd(-.6, .6), y: yAt(t) + off, r: .22 + Math.pow(Math.random(), 4) * 1.0, c: `rgba(${l | 0},${l | 0},${(l - rnd(0, 8)) | 0},${rnd(.55, 1).toFixed(2)})` });
    }
    // Granos sueltos fuera de la línea
    for (let k = 0; k < N * .012; k++) {
      const t = Math.random(), w = wAt(t) + 3;
      G.push({ t, x: x0 + (x1 - x0) * t + rnd(-4, 4), y: yAt(t) + gauss() * w * 1.2, r: rnd(.25, .7), c: `rgba(240,240,236,${rnd(.2, .5).toFixed(2)})` });
    }
    // Cristales que brillan
    const X = [];
    for (let k = 0; k < 34; k++) {
      const t = rnd(.06, .94), w = wAt(t);
      const g = { t, x: x0 + (x1 - x0) * t, y: yAt(t) + gauss() * w / 3.2, r: rnd(.8, 1.4), c: 'rgba(255,255,255,1)', s: rnd(0, 6) };
      G.push(g); X.push(g);
    }
    G.sort((a, b) => a.t - b.t);

    function surface() {
      ctx.clearRect(0, 0, W, Hh);
      // espejo negro
      const r = 14, sx = 0, sy = 6, sw = W, sh = Hh - 12;
      ctx.save();
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(sx, sy, sw, sh, r) : ctx.rect(sx, sy, sw, sh);
      const bg = ctx.createLinearGradient(0, sy, 0, sy + sh); bg.addColorStop(0, '#141416'); bg.addColorStop(.5, '#060607'); bg.addColorStop(1, '#0d0d0f');
      ctx.fillStyle = bg; ctx.fill();
      ctx.clip();
      const gl = ctx.createLinearGradient(0, 0, W, Hh); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(.42, 'rgba(255,255,255,0)'); gl.addColorStop(.5, 'rgba(255,255,255,.06)'); gl.addColorStop(.58, 'rgba(255,255,255,0)');
      ctx.fillStyle = gl; ctx.fillRect(0, 0, W, Hh);
      ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(sx + .5, sy + .5, sw - 1, sh - 1, r) : ctx.rect(sx, sy, sw, sh);
      ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    }

    let gi = 0;
    function addGrains(upto) {
      while (gi < G.length && G[gi].t <= upto) {
        const g = G[gi++];
        // sombra diminuta del grano
        if (g.r > .7) { lc.fillStyle = 'rgba(0,0,0,.22)'; lc.beginPath(); lc.arc(g.x + .3, g.y + .5, g.r, 0, 6.283); lc.fill(); }
        lc.fillStyle = g.c; lc.beginPath(); lc.arc(g.x, g.y, g.r, 0, 6.283); lc.fill();
      }
    }
    function body(upto) {
      // volumen suave bajo los granos y su reflejo en el espejo
      ctx.save();
      for (let t = 0; t <= upto; t += .004) {
        const x = x0 + (x1 - x0) * t, y = yAt(t), w = wAt(t);
        ctx.fillStyle = 'rgba(255,255,255,.012)'; ctx.beginPath(); ctx.ellipse(x, y + w * .9, w * .6, w * .25, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(238,238,232,.075)'; ctx.beginPath(); ctx.ellipse(x, y, w * .6, w * .4, 0, 0, 6.283); ctx.fill();
      }
      ctx.restore();
    }
    function card(px, a) {
      // tarjeta que barre la línea (vista de canto, ligeramente inclinada)
      const y = yAt(Math.min(1, Math.max(0, (px - x0) / (x1 - x0)))), h = maxW * 4.2;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(px + 3, y); ctx.rotate(-.18);
      const g = ctx.createLinearGradient(-6, 0, 6, 0); g.addColorStop(0, '#2b2b30'); g.addColorStop(.5, '#6b6b74'); g.addColorStop(1, '#1d1d21');
      ctx.fillStyle = g; ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 4;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-3, -h / 2, 6, h, 2) : ctx.rect(-3, -h / 2, 6, h); ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(-3, -h / 2 + 2, 1, h - 4);
      ctx.restore();
    }
    function sparkle(time) {
      X.forEach(g => {
        const k = Math.max(0, Math.sin(time / 420 + g.s * 3)); if (k < .82) return;
        const a = (k - .82) / .18, L = 2 + a * 4;
        ctx.strokeStyle = `rgba(255,255,255,${(a * .9).toFixed(2)})`; ctx.lineWidth = .7;
        ctx.beginPath(); ctx.moveTo(g.x - L, g.y); ctx.lineTo(g.x + L, g.y); ctx.moveTo(g.x, g.y - L); ctx.lineTo(g.x, g.y + L); ctx.stroke();
      });
    }

    const DUR = reduce ? 1 : 1700, t0 = performance.now(); let lastTick = 0, done = false, doneAt = 0;
    function frame(now) {
      if (!cv.isConnected) return;
      const k = Math.min(1, (now - t0) / DUR), p = ease(k);
      surface();
      body(p);
      addGrains(p);
      ctx.drawImage(layer, 0, 0, W, Hh);
      if (!done) {
        card(x0 + (x1 - x0) * p, 1);
        if (now - lastTick > 95 && k < 1) { lastTick = now; o.onTick && o.onTick(); }
        if (k >= 1) { done = true; doneAt = now; o.done && o.done(); }
      } else {
        const fa = Math.max(0, 1 - (now - doneAt) / 450);
        if (fa > 0) card(x1 + (now - doneAt) * .25, fa);
        sparkle(now);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  window.Raya = { draw };
})();
