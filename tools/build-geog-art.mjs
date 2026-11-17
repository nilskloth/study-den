#!/usr/bin/env node
/* =========================================================
   Draws the Year 7 geography diagrams as SVG:
     node tools/build-geog-art.mjs <ne_110m_admin_0_countries.geojson>
   → data/content/secondary/geography/<name>.svg

   The world maps use Natural Earth country outlines (public domain):
   https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
   Countries are coloured by their CONTINENT; Russia is split at the
   Urals (60°E) so its west is Europe and its east Asia. Projection:
   Equal Earth.

   Labels use the same format as the science diagrams
   (tools/build-science-art.mjs): <g class="lbl" data-part="…"> with a
   leader, a dot, the name and an empty letter badge — so the trainer
   can show letters instead of names and ask "which ocean is C?".
   ========================================================= */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = process.argv[2];
if (!SRC) { console.error("Usage: node tools/build-geog-art.mjs <ne_110m_admin_0_countries.geojson>"); process.exit(1); }
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "content", "secondary", "geography");
mkdirSync(OUT, { recursive: true });

const FONT = "Andika, 'Comic Sans MS', system-ui, sans-serif";
const INK = "#17181a";
const SEA = "#d4e7f4", COAST = "#55697a";

const STYLE = `
  <style>
    text { font-family: ${FONT}; font-size: 13px; fill: ${INK}; }
    .cap { font-size: 12px; fill: #5c5f63; }
    .sea-name { font-style: italic; fill: #2c5c80; }
    .lbl .leader { stroke: #3d4248; stroke-width: 1.3; fill: none; }
    .lbl .dot { fill: #3d4248; }
    .lbl .name { font-weight: 700; paint-order: stroke; stroke: rgba(255,255,255,0.85); stroke-width: 3px; }
    .lbl .letter { display: none; }
    .lbl .letter circle { fill: ${INK}; }
    .lbl .letter text { fill: #fff; font-weight: 700; font-size: 12px; }
    .quiz .lbl .name { display: none; }
    .quiz .lbl .letter { display: block; }
    .lbl.ask .leader { stroke: #c0392b; stroke-width: 2.5; }
    .lbl.ask .dot { fill: #c0392b; r: 6; }
    .lbl.ask .letter circle { fill: #c0392b; }
  </style>`;

const svg = (w, h, body, cls = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="sci-fig ${cls}" role="img">${STYLE}\n${body}\n</svg>\n`;

const r1 = n => Math.round(n * 10) / 10;

/* A label: dot at (px,py), name centred at (tx,ty); the leader runs from
   the edge of the name towards the dot. In quiz mode the letter badge
   sits where the name was. */
function label(part, name, [px, py], [tx, ty], { sea = false } = {}) {
  const w = name.length * 7.2;
  const dx = px - tx, dy = py - ty;
  let lx = tx, ly = ty;
  if (Math.abs(dy) * (w / 2) > Math.abs(dx) * 9) ly = ty + Math.sign(dy) * 10;
  else lx = tx + Math.sign(dx) * (w / 2 + 3);
  const leader = Math.hypot(px - lx, py - ly) > 6 ? `<line class="leader" x1="${r1(lx)}" y1="${r1(ly)}" x2="${r1(px)}" y2="${r1(py)}"/>` : "";
  return `
  <g class="lbl" data-part="${part}">
    ${leader}
    <circle class="dot" cx="${r1(px)}" cy="${r1(py)}" r="3.5"/>
    <text class="name${sea ? " sea-name" : ""}" x="${r1(tx)}" y="${r1(ty + 4.5)}" text-anchor="middle">${name}</text>
    <g class="letter"><circle cx="${r1(tx)}" cy="${r1(ty)}" r="10"/><text x="${r1(tx)}" y="${r1(ty + 4.5)}" text-anchor="middle"></text></g>
  </g>`;
}

const files = {};

/* ---------------- World maps ---------------- */

/* Equal Earth projection (Šavrič, Patterson, Jenny 2018) */
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
const W = 960, S = W / (2 * 2.7064), TOP = 16, H = Math.ceil(2 * 1.3173 * S) + 4 + TOP;
function proj(lon, lat) {
  const l = lon * Math.PI / 180, p = lat * Math.PI / 180;
  const t = Math.asin(M * Math.sin(p)), t2 = t * t, t6 = t2 * t2 * t2;
  const x = l * Math.cos(t) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
  const y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return [W / 2 + x * S, (H + TOP) / 2 - y * S];
}
const P = (lon, lat) => proj(lon, lat);

const COLOURS = {
  "Africa": "#f2c46b", "Asia": "#ec9b7c", "Europe": "#c8b6ec", "North America": "#9fd29a",
  "South America": "#f4a6c8", "Oceania": "#d9b27c", "Antarctica": "#f5f7f9"
};

const geo = JSON.parse(readFileSync(SRC, "utf8"));
const ring = coords => {
  let d = "", last = "";
  coords.forEach(([lon, lat], i) => {
    const [x, y] = proj(lon, lat);
    const pt = `${Math.round(x)},${Math.round(y)}`;
    if (pt === last) return;
    d += (i ? "L" : "M") + pt;
    last = pt;
  });
  return d + "Z";
};
const pathOf = g => (g.type === "Polygon" ? [g.coordinates] : g.coordinates).map(poly => poly.map(ring).join("")).join("");

/* The outline of the whole globe (the sea) */
const outline = (() => {
  const pts = [];
  for (let lat = -90; lat <= 90; lat += 2) pts.push(proj(180, lat));
  for (let lat = 90; lat >= -90; lat -= 2) pts.push(proj(-180, lat));
  return "M" + pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join("L") + "Z";
})();
/* Clip for "west of the Urals" (60°E) */
const urals = (() => {
  const pts = [];
  for (let lat = 90; lat >= 30; lat -= 2) pts.push(proj(60, lat));
  for (let lat = 30; lat <= 90; lat += 2) pts.push(proj(-30, lat));   // not Russia's far east (past 180°)
  return `M${pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join("L")}Z`;
})();

function land(fill) {
  const byCont = {};
  let russia = "";
  for (const f of geo.features) {
    const c = f.properties.CONTINENT;
    const d = pathOf(f.geometry);
    if (f.properties.ADM0_A3 === "RUS") { russia = d; continue; }
    const key = COLOURS[c] ? c : "Other";
    byCont[key] = (byCont[key] || "") + d;
  }
  const colour = c => (fill ? COLOURS[c] || "#e6e1d6" : "#e9e3d4");
  return `
  <defs><clipPath id="west-of-urals"><path d="${urals}"/></clipPath></defs>
  <path d="${outline}" fill="${SEA}" stroke="${COAST}" stroke-width="1"/>
  ${Object.entries(byCont).map(([c, d]) => `<path d="${d}" fill="${colour(c)}" stroke="${COAST}" stroke-width="0.6" stroke-linejoin="round"/>`).join("\n  ")}
  <path d="${russia}" fill="${colour("Asia")}" stroke="${COAST}" stroke-width="0.6" stroke-linejoin="round"/>
  <path d="${russia}" fill="${colour("Europe")}" stroke="${COAST}" stroke-width="0.6" stroke-linejoin="round" clip-path="url(#west-of-urals)"/>`;
}

function equator() {
  const [x1, y] = proj(-180, 0), [x2] = proj(180, 0);
  const [gx] = proj(-178, 0);
  return `<line x1="${r1(x1)}" y1="${r1(y)}" x2="${r1(x2)}" y2="${r1(y)}" stroke="#2c5c80" stroke-width="1" stroke-dasharray="6 4"/>
  <text class="cap" x="${r1(gx + 4)}" y="${r1(y - 5)}">Equator</text>`;
}

/* Continents and oceans: [part, name, dot lon/lat, name lon/lat] */
const CONTINENTS = [
  ["north-america", "North America", [-100, 44], [-104, 56]],
  ["south-america", "South America", [-60, -10], [-62, -22]],
  ["europe", "Europe", [12, 50], [-10, 63]],
  ["africa", "Africa", [20, 6], [20, 16]],
  ["asia", "Asia", [92, 46], [92, 58]],
  ["oceania", "Oceania", [134, -25], [134, -38]],
  ["antarctica", "Antarctica", [40, -80], [80, -69]]
];
const OCEANS = [
  ["pacific", "Pacific Ocean", [-140, 5], [-140, -8]],
  ["atlantic", "Atlantic Ocean", [-35, 12], [-36, 28]],
  ["indian", "Indian Ocean", [78, -18], [80, -30]],
  ["arctic", "Arctic Ocean", [40, 84], [40, 90]],
  ["southern", "Southern Ocean", [-70, -60], [-105, -64]]
];
const toPx = ([p, n, d, t], o) => label(p, n, P(...d), P(...t), o);

files["world"] = svg(W, H, `${land(true)}
  ${equator()}
  ${CONTINENTS.map(c => toPx(c)).join("")}
  ${OCEANS.map(c => toPx(c, { sea: true })).join("")}`);

/* Fantastic places: points on the map */
const PLACES = [
  ["great-barrier-reef", "Great Barrier Reef", [146.5, -18], [163, -42]],
  ["amazon", "Amazon rainforest", [-62, -4], [-95, -10]],
  ["sahara", "Sahara Desert", [10, 23], [-5, 33]],
  ["everest", "Mount Everest", [86.9, 28], [100, 18]],
  ["grand-canyon", "Grand Canyon", [-112.1, 36.1], [-138, 30]],
  ["victoria-falls", "Victoria Falls", [25.9, -17.9], [52, -32]],
  ["iceland", "Iceland", [-19, 65], [-38, 55]]
];
files["places"] = svg(W, H, `${land(true)}
  ${equator()}
  ${PLACES.map(c => {
    const [p, n, d, t] = c;
    return label(p, n, P(...d), P(...t));
  }).join("")}`);

/* ---------------- Compass rose ---------------- */
files["compass"] = (() => {
  const cx = 230, cy = 225;
  const pts = [
    ["n", "North", 0, 140], ["ne", "North-east", 45, 92], ["e", "East", 90, 140], ["se", "South-east", 135, 92],
    ["s", "South", 180, 140], ["sw", "South-west", 225, 92], ["w", "West", 270, 140], ["nw", "North-west", 315, 92]
  ];
  const at = (deg, r) => [cx + r * Math.sin(deg * Math.PI / 180), cy - r * Math.cos(deg * Math.PI / 180)];
  const arm = (deg, r, w, dark) => {
    const [tx, ty] = at(deg, r), [lx, ly] = at(deg - 90, w), [rx, ry] = at(deg + 90, w);
    return `<path d="M${r1(cx)},${r1(cy)}L${r1(lx)},${r1(ly)}L${r1(tx)},${r1(ty)}Z" fill="${dark ? "#2c3e50" : "#fff"}" stroke="#2c3e50" stroke-width="1.2"/>
      <path d="M${r1(cx)},${r1(cy)}L${r1(rx)},${r1(ry)}L${r1(tx)},${r1(ty)}Z" fill="${dark ? "#fff" : "#2c3e50"}" stroke="#2c3e50" stroke-width="1.2"/>`;
  };
  const body = [
    `<circle cx="${cx}" cy="${cy}" r="108" fill="#f6f1e4" stroke="#b9ad92" stroke-width="1.5"/>`,
    ...[45, 135, 225, 315].map(d => arm(d, 88, 13, false)),
    ...[0, 90, 180, 270].map(d => arm(d, 136, 18, true)),
    `<circle cx="${cx}" cy="${cy}" r="5" fill="#2c3e50"/>`,
    ...pts.map(([part, name, deg, r]) => {
      const dot = at(deg, r);
      const far = deg % 90 ? 150 : 175;
      const [tx, ty] = at(deg, far);
      return label(part, name, dot, [tx, ty]);
    })
  ];
  return svg(460, 450, body.join("\n"));
})();

/* ---------------- Grid references: worked examples ---------------- */
const GRID_STYLE = { line: "#7f8c8d", land: "#eef5e6" };

/* Church symbol (as on an OS map: a square with a cross on top) */
const church = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-5" y="-3" width="10" height="9" fill="${INK}"/><line x1="0" y1="-3" x2="0" y2="-13" stroke="${INK}" stroke-width="2"/><line x1="-4" y1="-9" x2="4" y2="-9" stroke="${INK}" stroke-width="2"/></g>`;
const windmill = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><circle r="4" fill="#fff" stroke="${INK}" stroke-width="1.8"/><line x1="-9" y1="-9" x2="9" y2="9" stroke="${INK}" stroke-width="2"/><line x1="-9" y1="9" x2="9" y2="-9" stroke="${INK}" stroke-width="2"/></g>`;

files["grid4"] = (() => {
  const E0 = 23, N0 = 41, n = 4, sq = 70, ox = 50, oy = 20;
  const gx = e => ox + (e - E0) * sq, gy = nn => oy + (N0 + n - nn) * sq;
  let b = `<rect x="${ox}" y="${oy}" width="${n * sq}" height="${n * sq}" fill="${GRID_STYLE.land}"/>`;
  /* the answer square */
  b += `<rect x="${gx(25)}" y="${gy(44)}" width="${sq}" height="${sq}" fill="#fde9a8" stroke="#c99a06" stroke-width="2.5"/>`;
  for (let i = 0; i <= n; i++) {
    b += `<line x1="${gx(E0 + i)}" y1="${oy}" x2="${gx(E0 + i)}" y2="${oy + n * sq}" stroke="${GRID_STYLE.line}" stroke-width="1.2"/>`;
    b += `<line x1="${ox}" y1="${gy(N0 + i)}" x2="${ox + n * sq}" y2="${gy(N0 + i)}" stroke="${GRID_STYLE.line}" stroke-width="1.2"/>`;
    b += `<text x="${gx(E0 + i)}" y="${oy + n * sq + 20}" text-anchor="middle" font-weight="700">${E0 + i}</text>`;
    b += `<text x="${ox - 10}" y="${gy(N0 + i) + 5}" text-anchor="end" font-weight="700">${N0 + i}</text>`;
  }
  b += church(gx(25) + 38, gy(43) - 30, 1.5);
  /* along the corridor … */
  b += `<line x1="${gx(E0) }" y1="${oy + n * sq + 34}" x2="${gx(25) - 4}" y2="${oy + n * sq + 34}" stroke="#c0392b" stroke-width="2.5" marker-end="url(#arr)"/>`;
  b += `<text x="${gx(E0)}" y="${oy + n * sq + 52}" fill="#c0392b" font-weight="700" style="fill:#c0392b">1. Along the corridor: 25</text>`;
  /* … and up the stairs */
  b += `<line x1="${ox + n * sq + 20}" y1="${gy(N0)}" x2="${ox + n * sq + 20}" y2="${gy(43) + 4}" stroke="#2c5c80" stroke-width="2.5" marker-end="url(#arr2)"/>`;
  b += `<text x="${ox + n * sq + 30}" y="${gy(42) + 2}" style="fill:#2c5c80" font-weight="700">2. Up the</text>`;
  b += `<text x="${ox + n * sq + 30}" y="${gy(42) + 18}" style="fill:#2c5c80" font-weight="700">stairs: 43</text>`;
  b += `<circle cx="${gx(25)}" cy="${gy(43)}" r="5" fill="#c0392b"/>`;
  b += `<text x="${ox + n * sq + 30}" y="${gy(44) + 30}" font-weight="700">Church</text>`;
  b += `<text x="${ox + n * sq + 30}" y="${gy(44) + 48}" font-weight="700" font-size="18">= 2543</text>`;
  const defs = `<defs>
    <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z" fill="#c0392b"/></marker>
    <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10Z" fill="#2c5c80"/></marker></defs>`;
  return svg(ox + n * sq + 140, oy + n * sq + 64, defs + b);
})();

files["grid6"] = (() => {
  /* one square, 25–26 by 43–44, split into tenths */
  const sq = 300, ox = 50, oy = 20;
  const x = t => ox + t * sq / 10, y = t => oy + sq - t * sq / 10;
  let b = `<rect x="${ox}" y="${oy}" width="${sq}" height="${sq}" fill="${GRID_STYLE.land}" stroke="${GRID_STYLE.line}" stroke-width="2"/>`;
  for (let i = 1; i < 10; i++) {
    b += `<line x1="${x(i)}" y1="${oy}" x2="${x(i)}" y2="${oy + sq}" stroke="#c9d3c0" stroke-width="1" stroke-dasharray="3 4"/>`;
    b += `<line x1="${ox}" y1="${y(i)}" x2="${ox + sq}" y2="${y(i)}" stroke="#c9d3c0" stroke-width="1" stroke-dasharray="3 4"/>`;
    b += `<text x="${x(i)}" y="${oy + sq + 16}" text-anchor="middle" class="cap">${i}</text>`;
    b += `<text x="${ox - 6}" y="${y(i) + 4}" text-anchor="end" class="cap">${i}</text>`;
  }
  b += `<text x="${ox}" y="${oy + sq + 34}" text-anchor="middle" font-weight="700">25</text><text x="${ox + sq}" y="${oy + sq + 34}" text-anchor="middle" font-weight="700">26</text>`;
  b += `<text x="${ox - 22}" y="${oy + sq + 5}" text-anchor="end" font-weight="700">43</text><text x="${ox - 22}" y="${oy + 5}" text-anchor="end" font-weight="700">44</text>`;
  b += `<line x1="${x(4)}" y1="${y(7)}" x2="${x(4)}" y2="${oy + sq}" stroke="#c0392b" stroke-width="2" stroke-dasharray="6 4"/>`;
  b += `<line x1="${x(4)}" y1="${y(7)}" x2="${ox}" y2="${y(7)}" stroke="#2c5c80" stroke-width="2" stroke-dasharray="6 4"/>`;
  b += windmill(x(4), y(7), 1.6);
  b += `<text x="${ox + sq + 20}" y="${oy + 40}" font-weight="700">Windmill</text>`;
  b += `<text x="${ox + sq + 20}" y="${oy + 70}" style="fill:#c0392b" font-weight="700">along: 25 + 4 tenths</text>`;
  b += `<text x="${ox + sq + 20}" y="${oy + 90}" style="fill:#c0392b" font-weight="700">= 254</text>`;
  b += `<text x="${ox + sq + 20}" y="${oy + 120}" style="fill:#2c5c80" font-weight="700">up: 43 + 7 tenths</text>`;
  b += `<text x="${ox + sq + 20}" y="${oy + 140}" style="fill:#2c5c80" font-weight="700">= 437</text>`;
  b += `<text x="${ox + sq + 20}" y="${oy + 180}" font-weight="700" font-size="18">= 254437</text>`;
  return svg(ox + sq + 190, oy + sq + 44, b);
})();

for (const [name, text] of Object.entries(files)) {
  writeFileSync(join(OUT, `${name}.svg`), text);
  console.log(`${name}.svg  ${(text.length / 1024).toFixed(1)} KB`);
}
