/* Reactions (3.6): the pH scale, the reactivity series, the test for hydrogen,
   neutralising an acid, and particle pictures of three reactions. */

export default function (h) {
  const { svg, label, INK } = h;
  const GLASS = "#8a9aa6", ACID = "#f6d9d4", WATER = "#d6ecf7", METAL = "#9aa3ab", METAL_EDGE = "#5d666e";
  const out = {};

  /* ---------- the pH scale with universal indicator colours ---------- */
  const UI = ["#d7191c", "#e8412a", "#f06a26", "#f7941d", "#fbb829", "#f4d82b", "#c3d530", "#4cb848",
    "#22a05a", "#16917e", "#2479b8", "#2e56a3", "#3b3c94", "#4f2d88", "#5b237a"];
  out["rx-ph-scale"] = (() => {
    const x0 = 20, w = 40, y = 96, hgt = 46, cx = p => x0 + p * w + w / 2;
    let b = `<text x="320" y="20" text-anchor="middle" class="title">The pH scale (universal indicator colours)</text>`;
    UI.forEach((c, p) => {
      b += `<rect x="${x0 + p * w}" y="${y}" width="${w}" height="${hgt}" fill="${c}"/>`;
      b += `<text x="${cx(p)}" y="${y + 29}" text-anchor="middle" font-weight="700" style="font-size:16px;fill:${p >= 5 && p <= 7 ? INK : "#fff"}">${p}</text>`;
    });
    b += `<rect x="${x0}" y="${y}" width="${15 * w}" height="${hgt}" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
    /* arrows under the bar */
    b += `<path d="M290 ${y + 62} H40 m8 -6 l-8 6 8 6" stroke="${INK}" stroke-width="1.6" fill="none"/>
      <path d="M350 ${y + 62} H600 m-8 -6 l8 6 -8 6" stroke="${INK}" stroke-width="1.6" fill="none"/>
      <text x="165" y="${y + 80}" text-anchor="middle" class="cap">more acidic</text>
      <text x="475" y="${y + 80}" text-anchor="middle" class="cap">more alkaline</text>`;
    /* everyday examples */
    const ex = [[1, "stomach acid", 0], [2, "lemon juice", 1], [3, "vinegar", 0], [7, "pure water", 0],
      [9, "baking soda", 1], [10, "soap", 0], [13, "oven cleaner", 1]];
    const ey = [y + 112, y + 134];
    for (const [p, name, row] of ex) {
      b += `<line x1="${cx(p)}" y1="${y + hgt + 2}" x2="${cx(p)}" y2="${ey[row] - 12}" stroke="#b9bcc0" stroke-dasharray="2 3"/>
        <text x="${cx(p)}" y="${ey[row]}" text-anchor="middle" class="cap">${name}</text>`;
    }
    /* labelled parts: what each part of the scale means */
    const top = y - 2;
    b += label("strong-acid", "strong acid", [cx(1), top], [cx(1) + 6, 66]) +
      label("weak-acid", "weak acid", [cx(5), top], [cx(5) - 6, 66], "end") +
      label("neutral", "neutral", [cx(7), top], [cx(7) + 6, 44]) +
      label("weak-alkali", "weak alkali", [cx(9), top], [cx(9) + 6, 66]) +
      label("strong-alkali", "strong alkali", [cx(13), top], [cx(13) - 6, 44], "end");
    return svg(640, 250, b);
  })();

  /* ---------- the reactivity series ---------- */
  out["rx-series"] = (() => {
    const metals = [["potassium", "K"], ["sodium", "Na"], ["lithium", "Li"], ["calcium", "Ca"], ["magnesium", "Mg"],
      ["aluminium", "Al"], ["zinc", "Zn"], ["iron", "Fe"], ["copper", "Cu"], ["silver", "Ag"], ["gold", "Au"]];
    const shade = ["#c0392b", "#cd4a2f", "#d65d33", "#de7036", "#e5853a", "#eb9a40", "#efae4b", "#f2c25a", "#bcc6cc", "#cfd6db", "#e8d48a"];
    const x = 80, y0 = 44, rowH = 32, bw = 180;
    let b = `<text x="270" y="22" text-anchor="middle" class="title">The reactivity series</text>`;
    metals.forEach(([name, sym], i) => {
      const y = y0 + i * rowH;
      b += `<rect x="${x}" y="${y}" width="${bw}" height="${rowH - 4}" rx="6" fill="${shade[i]}" stroke="#8b7f74" stroke-width="1"/>
        <text x="${x + 12}" y="${y + 19}" font-weight="700">${name}</text>
        <text x="${x + bw - 12}" y="${y + 19}" text-anchor="end" class="cap" style="fill:#3c3f43">${sym}</text>`;
    });
    const yEnd = y0 + metals.length * rowH - 4;
    b += `<path d="M44 ${yEnd} V${y0 + 4} m-7 10 l7 -10 7 10" stroke="${INK}" stroke-width="2.2" fill="none"/>
      <text transform="translate(30 ${(y0 + yEnd) / 2}) rotate(-90)" text-anchor="middle" class="cap">more reactive</text>`;
    const brace = (i1, i2, lines) => {
      const ya = y0 + i1 * rowH + 2, yb = y0 + (i2 + 1) * rowH - 6, xm = x + bw + 12, mid = (ya + yb) / 2;
      return `<path d="M${xm} ${ya} h8 V${yb} h-8 M${xm + 8} ${mid} h8" stroke="${INK}" stroke-width="1.5" fill="none"/>` +
        lines.map((t, k) => `<text x="${xm + 22}" y="${mid + 4 + (k - (lines.length - 1) / 2) * 16}" class="cap">${t}</text>`).join("");
    };
    b += brace(0, 3, ["react with cold water", "(react dangerously", "with acids)"]) +
      brace(4, 7, ["react with dilute acids:", "salt + hydrogen"]) +
      brace(8, 10, ["do not react with", "dilute acids"]);
    return svg(520, yEnd + 16, b);
  })();

  /* ---------- testing for hydrogen ---------- */
  out["rx-h2-test"] = (() => {
    const L = 196, R = 256, top = 70, bot = 330, liq = 180;
    let b = `<rect x="${L}" y="${liq}" width="${R - L}" height="${bot - liq - 28}" fill="${ACID}"/>
      <path d="M${L} ${bot - 30} v2 a30 30 0 0 0 60 0 v-2Z" fill="${ACID}"/>`;
    /* magnesium ribbon pieces */
    b += `<path d="M206 318 l16 -10 M214 324 l22 -2 M230 316 l14 -12" stroke="${METAL_EDGE}" stroke-width="6" stroke-linecap="round"/>
      <path d="M206 318 l16 -10 M214 324 l22 -2 M230 316 l14 -12" stroke="${METAL}" stroke-width="3.5" stroke-linecap="round"/>`;
    /* bubbles */
    for (const [bx, by, r] of [[214, 300, 4], [236, 288, 3.5], [222, 262, 4], [244, 246, 3], [210, 228, 3.5], [232, 214, 4], [246, 196, 3], [218, 192, 3]])
      b += `<circle cx="${bx}" cy="${by}" r="${r}" fill="#fff" stroke="#7c8b96" stroke-width="1.2"/>`;
    /* tube */
    b += `<path d="M${L} ${top} V${bot - 30} a30 30 0 0 0 60 0 V${top}" fill="none" stroke="${GLASS}" stroke-width="3"/>
      <path d="M${L - 5} ${top} h10 M${R - 5} ${top} h10" stroke="${GLASS}" stroke-width="3"/>`;
    /* lit splint at the mouth */
    b += `<line x1="372" y1="18" x2="252" y2="62" stroke="#8a5a2b" stroke-width="7" stroke-linecap="round"/>
      <line x1="372" y1="18" x2="252" y2="62" stroke="#c99a5b" stroke-width="4" stroke-linecap="round"/>
      <path d="M248 64 c-14 -2 -22 -14 -14 -28 c2 10 8 10 10 4 c4 8 10 12 4 24Z" fill="#f39c12" stroke="#d35400" stroke-width="1.2"/>
      <path d="M246 60 c-6 -2 -8 -8 -4 -14 c2 6 6 8 4 14Z" fill="#ffe08a"/>`;
    b += `<text x="118" y="40" text-anchor="middle" font-weight="700" style="font-size:16px;fill:#c0392b">squeaky pop!</text>
      <path d="M180 48 l14 10 M176 62 l16 2 M190 36 l8 14" stroke="#c0392b" stroke-width="1.8"/>`;
    b += label("splint", "lit splint", [320, 37], [344, 92]) +
      label("tube", "test tube", [L, 132], [110, 132], "end") +
      label("hydrogen", "hydrogen bubbles", [232, 214], [300, 214]) +
      label("acid", "dilute acid", [L + 6, 270], [110, 270], "end") +
      label("magnesium", "magnesium", [226, 323], [300, 340]);
    return svg(460, 380, b);
  })();

  /* ---------- neutralising an acid with an alkali ---------- */
  out["rx-neutral"] = (() => {
    let b = "";
    /* beaker with acid + universal indicator (red/orange) */
    b += `<path d="M150 200 V350 q0 12 12 12 h136 q12 0 12 -12 V200" fill="none"/>
      <path d="M152 262 V350 q0 10 10 10 h136 q10 0 10 -10 V262Z" fill="#f08a5d" opacity=".85"/>
      <path d="M144 196 h8 V350 q0 12 12 12 h132 q12 0 12 -12 V196 h8" fill="none" stroke="${GLASS}" stroke-width="3"/>`;
    /* glass rod */
    b += `<line x1="268" y1="168" x2="214" y2="346" stroke="#9fb4c2" stroke-width="7" stroke-linecap="round"/>
      <line x1="268" y1="168" x2="214" y2="346" stroke="#e9f2f7" stroke-width="3" stroke-linecap="round"/>`;
    /* dropping pipette with alkali (blue) */
    b += `<rect x="176" y="62" width="22" height="34" rx="10" fill="#5d6d7e"/>
      <path d="M180 96 h14 v70 l-5 22 h-4 l-5 -22Z" fill="#eef4f8" stroke="${GLASS}" stroke-width="2"/>
      <path d="M181 130 h12 v36 l-5 21 h-2 l-5 -21Z" fill="#5b7fd1"/>
      <path d="M187 204 c-4 6 -4 10 0 10 c4 0 4 -4 0 -10Z" fill="#5b7fd1"/>`;
    /* white tile */
    b += `<rect x="120" y="364" width="220" height="12" rx="2" fill="#fff" stroke="#b9bcc0"/>`;
    b += label("pipette", "dropping pipette", [180, 110], [110, 100], "end") +
      label("alkali", "alkali", [187, 150], [110, 160], "end") +
      label("rod", "glass rod", [260, 196], [348, 160]) +
      label("acid", "acid with indicator", [290, 300], [348, 290]) +
      label("tile", "white tile", [330, 370], [348, 382]);
    return svg(520, 400, b);
  })();

  /* ---------- particle pictures of three reactions ---------- */
  out["rx-particles"] = (() => {
    const COL = { Mg: ["#b8c0c8", "#5d666e"], O: ["#e74c3c", "#922b21"], Zn: ["#a9b7d0", "#4a5a7a"], Cu: ["#d9875a", "#8a4a26"],
      S: ["#f4d03f", "#9a7d0a"], H: ["#ffffff", "#7c8b96"], Cl: ["#7dcea0", "#1e8449"] };
    const atom = (x, y, el, r = 15) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${COL[el][0]}" stroke="${COL[el][1]}" stroke-width="1.8"/>
      <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-weight="700" style="font-size:${el.length > 1 ? 11.5 : 13}px">${el}</text>`;
    const sulfate = (x, y) => `<rect x="${x - 19}" y="${y - 13}" width="38" height="26" rx="13" fill="${COL.S[0]}" stroke="${COL.S[1]}" stroke-width="1.8"/>
      <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-weight="700" style="font-size:11.5px">SO₄</text>`;
    const plus = (x, y) => `<text x="${x}" y="${y + 7}" text-anchor="middle" font-weight="700" style="font-size:22px">+</text>`;
    const arrow = (x, y) => `<path d="M${x - 22} ${y} h40 m-8 -6 l8 6 -8 6" stroke="${INK}" stroke-width="2" fill="none"/>`;
    const row = (y, title, eq, body) => `<text x="20" y="${y - 44}" class="title">${title}</text>${body}
      <text x="320" y="${y + 44}" text-anchor="middle" class="cap">${eq}</text>`;
    let b = "";
    /* 1. oxidation: 2Mg + O2 → 2MgO */
    let y = 84;
    b += row(y, "1. Oxidation", "magnesium + oxygen → magnesium oxide",
      atom(130, y - 18, "Mg") + atom(130, y + 18, "Mg") + plus(200, y) +
      atom(260, y, "O") + atom(288, y, "O") + arrow(360, y) +
      atom(440, y - 18, "Mg") + atom(469, y - 18, "O") + atom(440, y + 18, "Mg") + atom(469, y + 18, "O"));
    /* 2. displacement: Zn + CuSO4 → ZnSO4 + Cu */
    y = 222;
    b += row(y, "2. Displacement", "zinc + copper sulfate → zinc sulfate + copper",
      atom(110, y, "Zn") + plus(160, y) + atom(210, y, "Cu") + sulfate(245, y) + arrow(320, y) +
      atom(400, y, "Zn") + sulfate(435, y) + plus(490, y) + atom(540, y, "Cu"));
    /* 3. metal + acid: Mg + 2HCl → MgCl2 + H2 */
    y = 360;
    b += row(y, "3. Metal + acid", "magnesium + hydrochloric acid → magnesium chloride + hydrogen",
      atom(70, y, "Mg") + plus(112, y) +
      atom(150, y - 18, "H", 11) + atom(176, y - 18, "Cl") + atom(150, y + 18, "H", 11) + atom(176, y + 18, "Cl") +
      arrow(240, y) + atom(311, y, "Cl") + atom(340, y, "Mg") + atom(369, y, "Cl") +
      plus(418, y) + atom(466, y, "H", 11) + atom(488, y, "H", 11));
    return svg(640, 420, b);
  })();

  return out;
}
