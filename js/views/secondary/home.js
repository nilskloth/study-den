/* =========================================================
   Secondary home + routing.
     #/secondary                       language cards
     #/secondary/<lang>                vocabulary trainer setup
     #/secondary/<lang>/list/<secId>   word list for one topic
     #/secondary/<lang>/verbs[/<id>]   verb tables: setup, or one table
     #/secondary/science[/learn/<id>]  Year 7 science revision trainer
   ========================================================= */

import { esc } from "../../core/utils.js";
import { LANGS, loadBank, isKnown, vocabState } from "./langs.js";
import { renderVocab } from "./vocab.js";
import { renderVerbs } from "./verbs.js";
import { renderScience, loadScience, SCIENCE } from "./science.js";

export function renderSecondary(el, params = []) {
  if (params[0] === "science") return renderScience(el, params.slice(1));
  if (params[0] && LANGS[params[0]] && params[1] === "verbs") return renderVerbs(el, params[0], params.slice(2));
  if (params[0] && LANGS[params[0]]) return renderVocab(el, params[0], params.slice(1));
  renderHub(el);
}

async function renderHub(el) {
  el.innerHTML = `
    <div class="card" style="margin-bottom:var(--sp-4);">
      <h2 style="margin-top:0;">Year 7</h2>
      <p class="muted" style="margin-bottom:0;">Learn the words and phrases from each chapter, or revise a science topic, then test yourself.</p>
    </div>
    <div class="subject-grid" data-cards></div>`;
  const grid = el.querySelector("[data-cards]");

  for (const lang of Object.values(LANGS)) {
    let bank = null;
    try { bank = await loadBank(lang.code); } catch { /* no lists yet */ }
    let detail = "Coming soon";
    if (bank) {
      const items = bank.chapters.flatMap(c => c.sections.flatMap(s => s.items));
      const known = items.filter(i => isKnown(lang.code, i.id)).length;
      detail = `${bank.chapters.length} chapter${bank.chapters.length === 1 ? "" : "s"} · ${known} of ${items.length} words known`;
    }
    const card = document.createElement(bank ? "a" : "div");
    card.className = `subject-card${bank ? "" : " disabled"}`;
    card.dataset.subject = lang.subject;
    if (bank) card.href = `#/secondary/${lang.code}`;
    card.innerHTML = `
      <div class="subject-card-band"></div>
      <div class="subject-card-body">
        <strong>${esc(lang.label)} vocabulary</strong>
        <span>${esc(detail)}</span>
      </div>`;
    grid.appendChild(card);
  }

  /* Science revision: topics with notes, diagrams and questions */
  let sci = null;
  try { sci = await loadScience(); } catch { /* not deployed yet */ }
  if (sci) {
    const qs = sci.topics.flatMap(t => t.questions);
    const stats = vocabState(SCIENCE.code).stats;
    const known = qs.filter(q => (stats[q.id]?.mastery || 0) >= 0.8).length;
    const card = document.createElement("a");
    card.className = "subject-card";
    card.dataset.subject = SCIENCE.subject;
    card.href = "#/secondary/science";
    card.innerHTML = `
      <div class="subject-card-band"></div>
      <div class="subject-card-body">
        <strong>Science revision</strong>
        <span>${sci.topics.length} topics · ${known} of ${qs.length} questions mastered</span>
      </div>`;
    grid.appendChild(card);
  }

  /* Year 6 SATs papers and practice stay available */
  const sats = document.createElement("a");
  sats.className = "subject-card";
  sats.dataset.subject = "maths";
  sats.href = "#/home";
  sats.innerHTML = `
    <div class="subject-card-band"></div>
    <div class="subject-card-body">
      <strong>Year 6 SATs</strong>
      <span>Papers and practice from primary school</span>
    </div>`;
  grid.appendChild(sats);
}
