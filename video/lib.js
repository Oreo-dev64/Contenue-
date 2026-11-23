/* lib.js — moteur commun des vidéos TikTok (seek(t) pur, 1080×1920).
   Inliné dans chaque page par build.mjs. */
const W = 1080, H = 1920;
const C = { ink: '#0B0B10', lime: '#C6FF3D', cream: '#EDEBE4', blue: '#2F47FF', red: '#FF3B30', white: '#FFFFFF' };

// ---------- maths / easing ----------
function spring(t, w = 14, z = 0.82) {
  if (t <= 0) return 0;
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
const track = (v0, keys) => t => { let v = v0, p = v0; for (const [tk, val, w, z] of keys) { v += (val - p) * spring(t - tk, w, z); p = val; } return v; };
const kf = keys => t => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) { const [a, va] = keys[i - 1], [b, vb, e = ease] = keys[i]; if (t <= b) return lerp(va, vb, e((t - a) / (b - a))); } return keys[keys.length - 1][1]; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => (x = clamp(x), x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeIn = x => (x = clamp(x), x * x * x);
const easeOut = x => (x = clamp(x), 1 - Math.pow(1 - x, 3));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const rng = s => () => (s = (s + 0x6D2B79F5) | 0, s = Math.imul(s ^ (s >>> 15), 1 | s), s ^= s + Math.imul(s ^ (s >>> 7), 61 | s), ((s ^ (s >>> 14)) >>> 0) / 4294967296);
const P = (x, y) => `translate(${x}px,${y}px) translate(-50%,-50%)`;
const on = (e, v) => { if (e._d === undefined) e._d = e.style.display === 'none' ? '' : e.style.display; const d = v ? e._d : 'none'; if (e.style.display !== d) e.style.display = d; };
const win = (t, a, b) => t >= a && t < b;
function hex(c) { c = c.replace('#', ''); return [0, 2, 4].map(i => parseInt(c.substr(i, 2), 16)); }
function lerpColor(a, b, k) { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; }
const isLight = c => c === C.lime || c === C.cream || c === C.white;

// ---------- DOM ----------
function E(parent, css = '', html = '', cls = '') { const e = document.createElement('div'); if (cls) e.className = cls; e.style.cssText = css; if (html) e.innerHTML = html; parent.appendChild(e); return e; }
function Tx(parent, text, css) { return E(parent, css, text, 'T'); }
// mot avec révélation lettre par lettre (masque)
function MW(parent, text, css) {
  const el = E(parent, css, '', 'T');
  const letters = [];
  for (const ch of text) { const o = document.createElement('span'); o.className = 'lt'; const i = document.createElement('span'); i.textContent = ch === ' ' ? ' ' : ch; o.appendChild(i); el.appendChild(o); letters.push(i); }
  el.reveal = (t, t0, step = 0.045, dir = 1) => letters.forEach((l, i) => { const k = spring(t - t0 - i * step, 20, .78); l.style.transform = `translateY(${(1 - k) * 110 * dir}%)`; });
  return el;
}
const svg = (vb, inner, w, h, css = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" style="display:block;overflow:visible;${css}">${inner}</svg>`;
const ICON = {
  run: ['0 0 240 140', (c, d) => `<path d="M18 96 C16 74 30 60 52 56 L96 40 C108 36 118 44 126 54 C140 70 168 76 196 80 C214 83 226 92 226 104 L226 110 L18 110 Z" fill="${c}"/><path d="M14 108 H230 Q232 124 214 126 H30 Q12 126 14 108 Z" fill="${d}"/><path d="M98 50 L112 64 M86 55 L100 69 M74 60 L88 74" stroke="${d}" stroke-width="6" stroke-linecap="round"/><path d="M56 94 Q120 72 196 92" stroke="${d}" stroke-width="8" fill="none" stroke-linecap="round"/>`],
  sneak: ['0 0 240 160', (c, d) => `<path d="M44 24 L104 18 Q112 18 112 26 L114 70 C146 80 192 84 214 98 C226 106 228 116 226 124 L24 124 C18 92 26 56 44 24 Z" fill="${c}"/><path d="M16 120 H232 Q234 144 210 144 H36 Q14 144 16 120 Z" fill="${d}"/><circle cx="100" cy="36" r="5" fill="${d}"/><circle cx="102" cy="50" r="5" fill="${d}"/><circle cx="104" cy="64" r="5" fill="${d}"/><path d="M48 58 Q74 90 62 120" stroke="${d}" stroke-width="9" fill="none" stroke-linecap="round"/>`],
  hood: ['0 0 200 200', (c, d) => `<path d="M62 38 Q100 22 138 38 L178 66 Q186 72 182 80 L166 112 Q162 118 156 114 L148 108 L148 182 Q148 188 142 188 L58 188 Q52 188 52 182 L52 108 L44 114 Q38 118 34 112 L18 80 Q14 72 22 66 Z" fill="${c}"/><path d="M74 40 Q100 84 126 40" stroke="${d}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M72 140 H128 L136 170 H64 Z" fill="${d}" opacity=".45"/><path d="M92 64 V96 M108 64 V96" stroke="${d}" stroke-width="5" stroke-linecap="round"/>`],
  bag: ['0 0 200 200', (c, d) => `<path d="M68 76 Q68 30 100 30 Q132 30 132 76" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M40 72 H160 L172 176 Q173 186 163 186 H37 Q27 186 28 176 Z" fill="${c}"/><rect x="84" y="96" width="32" height="22" rx="5" fill="${d}"/><path d="M44 130 H156" stroke="${d}" stroke-width="4" opacity=".5"/>`],
  tee: ['0 0 200 200', (c, d) => `<path d="M64 28 L84 20 Q100 38 116 20 L136 28 L178 58 L158 90 L142 80 L142 184 L58 184 L58 80 L42 90 L22 58 Z" fill="${c}"/><path d="M84 20 Q100 38 116 20" stroke="${d}" stroke-width="6" fill="none"/>`],
  jacket: ['0 0 200 200', (c, d) => `<path d="M70 26 L100 40 L130 26 L170 50 Q180 56 182 68 L188 176 Q188 184 180 184 L152 184 L150 96 L148 184 L52 184 L50 96 L48 184 L20 184 Q12 184 12 176 L18 68 Q20 56 30 50 Z" fill="${c}"/><path d="M70 26 L84 54 L100 40 L116 54 L130 26" stroke="${d}" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M100 44 V184" stroke="${d}" stroke-width="4"/><rect x="108" y="70" width="30" height="40" rx="4" fill="${d}" opacity=".5"/><path d="M60 130 L64 160 M136 130 L140 160" stroke="${d}" stroke-width="4" opacity=".6"/>`],
  pants: ['0 0 200 240', (c, d) => `<path d="M48 14 H152 L164 226 Q164 232 158 232 H118 Q112 232 112 226 L100 92 L88 226 Q88 232 82 232 H42 Q36 232 36 226 Z" fill="${c}"/><rect x="48" y="14" width="104" height="18" fill="${d}"/><path d="M100 32 V72" stroke="${d}" stroke-width="4"/><path d="M60 150 L80 170 M64 176 L84 196 M124 160 L144 180" stroke="${d}" stroke-width="4" opacity=".6"/>`],
};
const icon = (k, c, d, w) => { const [vb, f] = ICON[k]; const [, , vw, vh] = vb.split(' ').map(Number); return svg(vb, f(c, d), w, w * vh / vw); };

// texte extrudé 3D (empilement de calques)
function EXT(parent, text, size, layers, depth, front, sideA, sideB, shine = '#2a2d1a') {
  const root = E(parent, '', '', 'L p3');
  root.layers = [];
  for (let i = layers; i >= 0; i--) {
    const k = i / layers;
    const l = E(root, `font:${size}px AB;letter-spacing:-0.03em;color:${i === 0 ? front : lerpColor(sideA, sideB, k)};transform:translate(-50%,-50%) translateZ(${-k * depth}px)`, text, 'T');
    if (i === 0) { l.style.background = `linear-gradient(180deg, ${front} 0%, ${front} 55%, ${shine} 100%)`; l.style.webkitBackgroundClip = 'text'; l.style.color = 'transparent'; l.style.padding = '0 .04em'; }
    root.layers.push(l);
  }
  root.setText = s => root.layers.forEach(l => { if (l.textContent !== s) l.textContent = s; });
  return root;
}
// cube 3D (colis)
function BOX(parent, s, cols = ['#C8955A', '#B07E46', '#C8955A', '#A57540', '#D9A86C', '#8E6234'], label = 'COLIS') {
  const box = E(parent, `width:${s}px;height:${s}px`, '', 'L p3');
  const R = ['', 'rotateY(90deg)', 'rotateY(180deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)'];
  box.faces = R.map((r, i) => E(box, `width:${s}px;height:${s}px;background:${cols[i]};transform:translate(-50%,-50%) ${r} translateZ(${s / 2}px);display:flex;align-items:center;justify-content:center`,
    i === 4 ? `<div style="position:absolute;left:${s * .4}px;top:0;width:${s * .2}px;height:${s}px;background:rgba(240,220,170,.75)"></div>` : i === 0 ? `<div style="position:absolute;left:${s * .4}px;top:0;width:${s * .2}px;height:${s * .27}px;background:rgba(240,220,170,.75)"></div><div style="font:500 ${s * .1}px JM;color:#5A3A18;letter-spacing:.15em;border:3px solid #5A3A18;padding:6px 12px;margin-top:${s * .15}px">${label}</div>` : '', 'L'));
  return box;
}

// ---------- sous-titres ----------
const NUMFR = { 'quatorze': '14', 'euros': '€', 'cinq': '5', 'six': '6', 'sept': '7', 'vingt': '20', 'trois': '3', 'deux': '2', 'un': '1', 'quarante-quatre': '44' };
function makeGroups(words, map = NUMFR, maxW = 3, maxC = 15) {
  const gs = []; let g = [];
  const push = () => { if (g.length) gs.push(g); g = []; };
  // nombres français en toutes lettres -> chiffres (« deux cent vingt-cinq » -> 225)
  const UN = { un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16, vingt: 20, vingts: 20, trente: 30, quarante: 40, cinquante: 50, soixante: 60, cent: 100, cents: 100, mille: 1000, et: 0 };
  const numTok = w => { const p = w.toLowerCase().replace(/[.,:?!…]+$/, '').replace(/\.\.\.$/, '').split('-'); return p.length && p.every(x => x in UN) && !(p.length === 1 && p[0] === 'et') ? p : null; };
  const W2 = [];
  for (let i = 0; i < words.length; i++) {
    let p = numTok(words[i][0]);
    if (!p || (p.length === 1 && p[0] === 'un' && !/[.…]/.test(words[i][0]))) { W2.push(words[i]); continue; }
    let total = 0, cur = 0, j = i, last = words[i];
    const eat = parts => { for (const x of parts) { const v = UN[x]; if (v === 100) cur = (cur || 1) * 100; else if (v === 1000) { total += (cur || 1) * 1000; cur = 0; } else if (x === 'vingt' && cur % 100 === 4) cur = cur - 4 + 80; else cur += v; } };
    eat(p);
    while (!/[.,:?!…]$/.test(last[0]) && j + 1 < words.length && (p = numTok(words[j + 1][0]))) { j++; last = words[j]; eat(p); }
    const punct = (last[0].match(/(\.\.\.|[.,:?!…])$/) || [''])[0];
    W2.push([String(total + cur) + punct, words[i][1], last[2]]); i = j;
  }
  for (const [raw, s, e] of W2) {
    if (/^\[|\]$/.test(raw)) continue;
    if (/^[«»]$/.test(raw)) continue;
    if (raw === ':' && g.length && g[g.length - 1].w.length === 1) { g[g.length - 1].w += ' :'; continue; } // « A : 120 € »
    if (/^[?:!;]$/.test(raw)) { // ponctuation isolée : rattacher au mot précédent
      if (raw === '?' || raw === '!') { const last = g.length ? g[g.length - 1] : (gs.length ? gs[gs.length - 1][gs[gs.length - 1].length - 1] : null); if (last) last.w += ' ' + raw; }
      push(); continue;
    }
    const clean = raw.replace(/\.\.\.$/, '').replace(/[.,:]$/, '');
    const disp = (map[clean.toLowerCase()] || clean).toUpperCase();
    const prevW = g.length ? g[g.length - 1] : (gs.length ? gs[gs.length - 1][gs[gs.length - 1].length - 1] : null);
    if (disp === '€' && prevW && /\d$/.test(prevW.w)) { prevW.w += ' €'; prevW.e = e; if (/[.,?:!]|\.\.\.$/.test(raw)) push(); continue; }
    g.push({ w: disp, s, e });
    const chars = g.reduce((n, x) => n + x.w.length + 1, 0);
    if (/[.,?:!]|\.\.\.$/.test(raw) || g.length >= maxW || chars > maxC) push();
  }
  push();
  return gs.map(g => ({ words: g, s: g[0].s - 0.04, e: 0 })).map((g, i, a) => (g.e = i + 1 < a.length ? Math.min(a[i + 1].s, g.words[g.words.length - 1].e + 0.6) : g.words[g.words.length - 1].e + 0.5, g));
}
function Captions(stage, groups, { y = 1440, hideAfter = 1e9, hideWin = [], hl = C.lime } = {}) {
  const cap = E(stage, `left:540px;top:${y}px;font:76px AB;letter-spacing:-.01em;text-align:center;white-space:nowrap;paint-order:stroke fill;-webkit-text-stroke:16px ${C.ink};line-height:1`, '', 'L');
  let idx = -2, spans = [], fit = 1;
  return t => {
    let gi = -1; for (let i = 0; i < groups.length; i++) if (t >= groups[i].s && t < groups[i].e) gi = i;
    if (t > hideAfter || hideWin.some(([a, b]) => t >= a && t < b)) gi = -1;
    if (gi !== idx) {
      idx = gi; cap.innerHTML = ''; spans = [];
      if (gi >= 0) groups[gi].words.forEach(w => { const s = document.createElement('span'); s.textContent = w.w; s.style.display = 'inline-block'; s.style.margin = '0 .14em'; cap.appendChild(s); spans.push(s); });
      fit = Math.min(1, 940 / Math.max(1, cap.offsetWidth));
    }
    on(cap, gi >= 0);
    if (gi < 0) return;
    const g = groups[gi], k = spring(t - g.s, 22, .6);
    cap.style.transform = `translate(-50%,-50%) scale(${fit * lerp(.75, 1, k)}) rotate(${(1 - k) * -3}deg)`;
    g.words.forEach((w, i) => {
      const act = t >= w.s - .03, cur = act && (i === g.words.length - 1 || t < g.words[i + 1].s - .03);
      spans[i].style.color = cur ? hl : '#fff';
      spans[i].style.opacity = act ? 1 : .55;
      spans[i].style.transform = `scale(${cur ? 1.04 + .08 * (1 - spring(t - w.s, 25, .6)) : 1})`;
    });
  };
}

// ---------- habillage : vignette, grain, HUD ----------
function Overlays(stage, { label = 'FOURNISSEUR — 14 €', scenes = [[0, '']], hud: showHud = true } = {}) {
  E(stage, `background:radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.32) 100%)`, '', 'full');
  const grains = [0, 1, 2, 3].map(k => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'), id = g.createImageData(256, 256), r = rng(100 + k); for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); return cv.toDataURL(); });
  const grain = E(stage, `opacity:.055;background-size:256px 256px`, '', 'full');
  const hud = E(stage, showHud ? '' : 'display:none', '', 'full');
  const hc = [[46, 210, 'border-left:3px solid;border-top:3px solid'], [W - 102, 210, 'border-right:3px solid;border-top:3px solid'], [46, 1640, 'border-left:3px solid;border-bottom:3px solid'], [W - 102, 1640, 'border-right:3px solid;border-bottom:3px solid']].map(([x, y, b]) => E(hud, `left:${x}px;top:${y}px;width:56px;height:56px;${b}`, '', 'L'));
  Tx(hud, label, `font:500 20px JM;letter-spacing:.18em;left:72px;top:236px`);
  const tr = Tx(hud, '', `font:500 20px JM;letter-spacing:.18em;top:236px`);
  const bl = Tx(hud, '', `font:500 20px JM;letter-spacing:.18em;left:72px;top:1612px`);
  const br = Tx(hud, '', `font:500 20px JM;letter-spacing:.12em;top:1612px`);
  const rec = E(hud, `width:14px;height:14px;border-radius:50%;background:${C.red}`, '', 'L');
  return (t, bgc) => {
    grain.style.backgroundImage = `url(${grains[Math.floor(t * 24) % 4]})`;
    const col = isLight(bgc) ? 'rgba(11,11,16,.5)' : 'rgba(237,235,228,.5)';
    hud.style.color = col; hc.forEach(h => h.style.borderColor = col);
    let si = 0; scenes.forEach((s, i) => { if (t >= s[0]) si = i; });
    tr.textContent = `SCÈNE ${String(si + 1).padStart(2, '0')} / ${scenes.length}`;
    tr.style.transform = `translate(${W - 72}px,0) translateX(-100%)`;
    bl.textContent = scenes[si][1];
    br.textContent = `00:00:${String(Math.floor(t)).padStart(2, '0')}:${String(Math.floor(t * 30) % 30).padStart(2, '0')}`;
    br.style.transform = `translate(${W - 72}px,0) translateX(-100%)`;
    rec.style.transform = `translate(${W - 308}px,1615px)`; rec.style.opacity = (Math.floor(t * 2) % 2) ? .9 : .3;
  };
}
const shakeAt = (t, hits) => { let sx = 0, sy = 0; for (const [ht, a] of hits) { const d = t - ht; if (d > 0 && d < .6) { const k = a * Math.exp(-d * 9); sx += k * Math.sin(d * 77); sy += k * Math.cos(d * 63); } } return [sx, sy]; };
const stepColor = (list, t) => { let c = list[0][1]; for (const [tt, cc] of list) if (t >= tt) c = cc; return c; };

// ---------- kit bruitages (Web Audio, synthétisé) ----------
function SFX(ctx) {
  const sr = ctx.sampleRate, out = ctx.createGain(); out.gain.value = .9; out.connect(ctx.destination);
  const r = rng(7), nb = ctx.createBuffer(1, sr * 2, sr), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = r() * 2 - 1;
  const noise = (t, dur, type, f0, f1, g0, q = 1, pan = 0) => {
    if (t < 0) t = 0;
    const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(g0, t + dur * .35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = ctx.createStereoPanner(); p.pan.value = pan;
    s.connect(f).connect(g).connect(p).connect(out); s.start(t, r()); s.stop(t + dur + .05);
  };
  const tone = (t, dur, type, f0, f1, g0, att = .005) => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(g0, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out); o.start(t); o.stop(t + dur + .05);
  };
  const k = {
    noise, tone,
    whoosh: (t, d = .45, g = .35, pan = 0) => noise(t - d * .6, d, 'bandpass', 300, 3200, g, 1.4, pan),
    whooshDown: (t, d = .5, g = .3) => noise(t - d * .4, d, 'bandpass', 2800, 260, g, 1.2),
    impact: (t, g = .9) => { tone(t, .7, 'sine', 120, 38, g); noise(t, .35, 'lowpass', 2400, 200, g * .45); tone(t, .12, 'triangle', 900, 120, g * .25); },
    pop: (t, f = 700, g = .3) => { tone(t, .12, 'sine', f, f * .45, g); tone(t, .05, 'triangle', f * 2, f, g * .3); },
    tick: (t, f = 2400, g = .12) => tone(t, .03, 'square', f, f * .9, g, .001),
    ding: (t, g = .25) => { tone(t, 1.0, 'sine', 1318.5, 1318, g, .003); tone(t + .07, 1.1, 'sine', 1760, 1759, g * .8, .003); },
    stamp: (t, g = .8) => { tone(t, .25, 'sine', 90, 45, g); noise(t, .18, 'lowpass', 1800, 300, g * .6); },
    buzz: (t, g = .16) => { tone(t, .28, 'square', 116, 110, g, .01); tone(t, .28, 'square', 123, 118, g * .7, .01); },
    glitch: (t, g = .15) => { for (let i = 0; i < 6; i++) tone(t + i * .025, .02, 'square', 200 + r() * 2000, 200 + r() * 2000, g, .001); },
    riser: (t0, t1, g = .25) => { const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 3; f.frequency.setValueAtTime(300, t0); f.frequency.exponentialRampToValueAtTime(5000, t1); const gg = ctx.createGain(); gg.gain.setValueAtTime(0.0001, t0); gg.gain.exponentialRampToValueAtTime(g, t1 - .02); gg.gain.exponentialRampToValueAtTime(0.0001, t1 + .03); s.connect(f).connect(gg).connect(out); s.start(t0); s.stop(t1 + .1); },
    shutter: t => { noise(t, .04, 'highpass', 3000, 2500, .5); noise(t + .07, .06, 'highpass', 2500, 2000, .4); },
    cash: (t, g = .3) => { k.tick(t, 3200, g * .5); k.ding(t + .05, g); },
    ringout: (t, g = .07) => { tone(t, 2.0, 'sine', 880, 878, g, .01); tone(t, 2.0, 'sine', 1320, 1318, g * .6, .01); },
  };
  return k;
}

// ---------- aperçu (sans ?render) ----------
function setupPreview(DUR, audioSrc) {
  const st = document.getElementById('stage');
  if (location.search.includes('render')) return;
  const ui = E(document.body, 'position:fixed;left:0;right:0;bottom:0;padding:10px 16px;display:flex;gap:12px;align-items:center;background:rgba(0,0,0,.6);color:#fff;font:14px monospace;z-index:9',
    `<button id="pb" style="font:14px monospace;padding:6px 14px">▶ lecture</button><input id="sc" type="range" min="0" max="${DUR}" step="0.01" value="0" style="flex:1"><span id="tc">0.00</span>`);
  const vo = new Audio(audioSrc);
  const fit = () => { const s = Math.min(innerWidth / W, (innerHeight - 50) / H); st.style.transform = `scale(${s})`; st.style.left = `${(innerWidth - W * s) / 2}px`; };
  addEventListener('resize', fit); fit();
  const pb = ui.querySelector('#pb'), sc = ui.querySelector('#sc'), tc = ui.querySelector('#tc');
  let playing = false, t0 = 0, base = 0;
  pb.onclick = () => { playing = !playing; if (playing) { vo.currentTime = +sc.value; vo.play().catch(() => {}); t0 = performance.now(); base = +sc.value; } else vo.pause(); pb.textContent = playing ? '❚❚ pause' : '▶ lecture'; };
  sc.oninput = () => { base = +sc.value; t0 = performance.now(); vo.currentTime = base; };
  (function loop() { let t = +sc.value; if (playing) { t = vo.duration && !vo.paused ? vo.currentTime : base + (performance.now() - t0) / 1000; if (t >= DUR) { t = 0; base = 0; t0 = performance.now(); } sc.value = t; } window.seek(t); tc.textContent = t.toFixed(2); requestAnimationFrame(loop); })();
}
async function loadFonts() {
  await Promise.all(['72px AB', '400 40px IT', '700 40px IT', 'italic 60px IS', '30px JM'].map(f => document.fonts.load(f, 'ÀÉ€✓0')));
  await document.fonts.ready;
}

// ---------- Kevin (personnage récurrent) ----------
function KEVIN(parent) {
  const kev = E(parent, 'width:400px;height:520px', svg('0 0 400 520', `
    <ellipse cx="200" cy="510" rx="150" ry="12" fill="rgba(0,0,0,.35)"/>
    <path d="M70 520 C70 400 120 350 200 350 C280 350 330 400 330 520 Z" fill="#3A3F55"/>
    <path d="M140 362 Q200 424 260 362" stroke="#262A3A" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M182 384 V444 M218 384 V444" stroke="#EDEBE4" stroke-width="6" stroke-linecap="round"/>
    <rect x="176" y="296" width="48" height="66" rx="20" fill="#E0B48C"/>
    <circle cx="94" cy="226" r="20" fill="#E8BC94"/><circle cx="306" cy="226" r="20" fill="#E8BC94"/>
    <circle cx="200" cy="215" r="108" fill="#F2C9A0"/>
    <ellipse cx="146" cy="262" rx="18" ry="10" fill="#F09A8A" opacity=".55"/><ellipse cx="254" cy="262" rx="18" ry="10" fill="#F09A8A" opacity=".55"/>
    <path d="M92 210 C86 120 140 92 205 94 C276 96 318 140 310 212 C296 168 258 150 206 152 C150 152 112 176 92 210 Z" fill="#2B1E16"/>
    <g class="eL" transform="translate(160 226)"><ellipse rx="13" ry="15" fill="#0B0B10"/><circle cx="4" cy="-5" r="4" fill="#fff"/></g>
    <g class="eR" transform="translate(240 226)"><ellipse rx="13" ry="15" fill="#0B0B10"/><circle cx="4" cy="-5" r="4" fill="#fff"/></g>
    <path class="bL" d="M138 192 L182 188" stroke="#2B1E16" stroke-width="10" stroke-linecap="round"/>
    <path class="bR" d="M218 188 L262 192" stroke="#2B1E16" stroke-width="10" stroke-linecap="round"/>
    <path class="mo" d="M168 278 Q200 300 232 278" stroke="#7A3B2E" stroke-width="9" fill="none" stroke-linecap="round"/>
    <ellipse class="om" cx="200" cy="284" rx="20" ry="26" fill="#5A2320" opacity="0"/>
    <g class="gl" opacity="0"><rect x="118" y="204" width="76" height="44" rx="10" fill="#0B0B10"/><rect x="206" y="204" width="76" height="44" rx="10" fill="#0B0B10"/><path d="M194 220 H206" stroke="#0B0B10" stroke-width="8"/><path d="M128 212 L146 212" stroke="#fff" stroke-width="5" opacity=".6"/></g>
  `, 400, 520), 'L');
  const q = c => kev.querySelector('.' + c);
  const eL = q('eL'), eR = q('eR'), bL = q('bL'), bR = q('bR'), mo = q('mo'), om = q('om'), gl = q('gl'), sv = kev.querySelector('svg');
  // m : sourire (+1) / triste (-1) ; br : sourcils tristes ; shock : bouche ouverte ; glasses : lunettes de soleil ; gray : gris
  kev.pose = ({ x = 540, y = 900, s = 1, rot = 0, m = .7, br = 0, shock = 0, blink = 1, gray = 0, glasses = 0, look = 0 } = {}) => {
    kev.style.transform = P(x, y) + ` scale(${s}) rotate(${rot}deg)`;
    sv.style.filter = gray ? `grayscale(${gray}) brightness(${1 - .15 * gray})` : '';
    const es = 1 + .4 * shock;
    eL.setAttribute('transform', `translate(160 ${226 + look}) scale(${es} ${es * blink})`);
    eR.setAttribute('transform', `translate(240 ${226 + look}) scale(${es} ${es * blink})`);
    bL.setAttribute('transform', `translate(0 ${-16 * shock}) rotate(${-br} 160 190)`);
    bR.setAttribute('transform', `translate(0 ${-16 * shock}) rotate(${br} 240 190)`);
    mo.setAttribute('d', `M168 ${282 - 6 * m} Q200 ${282 + 22 * m} 232 ${282 - 6 * m}`);
    mo.style.opacity = shock > .5 ? 0 : 1; om.setAttribute('opacity', shock > .5 ? 1 : 0);
    gl.setAttribute('opacity', glasses); gl.setAttribute('transform', `translate(0 ${(1 - glasses) * -60})`);
  };
  return kev;
}

// ---------- carte de fin commune (fond vert) : « LE FOURNISSEUR » + 14€ 3D + catégories + LIEN EN BIO ----------
function EndCard(parent, t0, { tPill = t0 + .45 } = {}) {
  const J = E(parent, 'perspective:1800px', '', 'full');
  const le = MW(J, 'LE FOURNISSEUR', `font:84px AB;color:${C.ink};letter-spacing:-.02em`);
  const ext = EXT(J, '14€', 400, 26, 110, C.ink, '#3E4A12', '#1C2208');
  const sh = E(J, `width:700px;height:90px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.35),transparent)`, '', 'L');
  const cats = Tx(J, '', `font:500 30px JM;color:${C.ink};letter-spacing:.12em`);
  const rule = E(J, `height:3px;background:${C.ink}`, '', 'L');
  const pill = E(J, `display:flex;align-items:center;gap:22px;background:${C.ink};border-radius:70px;padding:26px 50px 26px 40px;white-space:nowrap;width:max-content`, `<svg viewBox="0 0 40 40" width="48" height="48"><path d="M20 34 V8 M8 19 L20 7 L32 19" stroke="${C.lime}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="font:62px AB;color:${C.lime};letter-spacing:-.01em">LIEN EN BIO</span>`, 'L');
  const arr = pill.querySelector('svg');
  return t => {
    on(J, t >= t0 - .05); if (t < t0 - .05) return;
    le.style.transform = P(540, 330); le.reveal(t, t0, .025);
    const k = spring(t - t0, 9, .62), sway = Math.sin((t - t0 - .4) * 1.7) * 16 * seg(t, t0 + .4, t0 + .9);
    ext.style.transform = `translate(540px,760px) rotateX(${12 + Math.sin(t * 1.3) * 4}deg) rotateY(${lerp(-720, -16, k) + sway}deg) scale(${lerp(.15, 1, k)})`;
    sh.style.transform = P(540, 1010) + ` scale(${k})`;
    const c = 'LUXE · RUNNING · STREETWEAR · SNEAKERS';
    cats.textContent = c.slice(0, Math.floor(seg(t, t0 + .5, t0 + 1.3) * c.length)); cats.style.transform = P(540, 1105);
    rule.style.width = `${760 * easeOut(seg(t, t0 + .6, t0 + 1.2))}px`; rule.style.transform = P(540, 1170);
    on(pill, t > tPill - .05); pill.style.transform = P(540, 1300) + ` scale(${spring(t - tPill, 14, .55)})`;
    arr.style.transform = `translateY(${Math.sin(t * 9) * 6}px)`;
  };
}
// cercle qui envahit l'écran (transition)
function Flood(parent, color, x, y, ta, tb) {
  const f = E(parent, `width:100px;height:100px;border-radius:50%;background:${color}`, '', 'L');
  return t => { on(f, win(t, ta - .05, tb + .08)); if (win(t, ta - .05, tb + .08)) f.style.transform = P(x, y) + ` scale(${48 * easeIn(seg(t, ta, tb))})`; };
}
// recadrage d'une capture (background-image)
function Crop(parent, img, iw, ih, ox, oy, ow, oh, w, css = '') {
  const s = w / ow;
  return E(parent, `width:${w}px;height:${oh * s}px;background-image:url(${img});background-size:${iw * s}px ${ih * s}px;background-position:${-ox * s}px ${-oy * s}px;${css}`, '', 'L');
}
