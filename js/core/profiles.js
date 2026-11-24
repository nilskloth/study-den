/* =========================================================
   Who is practising. Each child has their own saved progress
   (localStorage key below) and a school stage that decides the
   home screen and nav. The active child is remembered per device
   in localStorage "studyden_profile".

   FAMILY: Finn and Oskar, always on the start screen. Every device
   asks for their PIN once (checked by api/track.php op family), then
   remembers it (list in "studyden_family2" — the "2" because the
   first version let devices that already had progress in without
   the PIN; the parent wanted every device to ask).
   Finn keeps the original key (ks2_sats_v2), so everything saved
   before profiles existed stays his.

   GUESTS: other children, added on the device itself (first name
   + Year 6 or Year 7). They live only in this browser
   ("studyden_guests"); their first name goes with their activity
   records so Grown-ups → Activity can show who practised.
   ========================================================= */

/* The years a secondary child can pick after choosing their name:
   their own first; Year 8 only changes science for now (the other
   subjects are Year 7 material); Year 6 = the primary SATs area. */
const SECONDARY_YEARS = [
  { year: "Year 7", stage: "secondary", sub: "Languages, maths, science, geography and RS" },
  { year: "Year 8", stage: "secondary", sub: "Year 8 science (languages, maths, geography and RS stay Year 7 for now)" },
  { year: "Year 6", stage: "primary", sub: "SATs papers and practice" }
];

export const FAMILY = [
  { id: "oskar", name: "Oskar", year: "Year 1", stage: "year1", key: "studyden_oskar",
    sub: "Sounds, reading words and tricky words", subject: "phonics", family: true },
  { id: "finn", name: "Finn", year: "Year 7", stage: "secondary", key: "ks2_sats_v2",
    sub: "Languages, maths, science, geography and RS", subject: "german", family: true,
    stages: ["secondary", "primary"], years: SECONDARY_YEARS }     // can still open the Year 6 SATs area
];

/* What a guest can pick (Year 1 stays for the family). */
export const GUEST_YEARS = [
  { year: "Year 6", stage: "primary", sub: "SATs papers and practice", subject: "reading" },
  { year: "Year 7", stage: "secondary", sub: "Languages, maths, science, geography and RS", subject: "german",
    stages: ["secondary", "primary"], years: SECONDARY_YEARS }
];

const ACTIVE_KEY = "studyden_profile";
const FAMILY_KEY = "studyden_family2";
const GUESTS_KEY = "studyden_guests";

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: lasts this visit */ }
};

/* ---------- family ---------- */

const familyHere = () => read(FAMILY_KEY, []).filter(id => FAMILY.some(p => p.id === id));
export const familyOnDevice = id => familyHere().includes(id);

/* After the upload password was checked on the server. */
export function addFamilyToDevice(id) {
  const ids = familyHere();
  if (!ids.includes(id)) write(FAMILY_KEY, [...ids, id]);
}

/* ---------- guests ---------- */

export const guests = () => read(GUESTS_KEY, []).filter(g => g && /^g[a-z]{8}$/.test(g.id));

/* Letters, spaces, hyphens and apostrophes; up to 20 characters. */
export function cleanName(text) {
  const name = String(text || "").normalize("NFC").replace(/\s+/g, " ").trim().slice(0, 20);
  return /^\p{L}[\p{L} '’-]*$/u.test(name) ? name : "";
}

export function addGuest(name, year) {
  const y = GUEST_YEARS.find(x => x.year === year);
  const clean = cleanName(name);
  if (!y || !clean) return null;
  const list = guests();
  const same = list.find(g => g.name.toLowerCase() === clean.toLowerCase() && g.year === y.year);
  if (same) return guestProfile(same);
  const letters = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => String.fromCharCode(97 + (b % 26))).join("");
  const g = { id: `g${letters}`, name: clean, year: y.year, added: Date.now() };
  write(GUESTS_KEY, [...list, g]);
  return guestProfile(g);
}

export function removeGuest(id) {
  write(GUESTS_KEY, guests().filter(g => g.id !== id));
  try { localStorage.removeItem(`studyden_${id}`); } catch { /* blocked */ }
  try { if (localStorage.getItem(ACTIVE_KEY) === id) localStorage.removeItem(ACTIVE_KEY); } catch { /* blocked */ }
}

function guestProfile(g) {
  const y = GUEST_YEARS.find(x => x.year === g.year) || GUEST_YEARS[1];
  return { id: g.id, name: g.name, year: y.year, stage: y.stage, stages: y.stages, years: y.years, key: `studyden_${g.id}`,
    sub: y.sub, subject: y.subject, guest: true };
}

/* ---------- everyone on this device ---------- */

/* Family members let in here, then the guests. */
export const deviceProfiles = () => [
  ...FAMILY.filter(p => familyOnDevice(p.id)),
  ...guests().map(guestProfile)
];

/* Any child this device may use (family not yet let in → null). */
export const profileById = id => deviceProfiles().find(p => p.id === id) || null;

/* Family or guest by id, for names in the activity records. */
export const familyById = id => FAMILY.find(p => p.id === id) || null;

export function activeProfileId() {
  try { return profileById(localStorage.getItem(ACTIVE_KEY))?.id || null; } catch { return null; }
}

export function rememberProfile(id) {
  try { localStorage.setItem(ACTIVE_KEY, id); } catch { /* private mode: lasts this visit */ }
}

/* Years a child may pick at the start, their own first; one = no choice. */
export const yearsOf = p => (p ? p.years || [{ year: p.year, stage: p.stage, sub: p.sub }] : []);

/* Stages a child may use (their own first). */
export const stagesOf = p => (p ? p.stages || [p.stage] : []);
