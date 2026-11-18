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


  /* ================= Year 8 (Part 2): electromagnets and magnetism ================= */
  const N_FILL = "#e0675a", S_FILL = "#5b8fd0", FIELD = "#6a6d71", IRON = "#9aa3ab", IRON_EDGE = "#5f676e";
  const COPPER = "#c47a35", COPPER_DARK = "#8a5223";

  /* a bar magnet centred (cx, cy), length w, height hh; nLeft = north pole on the left */
  const barMagnet = (cx, cy, w, hh, nLeft = true) => {
    const x = cx - w / 2, y = cy - hh / 2, fs = Math.round(hh * 0.62);
    const [lf, rf, lt, rt] = nLeft ? [N_FILL, S_FILL, "N", "S"] : [S_FILL, N_FILL, "S", "N"];
    return `<rect x="${x}" y="${y}" width="${w / 2}" height="${hh}" fill="${lf}"/>
      <rect x="${cx}" y="${y}" width="${w / 2}" height="${hh}" fill="${rf}"/>
      <rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="none" stroke="${INK}" stroke-width="2"/>
      <text x="${x + w / 4}" y="${cy + fs * 0.36}" text-anchor="middle" style="font-size:${fs}px;font-weight:700;fill:#fff">${lt}</text>
      <text x="${cx + w / 4}" y="${cy + fs * 0.36}" text-anchor="middle" style="font-size:${fs}px;font-weight:700;fill:#fff">${rt}</text>`;
  };

  /* field lines: poles are point "charges" (q +1 = N, −1 = S); the field is traced
     with a midpoint step, so the line shapes are the real ones for two-pole magnets */
  const fieldAt = (poles, x, y) => {
    let ex = 0, ey = 0;
    for (const p of poles) {
      const dx = x - p.x, dy = y - p.y, r2 = dx * dx + dy * dy, r3 = r2 * Math.sqrt(r2) || 1e-9;
      ex += p.q * dx / r3; ey += p.q * dy / r3;
    }
    return [ex, ey];
  };
  const dirAt = (poles, x, y) => { const [ex, ey] = fieldAt(poles, x, y), n = Math.hypot(ex, ey) || 1; return [ex / n, ey / n]; };
  const traceLine = (poles, x, y, box, step = 1.2, sign = 1) => {
    const pts = [[x, y]];
    for (let i = 0; i < 4000; i++) {
      const [ax, ay] = dirAt(poles, x, y);
      const [bx, by] = dirAt(poles, x + ax * step / 2, y + ay * step / 2);
      x += sign * bx * step; y += sign * by * step;
      pts.push([x, y]);
      if (x < box[0] - 10 || x > box[2] + 10 || y < box[1] - 10 || y > box[3] + 10) break;
      if (poles.some(p => p.q * sign < 0 && Math.hypot(x - p.x, y - p.y) < 4)) break;
    }
    return pts;
  };
  const linePath = pts => `<path d="M${pts.filter((_, i) => i % 3 === 0 || i === pts.length - 1).map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")}" fill="none" stroke="${FIELD}" stroke-width="1.6"/>`;
  const arrowAt = (x, y, ang, col = FIELD) => `<path d="M6 0 L-5 -4.5 L-5 4.5Z" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(ang * 180 / Math.PI).toFixed(1)})" fill="${col}"/>`;
  /* arrow on a traced line at fraction f of its length (none if that point is hidden) */
  const lineArrow = (pts, hidden, f = 0.5) => {
    const i = Math.min(pts.length - 4, Math.max(1, Math.floor(pts.length * f)));
    const [x, y] = pts[i], [x2, y2] = pts[i + 3];
    return hidden(x, y) ? "" : arrowAt(x, y, Math.atan2(y2 - y, x2 - x));
  };
  const plotCompass = (poles, x, y, r = 11) => {
    const [dx, dy] = dirAt(poles, x, y), ang = Math.atan2(dy, dx) * 180 / Math.PI;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
      <g transform="translate(${x} ${y}) rotate(${ang.toFixed(1)})"><path d="M${r - 2} 0 L0 -3.5 L0 3.5Z" fill="${N_FILL}"/><path d="M${-(r - 2)} 0 L0 -3.5 L0 3.5Z" fill="${S_FILL}"/></g>`;
  };
  /* start points round a pole */
  const fan = (pole, n, from = 0, to = 360, r = 7) =>
    Array.from({ length: n }, (_, i) => { const a = (from + (to - from) * (i + 0.5) / n) * Math.PI / 180; return [pole.x + r * Math.cos(a), pole.y + r * Math.sin(a)]; });
  const inRect = (x0, y0, x1, y1) => (x, y) => x > x0 - 2 && x < x1 + 2 && y > y0 - 2 && y < y1 + 2;
  /* draw the lines from every N pole; returns { body, lines } */
  const fieldLines = (poles, starts, box, hidden) => {
    const lines = starts.map(([x, y]) => traceLine(poles, x, y, box));
    return { lines, body: lines.map(linePath).join("") + lines.map(p => lineArrow(p, hidden)).join("") };
  };

  /* ---------- 8. Making an electromagnet (5 labelled) ---------- */
  out["em-electromagnet"] = (() => {
    const yc = 100, x0 = 150, x1 = 400, c0 = 190, c1 = 350;
    let back = "", front = "";
    for (let x = c0; x < c1; x += 12) {
      back += `<line x1="${x + 6}" y1="${yc - 15}" x2="${x + 12}" y2="${yc + 15}" stroke="${COPPER_DARK}" stroke-width="2.5" stroke-linecap="round"/>`;
      front += `<line x1="${x}" y1="${yc + 15}" x2="${x + 6}" y2="${yc - 15}" stroke="${COPPER}" stroke-width="3.5" stroke-linecap="round"/>`;
    }
    let b = back;
    b += `<rect x="${x0}" y="${yc - 9}" width="${x1 - x0}" height="18" fill="${IRON}" stroke="${IRON_EDGE}" stroke-width="2"/>
          <rect x="${x0 - 8}" y="${yc - 18}" width="8" height="36" rx="2" fill="${IRON}" stroke="${IRON_EDGE}" stroke-width="2"/>
          <path d="M${x1} ${yc - 9} L${x1 + 22} ${yc} L${x1} ${yc + 9}Z" fill="${IRON}" stroke="${IRON_EDGE}" stroke-width="2" stroke-linejoin="round"/>`;
    b += front;
    const lead = pts => `<polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="${COPPER}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
    b += lead([[c0, yc + 15], [c0, 240], [225, 240]]);
    b += lead([[c1, yc + 15], [c1, 190], [480, 190], [480, 240], [430, 240]]);
    b += lead([[305, 240], [358, 240]]);
    // a cell: + end has the button
    b += `<rect x="225" y="222" width="72" height="36" rx="6" fill="#3d4248"/><rect x="297" y="231" width="8" height="18" rx="2" fill="#9aa3ab"/>
          <rect x="275" y="222" width="22" height="36" rx="6" fill="#d9a441"/><rect x="275" y="222" width="8" height="36" fill="#d9a441"/>
          <text x="286" y="247" text-anchor="middle" style="font-size:16px;font-weight:700;fill:#3d4248">+</text><text x="245" y="247" text-anchor="middle" style="font-size:18px;font-weight:700;fill:#fff">−</text>`;
    // a switch: lever closed across two contacts
    b += `<rect x="345" y="246" width="96" height="12" rx="3" fill="#e4dccb" stroke="#a89f8c" stroke-width="1.5"/>
          <circle cx="358" cy="240" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="428" cy="240" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/>
          <line x1="358" y1="240" x2="426" y2="236" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    // paper clips hanging from the point
    const clip = (x, y) => `<path d="M${x - 4} ${y + 20} V${y + 6} a4 4 0 0 1 8 0 V${y + 24} a6 6 0 0 1 -12 0 V${y + 4} a8 8 0 0 1 16 0 V${y + 20}" fill="none" stroke="#6f7a84" stroke-width="2" stroke-linecap="round"/>`;
    b += clip(410, yc + 6) + clip(413, yc + 38) + clip(409, yc + 70);
    const L = [
      label("core", "Iron core (a nail)", [166, yc], [40, 40]),
      label("coil", "Coil of wire (solenoid)", [278, yc - 14], [300, 34]),
      label("clips", "Paper clips", [420, 150], [470, 130]),
      label("cell", "Cell", [250, 224], [150, 205], "end"),
      label("switch", "Switch", [440, 252], [500, 278])
    ].join("");
    return svg(600, 300, b + L);
  })();

  /* ---------- 9. An electric bell (7 labelled) ---------- */
  out["em-bell"] = (() => {
    let b = "";
    const lead = pts => `<polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="${COPPER}" stroke-width="2.5" stroke-linejoin="round"/>`;
    const WOOD = "#cbbfa6", WOOD_EDGE = "#7d7466";
    // gong hung from a bracket
    b += `<path d="M90 300 V12 H226 V26" fill="none" stroke="${WOOD_EDGE}" stroke-width="4"/>
          <circle cx="226" cy="62" r="36" fill="#e8c35a" stroke="#a8862a" stroke-width="2.5"/><circle cx="226" cy="62" r="13" fill="#d4ab3e" stroke="#a8862a" stroke-width="1.5"/>`;
    // electromagnet: iron core on a stand, coil round it
    let back = "", front = "";
    for (let x = 166; x < 244; x += 10) {
      back += `<line x1="${x + 5}" y1="152" x2="${x + 10}" y2="188" stroke="${COPPER_DARK}" stroke-width="2.2"/>`;
      front += `<line x1="${x}" y1="188" x2="${x + 5}" y2="152" stroke="${COPPER}" stroke-width="3.2" stroke-linecap="round"/>`;
    }
    b += `<rect x="140" y="150" width="12" height="150" fill="${WOOD}" stroke="${WOOD_EDGE}" stroke-width="1.5"/>`;
    b += back + `<rect x="152" y="161" width="112" height="18" fill="${IRON}" stroke="${IRON_EDGE}" stroke-width="2"/>` + front;
    // armature on a flat spring, hammer on top
    b += `<rect x="268" y="280" width="30" height="20" fill="${WOOD}" stroke="${WOOD_EDGE}" stroke-width="1.5"/>
          <path d="M283 280 l-6 -4 l12 -5 l-12 -5 l12 -5 l-12 -5 l6 -4" fill="none" stroke="${INK}" stroke-width="2"/>
          <rect x="276" y="104" width="12" height="148" fill="${IRON}" stroke="${IRON_EDGE}" stroke-width="2"/>
          <line x1="282" y1="104" x2="282" y2="76" stroke="${INK}" stroke-width="3"/><circle cx="282" cy="66" r="10" fill="#4a4f55"/>`;
    // contact screw on its post
    b += `<rect x="360" y="118" width="16" height="182" fill="${WOOD}" stroke="${WOOD_EDGE}" stroke-width="1.5"/>
          <rect x="290" y="135" width="70" height="10" fill="#c9ccd0" stroke="${IRON_EDGE}" stroke-width="1.5"/>
          ${[300, 310, 320, 330, 340, 350].map(x => `<line x1="${x}" y1="135" x2="${x + 4}" y2="145" stroke="${IRON_EDGE}" stroke-width="1.2"/>`).join("")}
          <circle cx="289" cy="140" r="3.5" fill="#d4ab3e"/>`;
    // base board
    b += `<rect x="70" y="300" width="400" height="10" fill="${WOOD}" stroke="${WOOD_EDGE}" stroke-width="1.5"/>`;
    // the circuit: cell → push switch → screw post; armature post → coil → cell
    b += lead([[170, 188], [170, 334], [210, 334]]);
    b += `<rect x="210" y="320" width="62" height="28" rx="5" fill="#3d4248"/><rect x="254" y="320" width="18" height="28" rx="5" fill="#d9a441"/><rect x="254" y="320" width="6" height="28" fill="#d9a441"/><rect x="272" y="327" width="6" height="14" rx="2" fill="#9aa3ab"/>`;
    b += lead([[278, 334], [440, 334]]);
    b += `<rect x="440" y="322" width="70" height="24" rx="5" fill="#e4dccb" stroke="#a89f8c" stroke-width="1.5"/><rect x="460" y="310" width="30" height="12" rx="4" fill="${N_FILL}" stroke="#8f2f2c" stroke-width="1.5"/>`;
    b += lead([[510, 334], [530, 334], [530, 220], [376, 220]]);
    b += lead([[240, 188], [240, 292], [268, 292]]);
    const L = [
      label("gong", "Gong", [196, 50], [76, 46], "end"),
      label("electromagnet", "Electromagnet", [186, 154], [76, 130], "end"),
      label("armature", "Iron armature", [288, 200], [420, 180]),
      label("hammer", "Hammer", [292, 64], [420, 70]),
      label("contact", "Contact screw", [330, 140], [420, 116]),
      label("spring", "Spring", [289, 266], [420, 262]),
      label("push", "Push switch", [490, 316], [548, 296])
    ].join("");
    return svg(670, 356, `<g transform="translate(30 0)">${b + L}</g>`);
  })();

  /* ---------- 10. Field lines round a bar magnet (4 labelled) ---------- */
  out["em-bar-field"] = (() => {
    const cx = 290, cy = 170, w = 150, hh = 36;
    const N = { x: cx - w / 2 + 12, y: cy, q: 1 }, S = { x: cx + w / 2 - 12, y: cy, q: -1 }, poles = [N, S];
    const box = [10, 30, 570, 320];
    const hidden = inRect(cx - w / 2, cy - hh / 2, cx + w / 2, cy + hh / 2);
    const starts = fan(N, 16, 0, 360, 8).filter(([x, y]) => Math.abs(y - cy) > 1.5);
    const { lines, body } = fieldLines(poles, starts, box, hidden);
    let b = `<defs><clipPath id="em-bf-clip"><rect x="${box[0]}" y="${box[1]}" width="${box[2] - box[0]}" height="${box[3] - box[1]}"/></clipPath></defs>`;
    b += `<g clip-path="url(#em-bf-clip)">${body}</g>` + barMagnet(cx, cy, w, hh, true);
    const comps = [[120, 110], [440, 170], [290, 72], [290, 268]];
    b += comps.map(([x, y]) => plotCompass(poles, x, y)).join("");
    b += note(290, 336, "Lines close together = strong field · arrows go from N to S");
    // a dot on the line that rises highest above the magnet
    const top = lines.flat().filter(([x, y]) => Math.abs(x - 340) < 1 && y > 95 && y < 140).sort((a, c) => a[1] - c[1])[0] || [340, 110];
    const L = [
      label("north", "North-seeking pole", [cx - w / 2 + 18, cy + hh / 2 - 4], [70, 300], "start"),
      label("south", "South-seeking pole", [cx + w / 2 - 18, cy + hh / 2 - 4], [380, 300], "start"),
      label("line", "Field line", [top[0], top[1]], [470, 50]),
      label("compass", "Plotting compass", [120 - 9, 110 - 8], [40, 50], "start")
    ].join("");
    return svg(580, 344, b + L);
  })();

  /* ---------- 11. Two magnets: unlike poles attract, like poles repel ---------- */
  out["em-two-magnets"] = (() => {
    const panel = (ox, likePoles) => {
      const y = 150, w = 96, hh = 28, ax = ox + 20 + w / 2, bx = ox + 300 - 20 - w / 2;
      // left magnet: N on the left (unlike) or N on the right (like); right magnet always N on the left
      const aN = likePoles ? { x: ax + w / 2 - 10, y, q: 1 } : { x: ax - w / 2 + 10, y, q: 1 };
      const aS = likePoles ? { x: ax - w / 2 + 10, y, q: -1 } : { x: ax + w / 2 - 10, y, q: -1 };
      const bN = { x: bx - w / 2 + 10, y, q: 1 }, bS = { x: bx + w / 2 - 10, y, q: -1 };
      const poles = [aN, aS, bN, bS], box = [ox + 4, 40, ox + 296, 270];
      const hidden = (x, yy) => inRect(ax - w / 2, y - hh / 2, ax + w / 2, y + hh / 2)(x, yy) || inRect(bx - w / 2, y - hh / 2, bx + w / 2, y + hh / 2)(x, yy);
      const starts = [...fan(aN, 14, 0, 360, 7), ...fan(bN, 14, 0, 360, 7)].filter(([, yy]) => Math.abs(yy - y) > 1);
      const { body } = fieldLines(poles, starts, box, hidden);
      let s = `<defs><clipPath id="em-tm-${ox}"><rect x="${box[0]}" y="${box[1]}" width="${box[2] - box[0]}" height="${box[3] - box[1]}"/></clipPath></defs>`;
      s += `<g clip-path="url(#em-tm-${ox})">${body}</g>`;
      s += barMagnet(ax, y, w, hh, !likePoles) + barMagnet(bx, y, w, hh, true);
      s += `<text x="${ox + 150}" y="24" text-anchor="middle" class="title">${likePoles ? "Like poles (N and N): repel" : "Unlike poles (S and N): attract"}</text>`;
      if (likePoles) {
        const mx = (aN.x + bN.x) / 2;
        s += `<path d="M${mx - 6} ${y - 6} l12 12 m0 -12 l-12 12" stroke="#c0392b" stroke-width="3"/>`;
        s += note(ox + 150, 292, "× neutral point: the fields cancel, no force");
      } else s += note(ox + 150, 292, "the lines go straight across the gap");
      return s;
    };
    return svg(620, 304, panel(0, false) + `<line x1="310" y1="10" x2="310" y2="296" stroke="#d8d8d2"/>` + panel(320, true));
  })();

  /* ---------- 12. Earth's magnetic field and a compass ---------- */
  out["em-earth"] = (() => {
    const cx = 230, cy = 190, R = 92, tilt = 11 * Math.PI / 180, half = 46;
    // the "magnet" inside the Earth: its S pole near the geographic North Pole (top)
    const sx = cx + half * Math.sin(tilt), sy = cy - half * Math.cos(tilt);
    const nx = cx - half * Math.sin(tilt), ny = cy + half * Math.cos(tilt);
    const poles = [{ x: nx, y: ny, q: 1 }, { x: sx, y: sy, q: -1 }], box = [6, 6, 454, 374];
    // nested loops: each line is traced both ways from a point on the equator line
    const seeds = [18, 50, 95].flatMap(d => [[cx - R - d, cy], [cx + R + d, cy]]);
    const lines = seeds.map(([x, y]) => [...traceLine(poles, x, y, box, 1.2, -1).reverse(), ...traceLine(poles, x, y, box, 1.2, 1)]);
    let b = `<defs><clipPath id="em-earth-clip"><rect x="${box[0]}" y="${box[1]}" width="${box[2] - box[0]}" height="${box[3] - box[1]}"/></clipPath></defs>`;
    b += `<g clip-path="url(#em-earth-clip)">${lines.map(linePath).join("")}</g>`;
    // arrows where the loops cross the equator line (pointing north, outside the Earth)
    b += seeds.filter((_, i) => i !== 2).map(([x, y]) => { const [dx, dy] = dirAt(poles, x, y); return arrowAt(x, y, Math.atan2(dy, dx)); }).join("");
    b += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#bfe0f2" stroke="#2f6f99" stroke-width="2.5"/>
          <path d="M${cx - 60} ${cy - 40} q30 -30 60 -14 q20 18 -6 40 q-30 6 -34 30 q-26 -14 -20 -56Z" fill="#a9d39a" stroke="#5b8f4c" stroke-width="1.5"/>
          <path d="M${cx + 20} ${cy + 20} q34 -14 50 10 q-6 34 -34 40 q-20 -20 -16 -50Z" fill="#a9d39a" stroke="#5b8f4c" stroke-width="1.5"/>`;
    b += `<line x1="${cx}" y1="${cy - R - 14}" x2="${cx}" y2="${cy + R + 14}" stroke="${INK}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    const mh = 2 * half + 24, mw = 22;
    b += `<g transform="rotate(${(tilt * 180 / Math.PI).toFixed(1)} ${cx} ${cy})" opacity="0.92">
          <rect x="${cx - mw / 2}" y="${cy - mh / 2}" width="${mw}" height="${mh / 2}" fill="${S_FILL}"/><rect x="${cx - mw / 2}" y="${cy}" width="${mw}" height="${mh / 2}" fill="${N_FILL}"/>
          <rect x="${cx - mw / 2}" y="${cy - mh / 2}" width="${mw}" height="${mh}" fill="none" stroke="${INK}" stroke-width="2"/>
          <text x="${cx}" y="${cy - half + 5}" text-anchor="middle" style="font-size:14px;font-weight:700;fill:#fff">S</text>
          <text x="${cx}" y="${cy + half + 1}" text-anchor="middle" style="font-size:14px;font-weight:700;fill:#fff">N</text></g>`;
    b += note(cx, cy - R - 22, "Geographic North Pole (Arctic)", "middle", `style="font-weight:700"`);
    b += note(cx, cy + R + 30, "Geographic South Pole (Antarctic)", "middle", `style="font-weight:700"`);
    // a compass on the surface: its N end points along the field, towards the Arctic
    const kx = cx - R - 50, ky = cy;
    b += plotCompass(poles, kx, ky, 14);
    b += `<text x="470" y="80" class="cap">Earth behaves as if a giant</text><text x="470" y="96" class="cap">bar magnet were inside it.</text>
          <text x="470" y="128" class="cap">Its south-seeking end is under</text><text x="470" y="144" class="cap">the Arctic, so it pulls the</text>
          <text x="470" y="160" class="cap">north-seeking end of every</text><text x="470" y="176" class="cap">compass needle.</text>
          <text x="470" y="208" class="cap">A compass needle lines up</text><text x="470" y="224" class="cap">with the field lines and points</text><text x="470" y="240" class="cap">(roughly) north.</text>`;
    return svg(660, 380, b);
  })();

  return out;
}
