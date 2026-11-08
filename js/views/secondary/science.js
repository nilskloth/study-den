/* =========================================================
   Year 7 science revision trainer (Secondary → Science).
     #/secondary/science                 setup: pick topics, mode, start
     #/secondary/science/learn/<topic>   notes: diagram, key facts, key words
     #/secondary/science/label/<diagram> name the parts: label a whole
                                         diagram (skeleton, muscles, …) at once

   Content: data/content/secondary/science.json — topics with
   facts, key words, one or more diagrams (inline SVG under
   data/content/secondary/science/) and questions:
     short  typed answer (answer + accept[]), or pick from 4
            (answer + 3 choices); may point at a labelled part of
            a diagram ("part": label key, "{L}" in the stem → the
            letter shown on the quiz version of the diagram)
     mcq    pick from 4 only
     tf     true / false
   Practise is adaptive (core/adaptive.js, one stat per question in
   store.vocab.science.stats); Test is a fixed set with a review at
   the end. Runs are recorded as attempts (subject "science", domain
   = topic) so Grown-ups shows them.
   ========================================================= */

import { saveStore, recordAttempt } from "../../core/store.js";
import { esc, pickN, shuffle, normaliseText } from "../../core/utils.js";
import { newStat, weightedPick, applyResult } from "../../core/adaptive.js";
import { vocabState } from "./langs.js";
import { seg } from "./vocab.js";

export const SCIENCE = { code: "science", label: "Science", subject: "science" };
const TEST_LENGTHS = [10, 20, 30];
const BASE = "data/content/secondary/science";

let bankPromise = null;
export function loadScience() {
  if (!bankPromise) {
    bankPromise = fetch(`${BASE}.json`, { cache: "no-cache" })
      .then(r => { if (!r.ok) throw new Error(`science.json: HTTP ${r.status}`); return r.json(); })
      .catch(err => { bankPromise = null; throw err; });
  }
  return bankPromise;
}

/* Diagrams are inlined so they use the page font and can be switched
   between names and letters. Cached as text. */
const figures = {};
function loadFigure(file) {
  if (!figures[file]) {
    figures[file] = fetch(`${BASE}/${file}.svg`, { cache: "no-cache" })
      .then(r => { if (!r.ok) throw new Error(`${file}.svg: HTTP ${r.status}`); return r.text(); })
      .catch(err => { delete figures[file]; throw err; });
  }
  return figures[file];
}

/* Put a diagram into `host`. quiz: letters instead of names, shuffled so
   the letters can't be learnt; ask: the label key to highlight.
   Returns the letter of the asked part (or null). */
async function mountFigure(host, file, { quiz = false, ask = null, reveal = false } = {}) {
  let text;
  try { text = await loadFigure(file); } catch { host.innerHTML = `<p class="muted">The diagram couldn't load.</p>`; return null; }
  host.innerHTML = text;
  const svgEl = host.querySelector("svg");
  if (!svgEl) return null;
  svgEl.removeAttribute("width"); svgEl.removeAttribute("height");
  const labels = [...svgEl.querySelectorAll(".lbl")];
  const letters = quiz ? shuffle(labels.map((_, i) => String.fromCharCode(65 + i))) : labels.map((_, i) => String.fromCharCode(65 + i));
  let asked = null;
  labels.forEach((g, i) => {
    const t = g.querySelector(".letter text");
    if (t) t.textContent = letters[i];
    if (ask && g.dataset.part === ask) { g.classList.add("ask"); asked = letters[i]; }
  });
  if (quiz) svgEl.classList.add("quiz");
  if (reveal) {
    /* self-test on the notes page: tap a letter to see its name */
    labels.forEach(g => g.addEventListener("click", () => g.classList.toggle("reveal")));
  }
  fitView(svgEl);
  return asked;
}

/* Crop the viewBox to what is drawn (hidden names don't count), so a
   letters-only diagram fills a phone screen instead of shrinking. */
function fitView(svgEl) {
  if (!svgEl.dataset.box) svgEl.dataset.box = svgEl.getAttribute("viewBox");
  svgEl.setAttribute("viewBox", svgEl.dataset.box);
  let b;
  try { b = svgEl.getBBox(); } catch { return; }
  if (!b || !b.width || !b.height) return;
  const pad = 6;
  svgEl.setAttribute("viewBox", `${b.x - pad} ${b.y - pad} ${b.width + 2 * pad} ${b.height + 2 * pad}`);
}

/* Phones: names on the drawing would be too small to read, so the
   diagram shows letters and a key underneath gives the names. */
const NARROW = 520;

/* **bold** in facts → <strong> (everything else escaped). */
const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

/* Class-sheet topics have no number; the rest are "N. Title". */
const topicLabel = t => (t.sheet ? t.title : `${t.number}. ${t.title}`);

const mastered = stat => (stat?.mastery || 0) >= 0.8;

/* =========================
   Entry
========================= */

export async function renderScience(el, params = []) {
  el.dataset.subject = SCIENCE.subject;
  el.innerHTML = `<div class="card"><p class="muted">Loading the science notes…</p></div>`;
  let bank;
  try {
    bank = await loadScience();
  } catch (err) {
    el.innerHTML = `<div class="card"><p>The science questions couldn't load. Check your connection and refresh.</p>
      <p class="muted">${esc(err.message)}</p></div>`;
    return;
  }
  const ctx = { el, bank };
  if (params[0] === "learn" && params[1]) return renderLearn(ctx, params[1]);
  if (params[0] === "label" && params[1]) return renderLabel(ctx, params[1]);
  renderSetup(ctx);
}

const topicById = (bank, id) => bank.topics.find(t => t.id === id);
const stateOf = () => vocabState(SCIENCE.code);

/* =========================
   Notes page for one topic
========================= */

async function renderLearn({ el, bank }, topicId) {
  const topic = topicById(bank, topicId);
  if (!topic) { location.hash = "#/secondary/science"; return; }
  const stats = stateOf().stats;
  const known = topic.questions.filter(q => mastered(stats[q.id])).length;

  el.innerHTML = `
    <div class="run-bar">
      <h2>${esc(topicLabel(topic))}</h2>
      <a class="btn quiet" href="#/secondary/science">Back</a>
    </div>
    <div class="paper-sheet sci-notes" data-subject="science">
      ${topic.source ? `<p class="sci-source">${esc(topic.source)}</p>` : ""}
      <p class="muted" style="margin-top:0;">${esc(topic.summary)}</p>
      ${topic.images.map((im, i) => `
        <figure class="sci-figure" data-fig="${i}">
          <div class="sci-figure-host" data-host="${i}"></div>
          <figcaption class="muted">${esc(im.caption)}
            <button type="button" class="quiet sci-selftest hidden" data-selftest="${i}">Hide the names</button>
          </figcaption>
        </figure>`).join("")}
      ${topic.table ? `
        <h3>${esc(topic.table.title)}</h3>
        <table class="word-list sci-table">
          <thead><tr>${topic.table.head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead>
          <tbody>${topic.table.rows.map(r => `<tr>${r.map((c, j) => j ? `<td>${esc(c)}</td>` : `<td><strong>${esc(c)}</strong></td>`).join("")}</tr>`).join("")}</tbody>
        </table>` : ""}
      <h3>Key facts</h3>
      <ul class="fact-list">${topic.facts.map(f => `<li>${rich(f)}</li>`).join("")}</ul>
      <h3>Key words</h3>
      <table class="word-list keyword-list">
        <tbody>${topic.keywords.map(([term, meaning]) => `<tr><td lang="en">${esc(term)}</td><td>${esc(meaning)}</td></tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="start-bar" style="margin-top:var(--sp-4);">
      <button class="primary" data-practise>Practise this topic</button>
      <span class="muted">${topic.questions.length} questions · ${known} mastered</span>
    </div>`;

  topic.images.forEach(async (im, i) => {
    const host = el.querySelector(`[data-host="${i}"]`);
    const narrow = host.clientWidth < NARROW;
    await mountFigure(host, im.file, { quiz: narrow, reveal: !narrow });
    const svgEl = host.querySelector("svg");
    if (!svgEl?.querySelector(".lbl")) return;
    const btn = el.querySelector(`[data-selftest="${i}"]`);
    btn.classList.remove("hidden");
    if (narrow) return mountKey(host, svgEl, btn);
    btn.addEventListener("click", () => {
      const quiz = svgEl.classList.toggle("quiz");
      svgEl.querySelectorAll(".lbl.reveal").forEach(g => g.classList.remove("reveal"));
      btn.textContent = quiz ? "Show the names" : "Hide the names";
      host.nextElementSibling.querySelector("[data-hint]")?.remove();
      if (quiz) btn.insertAdjacentHTML("beforebegin", `<span data-hint> Tap a letter to check it. </span>`);
      /* no refit: the frame keeps room for names revealed by a tap */
    });
  });

  /* Key under a letters-only diagram (phones). "Hide the names" hides the
     key's names; tapping a row or a letter shows that one name again. */
  function mountKey(host, svgEl, btn) {
    const labels = [...svgEl.querySelectorAll(".lbl")]
      .map(g => ({ g, letter: g.querySelector(".letter text")?.textContent || "", name: g.querySelector(".name")?.textContent || "" }))
      .sort((a, b) => a.letter.localeCompare(b.letter));
    const key = document.createElement("ol");
    key.className = "sci-key";
    key.innerHTML = labels.map(l => `<li data-part="${esc(l.g.dataset.part)}"><span class="sci-key-letter">${esc(l.letter)}</span><span class="sci-key-name">${esc(l.name)}</span></li>`).join("");
    host.after(key);
    const rowOf = part => key.querySelector(`[data-part="${CSS.escape(part)}"]`);
    const toggle = part => {
      const row = rowOf(part);
      const on = row.classList.toggle("reveal");
      labels.forEach(l => l.g.classList.toggle("ask", on && l.g.dataset.part === part && key.classList.contains("hide-names")));
    };
    key.querySelectorAll("li").forEach(li => li.addEventListener("click", () => toggle(li.dataset.part)));
    labels.forEach(l => l.g.addEventListener("click", () => toggle(l.g.dataset.part)));
    btn.addEventListener("click", () => {
      const hide = key.classList.toggle("hide-names");
      key.querySelectorAll(".reveal").forEach(li => li.classList.remove("reveal"));
      labels.forEach(l => l.g.classList.remove("ask"));
      btn.textContent = hide ? "Show the names" : "Hide the names";
      btn.parentElement.querySelector("[data-hint]")?.remove();
      if (hide) btn.insertAdjacentHTML("beforebegin", `<span data-hint> Tap a letter to check it. </span>`);
    });
  }

  el.querySelector("[data-practise]").addEventListener("click", () => {
    const prefs = stateOf().prefs;
    startRun({ el, bank }, {
      pool: topic.questions.map(q => ({ ...q, topic })),
      style: prefs.style || "type",
      test: 0
    });
  });
}

/* =========================
   Setup
========================= */

function renderSetup(ctx) {
  const { el, bank } = ctx;
  const state = stateOf();
  const prefs = state.prefs;
  const valid = new Set(bank.topics.map(t => t.id));
  let selected = new Set((prefs.topics || []).filter(id => valid.has(id)));
  if (!selected.size) bank.topics.forEach(t => selected.add(t.id));

  const masteredIn = t => t.questions.filter(q => mastered(state.stats[q.id])).length;

  el.innerHTML = `<div data-setup>
    <div class="run-bar"><h2>Science revision</h2><span class="muted">${esc(bank.unit)}</span></div>

    ${labelSets(bank).length ? `
    <div class="card setup-card">
      <h3>Name the parts</h3>
      <p class="muted" style="margin-top:calc(-1 * var(--sp-2));">Fill in every label on one diagram, then check them all.</p>
      <div class="sci-label-pick">
        ${labelSets(bank).map(set => {
          const known = set.qs.filter(q => mastered(state.stats[q.id])).length;
          return `<a class="btn" href="#/secondary/science/label/${esc(set.file)}"><strong>${esc(set.title)}</strong>
            <span class="muted">${set.qs.length} ${set.noun} · ${known} known</span></a>`;
        }).join("")}
      </div>
    </div>` : ""}

    <div class="card setup-card">
      <h3>1. Choose your topics</h3>
      <p class="muted" style="margin-top:calc(-1 * var(--sp-2));">Read the notes first, then practise. Each topic has a diagram, key facts and key words.</p>
      <div class="section-grid" style="margin-left:0;">
        ${bank.topics.map((t, i) => `
          ${i === 0 && t.sheet ? `<p class="section-group muted" style="border-top:0;padding-top:0;">From your class sheets</p>` : ""}
          ${!t.sheet && bank.topics[i - 1]?.sheet ? `<p class="section-group muted">Revision topics — our notes</p>` : ""}
          <div class="section-row">
            <label class="section-pick">
              <input type="checkbox" data-topic="${t.id}" ${selected.has(t.id) ? "checked" : ""}>
              <span>${t.sheet ? esc(t.title) : `<strong>${t.number}.</strong> ${esc(t.title)}`}</span>
            </label>
            <span class="muted section-meta" data-meta="${t.id}">${masteredIn(t)}/${t.questions.length} mastered</span>
            <a class="section-look" href="#/secondary/science/learn/${t.id}">Read the notes</a>
          </div>`).join("")}
      </div>
      <p style="margin-bottom:0;">
        <button type="button" class="quiet" data-all>Select everything</button>
        ${bank.topics.some(t => t.sheet) ? `<button type="button" class="quiet" data-sheet>Just the class sheets</button>` : ""}
        <button type="button" class="quiet" data-none>Clear</button>
      </p>
    </div>

    <div class="card setup-card">
      <h3>2. How do you want to practise?</h3>
      <div class="seg-group">
        <span class="seg-label">Answer</span>
        <div class="seg" role="radiogroup">
          ${seg("style", "type", "Type it", prefs.style)}
          ${seg("style", "choose", "Pick from 4", prefs.style)}
        </div>
      </div>
      <div class="seg-group">
        <span class="seg-label">Mode</span>
        <div class="seg" role="radiogroup">
          ${seg("mode", "practise", "Practise", prefs.mode)}
          ${TEST_LENGTHS.map(n => seg("mode", `test-${n}`, `Test · ${n}`, prefs.mode)).join("")}
        </div>
      </div>
      <p class="muted" data-explain style="margin:var(--sp-3) 0 0;"></p>
    </div>

    <div class="start-bar">
      <button class="primary" data-start>Start</button>
      <span class="muted" data-count></span>
    </div>
  </div>`;

  ["style:type", "mode:practise"].forEach(d => {
    const [name, value] = d.split(":");
    if (!el.querySelector(`input[name="${name}"]:checked`)) el.querySelector(`input[name="${name}"][value="${value}"]`).checked = true;
  });
  const val = name => el.querySelector(`input[name="${name}"]:checked`)?.value;

  const pool = () => bank.topics.filter(t => selected.has(t.id)).flatMap(t => t.questions.map(q => ({ ...q, topic: t })));

  function refresh() {
    const qs = pool();
    const mode = val("mode");
    const n = mode.startsWith("test") ? Math.min(Number(mode.split("-")[1]), qs.length) : null;
    el.querySelector("[data-count]").textContent = qs.length
      ? `${qs.length} question${qs.length === 1 ? "" : "s"} selected${n ? ` · test of ${n}` : ""}`
      : "Choose at least one topic";
    el.querySelector("[data-start]").disabled = !qs.length;
    const styleText = val("style") === "type"
      ? "Type your answers — spelling slips are forgiven, but you'll see the proper spelling."
      : "Pick the right answer from four.";
    const modeText = mode === "practise"
      ? "Practise: you see the answer after each question, and the ones you find hard come back more often."
      : "Test: no help until the end — then you see your score and every answer.";
    el.querySelector("[data-explain]").textContent = `${styleText} ${modeText}`;
    Object.assign(prefs, { topics: [...selected], style: val("style"), mode });
    saveStore();
  }

  el.querySelector("[data-setup]").addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.topic) t.checked ? selected.add(t.dataset.topic) : selected.delete(t.dataset.topic);
    refresh();
  });
  el.querySelector("[data-all]").addEventListener("click", () => {
    bank.topics.forEach(t => selected.add(t.id));
    el.querySelectorAll("[data-topic]").forEach(b => { b.checked = true; });
    refresh();
  });
  el.querySelector("[data-sheet]")?.addEventListener("click", () => {
    selected = new Set(bank.topics.filter(t => t.sheet).map(t => t.id));
    el.querySelectorAll("[data-topic]").forEach(b => { b.checked = selected.has(b.dataset.topic); });
    refresh();
  });
  el.querySelector("[data-none]").addEventListener("click", () => {
    selected = new Set();
    el.querySelectorAll("[data-topic]").forEach(b => { b.checked = false; });
    refresh();
  });
  el.querySelector("[data-start]").addEventListener("click", () => {
    const qs = pool();
    if (!qs.length) return;
    const mode = val("mode");
    startRun(ctx, { pool: qs, style: val("style"), test: mode.startsWith("test") ? Math.min(Number(mode.split("-")[1]), qs.length) : 0 });
  });
  refresh();
}

/* =========================
   Name the parts: label a whole diagram at once
========================= */

/* A diagram becomes a "name the parts" set when at least 4 of its
   labelled parts have a question (the "which part is {L}?" ones).
   Class-sheet drawings have fixed letters and no `part`, so they don't. */
const LABEL_NAMES = {
  skeleton: ["The skeleton", "bones"],
  muscles: ["Muscles", "muscles"],
  microscope: ["The microscope", "parts"],
  cells: ["Plant and animal cells", "parts"]
};

function labelSets(bank) {
  const sets = new Map();
  for (const t of bank.topics) {
    for (const q of t.questions) {
      if (!q.image || !q.part || q.type !== "short") continue;
      if (!sets.has(q.image)) sets.set(q.image, { file: q.image, topic: t, qs: [] });
      sets.get(q.image).qs.push({ ...q, topic: t });
    }
  }
  return [...sets.values()].filter(s => s.qs.length >= 4).map(s => ({
    ...s,
    title: LABEL_NAMES[s.file]?.[0] || s.topic.title,
    noun: LABEL_NAMES[s.file]?.[1] || "parts"
  }));
}

async function renderLabel(ctx, file) {
  const { el, bank } = ctx;
  const set = labelSets(bank).find(s => s.file === file);
  if (!set) { location.hash = "#/secondary/science"; return; }
  const pick = stateOf().prefs.style === "choose";
  const names = [...new Set(set.qs.map(q => q.answer))].sort((a, b) => a.localeCompare(b));
  const byPart = new Map(set.qs.map(q => [q.part, q]));

  el.innerHTML = `
    <div class="run-bar">
      <h2>Name the ${esc(set.noun)} <span class="muted" style="font-weight:400;">· ${esc(set.title)}</span></h2>
      <span class="timer-pill" data-progress></span>
      <a class="btn quiet" href="#/secondary/science">Back</a>
    </div>
    <div class="paper-sheet sci-card" data-subject="science">
      <p class="muted" style="margin-top:0;">${pick ? "Choose" : "Write"} the name for each letter, then press <strong>Check</strong>. Spelling slips are forgiven.</p>
      <div class="sci-figure-host sci-quiz-figure" data-figure></div>
      <ol class="sci-label-list" data-list></ol>
      <div class="vocab-feedback" data-feedback aria-live="polite"></div>
      <div class="vocab-actions" data-actions></div>
    </div>
    <p class="sci-label-more">
      <button type="button" class="quiet" data-one>One at a time instead</button>
      <a class="btn quiet" href="#/secondary/science/learn/${esc(set.topic.id)}">Read the notes</a>
    </p>`;
  const $ = s => el.querySelector(s);

  $("[data-one]").addEventListener("click", () => {
    startRun(ctx, { pool: set.qs, style: pick ? "choose" : "type", test: 0 });
  });

  let round = 0;
  async function start() {
    const my = ++round;
    const fig = $("[data-figure]");
    await mountFigure(fig, set.file, { quiz: true });
    if (my !== round || !fig.isConnected) return;
    const svgEl = fig.querySelector("svg");
    const groups = new Map([...fig.querySelectorAll(".lbl")].map(g => [g.dataset.part, g]));
    /* one row per part that has a question, in letter order */
    const rows = [...groups.entries()]
      .filter(([part]) => byPart.has(part))
      .map(([part, g]) => ({ part, g, q: byPart.get(part), letter: g.querySelector(".letter text")?.textContent || "?", done: false }))
      .sort((a, b) => a.letter.localeCompare(b.letter));
    let checked = false;

    const field = r => pick
      ? `<select aria-label="Part ${esc(r.letter)}"><option value="">Choose…</option>${names.map(n => `<option>${esc(n)}</option>`).join("")}</select>`
      : `<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Part ${esc(r.letter)}">`;
    $("[data-list]").innerHTML = rows.map((r, i) => `
      <li data-row="${i}">
        <span class="sci-key-letter">${esc(r.letter)}</span>
        <span class="answer-line">${field(r)}</span>
        <span class="sci-label-fix" data-fix></span>
      </li>`).join("");
    const rowEl = i => $(`[data-row="${i}"]`);
    const inputs = rows.map((_, i) => rowEl(i).querySelector("input, select"));

    /* the part being answered is highlighted on the diagram */
    inputs.forEach((inp, i) => {
      inp.addEventListener("focus", () => rows.forEach((r, j) => r.g.classList.toggle("ask", j === i)));
      inp.addEventListener("blur", () => rows[i].g.classList.remove("ask"));
      if (!pick) inp.addEventListener("keydown", e => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const next = inputs.find((x, j) => j > i && !x.disabled);
        if (next) next.focus(); else check();
      });
    });
    /* tapping a letter on the diagram jumps to its row */
    rows.forEach((r, i) => r.g.addEventListener("click", () => { if (!inputs[i].disabled) inputs[i].focus(); }));

    function progress() {
      const right = rows.filter(r => r.done).length;
      $("[data-progress]").textContent = checked ? `${right} / ${rows.length} right` : `${rows.length} ${set.noun}`;
    }

    function actions(html) {
      $("[data-actions]").innerHTML = html;
      $("[data-check]")?.addEventListener("click", check);
      $("[data-retry]")?.addEventListener("click", retry);
      $("[data-show]")?.addEventListener("click", showAnswers);
      $("[data-new]")?.addEventListener("click", start);
    }

    function check() {
      const first = !checked;
      checked = true;
      let everydayCount = 0;
      rows.forEach((r, i) => {
        if (r.done) return;
        const value = inputs[i].value;
        const res = pick ? { ok: value === r.q.answer } : judgeTyped(r.q, value);
        if (first) r.firstOk = res.ok;
        const li = rowEl(i);
        li.classList.toggle("is-correct", res.ok);
        li.classList.toggle("is-wrong", !res.ok);
        if (res.ok) {
          r.done = true;
          inputs[i].disabled = true;
          li.querySelector("[data-fix]").innerHTML = res.near ? `✓ <span class="muted">“${esc(r.q.answer)}”</span>` : "✓";
        } else {
          li.querySelector("[data-fix]").textContent = res.everyday ? "✗ everyday name" : "✗";
          if (res.everyday) everydayCount++;
        }
      });
      if (first) record();
      progress();
      const wrong = rows.filter(r => !r.done).length;
      $("[data-feedback]").innerHTML = wrong
        ? `<div class="mark-note wrong"><strong>${rows.length - wrong} of ${rows.length} right.</strong>
             <p style="margin:var(--sp-1) 0 0;">${everydayCount ? `${everydayCount === 1 ? "One answer is an everyday name" : `${everydayCount} answers are everyday names`} — the assessment needs the scientific names. ` : ""}Have another go at the red ones, or show the answers.</p></div>`
        : `<div class="mark-note correct"><strong>All ${rows.length} right — brilliant!</strong>
             <p style="margin:var(--sp-1) 0 0;">Try again with new letters to be sure.</p></div>`;
      actions(wrong
        ? `<button class="primary" data-retry>Try the red ones again</button>
           <button type="button" class="quiet" data-show>Show the answers</button>`
        : `<button class="primary" data-new>New letters</button>`);
    }

    function retry() {
      rows.forEach((r, i) => {
        if (r.done) return;
        const li = rowEl(i);
        li.classList.remove("is-wrong");
        li.querySelector("[data-fix]").textContent = "";
        inputs[i].value = "";
      });
      $("[data-feedback]").innerHTML = "";
      actions(`<button class="primary" data-check>Check</button>`);
      inputs.find(x => !x.disabled)?.focus();
    }

    function showAnswers() {
      rows.forEach((r, i) => {
        if (r.done) return;
        inputs[i].disabled = true;
        rowEl(i).querySelector("[data-fix]").innerHTML = `<span class="vocab-answer">${esc(r.q.answer)}</span>`;
      });
      /* names back on the drawing, refitted so they aren't cut off */
      svgEl.classList.remove("quiz");
      rows.forEach(r => r.g.classList.remove("ask"));
      fitView(svgEl);
      $("[data-feedback]").innerHTML = "";
      actions(`<button class="primary" data-new>Try again with new letters</button>`);
    }

    /* Only the first check counts towards mastery and Grown-ups. */
    function record() {
      const stats = stateOf().stats;
      rows.forEach(r => {
        if (!stats[r.q.id]) stats[r.q.id] = newStat(r.q.id);
        applyResult(stats[r.q.id], r.firstOk);
      });
      saveStore();
      recordAttempt({
        mode: "science-label",
        paperId: "science",
        seconds: Math.round((Date.now() - startedAt) / 1000),
        items: rows.map(r => ({
          qid: r.q.id, domain: r.q.topic.title, subject: SCIENCE.subject,
          marks: 1, earned: r.firstOk ? 1 : 0, marking: "auto"
        }))
      });
    }

    const startedAt = Date.now();
    $("[data-feedback]").innerHTML = "";
    actions(`<button class="primary" data-check>Check</button>`);
    progress();
    if (!pick && window.innerWidth >= NARROW) inputs[0]?.focus();
  }
  start();
}

/* =========================
   Marking a typed answer
========================= */

/* "the femur" → "femur"; "×400" → "400" */
function canon(s) {
  return normaliseText(s).replace(/^(the|a|an|it is|its|it's) /, "").replace(/\s+/g, " ").trim();
}

const everydayTip = q => `That's the everyday name — in the assessment you need the scientific name: “${q.answer}”.`;
const EVERYDAY_ASK = "That's the everyday name. In the assessment you need the <strong>scientific name</strong> — have another go.";

function levenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let last = prev[0]; prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a[i - 1] === b[j - 1] ? 0 : 1));
      last = tmp;
    }
  }
  return prev[b.length];
}

/* ok: right; near: right apart from spelling (counts as right, shown with the spelling);
   everyday: an everyday name ("shin bone") where the assessment wants the scientific one
   ("tibia") — the child is asked again, and it never counts as right */
function judgeTyped(q, answer) {
  /* "Skull (cranium)", as the notes print it — or "shin bone (tibia)": either part counts */
  const m = String(answer).match(/^(.*?)\s*\(([^)]*)\)?\s*$/);
  if (m && m[1].trim()) {
    for (const part of [m[1], m[2] || ""]) {
      const r = part.trim() ? judgeTyped(q, part) : { ok: false };
      if (r.ok) return r;
    }
  }
  const given = canon(answer);
  if (!given) return { ok: false };
  if ((q.everyday || []).map(canon).includes(given)) return { ok: false, everyday: true, tip: everydayTip(q) };
  const targets = [q.answer, ...(q.accept || [])].map(canon);
  if (targets.includes(given)) return { ok: true };
  /* numbers must be exact; words may have a slip or two */
  if (/^\d/.test(canon(q.answer))) return { ok: false };
  for (const t of targets) {
    const allowed = t.length >= 10 ? 2 : t.length >= 5 ? 1 : 0;
    if (allowed && levenshtein(given, t) <= allowed) return { ok: true, near: true, tip: `Nearly the right spelling — it's “${q.answer}”.` };
  }
  return { ok: false };
}

/* =========================
   Running
========================= */

function startRun(ctx, cfg) {
  const { el, bank } = ctx;
  const stats = stateOf().stats;
  const fresh = new Map();
  const statFor = q => {
    if (stats[q.id]) return stats[q.id];
    if (!fresh.has(q.id)) fresh.set(q.id, newStat(q.id));
    return fresh.get(q.id);
  };
  const keep = q => { const s = statFor(q); stats[q.id] = s; return s; };

  const run = {
    results: [],            // { q, answer, ok, near, tip, letter, marking }
    queue: cfg.test ? pickN(cfg.pool, cfg.test) : null,
    current: null, lastId: null, committed: false, startedAt: Date.now()
  };
  const topics = [...new Set(cfg.pool.map(q => q.topic.title))];
  const subtitle = topics.length === 1 ? topics[0] : `${topics.length} topics`;

  el.innerHTML = `
    <div class="run-bar">
      <h2>${cfg.test ? "Test" : "Practise"} <span class="muted" style="font-weight:400;">· ${esc(subtitle)}</span></h2>
      <span class="timer-pill" data-progress></span>
      <button type="button" class="quiet" data-finish>${cfg.test ? "Stop test" : "Finish"}</button>
    </div>
    <div class="paper-sheet vocab-card sci-card" data-subject="science">
      <p class="vocab-context muted" data-context></p>
      <div class="sci-figure-host sci-quiz-figure hidden" data-figure></div>
      <div class="sci-prompt" data-prompt></div>
      <div data-answer></div>
      <div class="vocab-feedback" data-feedback aria-live="polite"></div>
    </div>
    <div data-summary></div>`;
  const $ = s => el.querySelector(s);

  const onLeave = () => commit();
  window.addEventListener("hashchange", onLeave, { once: true });
  window.addEventListener("pagehide", onLeave, { once: true });

  function progress() {
    const right = run.results.filter(r => r.ok).length;
    $("[data-progress]").textContent = cfg.test
      ? `${Math.min(run.results.length + 1, cfg.test)} / ${cfg.test}`
      : `${right} right of ${run.results.length}`;
  }

  function nextQuestion() {
    if (cfg.test) return run.queue[run.results.length] || null;
    let candidates = cfg.pool;
    if (candidates.length > 1) candidates = candidates.filter(q => q.id !== run.lastId);
    const picked = weightedPick(candidates.map(statFor));
    return candidates.find(q => statFor(q) === picked);
  }

  async function ask() {
    const q = nextQuestion();
    if (!q) return showTestReview();
    run.current = q;
    run.lastId = q.id;
    progress();
    $("[data-context]").textContent = topicLabel(q.topic);
    $("[data-feedback]").innerHTML = "";
    $("[data-answer]").innerHTML = "";
    const fig = $("[data-figure]");
    let letter = null;
    if (q.image) {
      fig.classList.remove("hidden");
      letter = await mountFigure(fig, q.image, { quiz: true, ask: q.part });
      if (run.current !== q) return;
    } else {
      fig.classList.add("hidden");
      fig.innerHTML = "";
    }
    q._letter = letter;
    $("[data-prompt]").innerHTML = esc(q.stem.replace("{L}", letter || "?"));
    if (q.type === "tf") renderTrueFalse(q);
    else if (q.type === "mcq" || cfg.style === "choose") renderChoices(q);
    else renderTyping(q);
  }

  function renderTyping(q) {
    $("[data-answer]").innerHTML = `
      <div class="answer-line vocab-input">
        <input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Your answer">
      </div>
      <div class="vocab-actions">
        <button class="primary" data-check>Check</button>
        ${cfg.test ? "" : `<button type="button" class="quiet" data-dontknow>I don't know</button>`}
      </div>`;
    const input = $("[data-answer] input");
    input.focus();
    let asked = false;
    const submit = answer => {
      if (run.current !== q) return;
      const res = judgeTyped(q, answer);
      if (res.everyday && !asked) {
        asked = true;
        $("[data-feedback]").innerHTML = `<div class="mark-note partial"><strong>Nearly — “${esc(answer.trim())}”</strong>
          <p style="margin:var(--sp-1) 0 0;">${EVERYDAY_ASK}</p></div>`;
        input.value = "";
        input.focus();
        return;
      }
      $("[data-feedback]").innerHTML = "";
      input.disabled = true;
      $("[data-answer]").querySelectorAll("button").forEach(b => { b.disabled = true; });
      answered(q, answer, res);
    };
    $("[data-check]").addEventListener("click", () => input.value.trim() && submit(input.value));
    $("[data-dontknow]")?.addEventListener("click", () => submit(""));
    input.addEventListener("keydown", e => { if (e.key === "Enter" && input.value.trim()) { e.preventDefault(); submit(input.value); } });
  }

  function renderChoices(q) {
    const options = shuffle([q.answer, ...q.choices]);
    $("[data-answer]").innerHTML = `
      <div class="choice-grid">
        ${options.map((o, i) => `<button type="button" class="choice-btn" data-opt="${i}">${esc(o)}</button>`).join("")}
      </div>`;
    $("[data-answer]").querySelectorAll("[data-opt]").forEach(b => b.addEventListener("click", () => {
      if (run.current !== q) return;
      const picked = options[Number(b.dataset.opt)];
      const ok = picked === q.answer;
      $("[data-answer]").querySelectorAll("[data-opt]").forEach(x => {
        x.disabled = true;
        if (!cfg.test) {
          if (options[Number(x.dataset.opt)] === q.answer) x.classList.add("is-correct");
          else if (x === b) x.classList.add("is-wrong");
        } else if (x === b) x.classList.add("picked");
      });
      answered(q, picked, { ok });
    }));
  }

  function renderTrueFalse(q) {
    $("[data-answer]").innerHTML = `
      <div class="choice-grid tf-grid">
        <button type="button" class="choice-btn" data-tf="true">True</button>
        <button type="button" class="choice-btn" data-tf="false">False</button>
      </div>`;
    $("[data-answer]").querySelectorAll("[data-tf]").forEach(b => b.addEventListener("click", () => {
      if (run.current !== q) return;
      const picked = b.dataset.tf === "true";
      const ok = picked === q.answer;
      $("[data-answer]").querySelectorAll("[data-tf]").forEach(x => {
        x.disabled = true;
        if (!cfg.test) {
          if ((x.dataset.tf === "true") === q.answer) x.classList.add("is-correct");
          else if (x === b) x.classList.add("is-wrong");
        } else if (x === b) x.classList.add("picked");
      });
      answered(q, picked ? "True" : "False", { ok });
    }));
  }

  function answered(q, answer, r) {
    const result = { q, answer, ok: r.ok, near: r.near, tip: r.tip, everyday: r.everyday, letter: q._letter, marking: "auto" };
    run.results.push(result);
    progress();
    if (cfg.test) { setTimeout(ask, q.type === "short" && cfg.style === "type" ? 0 : 350); return; }
    applyResult(keep(q), r.ok);
    saveStore();
    showFeedback(result);
  }

  const answerText = q => (q.type === "tf" ? (q.answer ? "True" : "False") : q.answer);

  function showFeedback(result) {
    const { q } = result;
    const cls = result.ok ? "correct" : "wrong";
    const head = result.ok ? (result.near ? "Right — nearly spelt right!" : "Correct!") : result.everyday ? "Use the scientific name." : result.answer ? "Not quite." : "Here's the answer.";
    $("[data-feedback]").innerHTML = `
      <div class="mark-note ${cls}">
        <strong>${head}</strong>
        ${result.ok && !result.near ? "" : `<p style="margin:var(--sp-1) 0 0;"><span class="vocab-answer">${esc(answerText(q))}</span></p>`}
        ${result.everyday ? `<p style="margin:var(--sp-1) 0 0;">“${esc(String(result.answer).trim())}” is the everyday name — it won't get the mark in the assessment.</p>` : ""}
        ${q.explain ? `<p style="margin:var(--sp-1) 0 0;">${esc(q.explain)}</p>` : ""}
      </div>
      <div class="vocab-actions">
        <button class="primary" data-next>Next</button>
        ${!result.ok && !result.everyday && result.answer && q.type === "short" && cfg.style === "type" ? `<button type="button" class="quiet" data-overrule>I was right</button>` : ""}
        <a class="btn quiet" href="#/secondary/science/learn/${q.topic.id}">Read the notes</a>
      </div>`;
    const next = $("[data-next]");
    next.focus();
    next.addEventListener("click", ask);
    $("[data-overrule]")?.addEventListener("click", () => { overrule(result); showFeedback(result); });
  }

  function overrule(result) {
    result.ok = true; result.near = null; result.tip = null; result.marking = "self";
    if (!cfg.test) {
      const s = keep(result.q);
      s.wrong = Math.max(0, s.wrong - 1); s.wrongStreak = 0; s.attempts = Math.max(0, s.attempts - 1);
      applyResult(s, true);
      saveStore();
    }
    progress();
  }

  function showTestReview() {
    run.current = null;
    $(".sci-card").classList.add("hidden");
    $("[data-finish]").classList.add("hidden");
    $("[data-progress]").classList.add("hidden");
    const draw = () => {
      const right = run.results.filter(r => r.ok).length;
      $("[data-summary]").innerHTML = `
        <div class="card">
          <p class="muted" style="margin:0;">Your score</p>
          <div class="result-score">${right} / ${run.results.length}</div>
          <p class="muted">${verdict(right, run.results.length)}</p>
          <table class="word-list review sci-review">
            <tbody>
              ${run.results.map((r, i) => `
                <tr class="${r.ok ? "is-correct" : "is-wrong"}">
                  <td class="mark">${r.ok ? "✓" : "✗"}</td>
                  <td>
                    <div>${esc(r.q.stem.replace("{L}", r.letter || "?"))}${r.q.image ? ` <span class="muted">(diagram)</span>` : ""}</div>
                    <div class="sci-review-answers">
                      ${r.ok ? `<span>${r.answer !== "" && r.answer != null ? esc(String(r.answer)) : ""}</span>`
                        : `<span class="muted">You:</span> ${r.answer !== "" && r.answer != null ? `<s>${esc(String(r.answer))}</s>` : `<span class="muted">—</span>`}
                           · <span class="muted">Answer:</span> <strong>${esc(answerText(r.q))}</strong>
                           ${r.everyday ? `<div class="muted">That's the everyday name — use the scientific name.</div>` : ""}`}
                    </div>
                    ${!r.ok && !r.everyday && r.answer && r.q.type === "short" && cfg.style === "type" ? `<button type="button" class="quiet" data-overrule="${i}">I was right</button>` : ""}
                  </td>
                </tr>`).join("")}
            </tbody>
          </table>
          <p style="margin-bottom:0;">
            <button class="primary" data-again>Practise the ones I missed</button>
            <button type="button" data-home>Done</button>
          </p>
        </div>`;
      $("[data-summary]").querySelectorAll("[data-overrule]").forEach(b => b.addEventListener("click", () => {
        overrule(run.results[Number(b.dataset.overrule)]); draw();
      }));
      $("[data-home]").addEventListener("click", goHome);
      const missed = run.results.filter(r => !r.ok).map(r => r.q);
      const again = $("[data-again]");
      if (!missed.length) again.classList.add("hidden");
      again.addEventListener("click", () => { commit(); startRun(ctx, { ...cfg, pool: missed, test: 0 }); });
    };
    draw();
  }

  function verdict(right, total) {
    const p = total ? right / total : 0;
    if (p === 1) return "Every one right — brilliant!";
    if (p >= 0.8) return "Really strong. Read the notes for the ones you missed, then try again.";
    if (p >= 0.5) return "Good effort. Practise the missed questions and test yourself again.";
    return "These need more work — read the notes, use Practise mode, then test again.";
  }

  function commit() {
    if (run.committed || !run.results.length) return;
    run.committed = true;
    window.removeEventListener("hashchange", onLeave);
    window.removeEventListener("pagehide", onLeave);
    if (cfg.test) run.results.forEach(r => applyResult(keep(r.q), r.ok));
    recordAttempt({
      mode: cfg.test ? "science-test" : "science-practise",
      paperId: "science",
      seconds: Math.round((Date.now() - run.startedAt) / 1000),
      items: run.results.map(r => ({
        qid: r.q.id, domain: r.q.topic.title, subject: SCIENCE.subject,
        marks: 1, earned: r.ok ? 1 : 0, marking: r.marking
      }))
    });
  }

  function goHome() {
    commit();
    const home = "#/secondary/science";
    if (location.hash === home) renderSetup(ctx);
    else location.hash = home;
  }

  $("[data-finish]").addEventListener("click", () => {
    if (cfg.test) {
      run.queue = run.queue.slice(0, run.results.length);
      if (!run.results.length) { goHome(); return; }
      showTestReview();
      return;
    }
    commit();
    showPractiseSummary();
  });

  function showPractiseSummary() {
    run.current = null;
    $(".sci-card").classList.add("hidden");
    $("[data-finish]").classList.add("hidden");
    $("[data-progress]").classList.add("hidden");
    const right = run.results.filter(r => r.ok).length;
    const missed = [...new Map(run.results.filter(r => !r.ok).map(r => [r.q.id, r])).values()];
    $("[data-summary]").innerHTML = `
      <div class="card">
        <p class="muted" style="margin:0;">This session</p>
        <div class="result-score">${right} / ${run.results.length}</div>
        ${missed.length ? `
          <p>Questions to keep working on:</p>
          <table class="word-list"><tbody>
            ${missed.map(r => `<tr><td>${esc(r.q.stem.replace("{L}", r.letter || "?"))}</td><td lang="en">${esc(answerText(r.q))}</td></tr>`).join("")}
          </tbody></table>` : `<p>No mistakes this time — well done!</p>`}
        <p style="margin-bottom:0;"><button class="primary" data-home>Back to the topics</button></p>
      </div>`;
    $("[data-home]").addEventListener("click", goHome);
  }

  ask();
}
