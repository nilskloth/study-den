/* =========================================================
   Marking typed answers for Year 7 maths revision (DOM-free,
   tested by tools/test-maths.mjs).

   checkMaths(q, typed) → { ok, tip? }
   How an answer is compared depends on q.match:
     (none)   a number when q.answer is one: compared by value, so
              "-5", "−5", "12,000", "12 000", "5 °C", "£15" all work;
              q.exact: the digits must match too ("8.0" to 1 d.p.,
              not "8"); otherwise plain text ("yes", "10:00 am")
     set      numbers in any order ("1, 2, 3, 6")
     list     numbers in the given order ("−5, −1, 0, 2")
     product  prime factors, in any order and form: "2² × 3",
              "2^2 x 3", "2 × 2 × 3" — every factor must be prime
     expr     a calculation with brackets: spaces, x / * for ×
              and the "= 14" part are optional
   q.accept[] always counts too (compared as text).
   ========================================================= */

const SUP = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };

/* lowercase, one kind of minus, no doubled spaces */
function base(s) {
  return String(s ?? "").toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/ | /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* "5 °C", "23 degrees", "−75 m", "£15", "-£15" → the number part */
function stripUnits(s) {
  return s
    .replace(/^(-?)\s*£\s*/, "$1")
    .replace(/\s*(°\s*c|°|degrees?( celsius| c)?|celsius|metres|meters|m|cm|km|kg|g|p|pence)\.?$/, "")
    .trim();
}

/* A number, or null. Commas or spaces between thousands are fine. */
export function toNumber(s) {
  const t = stripUnits(base(s)).replace(/\s+/g, "").replace(/,(?=\d{3}(\D|$))/g, "");
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return { n: Number(t), t: t.replace(/^(-?)\./, "$10.") };
}

/* "1, 2, 3 and 6" → [1, 2, 3, 6]; null if any piece isn't a number */
function toNumbers(s) {
  let parts = base(s).split(/\s*(?:[,;]|\band\b)\s*/).filter(Boolean);
  if (parts.length === 1 && / /.test(parts[0])) parts = parts[0].split(" ");
  const nums = parts.map(toNumber);
  return nums.length && nums.every(Boolean) ? nums.map(x => x.n) : null;
}

const timesSign = s => s.replace(/\*/g, "×").replace(/(?<=[\d)²³\s])x(?=[\s\d(])/g, "×");

/* "2² × 3 × 5" → [2, 2, 3, 5]; null when it can't be read */
function toFactors(s) {
  const t = timesSign(base(s)).replace(/\s+/g, "").replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => "^" + [...m].map(c => SUP[c]).join(""));
  if (!t) return null;
  const out = [];
  for (const piece of t.split("×")) {
    const m = piece.match(/^(\d+)(?:\^(\d+))?$/);
    if (!m) return null;
    const times = m[2] ? Number(m[2]) : 1;
    if (times > 20) return null;
    for (let i = 0; i < times; i++) out.push(Number(m[1]));
  }
  return out.sort((a, b) => a - b);
}

export function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/* expression: no spaces, × for x and *, [ ] as brackets, without "= …" */
function canonExpr(s) {
  return timesSign(base(s)).replace(/[[{]/g, "(").replace(/[\]}]/g, ")").replace(/:/g, "÷").replace(/\s+/g, "").replace(/=.*$/, "");
}

/* text: no spaces, "10.00" = "10:00", a final full stop doesn't matter */
const canonText = s => base(s).replace(/(\d)\.(\d\d)\b/g, "$1:$2").replace(/\.$/, "").replace(/[\s!']/g, "");

const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

export function checkMaths(q, typed) {
  const given = base(typed);
  if (!given) return { ok: false };
  if ([q.answer, ...(q.accept || [])].some(a => canonText(a) === canonText(given))) return { ok: true };

  if (q.match === "set" || q.match === "list") {
    const want = toNumbers(q.answer);
    const got = toNumbers(given);
    if (!got) return { ok: false };
    if (q.match === "list") {
      if (sameList(got, want)) return { ok: true };
      const sorted = [...want].sort((a, b) => a - b);
      if (sameList([...got].sort((a, b) => a - b), sorted)) return { ok: false, tip: "Right numbers — but check the order." };
      return { ok: false };
    }
    const g = [...new Set(got)].sort((a, b) => a - b);
    const w = [...new Set(want)].sort((a, b) => a - b);
    if (sameList(g, w)) return { ok: true };
    const missing = w.filter(x => !g.includes(x)).length;
    const extra = g.filter(x => !w.includes(x)).length;
    if (!extra && missing) return { ok: false, tip: `You've missed ${missing === 1 ? "one" : missing}.` };
    return { ok: false };
  }

  if (q.match === "product") {
    const want = toFactors(q.answer);
    const got = toFactors(given);
    if (!got) return { ok: false };
    if (sameList(got, want)) return { ok: true };
    const value = a => a.reduce((x, y) => x * y, 1);
    if (value(got) === value(want) && got.some(f => !isPrime(f))) {
      return { ok: false, tip: "Those multiply to the right number, but every factor must be prime — keep splitting." };
    }
    return { ok: false };
  }

  if (q.match === "expr") {
    const g = canonExpr(given);
    return { ok: [q.answer, ...(q.accept || [])].some(a => canonExpr(a) === g) };
  }

  const want = toNumber(q.answer);
  if (want) {
    const got = toNumber(given);
    if (!got) return { ok: false };
    if (q.exact) {
      if (got.t === want.t) return { ok: true };
      if (got.n === want.n) return { ok: false, tip: `Right value — but write it as ${q.answer}, keeping the zero to show the decimal place.` };
      return { ok: false };
    }
    if (Math.abs(got.n - want.n) < 1e-9) return { ok: true };
    if (want.n !== 0 && Math.abs(got.n + want.n) < 1e-9) return { ok: false, tip: "Check the sign — is it positive or negative?" };
    return { ok: false };
  }
  return { ok: false };
}
