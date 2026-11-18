/* =========================================================
   Organisms, Year 8 (3.8.3 Breathing, 3.8.4 Digestion).
   The Year 7 organisms drawings (skeleton, cells, …) live in
   tools/build-science-art.mjs itself.
   or-lungs      the gas exchange system in the chest (8 labelled parts)
   or-alveolus   one alveolus and its capillary (5 labelled parts)
   or-belljar    the bell jar model of breathing (5 labelled parts)
   or-breathing  breathing in and breathing out, side by side
   or-gut        the digestive system (9 labelled parts)
   or-villi      villi in the small intestine (4 labelled parts)
   or-enzymes    enzymes cut big food molecules into small ones
   ========================================================= */

export default function (h) {
  const { svg, label, INK, BONE, BONE_EDGE, MUSCLE, MUSCLE_DARK } = h;
  const LUNG = "#f6c1bd", LUNG_EDGE = "#b8544e";
  const AIRWAY = "#f4ece0", AIRWAY_EDGE = "#8a7f70";
  const BLOOD = "#d64541", BLOOD_DARK = "#8f2f2c";
  const O2 = "#2a78d6", CO2 = "#6a6d71";
  const GUT = "#f3b8a6", GUT_EDGE = "#b5654f";
  const LIVER = "#a85a44", LIVER_EDGE = "#6e3526";
  const PANC = "#f2d47e", PANC_EDGE = "#b08d1e";
  const LARGE = "#e2a77c", LARGE_EDGE = "#9a6236";
  const GREY = "#8a8d91";

  const arrow = (x1, y1, x2, y2, colour = INK, w = 2.5) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const p = (d, t) => `${(x2 - Math.cos(a + t) * d).toFixed(1)},${(y2 - Math.sin(a + t) * d).toFixed(1)}`;
    return `<line x1="${x1}" y1="${y1}" x2="${(x2 - Math.cos(a) * 7).toFixed(1)}" y2="${(y2 - Math.sin(a) * 7).toFixed(1)}" stroke="${colour}" stroke-width="${w}"/>
      <polygon points="${x2},${y2} ${p(12, 0.42)} ${p(12, -0.42)}" fill="${colour}"/>`;
  };

  const out = {};

  /* ---------------- The gas exchange system ---------------- */
  out["or-lungs"] = (() => {
    const c = 320;
    // one lung (s = -1 viewer's left, +1 right)
    const lung = s => `<path d="M${c + s * 34} 132 C${c + s * 60} 104 ${c + s * 110} 108 ${c + s * 128} 150
      C${c + s * 144} 200 ${c + s * 146} 280 ${c + s * 138} 352 C${c + s * 110} 340 ${c + s * 70} 336 ${c + s * 30} 350
      C${c + s * 22} 300 ${c + s * 22} 200 ${c + s * 34} 132Z" fill="${LUNG}" stroke="${LUNG_EDGE}" stroke-width="2.5"/>`;
    const tube = (pts, w) => `<polyline points="${pts}" fill="none" stroke="${AIRWAY_EDGE}" stroke-width="${w + 2.5}" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${pts}" fill="none" stroke="${AIRWAY}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const sacs = (x, y) => [[0, 0], [7, -5], [7, 5], [-2, 8], [12, 0]].map(([dx, dy]) =>
      `<circle cx="${x + dx}" cy="${y + dy}" r="4.6" fill="#fbe1de" stroke="${LUNG_EDGE}" stroke-width="1.2"/>`).join("");
    // bronchioles: branches from the end of each bronchus
    const branches = s => {
      const bx = c + s * 62, by = 200;
      const ends = [[s * 50, -40], [s * 64, 4], [s * 52, 60], [s * 18, 92], [s * 34, 128]];
      return ends.map(([dx, dy]) => tube(`${bx},${by} ${bx + dx * 0.55},${by + dy * 0.55} ${bx + dx},${by + dy}`, 4)).join("") +
        ends.map(([dx, dy]) => sacs(bx + dx + s * 3, by + dy)).join("");
    };
    // ribs in cross-section down each side, intercostal muscles between
    const ribYs = [140, 192, 244, 296];
    const wall = s => {
      const x = c + s * 166;
      return ribYs.map((y, i) => (i < ribYs.length - 1 ? `<rect x="${x - 6}" y="${y + 12}" width="12" height="28" rx="3" fill="${MUSCLE}" stroke="${MUSCLE_DARK}" stroke-width="1.5"/>` : "")).join("") +
        ribYs.map(y => `<ellipse cx="${x}" cy="${y}" rx="11" ry="13" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/>`).join("");
    };
    const body = `
    ${wall(-1)}${wall(1)}
    ${lung(-1)}${lung(1)}
    <!-- diaphragm -->
    <path d="M${c - 172} 396 C${c - 130} 330 ${c + 130} 330 ${c + 172} 396" fill="none" stroke="${MUSCLE_DARK}" stroke-width="16" stroke-linecap="round"/>
    <path d="M${c - 172} 396 C${c - 130} 330 ${c + 130} 330 ${c + 172} 396" fill="none" stroke="${MUSCLE}" stroke-width="12" stroke-linecap="round"/>
    <!-- trachea and bronchi -->
    ${tube(`${c},30 ${c},150 ${c - 62},200`, 16)}
    ${tube(`${c},150 ${c + 62},200`, 16)}
    ${[44, 62, 80, 98, 116, 134].map(y => `<line x1="${c - 8}" y1="${y}" x2="${c + 8}" y2="${y}" stroke="${AIRWAY_EDGE}" stroke-width="2.5"/>`).join("")}
    ${branches(-1)}${branches(1)}
    ${label("trachea", "Trachea", [c - 4, 70], [c - 150, 54], "end")}
    ${label("rib", "Rib", [c - 172, 192], [c - 215, 170], "end")}
    ${label("intercostal", "Intercostal muscle", [c - 166, 226], [c - 192, 262], "end")}
    ${label("diaphragm", "Diaphragm", [c - 120, 360], [c - 190, 410], "end")}
    ${label("bronchus", "Bronchus", [c + 40, 180], [c + 150, 64])}
    ${label("bronchiole", "Bronchiole", [c + 90, 223], [c + 205, 150])}
    ${label("alveoli", "Alveoli", [c + 122, 268], [c + 205, 250])}
    ${label("lung", "Lung", [c + 126, 306], [c + 205, 330])}
    <text x="${c}" y="440" text-anchor="middle" class="cap">The chest from the front. Air goes trachea → bronchi → bronchioles → alveoli.</text>`;
    return svg(640, 452, body);
  })();

  /* ---------------- One alveolus and its capillary ---------------- */
  out["or-alveolus"] = (() => {
    const cx = 290, cy = 210, r = 96;
    const pt = (deg, rad) => [cx + Math.cos(deg * Math.PI / 180) * rad, cy + Math.sin(deg * Math.PI / 180) * rad];
    const arc = (a1, a2, rad) => {
      const [x1, y1] = pt(a1, rad), [x2, y2] = pt(a2, rad);
      return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${rad} ${rad} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    };
    const capR = r + 15;
    const cells = [-40, -10, 20, 50, 80, 110, 140, 170].map((a, i) => {
      const [x, y] = pt(a, capR);
      return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7.5" ry="5" transform="rotate(${a + 90} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${BLOOD}" stroke="${BLOOD_DARK}" stroke-width="1"/>`;
    }).join("");
    const [o1x, o1y] = pt(30, r - 40), [o2x, o2y] = pt(30, capR + 2);
    const [c1x, c1y] = pt(80, capR - 2), [c2x, c2y] = pt(80, r - 40);
    const body = `
    <!-- bronchiole leading in -->
    <path d="M${cx - 26} 20 V${cy - r + 8} M${cx + 26} 20 V${cy - r + 8}" stroke="${AIRWAY_EDGE}" stroke-width="3" fill="none"/>
    <rect x="${cx - 24}" y="20" width="48" height="${cy - r - 10}" fill="${AIRWAY}"/>
    <!-- the air sac -->
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#eaf4fb" stroke="${LUNG_EDGE}" stroke-width="3"/>
    <rect x="${cx - 24}" y="${cy - r - 6}" width="48" height="14" fill="#eaf4fb"/>
    <!-- capillary wrapped round it -->
    <path d="${arc(-50, 180, capR)}" fill="none" stroke="${BLOOD_DARK}" stroke-width="24" stroke-linecap="round"/>
    <path d="${arc(-50, 180, capR)}" fill="none" stroke="#f7d2d0" stroke-width="20" stroke-linecap="round"/>
    ${cells}
    ${arrow(o1x, o1y, o2x, o2y, O2, 3)}
    ${arrow(c1x, c1y, c2x, c2y, CO2, 3)}
    <text x="${o1x - 6}" y="${o1y - 10}" text-anchor="middle" style="fill:${O2}" class="title">oxygen</text>
    <text x="${c2x - 12}" y="${c2y - 14}" text-anchor="end" style="fill:${CO2}" class="title">carbon</text>
    <text x="${c2x - 12}" y="${c2y + 2}" text-anchor="end" style="fill:${CO2}" class="title">dioxide</text>
    <text x="${cx + 10}" y="${cy - 50}" text-anchor="middle" class="cap">air</text>
    ${label("bronchiole", "Bronchiole", [cx - 24, 40], [cx - 130, 40], "end")}
    ${label("alveolus", "Alveolus (air sac)", [cx - 40, cy - 40], [cx - 130, 200], "end")}
    ${label("wall", "Wall, one cell thick", [pt(215, r)[0], pt(215, r)[1]], [cx - 130, 120], "end")}
    ${label("capillary", "Capillary", [pt(-30, capR)[0] + 10, pt(-30, capR)[1] - 6], [cx + 140, 80])}
    ${label("rbc", "Red blood cell", [pt(110, capR)[0], pt(110, capR)[1]], [cx + 140, 380])}
    <text x="20" y="440" class="cap">Oxygen diffuses from the air into the blood; carbon dioxide diffuses</text>
    <text x="20" y="458" class="cap">out of the blood into the air, to be breathed out.</text>`;
    return svg(560, 470, body);
  })();

  /* ---------------- Bell jar model ---------------- */
  out["or-belljar"] = (() => {
    const jar = (c, down) => {
      const big = down ? 1.45 : 1;
      const balloon = s => `<ellipse cx="${c + s * 30 * (down ? 1.12 : 1)}" cy="${200 + (down ? 14 : 0)}" rx="${20 * big}" ry="${30 * big}" fill="${LUNG}" stroke="${LUNG_EDGE}" stroke-width="2"/>`;
      return `
      <path d="M${c - 80} 300 V140 C${c - 80} 96 ${c - 40} 84 ${c - 14} 82 V70 h28 V82 C${c + 40} 84 ${c + 80} 96 ${c + 80} 140 V300" fill="#eef6f9" fill-opacity="0.6" stroke="#5f8fa3" stroke-width="3"/>
      <rect x="${c - 22}" y="60" width="44" height="16" rx="3" fill="#c9a77c" stroke="#8b6b45" stroke-width="1.5"/>
      <path d="M${c - 5} 30 V136 L${c - 28} 166 M${c + 5} 30 V136 L${c + 28} 166" stroke="#5f8fa3" stroke-width="2.5" fill="none"/>
      ${balloon(-1)}${balloon(1)}
      ${down
        ? `<path d="M${c - 82} 300 L${c} 330 L${c + 82} 300" fill="none" stroke="#3f3f3f" stroke-width="5" stroke-linejoin="round"/>
           <line x1="${c}" y1="330" x2="${c}" y2="358" stroke="#3f3f3f" stroke-width="3"/>${arrow(c, 340, c, 372, INK, 2.5)}`
        : `<line x1="${c - 84}" y1="300" x2="${c + 84}" y2="300" stroke="#3f3f3f" stroke-width="5"/>
           <line x1="${c}" y1="300" x2="${c}" y2="318" stroke="#3f3f3f" stroke-width="3"/><circle cx="${c}" cy="322" r="5" fill="#3f3f3f"/>`}`;
    };
    const L = 290, R = 530;
    const body = `
    ${jar(L, false)}
    ${jar(R, true)}
    ${arrow(R + 22, 14, R + 22, 52, O2, 2.5)}
    <text x="${R + 32}" y="36" class="cap" style="fill:${O2}">air in</text>
    <text x="${L}" y="402" text-anchor="middle" class="title">Sheet up</text>
    <text x="${R}" y="402" text-anchor="middle" class="title">Pull the sheet down</text>
    ${label("tube", "Glass tube (trachea)", [L, 46], [L - 120, 40], "end")}
    ${label("ytube", "Y-tube (bronchi)", [L - 18, 154], [L - 120, 112], "end")}
    ${label("balloon", "Balloon (lung)", [L - 46, 200], [L - 120, 184], "end")}
    ${label("jar", "Bell jar (ribcage)", [L - 80, 250], [L - 120, 250], "end")}
    ${label("sheet", "Rubber sheet (diaphragm)", [L - 60, 300], [L - 120, 316], "end")}
    <text x="20" y="432" class="cap">Pulling the sheet down makes the space inside the jar bigger, so the pressure drops.</text>
    <text x="20" y="450" class="cap">Air from outside is at a higher pressure, so it is pushed in and the balloons inflate.</text>`;
    return svg(640, 462, body);
  })();

  /* ---------------- Breathing in and out ---------------- */
  out["or-breathing"] = (() => {
    const chest = (c, inhale) => {
      const spread = inhale ? 1.12 : 1, lift = inhale ? -14 : 0;
      const ribs = [0, 1, 2, 3].map(i => {
        const y = 110 + i * 44 + lift;
        return `<path d="M${c} ${y - 14} C${c - 60 * spread} ${y - 22} ${c - 104 * spread} ${y - 2} ${c - 110 * spread} ${y + 24}" fill="none" stroke="${BONE_EDGE}" stroke-width="9" stroke-linecap="round"/>
          <path d="M${c} ${y - 14} C${c - 60 * spread} ${y - 22} ${c - 104 * spread} ${y - 2} ${c - 110 * spread} ${y + 24}" fill="none" stroke="${BONE}" stroke-width="6" stroke-linecap="round"/>
          <path d="M${c} ${y - 14} C${c + 60 * spread} ${y - 22} ${c + 104 * spread} ${y - 2} ${c + 110 * spread} ${y + 24}" fill="none" stroke="${BONE_EDGE}" stroke-width="9" stroke-linecap="round"/>
          <path d="M${c} ${y - 14} C${c + 60 * spread} ${y - 22} ${c + 104 * spread} ${y - 2} ${c + 110 * spread} ${y + 24}" fill="none" stroke="${BONE}" stroke-width="6" stroke-linecap="round"/>`;
      }).join("");
      const lw = inhale ? 1.14 : 1;
      const lungs = [-1, 1].map(s => `<path d="M${c + s * 14} 96 C${c + s * 50 * lw} 82 ${c + s * 88 * lw} 110 ${c + s * 92 * lw} 170 C${c + s * 94 * lw} 220 ${c + s * 90 * lw} ${inhale ? 284 : 250} ${c + s * 84 * lw} ${inhale ? 288 : 256} C${c + s * 60} ${inhale ? 284 : 244} ${c + s * 30} ${inhale ? 284 : 236} ${c + s * 14} ${inhale ? 290 : 236} Z" fill="${LUNG}" stroke="${LUNG_EDGE}" stroke-width="2"/>`).join("");
      const dia = inhale
        ? `M${c - 116} 300 C${c - 60} 290 ${c + 60} 290 ${c + 116} 300`
        : `M${c - 112} 300 C${c - 80} 222 ${c + 80} 222 ${c + 112} 300`;
      return `${lungs}
        ${ribs}
        <rect x="${c - 6}" y="40" width="12" height="60" fill="${AIRWAY}" stroke="${AIRWAY_EDGE}" stroke-width="1.5"/>
        <path d="${dia}" fill="none" stroke="${MUSCLE_DARK}" stroke-width="12" stroke-linecap="round"/>
        <path d="${dia}" fill="none" stroke="${MUSCLE}" stroke-width="8" stroke-linecap="round"/>`;
    };
    const L = 160, R = 470;
    const body = `
    ${chest(L, true)}
    ${chest(R, false)}
    ${arrow(L, 4, L, 36, O2, 3)}
    ${arrow(R, 36, R, 4, CO2, 3)}
    ${arrow(L + 130, 150, L + 140, 120, INK, 2)}${arrow(L - 130, 150, L - 140, 120, INK, 2)}
    ${arrow(L, 260, L, 290, INK, 2)}
    ${arrow(R + 128, 120, R + 120, 150, INK, 2)}${arrow(R - 128, 120, R - 120, 150, INK, 2)}
    ${arrow(R, 284, R, 248, INK, 2)}
    <text x="${L}" y="336" text-anchor="middle" class="title">Breathing in</text>
    <text x="${L}" y="356" text-anchor="middle" class="cap">Intercostal muscles contract: ribs up and out</text>
    <text x="${L}" y="372" text-anchor="middle" class="cap">Diaphragm contracts and flattens</text>
    <text x="${L}" y="388" text-anchor="middle" class="cap">Volume up, pressure down → air in</text>
    <text x="${R}" y="336" text-anchor="middle" class="title">Breathing out</text>
    <text x="${R}" y="356" text-anchor="middle" class="cap">Intercostal muscles relax: ribs down and in</text>
    <text x="${R}" y="372" text-anchor="middle" class="cap">Diaphragm relaxes and domes up</text>
    <text x="${R}" y="388" text-anchor="middle" class="cap">Volume down, pressure up → air out</text>`;
    return svg(630, 400, body);
  })();

  /* ---------------- The digestive system ---------------- */
  out["or-gut"] = (() => {
    const c = 300;
    const tube = (d, w, fill, edge) => `<path d="${d}" fill="none" stroke="${edge}" stroke-width="${w + 3}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    // small intestine: a coiled tube in the middle
    let si = `M${c + 40} 268 C${c + 10} 270 ${c - 60} 268 ${c - 70} 290`;
    for (let i = 0; i < 4; i++) {
      const y = 300 + i * 32;
      si += ` C${c - 80} ${y + 10} ${c + 70} ${y - 4} ${c + 70} ${y + 14} C${c + 70} ${y + 30} ${c - 70} ${y + 18} ${c - 70} ${y + 32}`;
    }
    si += ` C${c - 70} 440 ${c - 90} 440 ${c - 104} 432`;
    const body = `
    <!-- outline of the body -->
    <path d="M${c - 50} 20 C${c - 50} -20 ${c + 50} -20 ${c + 50} 20 C${c + 50} 60 ${c + 30} 76 ${c + 26} 92 C${c + 120} 100 ${c + 150} 130 ${c + 150} 200 V470 C${c + 150} 500 ${c + 100} 520 ${c} 524 C${c - 100} 520 ${c - 150} 500 ${c - 150} 470 V200 C${c - 150} 130 ${c - 120} 100 ${c - 26} 92 C${c - 30} 76 ${c - 50} 60 ${c - 50} 20Z" fill="#fbf6ef" stroke="#d9cfc2" stroke-width="2"/>
    <!-- mouth -->
    <path d="M${c - 18} 44 C${c - 8} 38 ${c + 8} 38 ${c + 18} 44 C${c + 8} 54 ${c - 8} 54 ${c - 18} 44Z" fill="${GUT}" stroke="${GUT_EDGE}" stroke-width="2"/>
    <!-- large intestine: up the right side of the body (viewer's left), across, down, then rectum -->
    ${tube(`M${c - 104} 432 V268 C${c - 104} 250 ${c - 96} 246 ${c - 80} 246 H${c + 90} C${c + 104} 246 ${c + 110} 254 ${c + 110} 268 V430 C${c + 110} 450 ${c + 60} 456 ${c + 20} 462 C${c} 466 ${c} 474 ${c} 482`, 22, LARGE, LARGE_EDGE)}
    ${tube(`M${c} 482 V500`, 14, GUT, GUT_EDGE)}
    <!-- small intestine -->
    ${tube(si, 13, GUT, GUT_EDGE)}
    <!-- oesophagus and stomach -->
    ${tube(`M${c} 50 V150 C${c} 160 ${c + 10} 168 ${c + 20} 170`, 12, GUT, GUT_EDGE)}
    <path d="M${c + 14} 160 C${c + 40} 140 ${c + 100} 140 ${c + 112} 170 C${c + 124} 204 ${c + 96} 240 ${c + 60} 240 C${c + 40} 240 ${c + 34} 232 ${c + 40} 224 C${c + 60} 216 ${c + 60} 200 ${c + 40} 190 C${c + 28} 184 ${c + 16} 176 ${c + 14} 160Z" fill="${GUT}" stroke="${GUT_EDGE}" stroke-width="2.5"/>
    ${tube(`M${c + 42} 228 C${c + 30} 236 ${c + 36} 260 ${c + 40} 268`, 12, GUT, GUT_EDGE)}
    <!-- liver (over the stomach, on the body's right = viewer's left) -->
    <path d="M${c - 130} 170 C${c - 120} 136 ${c - 40} 128 ${c + 30} 150 C${c + 10} 170 ${c - 20} 200 ${c - 60} 214 C${c - 100} 226 ${c - 134} 210 ${c - 130} 170Z" fill="${LIVER}" stroke="${LIVER_EDGE}" stroke-width="2.5"/>
    <!-- pancreas, tucked under the stomach -->
    <path d="M${c + 52} 238 C${c + 70} 246 ${c + 110} 238 ${c + 128} 224 C${c + 134} 236 ${c + 116} 252 ${c + 90} 256 C${c + 70} 258 ${c + 56} 252 ${c + 52} 238Z" fill="${PANC}" stroke="${PANC_EDGE}" stroke-width="2"/>
    ${label("mouth", "Mouth", [c - 18, 44], [c - 190, 44], "end")}
    ${label("oesophagus", "Oesophagus", [c + 6, 110], [c + 190, 80])}
    ${label("liver", "Liver", [c - 90, 180], [c - 190, 150], "end")}
    ${label("stomach", "Stomach", [c + 96, 180], [c + 190, 150])}
    ${label("pancreas", "Pancreas", [c + 118, 232], [c + 190, 220])}
    ${label("small", "Small intestine", [c + 60, 340], [c + 190, 320])}
    ${label("large", "Large intestine", [c - 104, 330], [c - 190, 300], "end")}
    ${label("rectum", "Rectum", [c + 10, 470], [c - 190, 440], "end")}
    ${label("anus", "Anus", [c + 4, 502], [c + 190, 500])}`;
    return svg(600, 540, body);
  })();

  /* ---------------- Villi in the small intestine ---------------- */
  out["or-villi"] = (() => {
    const base = 300, xs = [110, 200, 290, 380];
    const villus = x => `
      <path d="M${x - 32} ${base} V120 C${x - 32} 80 ${x + 32} 80 ${x + 32} 120 V${base}" fill="${GUT}" stroke="${GUT_EDGE}" stroke-width="2.5"/>
      <path d="M${x - 14} ${base} V130 C${x - 14} 108 ${x + 14} 108 ${x + 14} 130 V${base}" fill="none" stroke="${BLOOD}" stroke-width="3"/>
      ${[150, 180, 210, 240, 270].map(y => `<line x1="${x - 14}" y1="${y}" x2="${x + 14}" y2="${y + 8}" stroke="${BLOOD}" stroke-width="2"/>`).join("")}`;
    const food = [[150, 60], [176, 92], [244, 56], [330, 70], [62, 80], [420, 96], [246, 108], [156, 130]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="5" fill="#f2b230" stroke="#a77d0a" stroke-width="1.2"/>`).join("");
    const body = `
    <rect x="40" y="${base}" width="420" height="40" fill="#e9a08e" stroke="${GUT_EDGE}" stroke-width="2.5"/>
    ${xs.map(villus).join("")}
    ${food}
    ${arrow(244, 70, 244, 112, "#a77d0a", 2)}
    <text x="250" y="30" text-anchor="middle" class="cap">small food molecules (like glucose) in the gut</text>
    <line x1="40" y1="${base + 20}" x2="460" y2="${base + 20}" stroke="${BLOOD}" stroke-width="5"/>
    ${label("villus", "Villus", [110, 96], [500, 60])}
    ${label("capillary", "Blood capillaries", [290, 200], [500, 180])}
    ${label("wall", "Thin wall, one cell thick", [412, 230], [500, 250])}
    ${label("vessel", "Blood vessel", [440, base + 20], [500, 330])}
    <text x="40" y="380" class="cap">Thousands of villi give a huge surface area. Small food molecules diffuse through</text>
    <text x="40" y="398" class="cap">the thin wall into the blood, which carries them away to every cell.</text>`;
    return svg(680, 410, body);
  })();

  /* ---------------- Enzymes break big molecules into small ones ---------------- */
  out["or-enzymes"] = (() => {
    const row = (y, name, enzyme, bigFn, smallFn, product, gap = 30) => `
      <text x="20" y="${y - gap}" class="title">${name}</text>
      ${bigFn(30, y)}
      ${arrow(262, y, 352, y, INK, 2.5)}
      <text x="307" y="${y - 12}" text-anchor="middle" class="cap" style="font-weight:700">${enzyme}</text>
      ${smallFn(372, y)}
      <text x="372" y="${y + gap + 4}" class="cap">${product}</text>`;
    const chain = (n, colours, shape) => (x, y) => {
      let s = `<line x1="${x + 10}" y1="${y}" x2="${x + 10 + (n - 1) * 24}" y2="${y}" stroke="${GREY}" stroke-width="3"/>`;
      for (let i = 0; i < n; i++) s += shape(x + 10 + i * 24, y, colours[i % colours.length]);
      return s;
    };
    const apart = (n, colours, shape) => (x, y) => {
      let s = "";
      for (let i = 0; i < n; i++) s += shape(x + 10 + i * 30, y + (i % 2 ? 6 : -6), colours[i % colours.length]);
      return s;
    };
    const hex = (x, y, col) => `<polygon points="${[0, 60, 120, 180, 240, 300].map(a => `${(x + 10 * Math.cos(a * Math.PI / 180)).toFixed(1)},${(y + 10 * Math.sin(a * Math.PI / 180)).toFixed(1)}`).join(" ")}" fill="${col}" stroke="#555" stroke-width="1.2"/>`;
    const blob = (x, y, col) => `<circle cx="${x}" cy="${y}" r="9" fill="${col}" stroke="#555" stroke-width="1.2"/>`;
    const AA = ["#e57373", "#64b5f6", "#81c784", "#ffd54f", "#ba68c8"];
    const fat = (x, y) => `<rect x="${x}" y="${y - 30}" width="16" height="60" rx="4" fill="#f2c94c" stroke="#555" stroke-width="1.2"/>
      ${[-20, 0, 20].map(d => `<line x1="${x + 16}" y1="${y + d}" x2="${x + 120}" y2="${y + d}" stroke="#d98c3a" stroke-width="5" stroke-linecap="round"/>`).join("")}`;
    const fatApart = (x, y) => `<rect x="${x}" y="${y - 30}" width="16" height="60" rx="4" fill="#f2c94c" stroke="#555" stroke-width="1.2"/>
      ${[-24, 0, 24].map(d => `<line x1="${x + 36}" y1="${y + d}" x2="${x + 120}" y2="${y + d}" stroke="#d98c3a" stroke-width="5" stroke-linecap="round"/>`).join("")}`;
    const body =
      row(70, "Starch (a carbohydrate)", "carbohydrase", chain(9, ["#fff1b8"], hex), apart(6, ["#fff1b8"], hex), "glucose (sugar)") +
      row(180, "Protein", "protease", chain(9, AA, blob), apart(7, AA, blob), "amino acids") +
      row(320, "Lipid (fat or oil)", "lipase", fat, fatApart, "fatty acids + glycerol", 46) +
      `<text x="20" y="410" class="cap">Each enzyme cuts one kind of big molecule into small ones. Small molecules can</text>
       <text x="20" y="428" class="cap">pass through the gut wall into the blood; big ones can't.</text>`;
    return svg(620, 440, body);
  })();

  return out;
}
