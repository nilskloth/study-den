/* =========================================================
   Year 1 (Oskar): phonics and tricky words.
     #/year1                hub
     #/year1/sounds         sounds: see them all, or a round of 10
     #/year1/read           read words (real + alien) with sound buttons
     #/year1/alien          real word or alien word?
     #/year1/listen         which word did you hear?
     #/year1/tricky[/…]     tricky words (views/year1/tricky.js)
   Content: data/content/year1/phonics.json, tricky.json.
   Speech: real words are read by the en-GB voice; single sounds
   and alien words are not (a computer voice says them wrongly) —
   those are checked by the child or a grown-up.
   ========================================================= */

import { getStore, saveStore } from "../../core/store.js";
import { esc, shuffle, pickN } from "../../core/utils.js";
import { speak, canSpeak } from "../../core/speech.js";
import { loadYear1, wordHtml, runRounds, selfCheck, pickAdaptive, masteredCount } from "./word.js";
import { renderTricky } from "./tricky.js";

const ROUNDS = 10;
const say = text => speak(text, "en-GB", { slow: true });

function prefs() {
  const store = getStore();
  if (!store.year1) store.year1 = { stats: {} };
  return store.year1.prefs || (store.year1.prefs = { sets: ["set1", "set1f"], buttons: true });
}

export async function renderYear1(el, params = []) {
  el.dataset.subject = "phonics";
  el.innerHTML = `<div class="card"><p class="muted">Getting the sounds ready…</p></div>`;
  let ph;
  try { ph = await loadYear1("phonics"); } catch (err) {
    el.innerHTML = `<div class="card"><p>The sounds couldn't load. Check the connection and refresh.</p><p class="muted">${esc(err.message)}</p></div>`;
    return;
  }
  const [page, ...rest] = params;
  if (page === "tricky") return renderTricky(el, rest);
  if (page === "sounds") return renderSounds(el, ph);
  if (page === "read") return setupWords(el, ph, "read");
  if (page === "alien") return setupWords(el, ph, "alien");
  if (page === "listen") return setupWords(el, ph, "listen");
  return renderHub(el, ph);
}

/* =========================
   Hub
========================= */

async function renderHub(el, ph) {
  const sounds = ph.sets.flatMap(s => s.sounds);
  const real = ph.words.filter(w => w.real);
  let tricky = [];
  try { tricky = (await loadYear1("tricky")).words; } catch { /* shows 0 */ }
  const card = (href, subject, title, sub) => `
    <a class="subject-card y1-hub-card" href="${href}" data-subject="${subject}">
      <div class="subject-card-band"></div>
      <div class="subject-card-body"><strong>${title}</strong><span>${sub}</span></div>
    </a>`;
  el.innerHTML = `
    <div class="card" style="margin-bottom:var(--sp-4);">
      <h2 style="margin-top:0;">Hello, Oskar!</h2>
      <p class="muted" style="margin-bottom:0;">What shall we practise today?</p>
    </div>
    <div class="subject-grid">
      ${card("#/year1/sounds", "phonics", "Sounds", `${masteredCount(sounds, s => `s:${s.id}`)} of ${sounds.length} sounds known`)}
      ${card("#/year1/read", "phonics", "Read words", `Real words and alien words · ${masteredCount(ph.words, w => `w:${w.id}`)} of ${ph.words.length} read`)}
      ${card("#/year1/alien", "phonics", "Real or alien?", "Is it a real word, or a made-up one?")}
      ${canSpeak() ? card("#/year1/listen", "phonics", "Which word?", `Listen and find the word · ${real.length} words`) : ""}
      ${card("#/year1/tricky", "tricky", "Tricky words", `${masteredCount(tricky, w => `t:${w.id}`)} of ${tricky.length} known`)}
    </div>`;
}

/* =========================
   Sounds
========================= */

const soundTile = s => `<span class="y1-sound">${esc(s.g)}</span>`;

function exampleWord(ph, s) {
  const w = ph.words.find(x => x.real && x.word === s.word);
  return w ? wordHtml(w.g, { big: false }) : `<span class="y1-word">${esc(s.word)}</span>`;
}

function renderSounds(el, ph) {
  const p = prefs();
  el.innerHTML = `
    <div class="run-bar"><h2>Sounds</h2><a class="btn quiet" href="#/year1">Back</a></div>
    <div class="card setup-card">
      <p class="muted" style="margin-top:0;">Tap a sound to hear a word with it.</p>
      ${ph.sets.map(set => `
        <h3>${esc(set.title)}</h3>
        <div class="y1-sound-grid">
          ${set.sounds.map(s => `<button type="button" class="y1-sound-btn" data-sound="${esc(s.id)}">${esc(s.g)}</button>`).join("")}
        </div>`).join("")}
      <p class="muted" data-example style="min-height:3em;margin-bottom:0;"></p>
    </div>
    ${setPicker(ph, p)}
    <div class="start-bar"><button class="primary" data-start>Start · ${ROUNDS} sounds</button></div>`;

  const all = ph.sets.flatMap(s => s.sounds);
  el.querySelectorAll("[data-sound]").forEach(b => b.addEventListener("click", () => {
    const s = all.find(x => x.id === b.dataset.sound);
    el.querySelector("[data-example]").innerHTML = `<strong>${esc(s.g)}</strong> as in ${exampleWord(ph, s)}`;
    say(s.word);
  }));
  wireSetPicker(el, p);
  el.querySelector("[data-start]").addEventListener("click", () => {
    const pool = ph.sets.filter(s => p.sets.includes(s.id)).flatMap(s => s.sounds);
    if (!pool.length) return;
    let last = null;
    runRounds(el, {
      title: "Sounds", back: "#/year1/sounds", subject: "phonics", domain: "Sounds", mode: "y1-sounds", rounds: ROUNDS,
      ask(card, done) {
        const s = pickAdaptive(pool, x => `s:${x.id}`, last);
        last = `s:${s.id}`;
        card.innerHTML = `
          <p class="y1-ask">What sound is this?</p>
          <div class="y1-big-sound">${soundTile(s)}</div>
          <p class="y1-hint"><button type="button" class="quiet" data-hear>🔊 Hear a word with it</button></p>
          <p class="y1-example hidden" data-ex>${esc(s.g)} as in ${exampleWord(ph, s)}</p>`;
        card.querySelector("[data-hear]").addEventListener("click", () => {
          card.querySelector("[data-ex]").classList.remove("hidden");
          say(s.word);
        });
        selfCheck(card, done, `s:${s.id}`, `<p class="y1-example">${esc(s.g)} as in ${exampleWord(ph, s)}</p>`);
      }
    });
  });
}

/* Which sound sets to use (shared by all phonics activities). */
function setPicker(ph, p) {
  return `
    <div class="card setup-card">
      <h3>Which sounds?</h3>
      <div class="y1-set-picks">
        ${ph.sets.map(s => `<label class="y1-chip"><input type="checkbox" data-set="${s.id}" ${p.sets.includes(s.id) ? "checked" : ""}><span>${esc(s.title)}</span></label>`).join("")}
      </div>
    </div>`;
}

function wireSetPicker(el, p) {
  el.querySelectorAll("[data-set]").forEach(c => c.addEventListener("change", () => {
    p.sets = [...el.querySelectorAll("[data-set]:checked")].map(x => x.dataset.set);
    el.querySelector("[data-start]").disabled = !p.sets.length;
    saveStore();
  }));
  el.querySelector("[data-start]").disabled = !p.sets.length;
}

/* =========================
   Word activities
========================= */

const TITLES = { read: "Read words", alien: "Real or alien?", listen: "Which word?" };
const INTRO = {
  read: "Say each sound, then blend them together to read the word. Alien words are made up — read them anyway!",
  alien: "Read the word. Is it a real word, or an alien word (made up)?",
  listen: "Listen to the word, then tap the one you heard."
};

function setupWords(el, ph, kind) {
  const p = prefs();
  el.innerHTML = `
    <div class="run-bar"><h2>${TITLES[kind]}</h2><a class="btn quiet" href="#/year1">Back</a></div>
    <div class="card setup-card">
      <p style="margin-top:0;">${INTRO[kind]}</p>
      <p class="muted" style="margin-bottom:0;">Under each word: a <strong>dot</strong> for a sound with one letter, a <strong>line</strong> for special friends — letters that make one sound together.</p>
      ${kind === "read" ? `<p style="margin-bottom:0;"><label class="y1-chip"><input type="checkbox" data-buttons ${p.buttons ? "checked" : ""}><span>Show sound buttons</span></label></p>` : ""}
    </div>
    ${setPicker(ph, p)}
    <div class="start-bar"><button class="primary" data-start>Start · ${ROUNDS} words</button></div>`;
  wireSetPicker(el, p);
  el.querySelector("[data-buttons]")?.addEventListener("change", e => { p.buttons = e.target.checked; saveStore(); });
  el.querySelector("[data-start]").addEventListener("click", () => {
    const inSets = ph.words.filter(w => p.sets.includes(w.set));
    const pool = kind === "listen" ? inSets.filter(w => w.real) : inSets;
    if (!pool.length) return;
    runRounds(el, { title: TITLES[kind], back: `#/year1/${kind}`, subject: "phonics", domain: TITLES[kind],
      mode: `y1-${kind}`, rounds: ROUNDS, ask: ASK[kind](ph, pool, p) });
  });
}

const alienBadge = `<span class="y1-alien" title="An alien word — it's made up">👽 alien word</span>`;

const ASK = {
  read(ph, pool, p) {
    let last = null;
    return (card, done) => {
      const w = pickAdaptive(pool, x => `w:${x.id}`, last);
      last = `w:${w.id}`;
      card.innerHTML = `
        <p class="y1-ask">${w.real ? "Read the word" : `Read the ${alienBadge}`}</p>
        <div class="y1-show">${wordHtml(w.g, { buttons: p.buttons })}</div>
        <p class="y1-hint">${w.real && canSpeak() ? `<button type="button" class="quiet" data-hear>🔊 Check: hear it</button>` : w.real ? "" : "Ask a grown-up to listen."}</p>`;
      card.querySelector("[data-hear]")?.addEventListener("click", () => say(w.word));
      selfCheck(card, done, `w:${w.id}`, wordHtml(w.g));
    };
  },

  alien(ph, pool, p) {
    let last = null;
    /* half real, half alien, whatever the pool's mix */
    const reals = pool.filter(w => w.real), aliens = pool.filter(w => !w.real);
    return (card, done) => {
      const from = (Math.random() < 0.5 && aliens.length) || !reals.length ? aliens : reals;
      const w = pickAdaptive(from, x => `ra:${x.id}`, last);
      last = `ra:${w.id}`;
      card.innerHTML = `
        <p class="y1-ask">Real word or alien word?</p>
        <div class="y1-show">${wordHtml(w.g, { buttons: p.buttons })}</div>
        <div class="y1-two">
          <button class="y1-choice" data-real="1">Real word</button>
          <button class="y1-choice" data-real="0">👽 Alien word</button>
        </div>`;
      card.querySelectorAll("[data-real]").forEach(b => b.addEventListener("click", () => {
        card.querySelectorAll("[data-real]").forEach(x => { x.disabled = true; });
        const ok = (b.dataset.real === "1") === w.real;
        b.classList.add(ok ? "is-correct" : "is-wrong");
        if (w.real && canSpeak()) say(w.word);
        done(ok, { key: `ra:${w.id}`, show: `<p class="y1-example">${wordHtml(w.g, { big: false })} is ${w.real ? "a real word" : "an alien word — it's made up"}.</p>` });
      }));
    };
  },

  listen(ph, pool) {
    let last = null;
    const reals = ph.words.filter(w => w.real);
    return (card, done) => {
      const w = pickAdaptive(pool, x => `l:${x.id}`, last);
      last = `l:${w.id}`;
      const options = shuffle([w, ...distractors(w, reals)]);
      card.innerHTML = `
        <p class="y1-ask">Which word did you hear?</p>
        <p class="y1-hint"><button type="button" class="y1-listen" data-hear>🔊 Listen again</button></p>
        <div class="y1-options">
          ${options.map((o, i) => `<button class="y1-choice" data-opt="${i}">${wordHtml(o.g, { buttons: false, big: false })}</button>`).join("")}
        </div>`;
      const hear = () => say(w.word);
      card.querySelector("[data-hear]").addEventListener("click", hear);
      setTimeout(hear, 250);
      card.querySelectorAll("[data-opt]").forEach(b => b.addEventListener("click", () => {
        card.querySelectorAll("[data-opt]").forEach(x => { x.disabled = true; });
        const ok = options[Number(b.dataset.opt)] === w;
        b.classList.add(ok ? "is-correct" : "is-wrong");
        done(ok, { key: `l:${w.id}`, show: wordHtml(w.g) });
      }));
    };
  }
};

/* Two words that differ from w by one sound if possible (ship → shop, chip). */
function distractors(w, reals) {
  const others = reals.filter(x => x !== w);
  const diff = x => (x.g.length !== w.g.length ? 99 : x.g.filter((t, i) => t !== w.g[i]).length);
  const close = shuffle(others.filter(x => diff(x) === 1));
  const picked = close.slice(0, 2);
  if (picked.length < 2) {
    const sameSet = shuffle(others.filter(x => x.set === w.set && !picked.includes(x)));
    picked.push(...sameSet.slice(0, 2 - picked.length));
  }
  if (picked.length < 2) picked.push(...pickN(others.filter(x => !picked.includes(x)), 2 - picked.length));
  return picked;
}
