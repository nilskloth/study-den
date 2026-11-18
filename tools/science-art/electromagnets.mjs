/* Electromagnets (Year 7: voltage and resistance, current) — circuit symbols,
   series and parallel circuits with meters, static charge, the water-pipe model.
   Standard UK circuit symbols; every symbol is drawn on a horizontal wire
   (or rotated for a vertical one), its leads reaching ±30 from the centre. */

export default function (h) {
  const { svg, label, INK } = h;
  const W = `stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"`;
  const WIRE = "#17181a";
  const CHARGE_NEG = "#2f6db5", CHARGE_POS = "#c0392b", WATER = "#5aa9d6", WATER_EDGE = "#2f6f99";

  const wire = pts => `<polyline points="${pts.map(p => p.join(",")).join(" ")}" ${W} stroke-linejoin="round"/>`;
  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="4" fill="${WIRE}"/>`;

  /* one cell: long thin plate (+) on the left, short thick plate (−) on the right */
  const cellAt = (x, y) =>
    `<line x1="${x - 30}" y1="${y}" x2="${x - 4}" y2="${y}" ${W}/><line x1="${x + 4}" y1="${y}" x2="${x + 30}" y2="${y}" ${W}/>
     <line x1="${x - 4}" y1="${y - 16}" x2="${x - 4}" y2="${y + 16}" stroke="${INK}" stroke-width="2.5"/>
     <line x1="${x + 4}" y1="${y - 8}" x2="${x + 4}" y2="${y + 8}" stroke="${INK}" stroke-width="6"/>`;
  const SYM = {
    cell: cellAt,
    battery: (x, y) =>
      `<line x1="${x - 30}" y1="${y}" x2="${x - 18}" y2="${y}" ${W}/><line x1="${x + 18}" y1="${y}" x2="${x + 30}" y2="${y}" ${W}/>
       <line x1="${x - 10}" y1="${y}" x2="${x + 10}" y2="${y}" ${W}/>
       ${[-18, 10].map(dx => `<line x1="${x + dx}" y1="${y - 16}" x2="${x + dx}" y2="${y + 16}" stroke="${INK}" stroke-width="2.5"/>
         <line x1="${x + dx + 8}" y1="${y - 8}" x2="${x + dx + 8}" y2="${y + 8}" stroke="${INK}" stroke-width="6"/>`).join("")}`,
    lamp: (x, y) => {
      const r = 14, d = r * Math.SQRT1_2;
      return `<line x1="${x - 30}" y1="${y}" x2="${x - r}" y2="${y}" ${W}/><line x1="${x + r}" y1="${y}" x2="${x + 30}" y2="${y}" ${W}/>
        <circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
        <line x1="${x - d}" y1="${y - d}" x2="${x + d}" y2="${y + d}" stroke="${INK}" stroke-width="2.2"/>
        <line x1="${x - d}" y1="${y + d}" x2="${x + d}" y2="${y - d}" stroke="${INK}" stroke-width="2.2"/>`;
    },
    switchOpen: (x, y) =>
      `<line x1="${x - 30}" y1="${y}" x2="${x - 16}" y2="${y}" ${W}/><line x1="${x + 16}" y1="${y}" x2="${x + 30}" y2="${y}" ${W}/>
       <circle cx="${x - 14}" cy="${y}" r="3" fill="#fff" stroke="${INK}" stroke-width="2"/>
       <circle cx="${x + 14}" cy="${y}" r="3" fill="#fff" stroke="${INK}" stroke-width="2"/>
       <line x1="${x - 12}" y1="${y - 1}" x2="${x + 14}" y2="${y - 15}" ${W}/>`,
    switchClosed: (x, y) =>
      `<line x1="${x - 30}" y1="${y}" x2="${x + 30}" y2="${y}" ${W}/>
       <circle cx="${x - 14}" cy="${y}" r="3" fill="#fff" stroke="${INK}" stroke-width="2"/>
       <circle cx="${x + 14}" cy="${y}" r="3" fill="#fff" stroke="${INK}" stroke-width="2"/>`,
    resistor: (x, y) =>
      `<line x1="${x - 30}" y1="${y}" x2="${x - 18}" y2="${y}" ${W}/><line x1="${x + 18}" y1="${y}" x2="${x + 30}" y2="${y}" ${W}/>
       <rect x="${x - 18}" y="${y - 8}" width="36" height="16" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`,
    variable: (x, y) =>
      `${SYM.resistor(x, y)}<line x1="${x - 20}" y1="${y + 16}" x2="${x + 18}" y2="${y - 16}" stroke="${INK}" stroke-width="2"/>
       <path d="M${x + 22} ${y - 19} l-10 2 l5 6Z" fill="${INK}"/>`
  };
  const meter = letter => (x, y, vertical = false) => {
    const leads = vertical
      ? `<line x1="${x}" y1="${y - 30}" x2="${x}" y2="${y - 14}" ${W}/><line x1="${x}" y1="${y + 14}" x2="${x}" y2="${y + 30}" ${W}/>`
      : `<line x1="${x - 30}" y1="${y}" x2="${x - 14}" y2="${y}" ${W}/><line x1="${x + 14}" y1="${y}" x2="${x + 30}" y2="${y}" ${W}/>`;
    return `${leads}<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
      <text x="${x}" y="${y + 5.5}" text-anchor="middle" style="font-size:16px;font-weight:700">${letter}</text>`;
  };
  SYM.ammeter = meter("A");
  SYM.voltmeter = meter("V");
  /* a symbol on a vertical wire (meters keep their letter upright) */
  const at = (type, x, y, vertical = false) =>
    type === "ammeter" || type === "voltmeter" ? SYM[type](x, y, vertical)
      : vertical ? `<g transform="rotate(90 ${x} ${y})">${SYM[type](x, y)}</g>` : SYM[type](x, y);
  const note = (x, y, t, anchor = "middle", extra = "") => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="cap" ${extra}>${t}</text>`;
  const reading = (x, y, t) => `<rect x="${x - 26}" y="${y - 13}" width="52" height="20" rx="5" fill="#fff6d8" stroke="#d4b25a"/><text x="${x}" y="${y + 2}" text-anchor="middle" style="font-size:13px;font-weight:700">${t}</text>`;

  const out = {};

  /* ---------- 1. Circuit symbols (8 labelled) ---------- */
  out["em-symbols"] = (() => {
    const rows = [
      ["cell", "Cell", "battery", "Battery"],
      ["lamp", "Lamp (bulb)", "switchOpen", "Switch (open)"],
      ["ammeter", "Ammeter", "voltmeter", "Voltmeter"],
      ["resistor", "Resistor", "variable", "Variable resistor"]
    ];
    let b = "", L = "";
    rows.forEach(([t1, n1, t2, n2], i) => {
      const y = 44 + i * 74;
      b += `<rect x="20" y="${y - 30}" width="100" height="60" rx="10" fill="#fafaf7" stroke="#d8d8d2"/>` + at(t1, 70, y);
      b += `<rect x="300" y="${y - 30}" width="100" height="60" rx="10" fill="#fafaf7" stroke="#d8d8d2"/>` + at(t2, 350, y);
      L += label(t1 === "switchOpen" ? "switch" : t1, n1, [110, y], [146, y]);
      L += label(t2 === "switchOpen" ? "switch" : t2 === "variable" ? "variable-resistor" : t2, n2, [390, y], [426, y]);
    });
    return svg(580, 316, b + L);
  })();

  /* ---------- 2. A series circuit with an ammeter and a voltmeter (5 labelled) ---------- */
  out["em-series"] = (() => {
    const x1 = 150, x2 = 410, yt = 70, yb = 210;
    let b = "";
    b += wire([[250, yt], [x1, yt], [110 + 40, 110]]);           // top-left to switch
    b += wire([[310, yt], [x2, yt], [x2, 110]]);
    b += at("battery", 280, yt);
    b += at("switchClosed", x1, 140, true);
    b += wire([[x1, 170], [x1, yb], [190, yb]]);
    b += at("lamp", 220, yb);
    b += wire([[250, yb], [310, yb]]);
    b += at("lamp", 340, yb);
    b += wire([[370, yb], [x2, yb], [x2, 170]]);
    b += at("ammeter", x2, 140, true);
    // voltmeter across the right-hand lamp
    b += wire([[290, yb], [290, 262], [310, 262]]) + wire([[370, 262], [390, 262], [390, yb]]);
    b += at("voltmeter", 340, 262);
    b += dot(290, yb) + dot(390, yb);
    const L = [
      label("battery", "Battery", [280, 52], [330, 26]),
      label("switch", "Switch", [x1 - 6, 140], [104, 140], "end"),
      label("lamp", "Lamp", [212, 222], [118, 258], "end"),
      label("ammeter", "Ammeter (in series)", [x2 + 14, 140], [440, 140]),
      label("voltmeter", "Voltmeter (in parallel)", [354, 262], [440, 262])
    ].join("");
    return svg(600, 290, b + L);
  })();

  /* ---------- 3. Current in a parallel circuit (readings, no letters) ---------- */
  out["em-parallel"] = (() => {
    const xl = 80, xr = 440, yt = 54, y1 = 170, y2 = 270;
    let b = "";
    b += wire([[120, yt], [xl, yt], [xl, y2], [190, y2]]);
    b += at("ammeter", 150, yt);
    b += wire([[180, yt], [270, yt]]);
    b += at("battery", 300, yt);
    b += wire([[330, yt], [xr, yt], [xr, y2], [370, y2]]);
    b += wire([[xl, y1], [190, y1]]) + at("lamp", 220, y1) + wire([[250, y1], [310, y1]]) + at("ammeter", 340, y1) + wire([[370, y1], [xr, y1]]);
    b += at("lamp", 220, y2) + wire([[250, y2], [310, y2]]) + at("ammeter", 340, y2);
    b += dot(xl, y1) + dot(xr, y1);
    b += reading(150, 24, "0.6 A") + reading(340, y1 + 34, "0.4 A") + reading(340, y2 + 34, "0.2 A");
    b += note(xl - 12, y1 + 4, "junction", "end") + note(xr + 12, y1 + 4, "junction", "start");
    b += note(220, y1 - 24, "branch 1") + note(220, y2 - 24, "branch 2");
    // flow arrows on the main wire (conventional current, + to −)
    const arr = (x, y, dir) => `<path d="M${x} ${y - 6} l${dir * 9} 6 l${-dir * 9} 6Z" fill="${CHARGE_POS}"/>`;
    b += arr(222, yt, -1) + arr(392, yt, -1);
    return svg(540, 316, b);
  })();

  /* ---------- 4. Potential difference in series and in parallel ---------- */
  out["em-voltage"] = (() => {
    let b = `<text x="150" y="22" text-anchor="middle" class="title">Series: shared</text>
             <text x="470" y="22" text-anchor="middle" class="title">Parallel: the same</text>
             <line x1="310" y1="10" x2="310" y2="300" stroke="#d8d8d2"/>`;
    // series panel
    {
      const xl = 40, xr = 260, yt = 66, yb = 180;
      b += wire([[120, yt], [xl, yt], [xl, yb], [65, yb]]) + at("battery", 150, yt) + wire([[180, yt], [xr, yt], [xr, yb], [235, yb]]);
      b += reading(150, 40, "6 V");
      b += at("lamp", 95, yb) + wire([[125, yb], [175, yb]]) + at("lamp", 205, yb);
      for (const cx of [95, 205]) {
        b += wire([[cx - 45, yb], [cx - 45, 236], [cx - 30, 236]]) + wire([[cx + 30, 236], [cx + 45, 236], [cx + 45, yb]]);
        b += at("voltmeter", cx, 236) + dot(cx - 45, yb) + dot(cx + 45, yb) + reading(cx, 276, "3 V");
      }
    }
    // parallel panel
    {
      const xl = 360, xr = 580, yt = 66, y1 = 130, y2 = 226;
      b += wire([[440, yt], [xl, yt], [xl, y2], [440, y2]]) + at("battery", 470, yt) + wire([[500, yt], [xr, yt], [xr, y2], [500, y2]]);
      b += reading(470, 40, "6 V");
      b += wire([[xl, y1], [440, y1]]) + at("lamp", 470, y1) + wire([[500, y1], [xr, y1]]);
      b += at("lamp", 470, y2);
      for (const y of [y1, y2]) {
        b += wire([[425, y], [425, y + 40], [440, y + 40]]) + wire([[500, y + 40], [515, y + 40], [515, y]]);
        b += at("voltmeter", 470, y + 40) + dot(425, y) + dot(515, y) + reading(545, y + 46, "6 V");
      }
      b += dot(xl, y1) + dot(xr, y1);
    }
    return svg(620, 300, b);
  })();

  /* ---------- 5. Charging by rubbing ---------- */
  out["em-charging"] = (() => {
    const jumper = (x, y, signs) => `
      <path d="M${x} ${y} l40 -20 h60 l40 20 l-14 34 l-18 -8 v104 h-76 v-104 l-18 8Z" fill="#9fc9a6" stroke="#4d7f57" stroke-width="2.5" stroke-linejoin="round"/>
      ${signs}`;
    const balloon = (cx, cy, signs) => `
      <ellipse cx="${cx}" cy="${cy}" rx="40" ry="50" fill="#f2a7b5" stroke="#b3566a" stroke-width="2.5"/>
      <path d="M${cx - 5} ${cy + 50} l5 8 l5 -8Z" fill="#b3566a"/><path d="M${cx} ${cy + 58} q-8 18 4 34" fill="none" stroke="#6a6d71" stroke-width="1.5"/>
      ${signs}`;
    const sign = (x, y, s) => `<circle cx="${x}" cy="${y}" r="9" fill="#fff" stroke="${s === "+" ? CHARGE_POS : CHARGE_NEG}" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle" style="font-size:15px;font-weight:700;fill:${s === "+" ? CHARGE_POS : CHARGE_NEG}">${s === "+" ? "+" : "−"}</text>`;
    let b = `<text x="150" y="22" text-anchor="middle" class="title">1. Rub them together</text>
             <text x="460" y="22" text-anchor="middle" class="title">2. Pull them apart</text>
             <line x1="305" y1="10" x2="305" y2="260" stroke="#d8d8d2"/>`;
    // before: both neutral, electrons hop from jumper to balloon
    b += jumper(40, 70, "") + balloon(225, 120, "");
    b += `<path d="M140 120 C160 100 172 100 190 108" fill="none" stroke="${CHARGE_NEG}" stroke-width="2.5"/><path d="M190 108 l-11 -6 l1 10Z" fill="${CHARGE_NEG}"/>`;
    b += sign(150, 140, "−") + sign(168, 160, "−");
    b += note(150, 232, "electrons move from the jumper");
    b += note(150, 248, "onto the balloon");
    // after
    const jSigns = [[400, 110], [430, 130], [400, 150], [430, 170]].map(([x, y]) => sign(x, y, "+")).join("");
    const bSigns = [[540, 95], [520, 120], [560, 120], [540, 145]].map(([x, y]) => sign(x, y, "−")).join("");
    b += jumper(345, 70, jSigns) + balloon(540, 120, bSigns);
    b += note(410, 232, "jumper lost electrons") + note(410, 248, "positively charged", "middle", `style="font-weight:700;fill:${CHARGE_POS}"`);
    b += note(575, 232, "balloon gained electrons") + note(575, 248, "negatively charged", "middle", `style="font-weight:700;fill:${CHARGE_NEG}"`);
    return svg(660, 262, b);
  })();

  /* ---------- 6. Attract or repel ---------- */
  out["em-forces"] = (() => {
    const ball = (x, y, s) => `<circle cx="${x}" cy="${y}" r="22" fill="${s === "+" ? "#f6d4cf" : "#d3e2f4"}" stroke="${s === "+" ? CHARGE_POS : CHARGE_NEG}" stroke-width="2.5"/>
      <text x="${x}" y="${y + 8}" text-anchor="middle" style="font-size:24px;font-weight:700;fill:${s === "+" ? CHARGE_POS : CHARGE_NEG}">${s === "+" ? "+" : "−"}</text>`;
    const arrow = (x, y, dir) => `<line x1="${x}" y1="${y}" x2="${x + dir * 30}" y2="${y}" stroke="${INK}" stroke-width="3"/><path d="M${x + dir * 40} ${y} l${-dir * 12} -7 v14Z" fill="${INK}"/>`;
    const row = (y, a, c, pull, text) => {
      const away = !pull;
      return away ? ball(150, y, a) + ball(250, y, c) + arrow(122, y, -1) + arrow(278, y, 1)
        : ball(110, y, a) + ball(290, y, c) + arrow(136, y, 1) + arrow(264, y, -1);
    };
    const word = (y, text) => `<text x="340" y="${y + 5}" class="title">${text}</text>`;
    const b = row(40, "+", "+", false) + word(40, "repel") + row(110, "−", "−", false) + word(110, "repel") + row(180, "+", "−", true) + word(180, "attract") +
      note(220, 232, "Like charges repel · unlike (opposite) charges attract");
    return svg(440, 244, b);
  })();

  /* ---------- 7. The water-pipe model ---------- */
  out["em-pipes"] = (() => {
    const pipe = (d, w) => `<path d="${d}" fill="none" stroke="${WATER_EDGE}" stroke-width="${w + 5}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${WATER}" stroke-width="${w}" stroke-linejoin="round"/>`;
    let b = "";
    b += pipe("M420 90 V50 H90 V210 H420 V170", 22);
    b += pipe("M420 90 V170", 7);                                         // the narrow section
    b += `<circle cx="90" cy="130" r="30" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
          <path d="M90 112 a18 18 0 1 1 -16 10" fill="none" stroke="${INK}" stroke-width="2.5"/><path d="M70 118 l4 12 l8 -9Z" fill="${INK}"/>`;
    const flow = (x, y, dx, dy) => `<path d="M${x - dx * 4 - dy * 6} ${y - dy * 4 - dx * 6} L${x + dx * 6} ${y + dy * 6} L${x - dx * 4 + dy * 6} ${y - dy * 4 + dx * 6}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    b += flow(200, 50, 1, 0) + flow(320, 50, 1, 0) + flow(320, 210, -1, 0) + flow(200, 210, -1, 0) + flow(90, 80, 0, -1) + flow(420, 130, 0, 1);
    b += note(40, 125, "pump", "end") + note(40, 141, "= battery", "end", `style="font-weight:700"`);
    b += note(440, 126, "narrow pipe", "start") + note(440, 142, "= resistance", "start", `style="font-weight:700"`);
    b += note(250, 30, "water flowing round = current", "middle", `style="font-weight:700"`);
    b += note(250, 245, "the pump's push = potential difference (voltage)", "middle", `style="font-weight:700"`);
    b += note(250, 130, "A narrow pipe is harder to push", "middle") + note(250, 146, "water through, so less flows:", "middle") + note(250, 162, "higher resistance, lower current", "middle");
    return svg(620, 260, `<g transform="translate(60 0)">${b}</g>`);
  })();

  return out;
}
