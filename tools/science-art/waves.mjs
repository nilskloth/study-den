/* =========================================================
   Waves (Year 7: sound and light) — diagrams for the science trainer.
   Loaded by tools/build-science-art.mjs; h = shared helpers.
   ========================================================= */

export default function (h) {
  const { svg, label, bone, INK, SKIN, SKIN_EDGE, BONE, BONE_EDGE } = h;
  const RAY = "#e67e22", RAY_DARK = "#a85a10";
  const GLASS = "#d6ecf7", GLASS_EDGE = "#5d8aa8";
  const SCREEN = "#1f2a24", TRACE = "#5fd38a";
  const out = {};

  const arrowHead = (x, y, ang, col = RAY_DARK, s = 9) => {
    const a = ang * Math.PI / 180, b = 0.45;
    const p1 = [x - s * Math.cos(a - b), y - s * Math.sin(a - b)];
    const p2 = [x - s * Math.cos(a + b), y - s * Math.sin(a + b)];
    return `<path d="M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linejoin="round"/>`;
  };
  /* a ray from a to b with an arrow head half way along */
  const ray = ([x1, y1], [x2, y2], col = RAY, width = 3) => {
    const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${width}" stroke-linecap="round"/>` +
      arrowHead((x1 + x2) / 2 + 5 * Math.cos(ang * Math.PI / 180), (y1 + y2) / 2 + 5 * Math.sin(ang * Math.PI / 180), ang, col === RAY ? RAY_DARK : col);
  };
  const dashed = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6a6d71" stroke-width="1.6" stroke-dasharray="6 5"/>`;
  const wavePath = (x0, x1, mid, amp, len, phase = 0) => {
    let d = "";
    for (let x = x0; x <= x1 + 0.01; x += 2) {
      const y = mid - amp * Math.sin(2 * Math.PI * (x - x0) / len + phase);
      d += `${d ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return d;
  };

  /* ---------------- The ear ---------------- */
  out["wv-ear"] = (() => {
    // spiral for the cochlea
    let sp = "";
    const cx = 378, cy = 186;
    for (let t = 0; t <= 2.6 * 2 * Math.PI; t += 0.15) {
      const r = 30 - t * 1.6;
      sp += `${sp ? "L" : "M"}${(cx + r * Math.cos(t + Math.PI)).toFixed(1)} ${(cy + r * Math.sin(t + Math.PI)).toFixed(1)} `;
    }
    const body = `
    <rect x="95" y="50" width="490" height="240" rx="24" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2"/>
    <rect x="300" y="86" width="200" height="190" rx="30" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="1.5" opacity=".9"/>
    <path d="M104 72 C70 58 36 80 34 128 C32 176 40 230 74 272 C88 288 104 276 104 262Z" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2.5"/>
    <path d="M96 96 C70 92 58 120 60 150 C62 190 70 220 90 240" fill="none" stroke="${SKIN_EDGE}" stroke-width="2"/>
    <path d="M80 160 H252 V192 H80 C70 184 70 168 80 160Z" fill="#fbfaf6" stroke="${SKIN_EDGE}" stroke-width="2"/>
    <rect x="254" y="132" width="76" height="92" rx="16" fill="#fbfaf6" stroke="${BONE_EDGE}" stroke-width="1.5"/>
    <ellipse cx="254" cy="176" rx="4.5" ry="30" fill="#e8a0a0" stroke="#a35050" stroke-width="1.5"/>
    ${bone(259, 176, 278, 150, 6)}${bone(278, 150, 300, 160, 6)}${bone(300, 160, 326, 166, 5)}
    <rect x="326" y="156" width="26" height="22" rx="6" fill="#f6d7b0" stroke="#b5651d" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="33" fill="#f6d7b0" stroke="#b5651d" stroke-width="2"/>
    <path d="${sp}" fill="none" stroke="#b5651d" stroke-width="2"/>
    <path d="M404 172 C440 160 470 150 560 140" fill="none" stroke="#8a6d10" stroke-width="10" stroke-linecap="round"/>
    <path d="M404 172 C440 160 470 150 560 140" fill="none" stroke="#e3b23c" stroke-width="6.5" stroke-linecap="round"/>
    <path d="M18 168 q6 -8 0 -16 M10 172 q10 -12 0 -24 M2 176 q14 -16 0 -32" fill="none" stroke="#6a6d71" stroke-width="1.8" transform="translate(6 8)"/>
    ${label("pinna", "Outer ear (pinna)", [48, 120], [24, 24])}
    ${label("canal", "Ear canal", [170, 176], [120, 322])}
    ${label("eardrum", "Eardrum", [254, 150], [214, 24])}
    ${label("ossicles", "Ossicles (tiny bones)", [282, 151], [250, 322])}
    ${label("cochlea", "Cochlea", [384, 200], [400, 24])}
    ${label("nerve", "Auditory nerve", [500, 148], [440, 322])}`;
    return svg(600, 340, body);
  })();

  /* ---------------- A wave: amplitude and wavelength ---------------- */
  out["wv-wave"] = (() => {
    const mid = 150, amp = 60, len = 200, x0 = 90;
    const body = `
    ${dashed(20, mid, 548, mid)}
    <path d="${wavePath(x0, 530, mid, amp, len)}" fill="none" stroke="#2f6fb0" stroke-width="3.5"/>
    <line x1="340" y1="${mid}" x2="340" y2="${mid - amp + 3}" stroke="${INK}" stroke-width="1.8"/>
    ${arrowHead(340, mid - amp + 1, -90, INK, 8)}${arrowHead(340, mid - 1, 90, INK, 8)}
    <line x1="140" y1="70" x2="340" y2="70" stroke="${INK}" stroke-width="1.8"/>
    ${arrowHead(142, 70, 180, INK, 8)}${arrowHead(338, 70, 0, INK, 8)}
    <line x1="140" y1="62" x2="140" y2="88" stroke="${INK}" stroke-width="1" stroke-dasharray="3 3"/>
    <line x1="340" y1="62" x2="340" y2="88" stroke="${INK}" stroke-width="1" stroke-dasharray="3 3"/>
    ${label("crest", "Crest (peak)", [140, 90], [110, 36], "end")}
    ${label("wavelength", "Wavelength", [240, 70], [256, 30])}
    ${label("amplitude", "Amplitude", [340, 120], [372, 262])}
    ${label("trough", "Trough", [440, 210], [474, 262])}
    ${label("middle", "Middle (rest) position", [40, mid], [24, 262])}`;
    return svg(560, 290, body);
  })();

  /* ---------------- Oscilloscope traces ---------------- */
  const screen = (x, y, amp, waves, w = 260, hgt = 110) => {
    let grid = "";
    for (let gx = x + w / 8; gx < x + w - 1; gx += w / 8) grid += `<line x1="${gx}" y1="${y}" x2="${gx}" y2="${y + hgt}" stroke="#34463c" stroke-width="1"/>`;
    for (let gy = y + hgt / 4; gy < y + hgt - 1; gy += hgt / 4) grid += `<line x1="${x}" y1="${gy}" x2="${x + w}" y2="${gy}" stroke="#34463c" stroke-width="1"/>`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="8" fill="${SCREEN}"/>${grid}
      <path d="${wavePath(x + 6, x + w - 6, y + hgt / 2, amp, (w - 12) / waves)}" fill="none" stroke="${TRACE}" stroke-width="2.6"/>`;
  };
  out["wv-sound-waves"] = (() => {
    const cells = [
      [20, 40, 16, 2, "Quiet, low pitch", "small amplitude, few waves"],
      [320, 40, 44, 2, "Loud, low pitch", "big amplitude, same frequency"],
      [20, 210, 16, 6, "Quiet, high pitch", "small amplitude, more waves"],
      [320, 210, 44, 6, "Loud, high pitch", "big amplitude, more waves"]
    ];
    const body = cells.map(([x, y, a, n, t, c]) =>
      `<text x="${x + 130}" y="${y - 12}" text-anchor="middle" class="title">${t}</text>${screen(x, y, a, n)}
       <text x="${x + 130}" y="${y + 128}" text-anchor="middle" class="cap">${c}</text>`).join("") +
      `<text x="300" y="384" text-anchor="middle" class="cap">Taller wave = louder (bigger amplitude) · more waves across = higher pitch (higher frequency)</text>`;
    return svg(600, 396, body);
  })();

  /* the same idea with fixed letters, for questions */
  out["wv-traces"] = (() => {
    const cells = [
      ["A", 20, 34, 14, 2], ["B", 320, 34, 44, 2],
      ["C", 20, 190, 14, 6], ["D", 320, 190, 44, 4]
    ];
    const body = cells.map(([L, x, y, a, n]) =>
      `<text x="${x + 130}" y="${y - 10}" text-anchor="middle" class="title">${L}</text>${screen(x, y, a, n)}`).join("") +
      `<text x="300" y="330" text-anchor="middle" class="cap">All four traces use the same oscilloscope settings.</text>`;
    return svg(600, 342, body);
  })();

  /* ---------------- Longitudinal wave in air ---------------- */
  out["wv-longitudinal"] = (() => {
    let dots = "";
    const len = 120;
    for (let i = 0; i < 52; i++) {
      const x0 = 120 + i * 8.6;
      const x = x0 + 7 * Math.sin(2 * Math.PI * (x0 - 120) / len);
      for (let r = 0; r < 6; r++) dots += `<circle cx="${x.toFixed(1)}" cy="${62 + r * 16 + ((i % 2) ? 5 : 0)}" r="3.2" fill="#2f6fb0"/>`;
    }
    const body = `
    <path d="M30 70 h30 l34 -30 v130 l-34 -30 h-30Z" fill="#3b3f45"/>
    <path d="M94 40 q14 65 0 130" fill="none" stroke="#6b7078" stroke-width="4"/>
    <path d="M96 196 l-10 0 M96 196 l10 0" stroke="${INK}" stroke-width="2"/>
    ${arrowHead(84, 196, 180, INK, 7)}${arrowHead(108, 196, 0, INK, 7)}
    <text x="96" y="218" text-anchor="middle" class="cap">vibrates</text>
    ${dots}
    <text x="180" y="34" text-anchor="middle" class="cap" font-weight="700">compression</text>
    <text x="180" y="48" text-anchor="middle" class="cap">(squashed together)</text>
    <text x="360" y="34" text-anchor="middle" class="cap" font-weight="700">rarefaction</text>
    <text x="360" y="48" text-anchor="middle" class="cap">(spread out)</text>
    <line x1="330" y1="200" x2="540" y2="200" stroke="${INK}" stroke-width="2"/>${arrowHead(546, 200, 0, INK, 9)}
    <text x="440" y="222" text-anchor="middle" class="cap">the sound travels this way</text>
    <line x1="190" y1="200" x2="270" y2="200" stroke="${INK}" stroke-width="2"/>${arrowHead(186, 200, 180, INK, 8)}${arrowHead(274, 200, 0, INK, 8)}
    <text x="230" y="222" text-anchor="middle" class="cap">particles move back and forth</text>`;
    return svg(580, 236, body);
  })();

  /* ---------------- Reflection in a plane mirror ---------------- */
  out["wv-reflection"] = (() => {
    const ang = 40 * Math.PI / 180, L = 200, P = [300, 250];
    const A = [P[0] - L * Math.sin(ang), P[1] - L * Math.cos(ang)];
    const B = [P[0] + L * Math.sin(ang), P[1] - L * Math.cos(ang)];
    const arc = (r, side) => `M${P[0]} ${P[1] - r} A${r} ${r} 0 0 ${side > 0 ? 1 : 0} ${(P[0] + side * r * Math.sin(ang)).toFixed(1)} ${(P[1] - r * Math.cos(ang)).toFixed(1)}`;
    let hatch = "";
    for (let x = 70; x <= 530; x += 14) hatch += `<line x1="${x}" y1="252" x2="${x - 10}" y2="266" stroke="#7a8a96" stroke-width="1.4"/>`;
    const body = `
    ${hatch}
    <line x1="60" y1="250" x2="540" y2="250" stroke="#4a6274" stroke-width="5"/>
    ${dashed(300, 40, 300, 250)}
    <path d="${arc(52, -1)}" fill="none" stroke="${INK}" stroke-width="1.6"/>
    <path d="${arc(58, 1)}" fill="none" stroke="${INK}" stroke-width="1.6"/>
    <text x="${(P[0] - 74 * Math.sin(ang / 2)).toFixed(1)}" y="${(P[1] - 74 * Math.cos(ang / 2) + 5).toFixed(1)}" text-anchor="middle" font-style="italic">i</text>
    <text x="${(P[0] + 78 * Math.sin(ang / 2)).toFixed(1)}" y="${(P[1] - 78 * Math.cos(ang / 2) + 5).toFixed(1)}" text-anchor="middle" font-style="italic">r</text>
    ${ray(A, P)}${ray(P, B)}
    ${label("mirror", "Mirror", [110, 250], [86, 226], "end")}
    ${label("normal", "Normal", [300, 62], [326, 30])}
    ${label("incident", "Incident ray", [200, 131], [166, 176], "end")}
    ${label("reflected", "Reflected ray", [400, 131], [436, 176])}
    ${label("angle-i", "Angle of incidence", [286, 214], [276, 300], "end")}
    ${label("angle-r", "Angle of reflection", [316, 212], [326, 300])}
    <text x="580" y="226" text-anchor="end" class="cap">angle i = angle r</text>`;
    return svg(600, 320, body);
  })();

  /* ---------------- Refraction through a glass block ---------------- */
  out["wv-refraction"] = (() => {
    const i = 50 * Math.PI / 180, r = Math.asin(Math.sin(i) / 1.5);
    const top = 130, bot = 290, P = [250, top];
    const A = [P[0] - 130 * Math.sin(i), top - 130 * Math.cos(i)];
    const Q = [P[0] + (bot - top) * Math.tan(r), bot];
    const E = [Q[0] + 130 * Math.sin(i), bot + 130 * Math.cos(i)];
    const along = ([x1, y1], [x2, y2], t) => [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
    const ai = along(A, P, 0.3), ar = along(P, Q, 0.3), ae = along(Q, E, 0.78);
    const body = `
    <rect x="170" y="${top}" width="250" height="${bot - top}" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2.5"/>
    ${dashed(P[0], top - 90, P[0], top + 80)}
    ${dashed(Q[0], bot - 80, Q[0], bot + 90)}
    ${ray(A, P)}${ray(P, Q)}${ray(Q, E)}
    ${label("incident", "Incident ray", ai, [150, 104], "end")}
    ${label("normal", "Normal", [P[0], top - 70], [278, 44])}
    ${label("refracted", "Refracted ray", ar, [456, 196])}
    ${label("emergent", "Emergent ray", ae, [456, 344])}
    ${label("block", "Glass block", [200, 260], [150, 270], "end")}
    <text x="300" y="${top - 14}" class="cap">into glass: bends towards the normal</text>
    <text x="20" y="${bot + 26}" class="cap">out of glass: bends away</text>
    <text x="20" y="${bot + 42}" class="cap">from the normal</text>`;
    return svg(600, 420, body);
  })();

  /* ---------------- The eye ---------------- */
  out["wv-eye"] = (() => {
    const c = [330, 170], R = 110;
    const body = `
    <circle cx="${c[0]}" cy="${c[1]}" r="${R}" fill="#fbfaf6" stroke="#9aa3ab" stroke-width="3"/>
    <path d="M${(c[0] + (R - 4) * Math.cos(1.2)).toFixed(1)} ${(c[1] - (R - 4) * Math.sin(1.2)).toFixed(1)} A${R - 4} ${R - 4} 0 0 1 ${(c[0] + (R - 4) * Math.cos(1.2)).toFixed(1)} ${(c[1] + (R - 4) * Math.sin(1.2)).toFixed(1)}" fill="none" stroke="#d9534f" stroke-width="6"/>
    <path d="M232 120 C200 140 200 200 232 220" fill="#e6f3fb" stroke="#7fb3d5" stroke-width="2.5"/>
    <rect x="236" y="114" width="7" height="40" rx="3" fill="#4f7f5f"/>
    <rect x="236" y="186" width="7" height="40" rx="3" fill="#4f7f5f"/>
    <ellipse cx="258" cy="170" rx="13" ry="36" fill="#cfe6f5" stroke="#5d8aa8" stroke-width="2"/>
    <path d="M430 196 C470 200 500 206 560 214 L560 250 C500 244 466 236 422 222Z" fill="#e3b23c" stroke="#8a6d10" stroke-width="2"/>
    ${ray([30, 120], [214, 156], RAY, 2.5)}<line x1="214" y1="156" x2="434" y2="170" stroke="${RAY}" stroke-width="2.5"/>
    ${ray([30, 220], [214, 184], RAY, 2.5)}<line x1="214" y1="184" x2="434" y2="170" stroke="${RAY}" stroke-width="2.5"/>
    ${label("cornea", "Cornea", [210, 136], [190, 30], "end")}
    ${label("iris", "Iris", [240, 124], [246, 30])}
    ${label("lens", "Lens", [262, 148], [300, 30])}
    ${label("pupil", "Pupil", [240, 170], [190, 320], "end")}
    ${label("retina", "Retina", [405, 95], [440, 40])}
    ${label("optic", "Optic nerve", [520, 226], [470, 320])}`;
    return svg(600, 340, body);
  })();

  /* ---------------- White light through a prism ---------------- */
  out["wv-prism"] = (() => {
    const cols = [["Red", "#e53935"], ["Orange", "#fb8c00"], ["Yellow", "#f2c200"], ["Green", "#43a047"], ["Blue", "#1e88e5"], ["Indigo", "#3949ab"], ["Violet", "#8e24aa"]];
    const entry = [242, 176], ex0 = [327, 152], ex1 = [342, 186];
    let fan = `<path d="M${entry[0]} ${entry[1]} L${ex0[0]} ${ex0[1]} L${ex1[0]} ${ex1[1]}Z" fill="#f4f4f4" opacity=".9"/>`;
    cols.forEach(([name, col], k) => {
      const t = k / 6, sx = ex0[0] + (ex1[0] - ex0[0]) * t, sy = ex0[1] + (ex1[1] - ex0[1]) * t, ey = 120 + k * 24;
      fan += `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="540" y2="${ey}" stroke="${col}" stroke-width="4"/>
              <text x="552" y="${ey + 4.5}" font-weight="700" fill="${col}" style="fill:${col}">${name}</text>`;
    });
    const body = `
    <path d="M200 270 L380 270 L290 70Z" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2.5" opacity=".95"/>
    ${fan}
    <line x1="30" y1="214" x2="${entry[0]}" y2="${entry[1]}" stroke="#9aa3ab" stroke-width="7"/>
    <line x1="30" y1="214" x2="${entry[0]}" y2="${entry[1]}" stroke="#ffffff" stroke-width="4"/>
    ${arrowHead(140, 193.3, -9.9, "#6a6d71", 9)}
    <line x1="540" y1="100" x2="540" y2="290" stroke="#3b3f45" stroke-width="4"/>
    <text x="30" y="244" font-weight="700">White light</text>
    <text x="290" y="296" text-anchor="middle" class="cap">Glass prism</text>
    <text x="540" y="312" text-anchor="middle" class="cap">screen: a spectrum</text>`;
    return svg(640, 324, body);
  })();

  /* ---------------- Convex and concave lenses ---------------- */
  out["wv-lenses"] = (() => {
    const ys = [80, 120, 160];
    let a = `<path d="M150 46 Q182 120 150 194 Q118 120 150 46Z" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2"/>`;
    for (const y of ys) a += ray([20, y], [150, y]) + `<line x1="150" y1="${y}" x2="250" y2="120" stroke="${RAY}" stroke-width="3"/><line x1="250" y1="120" x2="290" y2="${120 + (120 - y) * 0.4}" stroke="${RAY}" stroke-width="3"/>`;
    a += `<circle cx="250" cy="120" r="4.5" fill="${INK}"/><text x="250" y="150" text-anchor="middle" class="cap" font-weight="700">focus</text>`;
    let b = `<path d="M436 46 L464 46 Q450 120 464 194 L436 194 Q450 120 436 46Z" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2"/>`;
    for (const y of ys) {
      const s = (y - 120) / 100;
      b += ray([320, y], [450, y]) + `<line x1="450" y1="${y}" x2="590" y2="${y + s * 140}" stroke="${RAY}" stroke-width="3"/>`;
      if (y !== 120) b += `<line x1="450" y1="${y}" x2="350" y2="120" stroke="${RAY}" stroke-width="1.4" stroke-dasharray="4 4" opacity=".8"/>`;
    }
    const body = `${a}${b}
    <text x="150" y="226" text-anchor="middle" class="title">Convex lens</text>
    <text x="150" y="244" text-anchor="middle" class="cap">thicker in the middle: rays come together</text>
    <text x="450" y="226" text-anchor="middle" class="title">Concave lens</text>
    <text x="450" y="244" text-anchor="middle" class="cap">thinner in the middle: rays spread out</text>`;
    return svg(600, 256, body);
  })();

  /* ---------------- Eclipses ---------------- */
  out["wv-eclipse"] = (() => {
    const sun = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd54f" stroke="#e0a800" stroke-width="2"/>`;
    const earth = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#5aa0d8" stroke="#2f6fb0" stroke-width="2"/><path d="M${x - r * 0.5} ${y - r * 0.4} q${r * 0.3} -${r * 0.3} ${r * 0.6} 0 q-${r * 0.1} ${r * 0.4} -${r * 0.5} ${r * 0.5}Z" fill="#6dbf67"/>`;
    const moon = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#cfd2d6" stroke="#7d8288" stroke-width="2"/>`;
    // solar eclipse, row 1 (not to scale)
    const y1 = 90, S1 = [60, y1, 36], M1 = [300, y1, 14], E1 = [470, y1, 40];
    const tip = M1[0] + M1[2] * (M1[0] - S1[0]) / (S1[2] - M1[2]);
    const pSlope = (S1[2] + M1[2]) / (M1[0] - S1[0]);
    const row1 = `
      <text x="300" y="24" text-anchor="middle" class="title">Solar eclipse: the Moon blocks the Sun's light</text>
      ${sun(...S1)}${earth(...E1)}
      <path d="M${M1[0]} ${y1 - M1[2]} L460 ${(y1 - M1[2] - pSlope * 160).toFixed(1)} L460 ${(y1 + M1[2] + pSlope * 160).toFixed(1)} L${M1[0]} ${y1 + M1[2]}Z" fill="#555" opacity=".18"/>
      <path d="M${M1[0]} ${y1 - M1[2]} L${tip.toFixed(1)} ${y1} L${M1[0]} ${y1 + M1[2]}Z" fill="#222" opacity=".55"/>
      ${moon(...M1)}
      <text x="60" y="${y1 + 56}" text-anchor="middle" class="cap">Sun</text>
      <text x="300" y="${y1 + 34}" text-anchor="middle" class="cap">Moon</text>
      <text x="470" y="${y1 + 58}" text-anchor="middle" class="cap">Earth</text>
      <line x1="${(tip - 6).toFixed(1)}" y1="${y1}" x2="530" y2="${y1 - 46}" stroke="#6a6d71" stroke-width="1.2"/>
      <text x="534" y="${y1 - 50}" class="cap">total eclipse here</text>
      <line x1="440" y1="${y1 + 26}" x2="530" y2="${y1 + 44}" stroke="#6a6d71" stroke-width="1.2"/>
      <text x="534" y="${y1 + 48}" class="cap">partial here</text>`;
    // lunar eclipse, row 2
    const y2 = 240, S2 = [60, y2, 36], E2 = [300, y2, 30], M2 = [480, y2, 12];
    const uSlope = (S2[2] - E2[2]) / (E2[0] - S2[0]);
    const row2 = `
      <text x="300" y="${y2 - 60}" text-anchor="middle" class="title">Lunar eclipse: the Moon moves into Earth's shadow</text>
      ${sun(...S2)}
      <path d="M${E2[0]} ${y2 - E2[2]} L540 ${(y2 - E2[2] + uSlope * 240).toFixed(1)} L540 ${(y2 + E2[2] - uSlope * 240).toFixed(1)} L${E2[0]} ${y2 + E2[2]}Z" fill="#222" opacity=".4"/>
      ${earth(...E2)}${moon(...M2)}
      <text x="60" y="${y2 + 56}" text-anchor="middle" class="cap">Sun</text>
      <text x="300" y="${y2 + 50}" text-anchor="middle" class="cap">Earth</text>
      <text x="480" y="${y2 + 50}" text-anchor="middle" class="cap">Moon (looks dark red)</text>
      <text x="300" y="${y2 + 78}" text-anchor="middle" class="cap">Not to scale: the Sun is far bigger and further away.</text>`;
    return svg(660, 330, row1 + row2);
  })();

  /* ---------------- Periscope ---------------- */
  out["wv-periscope"] = (() => {
    const body = `
    <rect x="256" y="36" width="68" height="228" fill="#f4f6f8"/>
    <path d="M256 100 V264 H324 M256 36 H324 V196" fill="none" stroke="#5c6168" stroke-width="10" stroke-linecap="square"/>
    <line x1="262" y1="42" x2="318" y2="98" stroke="#4a6274" stroke-width="6"/>
    <line x1="262" y1="202" x2="318" y2="258" stroke="#4a6274" stroke-width="6"/>
    ${ray([70, 70], [290, 70])}${ray([290, 70], [290, 230])}${ray([290, 230], [480, 230])}
    <path d="M40 92 v-30 M40 62 l-14 22 h28Z" fill="#43a047" stroke="#2e7d32" stroke-width="2"/>
    <path d="M40 92 v10" stroke="#795548" stroke-width="4"/>
    <path d="M490 216 C506 204 528 204 540 230 C528 256 506 256 490 244 Z" fill="#fff" stroke="${INK}" stroke-width="2"/>
    <circle cx="512" cy="230" r="9" fill="#4f7f5f"/><circle cx="512" cy="230" r="4" fill="${INK}"/>
    <text x="40" y="122" text-anchor="middle" class="cap">object</text>
    <text x="350" y="60" class="cap">mirror at 45°</text>
    <text x="350" y="76" class="cap">turns the light down</text>
    <text x="350" y="276" class="cap">mirror at 45° turns it</text>
    <text x="350" y="292" class="cap">back towards the eye</text>
    <text x="515" y="272" text-anchor="middle" class="cap">eye</text>`;
    return svg(580, 310, body);
  })();

  /* =========================================================
     Year 8 (Part 2): wave effects and wave properties
     ========================================================= */

  /* ---------------- The electromagnetic spectrum ---------------- */
  out["wv-spectrum"] = (() => {
    const rows = [
      ["radio", "Radio waves", "#cfd8dc", 1],
      ["microwave", "Microwaves", "#d7ccc8", 1.6],
      ["infrared", "Infrared", "#ffccbc", 2.4],
      ["visible", "Visible light", "url(#wvSpecGrad)", 3.4],
      ["uv", "Ultraviolet (UV)", "#d1c4e9", 4.6],
      ["xray", "X-rays", "#c5cae9", 6.2],
      ["gamma", "Gamma rays", "#b39ddb", 8.2]
    ];
    const x0 = 200, w = 130, y0 = 46, rh = 42;
    let body = `<defs><linearGradient id="wvSpecGrad" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#ef9a9a"/><stop offset=".2" stop-color="#ffcc80"/><stop offset=".38" stop-color="#fff59d"/>
      <stop offset=".56" stop-color="#a5d6a7"/><stop offset=".76" stop-color="#90caf9"/><stop offset="1" stop-color="#ce93d8"/></linearGradient></defs>
    <text x="${x0 + w / 2}" y="28" text-anchor="middle" class="title">The electromagnetic spectrum</text>`;
    rows.forEach(([part, name, fill, n], i) => {
      const y = y0 + i * rh, mid = y + rh / 2;
      body += `<rect x="${x0}" y="${y}" width="${w}" height="${rh}" fill="${fill}" stroke="#5c6168" stroke-width="1.5"/>
      <path d="${wavePath(x0 + 8, x0 + w - 8, mid, 11, (w - 16) / n)}" fill="none" stroke="${INK}" stroke-width="2"/>
      ${label(part, name, [x0 + w, mid], [x0 + w + 40, mid])}`;
    });
    const yb = y0 + 7 * rh;
    body += `
    <line x1="120" y1="${y0 + 34}" x2="120" y2="${yb - 30}" stroke="${INK}" stroke-width="2.2"/>${arrowHead(120, yb - 26, 90, INK, 10)}
    <text x="120" y="${y0 + 8}" text-anchor="middle" class="cap">lower frequency</text>
    <text x="120" y="${y0 + 22}" text-anchor="middle" class="cap">less energy</text>
    <text x="120" y="${yb - 2}" text-anchor="middle" class="cap">higher frequency</text>
    <text x="120" y="${yb + 12}" text-anchor="middle" class="cap">more energy</text>
    <text x="270" y="${yb + 34}" text-anchor="middle" class="cap">UV, X-rays and gamma rays carry enough energy to damage living cells.</text>`;
    return svg(540, yb + 50, body);
  })();

  /* ---------------- A loudspeaker ---------------- */
  out["wv-speaker"] = (() => {
    let coil = "";
    for (let x = 156; x <= 204; x += 7) coil += `<rect x="${x}" y="128" width="4.5" height="44" rx="2" fill="#c77d32" stroke="#8a5216" stroke-width="1"/>`;
    let arcs = "";
    for (let k = 0; k < 3; k++) arcs += `<path d="M${400 + k * 34} 100 q24 50 0 100" fill="none" stroke="#2f6fb0" stroke-width="3" stroke-linecap="round" opacity="${1 - k * 0.25}"/>`;
    const body = `
    <rect x="60" y="92" width="115" height="34" rx="4" fill="#c0392b" stroke="#7b2219" stroke-width="2"/>
    <rect x="60" y="174" width="115" height="34" rx="4" fill="#2c6fb7" stroke="#1b4677" stroke-width="2"/>
    <rect x="60" y="126" width="40" height="48" fill="#8d9399" stroke="#5c6168" stroke-width="2"/><rect x="100" y="140" width="112" height="20" fill="#8d9399" stroke="#5c6168" stroke-width="2"/>
    <text x="105" y="114" text-anchor="middle" fill="#fff" font-weight="700">N</text>
    <text x="105" y="196" text-anchor="middle" fill="#fff" font-weight="700">S</text>
    
    ${coil}
    <path d="M212 128 L340 40 L352 40 L352 260 L340 260 L212 172 Z" fill="#e9e4da" stroke="#5c6168" stroke-width="2.5" stroke-linejoin="round"/>
    <line x1="364" y1="150" x2="388" y2="150" stroke="${INK}" stroke-width="1.8"/>${arrowHead(360, 150, 180, INK, 7)}${arrowHead(392, 150, 0, INK, 7)}
    <text x="378" y="276" text-anchor="middle" class="cap">the cone moves in and out</text>
    ${arcs}
    <path d="M192 172 C192 236 140 250 40 250 M204 172 C204 252 140 266 40 266" fill="none" stroke="${INK}" stroke-width="2.2"/>
    <text x="34" y="304" class="cap">changing current from the amplifier</text>
    ${label("magnet", "Permanent magnet", [80, 100], [40, 30])}
    ${label("coil", "Coil of wire", [196, 130], [250, 70], "end")}
    ${label("cone", "Cone", [290, 90], [302, 22])}
    ${label("sound", "Sound wave", [446, 116], [470, 60])}
    ${label("wires", "Wires", [100, 251], [60, 228], "end")}`;
    return svg(560, 320, body);
  })();

  /* ---------------- Microphone: pressure wave to current ---------------- */
  out["wv-mic-signal"] = (() => {
    let dots = "";
    const len = 130, xs = 30, xe = 290;
    for (let i = 0; i < 31; i++) {
      const x0 = xs + i * 8.6;
      const x = x0 + 12 * Math.sin(2 * Math.PI * (x0 - xs) / len);
      if (x > xe) continue;
      for (let r = 0; r < 5; r++) dots += `<circle cx="${x.toFixed(1)}" cy="${78 + r * 15 + ((i % 2) ? 5 : 0)}" r="3" fill="#2f6fb0"/>`;
    }
    const sx = 330, sy = 194, sw = 230, sh = 100;
    let grid = "";
    for (let gx = sx + sw / 6; gx < sx + sw - 1; gx += sw / 6) grid += `<line x1="${gx.toFixed(1)}" y1="${sy}" x2="${gx.toFixed(1)}" y2="${sy + sh}" stroke="#34463c" stroke-width="1"/>`;
    grid += `<line x1="${sx}" y1="${sy + sh / 2}" x2="${sx + sw}" y2="${sy + sh / 2}" stroke="#34463c" stroke-width="1"/>`;
    const body = `
    <text x="160" y="40" text-anchor="middle" class="title">Sound: a pressure wave</text>
    ${dots}
    <text x="${xs + len / 2}" y="172" text-anchor="middle" class="cap">high</text>
    <text x="${xs + len / 2}" y="186" text-anchor="middle" class="cap">pressure</text>
    <text x="${xs + len}" y="172" text-anchor="middle" class="cap">low</text>
    <text x="${xs + len}" y="186" text-anchor="middle" class="cap">pressure</text>
    <line x1="60" y1="214" x2="240" y2="214" stroke="${INK}" stroke-width="2"/>${arrowHead(246, 214, 0, INK, 9)}
    <text x="150" y="236" text-anchor="middle" class="cap">travels to the microphone</text>
    <rect x="300" y="70" width="10" height="90" rx="3" fill="#e9e4da" stroke="#5c6168" stroke-width="2"/>
    <path d="M310 80 H380 Q404 115 380 150 H310" fill="#5c6168" stroke="#3b3f45" stroke-width="2"/>
    <text x="305" y="58" text-anchor="middle" class="cap">diaphragm</text>
    <text x="440" y="100" class="cap" font-weight="700">microphone</text>
    <text x="440" y="116" class="cap">vibrates in the</text>
    <text x="440" y="132" class="cap">same pattern</text>
    <path d="M392 120 C430 140 445 160 445 ${sy - 4}" fill="none" stroke="${INK}" stroke-width="2.2"/>
    <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="8" fill="${SCREEN}"/>${grid}
    <path d="${wavePath(sx + 6, sx + sw - 6, sy + sh / 2, 34, (sw - 12) / 3, Math.PI / 2)}" fill="none" stroke="${TRACE}" stroke-width="2.6"/>
    <text x="${sx + sw / 2}" y="${sy + sh + 20}" text-anchor="middle" class="cap">the electric current rises and falls</text>
    <text x="${sx + sw / 2}" y="${sy + sh + 36}" text-anchor="middle" class="cap">in the same pattern as the pressure</text>`;
    return svg(590, 350, body);
  })();

  /* ---------------- Transverse and longitudinal waves ---------------- */
  out["wv-types"] = (() => {
    const mid = 110, amp = 34, len = 150, x0 = 60;
    let coils = "";
    const ly = 270, lenL = 120;
    for (let i = 0; i < 46; i++) {
      const b = 60 + i * 10;
      const x = b + 9 * Math.sin(2 * Math.PI * (b - 60) / lenL);
      coils += `<ellipse cx="${x.toFixed(1)}" cy="${ly}" rx="3" ry="24" fill="none" stroke="#2f6fb0" stroke-width="2.2"/>`;
    }
    const body = `
    <text x="20" y="40" class="title">Transverse</text>
    <path d="${wavePath(x0, 510, mid, amp, len)}" fill="none" stroke="#c0392b" stroke-width="4"/>
    <line x1="560" y1="${mid - 34}" x2="560" y2="${mid + 34}" stroke="${INK}" stroke-width="2"/>
    ${arrowHead(560, mid - 38, -90, INK, 8)}${arrowHead(560, mid + 38, 90, INK, 8)}
    <text x="560" y="${mid + 62}" text-anchor="middle" class="cap">vibration:</text>
    <text x="560" y="${mid + 76}" text-anchor="middle" class="cap">up and down</text>
    <line x1="250" y1="186" x2="400" y2="186" stroke="${INK}" stroke-width="2"/>${arrowHead(404, 186, 0, INK, 9)}
    <text x="410" y="190" class="cap">wave travels</text>
    <text x="20" y="232" class="title">Longitudinal</text>
    ${coils}
    <line x1="530" y1="${ly}" x2="590" y2="${ly}" stroke="${INK}" stroke-width="2"/>
    ${arrowHead(526, ly, 180, INK, 8)}${arrowHead(594, ly, 0, INK, 8)}
    <text x="560" y="${ly + 40}" text-anchor="middle" class="cap">vibration:</text>
    <text x="560" y="${ly + 54}" text-anchor="middle" class="cap">back and forth</text>
    <line x1="250" y1="336" x2="400" y2="336" stroke="${INK}" stroke-width="2"/>${arrowHead(404, 336, 0, INK, 9)}
    <text x="410" y="340" class="cap">wave travels</text>
    ${label("crest", "Crest", [x0 + len / 4, mid - amp], [140, 40])}
    ${label("trough", "Trough", [x0 + 7 * len / 4, mid + amp], [140, 186], "end")}
    ${label("compression", "Compression", [120, ly - 24], [170, 222])}
    ${label("rarefaction", "Rarefaction", [180, ly + 24], [150, 336], "end")}`;
    return svg(620, 360, body);
  })();

  /* ---------------- A wave meeting a barrier ---------------- */
  out["wv-meet"] = (() => {
    let heat = "";
    for (let k = 0; k < 3; k++) heat += `<path d="M${296 + k * 16} 196 q-6 -8 0 -16 q6 -8 0 -16" fill="none" stroke="#c0392b" stroke-width="2"/>`;
    const body = `
    <rect x="280" y="40" width="70" height="170" fill="#d7ccc8" stroke="#795548" stroke-width="2.5"/>
    <text x="315" y="232" text-anchor="middle" class="cap">material</text>
    <path d="${wavePath(30, 278, 160, 34, 62)}" fill="none" stroke="#2f6fb0" stroke-width="3.5"/>
    <line x1="60" y1="210" x2="150" y2="210" stroke="#2f6fb0" stroke-width="2"/>${arrowHead(156, 210, 0, "#2f6fb0", 9)}
    <path d="${wavePath(110, 278, 70, 18, 62)}" fill="none" stroke="#2f6fb0" stroke-width="2.5" stroke-dasharray="7 4"/>
    <line x1="100" y1="34" x2="40" y2="34" stroke="#2f6fb0" stroke-width="2"/>${arrowHead(34, 34, 180, "#2f6fb0", 9)}
    ${heat}
    <path d="${wavePath(352, 560, 130, 12, 62)}" fill="none" stroke="#2f6fb0" stroke-width="2.5"/>
    <line x1="420" y1="168" x2="510" y2="168" stroke="#2f6fb0" stroke-width="2"/>${arrowHead(516, 168, 0, "#2f6fb0", 9)}
    ${label("incoming", "Incoming wave", [60, 136], [30, 264])}
    ${label("reflected", "Reflected", [187.5, 52], [214, 20])}
    ${label("absorbed", "Absorbed", [312, 172], [390, 264])}
    ${label("transmitted", "Transmitted", [460, 130], [440, 70])}
    <text x="390" y="282" class="cap">(energy warms the material)</text>`;
    return svg(580, 296, body);
  })();

  /* ---------------- Two waves combining ---------------- */
  out["wv-superpose"] = (() => {
    const panel = (x, title, flip, result) => {
      const w = 220, l = w / 2;
      const p = (y, a, ph, col, dash = "") => `<path d="${wavePath(x, x + w, y, a, l, ph)}" fill="none" stroke="${col}" stroke-width="3"${dash}/>`;
      return `<text x="${x + w / 2}" y="34" text-anchor="middle" class="title">${title}</text>
        ${p(80, 20, 0, "#2f6fb0")}
        <text x="${x + w / 2}" y="124" text-anchor="middle" font-weight="700" font-size="22">+</text>
        ${p(160, 20, flip ? Math.PI : 0, "#c0392b")}
        <text x="${x + w / 2}" y="206" text-anchor="middle" font-weight="700" font-size="22">=</text>
        ${result === "big" ? p(260, 40, 0, "#6a3d9a") : `<line x1="${x}" y1="260" x2="${x + w}" y2="260" stroke="#6a3d9a" stroke-width="3"/>`}
        <text x="${x + w / 2}" y="324" text-anchor="middle" class="cap">${result === "big" ? "crests meet crests: a bigger wave" : "crests meet troughs: they cancel out"}</text>`;
    };
    return svg(560, 340, panel(30, "In step", false, "big") + panel(310, "Out of step", true, "flat"));
  })();

  return out;
}
