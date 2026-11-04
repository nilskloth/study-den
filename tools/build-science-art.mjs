#!/usr/bin/env node
/* =========================================================
   Draws the Year 7 science diagrams as SVG:
     node tools/build-science-art.mjs
   → data/content/secondary/science/<name>.svg

   Every labelled part is a <g class="lbl" data-part="…"> with a
   leader line, a dot on the part, the name, and an empty letter
   badge. The trainer inlines the SVG, fills the letters A, B, C…
   in document order and toggles the root class "quiz" to show
   letters instead of names (the "which part is labelled C?"
   questions); "ask" on one .lbl highlights it.
   ========================================================= */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "content", "secondary", "science");
mkdirSync(OUT, { recursive: true });

const FONT = "Andika, 'Comic Sans MS', system-ui, sans-serif";
const INK = "#17181a";
const BONE = "#f4efe3", BONE_EDGE = "#7d7466";
const MUSCLE = "#c9534f", MUSCLE_DARK = "#8f2f2c";
const SKIN = "#efe0d0", SKIN_EDGE = "#b89d86";
const CYTO = "#fff3d6", MEMB = "#b5651d", NUC = "#9b59b6", NUC_EDGE = "#6c3483";
const MITO = "#e67e22", CHLORO = "#2e8b57", CHLORO_EDGE = "#1e5e3a", VAC = "#d6ecf7", WALL = "#4e9a4e";

const STYLE = `
  <style>
    text { font-family: ${FONT}; font-size: 13px; fill: ${INK}; }
    .title { font-size: 15px; font-weight: 700; }
    .cap { font-size: 12px; fill: #5c5f63; }
    .lbl .leader { stroke: #6a6d71; stroke-width: 1.2; fill: none; }
    .lbl .dot { fill: #6a6d71; }
    .lbl .name { font-weight: 700; }
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

/* A label: dot on the part at (px,py), text at (tx,ty); anchor "start" (text to the right) or "end". */
function label(part, name, [px, py], [tx, ty], anchor = "start") {
  const gap = anchor === "start" ? -6 : 6;
  const badgeX = anchor === "start" ? tx + 9 : tx - 9;
  return `
  <g class="lbl" data-part="${part}">
    <line class="leader" x1="${tx + gap}" y1="${ty}" x2="${px}" y2="${py}"/>
    <circle class="dot" cx="${px}" cy="${py}" r="3.5"/>
    <text class="name" x="${tx}" y="${ty + 4.5}" text-anchor="${anchor}">${name}</text>
    <g class="letter"><circle cx="${badgeX}" cy="${ty}" r="9.5"/><text x="${badgeX}" y="${ty + 4.5}" text-anchor="middle"></text></g>
  </g>`;
}

/* A bone drawn as a capsule between two points. */
const bone = (x1, y1, x2, y2, w) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${BONE_EDGE}" stroke-width="${w + 2.5}" stroke-linecap="round"/>
   <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${BONE}" stroke-width="${w}" stroke-linecap="round"/>`;

const files = {};

/* ---------------- 1. Levels of organisation ---------------- */
files.organisation = (() => {
  const steps = [
    ["cell", "Cell", "one building block"],
    ["tissue", "Tissue", "similar cells"],
    ["organ", "Organ", "tissues together"],
    ["system", "Organ system", "organs together"],
    ["organism", "Organism", "a whole living thing"]
  ];
  const cell = (x, y, r = 14) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${CYTO}" stroke="${MEMB}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r * 0.38}" fill="${NUC}"/>`;
  let body = "";
  steps.forEach(([id, name, cap], i) => {
    const x = 20 + i * 124;
    body += `<rect x="${x}" y="20" width="110" height="110" rx="12" fill="#fff" stroke="#c9c9c4"/>`;
    const cx = x + 55, cy = 75;
    if (id === "cell") body += cell(cx, cy, 24);
    if (id === "tissue") body += [[-22, -14], [0, -18], [22, -12], [-24, 12], [-2, 8], [20, 14], [-12, 30], [12, 32]].map(([dx, dy]) => cell(cx + dx, cy + dy - 6, 12)).join("");
    if (id === "organ") body += `<path d="M${cx - 30} ${cy - 20} C${cx - 10} ${cy - 45} ${cx + 35} ${cy - 30} ${cx + 32} ${cy} C${cx + 30} ${cy + 30} ${cx} ${cy + 42} ${cx - 18} ${cy + 28} C${cx - 36} ${cy + 16} ${cx - 42} ${cy - 5} ${cx - 30} ${cy - 20}Z" fill="#e9a3a0" stroke="${MUSCLE_DARK}" stroke-width="2"/><path d="M${cx - 22} ${cy - 10} q14 20 30 26" fill="none" stroke="${MUSCLE_DARK}" stroke-width="1.5" opacity=".6"/>`;
    if (id === "system") body += `<ellipse cx="${cx}" cy="${cy}" rx="24" ry="40" fill="${SKIN}" stroke="${SKIN_EDGE}"/><path d="M${cx} ${cy - 30} v16 c-14 0 -20 10 -18 20 c2 8 10 10 20 6 c10 -4 14 4 10 12 c-3 6 -10 8 -18 6" fill="none" stroke="${MUSCLE_DARK}" stroke-width="3.5" stroke-linecap="round"/>`;
    if (id === "organism") body += `<circle cx="${cx}" cy="${cy - 26}" r="10" fill="${SKIN}" stroke="${SKIN_EDGE}"/><path d="M${cx} ${cy - 14} v30 M${cx - 16} ${cy} h32 M${cx} ${cy + 16} l-12 24 M${cx} ${cy + 16} l12 24" stroke="${SKIN_EDGE}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
    body += `<text x="${cx}" y="150" text-anchor="middle" class="title">${name}</text><text x="${cx}" y="167" text-anchor="middle" class="cap" font-size="10.5">${cap}</text>`;
    if (i < 4) body += `<path d="M${x + 112} 75 l8 0 m-4 -5 l5 5 -5 5" stroke="${INK}" stroke-width="2" fill="none"/>`;
  });
  return svg(640, 180, body);
})();

/* ---------------- 2. Skeleton ---------------- */
files.skeleton = (() => {
  const cx = 320;
  let b = "";
  // spine
  for (let i = 0; i < 17; i++) b += `<rect x="${cx - 9}" y="${100 + i * 12.5}" width="18" height="10" rx="3" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="1.5"/>`;
  // skull
  b += `<ellipse cx="${cx}" cy="52" rx="36" ry="42" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2.5"/>
        <path d="M${cx - 22} 78 q22 30 44 0 v-8 h-44Z" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/>
        <ellipse cx="${cx - 13}" cy="52" rx="7" ry="8" fill="#6b6358"/><ellipse cx="${cx + 13}" cy="52" rx="7" ry="8" fill="#6b6358"/>
        <path d="M${cx - 3} 62 l3 8 l3 -8" fill="#6b6358"/>`;
  // clavicles + scapulae + sternum
  b += bone(cx - 58, 122, cx - 6, 112, 6) + bone(cx + 58, 122, cx + 6, 112, 6);
  b += `<path d="M${cx - 76} 128 l24 6 l-6 44 l-26 -20Z" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/>
        <path d="M${cx + 76} 128 l-24 6 l6 44 l26 -20Z" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/>`;
  b += `<rect x="${cx - 9}" y="128" width="18" height="78" rx="6" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/>`;
  // ribs
  for (let i = 0; i < 7; i++) {
    const y = 134 + i * 12, w = 46 + i * 5;
    b += `<path d="M${cx - 9} ${y + 4} C${cx - 30} ${y - 8} ${cx - w - 14} ${y + 2} ${cx - w} ${y + 22} C${cx - w + 6} ${y + 30} ${cx - 30} ${y + 24} ${cx - 10} ${y + 10}" fill="none" stroke="${BONE_EDGE}" stroke-width="7" stroke-linecap="round"/>
          <path d="M${cx - 9} ${y + 4} C${cx - 30} ${y - 8} ${cx - w - 14} ${y + 2} ${cx - w} ${y + 22} C${cx - w + 6} ${y + 30} ${cx - 30} ${y + 24} ${cx - 10} ${y + 10}" fill="none" stroke="${BONE}" stroke-width="4" stroke-linecap="round"/>
          <path d="M${cx + 9} ${y + 4} C${cx + 30} ${y - 8} ${cx + w + 14} ${y + 2} ${cx + w} ${y + 22} C${cx + w - 6} ${y + 30} ${cx + 30} ${y + 24} ${cx + 10} ${y + 10}" fill="none" stroke="${BONE_EDGE}" stroke-width="7" stroke-linecap="round"/>
          <path d="M${cx + 9} ${y + 4} C${cx + 30} ${y - 8} ${cx + w + 14} ${y + 2} ${cx + w} ${y + 22} C${cx + w - 6} ${y + 30} ${cx + 30} ${y + 24} ${cx + 10} ${y + 10}" fill="none" stroke="${BONE}" stroke-width="4" stroke-linecap="round"/>`;
  }
  // pelvis
  b += `<path d="M${cx - 62} 318 C${cx - 70} 340 ${cx - 50} 372 ${cx - 22} 378 L${cx - 14} 362 L${cx} 370 L${cx + 14} 362 L${cx + 22} 378 C${cx + 50} 372 ${cx + 70} 340 ${cx + 62} 318 C${cx + 40} 310 ${cx + 14} 330 ${cx} 330 C${cx - 14} 330 ${cx - 40} 310 ${cx - 62} 318Z" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2.5"/>`;
  // arms
  b += bone(cx - 74, 140, cx - 96, 240, 13) + bone(cx + 74, 140, cx + 96, 240, 13);
  b += bone(cx - 98, 246, cx - 118, 340, 7) + bone(cx - 90, 248, cx - 106, 340, 5);   // radius (outer) / ulna (inner)
  b += bone(cx + 98, 246, cx + 118, 340, 7) + bone(cx + 90, 248, cx + 106, 340, 5);
  // hands
  const hand = (x, y) => [-10, -4, 2, 8].map((dx, i) => bone(x + dx, y + 4, x + dx * 1.6, y + 26 - Math.abs(i - 1.5) * 2, 3.5)).join("") + bone(x - 16, y, x - 22, y + 12, 3.5);
  b += hand(cx - 112, 346) + hand(cx + 112, 346).replace(/x1="(\d+)"/g, (m, v) => m);
  // legs
  b += bone(cx - 36, 372, cx - 46, 470, 15) + bone(cx + 36, 372, cx + 46, 470, 15);
  b += bone(cx - 46, 486, cx - 50, 584, 11) + bone(cx - 34, 488, cx - 38, 582, 5);
  b += bone(cx + 46, 486, cx + 50, 584, 11) + bone(cx + 34, 488, cx + 38, 582, 5);
  b += `<circle cx="${cx - 47}" cy="477" r="9" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/><circle cx="${cx + 47}" cy="477" r="9" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/>`;
  b += `<path d="M${cx - 58} 586 l-26 16 h40 l6 -16Z" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/><path d="M${cx + 58} 586 l26 16 h-40 l-6 -16Z" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/>`;

  const L = [
    label("skull", "Skull (cranium)", [cx + 30, 40], [cx + 130, 40]),
    label("clavicle", "Clavicle (collarbone)", [cx - 34, 116], [cx - 140, 96], "end"),
    label("scapula", "Scapula (shoulder blade)", [cx + 66, 150], [cx + 130, 130]),
    label("sternum", "Sternum (breastbone)", [cx, 168], [cx + 130, 175]),
    label("ribs", "Ribs", [cx - 58, 180], [cx - 140, 160], "end"),
    label("vertebrae", "Vertebrae (spine)", [cx, 262], [cx + 130, 262]),
    label("humerus", "Humerus", [cx - 86, 192], [cx - 140, 212], "end"),
    label("radius", "Radius", [cx + 108, 296], [cx + 190, 300]),
    label("ulna", "Ulna", [cx - 99, 300], [cx - 140, 320], "end"),
    label("pelvis", "Pelvis (hip)", [cx + 40, 332], [cx + 130, 332]),
    label("femur", "Femur (thigh bone)", [cx - 42, 420], [cx - 140, 420], "end"),
    label("patella", "Patella (kneecap)", [cx + 47, 477], [cx + 130, 480]),
    label("tibia", "Tibia (shin bone)", [cx - 48, 540], [cx - 140, 530], "end"),
    label("fibula", "Fibula", [cx + 36, 545], [cx + 130, 548])
  ].join("");
  return svg(640, 612, b + L);
})();

/* ---------------- 3. Joints ---------------- */
files.joints = (() => {
  const panel = (x, title, where, draw) => `
    <rect x="${x}" y="16" width="146" height="196" rx="12" fill="#fff" stroke="#c9c9c4"/>
    <text x="${x + 73}" y="40" text-anchor="middle" class="title">${title}</text>
    <text x="${x + 73}" y="58" text-anchor="middle" class="cap">${where}</text>
    ${draw(x + 73, 140)}`;
  const hinge = (cx, cy) => `
    ${bone(cx - 10, cy - 60, cx - 4, cy - 10, 14)}
    ${bone(cx + 2, cy - 2, cx + 48, cy + 34, 12)}
    <ellipse cx="${cx - 2}" cy="${cy - 6}" rx="12" ry="9" fill="#bfe0f0" stroke="${BONE_EDGE}" stroke-width="1.5"/>
    <path d="M${cx + 20} ${cy + 36} a26 26 0 0 1 -34 -22" fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 3"/>
    <path d="M${cx - 16} ${cy + 12} l2 -6 l6 2" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
  const ball = (cx, cy) => `
    <path d="M${cx - 50} ${cy - 50} h40 a28 28 0 0 0 0 56 h-40Z" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/>
    <circle cx="${cx - 2}" cy="${cy - 22}" r="20" fill="#bfe0f0" stroke="${BONE_EDGE}" stroke-width="2"/>
    ${bone(cx + 8, cy - 8, cx + 44, cy + 40, 12)}
    <path d="M${cx + 20} ${cy - 46} a30 30 0 0 1 30 10" fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 3"/>
    <path d="M${cx + 46} ${cy - 42} l4 6 l-7 2" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
  const pivot = (cx, cy) => `
    <ellipse cx="${cx}" cy="${cy - 46}" rx="30" ry="22" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/>
    <rect x="${cx - 7}" y="${cy - 26}" width="14" height="22" rx="3" fill="#bfe0f0" stroke="${BONE_EDGE}" stroke-width="1.5"/>
    <rect x="${cx - 24}" y="${cy - 10}" width="48" height="20" rx="6" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/>
    <rect x="${cx - 18}" y="${cy + 14}" width="36" height="16" rx="5" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2"/>
    <path d="M${cx - 36} ${cy - 50} a40 14 0 0 0 72 0" fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 3"/>
    <path d="M${cx + 32} ${cy - 56} l4 6 l-7 1" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
  const fixed = (cx, cy) => `
    <ellipse cx="${cx}" cy="${cy - 18}" rx="42" ry="46" fill="${BONE}" stroke="${BONE_EDGE}" stroke-width="2.5"/>
    <path d="M${cx - 40} ${cy - 30} l8 -4 l6 6 l8 -5 l6 6 l8 -5 l6 6 l8 -5 l8 4 M${cx} ${cy - 62} l3 8 l-5 7 l5 8 l-4 8 l4 8" fill="none" stroke="${BONE_EDGE}" stroke-width="1.8"/>`;
  const body = panel(14, "Hinge", "knee, elbow", hinge) + panel(170, "Ball and socket", "hip, shoulder", ball) +
    panel(326, "Pivot", "neck", pivot) + panel(482, "Fixed", "skull", fixed) +
    `<text x="320" y="240" text-anchor="middle" class="cap">Ligaments join bone to bone · tendons join muscle to bone</text>
     <text x="320" y="258" text-anchor="middle" class="cap">Cartilage cushions the bone ends · synovial fluid oils the joint</text>`;
  return svg(640, 270, body);
})();

/* ---------------- 4a. Antagonistic pair ---------------- */
files.antagonistic = (() => {
  const arm = (x, bent) => {
    const sh = [x + 40, 50];
    const el = [x + 60, 150];
    const wr = bent ? [x + 150, 70] : [x + 90, 250];
    const bicepW = bent ? 26 : 14, tricepW = bent ? 12 : 24;
    // upper arm bone, forearm bone
    let s = `${bone(sh[0], sh[1], el[0], el[1], 12)}${bone(el[0], el[1], wr[0], wr[1], 9)}`;
    // biceps (front/inner side) and triceps (back/outer side) as ellipses along the humerus
    const mx = (sh[0] + el[0]) / 2, my = (sh[1] + el[1]) / 2;
    const ang = Math.atan2(el[1] - sh[1], el[0] - sh[0]) * 180 / Math.PI;
    s += `<ellipse cx="${mx + 18}" cy="${my}" rx="${bicepW}" ry="44" fill="${MUSCLE}" stroke="${MUSCLE_DARK}" stroke-width="2" transform="rotate(${ang - 90} ${mx + 18} ${my})"/>`;
    s += `<ellipse cx="${mx - 18}" cy="${my}" rx="${tricepW}" ry="44" fill="${MUSCLE}" stroke="${MUSCLE_DARK}" stroke-width="2" transform="rotate(${ang - 90} ${mx - 18} ${my})"/>`;
    // tendons
    s += `<line x1="${mx + 18}" y1="${my + 40}" x2="${el[0] + 12}" y2="${el[1] + 10}" stroke="#ddd" stroke-width="3"/>`;
    s += `<circle cx="${wr[0]}" cy="${wr[1]}" r="12" fill="${SKIN}" stroke="${SKIN_EDGE}"/>`;
    return s;
  };
  const body = `
    <text x="150" y="26" text-anchor="middle" class="title">Arm bends (flexes)</text>
    <text x="470" y="26" text-anchor="middle" class="title">Arm straightens (extends)</text>
    ${arm(60, true)} ${arm(380, false)}
    <text x="150" y="200" class="cap"><tspan font-weight="700" fill="${MUSCLE_DARK}">Biceps contracts</tspan></text><text x="150" y="216" class="cap">(shorter and fatter)</text>
    <text x="20" y="120" class="cap"><tspan font-weight="700">Triceps</tspan></text><text x="20" y="136" class="cap">relaxes</text>
    <text x="500" y="120" class="cap"><tspan font-weight="700">Biceps</tspan> relaxes</text>
    <text x="320" y="120" class="cap"><tspan font-weight="700" fill="${MUSCLE_DARK}">Triceps</tspan></text><text x="320" y="136" class="cap" fill="${MUSCLE_DARK}">contracts</text>
    <text x="320" y="290" text-anchor="middle" class="cap">Muscles can only pull. One contracts while its partner relaxes — an antagonistic pair.</text>`;
  return svg(640, 300, body);
})();

/* ---------------- 4b. Muscle map ---------------- */
files.muscles = (() => {
  const fig = (cx, back) => {
    let s = `<circle cx="${cx}" cy="48" r="26" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2"/>
      <path d="M${cx - 16} 72 h32 l40 22 l12 150 l-20 4 l-16 -112 l-6 60 l22 196 h-30 l-18 -140 l-18 140 h-30 l22 -196 l-6 -60 l-16 112 l-20 -4 l12 -150Z" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2" stroke-linejoin="round"/>`;
    const m = (x, y, rx, ry, rot = 0) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${MUSCLE}" stroke="${MUSCLE_DARK}" stroke-width="1.5" transform="rotate(${rot} ${x} ${y})"/>`;
    if (!back) {
      s += m(cx - 24, 90, 14, 11) + m(cx + 24, 90, 14, 11);               // pectorals
      s += m(cx - 44, 92, 12, 13) + m(cx + 44, 92, 12, 13);                // deltoids
      s += m(cx - 54, 136, 8, 26, 14) + m(cx + 54, 136, 8, 26, -14);       // biceps
      s += `<rect x="${cx - 18}" y="110" width="36" height="78" rx="10" fill="${MUSCLE}" stroke="${MUSCLE_DARK}" stroke-width="1.5"/>
            <path d="M${cx} 112 v74 M${cx - 18} 132 h36 M${cx - 18} 154 h36 M${cx - 18} 174 h36" stroke="${MUSCLE_DARK}" stroke-width="1.2" fill="none"/>`;  // abdominals
      s += m(cx - 24, 262, 13, 48, 6) + m(cx + 24, 262, 13, 48, -6);       // quadriceps
    } else {
      s += `<path d="M${cx - 42} 84 l42 -10 l42 10 l-14 30 l-28 14 l-28 -14Z" fill="${MUSCLE}" stroke="${MUSCLE_DARK}" stroke-width="1.5"/>`; // trapezius
      s += m(cx - 44, 92, 12, 13) + m(cx + 44, 92, 12, 13);                // deltoids
      s += m(cx - 54, 136, 8, 26, 14) + m(cx + 54, 136, 8, 26, -14);       // triceps
      s += `<path d="M${cx - 34} 118 l34 16 l34 -16 l-6 60 l-28 20 l-28 -20Z" fill="${MUSCLE}" stroke="${MUSCLE_DARK}" stroke-width="1.5"/>`; // latissimus
      s += m(cx - 18, 212, 16, 20) + m(cx + 18, 212, 16, 20);              // gluteals
      s += m(cx - 24, 270, 13, 44, 6) + m(cx + 24, 270, 13, 44, -6);       // hamstrings
      s += m(cx - 26, 360, 9, 30, 4) + m(cx + 26, 360, 9, 30, -4);         // gastrocnemius
    }
    return s;
  };
  const f = 230, k = 560;
  const body = `
    <text x="${f}" y="18" text-anchor="middle" class="title">Front</text>
    <text x="${k}" y="18" text-anchor="middle" class="title">Back</text>
    ${fig(f, false)} ${fig(k, true)}
    ${label("deltoids", "Deltoids (shoulder)", [f - 48, 86], [f - 76, 56], "end")}
    ${label("pectorals", "Pectorals (chest)", [f + 28, 90], [f + 80, 66])}
    ${label("biceps", "Biceps", [f + 56, 136], [f + 80, 130])}
    ${label("abdominals", "Abdominals (stomach)", [f - 12, 150], [f - 76, 150], "end")}
    ${label("quadriceps", "Quadriceps (front of thigh)", [f + 28, 262], [f + 80, 250])}
    ${label("trapezius", "Trapezius", [k, 94], [k - 80, 56], "end")}
    ${label("triceps", "Triceps", [k + 56, 136], [k + 80, 120])}
    ${label("latissimus", "Latissimus dorsi (back)", [k - 14, 150], [k - 80, 160], "end")}
    ${label("gluteals", "Gluteals (bottom)", [k + 20, 212], [k + 80, 212])}
    ${label("hamstrings", "Hamstrings (back of thigh)", [k - 26, 270], [k - 80, 296], "end")}
    ${label("gastrocnemius", "Gastrocnemius (calf)", [k + 28, 360], [k + 80, 360])}`;
  return svg(800, 420, body);
})();

/* ---------------- 5. Microscope ---------------- */
files.microscope = (() => {
  const x = 240;
  const body = `
    <!-- base -->
    <path d="M${x - 70} 400 h210 a14 14 0 0 1 14 14 v12 h-238 v-12 a14 14 0 0 1 14 -14Z" fill="#3b3f45"/>
    <!-- arm -->
    <path d="M${x + 118} 400 v-120 c0 -60 -20 -110 -50 -150 l-10 -14 c-10 -14 -28 -14 -36 0 l-6 10 c-6 10 4 14 10 22 l12 14 c22 30 36 70 36 118 v120Z" fill="#555b63"/>
    <!-- focus wheels -->
    <circle cx="${x + 96}" cy="300" r="24" fill="#2d3035"/><circle cx="${x + 96}" cy="300" r="12" fill="#6b7078"/>
    <!-- stage -->
    <rect x="${x - 60}" y="236" width="156" height="12" rx="3" fill="#2d3035"/>
    <rect x="${x - 36}" y="232" width="90" height="5" fill="#9fd3f0" opacity=".9"/>
    <path d="M${x - 46} 230 h20 v4 h-20Z M${x + 44} 230 h20 v4 h-20Z" fill="#8a8f96"/>
    <!-- light under stage -->
    <circle cx="${x}" cy="270" r="12" fill="#ffe08a" stroke="#c89a1c" stroke-width="2"/>
    <path d="M${x - 14} 256 l6 -10 M${x + 14} 256 l-6 -10 M${x} 250 v-8" stroke="#c89a1c" stroke-width="2"/>
    <rect x="${x - 10}" y="282" width="20" height="118" fill="#555b63"/>
    <!-- tube, nosepiece, objectives -->
    <rect x="${x - 14}" y="64" width="28" height="120" rx="4" fill="#3b3f45"/>
    <rect x="${x - 18}" y="36" width="36" height="34" rx="6" fill="#2d3035"/>
    <rect x="${x - 10}" y="30" width="20" height="8" rx="2" fill="#6b7078"/>
    <path d="M${x - 34} 184 h68 l-10 18 h-48Z" fill="#2d3035"/>
    <rect x="${x - 30}" y="200" width="11" height="22" fill="#3b3f45"/>
    <rect x="${x - 6}" y="200" width="12" height="30" fill="#3b3f45"/>
    <rect x="${x + 18}" y="200" width="11" height="22" fill="#3b3f45"/>
    ${label("eyepiece", "Eyepiece lens", [x, 40], [x + 120, 40])}
    ${label("objective", "Objective lenses", [x + 24, 216], [x - 120, 200], "end")}
    ${label("nosepiece", "Nosepiece (turns)", [x - 30, 190], [x - 120, 170], "end")}
    ${label("clips", "Stage clips", [x - 36, 232], [x - 120, 246], "end")}
    ${label("stage", "Stage", [x + 76, 242], [x + 150, 242])}
    ${label("light", "Light", [x, 270], [x - 120, 290], "end")}
    ${label("coarse", "Coarse focusing wheel", [x + 116, 288], [x + 150, 278])}
    ${label("fine", "Fine focusing wheel", [x + 108, 300], [x + 150, 314])}
    ${label("arm", "Arm", [x + 72, 150], [x + 150, 150])}
    ${label("base", "Base", [x - 50, 412], [x - 120, 400], "end")}`;
  return svg(640, 440, body);
})();

/* ---------------- 6. Plant and animal cells ---------------- */
files.cells = (() => {
  const mito = (x, y, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="20" ry="9" fill="${MITO}" stroke="#a85a10" stroke-width="1.5"/><path d="M${x - 14} ${y} q4 -6 8 0 t8 0 t8 0" fill="none" stroke="#a85a10" stroke-width="1.2"/></g>`;
  const chloro = (x, y, rot = 0) => `<g transform="rotate(${rot} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="16" ry="9" fill="${CHLORO}" stroke="${CHLORO_EDGE}" stroke-width="1.5"/><path d="M${x - 8} ${y - 2} h16 M${x - 8} ${y + 2} h16" stroke="#8ee0a8" stroke-width="1.2"/></g>`;
  const nucleus = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${NUC}" stroke="${NUC_EDGE}" stroke-width="2"/><circle cx="${x + 4}" cy="${y - 3}" r="${r * 0.3}" fill="${NUC_EDGE}"/>`;
  const a = 170, p = 520;
  const body = `
    <text x="${a}" y="24" text-anchor="middle" class="title">Animal cell</text>
    <text x="${p}" y="24" text-anchor="middle" class="title">Plant cell</text>
    <!-- animal -->
    <path d="M${a - 90} 150 C${a - 100} 90 ${a - 50} 50 ${a + 10} 56 C${a + 70} 60 ${a + 110} 100 ${a + 96} 160 C${a + 84} 220 ${a + 30} 250 ${a - 30} 240 C${a - 80} 232 ${a - 84} 190 ${a - 90} 150Z" fill="${CYTO}" stroke="${MEMB}" stroke-width="4"/>
    ${nucleus(a + 10, 140, 32)} ${mito(a - 48, 110, -30)} ${mito(a + 60, 200, 20)} ${mito(a - 40, 196, 10)}
    <!-- plant -->
    <rect x="${p - 110}" y="46" width="220" height="210" rx="10" fill="${WALL}" stroke="#2f6b2f" stroke-width="2"/>
    <rect x="${p - 98}" y="58" width="196" height="186" rx="8" fill="${CYTO}" stroke="${MEMB}" stroke-width="3"/>
    <path d="M${p - 60} 100 C${p - 40} 70 ${p + 60} 70 ${p + 74} 110 C${p + 86} 160 ${p + 60} 220 ${p + 10} 226 C${p - 50} 230 ${p - 80} 180 ${p - 60} 100Z" fill="${VAC}" stroke="#7fb3d5" stroke-width="2"/>
    ${nucleus(p - 66, 212, 22)} ${chloro(p - 72, 80, -20)} ${chloro(p + 40, 72)} ${chloro(p + 80, 170, 80)} ${chloro(p - 80, 150, 70)} ${mito(p + 60, 232, -10)}
    ${label("nucleus", "Nucleus", [a + 10, 140], [a - 110, 150], "end")}
    ${label("cytoplasm", "Cytoplasm", [a + 70, 110], [a + 115, 70])}
    ${label("membrane", "Cell membrane", [a - 60, 222], [a - 40, 282])}
    ${label("mitochondria", "Mitochondria", [a + 60, 200], [a + 115, 230])}
    ${label("wall", "Cell wall", [p + 110, 90], [p + 130, 70])}
    ${label("chloroplast", "Chloroplast", [p + 80, 170], [p + 130, 190])}
    ${label("vacuole", "Permanent vacuole", [p + 20, 150], [p + 130, 130])}`;
  return svg(800, 300, body);
})();

/* ---------------- 7. Specialised cells ---------------- */
files.specialised = (() => {
  const panel = (x, y, title, job, draw) => `
    <rect x="${x}" y="${y}" width="200" height="150" rx="12" fill="#fff" stroke="#c9c9c4"/>
    <text x="${x + 100}" y="${y + 22}" text-anchor="middle" class="title">${title}</text>
    ${draw(x + 100, y + 66)}
    <text x="${x + 100}" y="${y + 126}" text-anchor="middle" class="cap">${job.split(" → ")[0]}</text>
    <text x="${x + 100}" y="${y + 142}" text-anchor="middle" class="cap">→ ${job.split(" → ")[1]}</text>`;
  const nerve = (cx, cy) => `<path d="M${cx - 90} ${cy} h130" stroke="#d4a017" stroke-width="5" stroke-linecap="round"/>
    <circle cx="${cx - 72}" cy="${cy}" r="14" fill="#f5d76e" stroke="#b58a00" stroke-width="2"/><circle cx="${cx - 72}" cy="${cy}" r="5" fill="${NUC}"/>
    <path d="M${cx - 80} ${cy - 10} l-12 -14 M${cx - 76} ${cy - 13} l-4 -16 M${cx - 84} ${cy + 6} l-14 10 M${cx - 66} ${cy + 12} l4 16 M${cx + 40} ${cy} l16 -14 M${cx + 40} ${cy} l16 14 M${cx + 40} ${cy} l20 0" stroke="#b58a00" stroke-width="2.5" stroke-linecap="round"/>`;
  const sperm = (cx, cy) => `<ellipse cx="${cx - 50}" cy="${cy}" rx="18" ry="12" fill="#cfe5f5" stroke="#4a7fa8" stroke-width="2"/><ellipse cx="${cx - 50}" cy="${cy}" rx="10" ry="7" fill="${NUC}"/>
    <rect x="${cx - 34}" y="${cy - 5}" width="14" height="10" rx="4" fill="${MITO}"/>
    <path d="M${cx - 20} ${cy} c15 -16 25 16 40 0 s25 16 50 0" fill="none" stroke="#4a7fa8" stroke-width="3" stroke-linecap="round"/>`;
  const leaf = (cx, cy) => `<rect x="${cx - 22}" y="${cy - 36}" width="44" height="84" rx="6" fill="${CYTO}" stroke="${WALL}" stroke-width="3"/>
    ${[-24, -10, 4, 18].map(dy => `<ellipse cx="${cx + (dy % 2 ? -8 : 8)}" cy="${cy + dy}" rx="9" ry="6" fill="${CHLORO}" stroke="${CHLORO_EDGE}"/>`).join("")}
    <circle cx="${cx - 2}" cy="${cy + 36}" r="6" fill="${NUC}"/>`;
  const root = (cx, cy) => `<path d="M${cx - 60} ${cy - 24} h50 v10 l90 4 v16 l-90 4 v14 h-50Z" fill="${CYTO}" stroke="${WALL}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="${cx - 40}" cy="${cy}" r="9" fill="${NUC}"/><ellipse cx="${cx - 18}" cy="${cy + 10}" rx="12" ry="6" fill="${VAC}" stroke="#7fb3d5"/>
    <path d="M${cx + 40} ${cy - 26} l0 -8 M${cx + 60} ${cy + 30} l0 8" stroke="#7fb3d5" stroke-width="2"/>`;
  const rbc = (cx, cy) => `<ellipse cx="${cx - 40}" cy="${cy}" rx="34" ry="30" fill="#e74c3c" stroke="#a93226" stroke-width="2"/><ellipse cx="${cx - 40}" cy="${cy}" rx="18" ry="14" fill="#c0392b" opacity=".6"/>
    <path d="M${cx + 10} ${cy} a34 9 0 0 1 68 0 a34 9 0 0 1 -68 0 M${cx + 20} ${cy - 2} q24 6 48 0" fill="#e74c3c" stroke="#a93226" stroke-width="2"/>
    <text x="${cx + 44}" y="${cy + 22}" text-anchor="middle" class="cap">side view</text>`;
  const body = panel(14, 14, "Nerve cell", "long + branched → carries electrical signals", nerve) +
    panel(224, 14, "Sperm cell", "tail + mitochondria → swims to the egg", sperm) +
    panel(434, 14, "Leaf (palisade) cell", "full of chloroplasts → photosynthesis", leaf) +
    panel(120, 176, "Root hair cell", "long extension → absorbs water and minerals", root) +
    panel(330, 176, "Red blood cell", "no nucleus, haemoglobin → carries oxygen", rbc);
  return svg(640, 340, body);
})();

/* ---------------- 8. Unicellular organisms ---------------- */
files.unicellular = (() => {
  const panel = (x, title, cap, draw) => `
    <rect x="${x}" y="14" width="186" height="210" rx="12" fill="#fff" stroke="#c9c9c4"/>
    <text x="${x + 93}" y="38" text-anchor="middle" class="title">${title}</text>
    ${draw(x + 93, 118)}
    <text x="${x + 93}" y="190" text-anchor="middle" class="cap">${cap.split("; ")[0]}</text>
    <text x="${x + 93}" y="206" text-anchor="middle" class="cap">${cap.split("; ")[1] || ""}</text>`;
  const amoeba = (cx, cy) => `<path d="M${cx - 50} ${cy - 10} C${cx - 60} ${cy - 50} ${cx - 10} ${cy - 60} ${cx + 10} ${cy - 40} C${cx + 30} ${cy - 56} ${cx + 60} ${cy - 30} ${cx + 44} ${cy - 6} C${cx + 66} ${cy + 6} ${cx + 50} ${cy + 40} ${cx + 20} ${cy + 30} C${cx + 10} ${cy + 56} ${cx - 30} ${cy + 50} ${cx - 26} ${cy + 24} C${cx - 60} ${cy + 30} ${cx - 62} ${cy + 4} ${cx - 50} ${cy - 10}Z" fill="${CYTO}" stroke="${MEMB}" stroke-width="2.5"/>
    <circle cx="${cx - 6}" cy="${cy - 4}" r="12" fill="${NUC}"/><circle cx="${cx + 24}" cy="${cy + 10}" r="8" fill="${VAC}" stroke="#7fb3d5"/>
    `;
  const euglena = (cx, cy) => `<ellipse cx="${cx}" cy="${cy}" rx="22" ry="52" fill="${CYTO}" stroke="${MEMB}" stroke-width="2.5"/>
    ${[-30, -10, 10, 30].map(dy => `<ellipse cx="${cx + (dy % 20 ? 6 : -6)}" cy="${cy + dy}" rx="8" ry="5" fill="${CHLORO}" stroke="${CHLORO_EDGE}"/>`).join("")}
    <circle cx="${cx}" cy="${cy + 2}" r="8" fill="${NUC}"/><circle cx="${cx - 8}" cy="${cy - 40}" r="4" fill="#c0392b"/>
    <path d="M${cx} ${cy - 52} c-5 -6 5 -10 0 -16 c-3 -4 3 -7 2 -10" fill="none" stroke="${MEMB}" stroke-width="2.5" stroke-linecap="round"/>
    <text x="${cx + 10}" y="${cy - 60}" class="cap" font-size="10">flagellum</text><text x="${cx - 72}" y="${cy - 36}" class="cap" font-size="10">eyespot</text>`;
  const bact = (cx, cy) => `<rect x="${cx - 50}" y="${cy - 22}" width="100" height="44" rx="22" fill="#d7f0d0" stroke="#4e9a4e" stroke-width="3"/>
    <path d="M${cx - 20} ${cy} c-6 -12 12 -16 10 -6 c-2 10 20 12 20 0 c0 -10 -14 -12 -12 -2" fill="none" stroke="${NUC_EDGE}" stroke-width="2.5"/>
    <path d="M${cx + 50} ${cy} c12 -8 14 12 26 4 c8 -6 14 4 20 0" fill="none" stroke="#4e9a4e" stroke-width="2" stroke-linecap="round"/>
    <text x="${cx - 60}" y="${cy + 42}" class="cap" font-size="10">loop of DNA, no nucleus</text>`;
  const yeast = (cx, cy) => `<circle cx="${cx - 8}" cy="${cy}" r="30" fill="${CYTO}" stroke="#b58a00" stroke-width="3"/><circle cx="${cx - 10}" cy="${cy + 2}" r="9" fill="${NUC}"/>
    <circle cx="${cx + 28}" cy="${cy - 22}" r="14" fill="${CYTO}" stroke="#b58a00" stroke-width="3"/><circle cx="${cx + 28}" cy="${cy - 22}" r="5" fill="${NUC}"/>
    <text x="${cx + 20}" y="${cy - 44}" class="cap" font-size="10">bud</text>`;
  const body = panel(10, "Amoeba", "moves and feeds; with pseudopodia", amoeba) + panel(206, "Euglena", "chloroplasts; and a flagellum", euglena) +
    panel(402, "Bacterium", "no nucleus; splits in two", bact) + panel(598, "Yeast", "a fungus; reproduces by budding", yeast);
  return svg(794, 240, body);
})();

/* ---------------- 9. Diffusion ---------------- */
files.diffusion = (() => {
  // deterministic pseudo-random dots
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const box = (x, title, cap, left, right) => {
    let s = `<rect x="${x}" y="40" width="250" height="150" rx="8" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
      <line x1="${x + 125}" y1="40" x2="${x + 125}" y2="190" stroke="#c9c9c4" stroke-dasharray="4 4"/>
      <text x="${x + 125}" y="28" text-anchor="middle" class="title">${title}</text>
      <text x="${x + 125}" y="214" text-anchor="middle" class="cap">${cap}</text>`;
    for (let i = 0; i < left; i++) s += `<circle cx="${x + 8 + rnd() * 110}" cy="${48 + rnd() * 134}" r="5" fill="#2a78d6"/>`;
    for (let i = 0; i < right; i++) s += `<circle cx="${x + 133 + rnd() * 110}" cy="${48 + rnd() * 134}" r="5" fill="#2a78d6"/>`;
    return s;
  };
  const body = box(20, "Before", "high concentration on the left, low on the right", 40, 4) +
    `<path d="M290 115 h50 m-10 -8 l10 8 -10 8" stroke="${INK}" stroke-width="2.5" fill="none"/>
     <text x="315" y="100" text-anchor="middle" class="cap">net movement</text>` +
    box(370, "After", "evenly spread — no net movement", 22, 22) +
    `<text x="320" y="250" text-anchor="middle" class="cap">Particles move randomly all the time. Overall they drift from high to low concentration, with no energy needed.</text>`;
  return svg(640, 262, body);
})();

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(OUT, `${name}.svg`), content);
  console.log(`wrote ${name}.svg (${content.length} bytes)`);
}
