/* =========================================================
   Tests for Year 7 geography revision:
     js/core/geog-match.js   (grid references, compass directions)
     js/gen/geog.js          (map question generators)
     data/content/secondary/geography.json (+ its diagrams)
   Usage: node tools/test-geog.mjs
   ========================================================= */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkGeog, canonDirection } from "../js/core/geog-match.js";
import { GEO_GENERATORS, DIRECTIONS } from "../js/gen/geog.js";
import { normaliseText } from "../js/core/utils.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "content", "secondary");
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; if (fail < 60) console.log("✗", msg); } };

/* the trainer's word matcher, simplified: exact after normalising */
const canon = s => normaliseText(s).replace(/^(the|a|an) /, "").trim();
const wordRight = (q, typed) => [q.answer, ...(q.accept || [])].map(canon).includes(canon(typed));

function checkQuestion(q, where) {
  ok(q.stem && q.explain, `${where}: needs stem and explain`);
  if (q.type === "tf") { ok(typeof q.answer === "boolean", `${where}: tf answer must be true/false`); return; }
  ok(typeof q.answer === "string" && q.answer, `${where}: answer must be a string`);
  ok(Array.isArray(q.choices) && q.choices.length === 3, `${where}: needs 3 choices (${q.choices})`);
  ok(new Set(q.choices).size === q.choices.length && !q.choices.includes(q.answer), `${where}: choices must be distinct and wrong: ${q.choices}`);
  if (q.type !== "short") return;
  if (q.match) {
    ok(checkGeog(q, q.answer)?.ok === true, `${where}: own answer "${q.answer}" not accepted`);
    q.choices.forEach(c => ok(checkGeog(q, c)?.ok === false, `${where}: wrong choice "${c}" marked right (answer ${q.answer})`));
  } else {
    ok(checkGeog(q, q.answer) === null, `${where}: word answer should fall through to the word matcher`);
    q.choices.forEach(c => ok(!wordRight(q, c), `${where}: choice "${c}" matches the answer`));
  }
  if (q.match === "dir") ok(DIRECTIONS.includes(q.answer), `${where}: direction answer must be one of the 8 (${q.answer})`);
}

/* 1. The bank and its diagrams */
const bank = JSON.parse(readFileSync(join(ROOT, "geography.json"), "utf8"));
const ids = new Set();
const svgs = {};
const svgOf = file => (svgs[file] ??= existsSync(join(ROOT, "geography", `${file}.svg`)) ? readFileSync(join(ROOT, "geography", `${file}.svg`), "utf8") : null);
for (const t of bank.topics) {
  ok(t.id && t.title && t.summary && Array.isArray(t.images) && t.facts?.length && t.keywords?.length, `topic ${t.id}: fields`);
  t.images.forEach(im => ok(svgOf(im.file), `${t.id}: missing diagram ${im.file}.svg`));
  for (const q of t.questions) {
    ok(!ids.has(q.id), `duplicate id ${q.id}`);
    ids.add(q.id);
    if (q.gen) { ok(GEO_GENERATORS[q.gen], `${q.id}: unknown generator ${q.gen}`); continue; }
    if (q.image) {
      ok(svgOf(q.image)?.includes(`data-part="${q.part}"`), `${q.id}: ${q.image}.svg has no part "${q.part}"`);
      ok(q.stem.includes("{L}"), `${q.id}: diagram question needs {L}`);
    }
    checkQuestion(q, q.id);
  }
}

/* 1b. The trainer forgives spelling slips (1 letter, 2 in long answers). A
   wrong answer that close to the right one — another answer in the bank,
   or a choice — must be listed in choices or reject, or it would count. */
function lev(a, b) {
  const p = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let l = p[0]; p[0] = i;
    for (let j = 1; j <= b.length; j++) { const t = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, l + (a[i - 1] === b[j - 1] ? 0 : 1)); l = t; }
  }
  return p[b.length];
}
const shorts = bank.topics.flatMap(t => t.questions).filter(q => q.type === "short" && !q.gen && !q.match);
const allAnswers = [...new Set(shorts.flatMap(q => [q.answer, ...q.choices]))];
for (const q of shorts) {
  const guarded = new Set([...q.choices, ...(q.reject || [])].map(canon));
  const targets = [q.answer, ...(q.accept || [])].map(canon);
  for (const wrong of allAnswers.map(canon)) {
    if (targets.includes(wrong) || guarded.has(wrong)) continue;
    const close = targets.some(t => { const n = t.length >= 10 ? 2 : t.length >= 5 ? 1 : 0; return n && lev(wrong, t) <= n; });
    ok(!close, `${q.id}: "${wrong}" is a slip away from "${q.answer}" — add it to reject`);
  }
}

/* 2. Every generator, many times */
for (const [name, gen] of Object.entries(GEO_GENERATORS)) {
  for (let i = 0; i < 400; i++) {
    const q = { type: "short", ...gen() };
    ok(/^<svg[\s\S]*<\/svg>$/.test(q.svg), `${name}: no map`);
    checkQuestion(q, `${name} "${q.stem}"`);
    if (q.match === "grid") ok(/^\d{4}$/.test(q.answer), `${name}: 4 figures (${q.answer})`);
    if (q.match === "grid6") ok(/^\d{6}$/.test(q.answer), `${name}: 6 figures (${q.answer})`);
    /* a feature asked about by its reference is the only one in that square / at that point */
    const ref = q.stem.match(/(\d{4,6})\?/)?.[1];
    if (ref) ok(q.svg.includes(`>${q.answer}<`), `${name}: the answer ${q.answer} is in the key`);
  }
}

/* 3. Marking rules */
const D = a => ({ type: "short", match: "dir", answer: a });
const G4 = a => ({ type: "short", match: "grid", answer: a });
const G6 = a => ({ type: "short", match: "grid6", answer: a });
const cases = [
  [D("north-east"), "NE", true], [D("north-east"), "north east", true], [D("north-east"), "Northeast", true],
  [D("north-east"), "N.E.", true], [D("north-east"), "north-east", true], [D("north-east"), "east-north", false],
  [D("north-east"), "south-west", false], [D("north-east"), "north", false], [D("west"), "W", true], [D("west"), "west ", true],
  [G4("2543"), "2543", true], [G4("2543"), "25 43", true], [G4("2543"), "4325", false], [G4("2543"), "254437", false],
  [G4("0599"), "0599", true], [G4("0599"), "599", false],
  [G6("254437"), "254437", true], [G6("254437"), "254 437", true], [G6("254437"), "255438", true], [G6("254437"), "253436", true],
  [G6("254437"), "256437", false], [G6("254437"), "437254", false], [G6("254437"), "2543", false],
  [G6("995003"), "004002", false], [G6("999003"), "000003", true]
];
cases.forEach(([q, typed, want]) => ok(checkGeog(q, typed).ok === want, `checkGeog(${q.match} "${q.answer}", "${typed}") should be ${want}`));
ok(/opposite/.test(checkGeog(D("north-east"), "SW").tip || ""), "opposite tip");
ok(/Eastings first/.test(checkGeog(G4("2543"), "4325").tip || ""), "eastings-first tip (4)");
ok(/Eastings first/.test(checkGeog(G6("254437"), "437254").tip || ""), "eastings-first tip (6)");
ok(/6 figures/.test(checkGeog(G6("254437"), "2543").tip || ""), "4-instead-of-6 tip");
ok(canonDirection("sw") === "south-west" && canonDirection("banana") === null, "canonDirection");
ok(checkGeog({ type: "short", answer: "Europe" }, "Europe") === null, "word answers fall through");

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
