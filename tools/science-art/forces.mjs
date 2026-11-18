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

  return out;
}
