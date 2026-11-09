# Madame Arabia

Turkish-speaking learners' Arabic (MSA, fully vowelled) PWA, A1–B1: word pools, sentences/paragraphs linked to words, generated exams, user-added content. Sibling of `../Madame Française` (same stack); purple/white/blue design, Arabic linker and RTL text.

## Run
No build, no dependencies. `python -m http.server 8000` then http://localhost:8000 (service worker needs http, not `file://`).
No test suite or linter.

## Structure
- `index.html` shell; script load order matters: `util → content/themes → content/words-* → sentences → paragraphs → linker → data → exam → pages-* → app`.
- `css/style.css` design tokens (purple/blue palette, arched tiles, star pattern) on `:root` and `html[data-theme="dark"]`. `[lang="ar"]` is RTL with the Arabic font.
- `js/content/themes.js` creates `SEED`, the themes and `SEED.add(pool, rows, theme)`. `words-content.js` (verbs, nouns, adjectives, Arab world), `words-function.js` (numbers, time, adverbs, function words, expressions), `sentences.js`, `paragraphs.js`.
- `js/linker.js` unvowelled keys, form generation (verb tables, sound plurals, adjective endings), clitic stripping (و ف ب ل ك س ال + pronoun suffixes), occurrence index.
- `js/data.js` merged data (seed + user), CRUD, stats, backup. `js/exam.js` question generation and grading.
- `js/pages-*.js` views (`pages-manage.js` also holds the on-screen Arabic keyboard); `js/app.js` router, theme, PWA.

## Rules
- UI text is Turkish; content is fully vowelled MSA. Record field for Arabic text is `ar`.
- Nouns are stored without ال and without case endings (`كِتَاب`); `forms` holds broken plurals and irregular forms. Feminine without ة gets a "Dişil." note.
- Verbs are stored as vowelled past 3rd masc. (`كَتَبَ`); `forms` starts with the present (`يَكْتُبُ`). Verbs that are not sound (hollow, defective, doubled, hamza changes, `آكُلُ`) must list `past=` and `pres=` with 8 persons (أنا أنتَ أنتِ هو هي نحن أنتم هم).
- Never letter-space or uppercase Arabic text (breaks letter joins).
- Words are A1, A2 or B1 until the user asks for higher levels (`DB.LEVELS`).
- A word keeps its pool (the id depends on it) and has at most one theme.
- User data lives only in localStorage (`mar_*` keys). Never change seed ids (`pool:slug`, `s12`, `p3`): stats and overrides reference them. Slugs drop harakat, so `دَرَسَ`/`دَرَّسَ` become `verbs:درس` and `verbs:درس-2` by order: don't reorder colliding rows.
- All rendered strings go through `U.esc` (Arabic text through `Linker.linkify`).
- New file: add to `index.html` and `APP_SHELL` in `sw.js`. Any shipped change: bump `CACHE_NAME` in `sw.js`.
- Project knowledge: `ProjectMemory/INDEX.md` when present; follow the global memory rules.
