/* Start screen: who is practising? (core/profiles.js)
   #/start              Oskar, Finn, Guest
   #/start/<finn|oskar> PIN, once per device (checked by api/track.php op family)
   #/start/guest        the guests saved on this device + New
   #/start/guest/new    first name + Year 6 or Year 7
   #/start/year         the chosen child's years: "carry on" with the last used,
                        then Primary / Secondary school (only for children with more than one year)
   #/start/year/<stage> the years in that school (Year 7, Year 8)
   Each child has their own progress; the choice is remembered on this device. */

import { setProfile, getProfile, currentYear, setYear } from "../core/store.js";
import { FAMILY, GUEST_YEARS, familyOnDevice, addFamilyToDevice, guests, addGuest, cleanName, yearsOf } from "../core/profiles.js";
import { esc } from "../core/utils.js";

const HOME = { year1: "#/year1", primary: "#/home", secondary: "#/secondary" };

const card = ({ href, name, line, subject, current, attrs = "" }) => `
  <a class="level-card${current ? " current" : ""}" href="${href}"${subject ? ` data-subject="${subject}"` : ""} ${attrs}>
    <span class="level-card-band"></span>
    <span class="level-card-body">
      <strong>${esc(name)}</strong>
      <span>${esc(line)}</span>
    </span>
  </a>`;

/* After choosing a child: their years first if they have several, else home. */
const next = p => (yearsOf(p).length > 1 ? "#/start/year" : HOME[p.stage]);

/* Choose a child and go on. */
function go(id) {
  setProfile(id);
  location.hash = next(getProfile());
}

export function renderStart(el, params = []) {
  if (params[0] === "year") return renderYear(el, params[1]);
  if (params[0] === "guest") return params[1] === "new" || !guests().length ? renderNewGuest(el) : renderGuests(el);
  const fam = FAMILY.find(p => p.id === params[0]);
  if (fam && !familyOnDevice(fam.id)) return renderPin(el, fam);

  const current = getProfile();
  el.innerHTML = `
    <div class="start">
      <h2>Who's practising?</h2>
      <p class="muted">Tap your name. You can switch at any time from the top of the page.</p>
      <div class="level-grid">
        ${FAMILY.map(p => card({
          href: familyOnDevice(p.id) ? next(p) : `#/start/${p.id}`, name: p.name, line: `${p.year} — ${p.sub}`,
          subject: p.subject, current: current?.id === p.id, attrs: familyOnDevice(p.id) ? `data-profile="${p.id}"` : ""
        })).join("")}
        ${card({ href: "#/start/guest", name: "Guest", line: current?.guest ? `Now: ${current.name}` : "Someone else? Year 6 or Year 7",
          current: !!current?.guest })}
      </div>
      <p class="muted start-grownups"><a href="#/grown-ups">Grown-ups</a></p>
    </div>`;

  el.querySelectorAll("[data-profile]").forEach(a => {
    a.addEventListener("click", () => setProfile(a.dataset.profile));
  });
}

/* Finn or Oskar on a device they haven't used yet: their PIN, once. */
function renderPin(el, p) {
  el.innerHTML = `
    <div class="start start-narrow" data-subject="${p.subject}">
      <h2>Hi ${esc(p.name)}!</h2>
      <p class="muted">This is the first time on this device. Type your PIN — you only need it once here.</p>
      <form class="start-form" data-pin-form>
        <input class="start-input start-pin" data-pin type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8"
          autocomplete="off" aria-label="${esc(p.name)}'s PIN" placeholder="PIN">
        <button class="primary" type="submit">Go</button>
      </form>
      <p class="start-msg" data-msg role="status"></p>
      <p class="muted"><a href="#/start">← Not ${esc(p.name)}?</a></p>
    </div>`;

  const input = el.querySelector("[data-pin]");
  const msg = el.querySelector("[data-msg]");
  input.focus();
  el.querySelector("[data-pin-form]").addEventListener("submit", async e => {
    e.preventDefault();
    const pin = input.value.trim();
    if (!/^\d{4,8}$/.test(pin)) { msg.textContent = "The PIN is the number you were given."; return; }
    msg.textContent = "Checking…";
    try {
      await checkPin(p.id, pin);
      addFamilyToDevice(p.id);
      go(p.id);
    } catch (err) {
      msg.textContent = err.code === "bad_pin" ? "That's not the right PIN. Have another go." : err.message;
      input.value = "";
      input.focus();
    }
  });
}

async function checkPin(child, pin) {
  let res;
  try {
    res = await fetch("api/track.php", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "family", child, pin })
    });
  } catch {
    throw Object.assign(new Error("Can't reach the server — check the internet connection and try again."), { code: "offline" });
  }
  const body = await res.json().catch(() => null);
  if (!body?.ok) throw Object.assign(new Error(body?.error?.message || "Something went wrong — try again."), { code: body?.error?.code });
}

/* The guests saved on this device, and New. */
function renderGuests(el) {
  const current = getProfile();
  const years = Object.fromEntries(GUEST_YEARS.map(y => [y.year, y]));
  el.innerHTML = `
    <div class="start">
      <h2>Who's practising?</h2>
      <p class="muted">Tap your name, or New if you haven't practised on this device before.</p>
      <div class="level-grid">
        ${guests().map(g => card({
          href: next(years[g.year] || GUEST_YEARS[1]), name: g.name, line: `${g.year} — ${years[g.year]?.sub || ""}`,
          subject: years[g.year]?.subject, current: current?.id === g.id, attrs: `data-guest="${g.id}"`
        })).join("")}
        <a class="level-card level-card-new" href="#/start/guest/new">
          <span class="level-card-body"><strong>+ New</strong><span>First time here</span></span>
        </a>
      </div>
      <p class="muted start-grownups"><a href="#/start">← Back</a></p>
    </div>`;
  el.querySelectorAll("[data-guest]").forEach(a => a.addEventListener("click", () => setProfile(a.dataset.guest)));
}

/* A new guest: first name and year. */
function renderNewGuest(el) {
  el.innerHTML = `
    <div class="start start-narrow">
      <h2>Welcome!</h2>
      <form class="start-form start-form-stack" data-new-form>
        <label class="start-label" for="guest-name">What's your first name?</label>
        <input class="start-input" id="guest-name" data-name type="text" maxlength="20" autocomplete="given-name" autocapitalize="words" spellcheck="false">
        <span class="start-label">Which year are you in?</span>
        <div class="start-years" role="radiogroup" aria-label="Year">
          ${GUEST_YEARS.map(y => `
            <label class="start-year" data-subject="${y.subject}">
              <input type="radio" name="guest-year" value="${y.year}">
              <span><strong>${esc(y.year)}</strong><span class="muted">${esc(y.sub)}</span></span>
            </label>`).join("")}
        </div>
        <button class="primary" type="submit">Start</button>
      </form>
      <p class="start-msg" data-msg role="status"></p>
      <p class="muted start-note">Your name is saved on this device, so you can tap it next time.
        The grown-ups who run Study Den can see first names and how long people practise — never what you type.</p>
      <p class="muted"><a href="${guests().length ? "#/start/guest" : "#/start"}">← Back</a></p>
    </div>`;

  const name = el.querySelector("[data-name]");
  const msg = el.querySelector("[data-msg]");
  name.focus();
  el.querySelector("[data-new-form]").addEventListener("submit", e => {
    e.preventDefault();
    const clean = cleanName(name.value);
    const year = el.querySelector('input[name="guest-year"]:checked')?.value;
    if (!clean) { msg.textContent = name.value.trim() ? "Just letters, please — your first name." : "Type your first name first."; name.focus(); return; }
    if (FAMILY.some(p => p.name.toLowerCase() === clean.toLowerCase())) {
      msg.textContent = `${clean} has their own card on the first screen — or add your surname's first letter (e.g. ${clean} B).`;
      return;
    }
    if (!year) { msg.textContent = "Which year are you in?"; return; }
    const p = addGuest(clean, year);
    if (!p) { msg.textContent = "Something went wrong — try again."; return; }
    go(p.id);
  });
}

/* Which year? "Carry on" with the last one used, then the schools
   (primary, secondary); a school with several years opens a second
   step (#/start/year/<stage>), one with a single year goes straight in. */
const SCHOOL = {
  year1: "Primary school", primary: "Primary school", secondary: "Secondary school"
};

function renderYear(el, stage) {
  const p = getProfile();
  if (!p) { location.replace("#/start"); return; }
  const ys = yearsOf(p);
  const last = ys.find(y => y.year === currentYear()) || ys[0];
  const subjectOf = y => (y.stage === "primary" ? "reading" : p.subject);
  const yearCard = (y, carry) => card({
    href: HOME[y.stage], name: carry ? `${y.year} — carry on` : y.year,
    line: carry ? `${SCHOOL[y.stage]} · ${y.sub}` : y.sub,
    subject: subjectOf(y), current: carry, attrs: `data-year="${esc(y.year)}"`
  });
  const stages = [...new Set(ys.map(y => y.stage))];
  const inStage = st => ys.filter(y => y.stage === st);
  const back = `<p class="muted start-grownups"><a href="#/start">← Not ${esc(p.name)}?</a></p>`;

  if (stage && stages.includes(stage)) {
    /* step 2: the years in one school, the last used marked */
    el.innerHTML = `
      <div class="start">
        <h2>${esc(SCHOOL[stage])}</h2>
        <p class="muted">Which year?</p>
        <div class="level-grid">${inStage(stage).map(y => yearCard(y, false).replace('class="level-card"', `class="level-card${y === last ? " current" : ""}"`)).join("")}</div>
        <p class="muted start-grownups"><a href="#/start/year">← Back</a></p>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="start">
        <h2>Hi ${esc(p.name)}!</h2>
        <p class="muted">Carry on where you were, or pick another year.</p>
        <div class="level-grid">${yearCard(last, true)}</div>
        <p class="start-label start-years-head">Or choose</p>
        <div class="level-grid">
          ${stages.map(st => {
            const list = inStage(st);
            return list.length === 1
              ? card({ href: HOME[st], name: SCHOOL[st], line: `${list[0].year} — ${list[0].sub}`, subject: subjectOf(list[0]), attrs: `data-year="${esc(list[0].year)}"` })
              : card({ href: `#/start/year/${st}`, name: SCHOOL[st], line: list.map(y => y.year).join(" or "), subject: subjectOf(list[0]) });
          }).join("")}
        </div>
        ${back}
      </div>`;
  }
  el.querySelectorAll("[data-year]").forEach(a => a.addEventListener("click", () => setYear(a.dataset.year)));
}
