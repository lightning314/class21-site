(function () {
  var cv = document.getElementById('gx');
  var ctx = cv.getContext('2d');
  var PALETTES = {
    live: ['#0ea5e9', '#22d3ee', '#a78bfa'],
    indigo: ['#6366f1', '#38bdf8', '#c084fc'],
    gold: ['#fbbf24', '#fde68a', '#fb923c'],
    ice: ['#7dd3fc', '#e0f2fe', '#60a5fa'],
    rose: ['#fb7185', '#f0abfc', '#818cf8']
  };
  var cfg = { density: 1, speed: 1, palette: 'live', meteor: true, line: true, band: true, spiral: true, mouse: true };
  var W = 0, H = 0, DPR = 1, stars = [], linkSet = [], sparks = [], meteors = [], band = null;
  var rot = 0, time = 0, last = 0, fps = 0, acc = 0, frames = 0, nextMeteor = 2, running = true, prev = 0;
  var ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  var sy = 0;
  function colors() { return PALETTES[cfg.palette] || PALETTES.live; }
  function hexA(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function applyVars() {
    var c = colors(), r = document.documentElement.style;
    r.setProperty('--c1', c[0]); r.setProperty('--c2', c[1]); r.setProperty('--c3', c[2]);
  }
  function buildStars() {
    var layers = [
      { z: 0.25, d: 0.00030, r0: 0.35, r1: 0.95, a0: 0.20, a1: 0.55 },
      { z: 0.55, d: 0.00017, r0: 0.60, r1: 1.45, a0: 0.35, a1: 0.80 },
      { z: 1.00, d: 0.00007, r0: 1.00, r1: 2.10, a0: 0.55, a1: 1.00 }];
    stars = [];
    var c = colors();
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i], n = Math.round(W * H * L.d * cfg.density);
      for (var k = 0; k < n; k++) {
        var pick = Math.random();
        stars.push({ x: Math.random() * W, y: Math.random() * H,
          r: L.r0 + Math.random() * (L.r1 - L.r0), a: L.a0 + Math.random() * (L.a1 - L.a0),
          z: L.z, layer: i, ph: Math.random() * 6.283, ts: 0.5 + Math.random() * 1.7,
          vx: (Math.random() - 0.5) * 3.2, vy: (Math.random() - 0.5) * 1.6,
          col: pick < 0.7 ? '#ffffff' : (pick < 0.87 ? c[1] : c[2]) });
      }
    }
    linkSet = stars.filter(function (s) { return s.layer === 1; }).slice(0, 56);
  }
  function buildBand() {
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(W * DPR)); c.height = Math.max(1, Math.round(H * DPR));
    var b = c.getContext('2d');
    b.setTransform(DPR, 0, 0, DPR, 0, 0);
    var col = colors();
    var x0 = -W * 0.18, y0 = H * 1.16, x1 = W * 1.18, y1 = -H * 0.22;
    for (var i = 0; i <= 38; i++) {
      var t = i / 38, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      var r = Math.max(W, H) * (0.10 + Math.random() * 0.07);
      var g = b.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,0.05)');
      g.addColorStop(0.45, hexA(col[2], 0.030));
      g.addColorStop(1, 'rgba(255,255,255,0)');
      b.fillStyle = g; b.beginPath(); b.arc(x, y, r, 0, 6.2832); b.fill();
    }
    var ang = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2;
    var n = Math.round(1500 * cfg.density);
    for (var k = 0; k < n; k++) {
      var t2 = Math.random();
      var spread = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      var off = spread * H * 0.14;
      var X = x0 + (x1 - x0) * t2 + Math.cos(ang) * off;
      var Y = y0 + (y1 - y0) * t2 + Math.sin(ang) * off;
      b.globalAlpha = 0.10 + Math.random() * 0.55;
      b.fillStyle = Math.random() < 0.82 ? '#ffffff' : col[1];
      b.beginPath(); b.arc(X, Y, 0.15 + Math.random() * 0.95, 0, 6.2832); b.fill();
    }
    b.globalAlpha = 1;
    band = c;
  }
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildStars(); buildBand();
  }
  function burst(x, y, count) {
    var c = colors();
    for (var i = 0; i < (count || 30); i++) {
      var a = Math.random() * 6.283, sp = 0.6 + Math.random() * 3.4;
      sparks.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, r: 0.7 + Math.random() * 1.8, col: Math.random() < 0.5 ? c[1] : c[2] });
    }
  }
  function spawnMeteor() {
    var c = colors();
    meteors.push({ x: Math.random() * W * 1.2 - W * 0.1, y: Math.random() < 0.7 ? -40 : Math.random() * H * 0.5,
      vx: -(3.2 + Math.random() * 3.6), vy: 2.2 + Math.random() * 2.4,
      len: 90 + Math.random() * 150, life: 1, col: Math.random() < 0.6 ? '#ffffff' : c[1] });
  }
  function frame(now) {
    requestAnimationFrame(frame);
    if (!running) { last = now; return; }
    var dt = Math.min(50, now - last || 16) / 16.67; last = now;
    time += dt * 0.016 * cfg.speed; rot += dt * 0.0016 * cfg.speed;
    acc += now - (prev || now); prev = now; frames++;
    if (acc > 700) {
      fps = Math.round(frames * 1000 / acc); acc = 0; frames = 0;
      var el = document.getElementById('fps');
      if (el) el.textContent = fps + ' fps · ' + stars.length + ' 颗星';
    }
    ptr.x += (ptr.tx - ptr.x) * 0.05; ptr.y += (ptr.ty - ptr.y) * 0.05;
    sy = window.scrollY || 0;
    ctx.clearRect(0, 0, W, H);
    var col = colors(), ox = ptr.x - 0.5, oy = ptr.y - 0.5;
    if (cfg.band && band) {
      ctx.globalAlpha = 0.92;
      ctx.drawImage(band, -ox * 26 - sy * 0.02, -oy * 18 - sy * 0.05, W, H);
      ctx.globalAlpha = 1;
    }
    var cx = W * 0.79 - ox * 40, cy = H * 0.24 - oy * 26 - sy * 0.06;
    if (cfg.spiral) {
      var rad0 = Math.min(W, H) * 0.34;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad0);
      g.addColorStop(0, hexA(col[1], 0.26));
      g.addColorStop(0.35, hexA(col[0], 0.11));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rad0, 0, 6.2832); ctx.fill();
      for (var arm = 0; arm < 2; arm++) {
        for (var i = 3; i < 132; i++) {
          var a2 = rot * 2.2 + arm * Math.PI + i * 0.086;
          var rr = i * (Math.min(W, H) * 0.0040);
          var px = cx + Math.cos(a2) * rr * 1.62, py = cy + Math.sin(a2) * rr * 0.60;
          var al = (0.50 - i * 0.0033) * (0.55 + 0.45 * Math.sin(time * 2.2 + i * 0.45));
          if (al <= 0) continue;
          ctx.fillStyle = hexA(i % 6 === 0 ? col[2] : '#ffffff', al * 0.7);
          ctx.beginPath(); ctx.arc(px, py, i % 6 === 0 ? 1.5 : 0.9, 0, 6.2832); ctx.fill();
        }
      }
    }
    if (cfg.line) {
      ctx.lineWidth = 1;
      for (var m = 0; m < linkSet.length; m++) {
        var s1 = linkSet[m];
        var x1 = s1.x + ox * 34 * s1.z, y1 = s1.y + oy * 22 * s1.z - sy * 0.12 * s1.z;
        for (var q = m + 1; q < linkSet.length; q++) {
          var s2 = linkSet[q];
          var x2 = s2.x + ox * 34 * s2.z, y2 = s2.y + oy * 22 * s2.z - sy * 0.12 * s2.z;
          var dx = x1 - x2, dy = y1 - y2, dd = dx * dx + dy * dy;
          if (dd < 15000) {
            ctx.strokeStyle = hexA(col[1], 0.16 * (1 - dd / 15000));
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          }
        }
      }
    }
    var mxp = ptr.x * W, myp = ptr.y * H;
    for (var n2 = 0; n2 < stars.length; n2++) {
      var s = stars[n2];
      s.x += s.vx * dt * 0.05 * cfg.speed * s.z; s.y += s.vy * dt * 0.05 * cfg.speed * s.z;
      if (s.x < -12) s.x = W + 12; if (s.x > W + 12) s.x = -12;
      if (s.y < -12) s.y = H + 12; if (s.y > H + 12) s.y = -12;
      var X = s.x + ox * 46 * s.z, Y = s.y + oy * 30 * s.z - sy * 0.14 * s.z;
      if (X < -20 || X > W + 20 || Y < -20 || Y > H + 20) continue;
      var tw = 0.62 + 0.38 * Math.sin(time * 5.5 * s.ts + s.ph);
      var a = s.a * tw, R = s.r;
      if (cfg.mouse) {
        var ddx = X - mxp, ddy = Y - myp, d2 = ddx * ddx + ddy * ddy;
        if (d2 < 20000) {
          var f = 1 - d2 / 20000;
          X += ddx * 0.05 * f; Y += ddy * 0.05 * f;
          a = Math.min(1, a + f * 0.55); R += f * 0.9;
        }
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = s.col;
      if (s.layer === 2) {
        var gg = ctx.createRadialGradient(X, Y, 0, X, Y, R * 4.5);
        gg.addColorStop(0, 'rgba(255,255,255,0.85)');
        gg.addColorStop(0.35, hexA(s.col === '#ffffff' ? col[1] : s.col, 0.35));
        gg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(X, Y, R * 4.5, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#ffffff';
      }
      ctx.beginPath(); ctx.arc(X, Y, R, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (cfg.meteor) {
      nextMeteor -= dt * 0.016 * cfg.speed;
      if (nextMeteor <= 0) { spawnMeteor(); nextMeteor = 1.6 + Math.random() * 4.4; }
    }
    for (var mi = meteors.length - 1; mi >= 0; mi--) {
      var mt = meteors[mi];
      if (cfg.meteor) { mt.x += mt.vx * dt * 3.4; mt.y += mt.vy * dt * 3.4; mt.life -= dt * 0.0075; }
      if (mt.life <= 0 || mt.y > H + 80 || mt.x < -180) { meteors.splice(mi, 1); continue; }
      var nx = mt.vx, ny = mt.vy, mag = Math.sqrt(nx * nx + ny * ny) || 1;
      var tx = mt.x - (nx / mag) * mt.len, ty = mt.y - (ny / mag) * mt.len;
      var lg = ctx.createLinearGradient(mt.x, mt.y, tx, ty);
      lg.addColorStop(0, hexA(mt.col, 0.85 * mt.life));
      lg.addColorStop(0.35, hexA(col[1], 0.35 * mt.life));
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = lg; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(mt.x, mt.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * mt.life) + ')';
      ctx.beginPath(); ctx.arc(mt.x, mt.y, 1.7, 0, 6.2832); ctx.fill();
    }
    for (var si = sparks.length - 1; si >= 0; si--) {
      var sp = sparks[si];
      sp.x += sp.vx * dt * 1.6; sp.y += sp.vy * dt * 1.6;
      sp.vx *= 0.976; sp.vy *= 0.976; sp.life -= dt * 0.014;
      if (sp.life <= 0) { sparks.splice(si, 1); continue; }
      ctx.globalAlpha = Math.max(0, sp.life);
      ctx.fillStyle = sp.col;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r * sp.life + 0.3, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', function (e) { ptr.tx = e.clientX / W; ptr.ty = e.clientY / H; });
  window.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches[0]) { ptr.tx = e.touches[0].clientX / W; ptr.ty = e.touches[0].clientY / H; }
  }, { passive: true });
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.panel')) return;
    burst(e.clientX, e.clientY, 26);
  });
  document.addEventListener('visibilitychange', function () { running = !document.hidden; });
  applyVars(); resize();
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) cfg.speed = 0.4;
  requestAnimationFrame(frame);
  window.GX = { cfg: cfg, burst: burst, rebuild: function () { buildStars(); buildBand(); },
    palette: function (p) { cfg.palette = p; applyVars(); buildStars(); buildBand(); },
    running: function (v) { running = v; } };
})();
(function () {
  var html = document.documentElement, probe = null;
  function paperLum() {
    try {
      if (!probe) { probe = document.createElement("div"); probe.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;background:var(--paper)"; document.body.appendChild(probe); }
      var c = getComputedStyle(probe).backgroundColor || getComputedStyle(document.body).backgroundColor || "";
      var m = c.match(/[0-9.]+/g);
      if (!m || m.length < 3) return 1;
      return (0.2126 * parseFloat(m[0]) + 0.7152 * parseFloat(m[1]) + 0.0722 * parseFloat(m[2])) / 255;
    } catch (e) { return 1; }
  }
  function tick() {
    if (!document.body) return;
    var dark = paperLum() < 0.45;
    var on = (" " + html.className + " ").indexOf(" gx-dark ") >= 0;
    if (dark !== on) html.classList.toggle("gx-dark", dark);
  }
  tick(); setInterval(tick, 1500);
})();