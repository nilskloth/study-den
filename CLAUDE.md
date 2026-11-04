# Study Den — CLAUDE.md
(formerly "KS2 SATs Trainer"; repo folder still `sats-trainer`)

## What this project is
A family web app for school practice that grows with whatever school material is fed in.
The start screen (`#/start`) asks **who is practising** (`core/profiles.js`); each child has
their own saved progress and a stage with its own home and nav:
- **Oskar — Year 1** (`year1`): phonics (sounds, read real/alien words, real or alien?, which
  word?) and tricky words, with sound buttons (below)
- **Finn — Year 7** (`secondary`): German and French vocabulary, verb tables, science revision;
  Finn can also open **Primary** (`primary`): Year 6 (KS2) SATs papers and practice

Child-first, calm, paper-like design: the child drives sessions on their own; a parent checks
progress afterwards in "Grown-ups" (shared by both levels), including Grown-ups → Activity: how long,
when and on what the site is used, from every device (usage monitor, below).
Live at **https://6oclock.net/study-den/** (`/sats-trainer/` forwards there).

v2 is a full rebuild (plan and SATs standards: `docs/REBUILD_PLAN.md`). v1 is archived as git
tag `v1-final` / branch `v1-archive`, and on the server at `/sats-trainer-old/` after switchover.

---

## Tech stack / hard constraints
- Vanilla JS ES modules, HTML, CSS — **no framework, no build step**
- Content is static JSON in `data/content/`; state in `localStorage`, one key per child:
  Finn `ks2_sats_v2` (everything from before profiles; one-time v1 import from `ks2_sats_runner_v1`),
  Oskar `studyden_oskar`; active child per device in `studyden_profile`
- AI (marking + reading-test generation) goes through a small **PHP proxy** in `api/` —
  the API key lives server-side only. The app must stay fully usable without the proxy
  (free-text answers fall back to self-marking with a mark-scheme checklist).
- Web Speech API (en-GB) for spelling
- Must be served over HTTP(S). Locally: `php -S 127.0.0.1:8765` from the repo root
  (serves the app and `api/proxy.php`; without `api/config.php` the proxy answers
  "Proxy not configured" and the app self-marks)
- `tools/` is offline Node tooling only — never deployed

---

## File structure

```
index.html              # app shell (hash router mounts views into #view)
css/theme.css           # design tokens   css/app.css  # chrome   css/paper.css  # SATs-paper look
js/core/
  app.js                # boot + hash router; per-child stages and nav (year1, primary, secondary, grown-ups)
  loader.js             # fetches data/content/*.json, merges generated banks (additive by id)
  profiles.js           # the children: id, name, year, stage(s), storage key
  store.js              # per-child state (setProfile, peekStore, setProxyToken → all children), v1 import, recordAttempt()
  schema.js             # browser schema checks (mirror of tools/lib/schema-v2.mjs)
  marking.js            # mark(q, answer) — deterministic markers, DOM-free
  ai.js                 # proxy client: ping, usage, markAI
  activity.js           # usage monitor (child side): active time per screen, answer tallies → proxy
  speech.js             # speakWord (en-GB spelling) + speak(text, lang) for languages
  adaptive.js           # adaptive picking/mastery engine (spelling + vocab)
  vocab-match.js        # typed-answer matching for vocab (brackets, slashes, …, umlauts)
  utils.js              # randInt, shuffle, pickN, esc, normaliseText, normaliseNumeric
js/render/
  question.js           # paper-style renderer per question type; collectAnswer/showResult
  selfmark.js           # self-mark checklist (AI fallback)
js/views/
  start.js              # "Who's practising?" — one card per child
  year1/home.js         # Year 1 hub + phonics: sounds, read words, real or alien?, which word?
  year1/tricky.js       # tricky words: list, find it, build it (sound tiles)
  year1/word.js         # loader, wordHtml (sound buttons), adaptive state, round runner, self-check
  secondary/home.js     # languages hub + routes #/secondary/<lang>[/list/<sectionId>]
  secondary/langs.js    # language registry (voice, special keys, available flag), bank loader
  secondary/vocab.js    # vocab trainer: setup, word lists, practise + test runs
  secondary/verbs.js    # verb tables: setup, look at a table, fill-the-table / one-at-a-time runs
  secondary/science.js  # science revision: topic picker, notes pages (inline SVG diagrams), practise/test runs
  home.js               # greeting, Today's practice, full-paper cards
  paper.js              # paper runner: cover → timed paper → marking → results (+ domain labels)
  practice.js           # practice hub + generic set runner, topics, domains, prefixes, Today
  spelling.js           # adaptive spelling trainer (v1 engine)
  division.js           # short-division walkthrough
  progress.js           # Grown-ups: Activity link, mastery, timeline, AI usage + failed sign-ins, settings,
                        # generation, export (never includes the shared key)
  wordlists.js          # Grown-ups → Word lists (#/grown-ups/word-lists): upload, check, publish
  activity.js           # Grown-ups → Activity (#/grown-ups/activity): usage dashboard, all devices
js/gen/
  arithmetic.js         # random arithmetic paper/drill
  generate.js           # runtime reading-test generation via proxy
data/content/           # reading.json gps.json maths.json spelling.json papers.json manifest.json
data/content/year1/     # phonics.json (sound sets + real/alien words) tricky.json (Y1 common exception words)
data/content/secondary/ # de.json (tools/import-vocab.mjs), fr.json (hand-written), science.json (hand-written)
  verbs/                # de.json fr.json — present-tense verb tables (hand-written)
  science/              # *.svg diagrams, generated by tools/build-science-art.mjs — edit the script, not the SVGs
data/uploads/           # SERVER-ONLY, written by the proxy: <lang>.json uploaded chapters (gitignored, never deployed)
api/                    # proxy.php prompts.php ratelimit.php vocab.php activity.php track.php .htaccess state/ (config.php server-only)
tools/                  # validate2.mjs, test-marking.mjs, test-vocab.mjs, import-vocab.mjs,
                        # deploy.sh, lib/schema-v2.mjs (+ legacy v1 tools)
docs/REBUILD_PLAN.md    # v2 decisions, SATs standards, schema, phases
```

---

## Profiles (`core/profiles.js`)
- `PROFILES`: `{ id, name, year, stage, key, sub, subject, stages? }`. Adding a child = one entry
  (+ a new stage in `core/app.js` `ROUTES`/`NAV`/`HOME` and `views/start.js` if theirs is new).
- The router sends a child only to their own `stages`; another stage's URL goes to their home.
  Grown-ups works without a child chosen.
- The shared key (`settings.proxyToken`) belongs to the device: `setProxyToken` writes it into
  every child's copy; a new child's copy starts with Finn's key.
- Grown-ups shows one child at a time (`#/grown-ups/<id>`, tabs): mastery, export, reset per child.
- The site is public, so the children's first names are visible on the start screen (agreed).

## Year 1 (`views/year1/`, `#/year1[/sounds|read|alien|listen|tricky[/find|build]]`)
- **Words are stored as their sounds:** `"g": ["sh","i","p"]`; a split friend is `"a-" … "-e"`
  (`m|a-|k|-e`). `wordHtml()` draws **sound buttons** as taught in class: a dot under a one-letter
  sound, a line under a special friend, a joined line under a split friend; `tricky` indices in red.
- **phonics.json:** `sets` (Letters, First / More / Even more special friends — usual Year 1 order;
  `oo`/`oo2`, `ow`/`ow2` are the two sounds of one spelling) and `words` `{ id, word, g, real, set }`;
  alien words (`a-…`) are made up, like the Year 1 phonics screening check — make sure new ones
  aren't real or rude words.
- **tricky.json:** the 45 Year 1 common exception words: `{ id, word, g, tricky[], why, sentence }`.
- **Speech:** the en-GB voice reads real words and sentences only — never single sounds or alien
  words (it says them wrongly); those are self-checked ("✓ I got it" / "Not yet", or a grown-up listens).
- **Rounds:** 10 per go, a star per right answer, adaptive per item in `store.year1.stats`
  (`s:` sound, `w:` read, `ra:` real-or-alien, `l:` listen, `t:` find, `tb:` build); recorded as
  subject `phonics` / `tricky`, mode `y1-…`.
- All content is ours (no school sheets yet) — when Oskar's school sends sheets or its scheme's
  order (e.g. Read Write Inc.), follow it and mark additions as extra.

## Papers (`data/content/papers.json`, runner in `views/paper.js`)
- **reading** — one passage + its questions picked at random (the shipped bank has one
  passage per test; the real paper has 3 texts / 50 marks)
- **gps1** — GPS Paper 1, questions sampled by `domainQuotas`
- **gps2** — Spelling Paper 2: 20 words, each shown as an example sentence with a gap,
  read aloud (word → sentence → word); results also feed the adaptive spelling history
- **maths1** — arithmetic, generated by `gen/arithmetic.js`
- **maths2/3** — reasoning, ~80 % number/ratio/algebra strands

## Practice (`views/practice.js`)
Routes: `#/practice` hub · `/today` · `/gps/<topicId>` · `/<subject>/d/<domain>` ·
`/maths/arithmetic` · `/prefixes` · `/spelling` · `/division`.
Most trainers are "filter bank → render → mark" via the generic `runSet()`.

### Adding a new practice section — checklist
1. Content: add questions to the right `data/content/*.json` bank in the v2 schema (below),
   or a new bank file + fetch in `core/loader.js`
2. If it needs a new question type: a builder in `render/question.js` (`BUILDERS`), a
   `collectAnswer` case if the default (first input) isn't right, a marker in
   `core/marking.js`, and the type in both `core/schema.js` and `tools/lib/schema-v2.mjs`
3. A route branch in `renderPractice()` and a link/card in `renderHub()`
4. A bespoke view (if needed) in `js/views/<name>.js`
5. New domain codes → `DOMAIN_LABELS` in `views/paper.js` (used by results + progress)
6. Run `node tools/validate2.mjs` and `node tools/test-marking.mjs`

---

## Secondary: vocabulary trainer (`views/secondary/`)
- **Source:** the school's chapter sheets ("ChN Vocabulary.doc", one per chapter; matching
  scanned PDFs have no text layer). Import with
  `node tools/import-vocab.mjs de "German" <folder>` (macOS `textutil`). The importer handles
  section headings (first line after a blank line; question headings also become entries),
  wrapped English, rows whose target wraps mid-bracket or mid-sentence, repeated rows, footer
  junk (gives the chapter title) and a small per-language `CORRECTIONS` list for typos.
  Every entry is from the sheets — nothing added (verified both ways against the .doc files).
- **Openers (`CONTEXT` in the importer):** entries whose form depends on the sheet's opener
  get `context: { <lang>: "Ich habe …", en: "I have …" }` — chosen by hand, only where case
  or endings change (einen iPod, in der Schweiz, schwarze Haare). Never infer these
  automatically: a rule attached "Es gibt …" to dictionary nouns like "der Tisch(-e)".
  The trainer shows the opener in the prompt and at the start of the answer line; the
  piece or the whole sentence both count; a wrong article only gives "Nearly!" + tip.
- **Strategies (`STRATEGIES` in the importer):** each chapter's "Strategie" box exists only
  in the scanned PDFs, so it is typed into the importer — retold in our own words (the site
  is public), keeping the sheet's example words (tappable, read aloud). Shown per chapter in
  the setup and under each word list.
- **Data:** `{ language, label, chapters: [{ id:"k1", number, title, pages, strategy?,
  sections: [{ id:"k1-s1", title, en, items: [{ id, <lang>, en, context? }] }] }] }`
- **Modes:** Practise (adaptive via `core/adaptive.js`, feedback each word, "I was right"
  overrule) and Test 10/20/30 (no feedback until a review screen with overrules).
  Directions `to-en`, `to-target` (read it) and `listen-en` (hear target → write English),
  `listen-target` (hear English → write target), `listen` (dictation) — heard directions
  only use items whose spoken side has no "/" or "…"; answer by typing
  or picking from 4 (distractors from the same topic first).
- **Marking** (`core/vocab-match.js`, tested by `tools/test-vocab.mjs` against every entry):
  brackets optional — except after a number, where the bracket is the number in words and
  either form counts ("am 1. (ersten) Januar": am 1. Januar / am ersten Januar); typing the
  printed text verbatim always counts; slashes = alternatives, "…" = any words; a phrase may
  start with a capital (single words keep their case); English lenient (case, 1st = 1,
  contractions, articles, UK/US, one typo); German needs capitals and umlauts ("Nearly!"),
  ae/oe/ue/ss accepted with a tip; a sentence's first word may be lowercase.
- **State:** `store.vocab[lang] = { stats: { "<itemId>|<dir>": stat }, prefs }` (stats only
  for answered words); each run is also a `recordAttempt` (subject `german`, domain
  "Kapitel N", mode `vocab-practise` / `vocab-test`) so Grown-ups shows it.
- **Uploaded chapters:** Grown-ups → Word lists. Photos/PDF (or pasted text) → proxy op
  `import-vocab` (Claude, fixed prompt in `api/vocab.php`: copy words exactly, openers only
  where case/endings depend, strategy retold) → editable draft (localStorage
  `ks2_vocab_draft`) → `vocab-publish` writes `data/uploads/<lang>.json`. `loadBank()` merges
  it with the built-in file; an uploaded chapter replaces a built-in one with the same number
  (same id scheme as the importer, so progress on unchanged words is kept). A language shows
  in the hub/nav once it has any chapter. Photos are shrunk in the browser to fit the
  server's `post_max_size` (reported by `ping`). Uploads never change `data/content/`; before
  every publish/remove/restore the proxy copies the uploads file to `api/state/backups/`
  (newest 50 per language) — Word lists → History restores any of them (`vocab-history`,
  `vocab-restore`; a restore is itself backed up, so it can be undone).
- **French (`fr.json`, hand-written — edit it directly):** built from the "Y7 French Half-Term 1
  Revision Worksheet" (.docx, not the importer's sheet format). `chapterWord` is "Half-term".
  Sections `k1-s1…s7` follow the worksheet's numbered parts word for word (it prints no answers
  for the translation parts, so those are ours); sections with `extra: true` (`k1-x…`) are
  added practice and show under "Extra practice — not on the sheet"; "Just the sheet" selects
  only the printed ones (also the default). An item `note` is shown in the list and feedback —
  used where the sheet is wrong ("too = un peu" → stored as "a bit"). Openers only where endings
  change (Elle est … grande). French marking: capitals don't count, accents give "Nearly!";
  a wrong or missing article (le/la/les/un/une/des…) gives "Nearly!" + tip. Further French
  sheets: add as chapter 2, 3… (or upload via Word lists), keep `extra` for anything not printed.

- **Verb tables (`verbs/<lang>.json`, `views/secondary/verbs.js`, `#/secondary/<lang>/verbs[/<id>]`):**
  present tense, linked from the top of the vocab setup. `{ language, tense, tenseEn, persons[6],
  personsEn[6], verbs: [{ id, inf, en, from? | extra?, elide? (je → j'), note?, forms[6], formsEn[6] }] }`.
  German: verbs used on the Kapitel 1–5 sheets (`from` names the chapter); French: être, avoir,
  aimer from the worksheet, the rest `extra`. Forms with the reflexive pronoun are stored whole
  ("m'appelle", "nous appelons"). Formats: fill the whole table, or one person at a time; adaptive
  per `"<verbId>|<0–5>"` in `store.vocab[lang].verbs`; runs recorded as mode `verbs`, domain
  "Verbs". Marking `checkVerbForm` (vocab-match.js): the form alone or with its pronoun, capitals
  never count, accents/umlauts "Nearly!". Tested in `tools/test-vocab.mjs` (every form, both ways).

---

## Secondary: science revision (`views/secondary/science.js`, `#/secondary/science[/learn/<topicId>]`)
- **Source:** the revision list the school sets on Arbor (Year 7, Nov 2026: organisation, skeleton, joints,
  muscles, microscope, cells, specialised cells, unicellular organisms, diffusion). Facts are written to KS3
  level in our own words — the site is public.
- **Class sheets** come first, as topics with `sheet: true` (no `number`; shown by title, grouped
  "From your class sheets", button "Just the class sheets") and a `source` line on the notes page:
  `sheet-rev` = the revision sheet (Q1/Q2, past-paper style; stems as printed, prefixed "Q1 (a)(i)",
  diagrams redrawn as `sheet-arm-ab`, `sheet-arm`, `sheet-leg` with the sheet's fixed letters — plain
  text, not `.lbl`, so never shuffled); `sheet-skel` = the blank "Skeletal System" handout (bones,
  functions table Function / Explanation / Benefit to performance as `table`, connective tissue).
  Neither sheet prints answers — ours, flagged in `source`. The numbered topics are "our notes".
- **Data (`science.json`):** `{ subject, label, unit, topics: [{ id, number, sheet?, source?, title, summary,
  images: [{ file, caption }], table?: { title, head[], rows[][] }, facts: ["**bold** allowed"],
  keywords: [[term, meaning]], questions }] }`.
  Question types: `short` (typed: `answer` + `accept[]`; in pick mode `answer` + 3 `choices`), `mcq`
  (pick only, `answer` + 3 `choices`), `tf` (`answer: true|false`). Every question has `explain`.
  A `short` question may ask about a diagram: `image` (file under `science/`) + `part` (the label key)
  and `{L}` in the stem, replaced by the letter shown on the quiz version of the diagram.
- **Diagrams** are SVG files inlined into the page (so they use the page font). Each labelled part is
  `<g class="lbl" data-part="…">` with a leader, a dot, the name and an empty letter badge; the view fills
  letters A, B, C… (shuffled in quizzes, so letters can't be memorised), toggles root class `quiz`
  (letters instead of names) and `ask` (highlight the asked part). On the notes page "Hide the names"
  turns a diagram into a self-test (tap a letter to reveal). Quiz diagrams are cropped to the drawing
  (`fitView`, hidden names don't count) so they fill a phone. Phones (host < 520 px): the notes diagram
  shows letters with a key list underneath (names there; "Hide the names" hides the key). The test
  review shows question + both answers in one cell (the vocab review hides column 2 on phones).
  All drawings live in `tools/build-science-art.mjs`; re-run it after editing.
- **Marking:** typed answers normalised (`the`/`a` dropped, punctuation/× stripped); exact match to
  `answer`/`accept` is right; a spelling slip (edit distance 1, or 2 for long words) counts as right
  with the correct spelling shown; numbers must be exact. "I was right" overrule as in vocab.
- **Modes/state:** Practise (adaptive, `store.vocab.science.stats` keyed by question id, 80 % = mastered)
  and Test 10/20/30 with a review. Runs are `recordAttempt` (subject `science`, domain = topic title,
  mode `science-practise` / `science-test`); area `science` in the usage monitor (`--viz-7`).
- **Adding a topic:** a new entry in `science.json` (and a drawing in the script if it needs one) — nothing
  else to register. To add another unit later, give topics a `unit` field and group the picker by it.

## v2 question schema (unified)

```json
{
  "id": "rd-2d-0031", "subject": "reading|gps|maths|spelling",
  "domain": "2d | G5 | 6C7a | S", "strand": "number|ratio|algebra|measure|geometry|stats",
  "type": "…", "marks": 2, "stem": "HTML", "passageId": "p-003",
  "…type-specific answer fields": "accept[], answer, answers[], order[], statements[], tokenIndices[], validator",
  "markScheme": {
    "acceptablePoints": [{ "point": "…", "evidence": ["'…'"] }],
    "award": { "1": "one acceptable point", "2": "two points, or one point plus evidence" },
    "doNotAccept": ["…"], "modelAnswer": "…"
  }
}
```
- **Auto-marked types:** `mcq tick2 truefalse factopin match order circle2 short-closed
  numeric multi pairs tokens roles spelling prefix`
- **AI-marked types** (self-mark fallback): `short multishort open` — need `markScheme`
  with `acceptablePoints` or `modelAnswer`, plus `award`
- Domains: reading `2a`–`2h`, GPS `G1`–`G7`, spelling `S`, maths by content-domain code /
  strand
- `tokens`: indices are zero-based positions in `sentence.split(" ")`; punctuation stays
  attached to its token — always recount after editing a sentence
- Prefix distractors: no distractor + root may form a real English word

---

## AI proxy (`api/`)
- Browser sends only `{token, op, payload}`; prompts, models, schemas, caps are server-side.
  **Never add a freeform-prompt op.**
- Ops: `ping`, `usage`, `mark` (claude-sonnet-5-5, thinking `between_tools`, structured {marks, feedback, matchedPoints}),
  `generate-passage` (claude-sonnet-5-5, effort medium, ~1–3 min; Sonnet chosen to fit Strato time limits),
  `import-vocab` (claude-sonnet-5-5, effort low, ~20 s per 2-page sheet, ~$0.07; cap bucket `import`, default 15/day),
  `vocab-unlock`, `vocab-publish`, `vocab-remove`, `vocab-history`, `vocab-restore` (no AI)
- **Upload password:** the vocab ops also need `upload_password_hash` (set with
  `php tools/set-upload-password.php`, run by the parent in their own Terminal — never in chat).
  Every wrong shared key or upload password is logged (`state/security.json`), shown in
  Grown-ups, and emailed to `alert_email` (PHP `mail()`, at most once an hour); 5 wrong
  passwords in 15 min lock uploads for an hour (the right password is refused while locked).
- `config.php` (copy of `config.example.php`: API key, shared token, daily caps) exists
  **only on the server** — never commit it. `.htaccess` denies config/prompts/ratelimit and `state/`.
- The parent enters the shared token once in Grown-ups → Settings.

---

## Usage monitor (Grown-ups → Activity)
- `core/activity.js` (started in `app.js` boot) records three times per session: **length** (first to
  last activity, breaks under 15 min included), **open** (page visible, until 15 min without input) and
  **active** = learning time (visible and touched/typed/scrolled in the last 90 s), the last per screen, mapped by `activityFor(hash)` to an area (reading, gps, maths,
  spelling, german, french, science, phonics, tricky, menus) + label. Every record carries `child`
  (profile id; none = from before profiles, shown as Finn's); the dashboard filters Everyone / per child,
  the CSV has a child column, and a session ends when another child takes over the device. Start screen and Grown-ups don't count; a 15-min gap starts a
  new session. `recordAttempt()` calls `noteAttempt()` (answer tally + a named result); the spelling
  trainer calls `noteAnswer()`. Records queue in localStorage `ks2_activity` and go to `api/track.php`
  (op `log`, **no key** — every device counts without setup) about once a minute and when the page is
  hidden; nothing typed is sent. Guards: same-site Origin, 64 KB bodies, 300 posts/hour per address
  (hashed, `state/track-rate.json`), strict record checks, 20 MB per month. Op `report` needs the upload
  password (same lockout/alerts as uploads).
- Storage `api/activity.php`: `state/activity/<YYYY-MM>.jsonl`, append-only, newest line per id wins.
  All children count as one learner (no profiles yet).
  The dashboard downloads sessions as CSV (one row per session) or everything as JSON (last 400 days);
  for deeper analysis, download `state/activity/*.jsonl` over SFTP.
- When adding a route or trainer: extend `activityFor()`; new subjects need an `AREAS` entry (fixed
  colour order, `--viz-N` in app.css — validated dataviz palette, not the subject colours).

## Version control
- GitHub: `git@github.com:nilskloth/study-den.git`, branch `main`
- SSH key: `~/.ssh/id_ed25519`

## Deployment
SFTP to Strato (`5186167.ssh.w1.strato.hosting`, user `stu698771234`, remote root `/`
contains `study-den/`; `sats-trainer/` holds only a forward to it — `tools/redirect-old/`, set up once
by `tools/move-to-study-den.sh`, which also moved `api/state/` and `data/uploads/` over).
Run `tools/deploy.sh study-den` (lftp, password from `~/.netrc`). Deploy set:
`index.html css/{theme,app,paper}.css js/{core,render,views,gen}/ data/content/
api/{proxy,prompts,ratelimit,vocab,activity,track}.php api/.htaccess api/state/.htaccess` + local `api/config.php`
— never `tools/`, `docs/`, `_res/`, and never touch the server's `data/uploads/` or `api/state/`
(activity logs, AI usage, security log, upload backups live there).

**Change the SFTP password after each session where it was shared in chat.**
