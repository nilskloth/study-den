/* =========================================================
   Ecosystems (Year 7, 3.9.1 Interdependence, 3.9.2 Plant reproduction)
   ec-flower         half a flower, cut down the middle (9 labelled parts)
   ec-fertilisation  pollen tube growing down to an ovule (6 labelled parts)
   ec-foodweb        a woodland food web, arrows = direction energy flows
   ec-predprey       predator and prey populations over time
   ec-dispersal      five ways seeds are spread
   Year 8 (3.9.3 Respiration, 3.9.4 Photosynthesis): see the second block below
   ========================================================= */

export default function (h) {
  const { svg, label, INK, CHLORO } = h;
  const PETAL = "#f6b3c8", PETAL_EDGE = "#c2577f";
  const SEPAL = "#86c06a", SEPAL_EDGE = "#3f7a2d";
  const ANTHER = "#f2c230", ANTHER_EDGE = "#a77d0a", FILAMENT = "#d4b25a";
  const CARPEL = "#bfe09a", CARPEL_EDGE = "#4f8a2e";
  const OVULE = "#fff6c9", OVULE_EDGE = "#a08a2e";
  const NECTAR = "#ffd75e", NECTAR_EDGE = "#c79a10";
  const POLLEN = "#f5b82e";
  const GREY = "#8a8d91";

  /* a curly brace from (x, y1) to (x, y2), opening to the left, with a caption */
  const brace = (x, y1, y2, text, side = "right") => {
    const m = (y1 + y2) / 2, d = side === "right" ? 8 : -8;
    return `<path d="M${x} ${y1} q${d} 0 ${d} 10 V${m - 6} q0 6 ${d} 6 q${-d} 0 ${-d} 6 V${y2 - 10} q0 10 ${-d} 10" fill="none" stroke="${GREY}" stroke-width="1.6"/>
      <text x="${x + d * 2}" y="${m + 4.5}" text-anchor="${side === "right" ? "start" : "end"}" class="title" fill="${GREY}" style="fill:${GREY}">${text}</text>`;
  };

  const out = {};

  /* ---------------- Parts of a flower ---------------- */
  out["ec-flower"] = (() => {
    const c = 320;
    const petal = s => `<path d="M${c + s * 26} 332 C${c + s * 60} 300 ${c + s * 120} 250 ${c + s * 150} 150 C${c + s * 160} 118 ${c + s * 186} 128 ${c + s * 184} 160 C${c + s * 178} 250 ${c + s * 110} 318 ${c + s * 40} 342Z" fill="${PETAL}" stroke="${PETAL_EDGE}" stroke-width="2"/>`;
    const sepal = s => `<path d="M${c + s * 30} 346 C${c + s * 70} 350 ${c + s * 100} 362 ${c + s * 116} 388 C${c + s * 80} 384 ${c + s * 48} 372 ${c + s * 22} 358Z" fill="${SEPAL}" stroke="${SEPAL_EDGE}" stroke-width="2"/>`;
    const stamen = s => `<path d="M${c + s * 30} 330 C${c + s * 50} 280 ${c + s * 70} 230 ${c + s * 78} 182" fill="none" stroke="${FILAMENT}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="${c + s * 80}" cy="168" rx="9" ry="18" transform="rotate(${s * 12} ${c + s * 80} 168)" fill="${ANTHER}" stroke="${ANTHER_EDGE}" stroke-width="2"/>`;
    const body = `
    <!-- stalk and receptacle -->
    <path d="M${c - 9} 440 V352 h18 V440Z" fill="${SEPAL}" stroke="${SEPAL_EDGE}" stroke-width="2"/>
    <path d="M${c - 44} 350 C${c - 40} 330 ${c + 40} 330 ${c + 44} 350 C${c + 20} 362 ${c - 20} 362 ${c - 44} 350Z" fill="${SEPAL}" stroke="${SEPAL_EDGE}" stroke-width="2"/>
    ${sepal(-1)}${sepal(1)}
    ${petal(-1)}${petal(1)}
    <!-- nectaries -->
    <ellipse cx="${c - 36}" cy="336" rx="9" ry="6" fill="${NECTAR}" stroke="${NECTAR_EDGE}" stroke-width="1.5"/>
    <ellipse cx="${c + 36}" cy="336" rx="9" ry="6" fill="${NECTAR}" stroke="${NECTAR_EDGE}" stroke-width="1.5"/>
    ${stamen(-1)}${stamen(1)}
    <!-- carpel: ovary, style, stigma -->
    <path d="M${c - 5} 262 V150 h10 V262Z" fill="${CARPEL}" stroke="${CARPEL_EDGE}" stroke-width="2"/>
    <path d="M${c - 22} 144 C${c - 22} 128 ${c - 8} 136 ${c} 128 C${c + 8} 136 ${c + 22} 128 ${c + 22} 144 C${c + 18} 154 ${c - 18} 154 ${c - 22} 144Z" fill="${CARPEL}" stroke="${CARPEL_EDGE}" stroke-width="2"/>
    <path d="M${c} 258 C${c + 34} 258 ${c + 40} 300 ${c + 30} 330 C${c + 20} 346 ${c - 20} 346 ${c - 30} 330 C${c - 40} 300 ${c - 34} 258 ${c} 258Z" fill="${CARPEL}" stroke="${CARPEL_EDGE}" stroke-width="2"/>
    <path d="M${c} 270 C${c + 20} 272 ${c + 24} 300 ${c + 18} 324 C${c + 10} 336 ${c - 10} 336 ${c - 18} 324 C${c - 24} 300 ${c - 20} 272 ${c} 270Z" fill="#e3f2cf" stroke="${CARPEL_EDGE}" stroke-width="1"/>
    ${[[-8, 286], [8, 286], [-9, 305], [9, 305], [0, 322]].map(([dx, y]) => `<ellipse cx="${c + dx}" cy="${y}" rx="6" ry="7.5" fill="${OVULE}" stroke="${OVULE_EDGE}" stroke-width="1.5"/>`).join("")}
    ${label("anther", "Anther", [c - 82, 166], [c - 170, 96], "end")}
    ${label("filament", "Filament", [c - 64, 240], [c - 200, 214], "end")}
    ${label("petal", "Petal", [c - 150, 186], [c - 216, 276], "end")}
    ${label("nectary", "Nectary", [c - 38, 338], [c - 170, 340], "end")}
    ${label("sepal", "Sepal", [c - 90, 376], [c - 150, 400], "end")}
    ${label("stigma", "Stigma", [c + 12, 138], [c + 150, 70])}
    ${label("style", "Style", [c + 4, 200], [c + 200, 210])}
    ${label("ovary", "Ovary", [c + 30, 316], [c + 150, 336])}
    ${label("ovule", "Ovule", [c + 9, 305], [c + 150, 300])}
    ${brace(c + 236, 60, 344, "Carpel")}
    ${brace(c - 244, 86, 224, "Stamen", "left")}
    <text x="${c}" y="462" text-anchor="middle" class="cap">Half a flower, cut down the middle.</text>
    <text x="${c}" y="480" text-anchor="middle" class="cap">Stamen = anther + filament (male) · Carpel = stigma + style + ovary (female)</text>`;
    return svg(640, 492, body);
  })();

  /* ---------------- Fertilisation: the pollen tube ---------------- */
  out["ec-fertilisation"] = (() => {
    const c = 260;
    const grain = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="${POLLEN}" stroke="${ANTHER_EDGE}" stroke-width="1.5"/><circle cx="${x - 2}" cy="${y - 2}" r="1.6" fill="${ANTHER_EDGE}"/>`;
    const body = `
    <!-- ovary wall, style, stigma -->
    <path d="M${c - 14} 270 V96 h28 V270Z" fill="${CARPEL}" stroke="${CARPEL_EDGE}" stroke-width="2"/>
    <path d="M${c - 50} 92 C${c - 52} 60 ${c - 20} 70 ${c} 56 C${c + 20} 70 ${c + 52} 60 ${c + 50} 92 C${c + 40} 110 ${c - 40} 110 ${c - 50} 92Z" fill="${CARPEL}" stroke="${CARPEL_EDGE}" stroke-width="2"/>
    <path d="M${c} 262 C${c + 90} 262 ${c + 100} 340 ${c + 80} 384 C${c + 56} 420 ${c - 56} 420 ${c - 80} 384 C${c - 100} 340 ${c - 90} 262 ${c} 262Z" fill="${CARPEL}" stroke="${CARPEL_EDGE}" stroke-width="2.5"/>
    <path d="M${c} 284 C${c + 64} 284 ${c + 74} 340 ${c + 60} 372 C${c + 44} 400 ${c - 44} 400 ${c - 60} 372 C${c - 74} 340 ${c - 64} 284 ${c} 284Z" fill="#e3f2cf" stroke="${CARPEL_EDGE}" stroke-width="1"/>
    <!-- ovule with its nucleus -->
    <ellipse cx="${c}" cy="344" rx="30" ry="38" fill="${OVULE}" stroke="${OVULE_EDGE}" stroke-width="2"/>
    <circle cx="${c}" cy="352" r="8" fill="#9b59b6" stroke="#6c3483" stroke-width="1.5"/>
    <!-- pollen grains on the stigma; one grows a tube -->
    ${grain(c - 30, 70)}${grain(c + 32, 72)}${grain(c + 12, 60)}
    <path d="M${c - 6} 66 C${c - 4} 120 ${c + 6} 160 ${c + 2} 220 C${c} 260 ${c - 4} 290 ${c} 308" fill="none" stroke="${ANTHER_EDGE}" stroke-width="3.5" stroke-linecap="round"/>
    ${grain(c - 6, 62)}
    <circle cx="${c}" cy="314" r="5" fill="#2e6fb7" stroke="#1d4a7d" stroke-width="1.2"/>
    ${label("pollen", "Pollen grain", [c - 30, 70], [c - 130, 40], "end")}
    ${label("stigma", "Stigma", [c - 44, 92], [c - 130, 110], "end")}
    ${label("style", "Style", [c - 14, 180], [c - 130, 180], "end")}
    ${label("tube", "Pollen tube", [c + 3, 150], [c + 120, 140])}
    ${label("nucleus", "Male nucleus", [c + 5, 314], [c + 130, 300])}
    ${label("ovule", "Ovule", [c + 26, 360], [c + 130, 350])}
    ${label("ovary", "Ovary", [c - 84, 360], [c - 130, 340], "end")}
    <text x="20" y="450" class="cap">1 Pollen lands on the stigma (pollination).</text>
    <text x="20" y="468" class="cap">2 A pollen tube grows down through the style to an ovule.</text>
    <text x="20" y="486" class="cap">3 The male nucleus moves down the tube and joins the nucleus in the ovule (fertilisation).</text>
    <text x="20" y="504" class="cap">4 The fertilised ovule becomes a seed; the ovary becomes the fruit.</text>`;
    return svg(540, 516, body);
  })();

  /* ---------------- A woodland food web ---------------- */
  out["ec-foodweb"] = (() => {
    const N = {
      hawk: [130, 50, "Sparrowhawk", "c"], owl: [320, 50, "Owl", "c"], fox: [510, 50, "Fox", "c"],
      tit: [130, 150, "Blue tit", "c"],
      cat: [130, 250, "Caterpillar", "h"], mouse: [320, 250, "Mouse", "h"], rabbit: [510, 250, "Rabbit", "h"],
      oak: [225, 345, "Oak tree", "p"], grass: [415, 345, "Grass", "p"]
    };
    const FILL = { p: ["#d7efc6", "#3f7a2d"], h: ["#fff1c4", "#b58a12"], c: ["#fbd9cf", "#b5503a"] };
    const W = 112, H = 34;
    const edges = [["oak", "cat"], ["oak", "mouse"], ["grass", "mouse"], ["grass", "rabbit"], ["cat", "tit"], ["tit", "hawk"], ["mouse", "owl"], ["mouse", "fox"], ["rabbit", "fox"]];
    const arrow = ([a, b]) => {
      const [x1, y1] = N[a], [x2, y2] = N[b];
      const sy = y1 - H / 2, ey = y2 + H / 2 + 2;
      const ang = Math.atan2(ey - sy, x2 - x1);
      const p = (d, t) => `${(x2 + Math.cos(ang + t) * d).toFixed(1)},${(ey + Math.sin(ang + t) * d).toFixed(1)}`;
      // arrowhead at the eater end, pointing towards it
      const back = (d, t) => `${(x2 - Math.cos(ang + t) * d).toFixed(1)},${(ey - Math.sin(ang + t) * d).toFixed(1)}`;
      return `<line x1="${x1}" y1="${sy}" x2="${x2 - Math.cos(ang) * 8}" y2="${ey - Math.sin(ang) * 8}" stroke="${INK}" stroke-width="2"/>
        <polygon points="${x2},${ey} ${back(11, 0.4)} ${back(11, -0.4)}" fill="${INK}"/>`;
    };
    const box = ([x, y, name, k]) => `<rect x="${x - W / 2}" y="${y - H / 2}" width="${W}" height="${H}" rx="9" fill="${FILL[k][0]}" stroke="${FILL[k][1]}" stroke-width="2"/>
      <text x="${x}" y="${y + 5}" text-anchor="middle" class="title">${name}</text>`;
    const body = `
    ${edges.map(arrow).join("")}
    ${Object.values(N).map(box).join("")}
    <rect x="20" y="384" width="14" height="14" rx="3" fill="${FILL.p[0]}" stroke="${FILL.p[1]}"/><text x="40" y="396" class="cap">producers</text>
    <rect x="120" y="384" width="14" height="14" rx="3" fill="${FILL.h[0]}" stroke="${FILL.h[1]}"/><text x="140" y="396" class="cap">eat plants</text>
    <rect x="220" y="384" width="14" height="14" rx="3" fill="${FILL.c[0]}" stroke="${FILL.c[1]}"/><text x="240" y="396" class="cap">eat animals</text>
    <text x="20" y="420" class="cap">Each arrow points from the food to the animal that eats it — the way energy flows.</text>
    <text x="20" y="438" class="cap">Decomposers (fungi, bacteria) break down the dead remains and waste of all of them.</text>`;
    return svg(640, 450, body);
  })();

  /* ---------------- Predator and prey populations ---------------- */
  out["ec-predprey"] = (() => {
    const x0 = 60, y0 = 250, w = 500, hgt = 210;
    const curve = (amp, base, shift) => {
      let d = "";
      for (let i = 0; i <= 100; i++) {
        const x = x0 + (i / 100) * w;
        const y = y0 - (base + amp * Math.sin((i / 100) * 4 * Math.PI - shift)) ;
        d += (i ? " L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
      }
      return d;
    };
    const body = `
    <line x1="${x0}" y1="${y0}" x2="${x0 + w + 10}" y2="${y0}" stroke="${INK}" stroke-width="2"/>
    <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - hgt - 10}" stroke="${INK}" stroke-width="2"/>
    <path d="${curve(70, 115, 0)}" fill="none" stroke="#2e6fb7" stroke-width="3.5"/>
    <path d="${curve(26, 52, 1.1)}" fill="none" stroke="#c0392b" stroke-width="3.5" stroke-dasharray="9 5"/>
    <text x="${x0 + w / 2}" y="${y0 + 30}" text-anchor="middle">Time (years)</text>
    <text x="22" y="${y0 - hgt / 2}" text-anchor="middle" transform="rotate(-90 22 ${y0 - hgt / 2})">Number of animals</text>
    <line x1="${x0 + 330}" y1="22" x2="${x0 + 360}" y2="22" stroke="#2e6fb7" stroke-width="3.5"/><text x="${x0 + 368}" y="27">Prey (rabbits)</text>
    <line x1="${x0 + 330}" y1="44" x2="${x0 + 360}" y2="44" stroke="#c0392b" stroke-width="3.5" stroke-dasharray="9 5"/><text x="${x0 + 368}" y="49">Predator (foxes)</text>`;
    return svg(600, 292, body);
  })();

  /* ---------------- Seed dispersal ---------------- */
  out["ec-dispersal"] = (() => {
    const panel = (i, title, how, draw) => {
      const x = 8 + i * 126;
      return `<rect x="${x}" y="8" width="118" height="196" rx="12" fill="#fff" stroke="#c9c9c4"/>
        ${draw(x + 59, 80)}
        <text x="${x + 59}" y="152" text-anchor="middle" class="title">${title}</text>
        ${how.split(" · ").map((t, k) => `<text x="${x + 59}" y="${172 + k * 17}" text-anchor="middle" class="cap">${t}</text>`).join("")}`;
    };
    const dandelion = (x, y) => `<line x1="${x}" y1="${y + 50}" x2="${x}" y2="${y - 10}" stroke="#8a7a5a" stroke-width="2"/>
      <ellipse cx="${x}" cy="${y + 54}" rx="4" ry="8" fill="#8a6a3a"/>
      ${Array.from({ length: 11 }, (_, k) => { const a = Math.PI * (0.05 + 0.9 * k / 10); return `<line x1="${x}" y1="${y - 10}" x2="${(x - Math.cos(a) * 34).toFixed(1)}" y2="${(y - 10 - Math.sin(a) * 34).toFixed(1)}" stroke="#a8a8a8" stroke-width="1.4"/>`; }).join("")}`;
    const sycamore = (x, y) => `<path d="M${x} ${y + 30} C${x - 20} ${y + 10} ${x - 50} ${y - 30} ${x - 40} ${y - 46} C${x - 24} ${y - 40} ${x - 10} ${y} ${x} ${y + 30}Z" fill="#c9b27a" stroke="#8a6f30" stroke-width="2"/>
      <path d="M${x} ${y + 30} C${x + 20} ${y + 10} ${x + 50} ${y - 30} ${x + 40} ${y - 46} C${x + 24} ${y - 40} ${x + 10} ${y} ${x} ${y + 30}Z" fill="#c9b27a" stroke="#8a6f30" stroke-width="2"/>
      <circle cx="${x - 6}" cy="${y + 28}" r="8" fill="#a07f3a"/><circle cx="${x + 6}" cy="${y + 28}" r="8" fill="#a07f3a"/>`;
    const coconut = (x, y) => `<path d="M${x - 52} ${y + 30} q13 -8 26 0 t26 0 t26 0 t26 0" fill="none" stroke="#2e6fb7" stroke-width="2.5"/>
      <ellipse cx="${x}" cy="${y + 12}" rx="30" ry="24" fill="#8b5a2b" stroke="#5a3a1a" stroke-width="2"/>
      <path d="M${x - 52} ${y + 40} q13 -8 26 0 t26 0 t26 0 t26 0" fill="none" stroke="#2e6fb7" stroke-width="2.5"/>`;
    const burr = (x, y) => `<circle cx="${x}" cy="${y}" r="20" fill="#9a7b4f" stroke="#5e4a2c" stroke-width="2"/>
      ${Array.from({ length: 16 }, (_, k) => { const a = 2 * Math.PI * k / 16, x1 = x + Math.cos(a) * 20, y1 = y + Math.sin(a) * 20, x2 = x + Math.cos(a) * 34, y2 = y + Math.sin(a) * 34, hx = x2 + Math.cos(a + 1.6) * 5, hy = y2 + Math.sin(a + 1.6) * 5; return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} L${hx.toFixed(1)} ${hy.toFixed(1)}" fill="none" stroke="#5e4a2c" stroke-width="1.6"/>`; }).join("")}`;
    const berry = (x, y) => `<path d="M${x} ${y - 40} v14" stroke="#3f7a2d" stroke-width="3"/>
      ${[[-12, -14], [0, -18], [12, -14], [-16, 0], [-4, -4], [8, -2], [18, 2], [-10, 12], [4, 12], [14, 16], [-2, 26]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="9" fill="#3b1f4f" stroke="#1d0f28" stroke-width="1.2"/><circle cx="${x + dx - 3}" cy="${y + dy - 3}" r="2" fill="#8c6aa6"/>`).join("")}`;
    const body = panel(0, "Dandelion", "wind · hairy parachute", dandelion) +
      panel(1, "Sycamore", "wind · spinning wings", sycamore) +
      panel(2, "Coconut", "water · floats", coconut) +
      panel(3, "Burdock", "animals · hooks on fur", burr) +
      panel(4, "Blackberry", "animals · eaten", berry);
    return svg(640, 212, body);
  })();

  /* =========================================================
     Year 8 (Part 2): 3.9.3 Respiration, 3.9.4 Photosynthesis
     ec-resp-equations  aerobic and anaerobic respiration word equations
     ec-yeast           yeast fermenting sugar, gas bubbled through limewater (6 labelled parts)
     ec-photo-equation  photosynthesis word equation, and where each thing comes from
     ec-leaf            cross-section of a leaf (8 labelled parts)
     ec-starch-leaf     variegated leaf before and after the iodine test
     ec-rate            how light, carbon dioxide and temperature change the rate
     ========================================================= */
  const GLASS = "#eef6fb", GLASS_EDGE = "#6f8fa6", WATER = "#cfe6f5";
  const LEAF = "#7fbf5a", LEAF_EDGE = "#3f7a2d";
  const eqBox = (y, title, colour, lines) => `<rect x="10" y="${y}" width="460" height="${30 + lines.length * 26}" rx="12" fill="#fff" stroke="${colour}" stroke-width="2"/>
    <text x="26" y="${y + 24}" class="title" style="fill:${colour}" fill="${colour}">${title}</text>
    ${lines.map((l, i) => `<text x="26" y="${y + 50 + i * 26}" style="font-size:15px">${l}</text>`).join("")}`;

  /* ---------------- Respiration word equations ---------------- */
  out["ec-resp-equations"] = (() => {
    const body = eqBox(8, "Aerobic respiration (with oxygen)", "#2e6fb7", [
        "glucose + oxygen → carbon dioxide + water",
        "<tspan class=\"cap\" style=\"font-size:12px\">lots of energy released · in the mitochondria</tspan>"]) +
      eqBox(108, "Anaerobic respiration in muscles (no oxygen)", "#c0392b", [
        "glucose → lactic acid",
        "<tspan class=\"cap\" style=\"font-size:12px\">much less energy released</tspan>"]) +
      eqBox(208, "Anaerobic respiration in yeast (fermentation)", "#b5651d", [
        "glucose → ethanol + carbon dioxide",
        "<tspan class=\"cap\" style=\"font-size:12px\">much less energy released · plants too, when roots lack oxygen</tspan>"]);
    return svg(480, 296, body);
  })();

  /* ---------------- Yeast fermentation experiment ---------------- */
  out["ec-yeast"] = (() => {
    const bubbles = (x, y1, y2, n) => Array.from({ length: n }, (_, k) => {
      const y = y1 + (y2 - y1) * k / (n - 1), dx = ((k * 37) % 13) - 6;
      return `<circle cx="${x + dx}" cy="${y.toFixed(1)}" r="${2.5 + (k % 3)}" fill="#fff" stroke="${GLASS_EDGE}" stroke-width="1"/>`;
    }).join("");
    const tube = (x1, x2, top, bottom, liquidTop, liquid) => {
      const r = (x2 - x1) / 2;
      return `<path d="M${x1} ${top} V${bottom - r} A${r} ${r} 0 0 0 ${x2} ${bottom - r} V${top}" fill="${GLASS}" stroke="${GLASS_EDGE}" stroke-width="2.5"/>
        <path d="M${x1 + 2} ${liquidTop} V${bottom - r} A${r - 2} ${r - 2} 0 0 0 ${x2 - 2} ${bottom - r} V${liquidTop}Z" fill="${liquid}"/>`;
    };
    const body = `<g transform="translate(40 0)">
    <!-- water bath -->
    <rect x="150" y="170" width="250" height="190" rx="6" fill="#fff" stroke="${GLASS_EDGE}" stroke-width="2.5"/>
    <rect x="152" y="196" width="246" height="162" fill="${WATER}"/>
    <!-- thermometer -->
    <rect x="190" y="110" width="10" height="226" rx="5" fill="#fff" stroke="${GLASS_EDGE}" stroke-width="1.5"/>
    <rect x="193" y="230" width="4" height="100" fill="#c0392b"/><circle cx="195" cy="334" r="8" fill="#c0392b"/>
    <!-- boiling tube with yeast and sugar solution -->
    ${tube(250, 300, 86, 340, 160, "#f1dfa8")}
    ${bubbles(275, 175, 320, 9)}
    <rect x="244" y="70" width="62" height="24" rx="4" fill="#5a4a3a"/>
    <!-- delivery tube -->
    <path d="M275 70 V40 H500 V300" fill="none" stroke="${GLASS_EDGE}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M275 70 V40 H500 V300" fill="none" stroke="${GLASS}" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- limewater -->
    ${tube(475, 525, 130, 340, 190, "#e4e8e6")}
    <path d="M500 130 V300" stroke="${GLASS_EDGE}" stroke-width="6"/><path d="M500 130 V300" stroke="${GLASS}" stroke-width="2.5"/>
    ${bubbles(500, 205, 295, 6)}
    ${label("thermometer", "Thermometer", [195, 130], [130, 130], "end")}
    ${label("bubbles", "Bubbles of gas", [280, 215], [130, 196], "end")}
    ${label("mixture", "Yeast + sugar solution", [262, 290], [130, 262], "end")}
    ${label("bath", "Water bath", [170, 345], [130, 330], "end")}
    ${label("delivery", "Delivery tube", [400, 40], [420, 18])}
    ${label("limewater", "Limewater", [512, 250], [548, 250])}
    <text x="20" y="386" class="cap">Yeast respires the sugar. The gas it gives off is carbon dioxide: it turns the limewater cloudy.</text>
    <text x="20" y="404" class="cap">Count the bubbles in a minute to compare how fast the yeast respires (e.g. at different temperatures).</text></g>`;
    return svg(680, 414, body);
  })();

  /* ---------------- Photosynthesis word equation ---------------- */
  out["ec-photo-equation"] = (() => {
    const chip = (x, y, w, text, sub, fill, edge) => `<rect x="${x}" y="${y}" width="${w}" height="70" rx="10" fill="${fill}" stroke="${edge}" stroke-width="2"/>
      <text x="${x + w / 2}" y="${y + 30}" text-anchor="middle" class="title">${text}</text>
      ${sub.map((s, i) => `<text x="${x + w / 2}" y="${y + 48 + i * 14}" text-anchor="middle" class="cap" style="font-size:11px">${s}</text>`).join("")}`;
    const IN = ["#e8f1fb", "#2e6fb7"], OUTC = ["#e5f4dc", LEAF_EDGE];
    const body = `
    <!-- sun -->
    <circle cx="297" cy="32" r="18" fill="#ffd75e" stroke="#c79a10" stroke-width="2"/>
    ${Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4; return `<line x1="${(297 + Math.cos(a) * 23).toFixed(1)}" y1="${(32 + Math.sin(a) * 23).toFixed(1)}" x2="${(297 + Math.cos(a) * 31).toFixed(1)}" y2="${(32 + Math.sin(a) * 31).toFixed(1)}" stroke="#c79a10" stroke-width="2.5" stroke-linecap="round"/>`; }).join("")}
    <path d="M297 66 V80" stroke="#c79a10" stroke-width="2" stroke-dasharray="4 3"/>
    <text x="297" y="96" text-anchor="middle" class="cap">light energy, absorbed by chlorophyll</text>
    ${chip(10, 106, 130, "carbon dioxide", ["from the air,", "in through stomata"], ...IN)}
    <text x="144" y="147" class="title">+</text>
    ${chip(160, 106, 116, "water", ["from the soil,", "up through roots"], ...IN)}
    <path d="M282 141 H310 m-8 -7 l8 7 -8 7" fill="none" stroke="${INK}" stroke-width="2.5"/>
    ${chip(318, 106, 122, "glucose", ["food: used, built", "into tissue or stored"], ...OUTC)}
    <text x="444" y="147" class="title">+</text>
    ${chip(460, 106, 90, "oxygen", ["out into", "the air"], ...OUTC)}
    <text x="280" y="204" text-anchor="middle" class="cap">Happens in the chloroplasts of plant and algae cells.</text>`;
    return svg(560, 214, body);
  })();

  /* ---------------- Cross-section of a leaf ---------------- */
  out["ec-leaf"] = (() => {
    const X1 = 120, X2 = 470;
    let b = "";
    // sunlight
    b += [190, 260, 330, 400].map(x => `<path d="M${x - 24} 8 L${x} 58 m-9 -5 l9 5 1 -10" fill="none" stroke="#c79a10" stroke-width="2.2" stroke-linecap="round"/>`).join("");
    b += `<text x="412" y="24" class="cap">light</text>`;
    // cuticle + upper epidermis
    b += `<rect x="${X1}" y="66" width="${X2 - X1}" height="8" fill="#eef5c9" stroke="#b4b86a" stroke-width="1"/>`;
    for (let x = X1; x < X2; x += 35) b += `<rect x="${x}" y="74" width="35" height="24" fill="#f6f9ee" stroke="${LEAF_EDGE}" stroke-width="1.2"/>`;
    // palisade layer
    for (let x = X1; x < X2; x += 25) {
      b += `<rect x="${x + 1}" y="100" width="23" height="86" rx="8" fill="#dff0cf" stroke="${LEAF_EDGE}" stroke-width="1.2"/>`;
      for (let k = 0; k < 5; k++) b += `<ellipse cx="${x + 7 + (k % 2) * 11}" cy="${110 + k * 16}" rx="4" ry="5" fill="${CHLORO}"/>`;
    }
    // spongy layer: round cells with air spaces between
    const spongy = [];
    [[212, 0], [242, 21], [272, 0]].forEach(([y, off]) => {
      for (let x = X1 + 18 + off; x < X2 - 10; x += 42) if (!(y === 272 && x > 280 && x < 340)) spongy.push([x, y]);
    });
    b += `<rect x="${X1}" y="188" width="${X2 - X1}" height="100" fill="#f3f8ec"/>`;
    b += spongy.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="#e6f3d9" stroke="${LEAF_EDGE}" stroke-width="1.2"/><ellipse cx="${x - 5}" cy="${y - 3}" rx="3.5" ry="4" fill="${CHLORO}"/><ellipse cx="${x + 6}" cy="${y + 4}" rx="3.5" ry="4" fill="${CHLORO}"/>`).join("");
    // lower epidermis with a stoma between two guard cells
    for (let x = X1; x < X2; x += 34) if (x + 34 <= 292 || x >= 328) b += `<rect x="${x}" y="288" width="${Math.min(34, X2 - x)}" height="22" fill="#f6f9ee" stroke="${LEAF_EDGE}" stroke-width="1.2"/>`;
    b += `<rect x="290" y="288" width="2" height="22" fill="#f6f9ee"/>`;
    b += `<rect x="${292 - 20}" y="288" width="20" height="22" fill="#f6f9ee" stroke="${LEAF_EDGE}" stroke-width="1.2"/><rect x="328" y="288" width="20" height="22" fill="#f6f9ee" stroke="${LEAF_EDGE}" stroke-width="1.2"/>`;
    b += `<ellipse cx="300" cy="299" rx="9" ry="12" fill="#c8e6b0" stroke="${LEAF_EDGE}" stroke-width="1.5"/><ellipse cx="320" cy="299" rx="9" ry="12" fill="#c8e6b0" stroke="${LEAF_EDGE}" stroke-width="1.5"/>
          <ellipse cx="310" cy="299" rx="2.6" ry="8" fill="#f3f8ec" stroke="${LEAF_EDGE}" stroke-width="1"/>
          <ellipse cx="298" cy="296" rx="2.5" ry="3" fill="${CHLORO}"/><ellipse cx="322" cy="296" rx="2.5" ry="3" fill="${CHLORO}"/>`;
    b += `<rect x="${X1}" y="310" width="${X2 - X1}" height="5" fill="#eef5c9" stroke="#b4b86a" stroke-width="1"/>`;
    // gases at the stoma
    b += `<path d="M290 360 L306 318 m-9 3 l9 -3 2 9" fill="none" stroke="#2e6fb7" stroke-width="2.2"/>
          <text x="282" y="374" text-anchor="end" class="cap">carbon dioxide in</text>
          <path d="M314 318 L330 360 m-9 -4 l9 4 3 -9" fill="none" stroke="${LEAF_EDGE}" stroke-width="2.2"/>
          <text x="338" y="374" class="cap">oxygen and water vapour out</text>`;
    // labels
    b += label("cuticle", "Waxy cuticle", [440, 70], [490, 58]);
    b += label("upper", "Upper epidermis", [450, 86], [490, 92]);
    b += label("palisade", "Palisade layer", [450, 140], [490, 140]);
    b += label("spongy", "Spongy layer", [440, 232], [490, 220]);
    b += label("lower", "Lower epidermis", [440, 300], [490, 274]);
    b += label("guard", "Guard cell", [323, 306], [490, 318]);
    b += label("air", "Air space", [158, 214], [100, 214], "end");
    b += label("stoma", "Stoma", [310, 294], [100, 312], "end");
    b += `<text x="20" y="396" class="cap">Light comes in from the top: the palisade cells, packed with chloroplasts, sit just under the surface.</text>`;
    return svg(640, 406, b);
  })();

  /* ---------------- The starch test on a variegated leaf ---------------- */
  out["ec-starch-leaf"] = (() => {
    const leaf = (cx, outer, inner, edge) => {
      const o = `M${cx} 40 C${cx + 70} 60 ${cx + 92} 130 ${cx + 60} 190 C${cx + 40} 222 ${cx + 10} 236 ${cx} 244 C${cx - 10} 236 ${cx - 40} 222 ${cx - 60} 190 C${cx - 92} 130 ${cx - 70} 60 ${cx} 40Z`;
      const i = `M${cx} 66 C${cx + 46} 82 ${cx + 62} 134 ${cx + 40} 180 C${cx + 26} 204 ${cx + 8} 214 ${cx} 220 C${cx - 8} 214 ${cx - 26} 204 ${cx - 40} 180 C${cx - 62} 134 ${cx - 46} 82 ${cx} 66Z`;
      return `<path d="M${cx} 244 V270" stroke="${edge}" stroke-width="4" stroke-linecap="round"/>
        <path d="${o}" fill="${outer}" stroke="${edge}" stroke-width="2"/>
        <path d="${i}" fill="${inner}"/>
        <path d="M${cx} 52 V238" stroke="${edge}" stroke-width="1.5" opacity=".5"/>`;
    };
    const body = `
    ${leaf(120, "#f4f2e4", LEAF, LEAF_EDGE)}
    ${leaf(400, "#e8a54a", "#1f2340", "#8a5a1a")}
    <path d="M220 150 H300 m-10 -8 l10 8 -10 8" fill="none" stroke="${INK}" stroke-width="2.5"/>
    <text x="260" y="136" text-anchor="middle" class="cap">starch test</text>
    <text x="120" y="24" text-anchor="middle" class="title">Before</text>
    <text x="400" y="24" text-anchor="middle" class="title">After iodine</text>
    <text x="120" y="292" text-anchor="middle" class="cap">green middle: chlorophyll</text>
    <text x="120" y="308" text-anchor="middle" class="cap">white edge: no chlorophyll</text>
    <text x="400" y="292" text-anchor="middle" class="cap">blue-black: starch made here</text>
    <text x="400" y="308" text-anchor="middle" class="cap">orange-brown: no starch</text>
    <text x="20" y="338" class="cap">1 Boil the leaf in water.  2 Warm it in ethanol in a water bath (no flame)</text>
    <text x="20" y="354" class="cap">to remove the chlorophyll.  3 Rinse in warm water.  4 Spread it out and</text>
    <text x="20" y="370" class="cap">add iodine solution.</text>`;
    return svg(520, 380, body);
  })();

  /* ---------------- Rate of photosynthesis graphs ---------------- */
  out["ec-rate"] = (() => {
    const graph = (i, title, xl, pts, note) => {
      const x0 = 30 + i * 205, y0 = 190, w = 160, hgt = 140;
      const d = pts.map(([u, v], k) => `${k ? "L" : "M"}${(x0 + u * w).toFixed(1)} ${(y0 - v * hgt).toFixed(1)}`).join(" ");
      return `<text x="${x0 + w / 2}" y="22" text-anchor="middle" class="title">${title}</text>
        <line x1="${x0}" y1="${y0}" x2="${x0 + w + 6}" y2="${y0}" stroke="${INK}" stroke-width="2"/>
        <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - hgt - 8}" stroke="${INK}" stroke-width="2"/>
        <path d="${d}" fill="none" stroke="${LEAF_EDGE}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
        <text x="${x0 + w / 2}" y="${y0 + 20}" text-anchor="middle" class="cap">${xl} →</text>
        <text x="${x0 - 10}" y="${y0 - hgt / 2}" text-anchor="middle" class="cap" transform="rotate(-90 ${x0 - 10} ${y0 - hgt / 2})">rate →</text>
        ${note.map((t, k) => `<text x="${x0 + w / 2}" y="${y0 + 40 + k * 15}" text-anchor="middle" class="cap" style="font-size:11px">${t}</text>`).join("")}`;
    };
    const curve = f => Array.from({ length: 41 }, (_, k) => [k / 40, f(k / 40)]);
    const body =
      graph(0, "Light", "light intensity", curve(u => 0.82 * (1 - Math.exp(-u * 4.5))), ["rises, then levels off:", "something else runs short"]) +
      graph(1, "Carbon dioxide", "CO₂ concentration", curve(u => 0.78 * (1 - Math.exp(-u * 4))), ["rises, then levels off"]) +
      graph(2, "Temperature", "temperature", curve(u => u < 0.62 ? 0.06 + 0.84 * Math.pow(u / 0.62, 1.6) : Math.max(0, 0.9 - Math.pow((u - 0.62) / 0.3, 2) * 0.9)), ["rises to a best temperature,", "then falls fast (too hot)"]);
    return svg(640, 260, body);
  })();

  return out;
}
