#!/usr/bin/env node
/* =========================================================
   Checks the science bank (data/content/secondary/science.json):
     node tools/test-science.mjs                 the bank
     node tools/test-science.mjs extra.json …    the bank + extra topic
                                                 files (an array of topics,
                                                 or { topics: [...] })
   - ids unique; every topic has the fields the trainer needs;
     topics with an "idea" use a known idea and part 1|2
   - short: the answer and every accept are marked right by the
     trainer's own matcher; no choice / reject / everyday is
     (so a wrong option is never "a spelling slip" of a right one)
   - mcq: answer + 3 different choices; tf: boolean answer
   - explain: marks 1–6, at least that many acceptable points,
     award rules and a model answer
   - diagrams: every image file exists; a question's "part" is a
     labelled part (data-part) of its diagram
   ========================================================= */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BANK = join(ROOT, "data/content/secondary/science.json");
const ART = join(ROOT, "data/content/secondary/science");

/* the trainer's matcher, lifted out of the view (no DOM needed) */
const { normaliseText } = await import(join(ROOT, "js/core/utils.js"));
const view = readFileSync(join(ROOT, "js/views/secondary/revision.js"), "utf8");
const judgeTyped = new Function("normaliseText",
  view.slice(view.indexOf("function canon("), view.indexOf("function startRun(")) + "; return judgeTyped;")(normaliseText);

const bank = JSON.parse(readFileSync(BANK, "utf8"));
const topics = [...bank.topics];
for (const f of process.argv.slice(2)) {
  const extra = JSON.parse(readFileSync(f, "utf8"));
  topics.push(...(Array.isArray(extra) ? extra : extra.topics));
}
const IDEAS = new Set((bank.ideas || []).map(i => i.id));

let pass = 0;
const fails = [];
const check = (ok, msg) => { if (ok) pass++; else fails.push(msg); };

const ids = new Set();
const parts = {};
const partsOf = file => {
  if (parts[file]) return parts[file];
  const path = join(ART, `${file}.svg`);
  if (!existsSync(path)) return null;
  return (parts[file] = new Set([...readFileSync(path, "utf8").matchAll(/data-part="([^"]+)"/g)].map(m => m[1])));
};

for (const t of topics) {
  const where = `topic ${t.id}`;
  check(t.id && !ids.has(`topic:${t.id}`), `${where}: missing or duplicate topic id`);
  ids.add(`topic:${t.id}`);
  for (const k of ["title", "summary", "facts", "keywords", "questions", "images"]) check(t[k] != null, `${where}: no ${k}`);
  if (t.idea != null) {
    check(IDEAS.has(t.idea), `${where}: unknown idea "${t.idea}"`);
    check(t.part === 1 || t.part === 2, `${where}: part must be 1 or 2`);
  }
  check((t.keywords || []).every(k => Array.isArray(k) && k.length === 2), `${where}: keywords must be [term, meaning] pairs`);
  for (const im of t.images || []) check(partsOf(im.file), `${where}: diagram ${im.file}.svg not found`);
  if (t.table) check(t.table.rows.every(r => r.length === t.table.head.length), `${where}: table rows and head differ in length`);

  for (const q of t.questions || []) {
    const at = `${q.id} (${where})`;
    check(q.id && !ids.has(q.id), `${at}: missing or duplicate id`);
    ids.add(q.id);
    check(q.stem, `${at}: no stem`);
    if (q.image) {
      const p = partsOf(q.image);
      check(p, `${at}: diagram ${q.image}.svg not found`);
      if (p && q.part) check(p.has(q.part), `${at}: part "${q.part}" is not on ${q.image}.svg`);
      if (q.part) check(q.stem.includes("{L}"), `${at}: a part question needs {L} in the stem`);
    }
    if (q.type === "explain") {
      const pts = q.markScheme?.acceptablePoints || [];
      check(q.marks >= 1 && q.marks <= 6, `${at}: marks must be 1–6`);
      check(pts.length >= q.marks && pts.every(p => p.point), `${at}: needs at least ${q.marks} acceptable points`);
      check(q.markScheme?.award && q.markScheme?.modelAnswer, `${at}: needs award and modelAnswer`);
      continue;
    }
    check(q.explain, `${at}: no explain`);
    if (q.type === "tf") { check(typeof q.answer === "boolean", `${at}: tf answer must be true/false`); continue; }
    if (q.type === "mcq" || q.choices?.length) {
      check(q.choices?.length === 3 && new Set([q.answer, ...q.choices]).size === 4, `${at}: needs 3 different wrong choices`);
    }
    if (q.type === "mcq") continue;
    check(q.type === "short", `${at}: unknown type ${q.type}`);
    for (const a of [q.answer, ...(q.accept || [])]) check(judgeTyped(q, a).ok, `${at}: its own answer "${a}" is marked wrong`);
    for (const c of [...(q.choices || []), ...(q.reject || []), ...(q.everyday || [])]) {
      const r = judgeTyped(q, c);
      check(!r.ok || r.everyday, `${at}: wrong answer "${c}" is marked right`);
    }
  }
}

if (fails.length) console.log(fails.map(f => `✗ ${f}`).join("\n"));
console.log(`${pass} passed, ${fails.length} failed (${topics.length} topics)`);
process.exitCode = fails.length ? 1 : 0;
