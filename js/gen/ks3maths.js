/* =========================================================
   Year 7 maths revision: question generators.
   A question in data/content/secondary/maths.json with
   "gen": "<name>" gets fresh numbers every time it is asked:
   GENERATORS[name]() → { stem, answer, choices[3], explain,
   accept?, match?, exact? } or, for true/false, { type: "tf",
   stem, answer: true|false, explain }.
   Tested by tools/test-maths.mjs (every generator, many runs).
   ========================================================= */

import { randInt, shuffle } from "../core/utils.js";
import { isPrime } from "../core/maths-match.js";

const MINUS = "−";
const pick = arr => arr[randInt(0, arr.length - 1)];

/* 48652 → "48,652"; −7 → "−7" */
function int(n) {
  const s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (n < 0 ? MINUS : "") + s;
}

/* The number n × 10^−dp, written out exactly: dec(347, 2) = "3.47",
   dec(36, 3) = "0.036", dec(5, −2) = "500". Trailing zeros dropped. */
function dec(n, dp) {
  if (dp <= 0) return int(n * 10 ** -dp);
  const neg = n < 0;
  let s = String(Math.abs(n)).padStart(dp + 1, "0");
  let whole = s.slice(0, -dp);
  let frac = s.slice(-dp).replace(/0+$/, "");
  whole = int(Number(whole));
  return (neg ? MINUS : "") + whole + (frac ? "." + frac : "");
}

/* n × 10^−dp with exactly dp decimal places: fixed(80, 1) = "8.0" */
function fixed(n, dp) {
  if (dp <= 0) return int(n);
  const s = String(Math.abs(n)).padStart(dp + 1, "0");
  return (n < 0 ? MINUS : "") + int(Number(s.slice(0, -dp))) + "." + s.slice(-dp);
}

/* Three distinct wrong answers: the candidates first, then near numbers. */
function wrongs(answer, candidates, near = []) {
  const out = [];
  for (const c of [...candidates, ...near]) {
    const s = String(c);
    if (s !== answer && !out.includes(s)) out.push(s);
    if (out.length === 3) return out;
  }
  let k = 1;
  while (out.length < 3) {
    const v = toVal(answer);
    for (const s of [int(v + k), int(v - k)]) if (s !== answer && !out.includes(s) && out.length < 3) out.push(s);
    k++;
  }
  return out;
}
const toVal = s => Number(String(s).replace(/,/g, "").replace(MINUS, "-")) || 0;

/* a negative number in a calculation gets brackets after an operator */
const br = n => (n < 0 ? `(${int(n)})` : int(n));

const factorsOf = n => { const f = []; for (let d = 1; d <= n; d++) if (n % d === 0) f.push(d); return f; };
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

const PLACES = { 3: "thousands", 2: "hundreds", 1: "tens", 0: "ones", [-1]: "tenths", [-2]: "hundredths" };
const ONE_PLACE = { 3: "thousand", 2: "hundred", 1: "ten", 0: "one", [-1]: "tenth", [-2]: "hundredth" };
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const POWER_WORD = { 10: "10", 100: "100", 1000: "1,000" };

export const GENERATORS = {
  /* ---------- Place value ---------- */

  "pv-times"() {
    let n;
    do { n = randInt(12, 9999); } while (n % 10 === 0);
    const dp = randInt(0, 2);
    const k = randInt(1, 3);
    const p = 10 ** k;
    const times = Math.random() < 0.5;
    const answer = times ? dec(n, dp - k) : dec(n, dp + k);
    const dir = times ? "left" : "right";
    return {
      stem: `Work out ${dec(n, dp)} ${times ? "×" : "÷"} ${POWER_WORD[p]}`,
      answer,
      /* one place too few, one too many, the wrong way */
      choices: wrongs(answer, shuffle([dec(n, dp + (times ? -k : k) + 1), dec(n, dp + (times ? -k : k) - 1), dec(n, dp + (times ? k : -k))])),
      explain: `${times ? "×" : "÷"} ${POWER_WORD[p]} moves every digit ${k} place${k > 1 ? "s" : ""} to the ${dir}: ${dec(n, dp)} → ${answer}. The decimal point stays where it is.`
    };
  },

  "pv-round-int"() {
    const n = randInt(1001, 99999);
    const to = pick([10, 100, 1000]);
    const answer = int(Math.round(n / to) * to);
    const place = { 10: "ten", 100: "hundred", 1000: "thousand" }[to];
    const nextDigit = Math.floor(n / (to / 10)) % 10;
    return {
      stem: `Round ${int(n)} to the nearest ${place}.`,
      answer,
      choices: wrongs(answer, shuffle([int(Math.floor(n / to) * to), int(Math.ceil(n / to) * to), int(Math.round(n / (to * 10)) * to * 10), int(Math.round(n / (to / 10)) * to / 10)])),
      explain: `Look at the digit after the ${place}s: it's ${nextDigit}, so round ${nextDigit >= 5 ? "up" : "down"}. ${int(n)} → ${answer}.`
    };
  },

  "pv-round-dp"() {
    const dp = randInt(3, 4);
    const n = randInt(10 ** dp + 1, 10 ** (dp + 1) * 3);
    if (n % 10 === 0) return GENERATORS["pv-round-dp"]();
    const d = randInt(0, 2);
    const r = Math.round(n / 10 ** (dp - d));
    const answer = fixed(r, d);
    const label = d === 0 ? "the nearest whole number" : `${d} decimal place${d > 1 ? "s" : ""}`;
    const nextDigit = Math.floor(n / 10 ** (dp - d - 1)) % 10;
    const cands = [fixed(Math.floor(n / 10 ** (dp - d)), d), fixed(Math.round(n / 10 ** (dp - d - 1)), d + 1)];
    if (d > 0 && /\.\d*0$/.test(answer)) cands.unshift(dec(r, d));     // "8" for "8.0"
    if (d < 2) cands.push(fixed(Math.round(n / 10 ** (dp - d - 2)), d + 2));
    return {
      stem: `Round ${dec(n, dp)} to ${label}.`,
      answer,
      exact: d > 0,
      choices: wrongs(answer, d > 0 ? cands : cands.filter(c => toVal(c) !== r)),
      explain: `Look at the next digit along: it's ${nextDigit}, so round ${nextDigit >= 5 ? "up" : "down"}. ${dec(n, dp)} → ${answer}.${d > 0 && answer.endsWith("0") ? " Keep the final 0 — it shows the decimal place." : ""}`
    };
  },

  "pv-digit"() {
    /* six different non-zero digits: thousands … hundredths */
    const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6);
    const shown = `${digits[0]},${digits.slice(1, 4).join("")}.${digits.slice(4).join("")}`;
    const i = randInt(0, 5);
    const power = 3 - i;
    const dgt = digits[i];
    const answer = dec(dgt, -power);
    const place = dgt === 1 ? ONE_PLACE[power] : PLACES[power];
    return {
      stem: `What is the value of the ${dgt} in ${shown}?`,
      answer,
      accept: [`${dgt} ${place}`, `${WORDS[dgt]} ${place}`, `${dgt} ${PLACES[power]}`],
      choices: wrongs(answer, shuffle([dec(dgt, -power - 1), dec(dgt, -power + 1), dec(dgt, -power + 2), String(dgt)])),
      explain: `The ${dgt} is in the ${PLACES[power]} column, so it is worth ${answer}.`
    };
  },

  /* ---------- Factors and multiples ---------- */

  "fm-hcf"() {
    const g = randInt(2, 12);
    let p, q;
    do { p = randInt(2, 9); q = randInt(2, 9); } while (p === q || gcd(p, q) !== 1);
    const a = g * Math.min(p, q), b = g * Math.max(p, q);
    const answer = String(g);
    const smaller = factorsOf(g).filter(f => f > 1 && f < g);
    return {
      stem: `Find the highest common factor (HCF) of ${a} and ${b}.`,
      answer,
      choices: wrongs(answer, shuffle([String(g * p * q), smaller.length ? String(smaller[smaller.length - 1]) : String(b - a), String(a)])),
      explain: `Factors of ${a}: ${factorsOf(a).join(", ")}. Factors of ${b}: ${factorsOf(b).join(", ")}. The biggest one in both lists is ${g}.`
    };
  },

  "fm-lcm"() {
    let a, b, l;
    do {
      a = randInt(2, 15); b = randInt(2, 15);
      l = a * b / gcd(a, b);
    } while (a === b || l > 120 || l === Math.max(a, b));
    const answer = String(l);
    const upTo = n => { const m = []; for (let x = n; x <= l; x += n) m.push(x); return m; };
    return {
      stem: `Find the lowest common multiple (LCM) of ${a} and ${b}.`,
      answer,
      choices: wrongs(answer, shuffle([String(a * b === l ? l * 2 : a * b), String(gcd(a, b)), String(l * 2), String(a + b)])),
      explain: `Multiples of ${a}: ${upTo(a).join(", ")}. Multiples of ${b}: ${upTo(b).join(", ")}. The first one in both lists is ${l}.`
    };
  },

  "fm-factors"() {
    const n = pick([12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 44, 45, 48, 50, 54, 56, 60, 63, 64, 72]);
    const f = factorsOf(n);
    const answer = f.join(", ");
    const pairs = f.filter(x => x * x <= n).map(x => `${x} × ${n / x}`).join(", ");
    const nonFactor = [5, 7, 8, 9, 6].find(x => n % x !== 0);
    return {
      stem: `List all the factors of ${n}.`,
      answer,
      match: "set",
      choices: [
        f.filter((_, i) => i !== Math.floor(f.length / 2)).join(", "),
        [...f, nonFactor].sort((x, y) => x - y).join(", "),
        [1, 2, 3, 4].map(k => n * k).join(", ")
      ],
      explain: `Find them in pairs that multiply to ${n}: ${pairs}. That gives ${f.length} factors.`
    };
  },

  "fm-pf"() {
    let fs, n;
    do {
      const k = randInt(3, 4);
      fs = Array.from({ length: k }, () => pick([2, 2, 2, 3, 3, 5, 5, 7, 11])).sort((x, y) => x - y);
      n = fs.reduce((x, y) => x * y, 1);
    } while (n < 12 || n > 300 || new Set(fs).size === 1 && fs.length > 3);
    const index = arr => {
      const counts = {};
      arr.forEach(x => { counts[x] = (counts[x] || 0) + 1; });
      return Object.keys(counts).map(Number).sort((x, y) => x - y)
        .map(p => counts[p] === 1 ? `${p}` : `${p}${"⁰¹²³⁴⁵⁶⁷⁸⁹"[counts[p]]}`).join(" × ");
    };
    const answer = index(fs);
    /* wrong: two primes left joined (not prime), one missing, one extra */
    const joined = [fs[0] * fs[1], ...fs.slice(2)].sort((x, y) => x - y).map(String).join(" × ");
    return {
      stem: `Write ${n} as a product of its prime factors. Use index form.`,
      answer,
      match: "product",
      choices: wrongs(answer, [joined, index(fs.slice(1)), index([...fs, 2].sort((x, y) => x - y))], [index([...fs.slice(0, -1), 3].sort((x, y) => x - y)), index([...fs.slice(0, -1), 5].sort((x, y) => x - y))]),
      explain: `Use a factor tree: ${n} = ${fs.join(" × ")}. In index form: ${answer}.`
    };
  },

  "fm-prime"() {
    const n = pick([23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
      21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93, 1, 2]);
    const prime = isPrime(n);
    const d = factorsOf(n).find(x => x > 1 && x < n);
    return {
      type: "tf",
      stem: `${n} is a prime number.`,
      answer: prime,
      explain: n === 1 ? "False — 1 has only one factor, and a prime needs exactly two."
        : n === 2 ? "True — 2 is the only even prime: its factors are 1 and 2."
        : prime ? `True — only 1 and ${n} divide into ${n}.` : `False — ${n} = ${d} × ${n / d}.`
    };
  },

  "fm-powers"() {
    const kind = pick(["sq", "sq", "cube", "root", "root", "croot"]);
    let stem, a, v;
    if (kind === "sq") { a = randInt(2, 15); v = a * a; stem = `What is ${a}²?`; }
    if (kind === "cube") { a = randInt(2, 6); v = a ** 3; stem = `What is ${a}³?`; }
    if (kind === "root") { a = randInt(2, 15); v = a; stem = `What is √${a * a}?`; }
    if (kind === "croot") { a = randInt(2, 6); v = a; stem = `What is ∛${a ** 3}?`; }
    const answer = String(v);
    const explain = {
      sq: `${a}² means ${a} × ${a} = ${v}.`,
      cube: `${a}³ means ${a} × ${a} × ${a} = ${v}.`,
      root: `√${a * a} = ${a} because ${a} × ${a} = ${a * a}.`,
      croot: `∛${a ** 3} = ${a} because ${a} × ${a} × ${a} = ${a ** 3}.`
    }[kind];
    const cands = kind === "sq" ? [a * 2, a * a * a, a + 2] : kind === "cube" ? [a * 3, a * a, a + 3] : kind === "root" ? [a * a / 2, a + 1, a * a] : [a ** 3 / 3, a + 1, a * a];
    return { stem, answer, choices: wrongs(answer, cands.filter(Number.isInteger).map(String)), explain };
  },

  /* ---------- Order of operations ---------- */

  "oo-eval"() {
    const t = pick(OO_TEMPLATES)();
    const answer = int(t.ans);
    return {
      stem: `Work out ${t.expr}`,
      answer,
      choices: wrongs(answer, t.wrong.map(int)),
      explain: t.steps
    };
  },

  /* ---------- Positive and negative numbers ---------- */

  "pn-add"() {
    let a, b;
    do { a = randInt(-12, 12); b = randInt(-12, 12); } while (!a || !b || (a > 0 && b > 0));
    const form = pick(["plus", "minus"]);
    const ans = form === "plus" ? a + b : a - b;
    const answer = int(ans);
    const rule = form === "plus"
      ? (b < 0 ? `Adding a negative is the same as subtracting: ${int(a)} − ${int(-b)} = ${answer}.` : `Start at ${int(a)} and move ${b} to the right: ${answer}.`)
      : (b < 0 ? `Subtracting a negative is the same as adding: ${int(a)} + ${int(-b)} = ${answer}.` : `Start at ${int(a)} and move ${b} to the left: ${answer}.`);
    return {
      stem: `Work out ${int(a)} ${form === "plus" ? "+" : "−"} ${br(b)}`,
      answer,
      choices: wrongs(answer, shuffle([int(-ans), int(form === "plus" ? a - b : a + b), int(-(form === "plus" ? a - b : a + b))])),
      explain: rule
    };
  },

  "pn-mult"() {
    let a, b;
    do { a = randInt(-12, 12); b = randInt(-12, 12); } while (Math.abs(a) < 2 || Math.abs(b) < 2 || (a > 0 && b > 0));
    const divide = Math.random() < 0.4;
    const [x, y, ans] = divide ? [a * b, b, a] : [a, b, a * b];
    const answer = int(ans);
    const same = (x < 0) === (y < 0);
    return {
      stem: `Work out ${int(x)} ${divide ? "÷" : "×"} ${br(y)}`,
      answer,
      choices: wrongs(answer, shuffle([int(-ans), int(divide ? x - y : x + y), int(divide ? -(x - y) : -(x + y))])),
      explain: `${same ? "Same signs → the answer is positive" : "Different signs → the answer is negative"}: ${int(Math.abs(x))} ${divide ? "÷" : "×"} ${int(Math.abs(y))} = ${int(Math.abs(ans))}, so ${answer}.`
    };
  },

  "pn-temp"() {
    if (Math.random() < 0.5) {
      const start = randInt(-15, 8);
      const change = randInt(3, 15);
      const rises = start < 0 ? Math.random() < 0.7 : false;
      const end = rises ? start + change : start - change;
      const answer = `${int(end)} °C`;
      return {
        stem: `The temperature is ${int(start)} °C. It ${rises ? "rises" : "falls"} by ${change} degrees. What is the new temperature?`,
        answer,
        choices: wrongs(answer, shuffle([`${int(-end)} °C`, `${int(rises ? start - change : start + change)} °C`, `${int(end + (rises ? -1 : 1))} °C`])),
        explain: `Start at ${int(start)} and count ${change} ${rises ? "up" : "down"} the number line: ${int(start)} ${rises ? "+" : "−"} ${change} = ${int(end)} °C.`
      };
    }
    const cities = shuffle(["London", "Moscow", "Oslo", "Paris", "Berlin", "Toronto", "Rome", "Madrid"]).slice(0, 2);
    let t1, t2;
    do { t1 = randInt(-15, -1); t2 = randInt(-6, 18); } while (t2 - t1 < 4 || t2 === 0);
    const diff = t2 - t1;
    const answer = `${diff} degrees`;
    return {
      stem: `At midday it is ${int(t1)} °C in ${cities[0]} and ${int(t2)} °C in ${cities[1]}. What is the difference between the two temperatures?`,
      answer,
      choices: wrongs(answer, shuffle([`${Math.abs(t2 + t1)} degrees`, `${int(-diff)} degrees`, `${diff + 1} degrees`])),
      explain: t2 >= 0
        ? `From ${int(t1)} up to 0 is ${-t1} degrees, then up to ${t2} is ${t2} more: ${-t1} + ${t2} = ${diff} degrees.`
        : `Count up the number line from ${int(t1)} to ${int(t2)}: ${diff} degrees.`
    };
  }
};

/* Order-of-operations calculations: expr, ans, common wrong answers, steps. */
const OO_TEMPLATES = [
  () => { const a = randInt(2, 20), b = randInt(2, 9), c = randInt(2, 9);
    return { expr: `${a} + ${b} × ${c}`, ans: a + b * c, wrong: [(a + b) * c, a + b + c, a * b + c],
      steps: `Multiply first: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}.` }; },
  () => { const b = randInt(2, 9), c = randInt(2, 9), a = b * c + randInt(1, 20);
    return { expr: `${a} − ${b} × ${c}`, ans: a - b * c, wrong: [(a - b) * c, a - b - c, b * c - a],
      steps: `Multiply first: ${b} × ${c} = ${b * c}, then ${a} − ${b * c} = ${a - b * c}.` }; },
  () => { const c = randInt(2, 9), k = randInt(2, 9), a = randInt(2, 30), b = c * k;
    return { expr: `${a} + ${b} ÷ ${c}`, ans: a + k, wrong: [Number.isInteger((a + b) / c) ? (a + b) / c : a + b - c, a + b + c, b - c],
      steps: `Divide first: ${b} ÷ ${c} = ${k}, then ${a} + ${k} = ${a + k}.` }; },
  () => { const a = randInt(2, 12), b = randInt(2, 12), c = randInt(2, 6);
    return { expr: `(${a} + ${b}) × ${c}`, ans: (a + b) * c, wrong: [a + b * c, a * c + b, a + b + c],
      steps: `Brackets first: ${a} + ${b} = ${a + b}, then ${a + b} × ${c} = ${(a + b) * c}.` }; },
  () => { const a = randInt(2, 5), b = randInt(2, 6);
    return { expr: `${a} × ${b}²`, ans: a * b * b, wrong: [(a * b) ** 2, a * b * 2, a + b * b],
      steps: `Index first: ${b}² = ${b * b}, then ${a} × ${b * b} = ${a * b * b}.` }; },
  () => { const b = randInt(2, 6), c = randInt(2, 5), k = randInt(2, 6), a = b * k;
    return { expr: `${a} ÷ ${b} × ${c}`, ans: k * c, wrong: [Number.isInteger(a / (b * c)) ? a / (b * c) : a - b * c, a * c, k + c],
      steps: `× and ÷ are equal, so go left to right: ${a} ÷ ${b} = ${k}, then ${k} × ${c} = ${k * c}.` }; },
  () => { const a = randInt(12, 30), b = randInt(2, 10), c = randInt(2, 10);
    return { expr: `${a} − ${b} + ${c}`, ans: a - b + c, wrong: [a - (b + c), a + b + c, a - b - c],
      steps: `+ and − are equal, so go left to right: ${a} − ${b} = ${a - b}, then ${a - b} + ${c} = ${a - b + c}.` }; },
  () => { const a = randInt(3, 9), b = randInt(2, 6), c = randInt(2, 6);
    return { expr: `${a}² − ${b} × ${c}`, ans: a * a - b * c, wrong: [(a * a - b) * c, a * 2 - b * c, a * a - b - c],
      steps: `Index first: ${a}² = ${a * a}. Then multiply: ${b} × ${c} = ${b * c}. Last, ${a * a} − ${b * c} = ${a * a - b * c}.` }; },
  () => { const b = randInt(1, 5), a = b + randInt(2, 6), c = randInt(2, 15);
    return { expr: `(${a} − ${b})² + ${c}`, ans: (a - b) ** 2 + c, wrong: [(a - b) * 2 + c, a * a - b * b + c, (a - b + c) ** 2],
      steps: `Brackets first: ${a} − ${b} = ${a - b}. Index: ${a - b}² = ${(a - b) ** 2}. Last, ${(a - b) ** 2} + ${c} = ${(a - b) ** 2 + c}.` }; },
  () => { const c = randInt(2, 5), k = randInt(2, 8), s = c * k, a = randInt(1, s - 1), b = s - a, d = randInt(2, 9);
    return { expr: `(${a} + ${b}) ÷ ${c} + ${d}`, ans: k + d, wrong: [Number.isInteger(s / (c + d)) ? s / (c + d) : k * d, a + b / c + d, k + d + c],
      steps: `Brackets first: ${a} + ${b} = ${s}. Then divide: ${s} ÷ ${c} = ${k}. Last, ${k} + ${d} = ${k + d}.` }; },
  () => { const a = randInt(-9, -2), b = randInt(2, 6), c = randInt(2, 6);
    return { expr: `${int(a)} + ${b} × ${c}`, ans: a + b * c, wrong: [(a + b) * c, -(a + b * c), a - b * c],
      steps: `Multiply first: ${b} × ${c} = ${b * c}, then ${int(a)} + ${b * c} = ${int(a + b * c)}.` }; }
];
