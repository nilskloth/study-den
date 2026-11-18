/* Energy (Year 7, 3.3.1 Energy costs + 3.3.2 Energy transfer) diagrams.
   en-stores        five everyday objects, each labelled with the energy store it fills
   en-power-station fuel → boiler → turbine → generator → power lines → home
   en-sankey        energy flow (Sankey) diagram for a filament bulb, 100 J in
   en-food-label    a simple food label giving energy in kJ (and kcal)
   Year 8 (3.3.3 Work, 3.3.4 Heating and cooling):
   en-lever         a lever lifting a rock: pivot, load, input and output forces
   en-motor-lift    an electric motor winding up a string to lift a weight
   en-cooling-graph temperature–time graph: hot tea cools, a cold drink warms, both to room temperature
   en-convection    convection current in a room heated by a radiator
   en-flask         vacuum flask cut in half
   en-house         a house cross-section with its insulation */

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

  /* ===================== Year 8 (3.3.3 Work, 3.3.4 Heating and cooling) ===================== */

  /* ---------- A lever lifting a rock ---------- */
  out["en-lever"] = (() => {
    const WOOD = "#c49a6c", PUSH = "#c0392b", LIFT = "#2e8b57";
    let b = "";
    b += `<line x1="20" y1="220" x2="590" y2="220" stroke="${EDGE}" stroke-width="1.5"/>`;
    b += `<path d="M170 152 L144 220 L196 220 Z" fill="${STEEL}" stroke="${STEEL_DARK}" stroke-width="2"/>`;
    b += `<rect x="40" y="140" width="530" height="12" rx="3" fill="${WOOD}" stroke="${EDGE}" stroke-width="2"/>`;
    b += `<path d="M54 140 C50 112 66 90 94 88 C124 86 136 110 132 140 Z" fill="#9a9a92" stroke="${EDGE}" stroke-width="2"/>`;
    /* output force: up on the load; input force: down at the far end */
    b += `<path d="M93 82 V34 m-9 12 l9 -12 l9 12" fill="none" stroke="${LIFT}" stroke-width="5" stroke-linejoin="round"/>`;
    b += `<path d="M545 48 V132 m-9 -12 l9 12 l9 -12" fill="none" stroke="${PUSH}" stroke-width="3" stroke-linejoin="round"/>`;
    /* distances from the pivot */
    const dim = (x1, x2, y, t) => `<path d="M${x1} ${y - 6} v12 M${x2} ${y - 6} v12 M${x1} ${y} H${x2}" stroke="#9aa0a6" stroke-width="1.5" fill="none"/>
      <text x="${(x1 + x2) / 2}" y="${y + 18}" text-anchor="middle" class="cap">${t}</text>`;
    b += dim(93, 170, 244, "short");
    b += dim(170, 545, 244, "long distance from the pivot");
    b += `<text x="300" y="292" text-anchor="middle" class="cap">A small push far from the pivot gives a big lift close to it.</text>`;
    b += label("output", "Output force", [93, 52], [118, 26]);
    b += label("load", "Load", [106, 112], [160, 70]);
    b += label("lever", "Lever (rigid bar)", [360, 146], [330, 100]);
    b += label("input", "Input force", [545, 70], [500, 26], "end");
    b += label("pivot", "Pivot", [170, 192], [240, 196]);
    return svg(600, 304, b);
  })();

  /* ---------- An electric motor lifting a weight ---------- */
  out["en-motor-lift"] = (() => {
    let b = "";
    /* bench */
    b += `<rect x="20" y="80" width="280" height="14" fill="#c49a6c" stroke="${EDGE}" stroke-width="2"/>
      <rect x="34" y="94" width="12" height="206" fill="#c49a6c" stroke="${EDGE}" stroke-width="1.5"/>
      <line x1="10" y1="300" x2="550" y2="300" stroke="${EDGE}" stroke-width="1.5"/>`;
    /* battery and wires */
    b += `<rect x="60" y="52" width="70" height="28" rx="4" fill="#4a90a4" stroke="${EDGE}" stroke-width="2"/>
      <rect x="130" y="59" width="7" height="14" rx="2" fill="${STEEL}" stroke="${EDGE}" stroke-width="1.5"/>
      <path d="M137 66 C160 66 170 56 200 60 M70 52 C80 30 180 30 200 70" fill="none" stroke="${INK}" stroke-width="1.8"/>`;
    /* motor with axle and spool */
    b += `<rect x="196" y="46" width="64" height="34" rx="6" fill="#f6e3b4" stroke="#a07a2b" stroke-width="2"/>
      <line x1="260" y1="63" x2="296" y2="63" stroke="${INK}" stroke-width="4"/>
      <rect x="296" y="48" width="14" height="30" rx="3" fill="${STEEL}" stroke="${STEEL_DARK}" stroke-width="2"/>`;
    /* string and slotted masses */
    b += `<line x1="310" y1="72" x2="310" y2="216" stroke="${INK}" stroke-width="2"/>
      <path d="M310 216 v8" stroke="${INK}" stroke-width="3"/>
      <rect x="286" y="224" width="48" height="16" rx="3" fill="#8a8f96" stroke="${EDGE}" stroke-width="2"/>
      <rect x="286" y="240" width="48" height="16" rx="3" fill="#8a8f96" stroke="${EDGE}" stroke-width="2"/>
      <rect x="286" y="256" width="48" height="16" rx="3" fill="#8a8f96" stroke="${EDGE}" stroke-width="2"/>`;
    /* rising arrow */
    b += `<path d="M258 270 V210 m-8 10 l8 -10 l8 10" fill="none" stroke="#2e8b57" stroke-width="3"/>
      <text x="246" y="250" text-anchor="end" class="cap">rises</text>`;
    b += `<text x="280" y="326" text-anchor="middle" class="cap">chemical store (battery) → electrically → motor → mechanically (the string pulls)</text>
      <text x="280" y="344" text-anchor="middle" class="cap">→ gravitational potential store of the weight</text>`;
    b += label("battery", "Battery", [95, 66], [70, 18]);
    b += label("motor", "Motor", [228, 50], [250, 18]);
    b += label("string", "String", [310, 150], [380, 140]);
    b += label("weight", "Weight (load)", [334, 248], [380, 248]);
    return svg(560, 356, b);
  })();

  /* ---------- Temperature–time graph: a hot drink cools, a cold drink warms ---------- */
  out["en-cooling-graph"] = (() => {
    const x0 = 70, y0 = 290, px = 22, py = 2.5;
    const X = t => x0 + t * px, Y = T => y0 - T * py;
    let b = `<text x="290" y="24" text-anchor="middle" class="title">Two drinks left in a room at 20 °C</text>`;
    for (let T = 0; T <= 100; T += 20) b += `<line x1="${x0}" y1="${Y(T)}" x2="${X(20)}" y2="${Y(T)}" stroke="#e3e3de"/><text x="${x0 - 8}" y="${Y(T) + 4}" text-anchor="end" class="cap">${T}</text>`;
    for (let t = 0; t <= 20; t += 5) b += `<text x="${X(t)}" y="${y0 + 18}" text-anchor="middle" class="cap">${t}</text>`;
    b += `<path d="M${x0} ${Y(100) - 8} V${y0} H${X(20) + 8}" fill="none" stroke="${INK}" stroke-width="2"/>`;
    b += `<text x="${X(10)}" y="${y0 + 38}" text-anchor="middle" class="cap">time (minutes)</text>
      <text transform="translate(22 ${Y(50)}) rotate(-90)" text-anchor="middle" class="cap">temperature (°C)</text>`;
    b += `<line x1="${x0}" y1="${Y(20)}" x2="${X(20)}" y2="${Y(20)}" stroke="#9aa0a6" stroke-width="1.5" stroke-dasharray="6 4"/>
      <text x="${X(20) + 12}" y="${Y(20) - 3}" class="cap">room</text><text x="${X(20) + 12}" y="${Y(20) + 12}" class="cap">temperature</text>`;
    const curve = f => { let d = ""; for (let t = 0; t <= 20; t += 0.5) d += `${t ? "L" : "M"}${X(t).toFixed(1)} ${Y(f(t)).toFixed(1)} `; return d; };
    b += `<path d="${curve(t => 20 + 70 * Math.exp(-t / 4))}" fill="none" stroke="${HOT}" stroke-width="3"/>`;
    b += `<path d="${curve(t => 20 - 16 * Math.exp(-t / 4))}" fill="none" stroke="#2f80c0" stroke-width="3"/>`;
    b += `<text x="${X(2.2)}" y="${Y(68)}" font-weight="700" style="fill:${HOT}">hot tea cools</text>
      <text x="${X(1.2)}" y="${Y(-2) - 8}" font-weight="700" style="fill:#2f80c0">cold drink warms up</text>`;
    return svg(600, 344, b);
  })();

  /* ---------- Convection current in a room heated by a radiator ---------- */
  out["en-convection"] = (() => {
    const RED = "#c0392b", BLUE = "#2f80c0";
    let b = `<rect x="30" y="30" width="460" height="260" fill="#fbfaf6" stroke="${EDGE}" stroke-width="4"/>`;
    /* radiator on the left wall, window on the right */
    b += `<rect x="40" y="196" width="34" height="74" rx="3" fill="#f2f2ee" stroke="${STEEL_DARK}" stroke-width="2"/>`;
    for (let k = 0; k < 4; k++) b += `<line x1="${46 + k * 7.5}" y1="202" x2="${46 + k * 7.5}" y2="264" stroke="${STEEL_DARK}" stroke-width="1.5"/>`;
    b += `<rect x="484" y="80" width="12" height="90" fill="#cfe3f2" stroke="${STEEL_DARK}" stroke-width="2"/>`;
    /* the current: up, across, down, back */
    const arr = (d, c) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    b += arr("M98 240 V80 Q98 62 116 62 H200 m-10 -9 l10 9 l-10 9", RED);
    b += arr("M200 62 H400 Q440 62 440 92 V120", "#b0607a");
    b += arr("M440 110 V250 m-9 -11 l9 11 l9 -11", BLUE);
    b += arr("M440 250 Q440 266 420 266 H120 m10 -9 l-10 9 l10 9", BLUE);
    b += arr("M98 120 v-30 m-9 12 l9 -12 l9 12", RED);
    b += `<text x="112" y="150" font-weight="700" style="fill:${RED}">warm air rises</text>
      <text x="112" y="167" class="cap">(it expands and becomes</text><text x="112" y="182" class="cap">less dense)</text>
      <text x="426" y="190" text-anchor="end" font-weight="700" style="fill:${BLUE}">cool air sinks</text>
      <text x="426" y="207" text-anchor="end" class="cap">(denser)</text>
      <text x="270" y="50" text-anchor="middle" class="cap">spreads across the ceiling and cools</text>
      <text x="270" y="256" text-anchor="middle" class="cap">flows back to the radiator along the floor</text>
      <text x="270" y="120" text-anchor="middle" class="title">convection current</text>
      <text x="57" y="188" text-anchor="middle" class="cap">radiator</text>
      <text x="504" y="130" class="cap">cold</text><text x="504" y="145" class="cap">window</text>`;
    return svg(560, 310, b);
  })();

  /* ---------- Vacuum flask, cut in half ---------- */
  out["en-flask"] = (() => {
    const SILVER = "#8e99a3";
    let b = `<text x="210" y="24" text-anchor="middle" class="title">Vacuum flask (cut in half)</text>`;
    b += `<rect x="124" y="70" width="172" height="306" rx="16" fill="#e3e6ea" stroke="${EDGE}" stroke-width="2"/>`;
    /* the double glass wall, gap = vacuum */
    b += `<path d="M140 106 V340 Q140 354 154 354 H266 Q280 354 280 340 V106 H264 V324 Q264 336 252 336 H168 Q156 336 156 324 V106 Z" fill="#fbfbfb"/>`;
    b += `<path d="M140 106 V340 Q140 354 154 354 H266 Q280 354 280 340 V106" fill="none" stroke="${SILVER}" stroke-width="4"/>
      <path d="M156 106 V324 Q156 336 168 336 H252 Q264 336 264 324 V106" fill="none" stroke="${SILVER}" stroke-width="4"/>
      <path d="M140 106 H156 M264 106 H280" stroke="${SILVER}" stroke-width="4"/>`;
    /* drink */
    b += `<path d="M158 150 V324 Q158 334 168 334 H252 Q262 334 262 324 V150 Z" fill="#c8865a" opacity=".85"/>`;
    for (const x of [180, 210, 240]) b += `<path d="M${x} 146 c-5 -5 5 -9 0 -14" fill="none" stroke="${HOT}" stroke-width="1.8" stroke-linecap="round"/>`;
    /* stopper and cap, support at the bottom */
    b += `<rect x="160" y="84" width="100" height="40" rx="5" fill="#c9a27a" stroke="${EDGE}" stroke-width="2"/>
      <rect x="148" y="52" width="124" height="32" rx="6" fill="#7d8791" stroke="${EDGE}" stroke-width="2"/>
      <path d="M190 354 l6 10 l6 -10 l6 10 l6 -10 l6 10 l6 -10" fill="none" stroke="${EDGE}" stroke-width="2"/>`;
    b += label("stopper", "Stopper", [176, 104], [100, 96], "end");
    b += label("vacuum", "Vacuum", [148, 240], [100, 240], "end");
    b += label("silvered", "Silvered walls", [282, 190], [320, 170]);
    b += label("drink", "Hot drink", [236, 270], [320, 262]);
    b += label("case", "Outer case", [294, 350], [320, 350]);
    return svg(450, 392, b);
  })();

  /* ---------- Insulating a house (cross-section) ---------- */
  out["en-house"] = (() => {
    const o = 60;                                     // shift right, room for labels
    const BRICK = "#c46a4a", FOAM = "#f2d36b", WOOL = "#f4c95d";
    const L = 160 + o, R = 520 + o, G = 340;
    let b = "";
    b += `<line x1="${L - 40}" y1="${G}" x2="${R + 40}" y2="${G}" stroke="${EDGE}" stroke-width="2"/>`;
    /* roof and loft */
    b += `<path d="M${L - 22} 152 L${(L + R) / 2} 40 L${R + 22} 152 Z" fill="#8d6e63" stroke="${EDGE}" stroke-width="2"/>
      <path d="M${L + 4} 146 L${(L + R) / 2} 56 L${R - 4} 146 Z" fill="#efe6da"/>`;
    let wool = `M${L + 30} 146 V132`;
    for (let x = L + 30; x < R - 30; x += 16) wool += ` q8 -8 16 0`;
    b += `<path d="${wool} V146 Z" fill="${WOOL}" stroke="#c99a2e" stroke-width="1.5"/>`;
    b += `<rect x="${L}" y="146" width="${R - L}" height="8" fill="#d8d2c8" stroke="${EDGE}" stroke-width="1.5"/>`;
    /* walls: brick | foam | block, both sides */
    const wall = (x, flip) => {
      const xs = flip ? [x + 18, x + 10, x] : [x, x + 12, x + 20];
      return `<rect x="${xs[0]}" y="154" width="12" height="${G - 154}" fill="${BRICK}" stroke="${EDGE}" stroke-width="1.5"/>
        <rect x="${flip ? x + 10 : x + 12}" y="154" width="8" height="${G - 154}" fill="${FOAM}"/>
        <rect x="${xs[2]}" y="154" width="10" height="${G - 154}" fill="#bdb6aa" stroke="${EDGE}" stroke-width="1.5"/>`;
    };
    b += wall(L, false) + wall(R - 30, true);
    /* double-glazed window in the left wall */
    b += `<rect x="${L - 1}" y="196" width="32" height="64" fill="#fbfaf6" stroke="${EDGE}" stroke-width="2"/>
      <line x1="${L + 7}" y1="198" x2="${L + 7}" y2="258" stroke="#5aa0d0" stroke-width="3"/>
      <line x1="${L + 23}" y1="198" x2="${L + 23}" y2="258" stroke="#5aa0d0" stroke-width="3"/>`;
    /* carpet, radiator with foil behind it */
    b += `<rect x="${L + 30}" y="${G - 10}" width="${R - L - 60}" height="10" fill="#8e5b7a"/>`;
    b += `<rect x="${R - 66}" y="258" width="28" height="60" rx="3" fill="#f2f2ee" stroke="${STEEL_DARK}" stroke-width="2"/>
      <line x1="${R - 34}" y1="252" x2="${R - 34}" y2="326" stroke="#aab4bd" stroke-width="4"/>`;
    b += `<text x="${(L + R) / 2}" y="220" text-anchor="middle" class="title">warm inside</text>
      <text x="${(L + R) / 2}" y="238" text-anchor="middle" class="cap">20 °C</text>
      <text x="${R + 70}" y="70" text-anchor="middle" class="cap">cold outside</text><text x="${R + 70}" y="86" text-anchor="middle" class="cap">5 °C</text>`;
    b += label("loft", "Loft insulation", [L + 120, 138], [L - 20, 110], "end");
    b += label("glazing", "Double glazing", [L + 15, 228], [L - 20, 228], "end");
    b += label("cavity", "Cavity wall insulation", [L + 16, 300], [L - 20, 300], "end");
    b += label("foil", "Shiny foil", [R - 34, 288], [R + 40, 250]);
    b += label("carpet", "Carpet", [R - 90, G - 5], [R + 40, 310]);
    return svg(R + 160, 360, b);
  })();

  return out;
}
