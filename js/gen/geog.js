/* =========================================================
   Year 7 geography: generated map questions.
   Each call draws a fresh grid map (6 × 6 squares, random grid
   numbers, 6 features from an OS-style key) and asks about it:
     grid4-what   What is in square 2443?
     grid4-where  4-figure grid reference of the castle?
     grid6-what   What is at 254437?
     grid6-where  6-figure grid reference of the windmill? (±1 tenth)
     dir-map      Which direction is the church from the school?
   Returns { stem, answer, accept?, choices[3], explain, svg, match? }.
   DOM-free (the map is an SVG string), so tools/test-geog.mjs can
   run it in Node.
   ========================================================= */

const int = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const pad2 = n => String(n).padStart(2, "0");

/* ---------- The key: OS-style symbols ---------- */
const INK = "#17181a";
const abbr = (t, colour = INK) => (x, y) => `<text x="${x}" y="${y + 5}" text-anchor="middle" font-weight="700" font-size="16" style="fill:${colour}">${t}</text>`;
const FEATURES = [
  { id: "church", name: "Church", accept: [], draw: (x, y) => `<g transform="translate(${x},${y + 3})"><rect x="-5" y="-3" width="10" height="9" fill="${INK}"/><line x1="0" y1="-3" x2="0" y2="-13" stroke="${INK}" stroke-width="2"/><line x1="-4" y1="-9" x2="4" y2="-9" stroke="${INK}" stroke-width="2"/></g>` },
  { id: "school", name: "School", accept: ["sch"], draw: abbr("Sch"), key: "Sch" },
  { id: "pub", name: "Pub", accept: ["public house", "ph", "inn"], draw: abbr("PH"), key: "PH" },
  { id: "post", name: "Post office", accept: ["p", "post office", "po"], draw: abbr("P"), key: "P" },
  { id: "farm", name: "Farm", accept: ["fm", "farmhouse"], draw: abbr("Fm"), key: "Fm" },
  { id: "camp", name: "Campsite", accept: ["camp site", "camping", "camping site", "tent"], draw: (x, y) => `<path d="M${x - 9},${y + 7}L${x},${y - 8}L${x + 9},${y + 7}Z" fill="#1d6fb8"/><path d="M${x - 2},${y + 7}L${x},${y + 1}L${x + 2},${y + 7}Z" fill="#fff"/>` },
  { id: "windmill", name: "Windmill", accept: ["wind mill", "wind pump", "windpump"], draw: (x, y) => `<g transform="translate(${x},${y})"><circle r="3.5" fill="#fff" stroke="${INK}" stroke-width="1.8"/><line x1="-8" y1="-8" x2="8" y2="8" stroke="${INK}" stroke-width="2"/><line x1="-8" y1="8" x2="8" y2="-8" stroke="${INK}" stroke-width="2"/></g>` },
  { id: "castle", name: "Castle", accept: ["fort"], draw: (x, y) => `<path d="M${x - 9},${y + 7}V${y - 7}h4v3h3v-3h4v3h3v-3h4V${y + 7}Z" fill="#7a4b2a"/>` },
  { id: "wood", name: "Wood", accept: ["woodland", "woods", "forest", "trees", "tree"], draw: (x, y) => `<g fill="#3d8b3d"><circle cx="${x - 6}" cy="${y + 2}" r="5"/><circle cx="${x + 5}" cy="${y + 3}" r="5"/><circle cx="${x}" cy="${y - 5}" r="5"/></g>` },
  { id: "picnic", name: "Picnic site", accept: ["picnic", "picnic area", "picnic table", "picnic spot"], draw: (x, y) => `<g stroke="#1d6fb8" stroke-width="2.2" fill="none"><line x1="${x - 8}" y1="${y - 3}" x2="${x + 8}" y2="${y - 3}"/><line x1="${x - 5}" y1="${y + 8}" x2="${x}" y2="${y - 3}"/><line x1="${x + 5}" y1="${y + 8}" x2="${x}" y2="${y - 3}"/><line x1="${x - 9}" y1="${y + 3}" x2="${x + 9}" y2="${y + 3}"/></g>` }
];

/* ---------- A random map ---------- */
const N = 6, SQ = 50, OX = 32, OY = 10;

/* Features sit at tenths 2–8 inside their square (never on a line),
   one per square, not in neighbouring squares, so every question has
   one clear answer. pos: easting/northing in tenths of a square from
   the map's corner. */
function makeMap(count = 6) {
  const E0 = int(10, 85), N0 = int(10, 85);
  const feats = shuffle(FEATURES).slice(0, count);
  const used = [];
  const placed = [];
  for (const f of feats) {
    let sx, sy, tries = 0;
    do { sx = int(0, N - 1); sy = int(0, N - 1); tries++; }
    while (used.some(([a, b]) => Math.abs(a - sx) <= 1 && Math.abs(b - sy) <= 1) && tries < 200);
    if (tries >= 200) return makeMap(count);
    used.push([sx, sy]);
    placed.push({ ...f, sx, sy, tx: int(2, 8), ty: int(2, 8) });
  }
  return { E0, N0, feats: placed };
}

/* Grid numbers wrap at 100 like a real map (…98, 99, 00, 01…) */
const eNum = (m, i) => (m.E0 + i) % 100;
const nNum = (m, i) => (m.N0 + i) % 100;
const ref4 = (m, f) => `${pad2(eNum(m, f.sx))}${pad2(nNum(m, f.sy))}`;
const ref6 = (m, f) => `${pad2(eNum(m, f.sx))}${f.tx}${pad2(nNum(m, f.sy))}${f.ty}`;

function drawMap(m) {
  const px = f => OX + (f.sx + f.tx / 10) * SQ;
  const py = f => OY + (N - f.sy - f.ty / 10) * SQ;
  let b = `<rect x="${OX}" y="${OY}" width="${N * SQ}" height="${N * SQ}" fill="#eef5e6"/>`;
  for (let i = 0; i <= N; i++) {
    const x = OX + i * SQ, y = OY + (N - i) * SQ;
    b += `<line x1="${x}" y1="${OY}" x2="${x}" y2="${OY + N * SQ}" stroke="#8a9a8a" stroke-width="1"/>`;
    b += `<line x1="${OX}" y1="${y}" x2="${OX + N * SQ}" y2="${y}" stroke="#8a9a8a" stroke-width="1"/>`;
    if (i < N + 1) {
      b += `<text x="${x}" y="${OY + N * SQ + 23}" text-anchor="middle" font-weight="700" font-size="17">${pad2(eNum(m, i))}</text>`;
      b += `<text x="${OX - 5}" y="${y + 5}" text-anchor="end" font-weight="700" font-size="17">${pad2(nNum(m, i))}</text>`;
    }
  }
  b += m.feats.map(f => f.draw(px(f), py(f))).join("");
  /* key: the symbols on this map, 2 columns */
  const ky = OY + N * SQ + 38, colW = (N * SQ + OX) / 2;
  b += `<text x="4" y="${ky + 5}" font-weight="700" font-size="16">Key</text>`;
  m.feats.forEach((f, i) => {
    const cx = 4 + (i % 2) * colW + 12, cy = ky + 26 + Math.floor(i / 2) * 27;
    b += f.draw(cx, cy);
    b += `<text x="${cx + 22}" y="${cy + 5.5}" font-size="16">${f.name}</text>`;
  });
  const rows = Math.ceil(m.feats.length / 2);
  const w = OX + N * SQ + 14, h = ky + 26 + rows * 27 - 6;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="geo-map" role="img" aria-label="Grid map with a key"><style>text{font-family:Andika,'Comic Sans MS',system-ui,sans-serif;fill:${INK}}</style>${b}</svg>`;
}

const others = (m, f) => shuffle(m.feats.filter(x => x !== f)).slice(0, 3).map(x => x.name);
const lower = s => s.toLowerCase();

/* ---------- Directions ---------- */
export const DIRECTIONS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];

/* The 8-point direction from a to b, or null when it isn't close to one
   (within 12° of a compass point), so the answer is never arguable. */
function directionBetween(m, a, b) {
  const dx = (b.sx * 10 + b.tx) - (a.sx * 10 + a.tx);
  const dy = (b.sy * 10 + b.ty) - (a.sy * 10 + a.ty);
  const deg = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;   // 0 = north, clockwise
  const k = Math.round(deg / 45) % 8;
  const off = Math.abs(((deg - k * 45 + 540) % 360) - 180);
  return off <= 12 ? DIRECTIONS[k] : null;
}

/* ---------- Generators ---------- */
export const GEO_GENERATORS = {
  "grid4-what": () => {
    const m = makeMap(), f = pick(m.feats), ref = ref4(m, f);
    return {
      svg: drawMap(m),
      stem: `What is in grid square ${ref}?`,
      answer: f.name, accept: f.accept, choices: others(m, f),
      explain: `${ref}: go along the bottom to ${ref.slice(0, 2)}, then up the side to ${ref.slice(2)}. The square to the right of and above that corner has the ${lower(f.name)}.`
    };
  },
  "grid4-where": () => {
    const m = makeMap(), f = pick(m.feats), ref = ref4(m, f);
    const e = pad2(eNum(m, f.sx)), n = pad2(nNum(m, f.sy));
    const wrong = [
      `${n}${e}`,                                          // northings first
      `${pad2(eNum(m, f.sx + 1))}${pad2(nNum(m, f.sy + 1))}`, // top-right corner
      `${e}${pad2(nNum(m, f.sy + 1))}`,                     // top-left corner
      `${pad2(eNum(m, f.sx + 1))}${n}`                      // bottom-right corner
    ].filter((r, i, a) => r !== ref && a.indexOf(r) === i);
    return {
      svg: drawMap(m), match: "grid",
      stem: `Give the 4-figure grid reference of the square with the ${lower(f.name)}.`,
      answer: ref, choices: shuffle(wrong).slice(0, 3),
      explain: `Use the bottom-left corner of the square: along the corridor to ${e}, then up the stairs to ${n} — ${ref}.`
    };
  },
  "grid6-what": () => {
    const m = makeMap(), f = pick(m.feats), ref = ref6(m, f);
    return {
      svg: drawMap(m),
      stem: `What is at grid reference ${ref}?`,
      answer: f.name, accept: f.accept, choices: others(m, f),
      explain: `${ref}: along to ${ref.slice(0, 2)} and ${ref[2]} tenths further, then up to ${ref.slice(3, 5)} and ${ref[5]} tenths further. That's the ${lower(f.name)}.`
    };
  },
  "grid6-where": () => {
    const m = makeMap(), f = pick(m.feats), ref = ref6(m, f);
    const e = ref.slice(0, 3), n = ref.slice(3);
    const shift = (s, d) => `${s.slice(0, 2)}${Math.min(9, Math.max(0, Number(s[2]) + d))}`;
    const far = d => (Number(e[2]) + d >= 0 && Number(e[2]) + d <= 9 ? d : -d);
    const wrong = [
      `${n}${e}`,                                     // northings first
      `${ref4(m, f).slice(0, 2)}0${ref4(m, f).slice(2)}0`, // the square's corner, no tenths
      `${shift(e, far(4))}${n}`,                       // tenths misjudged
      `${e}${shift(n, Number(n[2]) + 4 <= 9 ? 4 : -4)}`
    ].filter((r, i, a) => a.indexOf(r) === i && !nearRef(r, ref));
    return {
      svg: drawMap(m), match: "grid6",
      stem: `Give the 6-figure grid reference of the ${lower(f.name)}. (Estimate the tenths.)`,
      answer: ref, choices: shuffle(wrong).slice(0, 3),
      explain: `Along: ${e.slice(0, 2)} and ${e[2]} tenths → ${e}. Up: ${n.slice(0, 2)} and ${n[2]} tenths → ${n}. So ${ref} — one tenth either way is fine, because tenths are estimated.`
    };
  },
  "dir-map": () => {
    for (let tries = 0; tries < 500; tries++) {
      const m = makeMap();
      const [a, b] = shuffle(m.feats);
      const dir = directionBetween(m, a, b);
      if (!dir) continue;
      const k = DIRECTIONS.indexOf(dir);
      const wrong = [DIRECTIONS[(k + 4) % 8], DIRECTIONS[(k + 1) % 8], DIRECTIONS[(k + 7) % 8]];
      return {
        svg: drawMap(m), match: "dir",
        stem: `Which direction is the ${lower(b.name)} from the ${lower(a.name)}?`,
        answer: dir, choices: shuffle(wrong),
        explain: `Put your finger on the ${lower(a.name)} (where you start) and look towards the ${lower(b.name)}: it is ${dir}. North is at the top of the map. (The opposite, ${DIRECTIONS[(k + 4) % 8]}, would be the ${lower(a.name)} seen from the ${lower(b.name)}.)`
      };
    }
    throw new Error("dir-map: no clear direction found");
  }
};

/* Two 6-figure references within one tenth of each other both ways */
export function nearRef(a, b) {
  const d = (x, y) => {
    const v = Math.abs(Number(x) - Number(y));
    return Math.min(v, 1000 - v);    // 999 → 000 wraps
  };
  return /^\d{6}$/.test(a) && /^\d{6}$/.test(b) && d(a.slice(0, 3), b.slice(0, 3)) <= 1 && d(a.slice(3), b.slice(3)) <= 1;
}
