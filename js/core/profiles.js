/* =========================================================
   Who is practising. Each child has their own saved progress
   (localStorage key below) and a school stage that decides the
   home screen and nav. The active child is remembered per device
   in localStorage "studyden_profile".

   Finn keeps the original key (ks2_sats_v2), so everything saved
   before profiles existed stays his. To add a child: one entry
   here (and a stage in core/app.js if theirs is new).
   ========================================================= */

export const PROFILES = [
  { id: "oskar", name: "Oskar", year: "Year 1", stage: "year1", key: "studyden_oskar",
    sub: "Sounds, reading words and tricky words", subject: "phonics" },
  { id: "finn", name: "Finn", year: "Year 7", stage: "secondary", key: "ks2_sats_v2",
    sub: "German, French and science", subject: "german",
    stages: ["secondary", "primary"] }     // can still open the Year 6 SATs area
];

const ACTIVE_KEY = "studyden_profile";

export const profileById = id => PROFILES.find(p => p.id === id) || null;

export function activeProfileId() {
  try { return profileById(localStorage.getItem(ACTIVE_KEY))?.id || null; } catch { return null; }
}

export function rememberProfile(id) {
  try { localStorage.setItem(ACTIVE_KEY, id); } catch { /* private mode: lasts this visit */ }
}

/* Stages a child may use (their own first). */
export const stagesOf = p => (p ? p.stages || [p.stage] : []);
