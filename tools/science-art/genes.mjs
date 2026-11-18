/* Genes (AQA KS3 3.10): variation graphs, reproductive systems, sex cells,
   the menstrual cycle, the foetus in the uterus and the stages from sex cells
   to birth. Schematic, textbook-style drawings. */

export default function (h) {
  const { svg, label, INK, MUSCLE, MUSCLE_DARK, SKIN, SKIN_EDGE, CYTO, MEMB, NUC, NUC_EDGE, MITO } = h;
  const WALLP = "#e9a3a0";          // muscle wall of the uterus
  const LINING = "#d46a66";         // uterus lining / blood
  const SOFT = "#f2c9c4";           // vagina, scrotum
  const OVARY = "#f5d3a6", OVARY_EDGE = "#b5813f";
  const FLUID = "#d6ecf7", FLUID_EDGE = "#7fb3d5";
  const GRID = "#c9c9c4";
  const out = {};

  /* ---------- Continuous and discontinuous variation ---------- */
  out["gn-graphs"] = (() => {
    const panel = (x, title, sub) => `<rect x="${x}" y="10" width="320" height="270" rx="12" fill="#fff" stroke="${GRID}"/>
      <text x="${x + 160}" y="34" text-anchor="middle" class="title">${title}</text>
      <text x="${x + 160}" y="52" text-anchor="middle" class="cap">${sub}</text>`;
    const axes = (x0, y0, w, hgt, ylab, xlab) => `<path d="M${x0} ${y0 - hgt} V${y0} H${x0 + w}" fill="none" stroke="${INK}" stroke-width="1.6"/>
      <text x="${x0 - 12}" y="${y0 - hgt / 2}" text-anchor="middle" class="cap" transform="rotate(-90 ${x0 - 12} ${y0 - hgt / 2})">${ylab}</text>
      <text x="${x0 + w / 2}" y="${y0 + 40}" text-anchor="middle" class="cap">${xlab}</text>`;
    // bar chart: blood groups (separate bars with gaps)
    const groups = [["A", 38], ["B", 10], ["AB", 4], ["O", 48]];
    let left = panel(10, "Discontinuous variation", "bar chart — bars with gaps") + axes(56, 230, 250, 160, "number of people", "blood group");
    groups.forEach(([g, v], i) => {
      const bx = 76 + i * 58, bh = v * 3.2;
      left += `<rect x="${bx}" y="${230 - bh}" width="38" height="${bh}" fill="#7fa7c9" stroke="#3f6d94" stroke-width="1.5"/>
        <text x="${bx + 19}" y="248" text-anchor="middle">${g}</text>`;
    });
    // histogram: height (bars touching) + smooth curve
    const vals = [3, 8, 17, 28, 34, 27, 16, 7, 3];
    let right = panel(340, "Continuous variation", "histogram or line graph — no gaps") + axes(386, 230, 250, 160, "number of people", "height (cm)");
    const bw = 26;
    vals.forEach((v, i) => {
      const bx = 396 + i * bw, bh = v * 4.3;
      right += `<rect x="${bx}" y="${230 - bh}" width="${bw}" height="${bh}" fill="#e7b46a" stroke="#a8742a" stroke-width="1.5"/>`;
    });
    const pts = vals.map((v, i) => [396 + i * bw + bw / 2, 230 - v * 4.3]);
    right += `<polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="${MUSCLE_DARK}" stroke-width="2.2" stroke-linejoin="round"/>`;
    [140, 150, 160, 170].forEach((cm, i) => { right += `<text x="${396 + (1 + i * 2) * bw}" y="248" text-anchor="middle" class="cap">${cm}</text>`; });
    return svg(670, 290, left + right);
  })();

  /* ---------- Female reproductive system (front view) ---------- */
  out["gn-female"] = (() => {
    const cx = 330;
    const tube = (s) => {
      const d = `M${cx + s * 56} 124 C${cx + s * 100} 104 ${cx + s * 150} 92 ${cx + s * 178} 128`;
      return `<path d="${d}" fill="none" stroke="${MUSCLE_DARK}" stroke-width="12" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="${WALLP}" stroke-width="8" stroke-linecap="round"/>
        <path d="M${cx + s * 172} 122 l${s * 18} 4 M${cx + s * 176} 128 l${s * 16} 14 M${cx + s * 178} 132 l${s * 6} 20 M${cx + s * 174} 134 l${s * -6} 18" stroke="${MUSCLE_DARK}" stroke-width="5" stroke-linecap="round"/>
        <line x1="${cx + s * 54}" y1="150" x2="${cx + s * 126}" y2="176" stroke="${SKIN_EDGE}" stroke-width="2"/>
        <ellipse cx="${cx + s * 150}" cy="180" rx="28" ry="17" fill="${OVARY}" stroke="${OVARY_EDGE}" stroke-width="2"/>
        <circle cx="${cx + s * 142}" cy="176" r="4" fill="#fff" stroke="${OVARY_EDGE}"/><circle cx="${cx + s * 158}" cy="186" r="3" fill="#fff" stroke="${OVARY_EDGE}"/><circle cx="${cx + s * 160}" cy="172" r="2.5" fill="#fff" stroke="${OVARY_EDGE}"/>`;
    };
    const body = tube(-1) + tube(1) + `
      <path d="M${cx - 64} 114 Q${cx} 96 ${cx + 64} 114 C${cx + 76} 172 ${cx + 42} 230 ${cx + 22} 254 L${cx + 22} 286 L${cx - 22} 286 L${cx - 22} 254 C${cx - 42} 230 ${cx - 76} 172 ${cx - 64} 114Z" fill="${WALLP}" stroke="${MUSCLE_DARK}" stroke-width="2.5"/>
      <path d="M${cx - 42} 126 Q${cx} 116 ${cx + 42} 126 C${cx + 44} 168 ${cx + 18} 216 ${cx + 5} 248 L${cx - 5} 248 C${cx - 18} 216 ${cx - 44} 168 ${cx - 42} 126Z" fill="${LINING}" stroke="${MUSCLE_DARK}" stroke-width="1.5"/>
      <path d="M${cx - 28} 136 Q${cx} 130 ${cx + 28} 136 C${cx + 28} 168 ${cx + 10} 206 ${cx} 236 C${cx - 10} 206 ${cx - 28} 168 ${cx - 28} 136Z" fill="#fbe9e7"/>
      <line x1="${cx}" y1="236" x2="${cx}" y2="286" stroke="${MUSCLE_DARK}" stroke-width="2"/>
      <path d="M${cx - 22} 286 L${cx - 30} 380 L${cx + 30} 380 L${cx + 22} 286Z" fill="${SOFT}" stroke="${MUSCLE_DARK}" stroke-width="2"/>
      <path d="M${cx} 286 L${cx} 380" stroke="${MUSCLE_DARK}" stroke-width="1.2" stroke-dasharray="4 3"/>
      ${label("oviduct", "Oviduct", [cx - 110, 104], [cx - 150, 52], "end")}
      ${label("ovary", "Ovary", [cx - 160, 190], [cx - 200, 248], "end")}
      ${label("vagina", "Vagina", [cx - 26, 340], [cx - 120, 340], "end")}
      ${label("uterus", "Uterus", [cx + 45, 205], [cx + 215, 224])}
      ${label("lining", "Lining of uterus", [cx + 22, 216], [cx + 215, 264])}
      ${label("cervix", "Cervix", [cx + 22, 272], [cx + 215, 304])}`;
    return svg(660, 396, body);
  })();

  /* ---------- Male reproductive system (front view) ---------- */
  out["gn-male"] = (() => {
    const cx = 330;
    const duct = s => `<path d="M${cx + s * 66} 288 C${cx + s * 112} 236 ${cx + s * 118} 120 ${cx + s * 74} 70 C${cx + s * 52} 48 ${cx + s * 30} 108 ${cx + s * 10} 156" fill="none" stroke="#3f6d94" stroke-width="4" stroke-linecap="round"/>`;
    const testis = s => `<ellipse cx="${cx + s * 70}" cy="318" rx="34" ry="42" fill="${SOFT}" stroke="${SKIN_EDGE}" stroke-width="2"/>
      <ellipse cx="${cx + s * 70}" cy="318" rx="20" ry="28" fill="#f3d9a6" stroke="#b5813f" stroke-width="2"/>
      <path d="M${cx + s * 58} 304 q${s * 12} 8 0 16 q${s * 12} 8 0 16" fill="none" stroke="#b5813f" stroke-width="1.2"/>`;
    const body = testis(-1) + testis(1) + `${duct(-1)}${duct(1)}
      <ellipse cx="${cx}" cy="96" rx="52" ry="42" fill="#f6e7a1" stroke="#b59a2a" stroke-width="2.5"/>
      <ellipse cx="${cx - 26}" cy="140" rx="12" ry="18" fill="#d9c1e6" stroke="#7d5a96" stroke-width="2" transform="rotate(20 ${cx - 26} 140)"/>
      <ellipse cx="${cx + 26}" cy="140" rx="12" ry="18" fill="#d9c1e6" stroke="#7d5a96" stroke-width="2" transform="rotate(-20 ${cx + 26} 140)"/>
      <ellipse cx="${cx}" cy="162" rx="24" ry="14" fill="#d9c1e6" stroke="#7d5a96" stroke-width="2"/>
      <path d="M${cx - 22} 228 L${cx - 22} 372 Q${cx} 396 ${cx + 22} 372 L${cx + 22} 228Z" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2.5"/>
      <line x1="${cx}" y1="136" x2="${cx}" y2="384" stroke="#b59a2a" stroke-width="4"/>
      ${label("duct", "Sperm duct", [cx - 112, 180], [cx - 170, 150], "end")}
      ${label("testis", "Testis", [cx - 70, 318], [cx - 170, 300], "end")}
      ${label("scrotum", "Scrotum", [cx - 98, 340], [cx - 170, 372], "end")}
      ${label("bladder", "Bladder", [cx + 30, 90], [cx + 150, 56])}
      ${label("glands", "Glands", [cx + 18, 166], [cx + 150, 160])}
      ${label("urethra", "Urethra", [cx, 210], [cx + 150, 214])}
      ${label("penis", "Penis", [cx + 22, 300], [cx + 150, 270])}`;
    return svg(660, 410, body);
  })();

  /* ---------- Sperm cell and egg cell ---------- */
  out["gn-gametes"] = (() => {
    const body = `
      <text x="150" y="26" text-anchor="middle" class="title">Sperm cell</text>
      <text x="470" y="26" text-anchor="middle" class="title">Egg cell</text>
      <path d="M150 140 c14 -18 26 18 40 0 s26 18 40 0 s26 18 40 0" fill="none" stroke="#4a7fa8" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="124" y="131" width="30" height="18" rx="6" fill="${MITO}" stroke="#a85a10" stroke-width="1.5"/>
      <path d="M128 140 h22" stroke="#a85a10" stroke-width="1" stroke-dasharray="3 2"/>
      <ellipse cx="92" cy="140" rx="34" ry="22" fill="#cfe5f5" stroke="#4a7fa8" stroke-width="2.5"/>
      <ellipse cx="96" cy="140" rx="20" ry="13" fill="${NUC}" stroke="${NUC_EDGE}" stroke-width="1.5"/>
      <circle cx="470" cy="140" r="98" fill="#fdf6e3" stroke="#d8c48a" stroke-width="2" stroke-dasharray="6 4"/>
      <circle cx="470" cy="140" r="82" fill="${CYTO}" stroke="${MEMB}" stroke-width="3"/>
      <circle cx="458" cy="132" r="24" fill="${NUC}" stroke="${NUC_EDGE}" stroke-width="2"/>
      <text x="320" y="268" text-anchor="middle" class="cap">not to scale: the egg is many times wider than a sperm</text>
      ${label("head", "Head", [66, 140], [44, 84], "end")}
      ${label("mito", "Mitochondria", [139, 140], [150, 82])}
      ${label("tail", "Tail", [230, 140], [240, 206])}
      ${label("nucleus", "Nucleus", [458, 132], [600, 112])}
      ${label("cytoplasm", "Cytoplasm", [500, 190], [600, 196])}
      ${label("jelly", "Jelly coat", [530, 60], [600, 46])}`;
    return svg(680, 280, body);
  })();

  /* ---------- The menstrual cycle as a 28-day strip ---------- */
  out["gn-cycle"] = (() => {
    const x = d => 40 + d * 20;          // day 0 … 28
    const base = 210;
    const thick = d => d <= 5 ? 30 - d * 4.4 : d <= 14 ? 8 + (d - 5) * 2.6 : 31 + (d - 14) * 0.5;
    const pts = [];
    for (let d = 0; d <= 28; d += 0.5) pts.push(`${x(d)},${base - thick(d)}`);
    let ticks = "";
    [1, 7, 14, 21, 28].forEach(d => { ticks += `<line x1="${x(d)}" y1="${base}" x2="${x(d)}" y2="${base + 7}" stroke="${INK}" stroke-width="1.5"/><text x="${x(d)}" y="${base + 22}" text-anchor="middle" class="cap">day ${d}</text>`; });
    let drips = "";
    [1.2, 2.4, 3.6].forEach((d, i) => { drips += `<path d="M${x(d)} ${base + 2} q-4 8 0 11 q4 -3 0 -11Z" fill="${LINING}" opacity="${0.9 - i * 0.2}"/>`; });
    const body = `
      <text x="320" y="24" text-anchor="middle" class="title">The menstrual cycle (about 28 days)</text>
      <rect x="${x(0)}" y="${base}" width="${x(28) - x(0)}" height="10" fill="${WALLP}" stroke="${MUSCLE_DARK}" stroke-width="1"/>
      <polygon points="${x(0)},${base} ${pts.join(" ")} ${x(28)},${base}" fill="${LINING}" opacity=".85" stroke="${MUSCLE_DARK}" stroke-width="1.5"/>
      <rect x="${x(0)}" y="${base - 34}" width="${x(5) - x(0)}" height="34" fill="#c0392b" opacity=".15"/>
      ${drips}
      <circle cx="${x(14)}" cy="${base - 62}" r="9" fill="${CYTO}" stroke="${MEMB}" stroke-width="2"/><circle cx="${x(14) - 1}" cy="${base - 63}" r="3.5" fill="${NUC}"/>
      <path d="M${x(14)} ${base - 50} v12" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 2"/>
      ${ticks}
      <text x="${x(14)}" y="${base + 44}" text-anchor="middle" class="cap">the band shows how thick the uterus lining is</text>
      ${label("menstruation", "Menstruation (period)", [x(2.5), base - 18], [x(0.2), 70])}
      ${label("builds", "Lining builds up", [x(9), base - 20], [x(6), 120])}
      ${label("ovulation", "Ovulation", [x(14) + 6, base - 68], [x(15.5), 70])}
      ${label("thick", "Lining stays thick", [x(22), base - 36], [x(20), 120])}`;
    return svg(640, 270, body);
  })();

  /* ---------- Foetus in the uterus ---------- */
  out["gn-pregnancy"] = (() => {
    const cx = 300, cy = 200;
    const body = `
      <path d="M${cx} ${cy - 160} C${cx + 120} ${cy - 160} ${cx + 160} ${cy - 60} ${cx + 150} ${cy + 30} C${cx + 140} ${cy + 120} ${cx + 70} ${cy + 168} ${cx + 26} ${cy + 176} L${cx + 26} ${cy + 204} L${cx - 26} ${cy + 204} L${cx - 26} ${cy + 176} C${cx - 70} ${cy + 168} ${cx - 140} ${cy + 120} ${cx - 150} ${cy + 30} C${cx - 160} ${cy - 60} ${cx - 120} ${cy - 160} ${cx} ${cy - 160}Z" fill="${WALLP}" stroke="${MUSCLE_DARK}" stroke-width="2.5"/>
      <path d="M${cx} ${cy - 140} C${cx + 104} ${cy - 140} ${cx + 138} ${cy - 54} ${cx + 130} ${cy + 26} C${cx + 122} ${cy + 106} ${cx + 60} ${cy + 152} ${cx} ${cy + 158} C${cx - 60} ${cy + 152} ${cx - 122} ${cy + 106} ${cx - 130} ${cy + 26} C${cx - 138} ${cy - 54} ${cx - 104} ${cy - 140} ${cx} ${cy - 140}Z" fill="${FLUID}" stroke="${FLUID_EDGE}" stroke-width="2"/>
      <path d="M${cx + 20} ${cy - 139} C${cx + 90} ${cy - 132} ${cx + 126} ${cy - 80} ${cx + 130} ${cy - 30} C${cx + 108} ${cy - 40} ${cx + 96} ${cy - 90} ${cx + 20} ${cy - 112}Z" fill="#a93a36" stroke="#6e1f1c" stroke-width="2"/>
      <rect x="${cx - 8}" y="${cy + 160}" width="16" height="44" fill="#c97a74"/>
      <path d="M${cx - 26} ${cy + 204} L${cx - 34} ${cy + 268} L${cx + 34} ${cy + 268} L${cx + 26} ${cy + 204}Z" fill="${SOFT}" stroke="${MUSCLE_DARK}" stroke-width="2"/>
      <g fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2">
        <ellipse cx="${cx - 4}" cy="${cy - 18}" rx="50" ry="70" transform="rotate(-14 ${cx - 4} ${cy - 18})"/>
        <ellipse cx="${cx + 18}" cy="${cy - 62}" rx="16" ry="40" transform="rotate(-62 ${cx + 18} ${cy - 62})"/>
        <ellipse cx="${cx + 46}" cy="${cy - 30}" rx="13" ry="34" transform="rotate(8 ${cx + 46} ${cy - 30})"/>
        <ellipse cx="${cx + 52}" cy="${cy + 4}" rx="9" ry="15" transform="rotate(70 ${cx + 52} ${cy + 4})"/>
        <ellipse cx="${cx + 22}" cy="${cy + 44}" rx="10" ry="26" transform="rotate(-30 ${cx + 22} ${cy + 44})"/>
        <circle cx="${cx - 10}" cy="${cy + 86}" r="42"/>
      </g>
      <path d="M${cx + 2} ${cy + 96} q8 5 16 0" fill="none" stroke="${SKIN_EDGE}" stroke-width="2"/>
      <path d="M${cx + 36} ${cy + 18} C${cx + 90} ${cy + 20} ${cx + 70} ${cy - 40} ${cx + 92} ${cy - 66} S${cx + 92} ${cy - 100} ${cx + 94} ${cy - 104}" fill="none" stroke="#7d5a96" stroke-width="6" stroke-linecap="round"/>
      ${label("placenta", "Placenta", [cx + 100, cy - 100], [cx + 190, cy - 150])}
      ${label("cord", "Umbilical cord", [cx + 80, cy - 20], [cx + 190, cy - 60])}
      ${label("wall", "Uterus (muscle wall)", [cx + 144, cy + 40], [cx + 190, cy + 40])}
      ${label("cervix", "Cervix", [cx + 26, cy + 190], [cx + 190, cy + 190])}
      ${label("fluid", "Amniotic fluid", [cx - 110, cy - 30], [cx - 180, cy - 110], "end")}
      ${label("foetus", "Foetus", [cx - 24, cy - 10], [cx - 180, cy + 60], "end")}
      ${label("vagina", "Vagina", [cx - 30, cy + 240], [cx - 180, cy + 240], "end")}`;
    return svg(640, 480, body);
  })();

  /* ---------- From sex cells to birth ---------- */
  out["gn-stages"] = (() => {
    const panel = (i, title, sub, draw) => {
      const x = 8 + i * 132;
      return `<rect x="${x}" y="10" width="120" height="170" rx="12" fill="#fff" stroke="${GRID}"/>
        ${draw(x + 60, 80)}
        <text x="${x + 60}" y="146" text-anchor="middle" class="title" font-size="13">${title}</text>
        <text x="${x + 60}" y="166" text-anchor="middle" class="cap" font-size="11">${sub}</text>
        ${i < 4 ? `<path d="M${x + 122} 80 h8 m-4 -5 l5 5 -5 5" stroke="${INK}" stroke-width="2" fill="none"/>` : ""}`;
    };
    const cell = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${CYTO}" stroke="${MEMB}" stroke-width="2"/>`;
    const sperm = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#cfe5f5" stroke="#4a7fa8" stroke-width="1.5"/><path d="M${x - 6} ${y} c-5 -5 -9 5 -14 0 s-9 5 -14 0" fill="none" stroke="#4a7fa8" stroke-width="1.6"/>`;
    const body =
      panel(0, "Sex cells", "sperm meets egg", (x, y) => cell(x + 12, y, 28) + `<circle cx="${x + 12}" cy="${y}" r="8" fill="${NUC}"/>` + sperm(x - 10, y - 34) + sperm(x - 14, y + 30)) +
      panel(1, "Fertilisation", "in the oviduct", (x, y) => cell(x, y, 30) + `<circle cx="${x}" cy="${y}" r="10" fill="${NUC}" stroke="${NUC_EDGE}" stroke-width="2"/>`) +
      panel(2, "Embryo", "settles in the lining", (x, y) => `<path d="M${x - 50} ${y + 34} h100" stroke="${LINING}" stroke-width="10"/>` +
        [[-14, -12], [0, -16], [14, -12], [-16, 2], [0, 0], [16, 2], [-8, 14], [8, 14]].map(([dx, dy]) => cell(x + dx, y + dy, 9)).join("")) +
      panel(3, "Foetus", "grows for months", (x, y) => `<ellipse cx="${x}" cy="${y}" rx="40" ry="44" fill="${FLUID}" stroke="${FLUID_EDGE}"/>
        <g fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="1.5"><ellipse cx="${x + 4}" cy="${y + 8}" rx="16" ry="22"/><circle cx="${x - 4}" cy="${y - 18}" r="15"/></g>
        <path d="M${x + 14} ${y + 8} c12 -6 14 -24 22 -34" fill="none" stroke="#7d5a96" stroke-width="3"/>`) +
      panel(4, "Birth", "about 9 months on", (x, y) => `<g fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2"><circle cx="${x}" cy="${y - 22}" r="20"/>
        <ellipse cx="${x}" cy="${y + 18}" rx="22" ry="26"/></g><path d="M${x - 6} ${y - 18} a6 4 0 0 0 12 0" fill="none" stroke="${SKIN_EDGE}" stroke-width="1.5"/>
        <circle cx="${x - 7}" cy="${y - 26}" r="2" fill="${INK}"/><circle cx="${x + 7}" cy="${y - 26}" r="2" fill="${INK}"/>`);
    return svg(664, 190, body);
  })();

  return out;
}
