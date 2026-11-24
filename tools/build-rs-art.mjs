#!/usr/bin/env node
/* =========================================================
   Draws the Year 7 Religious Studies (Hinduism) pictures as SVG:
     node tools/build-rs-art.mjs
   → data/content/secondary/rs/<name>.svg

   Five deities — Brahma, Vishnu, Shiva, Ganesha, Lakshmi — as simple,
   respectful line drawings (our own, not copied from any picture),
   each holding its symbols, plus the Trimurti. Every symbol is a label
   in the science-diagram format (<g class="lbl" data-part="…"> with a
   leader, a dot, the name and an empty letter badge), so the trainer
   can show letters and ask "which symbol is C?", and each picture
   becomes a "Name the symbols" set.
   ========================================================= */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "content", "secondary", "rs");
mkdirSync(OUT, { recursive: true });

const FONT = "Andika, 'Comic Sans MS', system-ui, sans-serif";
const INK = "#17181a", LINE = "#3b2f2a";
const GOLD = "#e3b23c", GOLD_D = "#a87a14";

const STYLE = `
  <style>
    text { font-family: ${FONT}; font-size: 14px; fill: ${INK}; }
    .cap { font-size: 12px; fill: #5c5f63; }
    .lbl .leader { stroke: #3d4248; stroke-width: 1.3; fill: none; }
    .lbl .dot { fill: #3d4248; }
    .lbl .name { font-weight: 700; paint-order: stroke; stroke: rgba(255,255,255,0.9); stroke-width: 3px; }
    .lbl .letter { display: none; }
    .lbl .letter circle { fill: ${INK}; }
    .lbl .letter text { fill: #fff; font-weight: 700; font-size: 12px; }
    .quiz .lbl .name { display: none; }
    .quiz .lbl .letter { display: block; }
    .lbl.ask .leader { stroke: #c0392b; stroke-width: 2.5; }
    .lbl.ask .dot { fill: #c0392b; r: 6; }
    .lbl.ask .letter circle { fill: #c0392b; }
  </style>`;

const W = 660, H = 500, CX = 330;
const svg = (body, w = W, h = H) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="sci-fig" role="img">${STYLE}\n${body}\n</svg>\n`;
const r1 = n => Math.round(n * 10) / 10;

/* Same label as the science and geography diagrams. */
function label(part, name, [px, py], [tx, ty]) {
  const w = name.length * 7.6;
  const dx = px - tx, dy = py - ty;
  let lx = tx, ly = ty;
  if (Math.abs(dy) * (w / 2) > Math.abs(dx) * 9) ly = ty + Math.sign(dy) * 10;
  else lx = tx + Math.sign(dx) * (w / 2 + 3);
  const leader = Math.hypot(px - lx, py - ly) > 6 ? `<line class="leader" x1="${r1(lx)}" y1="${r1(ly)}" x2="${r1(px)}" y2="${r1(py)}"/>` : "";
  return `
  <g class="lbl" data-part="${part}">
    ${leader}
    <circle class="dot" cx="${r1(px)}" cy="${r1(py)}" r="3.5"/>
    <text class="name" x="${r1(tx)}" y="${r1(ty + 5)}" text-anchor="middle">${name}</text>
    <g class="letter"><circle cx="${r1(tx)}" cy="${r1(ty)}" r="10"/><text x="${r1(tx)}" y="${r1(ty + 4.5)}" text-anchor="middle"></text></g>
  </g>`;
}
/* labels sit in two columns either side of the figure */
const LX = 92, RX = W - 92;

/* ---------------- Body parts ---------------- */

const darker = (hex, f = 0.72) => "#" + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * f).toString(16).padStart(2, "0")).join("");

/* a limb: a thick line with an outline, round ends */
const limb = (d, skin) =>
  `<path d="${d}" fill="none" stroke="${darker(skin)}" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${skin}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>`;
const hand = (x, y, skin) => `<circle cx="${x}" cy="${y}" r="9.5" fill="${skin}" stroke="${darker(skin)}" stroke-width="2"/>`;

/* the shoulder points and the four hands */
const SH = { l: [CX - 36, 232], r: [CX + 36, 232] };
const HANDS = { ul: [CX - 128, 168], ur: [CX + 128, 168], ll: [CX - 84, 316], lr: [CX + 92, 290] };
const ARM_PATH = {
  ul: `M${SH.l} L${CX - 104},${226} L${HANDS.ul}`,
  ur: `M${SH.r} L${CX + 104},${226} L${HANDS.ur}`,
  ll: `M${SH.l} L${CX - 70},${270} L${HANDS.ll}`,
  lr: `M${SH.r} L${CX + 66},${276} L${HANDS.lr}`
};

/* raised right hand, palm out: "do not be afraid" (abhaya mudra) */
function blessingHand(skin) {
  const [x, y] = HANDS.lr;
  return `<g transform="translate(${x},${y})">
    <path d="M-10,8 L-10,-10 Q-10,-16 -6,-16 L-6,-22 Q-6,-26 -3,-26 Q0,-26 0,-22 L0,-24 Q0,-28 3,-28 Q6,-28 6,-24 L6,-21 Q6,-25 9,-25 Q12,-25 12,-21 L12,8 Q12,14 1,14 Q-10,14 -10,8 Z" fill="${skin}" stroke="${darker(skin)}" stroke-width="2"/>
  </g>`;
}

/* a seated figure: lotus seat, crossed legs, body, neck, head; the
   caller adds head-wear, face details and what the hands hold */
function seated({ skin, cloth, clothDark, belly = false, lotus = "#f2a7bd" }) {
  let b = "";
  /* lotus seat */
  for (let i = -4; i <= 4; i++) {
    b += `<ellipse cx="${CX + i * 34}" cy="${438}" rx="24" ry="40" transform="rotate(${i * 12} ${CX + i * 34} 470)" fill="${lotus}" stroke="${darker(lotus, 0.75)}" stroke-width="1.5"/>`;
  }
  b += `<ellipse cx="${CX}" cy="${452}" rx="150" ry="22" fill="${darker(lotus, 0.9)}" stroke="${darker(lotus, 0.7)}" stroke-width="1.5"/>`;
  /* crossed legs */
  b += `<path d="M${CX - 118},${418} Q${CX - 120},${372} ${CX - 60},${364} L${CX + 60},${364} Q${CX + 120},${372} ${CX + 118},${418} Q${CX},${440} ${CX - 118},${418} Z" fill="${cloth}" stroke="${clothDark}" stroke-width="2"/>`;
  b += `<path d="M${CX - 90},${410} Q${CX},${392} ${CX + 90},${410}" fill="none" stroke="${clothDark}" stroke-width="2"/>`;
  /* feet */
  b += `<ellipse cx="${CX - 52}" cy="${404}" rx="16" ry="8" fill="${skin}" stroke="${darker(skin)}" stroke-width="2"/>`;
  b += `<ellipse cx="${CX + 52}" cy="${404}" rx="16" ry="8" fill="${skin}" stroke="${darker(skin)}" stroke-width="2"/>`;
  /* body */
  if (belly) {
    b += `<path d="M${CX - 40},${226} Q${CX},${214} ${CX + 40},${226} Q${CX + 82},${300} ${CX + 52},${360} L${CX - 52},${360} Q${CX - 82},${300} ${CX - 40},${226} Z" fill="${skin}" stroke="${darker(skin)}" stroke-width="2"/>`;
  } else {
    b += `<path d="M${CX - 40},${226} Q${CX},${214} ${CX + 40},${226} L${CX + 32},${330} L${CX - 32},${330} Z" fill="${skin}" stroke="${darker(skin)}" stroke-width="2"/>`;
  }
  /* waist cloth */
  b += `<path d="M${CX - (belly ? 56 : 36)},${belly ? 338 : 322} Q${CX},${belly ? 352 : 336} ${CX + (belly ? 56 : 36)},${belly ? 338 : 322} L${CX + 62},${368} L${CX - 62},${368} Z" fill="${cloth}" stroke="${clothDark}" stroke-width="2"/>`;
  /* necklace */
  b += `<path d="M${CX - 24},${226} Q${CX},${258} ${CX + 24},${226}" fill="none" stroke="${GOLD}" stroke-width="4"/>`;
  /* neck */
  b += `<rect x="${CX - 11}" y="${196}" width="22" height="30" fill="${skin}" stroke="${darker(skin)}" stroke-width="2"/>`;
  return b;
}

/* a calm face, eyes half closed */
const face = (x, y, skin, r = 32) => `
  <circle cx="${x}" cy="${y}" r="${r}" fill="${skin}" stroke="${darker(skin)}" stroke-width="2"/>
  <path d="M${x - r * 0.45},${y - 2} q${r * 0.17},${r * 0.12} ${r * 0.34},0 M${x + r * 0.11},${y - 2} q${r * 0.17},${r * 0.12} ${r * 0.34},0" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>
  <path d="M${x - r * 0.25},${y + r * 0.42} q${r * 0.25},${r * 0.18} ${r * 0.5},0" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="${x}" cy="${y - r * 0.38}" r="2.6" fill="#c0392b"/>`;

const crown = (x, y, s = 1) => `<path transform="translate(${x},${y}) scale(${s})" d="M-28,0 L-24,-40 L-12,-26 L0,-54 L12,-26 L24,-40 L28,0 Z" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="2"/><circle transform="translate(${x},${y}) scale(${s})" cx="0" cy="-16" r="5" fill="#c0392b"/>`;
const halo = (x, y, r = 78) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fbf0c9" stroke="#efd88a" stroke-width="3"/>`;

/* ---------------- The things they hold ---------------- */

const SYM = {
  /* discus: a spinning wheel with spokes */
  chakra: (x, y) => {
    let s = `<g transform="translate(${x},${y - 26})"><circle r="22" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="2"/><circle r="15" fill="#fff6d8" stroke="${GOLD_D}" stroke-width="1.5"/>`;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += `<line x1="0" y1="0" x2="${r1(15 * Math.cos(a))}" y2="${r1(15 * Math.sin(a))}" stroke="${GOLD_D}" stroke-width="2"/>`; }
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; s += `<path d="M${r1(22 * Math.cos(a - 0.12))},${r1(22 * Math.sin(a - 0.12))} L${r1(28 * Math.cos(a))},${r1(28 * Math.sin(a))} L${r1(22 * Math.cos(a + 0.12))},${r1(22 * Math.sin(a + 0.12))}" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="1"/>`; }
    return s + `<circle r="4" fill="${GOLD_D}"/></g>`;
  },
  /* conch: a spiral shell */
  conch: (x, y) => `<g transform="translate(${x + 4},${y - 22}) rotate(-20)">
      <path d="M-14,18 Q-22,-4 -6,-24 Q4,-34 14,-22 Q24,-8 12,10 Q4,22 -14,18 Z" fill="#fffaf0" stroke="#8a7a62" stroke-width="2"/>
      <path d="M-6,-24 Q8,-14 2,0 Q-4,10 -14,18" fill="none" stroke="#8a7a62" stroke-width="1.6"/>
      <path d="M4,-28 Q14,-18 10,-6" fill="none" stroke="#8a7a62" stroke-width="1.4"/>
      <path d="M-14,18 L-20,26 L-10,22 Z" fill="#fffaf0" stroke="#8a7a62" stroke-width="1.6"/></g>`,
  /* mace: a long handle with a heavy round head */
  gada: (x, y) => `<g><line x1="${x + 6}" y1="${y + 34}" x2="${x - 10}" y2="${y - 52}" stroke="${GOLD_D}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${x - 13}" cy="${y - 66}" r="17" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="2"/>
      <path d="M${x - 28},${y - 66} h30 M${x - 13},${y - 81} v30" stroke="${GOLD_D}" stroke-width="1.5"/></g>`,
  /* lotus flower on a short stem */
  lotus: (x, y, c = "#f2a7bd") => {
    const cd = darker(c, 0.75);
    return `<g transform="translate(${x},${y - 30})"><line x1="0" y1="30" x2="0" y2="4" stroke="#4f8a3c" stroke-width="3"/>
      <ellipse cx="-11" cy="-2" rx="7" ry="15" transform="rotate(-35 -11 -2)" fill="${c}" stroke="${cd}" stroke-width="1.5"/>
      <ellipse cx="11" cy="-2" rx="7" ry="15" transform="rotate(35 11 -2)" fill="${c}" stroke="${cd}" stroke-width="1.5"/>
      <ellipse cx="-5" cy="-6" rx="7" ry="16" transform="rotate(-12 -5 -6)" fill="${c}" stroke="${cd}" stroke-width="1.5"/>
      <ellipse cx="5" cy="-6" rx="7" ry="16" transform="rotate(12 5 -6)" fill="${c}" stroke="${cd}" stroke-width="1.5"/>
      <ellipse cx="0" cy="-9" rx="6.5" ry="17" fill="${c}" stroke="${cd}" stroke-width="1.5"/></g>`;
  },
  /* the Vedas: a book of palm-leaf pages */
  book: (x, y) => `<g transform="translate(${x},${y - 18})"><rect x="-26" y="-12" width="52" height="22" rx="3" fill="#c8874a" stroke="#7a4a1e" stroke-width="2"/>
      <line x1="-22" y1="-5" x2="22" y2="-5" stroke="#7a4a1e" stroke-width="1.2"/><line x1="-22" y1="1" x2="22" y2="1" stroke="#7a4a1e" stroke-width="1.2"/>
      <line x1="-22" y1="6" x2="22" y2="6" stroke="#7a4a1e" stroke-width="1.2"/><line x1="0" y1="-14" x2="0" y2="12" stroke="#c0392b" stroke-width="2"/></g>`,
  /* water pot (kamandalu) */
  pot: (x, y) => `<g transform="translate(${x},${y + 4})"><path d="M-16,-4 Q-20,18 0,22 Q20,18 16,-4 Q10,-12 0,-12 Q-10,-12 -16,-4 Z" fill="#c77a3a" stroke="#7a4a1e" stroke-width="2"/>
      <path d="M-6,-12 L-6,-20 L6,-20 L6,-12" fill="#c77a3a" stroke="#7a4a1e" stroke-width="2"/>
      <path d="M14,-2 Q28,-6 30,-16" fill="none" stroke="#7a4a1e" stroke-width="3"/>
      <path d="M32,-14 q2,6 0,10 M36,-10 q2,6 0,10" fill="none" stroke="#4a90c8" stroke-width="2" stroke-linecap="round"/></g>`,
  /* prayer beads (mala) hanging from the hand */
  mala: (x, y) => {
    let s = "";
    for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 16; s += `<circle cx="${r1(x + 20 * Math.cos(a))}" cy="${r1(y + 22 + 22 * Math.sin(a))}" r="3.6" fill="#7a4a1e"/>`; }
    return s;
  },
  /* trident: a tall staff with three prongs (the drum hangs from it) */
  trishul: (x, y, len = 150) => `<g><line x1="${x}" y1="${y + len}" x2="${x}" y2="${y - 96}" stroke="#6b6f76" stroke-width="5" stroke-linecap="round"/>
      <path d="M${x - 24},${y - 120} Q${x - 26},${y - 92} ${x},${y - 88} Q${x + 26},${y - 92} ${x + 24},${y - 120}" fill="none" stroke="#6b6f76" stroke-width="5" stroke-linecap="round"/>
      <path d="M${x},${y - 88} L${x},${y - 132}" stroke="#6b6f76" stroke-width="5" stroke-linecap="round"/>
      <path d="M${x - 24},${y - 120} l-5,6 M${x + 24},${y - 120} l5,6 M${x},${y - 132} l-5,8 M${x},${y - 132} l5,8" stroke="#6b6f76" stroke-width="3"/></g>`,
  /* hand drum (damaru), shaped like an hourglass */
  damaru: (x, y) => `<g transform="translate(${x},${y - 30})"><path d="M-16,-20 L16,-20 L3,0 L16,20 L-16,20 L-3,0 Z" fill="#c8874a" stroke="#7a4a1e" stroke-width="2"/>
      <line x1="-16" y1="-20" x2="16" y2="-20" stroke="#7a4a1e" stroke-width="4"/><line x1="-16" y1="20" x2="16" y2="20" stroke="#7a4a1e" stroke-width="4"/>
      <path d="M-3,0 q-12,4 -16,14 M3,0 q12,4 16,14" fill="none" stroke="#7a4a1e" stroke-width="1.5"/>
      <circle cx="-19" cy="15" r="3" fill="#7a4a1e"/><circle cx="19" cy="15" r="3" fill="#7a4a1e"/></g>`,
  /* axe */
  axe: (x, y) => `<g><line x1="${x}" y1="${y + 30}" x2="${x}" y2="${y - 62}" stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"/>
      <path d="M${x},${y - 58} L${x - 30},${y - 72} Q${x - 40},${y - 52} ${x - 30},${y - 32} L${x},${y - 44} Z" fill="#b8bec6" stroke="#5f656d" stroke-width="2"/></g>`,
  /* noose: a loop of rope */
  noose: (x, y) => `<g fill="none" stroke="#b07a2e" stroke-width="4" stroke-linecap="round">
      <path d="M${x},${y - 6} Q${x + 6},${y - 30} ${x + 2},${y - 44}"/>
      <ellipse cx="${x + 4}" cy="${y - 66}" rx="18" ry="22"/>
      <path d="M${x - 2},${y + 6} q-6,14 2,24"/></g>`,
  /* a bowl of round sweets (modaks / laddoos) */
  modaks: (x, y) => `<g transform="translate(${x},${y})"><path d="M-30,-6 Q-28,16 0,18 Q28,16 30,-6 Z" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="2"/>
      ${[-18, -6, 6, 18].map(dx => `<path d="M${dx - 8},-6 Q${dx},${-26} ${dx + 8},-6 Z" fill="#f6d98a" stroke="#b5892a" stroke-width="1.5"/>`).join("")}
      <path d="M-6,-18 Q0,-36 6,-18 Z" fill="#f6d98a" stroke="#b5892a" stroke-width="1.5"/></g>`,
  /* gold coins pouring from the hand */
  coins: (x, y) => [[0, 22], [-8, 42], [6, 60], [-4, 80], [8, 98], [-10, 104]].map(([dx, dy]) =>
      `<ellipse cx="${x + dx}" cy="${y + dy}" rx="8" ry="6" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="1.8"/>`).join("")
};

/* ---------------- Animals ---------------- */

const swan = (x, y) => `<g transform="translate(${x},${y})">
    <path d="M-40,10 Q-44,-14 -14,-12 L22,-10 Q40,-10 44,6 Q30,24 0,24 Q-30,24 -40,10 Z" fill="#ffffff" stroke="#6b6f76" stroke-width="2"/>
    <path d="M-12,-6 Q4,-22 -4,-12" fill="none" stroke="#b0b6bd" stroke-width="2"/>
    <path d="M30,-8 Q52,-30 36,-50 Q24,-66 42,-70" fill="none" stroke="#6b6f76" stroke-width="12" stroke-linecap="round"/>
    <path d="M30,-8 Q52,-30 36,-50 Q24,-66 42,-70" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
    <path d="M46,-74 L60,-70 L46,-66 Z" fill="#e38b2c"/><circle cx="41" cy="-72" r="1.8" fill="${INK}"/></g>`;

const mouse = (x, y) => `<g transform="translate(${x},${y})">
    <path d="M-34,10 Q-30,-18 2,-18 Q24,-18 34,4 Q20,14 -34,10 Z" fill="#9a8f86" stroke="#5c534c" stroke-width="2"/>
    <circle cx="20" cy="-14" r="9" fill="#b3a79d" stroke="#5c534c" stroke-width="2"/>
    <circle cx="30" cy="0" r="1.8" fill="${INK}"/><circle cx="37" cy="4" r="2.4" fill="#e09a9a"/>
    <path d="M-34,8 Q-56,6 -60,-10" fill="none" stroke="#5c534c" stroke-width="2"/>
    <path d="M-12,12 v6 M10,12 v6" stroke="#5c534c" stroke-width="2"/>
    <path d="M42,-2 Q48,-16 54,-2 Z" fill="#f6d98a" stroke="#b5892a" stroke-width="1.5"/></g>`;

const owl = (x, y) => `<g transform="translate(${x},${y})">
    <ellipse cx="0" cy="0" rx="20" ry="26" fill="#c9a47a" stroke="#6e5232" stroke-width="2"/>
    <path d="M-16,-20 L-12,-34 L-4,-24 M16,-20 L12,-34 L4,-24" fill="#c9a47a" stroke="#6e5232" stroke-width="2"/>
    <circle cx="-8" cy="-10" r="7" fill="#fff" stroke="#6e5232" stroke-width="1.5"/><circle cx="8" cy="-10" r="7" fill="#fff" stroke="#6e5232" stroke-width="1.5"/>
    <circle cx="-8" cy="-10" r="3" fill="${INK}"/><circle cx="8" cy="-10" r="3" fill="${INK}"/>
    <path d="M-3,-2 L0,4 L3,-2 Z" fill="#e38b2c"/>
    <path d="M-10,8 q10,6 20,0 M-10,14 q10,6 20,0" fill="none" stroke="#6e5232" stroke-width="1.4"/></g>`;

/* a small elephant pouring water from its trunk; flip = facing left */
const elephant = (x, y, flip = false) => `<g transform="translate(${x},${y}) scale(${flip ? -1 : 1},1)">
    <ellipse cx="0" cy="0" rx="30" ry="20" fill="#a7adb5" stroke="#5f656d" stroke-width="2"/>
    <circle cx="28" cy="-10" r="15" fill="#a7adb5" stroke="#5f656d" stroke-width="2"/>
    <ellipse cx="20" cy="-8" rx="9" ry="12" fill="#959ba3" stroke="#5f656d" stroke-width="1.5"/>
    <path d="M40,-6 Q52,-14 50,-34" fill="none" stroke="#5f656d" stroke-width="9" stroke-linecap="round"/>
    <path d="M40,-6 Q52,-14 50,-34" fill="none" stroke="#a7adb5" stroke-width="6" stroke-linecap="round"/>
    <path d="M52,-38 q8,10 6,26 M48,-40 q14,4 18,22" fill="none" stroke="#4a90c8" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32" cy="-14" r="1.8" fill="${INK}"/>
    <path d="M-18,16 v12 M-4,18 v12 M10,18 v12 M22,14 v12" stroke="#5f656d" stroke-width="6" stroke-linecap="round"/></g>`;

const files = {};

/* ---------------- Brahma: the creator ---------------- */
{
  const skin = "#e7b07a", cloth = "#e6a23c", clothDark = "#a86a14";
  let b = halo(CX, 160, 92);
  /* the back two arms go behind the body */
  b += limb(ARM_PATH.ul, skin) + limb(ARM_PATH.ur, skin);
  b += seated({ skin, cloth, clothDark });
  b += limb(ARM_PATH.ll, skin) + limb(ARM_PATH.lr, skin);
  /* four heads (three seen; the fourth faces away) */
  b += face(CX - 40, 168, skin, 25) + crown(CX - 40, 146, 0.62);
  b += face(CX + 40, 168, skin, 25) + crown(CX + 40, 146, 0.62);
  b += face(CX, 160, skin, 30) + crown(CX, 132, 0.9);
  /* white beard */
  b += `<path d="M${CX - 22},${176} Q${CX},${222} ${CX + 22},${176} Q${CX},${190} ${CX - 22},${176} Z" fill="#fafafa" stroke="#9aa0a6" stroke-width="1.5"/>`;
  b += `<path d="M${CX - 52},${184} Q${CX - 40},${206} ${CX - 28},${184} Z M${CX + 28},${184} Q${CX + 40},${206} ${CX + 52},${184} Z" fill="#fafafa" stroke="#9aa0a6" stroke-width="1.5"/>`;
  b += SYM.book(...HANDS.ul) + hand(...HANDS.ul, skin);
  b += SYM.mala(...HANDS.ur) + hand(...HANDS.ur, skin);
  b += SYM.pot(HANDS.ll[0] - 4, HANDS.ll[1] + 4) + hand(...HANDS.ll, skin);
  b += SYM.lotus(...HANDS.lr) + hand(...HANDS.lr, skin);
  b += swan(CX + 190, 440);
  b += label("four-heads", "Four heads", [CX - 58, 150], [LX, 92]);
  b += label("vedas", "The Vedas (book)", [HANDS.ul[0] - 14, HANDS.ul[1] - 22], [LX, 196]);
  b += label("kamandalu", "Water pot", [HANDS.ll[0] - 14, HANDS.ll[1] + 14], [LX, 330]);
  b += label("beard", "White beard", [CX, 200], [RX, 92]);
  b += label("mala", "Prayer beads", [HANDS.ur[0] + 18, HANDS.ur[1] + 30], [RX, 212]);
  b += label("lotus", "Lotus flower", [HANDS.lr[0] + 10, HANDS.lr[1] - 44], [RX, 300]);
  b += label("swan", "Swan", [CX + 194, 448], [RX + 40, 340]);
  files.brahma = svg(b);
}

/* ---------------- Vishnu: the preserver ---------------- */
{
  const skin = "#5b8fd0", cloth = "#f1c232", clothDark = "#a8840e";
  let b = halo(CX, 160);
  b += limb(ARM_PATH.ul, skin) + limb(ARM_PATH.ur, skin);
  b += seated({ skin, cloth, clothDark });
  b += limb(ARM_PATH.ll, skin) + limb(ARM_PATH.lr, skin);
  b += face(CX, 164, skin) + crown(CX, 136);
  b += SYM.chakra(...HANDS.ul) + hand(...HANDS.ul, skin);
  b += SYM.conch(...HANDS.ur) + hand(...HANDS.ur, skin);
  b += SYM.gada(...HANDS.ll) + hand(...HANDS.ll, skin);
  b += SYM.lotus(...HANDS.lr) + hand(...HANDS.lr, skin);
  b += label("crown", "Crown", [CX + 12, 108], [RX, 70]);
  b += label("blue-skin", "Blue skin", [CX + 18, 270], [RX, 380]);
  b += label("four-arms", "Four arms", [CX - 104, 226], [LX, 262]);
  b += label("chakra", "Discus (chakra)", [HANDS.ul[0] - 22, HANDS.ul[1] - 30], [LX, 110]);
  b += label("conch", "Conch shell", [HANDS.ur[0] + 18, HANDS.ur[1] - 30], [RX, 150]);
  b += label("gada", "Mace (gada)", [HANDS.ll[0] - 26, HANDS.ll[1] - 66], [LX, 352]);
  b += label("lotus", "Lotus flower", [HANDS.lr[0] + 10, HANDS.lr[1] - 44], [RX, 262]);
  files.vishnu = svg(b);
}

/* ---------------- Shiva: the destroyer ---------------- */
{
  const skin = "#8fa9c2", cloth = "#e39a3b", clothDark = "#8a5a14";
  let b = halo(CX, 160);
  b += SYM.trishul(...HANDS.ur);
  b += limb(ARM_PATH.ul, skin) + limb(ARM_PATH.ur, skin);
  b += seated({ skin, cloth, clothDark, lotus: "#d9d2c3" });
  /* tiger-skin stripes on the cloth */
  for (const [x, y] of [[-80, 392], [-40, 384], [30, 386], [76, 394], [-14, 350], [24, 352]]) b += `<path d="M${CX + x},${y} q6,-6 12,0" fill="none" stroke="#5a3a10" stroke-width="3" stroke-linecap="round"/>`;
  b += limb(ARM_PATH.ll, skin) + limb(ARM_PATH.lr, skin);
  /* blue throat */
  b += `<rect x="${CX - 11}" y="${198}" width="22" height="22" fill="#2f4f9a"/>`;
  /* hair piled up in a knot, the Ganges flowing from it, the moon in it */
  b += `<path d="M${CX - 32},${150} Q${CX - 40},${92} ${CX},${86} Q${CX + 40},${92} ${CX + 32},${150} Z" fill="#3a2a1f" stroke="#1f1610" stroke-width="2"/>`;
  b += `<ellipse cx="${CX}" cy="${84}" rx="20" ry="16" fill="#3a2a1f" stroke="#1f1610" stroke-width="2"/>`;
  b += `<path d="M${CX + 4},${70} Q${CX + 10},${40} ${CX + 34},${30} M${CX + 8},${70} Q${CX + 30},${52} ${CX + 52},${56} M${CX},${70} Q${CX - 2},${46} ${CX + 18},${26}" fill="none" stroke="#4a90c8" stroke-width="3" stroke-linecap="round"/>`;
  b += `<path d="M${CX - 34},${100} A14,14 0 1,0 ${CX - 14},${80} A10,10 0 1,1 ${CX - 34},${100} Z" fill="#fff6c8" stroke="#c9a92e" stroke-width="1.5"/>`;
  b += face(CX, 164, skin);
  /* third eye */
  b += `<ellipse cx="${CX}" cy="${146}" rx="3.5" ry="7" fill="#fff" stroke="${LINE}" stroke-width="1.5"/><circle cx="${CX}" cy="${146}" r="2" fill="${LINE}"/>`;
  b += `<path d="M${CX - 14},${138} h28 M${CX - 14},${134} h28" stroke="#ffffff" stroke-width="2" opacity="0.8"/>`;
  /* snake round the neck, its hood raised over the shoulder */
  b += `<path d="M${CX - 30},${214} Q${CX},${246} ${CX + 30},${214} Q${CX + 44},${200} ${CX + 52},${176}" fill="none" stroke="#2e7d32" stroke-width="7" stroke-linecap="round"/>`;
  b += `<path d="M${CX + 52},${178} Q${CX + 40},${160} ${CX + 52},${150} Q${CX + 64},${160} ${CX + 52},${178} Z" fill="#3c9a40" stroke="#1d5a20" stroke-width="2"/><circle cx="${CX + 50}" cy="${158}" r="1.6" fill="${INK}"/><circle cx="${CX + 55}" cy="${158}" r="1.6" fill="${INK}"/>`;
  b += SYM.damaru(...HANDS.ul) + hand(...HANDS.ul, skin);
  b += hand(...HANDS.ur, skin);
  b += blessingHand(skin);
  b += hand(...HANDS.ll, skin);
  b += label("ganga", "River Ganges", [CX + 40, 44], [RX - 20, 30]);
  b += label("moon", "Crescent moon", [CX - 28, 88], [LX, 50]);
  b += label("third-eye", "Third eye", [CX, 146], [LX + 10, 104]);
  b += label("damaru", "Drum (damaru)", [HANDS.ul[0] - 16, HANDS.ul[1] - 30], [LX, 230]);
  b += label("blue-throat", "Blue throat", [CX - 8, 212], [LX, 300]);
  b += label("trishul", "Trident (trishul)", [HANDS.ur[0] + 24, HANDS.ur[1] - 118], [RX, 100]);
  b += label("snake", "Snake", [CX + 62, 162], [RX, 200]);
  b += label("blessing", "Raised hand", [HANDS.lr[0] + 12, HANDS.lr[1] - 10], [RX, 330]);
  files.shiva = svg(b);
}

/* ---------------- Ganesha: remover of obstacles ---------------- */
{
  const skin = "#ee9a6a", cloth = "#d94a3a", clothDark = "#8a2418";
  let b = halo(CX, 152, 84);
  b += limb(ARM_PATH.ul, skin) + limb(ARM_PATH.ur, skin);
  b += seated({ skin, cloth, clothDark, belly: true });
  b += limb(ARM_PATH.ll, skin) + limb(ARM_PATH.lr, skin);
  /* big ears */
  b += `<path d="M${CX - 30},${130} Q${CX - 92},${104} ${CX - 86},${170} Q${CX - 80},${206} ${CX - 30},${190} Z" fill="${darker(skin, 0.9)}" stroke="${darker(skin)}" stroke-width="2"/>`;
  b += `<path d="M${CX + 30},${130} Q${CX + 92},${104} ${CX + 86},${170} Q${CX + 80},${206} ${CX + 30},${190} Z" fill="${darker(skin, 0.9)}" stroke="${darker(skin)}" stroke-width="2"/>`;
  /* elephant head */
  b += `<ellipse cx="${CX}" cy="${156}" rx="38" ry="40" fill="${skin}" stroke="${darker(skin)}" stroke-width="2"/>`;
  b += `<path d="M${CX - 24},${150} q6,4 12,0 M${CX + 12},${150} q6,4 12,0" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round"/>`;
  b += `<path d="M${CX - 16},${124} h32" stroke="#c0392b" stroke-width="3"/><circle cx="${CX}" cy="${132}" r="3" fill="#c0392b"/>`;
  /* trunk curling to his left, to the sweets */
  b += `<path d="M${CX},${176} Q${CX + 4},${226} ${CX - 22},${250} Q${CX - 44},${262} ${CX - 50},${246}" fill="none" stroke="${darker(skin)}" stroke-width="22" stroke-linecap="round"/>`;
  b += `<path d="M${CX},${176} Q${CX + 4},${226} ${CX - 22},${250} Q${CX - 44},${262} ${CX - 50},${246}" fill="none" stroke="${skin}" stroke-width="18" stroke-linecap="round"/>`;
  b += crown(CX, 120, 0.85);
  /* one whole tusk, one broken */
  b += `<path d="M${CX + 11},${180} Q${CX + 46},${196} ${CX + 48},${232} Q${CX + 32},${208} ${CX + 11},${196} Z" fill="#fffaf0" stroke="#8a7a62" stroke-width="1.8"/>`;
  b += `<path d="M${CX - 11},${180} Q${CX - 34},${186} ${CX - 40},${204} L${CX - 26},${208} Q${CX - 22},${198} ${CX - 11},${196} Z" fill="#fffaf0" stroke="#8a7a62" stroke-width="1.8"/>`;
  b += SYM.axe(...HANDS.ul) + hand(...HANDS.ul, skin);
  b += SYM.noose(...HANDS.ur) + hand(...HANDS.ur, skin);
  b += SYM.modaks(HANDS.ll[0] + 6, HANDS.ll[1] + 4) + hand(...HANDS.ll, skin);
  b += blessingHand(skin);
  b += mouse(CX + 214, 446);
  b += label("axe", "Axe", [HANDS.ul[0] - 26, HANDS.ul[1] - 56], [LX, 80]);
  b += label("ears", "Big ears", [CX - 72, 150], [LX, 180]);
  b += label("modaks", "Sweets (modaks)", [HANDS.ll[0] - 12, HANDS.ll[1] - 10], [LX, 380]);
  b += label("tusk", "Broken tusk", [CX - 32, 200], [LX, 274]);
  b += label("head", "Elephant head", [CX + 22, 140], [RX, 62]);
  b += label("noose", "Rope (noose)", [HANDS.ur[0] + 22, HANDS.ur[1] - 66], [RX, 128]);
  b += label("belly", "Big belly", [CX + 50, 300], [RX, 240]);
  b += label("mouse", "Mouse", [CX + 200, 436], [RX + 20, 370]);
  files.ganesha = svg(b);
}

/* ---------------- Lakshmi: wealth and good fortune ---------------- */
{
  const skin = "#f0c08f", cloth = "#c62f3a", clothDark = "#7a1620";
  let b = halo(CX, 160);
  b += elephant(LX + 4, 70) + elephant(RX - 4, 70, true);
  b += limb(ARM_PATH.ul, skin) + limb(ARM_PATH.ur, skin);
  b += seated({ skin, cloth, clothDark });
  /* red sari over the shoulder */
  b += `<path d="M${CX - 40},${228} L${CX + 30},${330} L${CX + 6},${332} L${CX - 40},${256} Z" fill="${cloth}" stroke="${clothDark}" stroke-width="2"/>`;
  b += limb(ARM_PATH.ll, skin) + limb(ARM_PATH.lr, skin);
  /* long dark hair behind the head */
  b += `<path d="M${CX - 34},${150} Q${CX - 44},${210} ${CX - 30},${232} L${CX + 30},${232} Q${CX + 44},${210} ${CX + 34},${150} Z" fill="#2b1d14"/>`;
  b += face(CX, 164, skin) + crown(CX, 138);
  b += SYM.lotus(...HANDS.ul) + hand(...HANDS.ul, skin);
  b += SYM.lotus(...HANDS.ur) + hand(...HANDS.ur, skin);
  b += hand(...HANDS.ll, skin) + SYM.coins(...HANDS.ll);
  b += blessingHand(skin);
  b += owl(CX - 220, 432);
  b += label("elephants", "Elephants", [RX - 30, 70], [RX - 30, 140]);
  b += label("lotus", "Lotus flowers", [HANDS.ul[0] - 12, HANDS.ul[1] - 48], [LX, 196]);
  b += label("four-arms", "Four arms", [CX + 104, 226], [RX, 220]);
  b += label("coins", "Gold coins", [HANDS.ll[0] - 10, HANDS.ll[1] + 60], [LX, 330]);
  b += label("blessing", "Raised hand", [HANDS.lr[0] + 12, HANDS.lr[1] - 10], [RX, 300]);
  b += label("red-sari", "Red sari", [CX + 18, 300], [RX, 380]);
  b += label("owl", "Owl", [CX - 220, 410], [LX - 30, 380]);
  files.lakshmi = svg(b);
}

/* ---------------- The Trimurti: three roles of the one God ---------------- */
{
  let b = "";
  const box = (x, name, role, col, sym) => `
    <rect x="${x - 95}" y="150" width="190" height="200" rx="14" fill="${col}" stroke="${darker(col, 0.7)}" stroke-width="2"/>
    ${sym}
    <text x="${x}" y="300" text-anchor="middle" font-size="20" font-weight="700">${name}</text>
    <text x="${x}" y="326" text-anchor="middle" class="cap" font-size="14">${role}</text>`;
  b += `<circle cx="${CX}" cy="64" r="44" fill="#fbf0c9" stroke="#e3b23c" stroke-width="3"/>`;
  b += `<text x="${CX}" y="60" text-anchor="middle" font-size="18" font-weight="700">Brahman</text><text x="${CX}" y="80" text-anchor="middle" class="cap">the one God</text>`;
  for (const x of [CX - 210, CX, CX + 210]) b += `<line x1="${CX}" y1="108" x2="${x}" y2="150" stroke="#a87a14" stroke-width="2.5"/>`;
  b += box(CX - 210, "Brahma", "creates", "#fbe3c4", `<g transform="translate(${CX - 210},236) scale(1.6) translate(${-(CX - 210)},-236)">${SYM.lotus(CX - 210, 262)}</g>`);
  b += box(CX, "Vishnu", "keeps safe", "#d9e6f7", SYM.chakra(CX, 256));
  b += box(CX + 210, "Shiva", "destroys", "#e3e8ee", SYM.trishul(CX + 210, 300, -20));
  b += `<text x="${CX - 210}" y="384" text-anchor="middle" font-size="16" font-weight="700">the creator</text>`;
  b += `<text x="${CX}" y="384" text-anchor="middle" font-size="16" font-weight="700">the preserver</text>`;
  b += `<text x="${CX + 210}" y="384" text-anchor="middle" font-size="16" font-weight="700">the destroyer</text>`;
  b += `<path d="M${CX - 160},${450} Q${CX},${490} ${CX + 160},${450}" fill="none" stroke="#a87a14" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#arr)"/>`;
  b += `<defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#a87a14"/></marker></defs>`;
  b += `<text x="${CX}" y="440" text-anchor="middle" class="cap" font-size="13">a never-ending cycle: create → keep → destroy → create again</text>`;
  files.trimurti = svg(b, W, 490);
}

for (const [name, text] of Object.entries(files)) writeFileSync(join(OUT, `${name}.svg`), text);
console.log(`Wrote ${Object.keys(files).length} pictures to ${OUT}`);
