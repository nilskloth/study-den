/* =========================================================
   Tests for Year 7 maths revision:
     js/core/maths-match.js  (marking typed answers)
     js/gen/ks3maths.js      (question generators)
     data/content/secondary/maths.json
   Usage: node tools/test-maths.mjs
   ========================================================= */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkMaths } from "../js/core/maths-match.js";
import { GENERATORS } from "../js/gen/ks3maths.js";

const FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "content", "secondary", "maths.json");
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; if (fail < 60) console.log("✗", msg); } };
const typedForm = s => String(s).replace(/−/g, "-").replace(/×/g, "x");

/* A question (hand-written or generated) is well-formed and marks its own answers right. */
function checkQuestion(q, where) {
  ok(q.stem && q.explain, `${where}: needs stem and explain`);
  if (q.type === "tf") { ok(typeof q.answer === "boolean", `${where}: tf answer must be true/false`); return; }
  ok(typeof q.answer === "string" && q.answer, `${where}: answer must be a string`);
  ok(Array.isArray(q.choices) && q.choices.length >= (q.type === "mcq" ? 2 : 3), `${where}: needs choices`);
  ok(new Set(q.choices).size === q.choices.length && !q.choices.includes(q.answer), `${where}: choices must be distinct and wrong: ${q.choices}`);
  if (q.type !== "short") return;
  ok(checkMaths(q, q.answer).ok, `${where}: own answer "${q.answer}" not accepted`);
  ok(checkMaths(q, typedForm(q.answer)).ok, `${where}: typed form "${typedForm(q.answer)}" not accepted`);
  (q.accept || []).forEach(a => ok(checkMaths(q, a).ok, `${where}: accept "${a}" not accepted`));
  q.choices.forEach(c => ok(!checkMaths(q, c).ok, `${where}: wrong choice "${c}" marked right (answer ${q.answer})`));
}

/* 1. The bank */
const bank = JSON.parse(readFileSync(FILE, "utf8"));
const ids = new Set();
for (const t of bank.topics) {
  ok(t.id && t.title && t.summary && Array.isArray(t.images) && t.facts?.length && t.keywords?.length, `topic ${t.id}: fields`);
  for (const q of t.questions) {
    ok(!ids.has(q.id), `duplicate id ${q.id}`);
    ids.add(q.id);
    if (q.gen) { ok(GENERATORS[q.gen], `${q.id}: unknown generator ${q.gen}`); continue; }
    checkQuestion(q, q.id);
  }
}

/* 2. Every generator, many times */
for (const [name, gen] of Object.entries(GENERATORS)) {
  for (let i = 0; i < 400; i++) {
    const q = { type: "short", ...gen() };
    checkQuestion(q, `${name} "${q.stem}"`);
  }
}

/* 3. Marking rules */
const Q = (answer, extra = {}) => ({ type: "short", answer, ...extra });
const cases = [
  [Q("−7"), "-7", true], [Q("−7"), "−7", true], [Q("−7"), "7", false], [Q("−7"), "– 7", true],
  [Q("3,040,006"), "3040006", true], [Q("3,040,006"), "3 040 006", true], [Q("3,040,006"), "304006", false],
  [Q("0.036"), ".036", true], [Q("0.5"), "0.50", true],
  [Q("8.0", { exact: true }), "8", false], [Q("8.0", { exact: true }), "8.0", true], [Q("8.0", { exact: true }), "80", false],
  [Q("5 °C"), "5", true], [Q("5 °C"), "5°C", true], [Q("5 °C"), "5 degrees", true], [Q("5 °C"), "-5", false],
  [Q("23 degrees"), "23", true], [Q("−£15"), "-15", true], [Q("−£15"), "£-15", true], [Q("−£15"), "15", false],
  [Q("−75 m"), "-75m", true], [Q("−75 m"), "-75 metres", true],
  [Q("1, 2, 3, 6, 9, 18", { match: "set" }), "18, 9, 6, 3, 2, 1", true],
  [Q("1, 2, 3, 6, 9, 18", { match: "set" }), "1 2 3 6 9 18", true],
  [Q("1, 2, 3, 6, 9, 18", { match: "set" }), "1, 2, 3, 6 and 18", false],
  [Q("−5, −1, 0, 2, 3", { match: "list" }), "-5,-1,0,2,3", true],
  [Q("−5, −1, 0, 2, 3", { match: "list" }), "-1, -5, 0, 2, 3", false],
  [Q("2² × 3²", { match: "product" }), "2 x 2 x 3 x 3", true],
  [Q("2² × 3²", { match: "product" }), "3^2 * 2^2", true],
  [Q("2² × 3²", { match: "product" }), "2²x3²", true],
  [Q("2² × 3²", { match: "product" }), "4 × 9", false],
  [Q("2² × 3²", { match: "product" }), "2 × 3", false],
  [Q("(3 + 4) × 2 = 14", { match: "expr" }), "(3+4)x2", true],
  [Q("(3 + 4) × 2 = 14", { match: "expr" }), "(3 + 4) * 2 = 14", true],
  [Q("(3 + 4) × 2 = 14", { match: "expr" }), "3 + (4 × 2)", false],
  [Q("20 − (8 − 2) = 14", { match: "expr" }), "20-(8-2)", true],
  [Q("10:00 am", { accept: ["10am", "10:00"] }), "10.00", true], [Q("10:00 am", { accept: ["10am"] }), "10 AM", true],
  [Q("0.06", { accept: ["6 hundredths"] }), "6 Hundredths", true]
];
cases.forEach(([q, typed, want]) => ok(checkMaths(q, typed).ok === want, `checkMaths("${q.answer}", "${typed}") should be ${want}`));
ok(/sign/.test(checkMaths(Q("−7"), "7").tip || ""), "sign tip");
ok(/prime/.test(checkMaths(Q("2² × 3²", { match: "product" }), "4 × 9").tip || ""), "not-prime tip");
ok(/zero/.test(checkMaths(Q("8.0", { exact: true }), "8").tip || ""), "decimal place tip");

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
