/* =========================================================
   Marking typed answers for Year 7 geography, where a word match
   isn't enough. checkGeog(q, typed) → { ok, tip? }, or null when the
   question is an ordinary word answer (the trainer's own matcher
   handles those: spelling slips, accept[] …).
     match "grid"   4-figure grid reference: the digits, spaces allowed
     match "grid6"  6-figure grid reference: one tenth either way counts
     match "dir"    compass direction: NE, north east, north-east,
                    northeast all mean the same
   DOM-free (tested by tools/test-geog.mjs).
   ========================================================= */

import { nearRef } from "../gen/geog.js";

const DIRS = {
  n: "north", e: "east", s: "south", w: "west",
  ne: "north-east", se: "south-east", sw: "south-west", nw: "north-west"
};
const OPPOSITE = {
  north: "south", "north-east": "south-west", east: "west", "south-east": "north-west",
  south: "north", "south-west": "north-east", west: "east", "north-west": "south-east"
};

/* "North East", "NE", "n.e.", "northeast" → "north-east"; null if not a direction */
export function canonDirection(s) {
  const t = String(s ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (DIRS[t]) return DIRS[t];
  const m = t.match(/^(north|south)?(east|west)?$/);
  if (!m || !t) return null;
  return m[1] && m[2] ? `${m[1]}-${m[2]}` : (m[1] || m[2]);
}

const digits = s => String(s ?? "").replace(/[\s,.\-–]/g, "");

export function checkGeog(q, typed) {
  if (q.match === "dir") {
    const d = canonDirection(typed);
    if (!d) return { ok: false, tip: String(typed).trim() ? "Give a compass direction, such as north-east (or NE)." : undefined };
    if (d === q.answer) return { ok: true };
    if (OPPOSITE[q.answer] === d) return { ok: false, tip: "That's the opposite way round — start from the place after “from”, then look towards the other one." };
    return { ok: false };
  }
  if (q.match === "grid" || q.match === "grid6") {
    const t = digits(typed);
    const want = q.answer;
    if (!/^\d+$/.test(t)) return { ok: false };
    if (t === want) return { ok: true };
    const half = want.length / 2;
    const swapped = t.length === want.length && t.slice(half) + t.slice(0, half);
    if (q.match === "grid6") {
      if (t.length === 6 && nearRef(t, want)) return { ok: true, tip: `Close enough — tenths are estimated. We made it ${want}.` };
      if (swapped && nearRef(swapped, want)) return { ok: false, tip: "Eastings first: along the corridor (bottom numbers), then up the stairs (side numbers)." };
      if (t.length === 4) return { ok: false, tip: "That's a 4-figure reference — add the tenths to make 6 figures." };
      return { ok: false };
    }
    if (swapped === want) return { ok: false, tip: "Eastings first: along the corridor (bottom numbers), then up the stairs (side numbers)." };
    if (t.length === 6) return { ok: false, tip: "This one needs a 4-figure grid reference: two numbers along, two numbers up." };
    return { ok: false };
  }
  return null;
}
