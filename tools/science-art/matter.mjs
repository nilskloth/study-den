/* =========================================================
   Matter (AQA KS3 3.5, Year 7): particle model and separating
   mixtures. Loaded by tools/build-science-art.mjs.
   ========================================================= */

export default function (h) {
  const { svg, label, INK } = h;
  const P_FILL = "#8fbde6", P_EDGE = "#2f6690";          // particles
  const P2_FILL = "#c39bd3", P2_EDGE = "#7d3c98";        // a second kind of particle
  const GLASS = "#f4f8fb", GLASS_EDGE = "#5f7d95";
  const WATER = "#cfe6f7", WATER_EDGE = "#7fb0d6";
  const METAL = "#9aa0a6", METAL_DARK = "#5f6368";
  const FLAME = "#5dade2", FLAME_IN = "#2e86c1";
  const GRID = "#e3e3de";

  const dot = (x, y, r = 10, fill = P_FILL, edge = P_EDGE) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${edge}" stroke-width="1.6"/>`;
  const arrowHead = (x, y, dx, dy, s = 8, col = INK) => {
    const l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
    const bx = x - ux * s, by = y - uy * s;
    return `<path d="M${(bx - uy * s * 0.6).toFixed(1)} ${(by + ux * s * 0.6).toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)} L${(bx + uy * s * 0.6).toFixed(1)} ${(by - ux * s * 0.6).toFixed(1)}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round"/>`;
  };
  /* a motion arrow from a particle */
  const move = (x, y, dx, dy, r = 10) => {
    const l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
    const x1 = x + ux * (r + 3), y1 = y + uy * (r + 3), x2 = x + ux * (r + 3 + l), y2 = y + uy * (r + 3 + l);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="1.6"/>` + arrowHead(x2, y2, dx, dy, 6);
  };
  /* a little "jiggle" mark beside a vibrating particle */
  const jiggle = (x, y) => `<path d="M${x} ${y - 6} q3 3 0 6 q-3 3 0 6" fill="none" stroke="${INK}" stroke-width="1.3"/>`;

  /* particle pictures inside a box (x, y = top left; w, h = size) */
  const solid = (x, y, w, hh, r, cols, rows) => {
    const s = r * 2.15, ox = x + (w - (cols - 1) * s) / 2, oy = y + (hh - (rows - 1) * s) / 2;
    let b = "";
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) b += dot(ox + i * s, oy + j * s, r);
    return b;
  };
  /* a liquid: particles touching but jumbled, filling the bottom of a box from (x, bottom) */
  const LIQ = [[0, 0], [1.02, -.06], [2.05, .02], [3.08, -.04], [4.1, .03], [5.12, -.05], [6.12, 0],
    [.5, -.95], [1.62, -1.02], [2.62, -.9], [3.62, -1.0], [4.62, -.92], [5.66, -.98],
    [.12, -1.88], [1.2, -1.95], [2.98, -1.86], [4.1, -1.92], [5.2, -1.86]];
  const liquid = (x, bottom, r, n = LIQ.length) =>
    LIQ.slice(0, n).map(([u, v]) => dot(x + r + u * 2 * r, bottom - r + v * 2 * r, r)).join("");

  const files = {};

  /* ---------- Solids, liquids and gases ---------- */
  files["mt-states"] = (() => {
    let b = "";
    const boxes = [["Solid", "touching, in a regular pattern", "vibrate on the spot"],
      ["Liquid", "touching, no pattern", "slide past each other"],
      ["Gas", "far apart, no pattern", "move fast in all directions"]];
    boxes.forEach(([name, c1, c2], i) => {
      const x = 20 + i * 210, y = 20, w = 180, hh = 150;
      b += `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="10" fill="#fff" stroke="#9aa3ab" stroke-width="2"/>`;
      if (i === 0) {
        b += solid(x, y, w, hh, 10.5, 6, 5);
        b += jiggle(x + 162, y + 31) + jiggle(x + 18, y + 118) + jiggle(x + 162, y + 96);
      }
      if (i === 1) b += liquid(x + 15, y + hh - 6, 10.5) + move(x + 15 + 10.5 + 2.98 * 21, y + hh - 16.5 - 1.86 * 21, 16, -10, 10.5) + move(x + 15 + 10.5 + .12 * 21, y + hh - 16.5 - 1.88 * 21, 6, -16, 10.5);
      if (i === 2) {
        const g = [[30, 32, 20, 8], [130, 28, 18, 6], [82, 76, 14, -18], [158, 102, -8, 20], [26, 120, 20, 4], [104, 132, 20, -8]];
        b += g.map(([gx, gy, dx, dy]) => dot(x + gx, y + gy, 10.5) + move(x + gx, y + gy, dx, dy, 10.5)).join("");
      }
      b += `<text x="${x + w / 2}" y="${y + hh + 24}" text-anchor="middle" class="title">${name}</text>
            <text x="${x + w / 2}" y="${y + hh + 42}" text-anchor="middle" class="cap">${c1}</text>
            <text x="${x + w / 2}" y="${y + hh + 58}" text-anchor="middle" class="cap">${c2}</text>`;
    });
    return svg(640, 240, b);
  })();

  /* ---------- Changes of state ---------- */
  files["mt-changes"] = (() => {
    let b = "";
    const boxes = [["Solid", 40], ["Liquid", 260], ["Gas", 480]];
    boxes.forEach(([name, x], i) => {
      const y = 210, w = 120, hh = 100;
      b += `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="10" fill="#fff" stroke="#9aa3ab" stroke-width="2"/>`;
      if (i === 0) b += solid(x, y - 12, w, hh, 7.5, 5, 4);
      if (i === 1) b += liquid(x + 6, y + hh - 30, 7.5);
      if (i === 2) b += [[22, 22], [92, 18], [58, 52], [100, 68], [24, 70]].map(([gx, gy]) => dot(x + gx, y + gy, 7.5)).join("");
      b += `<text x="${x + w / 2}" y="${y + hh - 8}" text-anchor="middle" class="title">${name}</text>`;
    });
    /* an arc from a to b bending through control c, with an arrow head at b */
    const arc = ([ax, ay], [cx, cy], [bx, by], col) =>
      `<path d="M${ax} ${ay} Q${cx} ${cy} ${bx} ${by}" fill="none" stroke="${col}" stroke-width="3"/>` + arrowHead(bx, by, bx - cx, by - cy, 11, col);
    const HOT = "#c0392b", COLD = "#2471a3";
    b += arc([140, 208], [210, 158], [280, 208], HOT);       // melting
    b += arc([360, 208], [430, 158], [500, 208], HOT);       // boiling / evaporating
    b += arc([280, 312], [210, 362], [140, 312], COLD);      // freezing
    b += arc([500, 312], [430, 362], [360, 312], COLD);      // condensing
    b += `<path d="M100 208 C100 50 540 50 540 208" fill="none" stroke="${HOT}" stroke-width="3" stroke-dasharray="7 5"/>` + arrowHead(540, 208, 0, 1, 11, HOT);
    b += `<text x="20" y="30" class="cap">red = particles gain energy (heating)</text>
          <text x="20" y="48" class="cap">blue = particles lose energy (cooling)</text>`;
    b += label("melting", "melting", [210, 183], [226, 160]) +
      label("boiling", "boiling", [430, 183], [446, 160]) +
      label("freezing", "freezing", [210, 337], [226, 362]) +
      label("condensing", "condensing", [430, 337], [446, 362]) +
      label("subliming", "subliming", [320, 89], [346, 66]);
    return svg(640, 380, b);
  })();

  /* ---------- Heating curve of water ---------- */
  files["mt-heating-curve"] = (() => {
    const X0 = 80, X1 = 530, Y = T => 300 - (T + 30) * (260 / 150);
    let b = "";
    for (let T = -20; T <= 120; T += 20) {
      b += `<line x1="${X0}" y1="${Y(T)}" x2="${X1}" y2="${Y(T)}" stroke="${GRID}" stroke-width="1"/>
            <text x="${X0 - 8}" y="${Y(T) + 4.5}" text-anchor="end" class="cap">${T}</text>`;
    }
    b += `<line x1="${X0}" y1="300" x2="${X1}" y2="300" stroke="${INK}" stroke-width="1.6"/>
          <line x1="${X0}" y1="300" x2="${X0}" y2="30" stroke="${INK}" stroke-width="1.6"/>
          <text x="${(X0 + X1) / 2}" y="330" text-anchor="middle" class="cap">Time (heating at a steady rate) →</text>
          <text x="22" y="165" text-anchor="middle" class="cap" transform="rotate(-90 22 165)">Temperature (°C)</text>`;
    const pts = [[90, Y(-20)], [150, Y(0)], [240, Y(0)], [340, Y(100)], [460, Y(100)], [510, Y(120)]];
    b += `<polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="#c0392b" stroke-width="3.5" stroke-linejoin="round"/>`;
    const mid = (i) => [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    b += label("solid", "solid", mid(0), [150, 284]) +
      label("melting", "melting", mid(1), [172, 220], "end") +
      label("liquid", "liquid", mid(2), [312, 196]) +
      label("boiling", "boiling", mid(3), [404, 104]) +
      label("gas", "gas", mid(4), [500, 96]);
    return svg(560, 345, b);
  })();

  /* ---------- Gas pressure ---------- */
  files["mt-pressure"] = (() => {
    let b = "";
    const bump = (x, y, side) => {   // little star where a particle hits a wall
      const d = side === "l" || side === "r" ? [[0, -7], [0, 7], [side === "l" ? 7 : -7, 0]] : [[-7, 0], [7, 0], [0, side === "t" ? 7 : -7]];
      return d.map(([dx, dy]) => `<line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}" stroke="#c0392b" stroke-width="2"/>`).join("");
    };
    /* free: [x, y, dx, dy]; hit: [x, y, side] — a particle flying into that wall, with a bump mark */
    const panel = (x, title, cap, free, hits) => {
      const W = 260, H = 170, T = 20;
      let s = `<rect x="${x}" y="${T}" width="${W}" height="${H}" rx="6" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
      s += free.map(([gx, gy, dx, dy]) => dot(x + gx, T + gy, 9) + move(x + gx, T + gy, dx, dy, 9)).join("");
      for (const [gx, gy, side] of hits) {
        const [dx, dy] = { l: [-1, 0], r: [1, 0], t: [0, -1], b: [0, 1] }[side];
        const wx = side === "l" ? 2 : side === "r" ? W - 2 : gx, wy = side === "t" ? 2 : side === "b" ? H - 2 : gy;
        const d = Math.abs(dx ? wx - gx : wy - gy) - 14;
        s += dot(x + gx, T + gy, 9) + move(x + gx, T + gy, dx * d, dy * d, 9) + bump(x + wx, T + wy, side);
      }
      s += `<text x="${x + 130}" y="214" text-anchor="middle" class="title">${title}</text>
            <text x="${x + 130}" y="232" text-anchor="middle" class="cap">${cap}</text>`;
      return s;
    };
    b += panel(30, "Fewer particles", "fewer hits on the walls: lower pressure",
      [[60, 50, 18, -6], [150, 90, -16, 12], [70, 120, 12, 10]],
      [[220, 60, "r"], [180, 132, "b"]]);
    b += panel(350, "More particles", "more hits on the walls: higher pressure",
      [[60, 52, 18, -6], [150, 60, -12, -14], [110, 104, 14, -12], [190, 100, 14, 10], [140, 140, -14, 6]],
      [[220, 50, "r"], [38, 96, "l"], [104, 40, "t"], [80, 132, "b"], [222, 136, "r"], [200, 34, "t"], [36, 150, "l"]]);
    b += `<text x="320" y="252" text-anchor="middle" class="cap">Heating the gas makes the particles move faster: they hit the walls harder and more often.</text>`;
    return svg(640, 265, b);
  })();

  /* ---------- Diffusion ---------- */
  files["mt-diffusion"] = (() => {
    let b = "";
    const air = [[30, 30], [90, 50], [150, 26], [210, 44], [100, 124], [130, 90], [190, 110], [240, 80], [30, 150], [100, 156], [170, 150], [236, 150]];
    const startP = [[28, 70], [50, 88], [24, 112], [50, 130], [70, 66]];
    const endP = [[110, 30], [244, 120], [60, 60], [200, 160], [150, 120]];
    const panel = (x, title, cap, scent) => {
      let s = `<rect x="${x}" y="20" width="270" height="180" rx="10" fill="#fff" stroke="#9aa3ab" stroke-width="2"/>`;
      s += air.map(([ax, ay]) => dot(x + ax, 20 + ay, 8, "#e5e8eb", "#8a939b")).join("");
      s += scent.map(([ax, ay]) => dot(x + ax, 20 + ay, 8, P2_FILL, P2_EDGE)).join("");
      s += `<text x="${x + 135}" y="224" text-anchor="middle" class="title">${title}</text>
            <text x="${x + 135}" y="242" text-anchor="middle" class="cap">${cap}</text>`;
      return s;
    };
    b += panel(20, "Start", "perfume particles all in one corner", startP);
    b += panel(350, "Later", "spread out through the air particles", endP);
    b += `<line x1="298" y1="110" x2="338" y2="110" stroke="${INK}" stroke-width="2.5"/>` + arrowHead(340, 110, 1, 0, 10);
    b += dot(200, 268, 8, P2_FILL, P2_EDGE) + `<text x="214" y="272.5">perfume particle</text>` +
      dot(360, 268, 8, "#e5e8eb", "#8a939b") + `<text x="374" y="272.5">air particle</text>`;
    return svg(640, 290, b);
  })();

  /* ---------- Filtration ---------- */
  files["mt-filtration"] = (() => {
    const o = 30;   // shift right, to leave room for labels on the left
    let b = "";
    // conical flask
    b += `<path d="M${190 + o} 210 L${190 + o} 260 L${110 + o} 355 Q${105 + o} 362 ${115 + o} 362 L${305 + o} 362 Q${315 + o} 362 ${310 + o} 355 L${230 + o} 260 L${230 + o} 210" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2.5"/>`;
    b += `<path d="M${140 + o} 322 L${280 + o} 322 L${309 + o} 356 Q${311 + o} 360 ${304 + o} 360 L${116 + o} 360 Q${109 + o} 360 ${111 + o} 356 Z" fill="${WATER}" stroke="${WATER_EDGE}" stroke-width="1"/>`;
    // funnel
    b += `<path d="M${120 + o} 60 L${300 + o} 60 L${220 + o} 160 L${220 + o} 238 L${200 + o} 238 L${200 + o} 160 Z" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2.5" stroke-linejoin="round"/>`;
    // filter paper with the mixture in it
    b += `<path d="M${134 + o} 66 L${286 + o} 66 L${210 + o} 156 Z" fill="#fff" stroke="#9aa3ab" stroke-width="1.5"/>`;
    b += `<path d="M${168 + o} 106 L${252 + o} 106 L${210 + o} 156 Z" fill="${WATER}" opacity=".85"/>`;
    b += `<line x1="${210 + o}" y1="66" x2="${210 + o}" y2="156" stroke="#c9c9c4" stroke-width="1"/>`;
    const sand = [[198, 146], [206, 150], [214, 146], [222, 140], [202, 138], [210, 140], [194, 136], [218, 132], [226, 132], [204, 130], [212, 132]];
    b += sand.map(([x, y]) => `<circle cx="${x + o}" cy="${y}" r="4" fill="#c8a165" stroke="#8c6a35" stroke-width="1"/>`).join("");
    // a drop falling
    b += `<path d="M${210 + o} 248 q-5 8 0 11 q5 -3 0 -11Z" fill="${WATER}" stroke="${WATER_EDGE}"/>`;
    b += `<path d="M${210 + o} 272 q-5 8 0 11 q5 -3 0 -11Z" fill="${WATER}" stroke="${WATER_EDGE}"/>`;
    b += label("funnel", "filter funnel", [278 + o, 88], [340 + o, 80]) +
      label("paper", "filter paper", [158 + o, 80], [100, 100], "end") +
      label("residue", "residue", [216 + o, 136], [340 + o, 140]) +
      label("filtrate", "filtrate", [240 + o, 345], [340 + o, 320]) +
      label("flask", "conical flask", [150 + o, 307], [100, 280], "end");
    return svg(470, 380, b);
  })();

  /* ---------- Evaporation ---------- */
  files["mt-evaporation"] = (() => {
    let b = "";
    // steam
    for (const x of [180, 210, 240]) b += `<path d="M${x} 118 q-8 -10 0 -20 q8 -10 0 -20 q-8 -10 0 -20" fill="none" stroke="#9aa3ab" stroke-width="2" stroke-linecap="round"/>`;
    // tripod
    b += `<line x1="140" y1="178" x2="118" y2="330" stroke="${METAL_DARK}" stroke-width="6" stroke-linecap="round"/>
          <line x1="280" y1="178" x2="302" y2="330" stroke="${METAL_DARK}" stroke-width="6" stroke-linecap="round"/>
          <rect x="128" y="172" width="164" height="8" rx="3" fill="${METAL_DARK}"/>`;
    // gauze
    b += `<rect x="114" y="164" width="192" height="8" fill="#d5d8dc" stroke="${METAL}" stroke-width="1.5"/>`;
    for (let x = 120; x < 306; x += 8) b += `<line x1="${x}" y1="164" x2="${x + 4}" y2="172" stroke="${METAL}" stroke-width="1"/>`;
    // basin + solution
    b += `<path d="M138 128 Q210 205 282 128 Z" fill="#fff" stroke="#8a939b" stroke-width="3" stroke-linejoin="round"/>`;
    b += `<path d="M150 140 Q210 190 270 140 Z" fill="${WATER}"/>`;
    // Bunsen burner
    b += `<path d="M203 230 Q196 206 210 184 Q224 206 217 230 Z" fill="${FLAME}" opacity=".85"/>
          <path d="M206 230 Q203 214 210 200 Q217 214 214 230 Z" fill="${FLAME_IN}"/>
          <rect x="199" y="230" width="22" height="92" fill="${METAL}" stroke="${METAL_DARK}" stroke-width="1.5"/>
          <rect x="196" y="290" width="28" height="12" fill="${METAL_DARK}"/>
          <rect x="168" y="320" width="84" height="14" rx="4" fill="${METAL_DARK}"/>`;
    b += label("basin", "evaporating basin", [262, 146], [318, 116]) +
      label("solution", "salt solution", [196, 150], [120, 104], "end") +
      label("gauze", "gauze", [122, 168], [90, 182], "end") +
      label("tripod", "tripod", [130, 255], [90, 255], "end") +
      label("bunsen", "Bunsen burner", [221, 285], [322, 300]);
    return svg(460, 350, b);
  })();

  /* ---------- Simple distillation ---------- */
  files["mt-distillation"] = (() => {
    let b = "";
    const FX = 150, FY = 230, R = 55;              // round-bottomed flask
    const OX = 205, OY = 146, A = 19 * Math.PI / 180, C = Math.cos(A), S = Math.sin(A);
    const rot = (x, y) => [OX + x * C - y * S, OY + x * S + y * C];
    const r1 = n => Math.round(n * 10) / 10;
    // Bunsen burner + gauze under the flask
    b += `<rect x="${FX - 60}" y="287" width="120" height="6" fill="#d5d8dc" stroke="${METAL}" stroke-width="1.2"/>
          <path d="M${FX - 7} 322 Q${FX - 12} 306 ${FX} 296 Q${FX + 12} 306 ${FX + 7} 322 Z" fill="${FLAME}" opacity=".85"/>
          <rect x="${FX - 10}" y="322" width="20" height="36" fill="${METAL}" stroke="${METAL_DARK}" stroke-width="1.5"/>
          <rect x="${FX - 36}" y="356" width="72" height="12" rx="4" fill="${METAL_DARK}"/>`;
    // flask: neck, bulb, liquid
    b += `<path d="M${FX - 12} 110 L${FX - 12} ${FY - R + 4} A${R} ${R} 0 1 0 ${FX + 12} ${FY - R + 4} L${FX + 12} 110" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2.5"/>`;
    const hw = Math.sqrt(R * R - 15 * 15);
    b += `<path d="M${r1(FX - hw + 1)} ${FY + 15} A${R - 1} ${R - 1} 0 0 0 ${r1(FX + hw - 1)} ${FY + 15} Z" fill="${WATER}"/>`;
    b += [[136, 270], [160, 262], [150, 276], [170, 274]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" stroke="${WATER_EDGE}"/>`).join("");
    // side arm into the condenser
    b += `<line x1="${FX + 12}" y1="136" x2="${OX + 10}" y2="${OY + 4}" stroke="${GLASS_EDGE}" stroke-width="9" stroke-linecap="round"/>
          <line x1="${FX + 12}" y1="136" x2="${OX + 10}" y2="${OY + 4}" stroke="${GLASS}" stroke-width="5" stroke-linecap="round"/>`;
    // stopper + thermometer (bulb level with the side arm)
    b += `<rect x="${FX - 15}" y="100" width="30" height="16" rx="3" fill="#7b5e46"/>
          <rect x="${FX - 4}" y="40" width="8" height="96" rx="4" fill="#fff" stroke="${GLASS_EDGE}" stroke-width="1.5"/>
          <line x1="${FX}" y1="80" x2="${FX}" y2="134" stroke="#c0392b" stroke-width="3"/>
          <circle cx="${FX}" cy="137" r="5.5" fill="#c0392b"/>`;
    // condenser, drawn along its own axis, then turned
    b += `<g transform="translate(${OX} ${OY}) rotate(19)">
      <rect x="30" y="-20" width="240" height="40" rx="8" fill="#e3f1fb" stroke="${GLASS_EDGE}" stroke-width="2.5"/>
      <rect x="0" y="-5" width="322" height="10" rx="4" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2"/>
      <rect x="44" y="-50" width="12" height="31" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2"/>
      <rect x="244" y="19" width="12" height="31" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2"/>
      <line x1="250" y1="86" x2="250" y2="58" stroke="#2471a3" stroke-width="2.5"/>
      <line x1="50" y1="-56" x2="50" y2="-84" stroke="#c0392b" stroke-width="2.5"/>
    </g>`;
    { const [x, y] = rot(250, 56); b += arrowHead(x, y, S, -C, 9, "#2471a3"); }
    { const [x, y] = rot(50, -86); b += arrowHead(x, y, S, -C, 9, "#c0392b"); }
    // collecting flask
    const [ex, ey] = rot(322, 0);
    const NX = r1(ex);
    b += `<path d="M${NX - 11} ${r1(ey + 2)} L${NX - 11} 290 L${NX - 58} 362 Q${NX - 62} 368 ${NX - 54} 368 L${NX + 54} 368 Q${NX + 62} 368 ${NX + 58} 362 L${NX + 11} 290 L${NX + 11} ${r1(ey + 2)}" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2.5"/>
          <path d="M${NX - 40} 340 L${NX + 40} 340 L${NX + 57} 364 L${NX - 57} 364 Z" fill="${WATER}"/>
          <path d="M${NX} 282 q-4 7 0 9 q4 -2 0 -9Z" fill="${WATER}" stroke="${WATER_EDGE}"/>`;
    b += label("thermometer", "thermometer", [FX + 4, 60], [FX + 26, 40]) +
      label("flask", "flask", [FX - 44, 262], [80, 300], "end") +
      label("mixture", "mixture", [FX - 16, 258], [80, 232], "end") +
      label("condenser", "condenser", rot(150, -20).map(r1), [404, 150]) +
      label("water-out", "water out", rot(50, -70).map(r1), [300, 72]) +
      label("water-in", "water in", rot(250, 76).map(r1), [380, 330], "end") +
      label("distillate", "distillate", [NX + 20, 354], [NX + 76, 322]) +
      label("heat", "heat", [FX + 12, 330], [FX + 70, 340]);
    return svg(660, 380, b);
  })();

  /* ---------- Paper chromatography (the set-up) ---------- */
  files["mt-chromatography"] = (() => {
    let b = "";
    // beaker
    b += `<path d="M104 86 L112 92 L112 356 Q112 364 120 364 L300 364 Q308 364 308 356 L308 92 L316 86" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2.5"/>`;
    b += `<rect x="114" y="322" width="192" height="40" fill="${WATER}"/>`;
    // rod and paper
    b += `<rect x="86" y="72" width="248" height="10" rx="5" fill="#7b5e46"/>`;
    b += `<rect x="172" y="78" width="76" height="262" fill="#fff" stroke="#9aa3ab" stroke-width="1.5"/>`;
    b += `<rect x="172.8" y="322" width="74.4" height="17.3" fill="${WATER}" opacity=".7"/>`;
    // pencil line, solvent front, dye spots
    b += `<line x1="172" y1="300" x2="248" y2="300" stroke="#555" stroke-width="2"/>`;
    b += `<line x1="172" y1="124" x2="248" y2="124" stroke="#2471a3" stroke-width="2" stroke-dasharray="6 4"/>`;
    b += `<circle cx="210" cy="300" r="4" fill="#b9a6c9" opacity=".6"/>`;
    b += `<ellipse cx="210" cy="258" rx="10" ry="8" fill="#e74c3c" opacity=".85"/>
          <ellipse cx="210" cy="208" rx="10" ry="8" fill="#2e86c1" opacity=".85"/>
          <ellipse cx="210" cy="160" rx="10" ry="8" fill="#f1c40f" opacity=".95"/>`;
    b += label("front", "solvent front", [240, 124], [340, 110]) +
      label("spots", "separated dyes", [222, 208], [340, 200]) +
      label("baseline", "pencil line", [240, 300], [340, 286]) +
      label("solvent", "solvent", [280, 340], [340, 340]) +
      label("paper", "chromatography paper", [184, 180], [150, 150], "end") +
      label("beaker", "beaker", [112, 250], [86, 260], "end");
    return svg(470, 380, b);
  })();

  /* ---------- A chromatogram: three known dyes and two inks ---------- */
  files["mt-chromatogram"] = (() => {
    let b = `<rect x="30" y="20" width="400" height="300" fill="#fff" stroke="#9aa3ab" stroke-width="1.5"/>`;
    b += `<line x1="30" y1="270" x2="430" y2="270" stroke="#555" stroke-width="2"/>
          <line x1="30" y1="60" x2="430" y2="60" stroke="#2471a3" stroke-width="2" stroke-dasharray="6 4"/>
          <text x="436" y="64" class="cap">solvent front</text>
          <text x="436" y="274" class="cap">pencil line</text>`;
    const RED = "#e74c3c", BLUE = "#2e86c1", YEL = "#f1c40f", PURP = "#8e44ad";
    const cols = [["A", 80, [[RED, 210]]], ["B", 150, [[BLUE, 150]]], ["C", 220, [[YEL, 100]]],
      ["X", 300, [[RED, 210], [YEL, 100]]], ["Y", 370, [[BLUE, 150], [PURP, 236]]]];
    for (const [n, x, spots] of cols) {
      b += `<circle cx="${x}" cy="270" r="3" fill="#999"/>`;
      b += spots.map(([c, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="9" fill="${c}" opacity=".88"/>`).join("");
      b += `<text x="${x}" y="296" text-anchor="middle" class="title">${n}</text>`;
    }
    b += `<line x1="260" y1="30" x2="260" y2="310" stroke="#c9c9c4" stroke-dasharray="3 4"/>
          <text x="150" y="42" text-anchor="middle" class="cap">known dyes</text>
          <text x="335" y="42" text-anchor="middle" class="cap">unknown inks</text>`;
    return svg(540, 335, b);
  })();

  /* ---------- Solubility curve of solid X ---------- */
  files["mt-solubility"] = (() => {
    const X = T => 80 + T * 4.4, Y = s => 300 - s * 1.5;
    const sol = T => 20 + 0.25 * T + 0.0125 * T * T;
    let b = "";
    for (let T = 0; T <= 100; T += 10) b += `<line x1="${X(T)}" y1="${Y(0)}" x2="${X(T)}" y2="${Y(180)}" stroke="${GRID}"/>
      <text x="${X(T)}" y="${Y(0) + 18}" text-anchor="middle" class="cap">${T}</text>`;
    for (let s = 0; s <= 180; s += 10) b += `<line x1="${X(0)}" y1="${Y(s)}" x2="${X(100)}" y2="${Y(s)}" stroke="${GRID}"/>` +
      (s % 20 === 0 ? `<text x="${X(0) - 8}" y="${Y(s) + 4.5}" text-anchor="end" class="cap">${s}</text>` : "");
    b += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(100)}" y2="${Y(0)}" stroke="${INK}" stroke-width="1.6"/>
          <line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(180)}" stroke="${INK}" stroke-width="1.6"/>
          <text x="${X(50)}" y="${Y(0) + 40}" text-anchor="middle" class="cap">Temperature (°C)</text>
          <text x="24" y="${Y(90)}" text-anchor="middle" class="cap" transform="rotate(-90 24 ${Y(90)})">Solubility (g per 100 g of water)</text>`;
    const pts = [];
    for (let T = 0; T <= 100; T += 2) pts.push(`${X(T).toFixed(1)},${Y(sol(T)).toFixed(1)}`);
    b += `<polyline points="${pts.join(" ")}" fill="none" stroke="#c0392b" stroke-width="3"/>`;
    b += `<text x="${X(30)}" y="${Y(150)}" class="title">Solubility of solid X</text>`;
    return svg(560, 355, b);
  })();

  /* =========================================================
     Year 8 (Part 2): the periodic table and elements
     ========================================================= */

  /* ---------- A simplified periodic table (periods 1–6) ---------- */
  files["mt-periodic-table"] = (() => {
    const ROWS = [
      ["H", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "He"],
      ["Li", "Be", "", "", "", "", "", "", "", "", "", "", "B", "C", "N", "O", "F", "Ne"],
      ["Na", "Mg", "", "", "", "", "", "", "", "", "", "", "Al", "Si", "P", "S", "Cl", "Ar"],
      ["K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"],
      ["Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe"],
      ["Cs", "Ba", "La", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn"]
    ];
    const NM_FROM = [0, 13, 14, 15, 16, 17];               // first non-metal column per period (1-based)
    const CW = 29, CH = 30, X0 = 96, Y0 = 72;
    const cx = c => X0 + (c - 1) * CW, cy = r => Y0 + (r - 1) * CH;
    const METAL_C = "#d6e6f5", TRANS_C = "#bcd5ec", NON_C = "#fde9c4";
    let b = "";
    ROWS.forEach((row, i) => row.forEach((s, j) => {
      if (!s) return;
      const r = i + 1, c = j + 1;
      const non = (r === 1) || c >= NM_FROM[i];
      const fill = non ? NON_C : (c >= 3 && c <= 12 ? TRANS_C : METAL_C);
      b += `<rect x="${cx(c)}" y="${cy(r)}" width="${CW}" height="${CH}" fill="${fill}" stroke="#8a96a3" stroke-width="1"/>
            <text x="${cx(c) + CW / 2}" y="${cy(r) + 19.5}" text-anchor="middle" style="font-size:12px">${s}</text>`;
    }));
    /* group numbers above the main groups */
    [[1, 1, "1"], [2, 2, "2"], [13, 2, "3"], [14, 2, "4"], [15, 2, "5"], [16, 2, "6"], [17, 2, "7"], [18, 1, "0"]]
      .forEach(([c, r, n]) => { b += `<text x="${cx(c) + CW / 2}" y="${cy(r) - 6}" text-anchor="middle" class="cap" style="font-weight:700">${n}</text>`; });
    /* the staircase between metals and non-metals */
    const st = `M${cx(13)} ${cy(2)} L${cx(13)} ${cy(3)} L${cx(14)} ${cy(3)} L${cx(14)} ${cy(4)} L${cx(15)} ${cy(4)} L${cx(15)} ${cy(5)} L${cx(16)} ${cy(5)} L${cx(16)} ${cy(6)} L${cx(17)} ${cy(6)} L${cx(17)} ${cy(7)}`;
    b += `<path d="${st}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
    /* outlines: group 1, group 7, group 0 and period 3 */
    const box = (x, y, w, hh) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="4" fill="none" stroke="#c0392b" stroke-width="2" stroke-dasharray="5 3"/>`;
    b += box(cx(1) - 2, cy(1) - 2, CW + 4, 6 * CH + 4) + box(cx(17) - 2, cy(2) - 2, CW + 4, 5 * CH + 4) +
      box(cx(18) - 2, cy(1) - 2, CW + 4, 6 * CH + 4) + box(cx(1) - 4, cy(3) - 1, 18 * CW + 8, CH + 2);
    const bottom = cy(7) + 2;
    b += label("group1", "Group 1", [cx(1) - 2, cy(5) + CH / 2], [X0 - 16, cy(5) + CH / 2], "end") +
      label("period", "a period", [cx(1) - 4, cy(3) + CH / 2], [X0 - 16, cy(3) + CH / 2], "end") +
      label("metals", "metals", [cx(2) + CW / 2, bottom - 8], [cx(2) - 4, bottom + 34]) +
      label("transition", "transition metals", [cx(7) + CW / 2, bottom - 8], [cx(6), bottom + 62]) +
      label("nonmetals", "non-metals", [cx(15) + CW / 2, cy(2) + 4], [cx(11), cy(1) - 30], "end") +
      label("group7", "Group 7", [cx(17) + CW / 2, bottom], [cx(17) - 6, bottom + 34], "end") +
      label("group0", "Group 0", [cx(18) + CW / 2, bottom], [cx(18) + CW / 2 - 4, bottom + 62], "end");
    return svg(640, 340, b);
  })();

  /* ---------- Melting points down group 1 ---------- */
  files["mt-group1-melting"] = (() => {
    const DATA = [["Li", "lithium", 181], ["Na", "sodium", 98], ["K", "potassium", 63], ["Rb", "rubidium", 39], ["Cs", "caesium", 28]];
    const X0 = 80, Yb = 250, Y = v => Yb - v * 1.05;
    let b = `<text x="270" y="24" text-anchor="middle" class="title">Melting points of the group 1 metals</text>`;
    for (let v = 0; v <= 200; v += 50) b += `<line x1="${X0}" y1="${Y(v)}" x2="490" y2="${Y(v)}" stroke="${GRID}"/>
      <text x="${X0 - 8}" y="${Y(v) + 4.5}" text-anchor="end" class="cap">${v}</text>`;
    DATA.forEach(([s, n, v], i) => {
      const x = X0 + 22 + i * 80;
      b += `<rect x="${x}" y="${Y(v)}" width="50" height="${Yb - Y(v)}" fill="${P_FILL}" stroke="${P_EDGE}" stroke-width="1.6"/>
            <text x="${x + 25}" y="${Y(v) - 7}" text-anchor="middle" style="font-weight:700">${v} °C</text>
            <text x="${x + 25}" y="${Yb + 18}" text-anchor="middle" style="font-weight:700">${s}</text>
            <text x="${x + 25}" y="${Yb + 34}" text-anchor="middle" class="cap">${n}</text>`;
    });
    b += `<line x1="${X0}" y1="${Yb}" x2="490" y2="${Yb}" stroke="${INK}" stroke-width="1.6"/>
          <line x1="${X0}" y1="${Yb}" x2="${X0}" y2="${Y(200)}" stroke="${INK}" stroke-width="1.6"/>
          <text x="26" y="${Y(100)}" text-anchor="middle" class="cap" transform="rotate(-90 26 ${Y(100)})">Melting point (°C)</text>
          <text x="285" y="${Yb + 56}" text-anchor="middle" class="cap">going down the group →</text>`;
    return svg(520, 318, b);
  })();

  /* ---------- Particle diagrams: element, compound or mixture? ---------- */
  files["mt-particle-boxes"] = (() => {
    const R = 8, A1 = [P_FILL, P_EDGE], A2 = [P2_FILL, P2_EDGE], A3 = ["#ffffff", "#7b8a97"];
    const at = (x, y, [f, e], r = R) => dot(x, y, r, f, e);
    /* a molecule: atoms at offsets (in units of R) turned by angle a */
    const mol = (x, y, a, parts) => {
      const c = Math.cos(a), s = Math.sin(a);
      return parts.map(([u, v, col, r]) => at(x + (u * c - v * s) * R, y + (u * s + v * c) * R, col, r || R)).join("");
    };
    const pair = (col) => [[-0.8, 0, col], [0.8, 0, col]];
    const water = [[0, 0, A1], [-1.05, 0.95, A3, 5.5], [1.05, 0.95, A3, 5.5]];
    const co2 = [[-1.6, 0, A2], [0, 0, A1], [1.6, 0, A2]];
    const lattice = (x, y, alt) => {
      let s = "";
      for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++)
        s += at(x + 25 + i * 18, y + 30 + j * 18, alt && (i + j) % 2 ? A2 : A1);
      return s;
    };
    const BOX = [
      ["A", (x, y) => [[30, 34], [92, 28], [62, 62], [112, 74], [28, 90], [80, 96], [118, 40]].map(([u, v]) => at(x + u, y + v, A1)).join("")],
      ["B", (x, y) => [[34, 32, .4], [100, 30, -.3], [66, 64, 1.2], [30, 92, -.8], [104, 88, .2]].map(([u, v, a]) => mol(x + u, y + v, a, pair(A2))).join("")],
      ["C", (x, y) => lattice(x, y, false)],
      ["D", (x, y) => [[34, 32, .2], [100, 30, -.5], [66, 64, 2.6], [30, 94, 1.1], [104, 90, -.2]].map(([u, v, a]) => mol(x + u, y + v, a, water)).join("")],
      ["E", (x, y) => lattice(x, y, true)],
      ["F", (x, y) => [[28, 30], [112, 66], [60, 94]].map(([u, v]) => at(x + u, y + v, A1)).join("") +
        [[82, 32, .5], [40, 64, -.4], [108, 100, 1.4]].map(([u, v, a]) => mol(x + u, y + v, a, pair(A2))).join("")],
      ["G", (x, y) => [[36, 32, .3], [100, 92, -.6]].map(([u, v, a]) => mol(x + u, y + v, a, pair(A2))).join("") +
        [[104, 34, .2], [38, 92, 2.8], [72, 62, -.4]].map(([u, v, a]) => mol(x + u, y + v, a, water)).join("")],
      ["H", (x, y) => [[70, 30, .1], [40, 94, -.5]].map(([u, v, a]) => mol(x + u, y + v, a, co2)).join("") +
        [[30, 54, .3], [104, 64, 2.5], [108, 106, 0]].map(([u, v, a]) => mol(x + u, y + v, a, water)).join("")]
    ];
    let b = "";
    BOX.forEach(([L, draw], i) => {
      const x = 14 + (i % 4) * 156, y = 30 + Math.floor(i / 4) * 160;
      b += `<text x="${x + 70}" y="${y - 8}" text-anchor="middle" class="title">${L}</text>
            <rect x="${x}" y="${y}" width="140" height="124" rx="8" fill="#fff" stroke="#9aa3ab" stroke-width="2"/>` + draw(x, y);
    });
    return svg(640, 340, b);
  })();

  /* ---------- Some small molecules and their formulae ---------- */
  files["mt-molecules"] = (() => {
    const O = ["#e05a4f", "#a93226"], H = ["#ffffff", "#7b8a97"], C = ["#5d6166", "#2e3134"], N = ["#5dade2", "#21618c"];
    const a = (x, y, col, r) => dot(x, y, r, col[0], col[1]);
    const sub = n => `<tspan dy="4" style="font-size:12px">${n}</tspan><tspan dy="-4"></tspan>`;
    const MOLS = [
      ["oxygen", `O${sub(2)}`, (x, y) => a(x - 11, y, O, 14) + a(x + 11, y, O, 14)],
      ["water", `H${sub(2)}O`, (x, y) => a(x - 17, y + 13, H, 9) + a(x + 17, y + 13, H, 9) + a(x, y, O, 14)],
      ["carbon dioxide", `CO${sub(2)}`, (x, y) => a(x - 25, y, O, 14) + a(x + 25, y, O, 14) + a(x, y, C, 13)],
      ["ammonia", `NH${sub(3)}`, (x, y) => a(x - 19, y + 11, H, 9) + a(x + 19, y + 11, H, 9) + a(x, y + 20, H, 9) + a(x, y - 2, N, 14)],
      ["methane", `CH${sub(4)}`, (x, y) => a(x - 18, y - 14, H, 9) + a(x + 18, y - 14, H, 9) + a(x - 18, y + 14, H, 9) + a(x + 18, y + 14, H, 9) + a(x, y, C, 13)]
    ];
    let b = "";
    MOLS.forEach(([name, f, draw], i) => {
      const x = 70 + i * 125;
      b += draw(x, 60) + `<text x="${x}" y="122" text-anchor="middle" style="font-size:20px;font-weight:700">${f}</text>
        <text x="${x}" y="144" text-anchor="middle" class="cap">${name}</text>`;
    });
    const KEY = [["carbon", C], ["hydrogen", H], ["oxygen", O], ["nitrogen", N]];
    KEY.forEach(([n, col], i) => { b += a(150 + i * 105, 180, col, 8) + `<text x="${162 + i * 105}" y="184.5" class="cap">${n}</text>`; });
    return svg(640, 200, b);
  })();

  /* ---------- Monomers join to make a polymer ---------- */
  files["mt-polymer"] = (() => {
    const unit = (x, y, col = P_FILL, edge = P_EDGE) => `<rect x="${x - 13}" y="${y - 9}" width="26" height="18" rx="9" fill="${col}" stroke="${edge}" stroke-width="1.6"/>`;
    let b = `<text x="80" y="26" text-anchor="middle" class="title">monomers</text>`;
    [[50, 60], [104, 52], [60, 104], [112, 98], [80, 142]].forEach(([x, y]) => { b += unit(x, y); });
    b += `<line x1="160" y1="98" x2="214" y2="98" stroke="${INK}" stroke-width="2.5"/>` + arrowHead(222, 98, 1, 0, 10);
    b += `<text x="188" y="86" text-anchor="middle" class="cap">join up</text>`;
    b += `<text x="420" y="26" text-anchor="middle" class="title">a polymer: one very long chain</text>`;
    const pts = [];
    for (let i = 0; i < 13; i++) pts.push([258 + i * 26, 70]);
    for (let i = 12; i >= 0; i--) pts.push([258 + i * 26, 126]);
    b += `<path d="M${pts[12][0]} 70 C${pts[12][0] + 30} 70 ${pts[12][0] + 30} 126 ${pts[12][0]} 126" fill="none" stroke="${P_EDGE}" stroke-width="2"/>`;
    b += `<line x1="258" y1="70" x2="${pts[12][0]}" y2="70" stroke="${P_EDGE}" stroke-width="2"/><line x1="258" y1="126" x2="${pts[12][0]}" y2="126" stroke="${P_EDGE}" stroke-width="2"/>`;
    b += pts.map(([x, y]) => unit(x, y)).join("");
    b += `<text x="${pts[25][0] - 22}" y="131" text-anchor="end" style="font-size:20px">…</text>
          <text x="420" y="168" text-anchor="middle" class="cap">thousands of monomers joined in a repeating pattern</text>`;
    return svg(600, 185, b);
  })();

  /* ---------- Two composites ---------- */
  files["mt-composite"] = (() => {
    let b = "";
    /* fibreglass: glass fibres set in plastic resin */
    b += `<text x="150" y="26" text-anchor="middle" class="title">Fibreglass</text>
          <rect x="30" y="44" width="240" height="110" rx="6" fill="#f6e7b8" stroke="#b9975b" stroke-width="2"/>`;
    for (let i = 0; i < 9; i++) {
      const y = 56 + i * 11 + (i % 2) * 2;
      b += `<line x1="${38 + (i % 3) * 6}" y1="${y}" x2="${262 - (i % 2) * 8}" y2="${y + (i % 3) - 1}" stroke="#4f7fa8" stroke-width="2.6" stroke-linecap="round"/>`;
    }
    b += `<text x="150" y="178" text-anchor="middle" class="cap">glass fibres (strong) held in</text>
          <text x="150" y="194" text-anchor="middle" class="cap">plastic resin (light, holds them together)</text>`;
    /* reinforced concrete: steel rods in concrete */
    b += `<text x="470" y="26" text-anchor="middle" class="title">Reinforced concrete</text>
          <rect x="350" y="44" width="240" height="110" rx="4" fill="#d5d8dc" stroke="#7f8c8d" stroke-width="2"/>`;
    for (let i = 0; i < 40; i++) {
      const x = 360 + (i * 53) % 220, y = 52 + (i * 37) % 96;
      b += `<circle cx="${x}" cy="${y}" r="${1.5 + (i % 3)}" fill="#aab0b5"/>`;
    }
    for (const y of [72, 126]) b += `<line x1="358" y1="${y}" x2="582" y2="${y}" stroke="${METAL_DARK}" stroke-width="7" stroke-linecap="round"/>
          <line x1="358" y1="${y - 1.5}" x2="582" y2="${y - 1.5}" stroke="${METAL}" stroke-width="2.5" stroke-linecap="round"/>`;
    b += `<text x="470" y="178" text-anchor="middle" class="cap">steel rods (strong when stretched) inside</text>
          <text x="470" y="194" text-anchor="middle" class="cap">concrete (strong when squashed)</text>`;
    return svg(620, 206, b);
  })();

  return files;
}
