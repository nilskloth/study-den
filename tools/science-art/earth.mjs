/* =========================================================
   Earth (big idea "earth"): Year 7 Earth structure + Universe; Year 8 climate + Earth resources.
   Built by tools/build-science-art.mjs → data/content/secondary/science/ea-*.svg
   ========================================================= */

export default function (h) {
  const { svg, label, INK } = h;
  const MUTED = "#5c5f63";
  const SPACE = "#1f2a44", LIT = "#f6f1dc", DARK = "#3b4254";
  const SEA = "#5b9bd5", LAND = "#6aa84f";
  const SUN = "#f7c948", SUN_EDGE = "#e0a106";
  const arrowHead = (x, y, ang, s = 9) => {
    const a = ang * Math.PI / 180, b = 0.45;
    const p1 = [x - s * Math.cos(a - b), y - s * Math.sin(a - b)], p2 = [x - s * Math.cos(a + b), y - s * Math.sin(a + b)];
    return `<path d="M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${x} ${y} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  const arrow = (x1, y1, x2, y2, col = INK, w = 2.2) => {
    const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` + arrowHead(x2, y2, ang).replace(INK, col);
  };
  /* a seeded random, so the drawings are the same every build */
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const out = {};

  /* ---------------- Layers of the Earth ---------------- */
  out["ea-layers"] = (() => {
    const cx = 200, cy = 225;
    let b = `<circle cx="${cx}" cy="${cy}" r="186" fill="#dcecf8"/>
      <circle cx="${cx}" cy="${cy}" r="164" fill="#7a5a3a"/>
      <circle cx="${cx}" cy="${cy}" r="154" fill="#d9603b"/>
      <circle cx="${cx}" cy="${cy}" r="96" fill="#f0a030"/>
      <circle cx="${cx}" cy="${cy}" r="46" fill="#fbe27a" stroke="#e8b923" stroke-width="2"/>`;
    // a cut-out quarter so it reads as a slice of a ball: the outside (top-left) shows land and sea
    b += `<path d="M${cx} ${cy} L${cx} ${cy - 164} A164 164 0 0 0 ${cx - 164} ${cy}Z" fill="${SEA}"/>
      <path d="M${cx - 120} ${cy - 60} q20 -40 50 -30 q30 -30 40 10 q-10 30 -40 30 q-30 20 -50 -10Z" fill="${LAND}"/>
      <path d="M${cx - 60} ${cy - 140} q20 -10 40 0 q10 20 -10 30 q-30 0 -30 -30Z" fill="${LAND}"/>
      <path d="M${cx - 150} ${cy - 10} q10 -20 30 -10 q0 10 -30 10Z" fill="${LAND}"/>
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 164}" stroke="${INK}" stroke-width="1" opacity=".4"/>
      <line x1="${cx}" y1="${cy}" x2="${cx - 164}" y2="${cy}" stroke="${INK}" stroke-width="1" opacity=".4"/>`;
    const at = (r, deg) => [Math.round(cx + r * Math.cos(deg * Math.PI / 180)), Math.round(cy - r * Math.sin(deg * Math.PI / 180))];
    const L = [
      label("atmosphere", "Atmosphere", at(176, 48), [410, 50]),
      label("crust", "Crust", at(159, 20), [410, 130]),
      label("mantle", "Mantle", at(128, -10), [410, 225]),
      label("outer-core", "Outer core", at(72, -32), [410, 310]),
      label("inner-core", "Inner core", at(18, -40), [410, 390])
    ].join("");
    b += `<text x="${cx}" y="440" text-anchor="middle" class="cap">Not to scale — the crust is really much thinner.</text>`;
    return svg(540, 450, b + L);
  })();

  /* ---------------- Rock cycle ---------------- */
  out["ea-rock-cycle"] = (() => {
    const box = (x, y, title, sub, fill, edge) =>
      `<rect x="${x - 78}" y="${y - 27}" width="156" height="54" rx="12" fill="${fill}" stroke="${edge}" stroke-width="2"/>
       <text x="${x}" y="${y + (sub ? -3 : 5)}" text-anchor="middle" class="title">${title}</text>
       ${sub ? `<text x="${x}" y="${y + 15}" text-anchor="middle" class="cap">${sub}</text>` : ""}`;
    let b = "";
    // arrows first, boxes on top
    b += arrow(130, 288, 130, 116);                 // igneous → sediment
    b += arrow(212, 90, 422, 90);                   // sediment → sedimentary
    b += arrow(500, 116, 500, 288);                 // sedimentary → metamorphic
    b += arrow(470, 342, 392, 400);                 // metamorphic → magma
    b += arrow(248, 400, 170, 342);                 // magma → igneous
    b += `<path d="M212 316 L422 316" stroke="#9a9da1" stroke-width="2" stroke-dasharray="6 5"/>` + arrowHead(422, 316, 0).replace(INK, "#9a9da1");
    b += `<text x="317" y="336" text-anchor="middle" class="cap">heat and pressure</text>`;
    b += `<path d="M440 116 C380 160 250 160 190 116" fill="none" stroke="#9a9da1" stroke-width="2" stroke-dasharray="6 5"/>` + arrowHead(190, 116, 215).replace(INK, "#9a9da1");
    b += `<text x="317" y="170" text-anchor="middle" class="cap">weathered again</text>`;
    b += box(130, 90, "Sediment", "laid down in layers", "#f5ead0", "#b89d6a");
    b += box(500, 90, "Sedimentary rock", "", "#efe0bf", "#a8874f");
    b += box(500, 316, "Metamorphic rock", "", "#dcd3e8", "#7d6a9a");
    b += box(320, 420, "Magma", "melted rock", "#f7c3a8", "#c0532b");
    b += box(130, 316, "Igneous rock", "", "#d9d9d9", "#6f6f6f");
    const L = [
      label("weathering", "Weathering and erosion", [130, 205], [150, 222]),
      label("compaction", "Compaction and cementation", [317, 90], [250, 48]),
      label("heat-pressure", "Heat and pressure", [500, 205], [482, 244], "end"),
      label("melting", "Melting", [431, 371], [470, 400]),
      label("cooling", "Cooling", [209, 371], [170, 400], "end")
    ].join("");
    return svg(640, 460, b + L);
  })();

  /* ---------------- Three kinds of rock (close up) ---------------- */
  out["ea-rock-types"] = (() => {
    let b = "";
    const W = 170, top = 34;
    const frame = (x, inner, title, cap1, cap2) =>
      `<text x="${x + W / 2}" y="22" text-anchor="middle" class="title">${title}</text>
       <clipPath id="ea-clip-${x}"><rect x="${x}" y="${top}" width="${W}" height="${W}" rx="10"/></clipPath>
       <g clip-path="url(#ea-clip-${x})">${inner}</g>
       <rect x="${x}" y="${top}" width="${W}" height="${W}" rx="10" fill="none" stroke="#6a6d71" stroke-width="2"/>
       <text x="${x + W / 2}" y="${top + W + 20}" text-anchor="middle" class="cap">${cap1}</text>
       <text x="${x + W / 2}" y="${top + W + 36}" text-anchor="middle" class="cap">${cap2}</text>`;
    // igneous: interlocking crystals (a jittered grid of polygons with no gaps)
    {
      const x0 = 20, n = 6, s = W / n, P = [];
      for (let i = 0; i <= n; i++) { P[i] = []; for (let j = 0; j <= n; j++) {
        const edge = i === 0 || j === 0 || i === n || j === n;
        P[i][j] = [x0 + i * s + (edge ? 0 : (rnd() - 0.5) * s * 0.7), top + j * s + (edge ? 0 : (rnd() - 0.5) * s * 0.7)];
      } }
      const cols = ["#f2f2f2", "#d8c3c0", "#3a3a3a", "#bfbfbf", "#e8d9d2", "#8c8c8c"];
      let g = "";
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const pts = [P[i][j], P[i + 1][j], P[i + 1][j + 1], P[i][j + 1]].map(p => p.map(v => v.toFixed(1)).join(",")).join(" ");
        g += `<polygon points="${pts}" fill="${cols[Math.floor(rnd() * cols.length)]}" stroke="#555" stroke-width="1.2"/>`;
      }
      b += frame(x0, g, "Igneous", "crystals fit together,", "no gaps, no layers");
    }
    // sedimentary: rounded grains with gaps, in layers, a shell fossil
    {
      const x0 = 215, layers = ["#e9d3a0", "#d9b77a", "#efdcae", "#cfa868"];
      let g = "";
      layers.forEach((c, k) => { g += `<rect x="${x0}" y="${top + k * W / 4}" width="${W}" height="${W / 4 + 1}" fill="${c}"/>`; });
      for (let k = 0; k < 4; k++) for (let i = 0; i < 9; i++) for (let j = 0; j < 2; j++) {
        const gx = x0 + 10 + i * 19 + (rnd() - 0.5) * 6, gy = top + k * W / 4 + 11 + j * 19 + (rnd() - 0.5) * 5;
        g += `<ellipse cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" rx="${(6 + rnd() * 2).toFixed(1)}" ry="${(5 + rnd() * 2).toFixed(1)}" fill="#f7ecd0" stroke="#9b7a45" stroke-width="1"/>`;
      }
      for (let k = 1; k < 4; k++) g += `<line x1="${x0}" y1="${top + k * W / 4}" x2="${x0 + W}" y2="${top + k * W / 4}" stroke="#8a6a3a" stroke-width="2"/>`;
      // fossil shell
      const fx = x0 + 110, fy = top + 105;
      g += `<path d="M${fx - 22} ${fy + 12} Q${fx} ${fy - 30} ${fx + 22} ${fy + 12} Z" fill="#fff8e6" stroke="#6b4f2a" stroke-width="2"/>`;
      for (const dx of [-12, -4, 4, 12]) g += `<line x1="${fx}" y1="${fy + 10}" x2="${fx + dx * 1.5}" y2="${fy - 6 + Math.abs(dx) * 0.9}" stroke="#6b4f2a" stroke-width="1.2"/>`;
      b += frame(x0, g, "Sedimentary", "rounded grains with gaps,", "layers, sometimes fossils");
    }
    // metamorphic: crystals squashed into wavy bands
    {
      const x0 = 410, cols = ["#cfc6dd", "#7d6a9a", "#e6e0ee", "#5f5470", "#b9aed0"];
      let g = `<rect x="${x0}" y="${top}" width="${W}" height="${W}" fill="#e6e0ee"/>`;
      for (let k = 0; k < 11; k++) {
        const y = top - 6 + k * 17, c = cols[k % cols.length];
        g += `<path d="M${x0 - 5} ${y} C${x0 + 40} ${y - 12} ${x0 + 70} ${y + 14} ${x0 + 100} ${y} S${x0 + 150} ${y - 12} ${x0 + W + 5} ${y} L${x0 + W + 5} ${y + 17} C${x0 + 150} ${y + 5} ${x0 + 130} ${y + 31} ${x0 + 100} ${y + 17} S${x0 + 40} ${y + 5} ${x0 - 5} ${y + 17}Z" fill="${c}" stroke="#4a4058" stroke-width=".8"/>`;
        for (let i = 0; i < 6; i++) {
          const ex = x0 + 12 + i * 28 + rnd() * 8;
          g += `<ellipse cx="${ex.toFixed(1)}" cy="${(y + 8 + Math.sin((ex - x0) / 30) * 5).toFixed(1)}" rx="9" ry="2.2" fill="#fff" opacity=".55"/>`;
        }
      }
      b += frame(x0, g, "Metamorphic", "crystals lined up", "in bands, no gaps");
    }
    return svg(600, 250, b);
  })();

  /* ---------------- Solar System (not to scale) ---------------- */
  out["ea-solar-system"] = (() => {
    let b = `<rect x="0" y="0" width="660" height="250" rx="14" fill="${SPACE}"/>`;
    for (let i = 0; i < 40; i++) b += `<circle cx="${(rnd() * 660).toFixed(0)}" cy="${(rnd() * 250).toFixed(0)}" r="${(0.6 + rnd()).toFixed(1)}" fill="#fff" opacity=".7"/>`;
    b += `<circle cx="-70" cy="125" r="120" fill="${SUN}" stroke="${SUN_EDGE}" stroke-width="3"/>
      <text x="14" y="130" class="title" style="fill:#7a4a00">Sun</text>`;
    const planets = [
      ["mercury", "Mercury", 82, 5, "#b7b2a8"],
      ["venus", "Venus", 118, 9, "#e8c27a"],
      ["earth", "Earth", 156, 10, "#4f8fd6"],
      ["mars", "Mars", 192, 7, "#c9583a"],
      ["jupiter", "Jupiter", 262, 30, "#d9a877"],
      ["saturn", "Saturn", 362, 25, "#e8d29a"],
      ["uranus", "Uranus", 456, 16, "#9fd8df"],
      ["neptune", "Neptune", 532, 15, "#4b6fd6"]
    ];
    let L = "";
    planets.forEach(([id, name, x, r, col], i) => {
      if (id === "saturn") b += `<ellipse cx="${x}" cy="125" rx="${r * 1.9}" ry="${r * 0.55}" fill="none" stroke="#cdb57a" stroke-width="5" transform="rotate(-14 ${x} 125)"/>`;
      b += `<circle cx="${x}" cy="125" r="${r}" fill="${col}"/>`;
      if (id === "jupiter") b += `<path d="M${x - 28} 117 h56 M${x - 29} 129 h58" stroke="#b8865a" stroke-width="3"/>`;
      if (id === "earth") b += `<path d="M${x - 4} 119 q5 -2 7 3 q-3 4 -7 1Z M${x - 6} 127 q4 1 3 5 q-4 0 -3 -5Z" fill="${LAND}"/>`;
      const up = i % 2 === 0;
      const ty = up ? 40 : 212;
      L += label(id, name, [x, up ? 125 - r : 125 + r], [x + 4, ty]);
    });
    b += `<text x="644" y="238" text-anchor="end" class="cap" style="fill:#c9d3e6">Not to scale</text>`;
    // the labels need light text on the dark background
    L = L.replace(/class="name"/g, `class="name" style="fill:#fff"`).replace(/class="leader"/g, `class="leader" style="stroke:#c9d3e6"`).replace(/class="dot"/g, `class="dot" style="fill:#c9d3e6"`).replace(/<g class="letter"><circle /g, `<g class="letter"><circle stroke="#fff" stroke-width="1.5" `);
    return svg(660, 250, b + L);
  })();

  /* ---------------- Day and night ---------------- */
  out["ea-day-night"] = (() => {
    const cx = 330, cy = 160, R = 95, tilt = 23.5 * Math.PI / 180;
    let b = "";
    for (const y of [70, 115, 160, 205, 250]) b += arrow(20, y, 200, y, "#e0a106", 2.5);
    b += `<text x="110" y="40" text-anchor="middle" class="title">Sunlight</text>`;
    b += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${SEA}"/>
      <path d="M${cx - 40} ${cy - 50} q30 -20 50 0 q10 30 -20 40 q-30 0 -30 -40Z M${cx - 70} ${cy + 20} q20 -10 40 10 q0 40 -30 40 q-20 -20 -10 -50Z M${cx + 20} ${cy + 30} q30 -10 40 20 q-20 20 -40 -20Z" fill="${LAND}"/>
      <path d="M${cx} ${cy - R} A${R} ${R} 0 0 1 ${cx} ${cy + R} Z" fill="#0d1428" opacity=".62"/>`;
    const ax = Math.sin(tilt) * (R + 30), ay = Math.cos(tilt) * (R + 30);
    b += `<line x1="${(cx - ax).toFixed(1)}" y1="${(cy + ay).toFixed(1)}" x2="${(cx + ax).toFixed(1)}" y2="${(cy - ay).toFixed(1)}" stroke="${INK}" stroke-width="2" stroke-dasharray="5 4"/>`;
    b += `<text x="${(cx + ax + 4).toFixed(0)}" y="${(cy - ay - 4).toFixed(0)}" class="cap">axis</text>`;
    // spin arrow (west to east = anticlockwise seen from above the North Pole, so left-to-right across the front)
    b += `<path d="M${cx - 60} ${cy + R + 22} Q${cx} ${cy + R + 40} ${cx + 60} ${cy + R + 22}" fill="none" stroke="${INK}" stroke-width="2"/>` + arrowHead(cx + 60, cy + R + 22, -20);
    b += `<text x="${cx}" y="${cy + R + 60}" text-anchor="middle" class="cap">spins once every 24 hours</text>`;
    b += `<text x="${cx - 48}" y="${cy + 5}" text-anchor="middle" class="title" style="fill:#fff">DAY</text>
      <text x="${cx + 48}" y="${cy + 5}" text-anchor="middle" class="title" style="fill:#fff">NIGHT</text>`;
    return svg(520, 330, b);
  })();

  /* ---------------- Seasons: the tilted Earth on its orbit ---------------- */
  out["ea-seasons"] = (() => {
    const tilt = 23.5 * Math.PI / 180;
    const A = [Math.sin(tilt), -Math.cos(tilt)];          // towards the North Pole (top leans right)
    const E = [Math.cos(tilt), Math.sin(tilt)];           // along the equator
    const R = 52, sx = 320, sy = 165;
    let b = `<ellipse cx="${sx}" cy="${sy}" rx="230" ry="62" fill="none" stroke="#9a9da1" stroke-width="1.5" stroke-dasharray="6 5"/>`;
    b += `<circle cx="${sx}" cy="${sy}" r="42" fill="${SUN}" stroke="${SUN_EDGE}" stroke-width="3"/>`;
    const earth = (cx, cy, sunSide) => {
      // sunSide: +1 if the Sun is to the right of this Earth, −1 if to the left
      let g = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${SEA}"/>`;
      const dark = sunSide > 0
        ? `M${cx} ${cy - R} A${R} ${R} 0 0 0 ${cx} ${cy + R} Z`
        : `M${cx} ${cy - R} A${R} ${R} 0 0 1 ${cx} ${cy + R} Z`;
      g += `<path d="${dark}" fill="#0d1428" opacity=".6"/>`;
      const p = (k, m) => [cx + R * (k * E[0] + m * A[0]), cy + R * (k * E[1] + m * A[1])];
      const ax1 = p(0, -1.4), ax2 = p(0, 1.4);
      g += `<line x1="${ax1[0].toFixed(1)}" y1="${ax1[1].toFixed(1)}" x2="${ax2[0].toFixed(1)}" y2="${ax2[1].toFixed(1)}" stroke="${INK}" stroke-width="2" stroke-dasharray="5 4"/>`;
      g += `<text x="${(ax2[0] + 3).toFixed(0)}" y="${(ax2[1] - 4).toFixed(0)}" class="cap">N</text>`;
      const e1 = p(-1, 0), e2 = p(1, 0);
      g += `<line x1="${e1[0].toFixed(1)}" y1="${e1[1].toFixed(1)}" x2="${e2[0].toFixed(1)}" y2="${e2[1].toFixed(1)}" stroke="#f2f2f2" stroke-width="1.6"/>`;
      // the UK: latitude ~52°N on the side facing the Sun
      const lat = 52 * Math.PI / 180;
      const uk = p(sunSide * Math.cos(lat), Math.sin(lat));
      g += `<circle cx="${uk[0].toFixed(1)}" cy="${uk[1].toFixed(1)}" r="5" fill="#d64545" stroke="#fff" stroke-width="1.5"/>`;
      return { g, uk: uk.map(v => Math.round(v)), axTop: ax2.map(v => Math.round(v)), eq: p(-0.55, 0).map(v => Math.round(v)) };
    };
    const june = earth(110, sy, +1), dec = earth(530, sy, -1);
    b += june.g + dec.g;
    b += `<text x="110" y="300" text-anchor="middle" class="title">June</text><text x="530" y="300" text-anchor="middle" class="title">December</text>`;
    b += `<text x="${sx}" y="300" text-anchor="middle" class="cap">Not to scale · the axis always points the same way</text>`;
    const L = [
      label("sun", "Sun", [sx, sy - 42], [sx + 14, 52]),
      label("axis", "Axis", [june.axTop[0] - 4, june.axTop[1] + 12], [60, 36], "end"),
      label("summer", "UK in summer", june.uk, [190, 76]),
      label("winter", "UK in winter", dec.uk, [470, 76], "end"),
      label("equator", "Equator", dec.eq, [470, 262], "end")
    ].join("");
    return svg(640, 310, b + L);
  })();

  /* ---------------- Phases of the Moon ---------------- */
  out["ea-moon-phases"] = (() => {
    const cx = 320, cy = 250, RO = 125, RI = 188, r = 16;
    let b = "";
    for (const y of [120, 185, 250, 315, 380]) b += arrow(690, y, 620, y, "#e0a106", 2.5);
    b += `<text x="655" y="95" text-anchor="middle" class="title">Sunlight</text>`;
    b += `<circle cx="${cx}" cy="${cy}" r="${RO}" fill="none" stroke="#9a9da1" stroke-width="1.5" stroke-dasharray="6 5"/>`;
    b += `<circle cx="${cx}" cy="${cy}" r="26" fill="${SEA}"/><path d="M${cx} ${cy - 26} A26 26 0 0 0 ${cx} ${cy + 26}Z" fill="#0d1428" opacity=".55"/>`;
    b += `<text x="${cx}" y="${cy + 44}" text-anchor="middle" class="cap">Earth</text>`;
    // how the Moon looks from the UK at phase angle phi (0 = new, 180 = full)
    const look = (x, y, phi) => {
      let g = `<circle cx="${x}" cy="${y}" r="${r}" fill="${DARK}" stroke="#2a2f3b" stroke-width="1"/>`;
      if (phi === 0) return g;
      if (phi === 180) return `<circle cx="${x}" cy="${y}" r="${r}" fill="${LIT}" stroke="#b9b39a" stroke-width="1"/>`;
      const waxing = phi < 180, a = waxing ? phi : 360 - phi;
      const rx = Math.max(0.01, Math.abs(r * Math.cos(a * Math.PI / 180))).toFixed(2);
      const crescent = a < 90;
      // waxing: right side lit; waning: left side lit
      const outer = waxing ? 1 : 0;
      const term = waxing ? (crescent ? 0 : 1) : (crescent ? 1 : 0);
      g += `<path d="M${x} ${y - r} A${r} ${r} 0 0 ${outer} ${x} ${y + r} A${rx} ${r} 0 0 ${term} ${x} ${y - r}Z" fill="${LIT}"/>`;
      return g;
    };
    let L = "";
    const names = { 0: ["new", "New moon"], 90: ["first-quarter", "First quarter"], 180: ["full", "Full moon"], 270: ["last-quarter", "Last quarter"] };
    for (let k = 0; k < 8; k++) {
      const phi = k * 45, t = phi * Math.PI / 180;
      const ox = cx + RO * Math.cos(t), oy = cy - RO * Math.sin(t);
      // in orbit: the half facing the Sun (right) is always lit
      b += `<circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="11" fill="${DARK}"/><path d="M${ox.toFixed(1)} ${(oy - 11).toFixed(1)} A11 11 0 0 1 ${ox.toFixed(1)} ${(oy + 11).toFixed(1)}Z" fill="${LIT}" stroke="#b9b39a" stroke-width=".8"/>`;
      const ix = Math.round(cx + RI * Math.cos(t)), iy = Math.round(cy - RI * Math.sin(t));
      b += look(ix, iy, phi);
      if (names[phi]) {
        const [id, name] = names[phi];
        const pos = { 0: [[ix, iy + r], [ix + 8, iy + 44]], 90: [[ix + r, iy], [ix + 44, iy]], 180: [[ix, iy + r], [ix + 8, iy + 44]], 270: [[ix + r, iy], [ix + 44, iy]] }[phi];
        L += label(id, name, pos[0], pos[1]);
      }
    }
    // direction of travel: anticlockwise, seen from above the North Pole
    {
      const R2 = 150, t1 = 15 * Math.PI / 180, t2 = 70 * Math.PI / 180;
      const P = t => [(cx + R2 * Math.cos(t)).toFixed(1), (cy - R2 * Math.sin(t)).toFixed(1)];
      const [x1, y1] = P(t1), [x2, y2] = P(t2);
      b += `<path d="M${x1} ${y1} A${R2} ${R2} 0 0 0 ${x2} ${y2}" fill="none" stroke="${INK}" stroke-width="2"/>`;
      b += arrowHead(+x2, +y2, Math.atan2(-Math.cos(t2), -Math.sin(t2)) * 180 / Math.PI);
    }
    b += `<text x="${cx}" y="${cy - 60}" text-anchor="middle" class="cap">Moon's orbit</text>`;
    b += `<text x="20" y="485" class="cap">Inner ring: the Moon from above. Outer ring: how it looks from the UK.</text>`;
    return svg(700, 500, b + L);
  })();

  /* =========================================================
     Year 8 (part 2): climate and Earth resources
     ========================================================= */

  /* ---------------- The carbon cycle ---------------- */
  out["ea-carbon-cycle"] = (() => {
    const GREEN = "#2e8b57", GREY = "#6a6d71";
    const G = 300;                      // ground level
    const elbow = (pts, col, w) => {    // an arrow with corners
      const [x1, y1] = pts[pts.length - 2], [x2, y2] = pts[pts.length - 1];
      return `<polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>` +
        arrowHead(x2, y2, Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI).replace(INK, col);
    };
    let b = "";
    // sky, ground, underground rock
    b += `<rect x="0" y="0" width="700" height="${G}" fill="#eef6fc"/>
      <rect x="0" y="${G}" width="700" height="${500 - G}" fill="#c9b08a"/>
      <rect x="0" y="${G}" width="700" height="14" fill="#7aa95c"/>`;
    // ocean on the left
    b += `<path d="M0 ${G - 8} L130 ${G - 8} L130 ${G + 60} Q65 ${G + 80} 0 ${G + 70}Z" fill="${SEA}"/>`;
    for (const x of [10, 50, 90]) b += `<path d="M${x} ${G - 8} q8 -7 16 0 q8 7 16 0" fill="none" stroke="#fff" stroke-width="2"/>`;
    b += `<text x="65" y="${G + 40}" text-anchor="middle" class="cap" style="fill:#fff">ocean</text>`;
    // fossil fuels underground
    b += `<rect x="270" y="440" width="420" height="40" rx="8" fill="#3a3330"/>
      <text x="480" y="465" text-anchor="middle" class="title" style="fill:#fff">Fossil fuels: coal, oil and gas</text>`;
    b += `<text x="290" y="430" class="cap">buried for millions of years</text>`;
    // air box
    b += `<rect x="250" y="16" width="270" height="50" rx="12" fill="#fff" stroke="${GREY}" stroke-width="2"/>
      <text x="385" y="38" text-anchor="middle" class="title">Carbon dioxide in the air</text>
      <text x="385" y="56" text-anchor="middle" class="cap">about 0.04 % of the air</text>`;
    // tree
    const tx = 300;
    b += `<rect x="${tx - 9}" y="${G - 70}" width="18" height="74" fill="#8b5a2b"/>
      <circle cx="${tx}" cy="${G - 100}" r="44" fill="${LAND}"/>
      <circle cx="${tx - 28}" cy="${G - 80}" r="25" fill="#5b9a43"/><circle cx="${tx + 28}" cy="${G - 82}" r="25" fill="#5b9a43"/>`;
    // sheep
    {
      const x = 450, y = G - 34;
      b += `<ellipse cx="${x}" cy="${y}" rx="34" ry="22" fill="#fbfbf6" stroke="${GREY}" stroke-width="1.5"/>
        <ellipse cx="${x + 36}" cy="${y - 10}" rx="12" ry="9" fill="#444"/>
        <line x1="${x - 18}" y1="${y + 18}" x2="${x - 18}" y2="${G + 2}" stroke="#444" stroke-width="5"/>
        <line x1="${x + 16}" y1="${y + 18}" x2="${x + 16}" y2="${G + 2}" stroke="#444" stroke-width="5"/>`;
    }
    // dead leaves + mushrooms (decomposers)
    {
      const x = 565;
      b += `<ellipse cx="${x}" cy="${G + 4}" rx="30" ry="7" fill="#a0522d"/>
        <rect x="${x - 14}" y="${G - 16}" width="6" height="16" fill="#f3e6d0"/><path d="M${x - 24} ${G - 14} q13 -18 26 0Z" fill="#c0532b"/>
        <rect x="${x + 8}" y="${G - 12}" width="5" height="12" fill="#f3e6d0"/><path d="M${x} ${G - 10} q10.5 -14 21 0Z" fill="#c0532b"/>`;
    }
    // factory with chimney
    {
      const x = 650;
      b += `<rect x="${x - 40}" y="${G - 50}" width="70" height="52" fill="#9a8f86"/>
        <rect x="${x + 6}" y="${G - 100}" width="16" height="52" fill="#7d736b"/>
        <path d="M${x - 40} ${G - 50} l17 -16 v16 l17 -16 v16 l17 -16 v16" fill="#9a8f86"/>
        <circle cx="${x + 14}" cy="${G - 112}" r="9" fill="#cfcfcf"/><circle cx="${x + 22}" cy="${G - 126}" r="11" fill="#dcdcdc"/>`;
    }
    // processes
    b += elbow([[24, G - 14], [24, 34], [244, 34]], GREY, 2);               // carbon dioxide leaving the ocean
    b += elbow([[248, 56], [70, 56], [70, G - 14]], GREEN, 3);               // dissolving into the ocean
    b += arrow(322, 70, 300, 150, GREEN, 3);                                  // photosynthesis: air → tree
    b += arrow(332, 150, 360, 72, GREY, 2);                                   // plant respiration (unlabelled)
    b += arrow(450, 248, 450, 72, GREY, 3);                                   // animal respiration
    b += arrow(358, G - 40, 406, G - 40, INK, 3);                             // feeding: tree → sheep
    b += arrow(490, G - 18, 532, G - 6, INK, 3);                              // death and decay → decomposers
    b += arrow(560, G - 26, 498, 72, GREY, 2);                                // decomposer respiration (unlabelled)
    b += arrow(565, G + 16, 565, 432, INK, 3);                                // fossilisation
    b += arrow(670, 438, 670, G + 10, "#5c5f63", 2.5);                        // fuels dug up
    b += `<text x="660" y="${G + 70}" text-anchor="end" class="cap">dug up,</text><text x="660" y="${G + 86}" text-anchor="end" class="cap">drilled</text>`;
    b += arrow(652, G - 140, 524, 58, GREY, 3);                               // combustion
    b += `<text x="10" y="494" class="cap">Green: carbon dioxide taken out of the air. Grey: carbon dioxide put back.</text>`;
    const L = [
      label("dissolving", "Dissolving in the oceans", [70, 112], [90, 112]),
      label("photosynthesis", "Photosynthesis", [313, 104], [250, 142], "end"),
      label("respiration", "Respiration", [450, 150], [440, 128], "end"),
      label("feeding", "Feeding", [382, G - 40], [370, G + 40]),
      label("decay", "Death and decay", [511, G - 12], [480, G + 56]),
      label("fossilisation", "Fossilisation", [565, 380], [450, 395], "end"),
      label("combustion", "Combustion", [588, 99], [604, 92])
    ].join("");
    return svg(700, 500, b + L);
  })();

  /* ---------------- The greenhouse effect ---------------- */
  out["ea-greenhouse"] = (() => {
    const RED = "#c0392b";
    let b = `<rect x="0" y="0" width="620" height="420" fill="${SPACE}"/>`;
    for (let i = 0; i < 30; i++) b += `<circle cx="${(rnd() * 620).toFixed(0)}" cy="${(rnd() * 110).toFixed(0)}" r="${(0.6 + rnd()).toFixed(1)}" fill="#fff" opacity=".6"/>`;
    // atmosphere band
    b += `<rect x="0" y="130" width="620" height="200" fill="#bcd9f0"/>
      <rect x="0" y="130" width="620" height="60" fill="#9cc3e4"/>`;
    for (let i = 0; i < 46; i++) b += `<circle cx="${(8 + rnd() * 604).toFixed(0)}" cy="${(138 + rnd() * 46).toFixed(0)}" r="3" fill="#3d6f99"/>`;
    // ground
    b += `<path d="M0 330 Q310 300 620 330 L620 420 L0 420Z" fill="${LAND}"/>
      <path d="M0 360 Q310 335 620 360" fill="none" stroke="#4f8a3a" stroke-width="2"/>`;
    // sun
    b += `<circle cx="60" cy="40" r="52" fill="${SUN}" stroke="${SUN_EDGE}" stroke-width="3"/>`;
    b += `<text x="560" y="28" text-anchor="middle" class="cap" style="fill:#c9d3e6">space</text>`;
    // sunlight in
    b += arrow(110, 70, 250, 312, SUN_EDGE, 4);
    // infrared out from the ground
    const wavy = (x1, y1, x2, y2, col) => {
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
      let d = `M${x1} ${y1}`;
      const n = Math.floor((len - 12) / 6);
      for (let i = 1; i <= n; i++) { const s = i * 6, w = Math.sin(i * Math.PI / 2) * 5; d += ` L${(x1 + ux * s + nx * w).toFixed(1)} ${(y1 + uy * s + ny * w).toFixed(1)}`; }
      d += ` L${x2} ${y2}`;
      const ang = Math.atan2(dy, dx) * 180 / Math.PI;
      return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.8" stroke-linejoin="round"/>` + arrowHead(x2, y2, ang).replace(INK, col);
    };
    b += wavy(290, 312, 360, 196, RED);               // up from the ground into the gases
    b += wavy(375, 168, 470, 18, RED);                // part escapes to space
    b += wavy(395, 192, 460, 306, RED);               // part is sent back down
    b += `<text x="310" y="404" text-anchor="middle" class="title" style="fill:#fff">The Earth's surface warms up</text>`;
    const L = [
      label("sunlight", "Sunlight", [160, 155], [150, 110], "end"),
      label("infrared", "Infrared from the Earth", [320, 262], [210, 250], "end"),
      label("gases", "Greenhouse gases", [560, 168], [600, 225], "end"),
      label("escape", "Lost to space", [440, 70], [500, 70]),
      label("back", "Sent back to Earth", [440, 270], [480, 290])
    ].join("");
    // names sit on dark or light; give them a white halo so they read on both
    return svg(620, 420, b + L.replace(/class="name"/g, `class="name" style="paint-order:stroke;stroke:#fff;stroke-width:4px"`));
  })();

  /* ---------------- Carbon dioxide and temperature since 1850 (a visual aid) ---------------- */
  out["ea-co2-graph"] = (() => {
    const X0 = 70, X1 = 600, yr = y => X0 + (y - 1850) / (2025 - 1850) * (X1 - X0);
    const panel = (top, h, lo, hi, ticks, data, col, title, unit) => {
      const Y = v => top + h - (v - lo) / (hi - lo) * h;
      let g = `<text x="${X0}" y="${top - 10}" class="title">${title}</text>`;
      g += `<line x1="${X0}" y1="${top}" x2="${X0}" y2="${top + h}" stroke="${INK}" stroke-width="1.5"/>
        <line x1="${X0}" y1="${top + h}" x2="${X1}" y2="${top + h}" stroke="${INK}" stroke-width="1.5"/>`;
      for (const t of ticks) g += `<line x1="${X0}" y1="${Y(t)}" x2="${X1}" y2="${Y(t)}" stroke="#d9d9d9" stroke-width="1"/>
        <text x="${X0 - 8}" y="${Y(t) + 4}" text-anchor="end" class="cap">${t}</text>`;
      g += `<polyline points="${data.map(([y, v]) => `${yr(y).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`;
      g += `<text x="${X0 + 6}" y="${top + 14}" class="cap">${unit}</text>`;
      return g;
    };
    let b = "";
    b += panel(40, 140, 280, 430, [300, 350, 400],
      [[1850, 285], [1880, 291], [1900, 296], [1920, 303], [1940, 310], [1960, 317], [1970, 326], [1980, 339], [1990, 354], [2000, 369], [2010, 390], [2020, 413], [2025, 426]],
      "#5c5f63", "Carbon dioxide in the air", "parts per million");
    b += panel(240, 140, -0.4, 1.6, [0, 0.5, 1, 1.5],
      [[1850, 0], [1880, 0], [1910, -0.15], [1940, 0.15], [1960, 0.1], [1975, 0.15], [1985, 0.4], [2000, 0.65], [2010, 0.9], [2020, 1.2], [2025, 1.4]],
      "#c0392b", "Average temperature of the Earth", "°C warmer than in the late 1800s");
    for (const y of [1850, 1900, 1950, 2000]) b += `<text x="${yr(y)}" y="400" text-anchor="middle" class="cap">${y}</text>`;
    b += `<text x="${(X0 + X1) / 2}" y="424" text-anchor="middle" class="cap">Year (rough figures, smoothed)</text>`;
    return svg(620, 434, b);
  })();

  /* ---------------- How metals are extracted: the reactivity series (a visual aid) ---------------- */
  out["ea-extraction"] = (() => {
    const metals = [["Potassium", "K"], ["Sodium", "Na"], ["Lithium", "Li"], ["Calcium", "Ca"], ["Magnesium", "Mg"], ["Aluminium", "Al"],
      ["CARBON", "C"], ["Zinc", "Zn"], ["Iron", "Fe"], ["Copper", "Cu"], ["Silver", "Ag"], ["Gold", "Au"]];
    const groups = { 0: "#e6dcf2", 7: "#f6e3c4", 10: "#f7efc2" };
    let b = `<text x="20" y="24" class="title">Most reactive</text><text x="20" y="438" class="title">Least reactive</text>`;
    b += arrow(150, 34, 150, 418, INK, 2.5);
    let y = 40, fill = groups[0];
    metals.forEach(([name, sym], i) => {
      if (groups[i]) fill = groups[i];
      if (name === "CARBON") {
        b += `<line x1="170" y1="${y + 15}" x2="600" y2="${y + 15}" stroke="${INK}" stroke-width="2" stroke-dasharray="7 5"/>
          <rect x="190" y="${y + 3}" width="160" height="24" rx="12" fill="${INK}"/>
          <text x="270" y="${y + 20}" text-anchor="middle" class="title" style="fill:#fff">carbon goes here</text>`;
      } else {
        b += `<rect x="190" y="${y + 2}" width="160" height="26" rx="6" fill="${fill}" stroke="#9a9da1" stroke-width="1"/>
          <text x="204" y="${y + 20}" class="title">${name}</text><text x="338" y="${y + 20}" text-anchor="end" class="cap">${sym}</text>`;
      }
      y += 31;
    });
    const brace = (y1, y2, lines) => {
      let g = `<path d="M366 ${y1} q10 0 10 10 V${(y1 + y2) / 2 - 8} q0 8 8 8 q-8 0 -8 8 V${y2 - 10} q0 10 -10 10" fill="none" stroke="${INK}" stroke-width="2"/>`;
      lines.forEach((t, k) => { g += `<text x="396" y="${(y1 + y2) / 2 - (lines.length - 1) * 9 + k * 18 + 4}" class="${k ? "cap" : "title"}">${t}</text>`; });
      return g;
    };
    b += brace(42, 226, ["Electrolysis", "more reactive than carbon,", "so carbon cannot take", "the oxygen away"]);
    b += brace(259, 350, ["Heat with carbon", "less reactive than carbon,", "so carbon displaces them"]);
    b += brace(352, 412, ["Found as the metal", "so unreactive they are", "often found pure"]);
    return svg(620, 450, b);
  })();

  return out;
}
