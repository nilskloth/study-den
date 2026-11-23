/* =========================================================
   Year 1 words to know (the school's high-frequency word cards).
     #/year1/words                    both cards: tap a word to hear it
     #/year1/words/read/<listId>      read it → hear it → ✓ I got it / Not yet
     #/year1/words/find/<listId>      hear it → tap the word (from 4)
   listId: a list in hfw.json, or "all".
   Words are shown whole (no sound buttons). Adaptive per word:
   "hr:<id>" (read), "hf:<id>" (find).
   ========================================================= */

import { esc, shuffle, pickN } from "../../core/utils.js";
import { speak, canSpeak } from "../../core/speech.js";
import { loadYear1, wordHtml, runRounds, pickAdaptive, selfCheck, y1Stats } from "./word.js";

const ROUNDS = 10;
const plain = (w, big = true) => wordHtml([w.word], { buttons: false, big });
const hear = w => speak(w.word, "en-GB", { slow: true });

export async function renderWords(el, params = []) {
  el.dataset.subject = "tricky";
  let data;
  try { data = await loadYear1("hfw"); } catch (err) {
    el.innerHTML = `<div class="card"><p>The words couldn't load.</p><p class="muted">${esc(err.message)}</p></div>`;
    return;
  }
  const [mode, listId] = params;
  const list = data.lists.find(l => l.id === listId);
  const words = list ? data.words.filter(w => w.list === list.id) : data.words;
  const name = list ? list.title : "All the words";
  if (mode === "read") return runRead(el, words, name);
  if (mode === "find" && canSpeak()) return runFind(el, words, name);
  renderList(el, data);
}

function renderList(el, data) {
  const stats = y1Stats();
  const known = w => (stats[`hr:${w.id}`]?.mastery || 0) >= 0.8;
  const buttons = id => `
    <div class="start-bar">
      <a class="btn primary" href="#/year1/words/read/${id}">Read them</a>
      ${canSpeak() ? `<a class="btn primary" href="#/year1/words/find/${id}">Find them</a>` : ""}
    </div>`;
  el.innerHTML = `
    <div class="run-bar"><h2>Words to know</h2><a class="btn quiet" href="#/year1">Back</a></div>
    <div class="card setup-card">
      <p style="margin-top:0;">The words from school's word cards. Lots of them come up on every page of a book —
        the quicker you know them, the easier reading gets.</p>
      <p class="muted" style="margin-bottom:0;">Tap a word to hear it. <strong>Read them</strong>: say the word, then check.
        ${canSpeak() ? "<strong>Find them</strong>: listen and tap the word." : ""}</p>
    </div>
    ${data.lists.map(l => {
      const ws = data.words.filter(w => w.list === l.id);
      return `
      <h3 class="y1-list-head">${esc(l.title)} <span class="muted">· ${esc(l.sub)} · ${ws.filter(known).length} of ${ws.length} read</span></h3>
      ${buttons(l.id)}
      <div class="y1-tricky-grid">
        ${ws.map(w => `<button type="button" class="y1-tricky-card${known(w) ? " known" : ""}" data-word="${esc(w.id)}">${plain(w, false)}</button>`).join("")}
      </div>`;
    }).join("")}`;
  el.querySelectorAll("[data-word]").forEach(b => b.addEventListener("click", () => {
    hear(data.words.find(x => x.id === b.dataset.word));
  }));
}

function runRead(el, words, name) {
  let last = null;
  runRounds(el, {
    title: `Read it · ${name}`, back: "#/year1/words", subject: "tricky", domain: "Words to know: read", mode: "y1-words-read", rounds: ROUNDS,
    ask(card, done) {
      const w = pickAdaptive(words, x => `hr:${x.id}`, last);
      last = `hr:${w.id}`;
      card.innerHTML = `
        <p class="y1-ask">Read this word</p>
        <div class="y1-show">${plain(w)}</div>
        ${canSpeak() ? `<p class="y1-hint"><button type="button" class="y1-listen" data-hear>🔊 Check: hear it</button></p>` : ""}`;
      card.querySelector("[data-hear]")?.addEventListener("click", () => hear(w));
      selfCheck(card, done, `hr:${w.id}`, plain(w));
    }
  });
}

function runFind(el, words, name) {
  let last = null;
  runRounds(el, {
    title: `Find it · ${name}`, back: "#/year1/words", subject: "tricky", domain: "Words to know: find", mode: "y1-words-find", rounds: ROUNDS,
    ask(card, done) {
      const w = pickAdaptive(words, x => `hf:${x.id}`, last);
      last = `hf:${w.id}`;
      /* look-alikes first: same first letter, then a similar length */
      const others = words.filter(x => x !== w && x.word.toLowerCase() !== w.word.toLowerCase());
      const same = others.filter(x => x.word[0].toLowerCase() === w.word[0].toLowerCase());
      const near = others.filter(x => !same.includes(x) && Math.abs(x.word.length - w.word.length) <= 1);
      const picks = pickN(same, 2);
      picks.push(...pickN([...near, ...others].filter(x => !picks.includes(x)), 3 - picks.length).slice(0, 3 - picks.length));
      const options = shuffle([w, ...picks]);
      card.innerHTML = `
        <p class="y1-ask">Find the word you hear</p>
        <p class="y1-hint"><button type="button" class="y1-listen" data-hear>🔊 Listen again</button></p>
        <div class="y1-options four">
          ${options.map((o, i) => `<button class="y1-choice" data-opt="${i}">${plain(o, false)}</button>`).join("")}
        </div>`;
      card.querySelector("[data-hear]").addEventListener("click", () => hear(w));
      setTimeout(() => hear(w), 250);
      card.querySelectorAll("[data-opt]").forEach(b => b.addEventListener("click", () => {
        card.querySelectorAll("[data-opt]").forEach(x => { x.disabled = true; });
        const ok = options[Number(b.dataset.opt)] === w;
        b.classList.add(ok ? "is-correct" : "is-wrong");
        done(ok, { key: `hf:${w.id}`, show: plain(w) });
      }));
    }
  });
}
