/* =========================================================
   Year 1 tricky words (common exception words).
     #/year1/tricky          all words: sound buttons, tricky part in red,
                             tap to hear the word in a sentence
     #/year1/tricky/find     hear it → tap the word (from 4)
     #/year1/tricky/build    hear it → build it from sound tiles
   Adaptive per word and activity: "t:<id>" (find), "tb:<id>" (build).
   ========================================================= */

import { esc, shuffle, pickN } from "../../core/utils.js";
import { speak, speakWord, canSpeak } from "../../core/speech.js";
import { loadYear1, wordHtml, runRounds, pickAdaptive, y1Stats } from "./word.js";

const ROUNDS = 10;

export async function renderTricky(el, params = []) {
  el.dataset.subject = "tricky";
  let data;
  try { data = await loadYear1("tricky"); } catch (err) {
    el.innerHTML = `<div class="card"><p>The tricky words couldn't load.</p><p class="muted">${esc(err.message)}</p></div>`;
    return;
  }
  const words = data.words;
  if (params[0] === "find") return runFind(el, words);
  if (params[0] === "build") return runBuild(el, words);
  renderList(el, words);
}

const trickyWord = (w, opts = {}) => wordHtml(w.g, { tricky: w.tricky, ...opts });

function renderList(el, words) {
  const stats = y1Stats();
  const known = w => (stats[`t:${w.id}`]?.mastery || 0) >= 0.8;
  el.innerHTML = `
    <div class="run-bar"><h2>Tricky words</h2><a class="btn quiet" href="#/year1">Back</a></div>
    <div class="card setup-card">
      <p style="margin-top:0;">Tricky words have a part that doesn't sound the way you'd expect — it's in <strong class="y1-red">red</strong>.
        The rest you can sound out: a <strong>dot</strong> for one letter, a <strong>line</strong> for special friends.</p>
      <p class="muted" style="margin-bottom:0;">Tap a word to hear it.</p>
    </div>
    <div class="start-bar">
      ${canSpeak() ? `<a class="btn primary" href="#/year1/tricky/find">Find it</a>
      <a class="btn primary" href="#/year1/tricky/build">Build it</a>` : `<span class="muted">Find it and Build it need a device that can speak.</span>`}
    </div>
    <div class="y1-tricky-grid">
      ${words.map(w => `
        <button type="button" class="y1-tricky-card${known(w) ? " known" : ""}" data-word="${esc(w.id)}">
          ${trickyWord(w, { big: false })}
          <span class="y1-why">${esc(w.why)}</span>
        </button>`).join("")}
    </div>
    <p class="muted" data-said style="min-height:2em;"></p>`;
  el.querySelectorAll("[data-word]").forEach(b => b.addEventListener("click", () => {
    const w = words.find(x => x.id === b.dataset.word);
    el.querySelector("[data-said]").textContent = w.sentence;
    speakWord(w.word, w.sentence);
  }));
}

const hearWord = w => speak(w.word, "en-GB", { slow: true });

function runFind(el, words) {
  let last = null;
  runRounds(el, {
    title: "Find the tricky word", back: "#/year1/tricky", subject: "tricky", domain: "Find it", mode: "y1-tricky-find", rounds: ROUNDS,
    ask(card, done) {
      const w = pickAdaptive(words, x => `t:${x.id}`, last);
      last = `t:${w.id}`;
      const near = words.filter(x => x !== w && Math.abs(x.word.length - w.word.length) <= 1);
      const options = shuffle([w, ...pickN(near.length >= 3 ? near : words.filter(x => x !== w), 3)]);
      card.innerHTML = `
        <p class="y1-ask">Find the word you hear</p>
        <p class="y1-hint"><button type="button" class="y1-listen" data-hear>🔊 Listen again</button>
          <button type="button" class="quiet" data-sentence>In a sentence</button></p>
        <div class="y1-options four">
          ${options.map((o, i) => `<button class="y1-choice" data-opt="${i}">${wordHtml(o.g, { buttons: false, big: false })}</button>`).join("")}
        </div>`;
      card.querySelector("[data-hear]").addEventListener("click", () => hearWord(w));
      card.querySelector("[data-sentence]").addEventListener("click", () => speakWord(w.word, w.sentence));
      setTimeout(() => hearWord(w), 250);
      card.querySelectorAll("[data-opt]").forEach(b => b.addEventListener("click", () => {
        card.querySelectorAll("[data-opt]").forEach(x => { x.disabled = true; });
        const ok = options[Number(b.dataset.opt)] === w;
        b.classList.add(ok ? "is-correct" : "is-wrong");
        done(ok, { key: `t:${w.id}`, show: `${trickyWord(w)}<p class="y1-why">${esc(w.why)}</p>` });
      }));
    }
  });
}

/* Decoy tiles: sounds from other tricky words that aren't in this one. */
function decoys(w, words, n) {
  const own = new Set(w.g.map(t => t.toLowerCase()));
  const pool = [...new Set(words.flatMap(x => x.g).map(t => t.toLowerCase()))].filter(t => !own.has(t) && t !== "i");
  return pickN(pool, n);
}

function runBuild(el, words) {
  let last = null;
  runRounds(el, {
    title: "Build the tricky word", back: "#/year1/tricky", subject: "tricky", domain: "Build it", mode: "y1-tricky-build", rounds: ROUNDS,
    ask(card, done) {
      const buildable = words.filter(x => x.g.length > 1);
      const w = pickAdaptive(buildable, x => `tb:${x.id}`, last);
      last = `tb:${w.id}`;
      const tiles = shuffle([...w.g, ...decoys(w, words, 2)]);
      const chosen = [];
      card.innerHTML = `
        <p class="y1-ask">Build the word you hear</p>
        <p class="y1-hint"><button type="button" class="y1-listen" data-hear>🔊 Listen again</button>
          <button type="button" class="quiet" data-sentence>In a sentence</button></p>
        <div class="y1-slots" data-slots></div>
        <div class="y1-tiles">
          ${tiles.map((t, i) => `<button type="button" class="y1-tile${t.length > 1 ? " friend" : ""}" data-tile="${i}">${esc(t)}</button>`).join("")}
        </div>
        <p class="y1-hint"><button type="button" class="quiet" data-undo>↶ Undo</button></p>`;
      const slots = card.querySelector("[data-slots]");
      const draw = () => {
        slots.innerHTML = w.g.map((_, i) => `<span class="y1-slot${chosen[i] != null ? " filled" : ""}">${chosen[i] != null ? esc(tiles[chosen[i]]) : ""}</span>`).join("");
        card.querySelectorAll("[data-tile]").forEach(b => { b.disabled = chosen.includes(Number(b.dataset.tile)); });
      };
      draw();
      card.querySelector("[data-hear]").addEventListener("click", () => hearWord(w));
      card.querySelector("[data-sentence]").addEventListener("click", () => speakWord(w.word, w.sentence));
      setTimeout(() => hearWord(w), 250);
      card.querySelector("[data-undo]").addEventListener("click", () => { chosen.pop(); draw(); });
      card.querySelectorAll("[data-tile]").forEach(b => b.addEventListener("click", () => {
        if (chosen.length >= w.g.length) return;
        chosen.push(Number(b.dataset.tile));
        draw();
        if (chosen.length === w.g.length) {
          card.querySelectorAll("[data-tile], [data-undo]").forEach(x => { x.disabled = true; });
          const built = chosen.map(i => tiles[i]).join("");
          const ok = built === w.word || built.toLowerCase() === w.word.toLowerCase() && w.word !== "I";
          slots.classList.add(ok ? "is-correct" : "is-wrong");
          done(ok, { key: `tb:${w.id}`, show: `${trickyWord(w)}<p class="y1-why">${esc(w.why)}</p>` });
        }
      }));
    }
  });
}
