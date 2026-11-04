/* Start screen: who is practising? Each child has their own progress
   and stage (core/profiles.js); the choice is remembered on this device. */

import { setProfile, getProfile } from "../core/store.js";
import { PROFILES } from "../core/profiles.js";
import { esc } from "../core/utils.js";

const HOME = { year1: "#/year1", primary: "#/home", secondary: "#/secondary" };

export function renderStart(el) {
  const current = getProfile()?.id;
  el.innerHTML = `
    <div class="start">
      <h2>Who's practising?</h2>
      <p class="muted">Tap your name. You can switch at any time from the top of the page.</p>
      <div class="level-grid">
        ${PROFILES.map(p => `
          <a class="level-card${p.id === current ? " current" : ""}" href="${HOME[p.stage]}" data-profile="${p.id}" data-subject="${p.subject}">
            <span class="level-card-band"></span>
            <span class="level-card-body">
              <strong>${esc(p.name)}</strong>
              <span>${esc(p.year)} — ${esc(p.sub)}</span>
            </span>
          </a>`).join("")}
      </div>
      <p class="muted start-grownups"><a href="#/grown-ups">Grown-ups</a></p>
    </div>`;

  el.querySelectorAll("[data-profile]").forEach(a => {
    a.addEventListener("click", () => setProfile(a.dataset.profile));
  });
}
