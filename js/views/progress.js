/* =========================================================
   Grown-ups view: per-domain mastery, run-up to the SATs,
   AI usage/spend, settings (proxy token), data management.
   ========================================================= */

import { getStore, resetProfile, setProxyToken, peekStore, getProfile, initStore } from "../core/store.js";
import { deviceProfiles, profileById, removeGuest } from "../core/profiles.js";
import { loadContent } from "../core/loader.js";
import { ping, usage } from "../core/ai.js";
import { generateReadingTest } from "../gen/generate.js";
import { esc } from "../core/utils.js";
import { domainLabel } from "./paper.js";
import { renderWordLists } from "./wordlists.js";
import { renderActivity } from "./activity.js";
import { grownUpsPassword, unlockGrownUps } from "../core/grownups-lock.js";

const SUBJECT_LABELS = { reading: "Reading", gps: "Grammar & punctuation", maths: "Maths", spelling: "Spelling",
  german: "German vocabulary", french: "French vocabulary", science: "Science revision", geography: "Geography revision", maths7: "Maths revision (Year 7)",
  phonics: "Phonics", tricky: "Tricky words" };

/* Sonnet 5 pricing (per MTok): in $3 / out $15 — rough spend estimate. */
function estimateSpend(log) {
  let inTok = 0;
  let outTok = 0;
  log.forEach(r => { inTok += r.in_tokens || 0; outTok += r.out_tokens || 0; });
  return { inTok, outTok, usd: (inTok * 3 + outTok * 15) / 1e6 };
}

/* Failed sign-ins on the server (wrong shared key / upload password). */
function securityHtml(sec, uploads) {
  if (!sec) return "";
  const kind = f => (f.kind === "upload-password" ? "wrong upload password"
    : f.kind === "family-pin" ? `wrong PIN${f.child ? ` for ${f.child[0].toUpperCase()}${f.child.slice(1)}` : ""}` : "wrong shared key");
  const alerts = uploads?.alerts ? "You're emailed about these (at most once an hour)." : "Email alerts are off — set alert_email in api/config.php.";
  if (!sec.fails?.length) return `<p class="muted">No failed sign-in attempts. ${alerts}</p>`;
  return `
    <div class="mark-note ${sec.locked ? "wrong" : "partial"}" style="margin-top:var(--sp-3);">
      <strong>${sec.total} failed sign-in attempt${sec.total === 1 ? "" : "s"}</strong>${sec.locked ? " — uploading is locked for now" : ""}.
      <span class="muted">${alerts}</span>
      <ul style="margin:var(--sp-2) 0 0;padding-left:1.2em;">
        ${sec.fails.map(f => `<li>${esc(new Date(f.ts).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }))} — ${kind(f)} from ${esc(f.ip)}</li>`).join("")}
      </ul>
    </div>`;
}

const LOCK_ERRORS = {
  bad_password: "That password isn't right.",
  no_password: "No upload password is set on the server yet — run php tools/set-upload-password.php, then deploy."
};

/* Everything under Grown-ups waits for the upload password (once per visit). */
function renderLock(el, params) {
  el.innerHTML = `
    <div class="start start-narrow">
      <h2>Grown-ups</h2>
      <p class="muted">Progress, activity, settings and word lists. Type the upload password.</p>
      <form class="start-form" data-lock-form>
        <input class="start-input" data-password type="password" autocomplete="current-password" aria-label="Upload password" placeholder="Password" style="width:14em;">
        <button class="primary" type="submit">Open</button>
      </form>
      <p class="start-msg" data-msg role="status"></p>
      <p class="muted"><a href="#/start">← Back to practising</a></p>
    </div>`;
  const input = el.querySelector("[data-password]");
  const msg = el.querySelector("[data-msg]");
  input.focus();
  el.querySelector("[data-lock-form]").addEventListener("submit", async e => {
    e.preventDefault();
    if (!input.value) return;
    msg.textContent = "Checking…";
    try {
      await unlockGrownUps(input.value);
      renderProgress(el, params);
    } catch (err) {
      msg.textContent = LOCK_ERRORS[err.code] || err.message;
      input.value = "";
      input.focus();
    }
  });
}

export function renderProgress(el, params = []) {
  if (!grownUpsPassword()) return renderLock(el, params);
  if (params[0] === "word-lists") return renderWordLists(el);
  if (params[0] === "activity") return renderActivity(el);
  /* #/grown-ups/<child>: whose progress to show (this device's copy) */
  const here = deviceProfiles();
  const shown = profileById(params[0]) || getProfile() || here[here.length - 1] || null;
  const store = shown ? peekStore(shown.id) : getStore();
  const stats = store.domainStats;
  const sats = !!shown && (shown.stages || [shown.stage]).includes("primary");

  /* Domain mastery grouped by subject */
  const bySubject = {};
  Object.entries(stats).forEach(([key, d]) => {
    const [subject, domain] = key.split(".");
    (bySubject[subject] = bySubject[subject] || []).push({ domain, ...d });
  });

  const masteryHtml = Object.entries(bySubject).map(([subject, rows]) => {
    rows.sort((a, b) => (a.ewma ?? 0) - (b.ewma ?? 0));
    const bars = rows.map(r => {
      const pct = Math.round((r.ewma ?? 0) * 100);
      return `
        <div class="domain-bar" data-subject="${subject}">
          <span>${esc(domainLabel(r.domain))}</span>
          <span class="track"><span class="fill" style="width:${pct}%"></span></span>
          <span>${pct}%</span>
        </div>`;
    }).join("");
    return `<h3 style="margin-bottom:var(--sp-2);">${esc(SUBJECT_LABELS[subject] || subject)}</h3>
      <div class="domain-bars" style="margin-top:0;margin-bottom:var(--sp-4);">${bars}</div>`;
  }).join("") || `<p class="muted">No practice recorded yet — mastery by topic appears here.</p>`;

  /* Timeline */
  const examDate = new Date(store.settings.examDate || "2027-05-11");
  const weeks = Math.max(0, Math.round((examDate - Date.now()) / (7 * 24 * 3600 * 1000)));
  const attempts = store.attempts.filter(a => !a.legacy);
  const recentPapers = attempts.filter(a => a.mode === "paper").slice(-6);
  const trend = recentPapers.map(a => {
    const earned = a.items.reduce((s, i) => s + i.earned, 0);
    const marks = a.items.reduce((s, i) => s + i.marks, 0);
    return `<span class="muted">${a.paperId}: <strong>${earned}/${marks}</strong></span>`;
  }).join(" · ") || `<span class="muted">No papers completed yet.</span>`;

  el.innerHTML = `
    <div class="child-tabs" role="tablist" aria-label="Whose progress">
      ${here.length ? `<span class="muted">Progress on this device for</span>
      ${here.map(p => `<a href="#/grown-ups/${p.id}" role="tab" class="${p.id === shown?.id ? "active" : ""}" aria-selected="${p.id === shown?.id}">${esc(p.name)} <span class="muted">${esc(p.year)}${p.guest ? " · guest" : ""}</span></a>`).join("")}`
        : `<span class="muted">Nobody practises on this device yet — progress shows here once someone has picked their name on the start screen.</span>`}
    </div>
    <a class="card verb-link" href="#/grown-ups/activity">
      <strong>Activity →</strong>
      <span class="muted">How long and how often the trainer is used, on what, and how well — from all devices.</span>
    </a>

    ${sats ? `<div class="card" style="margin-bottom:var(--sp-4);">
      <h2 style="margin-top:0;">Run-up to the SATs</h2>
      <p><strong>${weeks} weeks</strong> until ${examDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
        ${attempts.length} practice ${attempts.length === 1 ? "session" : "sessions"} recorded.</p>
      <p style="margin-bottom:0;">Recent papers: ${trend}</p>
    </div>` : ""}

    ${shown ? `<div class="card" style="margin-bottom:var(--sp-4);">
      <h2 style="margin-top:0;">${esc(shown.name)}: mastery by topic</h2>
      ${masteryHtml}
      <p class="muted" style="margin-bottom:0;">Bars show a recency-weighted average of marks earned. Self-marked answers count too.</p>
    </div>` : ""}

    <div class="card" style="margin-bottom:var(--sp-4);">
      <h2 style="margin-top:0;">AI marking</h2>
      <p class="muted">Written answers are marked by Claude through your own server. Enter the shared key from <code>api/config.php</code> once; without it (or offline) the app falls back to self-marking checklists.</p>
      <p style="display:flex;gap:var(--sp-2);flex-wrap:wrap;">
        <input data-token type="password" placeholder="Shared key" value="${esc(store.settings.proxyToken || "")}"
          style="font:inherit;padding:var(--sp-2);border:1px solid var(--line);border-radius:6px;width:min(320px,60vw);">
        <button data-save-token class="primary">Save &amp; test</button>
      </p>
      <p data-ai-status class="muted"></p>
      <div data-usage></div>
      <hr style="border:none;border-top:1px solid var(--line-soft);margin:var(--sp-4) 0;">
      <p style="display:flex;gap:var(--sp-2);flex-wrap:wrap;align-items:center;">
        <select data-gen-category style="font:inherit;">
          <option value="fiction">Fiction</option>
          <option value="non-fiction">Non-fiction</option>
          <option value="poetry">Poetry</option>
        </select>
        <input data-gen-theme type="text" placeholder="Theme (optional), e.g. volcanoes"
          style="font:inherit;padding:var(--sp-2);border:1px solid var(--line);border-radius:6px;width:min(240px,50vw);">
        <button data-generate>Generate a new reading test</button>
      </p>
      <p data-gen-status class="muted"></p>
    </div>

    <div class="card" style="margin-bottom:var(--sp-4);">
      <h2 style="margin-top:0;">Word lists</h2>
      <p>Add a chapter to the language trainer (German, French) by uploading photos or a PDF of the vocabulary sheet — Claude reads it, you check it, then publish.
        Needs the shared key above and the upload password.</p>
      <p style="margin-bottom:0;"><a class="btn" href="#/grown-ups/word-lists">Word lists…</a></p>
    </div>

    ${shown ? `<div class="card">
      <h2 style="margin-top:0;">Data</h2>
      <p>
        <button data-export>Export ${esc(shown.name)}'s progress</button>
        <button data-reset style="color:var(--wrong);">Reset ${esc(shown.name)}'s progress…</button>
        ${shown.guest ? `<button data-remove style="color:var(--wrong);">Remove ${esc(shown.name)} from this device…</button>` : ""}
      </p>
      <p class="muted" style="margin-bottom:0;">Progress lives in this browser only, separately for each child. Export before switching devices.
        ${shown.guest ? "Removing a guest takes their name off the start screen here and deletes their progress on this device (their past activity stays in the Activity report)." : ""}</p>
    </div>` : ""}
  `;

  const statusEl = el.querySelector("[data-ai-status]");
  const usageEl = el.querySelector("[data-usage]");

  async function refreshUsage() {
    if (!getStore().settings.proxyToken) {
      statusEl.textContent = "No key saved — self-marking checklists will be used.";
      return;
    }
    statusEl.textContent = "Checking connection…";
    try {
      const data = await ping();
      statusEl.innerHTML = `Connected ✓ — today's allowance left: <strong>${data.remaining.mark}</strong> markings, <strong>${data.remaining.generate}</strong> generations`
        + (data.remaining.import !== undefined ? `, <strong>${data.remaining.import}</strong> word-list uploads.` : ".");
      const u = await usage();
      let html = "";
      if (u.log?.length) {
        const s = estimateSpend(u.log);
        html += `<p class="muted">Recent AI use: ${u.log.length} requests, ~${s.inTok.toLocaleString()} tokens in / ${s.outTok.toLocaleString()} out (≈ $${s.usd.toFixed(3)}).</p>`;
      }
      html += securityHtml(u.security, data.uploads);
      usageEl.innerHTML = html;
    } catch (err) {
      statusEl.textContent = err.code === "unauthorized"
        ? "That key was not accepted — check it matches api/config.php on the server."
        : "Couldn't reach the marking server — the app will use self-marking checklists.";
    }
  }

  el.querySelector("[data-save-token]").addEventListener("click", () => {
    setProxyToken(el.querySelector("[data-token]").value.trim());
    refreshUsage();
  });

  el.querySelector("[data-generate]").addEventListener("click", async () => {
    const btn = el.querySelector("[data-generate]");
    const genStatus = el.querySelector("[data-gen-status]");
    btn.disabled = true;
    try {
      await generateReadingTest({
        category: el.querySelector("[data-gen-category]").value,
        theme: el.querySelector("[data-gen-theme]").value.trim()
      }, text => { genStatus.textContent = text; });
      await loadContent();
      genStatus.innerHTML += ` <a href="#/papers/reading">Try the reading paper</a> — new tests join the pool.`;
    } catch (err) {
      genStatus.textContent = `Couldn't generate a test: ${err.message}`;
    } finally {
      btn.disabled = false;
    }
  });

  if (!shown) { refreshUsage(); return; }

  el.querySelector("[data-remove]")?.addEventListener("click", () => {
    if (window.confirm(`Remove ${shown.name} from this device and delete their progress here?`)) {
      removeGuest(shown.id);
      initStore();                       // they may have been the one chosen here
      location.hash = "#/grown-ups";
      renderProgress(el, []);
    }
  });

  el.querySelector("[data-export]").addEventListener("click", () => {
    /* never the shared key — the file may be passed on */
    const data = { ...store, child: shown.id, settings: { ...store.settings, proxyToken: "" } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `study-den-${shown.id}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  el.querySelector("[data-reset]").addEventListener("click", () => {
    if (window.confirm(`Really delete all of ${shown.name}'s practice history on this device?`)) {
      resetProfile(shown.id);
      renderProgress(el, [shown.id]);
    }
  });

  refreshUsage();
}
