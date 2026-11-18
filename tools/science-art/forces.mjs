/* Forces (Year 7: speed, gravity) — diagrams for the science trainer.
   node tools/build-science-art.mjs → data/content/secondary/science/forces-*.svg */

export default function (h) {
  const { svg, label, INK } = h;
  const AXIS = "#3b3e42", GRID = "#e4e2dc", LINE = "#2c6fbb", FORCE = "#2c6fbb", FORCE2 = "#d35400";
  const EARTH = "#5b9bd5", LAND = "#6aa84f", MOON = "#c8c6c0", MOON_EDGE = "#8d8a83";

  /* an arrow from (x1,y1) to (x2,y2) with a filled head */
  const arrow = (x1, y1, x2, y2, col = FORCE, w = 5, L = 14, W = 8) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const bx = x2 - L * Math.cos(a), by = y2 - L * Math.sin(a);
    const p1 = [bx + W * Math.sin(a), by - W * Math.cos(a)], p2 = [bx - W * Math.sin(a), by + W * Math.cos(a)];
    return `<line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${col}" stroke-width="${w}"/>
      <polygon points="${x2},${y2} ${p1.join(",")} ${p2.join(",")}" fill="${col}"/>`;
  };

  /* axes with arrow tips and titles */
  const axes = (ox, oy, x2, y2, xt, yt, xo = 26, yo = 14) => `
    <line x1="${ox}" y1="${oy}" x2="${x2}" y2="${oy}" stroke="${AXIS}" stroke-width="2"/>
    <line x1="${ox}" y1="${oy}" x2="${ox}" y2="${y2}" stroke="${AXIS}" stroke-width="2"/>
    <path d="M${x2 - 8} ${oy - 5} L${x2} ${oy} L${x2 - 8} ${oy + 5}" fill="none" stroke="${AXIS}" stroke-width="2"/>
    <path d="M${ox - 5} ${y2 + 8} L${ox} ${y2} L${ox + 5} ${y2 + 8}" fill="none" stroke="${AXIS}" stroke-width="2"/>
    <text x="${(ox + x2) / 2}" y="${oy + xo}" text-anchor="middle">${xt}</text>
    <text x="${ox - yo}" y="${(oy + y2) / 2}" text-anchor="middle" transform="rotate(-90 ${ox - yo} ${(oy + y2) / 2})">${yt}</text>`;

  const out = {};

  /* ---- 1. A journey on a distance–time graph, each part labelled ---- */
  out["forces-dt-graph"] = (() => {
    const path = `<path d="M70 280 Q120 280 150 240 L220 147 Q250 107 300 107 L360 107 L470 67" fill="none" stroke="${LINE}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
    return svg(600, 320, axes(70, 280, 520, 30, "time", "distance") + path +
      label("speeding-up", "speeding up", [115, 270], [175, 268]) +
      label("fast-steady", "fast steady speed", [185, 193], [206, 218]) +
      label("slowing-down", "slowing down", [255, 117], [285, 170]) +
      label("stopped", "stopped", [330, 107], [384, 56], "end") +
      label("slow-steady", "slow steady speed", [415, 87], [438, 138]));
  })();

  /* ---- 2. A walk with numbers, for reading off speeds ---- */
  out["forces-dt-walk"] = (() => {
    const ox = 80, oy = 290, sx = 4, sy = 0.6;          // 1 s = 4 px, 1 m = 0.6 px
    const X = t => ox + t * sx, Y = d => oy - d * sy;
    let g = "";
    for (let t = 0; t <= 100; t += 10) g += `<line x1="${X(t)}" y1="${Y(0)}" x2="${X(t)}" y2="${Y(400)}" stroke="${GRID}"/>`;
    for (let d = 0; d <= 400; d += 50) g += `<line x1="${X(0)}" y1="${Y(d)}" x2="${X(100)}" y2="${Y(d)}" stroke="${GRID}"/>`;
    for (let t = 0; t <= 100; t += 20) g += `<text x="${X(t)}" y="${oy + 17}" text-anchor="middle" font-size="12">${t}</text>`;
    for (let d = 0; d <= 400; d += 100) g += `<text x="${ox - 8}" y="${Y(d) + 4}" text-anchor="end" font-size="12">${d}</text>`;
    const line = `<polyline points="${X(0)},${Y(0)} ${X(40)},${Y(200)} ${X(60)},${Y(200)} ${X(100)},${Y(300)}" fill="none" stroke="${LINE}" stroke-width="4" stroke-linejoin="round"/>`;
    const sec = (t, x, y) => `<circle cx="${x}" cy="${y}" r="12" fill="#fff" stroke="${INK}" stroke-width="1.5"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-weight="700">${t}</text>`;
    return svg(540, 345, g + axes(ox, oy, 520, 30, "time (s)", "distance (m)", 40, 52) + line +
      sec("A", X(16), Y(130)) + sec("B", X(50), Y(240)) + sec("C", X(84), Y(300)));
  })();

  /* ---- 3. Relative motion: two cars, one person by the road ---- */
  out["forces-relative"] = (() => {
    const car = (x, y, col, name) => `
      <rect x="${x}" y="${y}" width="96" height="26" rx="8" fill="${col}" stroke="${INK}" stroke-width="1.5"/>
      <path d="M${x + 22} ${y} L${x + 34} ${y - 18} H${x + 66} L${x + 78} ${y}Z" fill="${col}" stroke="${INK}" stroke-width="1.5"/>
      <path d="M${x + 38} ${y - 14} H${x + 62} L${x + 70} ${y - 2} H${x + 32}Z" fill="#dff1fb"/>
      <circle cx="${x + 22}" cy="${y + 27}" r="10" fill="#333"/><circle cx="${x + 74}" cy="${y + 27}" r="10" fill="#333"/>
      <text x="${x + 48}" y="${y + 18}" text-anchor="middle" font-weight="700" fill="#fff">${name}</text>`;
    const person = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="#efe0d0" stroke="#b89d86" stroke-width="1.5"/>
      <path d="M${x} ${y + 9} v26 M${x - 12} ${y + 18} h24 M${x} ${y + 35} l-9 20 M${x} ${y + 35} l9 20" stroke="#6b5a4a" stroke-width="4" stroke-linecap="round" fill="none"/>`;
    const road = `<rect x="20" y="70" width="600" height="190" fill="#e9e7e1"/>
      <line x1="20" y1="165" x2="620" y2="165" stroke="#fff" stroke-width="4" stroke-dasharray="26 18"/>`;
    return svg(640, 320, road +
      car(330, 108, "#c0392b", "P") + arrow(440, 120, 560, 120, INK, 3) + `<text x="500" y="105" text-anchor="middle" font-weight="700">30 m/s</text>` +
      car(110, 205, "#2c6fbb", "Q") + arrow(220, 217, 320, 217, INK, 3) + `<text x="270" y="202" text-anchor="middle" font-weight="700">25 m/s</text>` +
      person(70, 268) + `<text x="96" y="300">standing by the road</text>` +
      `<text x="320" y="40" text-anchor="middle" class="title">Both cars drive the same way</text>`);
  })();

  /* ---- 4. Same mass, different weight: Earth and Moon ---- */
  out["forces-weight-mass"] = (() => {   // arrows to scale: 600 N → 100 px, 96 N → 16 px
    const astro = (x, y) => `
      <rect x="${x - 6}" y="${y - 38}" width="34" height="28" rx="5" fill="#d9d9d9" stroke="${INK}" stroke-width="1.5"/>
      <rect x="${x - 17}" y="${y - 44}" width="34" height="50" rx="10" fill="#f7f7f5" stroke="${INK}" stroke-width="1.8"/>
      <rect x="${x - 15}" y="${y + 4}" width="12" height="34" rx="5" fill="#f7f7f5" stroke="${INK}" stroke-width="1.8"/>
      <rect x="${x + 3}" y="${y + 4}" width="12" height="34" rx="5" fill="#f7f7f5" stroke="${INK}" stroke-width="1.8"/>
      <circle cx="${x}" cy="${y - 60}" r="18" fill="#f7f7f5" stroke="${INK}" stroke-width="1.8"/>
      <ellipse cx="${x + 3}" cy="${y - 60}" rx="11" ry="8" fill="#f1c40f" stroke="${INK}" stroke-width="1.2"/>`;
    const panel = (x0, title, ground, g, w, len) => {
      const cx = x0 + 70, gy = 250, top = gy - 55;
      return `<rect x="${x0}" y="10" width="290" height="330" rx="12" fill="#fff" stroke="#c9c9c4"/>
        <text x="${x0 + 145}" y="36" text-anchor="middle" class="title">${title}</text>
        ${ground(x0, gy)}
        ${astro(cx, gy - 38)}
        ${len > 40 ? arrow(cx, top, cx, top + len, FORCE2, 6) : arrow(cx, top, cx, top + len, FORCE2, 5, 10, 7)}
        <text x="${len > 40 ? cx + 10 : cx - 22}" y="${len > 40 ? top + len + 16 : top + 12}" text-anchor="${len > 40 ? "start" : "end"}" font-weight="700" fill="${FORCE2}">weight</text>
        <text x="${x0 + 140}" y="90">mass = <tspan font-weight="700">60 kg</tspan></text>
        <text x="${x0 + 140}" y="114">g = <tspan font-weight="700">${g} N/kg</tspan></text>
        <text x="${x0 + 140}" y="138">weight = 60 × ${g}</text>
        <text x="${x0 + 140}" y="162">= <tspan font-weight="700" fill="${FORCE2}">${w} N</tspan></text>`;
    };
    const earthGround = (x0, gy) => `<path d="M${x0 + 1} ${gy} H${x0 + 289} V${gy + 24} H${x0 + 1}Z" fill="${LAND}"/>`;
    const moonGround = (x0, gy) => `<path d="M${x0 + 1} ${gy} H${x0 + 289} V${gy + 24} H${x0 + 1}Z" fill="${MOON}"/>
      <ellipse cx="${x0 + 200}" cy="${gy + 8}" rx="22" ry="5" fill="${MOON_EDGE}"/><ellipse cx="${x0 + 250}" cy="${gy + 14}" rx="12" ry="3.5" fill="${MOON_EDGE}"/>`;
    return svg(600, 350,
      panel(5, "On Earth", earthGround, 10, 600, 100) +
      panel(305, "On the Moon", moonGround, 1.6, 96, 16));
  })();

  /* ---- 5. Force diagrams: skydiver, book on a table, the Moon in orbit ---- */
  out["forces-arrows"] = (() => {
    // skydiver, arms and legs spread
    const sx = 150, sy = 170;
    const diver = `<circle cx="${sx}" cy="${sy - 26}" r="11" fill="#efe0d0" stroke="#b89d86" stroke-width="1.5"/>
      <rect x="${sx - 12}" y="${sy - 14}" width="24" height="40" rx="8" fill="#e67e22" stroke="${INK}" stroke-width="1.5"/>
      <path d="M${sx - 10} ${sy - 8} L${sx - 38} ${sy - 30} M${sx + 10} ${sy - 8} L${sx + 38} ${sy - 30} M${sx - 6} ${sy + 24} L${sx - 26} ${sy + 52} M${sx + 6} ${sy + 24} L${sx + 26} ${sy + 52}" stroke="#e67e22" stroke-width="8" stroke-linecap="round"/>`;
    const p1 = diver + arrow(sx, sy - 40, sx, sy - 120, FORCE) + arrow(sx, sy + 30, sx, sy + 120, FORCE2) +
      `<text x="${sx}" y="300" text-anchor="middle" class="cap">a falling skydiver</text>`;
    // book on a table
    const bx = 360, by = 180;
    const p2 = `<rect x="${bx - 70}" y="${by + 20}" width="140" height="10" fill="#a0522d"/>
      <rect x="${bx - 60}" y="${by + 30}" width="10" height="70" fill="#a0522d"/><rect x="${bx + 50}" y="${by + 30}" width="10" height="70" fill="#a0522d"/>
      <rect x="${bx - 36}" y="${by}" width="72" height="20" rx="2" fill="#27ae60" stroke="${INK}" stroke-width="1.5"/>
      <line x1="${bx - 32}" y1="${by + 15}" x2="${bx + 32}" y2="${by + 15}" stroke="#fff" stroke-width="1.5"/>` +
      arrow(bx - 14, by, bx - 14, by - 90, FORCE) + arrow(bx + 14, by + 20, bx + 14, by + 110, FORCE2) +
      `<text x="${bx + 6}" y="${by + 100}" text-anchor="end" font-weight="700" fill="${FORCE2}">weight</text>` +
      `<text x="${bx}" y="300" text-anchor="middle" class="cap">a book on a table</text>`;
    // the Moon going round the Earth
    const ex = 580, ey = 165, R = 100;
    const mx = ex + R * Math.cos(-0.6), my = ey + R * Math.sin(-0.6);
    const p3 = `<circle cx="${ex}" cy="${ey}" r="${R}" fill="none" stroke="#8a8f96" stroke-width="2" stroke-dasharray="6 6"/>
      <circle cx="${ex}" cy="${ey}" r="26" fill="${EARTH}" stroke="#2e6a9e" stroke-width="2"/>
      <path d="M${ex - 14} ${ey - 12} q10 -6 16 4 q-2 10 -12 8Z M${ex + 4} ${ey + 6} q10 -2 12 8 q-8 6 -14 -2Z" fill="${LAND}"/>
      <circle cx="${mx}" cy="${my}" r="12" fill="${MOON}" stroke="${MOON_EDGE}" stroke-width="2"/>` +
      arrow(mx - 10 * Math.cos(-0.6), my - 10 * Math.sin(-0.6), ex + 34 * Math.cos(-0.6), ey + 34 * Math.sin(-0.6), FORCE2, 4) +
      `<text x="${ex}" y="300" text-anchor="middle" class="cap">the Moon going round the Earth</text>`;
    return svg(740, 310, p1 + p2 + p3 +
      label("air-resistance", "air resistance", [sx, sy - 90], [100, 70], "end") +
      label("weight", "weight", [sx, sy + 85], [200, 250]) +
      label("support", "support force", [bx - 14, by - 60], [385, 90]) +
      label("gravity", "gravity", [ex + 55 * Math.cos(-0.6), ey + 55 * Math.sin(-0.6)], [660, 240]) +
      label("orbit", "orbit", [ex - R * Math.cos(0.8), ey + R * Math.sin(0.8)], [470, 280], "end") );
  })();

  /* ---- 6. Gravitational field strength around the Solar System ---- */
  out["forces-planets"] = (() => {
    const data = [["Mercury", 3.7], ["Venus", 8.9], ["Earth", 10], ["Moon", 1.6], ["Mars", 3.7], ["Jupiter", 25], ["Saturn", 10.4], ["Uranus", 8.7], ["Neptune", 11]];
    const x0 = 100, y0 = 50, bh = 24, gap = 10, sc = 18;   // 1 N/kg = 18 px
    let b = `<text x="320" y="28" text-anchor="middle" class="title">Gravitational field strength, g (N/kg)</text>`;
    for (let v = 0; v <= 25; v += 5) b += `<line x1="${x0 + v * sc}" y1="${y0 - 6}" x2="${x0 + v * sc}" y2="${y0 + data.length * (bh + gap)}" stroke="${GRID}"/>
      <text x="${x0 + v * sc}" y="${y0 + data.length * (bh + gap) + 16}" text-anchor="middle" font-size="12">${v}</text>`;
    data.forEach(([name, g], i) => {
      const y = y0 + i * (bh + gap);
      const col = name === "Earth" ? EARTH : name === "Moon" ? MOON_EDGE : "#9aa5b1";
      b += `<text x="${x0 - 10}" y="${y + bh / 2 + 5}" text-anchor="end"${name === "Earth" || name === "Moon" ? ' font-weight="700"' : ""}>${name}</text>
        <rect x="${x0}" y="${y}" width="${g * sc}" height="${bh}" rx="3" fill="${col}"/>
        <text x="${x0 + g * sc + 6}" y="${y + bh / 2 + 5}" font-weight="700">${g}</text>`;
    });
    b += `<line x1="${x0}" y1="${y0 - 6}" x2="${x0}" y2="${y0 + data.length * (bh + gap)}" stroke="${AXIS}" stroke-width="2"/>`;
    return svg(640, 380, b);
  })();

  /* =============== Year 8 (Part 2): contact forces, pressure =============== */
  const WATER = "#cfe6f5", WATER_EDGE = "#5b9bd5", SAND = "#e8d6a8", SAND_EDGE = "#b89c5a", STEEL = "#9aa3ad", OIL = "#f3d27a";

  /* ---- 7. Equilibrium: a car at steady speed, a hanging lamp ---- */
  out["forces-equilibrium"] = (() => {
    const car = `<rect x="0" y="222" width="440" height="16" fill="#cfcac0"/>
      <rect x="120" y="170" width="160" height="36" rx="10" fill="#c0392b" stroke="${INK}" stroke-width="1.5"/>
      <path d="M150 170 L170 142 H232 L252 170Z" fill="#c0392b" stroke="${INK}" stroke-width="1.5"/>
      <path d="M174 147 H228 L242 167 H164Z" fill="#dff1fb"/>
      <circle cx="152" cy="209" r="13" fill="#333"/><circle cx="248" cy="209" r="13" fill="#333"/>`;
    const lamp = `<rect x="530" y="30" width="160" height="10" fill="#cfcac0"/>
      <line x1="610" y1="40" x2="610" y2="150" stroke="#555" stroke-width="2"/>
      <path d="M592 150 H628 L648 185 H572Z" fill="#16a085" stroke="${INK}" stroke-width="1.5"/>
      <circle cx="610" cy="192" r="8" fill="#f9e79f" stroke="${INK}" stroke-width="1"/>`;
    return svg(720, 345, car + lamp +
      arrow(280, 188, 385, 188, FORCE) + arrow(120, 188, 15, 188, FORCE2) +
      arrow(200, 200, 200, 300, FORCE2) + arrow(200, 150, 200, 50, FORCE) +
      arrow(618, 150, 618, 70, FORCE) + arrow(610, 200, 610, 280, FORCE2) +
      `<text x="622" y="280" font-weight="700" fill="${FORCE2}">weight</text>` +
      `<text x="200" y="335" text-anchor="middle" class="cap">a car moving at a steady speed</text>` +
      `<text x="610" y="335" text-anchor="middle" class="cap">a lamp hanging still</text>` +
      label("driving-force", "driving force", [360, 188], [330, 140]) +
      label("drag", "drag", [40, 188], [30, 140]) +
      label("weight", "weight", [200, 280], [228, 288]) +
      label("support", "support force", [200, 75], [228, 62]) +
      label("tension", "tension", [618, 100], [648, 100]));
  })();

  /* ---- 8. A skydiver: speeding up, terminal velocity, slowing down ---- */
  out["forces-skydiver"] = (() => {
    const diver = (cx, cy) => `<circle cx="${cx}" cy="${cy - 26}" r="11" fill="#efe0d0" stroke="#b89d86" stroke-width="1.5"/>
      <rect x="${cx - 12}" y="${cy - 14}" width="24" height="40" rx="8" fill="#e67e22" stroke="${INK}" stroke-width="1.5"/>
      <path d="M${cx - 10} ${cy - 8} L${cx - 38} ${cy - 30} M${cx + 10} ${cy - 8} L${cx + 38} ${cy - 30} M${cx - 6} ${cy + 24} L${cx - 26} ${cy + 52} M${cx + 6} ${cy + 24} L${cx + 26} ${cy + 52}" stroke="#e67e22" stroke-width="8" stroke-linecap="round"/>`;
    const chute = (cx, cy) => `<path d="M${cx - 70} ${cy - 85} Q${cx} ${cy - 150} ${cx + 70} ${cy - 85} Z" fill="#f5b7b1" stroke="#922b21" stroke-width="1.5"/>
      <path d="M${cx - 70} ${cy - 85} L${cx - 10} ${cy - 20} M${cx + 70} ${cy - 85} L${cx + 10} ${cy - 20}" stroke="#7b7d7d" stroke-width="1.2"/>`;
    const panel = (i, title, drag, cap, withChute) => {
      const cx = 115 + i * 230, cy = 205;
      return `<text x="${cx}" y="24" text-anchor="middle" class="title">${title}</text>` +
        (withChute ? chute(cx, cy) : "") + diver(cx, cy) +
        arrow(cx, cy + 30, cx, cy + 120, FORCE2) +
        (drag > 30 ? arrow(cx, cy - 40, cx, cy - 40 - drag, FORCE) : arrow(cx, cy - 40, cx, cy - 40 - drag, FORCE, 4, 10, 7)) +
        `<text x="${cx + 12}" y="${cy + 112}" font-weight="700" fill="${FORCE2}">weight</text>` +
        `<text x="${cx + 12}" y="${cy - 40 - drag + 14}" font-weight="700" fill="${FORCE}">drag</text>` +
        `<text x="${cx}" y="358" text-anchor="middle" class="cap">${cap}</text>`;
    };
    return svg(690, 370,
      panel(0, "Just jumped", 25, "drag smaller than weight: speeds up", false) +
      panel(1, "Terminal velocity", 90, "drag = weight: steady speed", false) +
      panel(2, "Parachute open", 135, "drag bigger than weight: slows down", true));
  })();

  /* ---- 9. Stretching a spring: the apparatus ---- */
  out["forces-spring-setup"] = (() => {
    let coils = `M250 62 V72`;
    for (let y = 72; y < 190; y += 12) coils += ` L264 ${y + 6} L236 ${y + 12}`;
    coils += ` L250 196 V202`;
    let ticks = "";
    for (let y = 60; y <= 340; y += 10) ticks += `<line x1="330" y1="${y}" x2="${y % 50 === 0 ? 342 : 337}" y2="${y}" stroke="${INK}" stroke-width="1"/>`;
    const mass = y => `<rect x="226" y="${y}" width="48" height="16" rx="3" fill="#a6acaf" stroke="${INK}" stroke-width="1.2"/>`;
    return svg(520, 390,
      `<rect x="50" y="360" width="160" height="16" rx="3" fill="#7f8c8d"/>
      <rect x="105" y="35" width="10" height="326" fill="${STEEL}" stroke="#5d6d7e"/>
      <rect x="100" y="48" width="160" height="12" rx="3" fill="#5d6d7e"/>
      <rect x="330" y="50" width="22" height="295" fill="#fdf2c4" stroke="${INK}" stroke-width="1.2"/>` + ticks +
      `<path d="${coils}" fill="none" stroke="#2c3e50" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="250" y1="202" x2="250" y2="224" stroke="#2c3e50" stroke-width="3"/>` +
      mass(224) + mass(242) + mass(260) +
      `<line x1="262" y1="205" x2="330" y2="205" stroke="#c0392b" stroke-width="2.5"/>` +
      label("clamp-stand", "clamp stand", [110, 250], [92, 250], "end") +
      label("spring", "spring", [262, 120], [380, 110]) +
      label("pointer", "pointer", [300, 205], [380, 175]) +
      label("masses", "masses", [274, 250], [380, 245]) +
      label("ruler", "ruler", [352, 300], [380, 305]));
  })();

  /* ---- 10. Force–extension graph: straight, then curving ---- */
  out["forces-spring-graph"] = (() => {
    const ox = 80, oy = 290, sx = 50, sy = 12;           // 1 N = 50 px, 1 cm = 12 px
    const X = f => ox + f * sx, Y = e => oy - e * sy;
    let g = "";
    for (let f = 0; f <= 8; f++) g += `<line x1="${X(f)}" y1="${Y(0)}" x2="${X(f)}" y2="${Y(20)}" stroke="${GRID}"/>
      <text x="${X(f)}" y="${oy + 17}" text-anchor="middle" font-size="12">${f}</text>`;
    for (let e = 0; e <= 20; e += 2) g += `<line x1="${X(0)}" y1="${Y(e)}" x2="${X(8)}" y2="${Y(e)}" stroke="${GRID}"/>`;
    for (let e = 0; e <= 20; e += 4) g += `<text x="${ox - 8}" y="${Y(e) + 4}" text-anchor="end" font-size="12">${e}</text>`;
    const pts = [[0, 0], [1, 2], [2, 4], [3, 6], [4, 8], [5, 10], [6, 13], [7, 18]];
    const line = `<path d="M${X(0)} ${Y(0)} L${X(5)} ${Y(10)} Q${X(6)} ${Y(12)} ${X(7)} ${Y(18)}" fill="none" stroke="${LINE}" stroke-width="3"/>`;
    const dots = pts.map(([f, e]) => `<circle cx="${X(f)}" cy="${Y(e)}" r="4" fill="${INK}"/>`).join("");
    return svg(540, 340, g + axes(ox, oy, 500, 30, "force (N)", "extension (cm)", 40, 46) + line + dots +
      `<circle cx="${X(5)}" cy="${Y(10)}" r="9" fill="none" stroke="${FORCE2}" stroke-width="2.5"/>
      <text x="${X(5) + 10}" y="${Y(10) + 28}" fill="${FORCE2}" font-weight="700">limit of proportionality</text>
      <text x="${X(0.3)}" y="${Y(17)}" font-weight="700">straight line through 0:</text>
      <text x="${X(0.3)}" y="${Y(17) + 17}">extension is proportional to force</text>`);
  })();

  /* ---- 11. Same block, two faces: pressure on sand ---- */
  out["forces-pressure-block"] = (() => {
    const sand = (x0) => `<rect x="${x0}" y="220" width="280" height="60" fill="${SAND}" stroke="${SAND_EDGE}"/>`;
    const txt = (x, lines) => lines.map((l, i) => `<text x="${x}" y="${58 + i * 22}"${i === 2 ? ` font-weight="700" fill="${FORCE2}"` : ""}>${l}</text>`).join("");
    return svg(600, 290,
      `<text x="150" y="26" text-anchor="middle" class="title">Standing on its end</text>
      <text x="450" y="26" text-anchor="middle" class="title">Lying flat</text>` +
      sand(10) + sand(310) +
      `<rect x="60" y="120" width="40" height="116" fill="#b9770e" stroke="${INK}" stroke-width="1.5"/>
      <path d="M50 220 Q56 238 60 236 M100 236 Q104 238 110 220" fill="none" stroke="${SAND_EDGE}" stroke-width="1.5"/>
      <rect x="350" y="199" width="200" height="23" fill="#b9770e" stroke="${INK}" stroke-width="1.5"/>` +
      txt(120, ["weight = 30 N", "area = 0.01 m²", "pressure = 3000 N/m²", "sinks in deeply"]) +
      txt(330, ["weight = 30 N", "area = 0.05 m²", "pressure = 600 N/m²", "hardly sinks in"]));
  })();

  /* ---- 12. Water pressure grows with depth ---- */
  out["forces-depth"] = (() => {
    const holes = [[110, 70], [170, 105], [230, 130]];   // y of hole, horizontal reach
    let jets = "";
    for (const [y, r] of holes) jets += `<path d="M202 ${y} Q${202 + r * 0.7} ${y} ${202 + r} ${y + 55}" fill="none" stroke="${WATER_EDGE}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="200" cy="${y}" r="4" fill="${INK}"/>`;
    return svg(470, 330,
      `<rect x="80" y="60" width="120" height="230" fill="${WATER}"/>
      <path d="M80 30 V290 H200 V30" fill="none" stroke="${INK}" stroke-width="3"/>
      <line x1="80" y1="60" x2="200" y2="60" stroke="${WATER_EDGE}" stroke-width="2"/>` + jets +
      arrow(45, 70, 45, 280, AXIS, 2.5, 10, 6) +
      `<text x="35" y="180" text-anchor="middle" transform="rotate(-90 35 180)">deeper</text>
      <text x="300" y="100" font-weight="700">shallow: weak jet</text>
      <text x="345" y="300" text-anchor="middle" font-weight="700">deepest: strongest jet</text>
      <text x="140" y="318" text-anchor="middle" class="cap">water pressure increases with depth</text>`);
  })();

  /* ---- 13. Floating and sinking: weight and upthrust ---- */
  out["forces-float"] = (() => {
    return svg(560, 340,
      `<rect x="10" y="150" width="540" height="180" fill="${WATER}"/>
      <line x1="10" y1="150" x2="550" y2="150" stroke="${WATER_EDGE}" stroke-width="2"/>
      <text x="140" y="26" text-anchor="middle" class="title">Floats</text>
      <text x="420" y="26" text-anchor="middle" class="title">Sinks</text>
      <path d="M85 132 H195 L180 168 H100Z" fill="#e67e22" stroke="${INK}" stroke-width="1.5"/>
      <ellipse cx="420" cy="215" rx="30" ry="20" fill="#7f8c8d" stroke="${INK}" stroke-width="1.5"/>` +
      arrow(155, 140, 155, 60, FORCE) + arrow(125, 160, 125, 240, FORCE2) +
      arrow(432, 200, 432, 165, FORCE, 4, 10, 7) + arrow(408, 230, 408, 330, FORCE2) +
      `<text x="166" y="72" font-weight="700" fill="${FORCE}">upthrust</text>
      <text x="114" y="236" text-anchor="end" font-weight="700" fill="${FORCE2}">weight</text>
      <text x="444" y="176" font-weight="700" fill="${FORCE}">upthrust</text>
      <text x="397" y="318" text-anchor="end" font-weight="700" fill="${FORCE2}">weight</text>
      <text x="140" y="292" text-anchor="middle" class="cap">upthrust = weight</text>
      <text x="480" y="292" text-anchor="middle" class="cap">weight &gt; upthrust</text>`);
  })();

  /* ---- 14. A hydraulic jack ---- */
  out["forces-hydraulic"] = (() => {
    return svg(680, 320,
      `<path d="M160 140 V270 H550 V140 H390 V240 H200 V140Z" fill="${OIL}"/>
      <path d="M160 90 V270 H550 V90 M200 90 V240 H390 V90" fill="none" stroke="${INK}" stroke-width="3"/>
      <rect x="162" y="128" width="36" height="12" fill="#5d6d7e"/><rect x="176" y="96" width="8" height="32" fill="#5d6d7e"/>
      <rect x="392" y="128" width="156" height="12" fill="#5d6d7e"/>
      <rect x="430" y="82" width="80" height="46" rx="4" fill="#2c6fbb" stroke="${INK}" stroke-width="1.5"/>
      <text x="470" y="110" text-anchor="middle" font-weight="700" style="fill:#fff">load</text>` +
      arrow(180, 22, 180, 92, FORCE2, 4, 10, 7) + arrow(470, 76, 470, 14, FORCE, 7, 16, 11) +
      `<text x="488" y="36" font-weight="700" fill="${FORCE}">large force out</text>` +
      label("effort", "small force in", [180, 50], [215, 40]) +
      label("small-piston", "small piston", [160, 134], [145, 134], "end") +
      label("large-piston", "large piston", [550, 134], [575, 160]) +
      label("oil", "oil (a liquid)", [300, 255], [320, 300]));
  })();

  /* ---- 15. A balanced seesaw: turning forces ---- */
  out["forces-seesaw"] = (() => {
    const kid = (x, w, col) => `<rect x="${x - 30}" y="104" width="60" height="40" rx="6" fill="${col}" stroke="${INK}" stroke-width="1.5"/>
      <text x="${x}" y="129" text-anchor="middle" font-weight="700" style="fill:#fff">${w}</text>`;
    const dim = (x1, x2, t) => `<path d="M${x1} 200 H${x2} M${x1} 193 V207 M${x2} 193 V207" stroke="${INK}" stroke-width="1.5"/>
      <text x="${(x1 + x2) / 2}" y="222" text-anchor="middle" font-weight="700">${t}</text>`;
    return svg(560, 240,
      `<rect x="60" y="144" width="440" height="10" rx="3" fill="#a0522d"/>
      <path d="M280 154 L255 190 H305Z" fill="#7f8c8d" stroke="${INK}" stroke-width="1.5"/>
      <text x="280" y="26" text-anchor="middle" class="title">Balanced: anticlockwise moment = clockwise moment</text>` +
      kid(130, "400 N", "#16a085") + kid(380, "600 N", "#8e44ad") +
      arrow(130, 60, 130, 100, FORCE2, 4, 10, 7) + arrow(380, 60, 380, 100, FORCE2, 4, 10, 7) +
      dim(130, 280, "3 m") + dim(280, 380, "2 m") +
      `<text x="312" y="184" class="cap">pivot</text>`);
  })();

  return out;
}
