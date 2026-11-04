/* =========================================================
   State, one saved copy per child (core/profiles.js): Finn's is
   the original key ks2_sats_v2, Oskar's studyden_oskar. Settings
   that belong to the device (the shared key) are copied to every
   child's copy.
   On first boot, imports what it can from the v1 keys
   (ks2_sats_runner_v1) without touching them, so the old
   site keeps working until switchover.
   ========================================================= */

import { noteAttempt } from "./activity.js";
import { PROFILES, profileById, activeProfileId, rememberProfile } from "./profiles.js";

const FIRST_KEY = "ks2_sats_v2";          // Finn's — everything from before profiles
let KEY = FIRST_KEY;
let profile = null;
const V1_KEY = "ks2_sats_runner_v1";

let store = null;

function defaultStore() {
  return {
    version: 2,
    settings: {
      proxyToken: "",
      dailyMinutes: 15,
      examDate: "2027-05-11",
      level: null          // stage in use: "year1" | "primary" | "secondary" (profile's own by default)
    },
    attempts: [],        // { id, ts, mode, paperId?, seconds, items:[{qid, domain, subject, marks, earned, marking}] }
    domainStats: {},     // "reading.2d" -> { attempts, marksSeen, marksEarned, ewma, lastSeen }
    spelling: { wordsByWord: {} },
    vocab: {},           // per language: { "de": { "<itemId>|<direction>": adaptive stat } }
    generatedBanks: { reading: { passages: [], questions: [] }, gps: [], maths: [] }
  };
}

function importFromV1(fresh) {
  let v1;
  try {
    v1 = JSON.parse(localStorage.getItem(V1_KEY) || "null");
  } catch {
    return fresh;
  }
  if (!v1 || typeof v1 !== "object") return fresh;

  const words = v1.progress?.spelling?.wordsByWord;
  if (words && typeof words === "object") {
    fresh.spelling.wordsByWord = words; // adaptive history carries over verbatim
  }

  const paperAttempts = v1.progress?.paperAttempts;
  if (Array.isArray(paperAttempts)) {
    fresh.attempts = paperAttempts.map((a, i) => ({
      id: `v1-${i}`,
      ts: a.timestamp || 0,
      mode: "paper",
      paperId: a.paperId,
      seconds: a.seconds || 0,
      legacy: true,        // no per-domain detail available from v1
      score: a.score,
      total: a.total,
      items: []
    }));
  }
  return fresh;
}

function readKey(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}

/* Load the active child's copy (Finn's when nobody is chosen yet). */
export function initStore() {
  profile = profileById(activeProfileId());
  KEY = profile ? profile.key : FIRST_KEY;
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    raw = null;
  }
  if (KEY !== FIRST_KEY && !(raw && raw.version === 2)) {
    /* a new child: fresh progress, the device's shared key */
    store = defaultStore();
    store.settings.proxyToken = readKey(FIRST_KEY)?.settings?.proxyToken || "";
    store.settings.level = profile.stage;
    saveStore();
    return store;
  }
  if (raw && raw.version === 2) {
    store = raw;
    /* fields added after first release */
    if (!("level" in store.settings)) store.settings.level = null;
    if (!store.vocab) store.vocab = {};
  } else {
    store = importFromV1(defaultStore());
    saveStore();
  }
  return store;
}

export function getStore() {
  return store;
}

export const getProfile = () => profile;

/* Switch child: remember it on this device and load their copy. */
export function setProfile(id) {
  const p = profileById(id);
  if (!p) return;
  rememberProfile(p.id);
  initStore();
  if (!store.settings.level) { store.settings.level = p.stage; saveStore(); }
}

/* Another child's saved progress, read-only (Grown-ups). */
export function peekStore(id) {
  const p = profileById(id);
  if (!p) return null;
  if (p.key === KEY) return store;
  const raw = readKey(p.key);
  return raw && raw.version === 2 ? raw : defaultStore();
}

/* The shared key belongs to the device: write it into every child's copy. */
export function setProxyToken(token) {
  store.settings.proxyToken = token;
  saveStore();
  PROFILES.forEach(p => {
    if (p.key === KEY) return;
    const raw = readKey(p.key);
    if (!raw || raw.version !== 2) return;
    raw.settings.proxyToken = token;
    try { localStorage.setItem(p.key, JSON.stringify(raw)); } catch { /* full */ }
  });
}

export function saveStore() {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function setLevel(level) {
  store.settings.level = level;
  saveStore();
}

export function resetStore() {
  store = defaultStore();
  if (profile) store.settings.level = profile.stage;
  saveStore();
  return store;
}

/* Delete one child's progress on this device (keeps the shared key). */
export function resetProfile(id) {
  const p = profileById(id);
  if (!p) return;
  if (p.key === KEY) { const token = store.settings.proxyToken; resetStore(); store.settings.proxyToken = token; saveStore(); return; }
  try { localStorage.removeItem(p.key); } catch { /* blocked */ }
}

/* Record a finished run and fold each item into per-domain stats.
   items: [{ qid, domain, subject, marks, earned, marking }] */
const EWMA_ALPHA = 0.3;

export function recordAttempt({ mode, paperId, seconds, items }) {
  const attempt = {
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ts: Date.now(),
    mode, paperId, seconds, items
  };
  store.attempts.push(attempt);

  items.forEach(it => {
    const key = `${it.subject}.${it.domain}`;
    const d = store.domainStats[key] ||
      (store.domainStats[key] = { attempts: 0, marksSeen: 0, marksEarned: 0, ewma: null, lastSeen: 0 });
    d.attempts += 1;
    d.marksSeen += it.marks;
    d.marksEarned += it.earned;
    const score = it.marks ? it.earned / it.marks : 0;
    d.ewma = d.ewma == null ? score : EWMA_ALPHA * score + (1 - EWMA_ALPHA) * d.ewma;
    d.lastSeen = attempt.ts;
  });

  saveStore();
  noteAttempt(attempt);
  return attempt;
}
