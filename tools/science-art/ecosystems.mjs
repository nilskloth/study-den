/* =========================================================
   Ecosystems (Year 7, 3.9.1 Interdependence, 3.9.2 Plant reproduction)
   ec-flower         half a flower, cut down the middle (9 labelled parts)
   ec-fertilisation  pollen tube growing down to an ovule (6 labelled parts)
   ec-foodweb        a woodland food web, arrows = direction energy flows
   ec-predprey       predator and prey populations over time
   ec-dispersal      five ways seeds are spread
   ========================================================= */

export default function (h) {
  const { svg, label, INK } = h;
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

  return out;
}
