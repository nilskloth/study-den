/* Energy (Year 7, 3.3.1 Energy costs + 3.3.2 Energy transfer) diagrams.
   en-stores        five everyday objects, each labelled with the energy store it fills
   en-power-station fuel → boiler → turbine → generator → power lines → home
   en-sankey        energy flow (Sankey) diagram for a filament bulb, 100 J in
   en-food-label    a simple food label giving energy in kJ (and kcal) */

export default function (h) {
  const { svg, label, INK } = h;
  const EDGE = "#5c5f63";
  const STEEL = "#b8c2cc", STEEL_DARK = "#6f7b86";
  const HOT = "#e8743b", FLAME = "#f4b942";
  const WATER = "#bfe0f2";
  const out = {};

  /* ---------- Energy stores: one object per store, labels on the right ---------- */
  out["en-stores"] = (() => {
    let b = "";
    const rowY = i => 50 + i * 92;
    const card = i => `<rect x="20" y="${rowY(i) - 38}" width="170" height="80" rx="10" fill="#fff" stroke="#c9c9c4"/>`;
    for (let i = 0; i < 5; i++) b += card(i);

    /* 0. battery → chemical */
    let y = rowY(0);
    b += `<rect x="62" y="${y - 16}" width="80" height="34" rx="5" fill="#4a90a4" stroke="${EDGE}" stroke-width="2"/>
      <rect x="142" y="${y - 7}" width="9" height="16" rx="2" fill="${STEEL}" stroke="${EDGE}" stroke-width="2"/>
      <text x="78" y="${y + 6}" font-weight="700" style="fill:#fff">−</text>
      <text x="120" y="${y + 6}" font-weight="700" style="fill:#fff">+</text>`;

    /* 1. stretched spring pulled at both ends → elastic */
    y = rowY(1);
    let zig = `M44 ${y}`;
    for (let k = 0; k < 10; k++) zig += ` L${54 + k * 10} ${y + (k % 2 ? 12 : -12)}`;
    zig += ` L${156} ${y} L166 ${y}`;
    b += `<path d="${zig}" fill="none" stroke="${STEEL_DARK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M44 ${y} h-12 m6 -6 l-6 6 l6 6" fill="none" stroke="${INK}" stroke-width="2"/>
      <path d="M166 ${y} h12 m-6 -6 l6 6 l-6 6" fill="none" stroke="${INK}" stroke-width="2"/>`;

    /* 2. box lifted onto a high shelf → gravitational potential */
    y = rowY(2);
    b += `<line x1="40" y1="${y + 34}" x2="170" y2="${y + 34}" stroke="${EDGE}" stroke-width="2"/>
      <rect x="100" y="${y - 10}" width="64" height="6" fill="#a9845a" stroke="${EDGE}" stroke-width="1.5"/>
      <line x1="160" y1="${y - 4}" x2="160" y2="${y + 34}" stroke="${EDGE}" stroke-width="2"/>
      <rect x="114" y="${y - 32}" width="30" height="22" fill="#d9a066" stroke="${EDGE}" stroke-width="2"/>
      <path d="M62 ${y + 28} v-54 m-7 9 l7 -9 l7 9" fill="none" stroke="${INK}" stroke-width="2"/>`;

    /* 3. moving ball with speed lines → kinetic */
    y = rowY(3);
    b += `<circle cx="132" cy="${y}" r="22" fill="#e74c3c" stroke="${EDGE}" stroke-width="2"/>
      <path d="M118 ${y - 14} q14 14 0 28" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>
      <path d="M44 ${y - 12} h52 M34 ${y} h60 M44 ${y + 12} h52" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;

    /* 4. hot drink with steam → thermal */
    y = rowY(4);
    b += `<path d="M78 ${y - 12} h52 l-6 44 h-40 Z" fill="#f2f2ee" stroke="${EDGE}" stroke-width="2"/>
      <path d="M130 ${y - 4} c18 0 18 24 -3 24" fill="none" stroke="${EDGE}" stroke-width="2.5"/>
      <rect x="82" y="${y - 8}" width="44" height="6" fill="#8b5a2b"/>
      ${[88, 104, 120].map(x => `<path d="M${x} ${y - 18} c-6 -6 6 -10 0 -18" fill="none" stroke="${HOT}" stroke-width="2" stroke-linecap="round"/>`).join("")}`;

    const names = [["chemical", "Chemical store"], ["elastic", "Elastic store"], ["gravitational", "Gravitational potential store"], ["kinetic", "Kinetic store"], ["thermal", "Thermal store"]];
    const dots = [[100, rowY(0)], [100, rowY(1) - 12], [129, rowY(2) - 21], [132, rowY(3)], [104, rowY(4) + 12]];
    names.forEach(([part, name], i) => { b += label(part, name, dots[i], [214, rowY(i)]); });
    return svg(440, 470, b);
  })();

  /* ---------- Power station: from fuel to the home ---------- */
  out["en-power-station"] = (() => {
    let b = "";
    const ground = 200;
    b += `<line x1="10" y1="${ground}" x2="630" y2="${ground}" stroke="${EDGE}" stroke-width="1.5"/>`;
    /* fuel pile + flames */
    b += `<path d="M24 ${ground} l14 -22 l12 8 l12 -14 l14 18 l10 -6 l8 16 Z" fill="#3b3b3b" stroke="#222" stroke-width="1.5"/>`;
    /* boiler with water/steam, flames under it */
    b += `<rect x="104" y="96" width="70" height="78" rx="8" fill="${WATER}" stroke="${STEEL_DARK}" stroke-width="2.5"/>
      <path d="M104 132 h70" stroke="${STEEL_DARK}" stroke-width="1" stroke-dasharray="4 3"/>
      <path d="M114 196 c-4 -10 8 -12 4 -22 c10 8 10 14 6 22 Z M134 196 c-4 -12 8 -14 4 -26 c12 10 12 16 6 26 Z M154 196 c-4 -10 8 -12 4 -22 c10 8 10 14 6 22 Z" fill="${FLAME}" stroke="${HOT}" stroke-width="1.5"/>
      `;
    /* steam pipe to turbine */
    b += `<path d="M174 110 h40" stroke="${STEEL_DARK}" stroke-width="10"/><path d="M174 110 h40" stroke="#eef4f8" stroke-width="5"/>`;
    /* turbine: housing with blades */
    b += `<rect x="214" y="84" width="74" height="54" rx="6" fill="#eef1f4" stroke="${STEEL_DARK}" stroke-width="2.5"/>`;
    for (let k = 0; k < 6; k++) b += `<line x1="${226 + k * 10}" y1="${92 + (k % 2) * 2}" x2="${232 + k * 10}" y2="${130 - (k % 2) * 2}" stroke="${STEEL_DARK}" stroke-width="3"/>`;
    /* shaft to generator */
    b += `<line x1="288" y1="111" x2="318" y2="111" stroke="${INK}" stroke-width="5"/>`;
    /* generator with coil */
    b += `<rect x="318" y="86" width="62" height="50" rx="6" fill="#f6e3b4" stroke="#a07a2b" stroke-width="2.5"/>`;
    for (let k = 0; k < 5; k++) b += `<ellipse cx="${332 + k * 8}" cy="111" rx="4" ry="14" fill="none" stroke="#b5651d" stroke-width="2"/>`;
    /* building outline */
    b += `<path d="M94 ${ground} V70 H394 V${ground}" fill="none" stroke="#9aa0a6" stroke-width="1.5" stroke-dasharray="6 4"/>`;
    /* pylon + lines */
    const pylon = x => `<path d="M${x - 12} ${ground} L${x} 60 L${x + 12} ${ground} M${x - 18} 74 h36 M${x - 9} 130 h18 M${x - 6} 100 L${x + 8} 150 M${x + 6} 100 L${x - 8} 150" fill="none" stroke="${EDGE}" stroke-width="2"/>`;
    b += pylon(470);
    b += `<path d="M380 100 Q426 92 452 74 M488 74 Q530 92 566 128" fill="none" stroke="${INK}" stroke-width="1.8"/>`;
    /* house with a lamp */
    b += `<path d="M546 ${ground} V140 L586 110 L626 140 V${ground} Z" fill="#fbeee0" stroke="${EDGE}" stroke-width="2"/>
      <rect x="574" y="160" width="24" height="40" fill="#c9a27a" stroke="${EDGE}" stroke-width="1.5"/>
      <circle cx="608" cy="150" r="7" fill="#ffe680" stroke="#c9a400" stroke-width="1.5"/>`;
    /* what each step fills, along the bottom */
    const steps = [["chemical", "store"], ["thermal", "store"], ["kinetic", "store"], ["electrically", "to homes"], ["light,", "sound…"]];
    const xs = [50, 140, 300, 470, 586];
    steps.forEach(([l1, l2], i) => {
      b += `<text x="${xs[i]}" y="${ground + 26}" text-anchor="middle" class="cap">${l1}</text><text x="${xs[i]}" y="${ground + 42}" text-anchor="middle" class="cap">${l2}</text>`;
      if (i < steps.length - 1) b += `<path d="M${xs[i] + 38} ${ground + 30} H${xs[i + 1] - 38} m-6 -5 l6 5 l-6 5" fill="none" stroke="#9aa0a6" stroke-width="1.5"/>`;
    });
    b += label("fuel", "Fuel", [48, 190], [36, 40], "start");
    b += label("boiler", "Boiler", [140, 104], [140, 40], "start");
    b += label("turbine", "Turbine", [250, 92], [244, 40], "start");
    b += label("generator", "Generator", [350, 92], [356, 40], "start");
    b += label("power-lines", "Power lines", [520, 98], [500, 40], "start");
    return svg(640, 268, b);
  })();

  /* ---------- Sankey diagram for a filament bulb ---------- */
  out["en-sankey"] = (() => {
    const s = 1.4;                                // px per joule
    const x0 = 30, x1 = 230, top = 70;
    const useful = 10 * s, wasted = 90 * s, total = 100 * s;
    let b = `<text x="${x0}" y="34" class="title">Filament bulb: what happens to 100 J</text>`;
    /* input band */
    b += `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${total}" fill="#f2c94c"/>`;
    /* useful: straight on */
    b += `<path d="M${x1} ${top} H${x1 + 200} l18 ${useful / 2} l-18 ${useful / 2} H${x1} Z" fill="#f2c94c"/>`;
    /* wasted: bends down */
    const yb = top + useful, xc = x1 + 20, r0 = 20, R = r0 + wasted, yEnd = yb + R + 30;
    b += `<path d="M${x1} ${yb} H${xc} A${R} ${R} 0 0 1 ${xc + R} ${yb + R} V${yEnd} L${xc + (r0 + R) / 2} ${yEnd + 20} L${xc + r0} ${yEnd} V${yb + R} A${r0} ${r0} 0 0 0 ${xc} ${yb + wasted} H${x1} Z" fill="#e8743b"/>`;
    /* text */
    b += `<text x="${x0 + 10}" y="${top + total / 2 - 4}" class="title">100 J</text>
      <text x="${x0 + 10}" y="${top + total / 2 + 14}">electrical energy in</text>
      <text x="${x1 + 226}" y="${top + useful / 2 + 5}" class="title">10 J light</text>
      <text x="${x1 + 226}" y="${top + useful / 2 + 22}" class="cap">useful</text>
      <text x="${xc + R + 14}" y="${yEnd - 10}" class="title">90 J heats surroundings</text>
      <text x="${xc + R + 14}" y="${yEnd + 8}" class="cap">wasted (dissipated)</text>`;
    return svg(620, 320, b);
  })();

  /* ---------- Food label ---------- */
  out["en-food-label"] = (() => {
    const x = 40, w = 360;
    let b = `<rect x="${x}" y="20" width="${w}" height="236" rx="6" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
      <text x="${x + 14}" y="48" class="title" style="font-size:18px">Cereal bar — nutrition</text>
      <line x1="${x + 10}" y1="60" x2="${x + w - 10}" y2="60" stroke="${INK}" stroke-width="4"/>
      <text x="${x + 14}" y="82" font-weight="700">Typical values</text>
      <text x="${x + 220}" y="82" font-weight="700" text-anchor="end">per 100 g</text>
      <text x="${x + w - 14}" y="82" font-weight="700" text-anchor="end">per bar (40 g)</text>
      <line x1="${x + 10}" y1="92" x2="${x + w - 10}" y2="92" stroke="${INK}" stroke-width="1.5"/>`;
    const rows = [["Energy", "2000 kJ", "800 kJ"], ["", "478 kcal", "191 kcal"], ["Fat", "18 g", "7.2 g"], ["Carbohydrate", "65 g", "26 g"], ["Protein", "8 g", "3.2 g"]];
    rows.forEach(([n, a, c], i) => {
      const y = 116 + i * 28;
      const bold = i < 2 ? ` font-weight="700"` : "";
      b += `<text x="${x + 14}" y="${y}"${bold}>${n}</text><text x="${x + 220}" y="${y}" text-anchor="end"${bold}>${a}</text><text x="${x + w - 14}" y="${y}" text-anchor="end"${bold}>${c}</text>`;
      if (i !== 0) b += `<line x1="${x + 10}" y1="${y + 10}" x2="${x + w - 10}" y2="${y + 10}" stroke="#c9c9c4"/>`;
    });
    return svg(440, 276, b);
  })();

  /* ---------- Hand-crank torch, cut away to show inside ---------- */
  out["en-torch"] = (() => {
    let b = "";
    const top = 90, bot = 150, mid = 120;
    /* body */
    b += `<rect x="60" y="${top}" width="300" height="${bot - top}" rx="22" fill="#e9edf0" stroke="${STEEL_DARK}" stroke-width="2.5"/>
      <path d="M352 ${top - 2} L410 ${top - 22} V${bot + 22} L352 ${bot + 2} Z" fill="#e9edf0" stroke="${STEEL_DARK}" stroke-width="2.5"/>
      <rect x="406" y="${top - 24}" width="10" height="${bot - top + 48}" rx="3" fill="#cfe3f2" stroke="${STEEL_DARK}" stroke-width="2"/>`;
    /* generator: coil around a shaft, linked to the handle */
    b += `<rect x="84" y="${top + 12}" width="78" height="36" rx="6" fill="#f6e3b4" stroke="#a07a2b" stroke-width="2"/>`;
    for (let k = 0; k < 6; k++) b += `<ellipse cx="${96 + k * 11}" cy="${mid}" rx="4" ry="13" fill="none" stroke="#b5651d" stroke-width="2"/>`;
    /* wires */
    b += `<path d="M162 ${mid - 8} H200 M162 ${mid + 8} H200 M282 ${mid - 8} H380 M282 ${mid + 8} H380" stroke="${INK}" stroke-width="1.5" fill="none"/>`;
    /* battery */
    b += `<rect x="200" y="${top + 14}" width="74" height="32" rx="4" fill="#4a90a4" stroke="${EDGE}" stroke-width="2"/>
      <rect x="274" y="${mid - 7}" width="8" height="14" rx="2" fill="${STEEL}" stroke="${EDGE}" stroke-width="1.5"/>`;
    /* LED */
    b += `<path d="M380 ${mid - 10} h10 a10 10 0 0 1 0 20 h-10 Z" fill="#fff6c2" stroke="#c9a400" stroke-width="2"/>`;
    /* light rays */
    for (const dy of [-34, -12, 12, 34]) b += `<path d="M426 ${mid + dy * 0.6} L478 ${mid + dy * 1.3}" stroke="#f2c94c" stroke-width="3" stroke-linecap="round"/>`;
    /* crank handle, outside the body */
    b += `<line x1="123" y1="${bot}" x2="123" y2="${bot + 18}" stroke="${INK}" stroke-width="5"/>
      <path d="M123 ${bot + 18} H60" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <rect x="52" y="${bot + 12}" width="12" height="30" rx="5" fill="#e74c3c" stroke="${EDGE}" stroke-width="2"/>
      <path d="M30 ${bot + 4} a30 30 0 0 0 4 42" fill="none" stroke="#9aa0a6" stroke-width="2"/><path d="M28 ${bot + 40} l6 7 l4 -9" fill="none" stroke="#9aa0a6" stroke-width="2"/>`;
    b += label("handle", "Handle", [58, bot + 34], [100, 224], "start");
    b += label("generator", "Generator", [118, top + 14], [70, 40], "start");
    b += label("battery", "Battery", [237, top + 16], [210, 40], "start");
    b += label("led", "LED (bulb)", [388, mid - 8], [330, 40], "start");
    return svg(500, 250, b);
  })();

  return out;
}
