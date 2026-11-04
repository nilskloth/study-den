/* =========================================================
   Study Den — boot + hash router.
   #/start asks who is practising (core/profiles.js); each child
   has a stage — Year 1, Primary (Year 6 SATs) or Secondary — with
   its own home and nav. A child only sees their own stages.
   ========================================================= */

import { initStore, getStore, setLevel, getProfile } from "./store.js";
import { stagesOf } from "./profiles.js";
import { renderYear1 } from "../views/year1/home.js";
import { startActivity } from "./activity.js";
import { loadContent } from "./loader.js";
import { renderHome } from "../views/home.js";
import { renderPractice } from "../views/practice.js";
import { renderPapers } from "../views/paper.js";
import { renderProgress } from "../views/progress.js";
import { renderStart } from "../views/start.js";
import { renderSecondary } from "../views/secondary/home.js";
import { availableLangs } from "../views/secondary/langs.js";
import { loadScience } from "../views/secondary/science.js";

const ROUTES = [
  { path: "start", render: renderStart },
  { path: "year1", level: "year1", render: renderYear1 },
  { path: "home", level: "primary", render: renderHome },
  { path: "papers", level: "primary", render: renderPapers },
  { path: "practice", level: "primary", render: renderPractice },
  { path: "secondary", level: "secondary", render: renderSecondary },
  { path: "grown-ups", render: renderProgress }
];

const NAV = {
  year1: [
    { href: "#/year1", label: "Home", match: "year1" },
    { href: "#/year1/sounds", label: "Sounds", match: "year1/sounds" },
    { href: "#/year1/read", label: "Read words", match: "year1/read" },
    { href: "#/year1/tricky", label: "Tricky words", match: "year1/tricky" },
    { href: "#/grown-ups", label: "Grown-ups", match: "grown-ups" }
  ],
  primary: [
    { href: "#/home", label: "Home", match: "home" },
    { href: "#/papers", label: "Papers", match: "papers" },
    { href: "#/practice", label: "Practice", match: "practice" },
    { href: "#/grown-ups", label: "Grown-ups", match: "grown-ups" }
  ],
  secondary: [
    { href: "#/secondary", label: "Home", match: "secondary" },
    /* one item per language with word lists — filled in by refreshLanguageNav() */
    { href: "#/grown-ups", label: "Grown-ups", match: "grown-ups" }
  ]
};

/* Languages appear in the nav once they have word lists (built in or uploaded);
   Science once its question file is there. */
async function refreshLanguageNav() {
  const langs = await availableLangs();
  const science = await loadScience().then(() => true).catch(() => false);
  NAV.secondary = [
    NAV.secondary[0],
    ...langs.map(l => ({ href: `#/secondary/${l.code}`, label: l.label, match: `secondary/${l.code}` })),
    ...(science ? [{ href: "#/secondary/science", label: "Science", match: "secondary/science" }] : []),
    NAV.secondary[NAV.secondary.length - 1]
  ];
  const { path, params } = parseHash();
  if (getStore().settings.level === "secondary") buildChrome("secondary", path, params);
}

const HOME = { year1: "#/year1", primary: "#/home", secondary: "#/secondary" };

function parseHash() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  return { path: parts[0] || "", params: parts.slice(1) };
}

function buildChrome(level, path, params) {
  const nav = document.querySelector(".app-nav");
  nav.innerHTML = "";
  const profile = getProfile();
  if (!level || !profile || path === "start") return;

  const here = [path, ...params].join("/");
  const items = NAV[level];
  /* longest matching prefix wins, so "secondary/de" beats "secondary" */
  const active = items.filter(i => here === i.match || here.startsWith(i.match + "/"))
    .sort((a, b) => b.match.length - a.match.length)[0];

  items.forEach(i => {
    const a = document.createElement("a");
    a.href = i.href;
    a.textContent = i.label;
    if (i === active) a.classList.add("active");
    nav.appendChild(a);
  });

  const sw = document.createElement("a");
  sw.href = "#/start";
  sw.className = "level-switch";
  sw.textContent = `${profile.name} ⇄`;
  sw.title = "Someone else practising? Switch here";
  nav.appendChild(sw);
}

function route() {
  const store = getStore();
  const profile = getProfile();
  let { path, params } = parseHash();
  if (!profile && path !== "start" && path !== "grown-ups") { location.replace("#/start"); return; }
  const allowed = stagesOf(profile);
  let level = allowed.includes(store.settings.level) ? store.settings.level : profile?.stage;

  if (!path) { location.replace(HOME[level]); return; }

  const match = ROUTES.find(r => r.path === path);
  if (!match) { location.replace(HOME[level]); return; }
  /* another child's stage (e.g. an old bookmark): go home instead */
  if (match.level && !allowed.includes(match.level)) { location.replace(HOME[profile.stage]); return; }

  /* A deep link into the child's other stage switches stage. */
  if (match.level && match.level !== level) {
    setLevel(match.level);
    level = match.level;
  }

  buildChrome(level, path, params);

  const view = document.getElementById("view");
  view.innerHTML = "";
  delete view.dataset.subject;
  match.render(view, params);
}

(async function boot() {
  const view = document.getElementById("view");
  try {
    initStore();
    startActivity();
    view.innerHTML = `<div class="card"><p class="muted">Getting your questions ready…</p></div>`;
    await loadContent();
    window.addEventListener("hashchange", route);
    route();
    refreshLanguageNav();
    window.addEventListener("langs-changed", refreshLanguageNav);   // after a word-list upload
    console.log("Study Den ready");
  } catch (err) {
    console.error("Failed to start:", err);
    view.innerHTML = `
      <div class="card">
        <h2 style="margin-top:0;">Something needs fixing</h2>
        <p>The question files couldn't load. Check your connection and refresh the page.</p>
        <p class="muted">${String(err.message || err)}</p>
      </div>`;
  }
})();
