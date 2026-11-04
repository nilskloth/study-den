/* =========================================================
   Year 1 shared bits: content loader, word drawing with sound
   buttons, adaptive state and the round runner.

   A word is stored as its sounds ("graphemes"): ["sh","i","p"].
   A split friend is written "a-" … "-e" (m|a-|k|-e = make).
   Sound buttons, as taught in class:
     a dot under a sound written with one letter,
     a line under a special friend (two or three letters, one sound),
     a joined line under the two halves of a split friend.
   Tricky parts (indices into the sounds) are shown in red.
   ========================================================= */

import { getStore, saveStore, recordAttempt } from "../../core/store.js";
import { esc } from "../../core/utils.js";
import { newStat, weightedPick, applyResult } from "../../core/adaptive.js";

const BASE = "data/content/year1";
const cache = {};
export function loadYear1(name) {
  if (!cache[name]) {
    cache[name] = fetch(`${BASE}/${name}.json`, { cache: "no-cache" })
      .then(r => { if (!r.ok) throw new Error(`${name}.json: HTTP ${r.status}`); return r.json(); })
      .catch(err => { delete cache[name]; throw err; });
  }
  return cache[name];
}

/* The word with sound buttons (or plain, buttons: false). */
export function wordHtml(tokens, { buttons = true, tricky = [], big = true } = {}) {
  let html = "";
  let inSplit = false;
  tokens.forEach((t, i) => {
    const text = t.replace(/^-|-$/g, "");
    const kind = text.length > 1 ? "friend" : "single";
    const cls = ["gr", kind, tricky.includes(i) ? "tricky" : ""].filter(Boolean).join(" ");
    if (t.endsWith("-")) { html += `<span class="gr-split">`; inSplit = true; }
    const splitPart = t.endsWith("-") || t.startsWith("-");
    html += `<span class="${cls}${splitPart ? " split-part" : ""}">${esc(text)}</span>`;
    if (t.startsWith("-") && inSplit) { html += `</span>`; inSplit = false; }
  });
  if (inSplit) html += `</span>`;
  return `<span class="y1-word${big ? " big" : ""}${buttons ? " buttons" : ""}" lang="en-GB">${html}</span>`;
}

/* Adaptive stats for Year 1, one per "<kind>:<id>". */
export function y1Stats() {
  const store = getStore();
  if (!store.year1) store.year1 = { stats: {} };
  return store.year1.stats;
}

export function pickAdaptive(items, keyOf, lastKey) {
  const stats = y1Stats();
  let pool = items.length > 1 ? items.filter(it => keyOf(it) !== lastKey) : items;
  const st = pool.map(it => stats[keyOf(it)] || newStat(keyOf(it)));
  const picked = weightedPick(st);
  return pool[st.indexOf(picked)];
}

export function noteResult(key, ok) {
  const stats = y1Stats();
  const s = stats[key] || (stats[key] = newStat(key));
  applyResult(s, ok);
  saveStore();
}

export const masteredCount = (items, keyOf) => {
  const stats = y1Stats();
  return items.filter(it => (stats[keyOf(it)]?.mastery || 0) >= 0.8).length;
};

/* =========================
   Round runner
   ---------------------------------------------------------
   cfg: { title, back, subject, domain, mode, rounds, ask(card, done) }
   ask() draws one question into `card` and calls done(ok, { key, show })
   — show: HTML of the right answer for a "Not quite" screen.
========================= */

export function runRounds(el, cfg) {
  const results = [];
  const startedAt = Date.now();
  el.innerHTML = `
    <div class="run-bar">
      <h2>${esc(cfg.title)}</h2>
      <span class="y1-stars" data-stars aria-live="polite"></span>
      <a class="btn quiet" href="${cfg.back}">Stop</a>
    </div>
    <div class="paper-sheet y1-card" data-subject="${cfg.subject}"><div data-card></div></div>`;
  const card = el.querySelector("[data-card]");
  const starsEl = el.querySelector("[data-stars]");
  let committed = false;

  const commit = () => {
    if (committed || !results.length) return;
    committed = true;
    recordAttempt({
      mode: cfg.mode, paperId: "year1", seconds: Math.round((Date.now() - startedAt) / 1000),
      items: results.map(r => ({ qid: r.key, domain: cfg.domain, subject: cfg.subject, marks: 1, earned: r.ok ? 1 : 0, marking: r.self ? "self" : "auto" }))
    });
  };
  window.addEventListener("hashchange", commit, { once: true });

  const drawStars = () => {
    const right = results.filter(r => r.ok).length;
    starsEl.textContent = `${"★".repeat(right)}${"☆".repeat(Math.max(0, cfg.rounds - results.length))}`;
    starsEl.setAttribute("aria-label", `${right} stars`);
  };

  function next() {
    if (results.length >= cfg.rounds) return finish();
    drawStars();
    card.innerHTML = "";
    cfg.ask(card, (ok, info = {}) => {
      results.push({ ok, key: info.key, self: info.self });
      if (info.key) noteResult(info.key, ok);
      drawStars();
      if (ok) {
        card.insertAdjacentHTML("beforeend", `<p class="y1-yes" aria-live="polite">Yes! ★</p>`);
        setTimeout(next, info.self ? 250 : 900);
      } else {
        card.insertAdjacentHTML("beforeend", `
          <div class="y1-no">
            ${info.show ? `<p>It's</p><div>${info.show}</div>` : `<p>Keep practising this one.</p>`}
            <button class="primary" data-next>Next</button>
          </div>`);
        const b = card.querySelector("[data-next]");
        b.focus();
        b.addEventListener("click", next);
      }
    });
  }

  function finish() {
    commit();
    const right = results.filter(r => r.ok).length;
    starsEl.textContent = "";
    card.innerHTML = `
      <div class="y1-finish">
        <div class="y1-finish-stars">${"★".repeat(right)}${right ? "" : "☆"}</div>
        <p class="y1-finish-text">${right === results.length ? "All of them — brilliant!" : right >= results.length / 2 ? `${right} stars — well done!` : `${right} star${right === 1 ? "" : "s"}. Let's keep practising!`}</p>
        <p><button class="primary" data-again>Play again</button> <a class="btn" href="${cfg.back}">Back</a></p>
      </div>`;
    card.querySelector("[data-again]").addEventListener("click", () => runRounds(el, cfg));
  }

  next();
}

/* Two big self-check buttons (child or grown-up decides). */
export function selfCheck(card, done, key, show) {
  card.insertAdjacentHTML("beforeend", `
    <div class="y1-self">
      <button class="y1-self-btn yes" data-yes>✓ I got it</button>
      <button class="y1-self-btn" data-no>Not yet</button>
    </div>`);
  const off = () => card.querySelectorAll(".y1-self button").forEach(b => { b.disabled = true; });
  card.querySelector("[data-yes]").addEventListener("click", () => { off(); done(true, { key, self: true }); });
  card.querySelector("[data-no]").addEventListener("click", () => { off(); done(false, { key, self: true, show }); });
}
