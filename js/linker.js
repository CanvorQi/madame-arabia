/*
 * Connects free Arabic text to the word pools.
 * build() indexes every generated form of every word as an unvowelled key; scan() splits text into
 * tokens and finds the longest matching word(s), so user-added words and texts link without tagging.
 *
 * Arabic specifics: keys ignore harakat and hamza seats on alif (أ إ آ ٱ = ا, ى = ي). A token that is
 * not a known form is tried again without attached clitics: و ف ب ل ك س and the article ال in front,
 * pronoun suffixes (ي ك ه ها نا كم هم ...) at the end; ة becomes ت before a suffix (مدرستي).
 *
 * Nouns are stored without the article (كِتَاب); `forms` holds broken plurals (كُتُب).
 * Verbs are stored as the vowelled past 3rd person masculine (كَتَبَ); `forms` starts with the present
 * (يَكْتُبُ). Sound verbs get their table generated; irregular ones list 8 persons in order
 * (أنا أنتَ أنتِ هو هي نحن أنتم هم) as `past=... , pres=...`.
 */
(function () {
    "use strict";

    const TOKEN = /[\p{L}\p{M}ـ]+/gu;
    const FATHA = "َ";
    const DAMMA = "ُ";
    const KASRA = "ِ";
    const SUKUN = "ْ";
    const SHADDA = "ّ";
    const PERSONS = ["أَنَا", "أَنْتَ", "أَنْتِ", "هُوَ", "هِيَ", "نَحْنُ", "أَنْتُمْ", "هُمْ"];
    const PREFIXES = ["وبال", "فبال", "وكال", "وال", "فال", "بال", "كال", "ولل", "فلل", "لل", "وس", "فس", "وب", "فب", "ول", "فل", "وك", "ال", "س", "ب", "ل", "ك", "و", "ف"];
    const SUFFIXES = ["هما", "كما", "كم", "كن", "هم", "هن", "ها", "نا", "ني", "ه", "ك", "ي"];
    let index = new Map();
    let cache = new Map();
    let maxLen = 1;
    let occ = {};

    const keyOf = (t) => U.strip(t).toLowerCase().replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/\s+/g, " ").trim();
    const bare = (word) => word.ar;

    function parseForms(raw) {
        const out = { list: [], past: [], pres: [] };
        String(raw || "").split(/[,،]/).map((s) => s.trim()).filter(Boolean).forEach((f) => {
            const m = /^(past|pres)\s*=\s*(.+)$/.exec(f);
            if (m) out[m[1]] = m[2].split(/\s+/).filter(Boolean);
            else out.list.push(f);
        });
        return out;
    }

    /* { past: [8] | null, pres: [8] | null } vowelled, or null for non-verbs and expressions. */
    function conjugate(word) {
        const ar = String(word.ar || "").trim().normalize("NFC");
        if (word.kind !== "verb" || !ar || /\s/.test(ar)) return null;
        const f = parseForms(word.forms);
        let past = f.past.length === 8 ? f.past : null;
        let pres = f.pres.length === 8 ? f.pres : null;
        if (!past && !f.past.length && ar.endsWith(FATHA)) {
            const b = ar.slice(0, -1);
            const we = b.endsWith("ن") ? `${b}${SHADDA}${FATHA}ا` : `${b}${SUKUN}نَا`;
            past = [`${b}${SUKUN}تُ`, `${b}${SUKUN}تَ`, `${b}${SUKUN}تِ`, ar, `${ar}تْ`, we, `${b}${SUKUN}تُمْ`, `${b}${DAMMA}وا`];
        }
        const y = (f.list[0] || "").normalize("NFC");
        if (!pres && !f.pres.length && /^ي[َُ]/.test(y) && y.endsWith(DAMMA)) {
            const v = y[1];
            const c = y.slice(2, -1);
            const p = (l) => l + v + c;
            pres = [`${v === FATHA ? "أَ" : "أُ"}${c}${DAMMA}`, `${p("ت")}${DAMMA}`, `${p("ت")}${KASRA}ينَ`, `${p("ي")}${DAMMA}`,
                `${p("ت")}${DAMMA}`, `${p("ن")}${DAMMA}`, `${p("ت")}${DAMMA}ونَ`, `${p("ي")}${DAMMA}ونَ`];
        }
        return past || pres ? { past, pres } : null;
    }

    /* Unvowelled extras that tables leave out: duals, feminine plurals, subjunctive, imperative. */
    function verbExtras(word, keys) {
        const f = parseForms(word.forms);
        const out = [];
        const p = keyOf(word.ar);
        if (!f.past.length) ["ا", "تا", "ن", "تما", "تن"].forEach((s) => out.push(p + s));
        const y = keyOf(f.list[0] || "");
        if (/^ي/.test(y) && !f.pres.length) {
            const s = y.slice(1);
            out.push(`ي${s}ان`, `ت${s}ان`, `ي${s}ن`, `ت${s}ن`, `ا${s}`, `ا${s}وا`, `ا${s}ي`, `${s}وا`, `${s}ي`);
        }
        keys.forEach((k) => {
            if (/ون$/.test(k)) out.push(`${k.slice(0, -1)}ا`);
            if (/[تي].+ين$/.test(k)) out.push(k.slice(0, -1));
        });
        return out;
    }

    function nounForms(k) {
        if (!k || /\s/.test(k)) return [];
        if (k.endsWith("ة")) { const s = k.slice(0, -1); return [`${s}ت`, `${s}ات`, `${s}تان`, `${s}تين`, `${s}تا`]; }
        if (/[اي]$/.test(k)) return [];
        return [`${k}ا`, `${k}ان`, `${k}ين`];
    }

    function adjForms(k) {
        if (!k || /\s/.test(k)) return [];
        if (k.endsWith("ة")) return nounForms(k);
        return [`${k}ة`, `${k}ا`, `${k}ون`, `${k}ين`, `${k}ات`, `${k}ان`, `${k}تان`, `${k}تين`];
    }

    /* All unvowelled keys of a word. Split pairs ("... ") are never indexed. */
    function formsOf(word) {
        const ar = String(word.ar || "").trim();
        if (!ar || ar.includes("...")) return [];
        const f = parseForms(word.forms);
        const base = keyOf(ar);
        const set = new Set([base, ...f.list.map(keyOf)]);
        if (word.kind === "verb") {
            const c = conjugate(word);
            [...f.past, ...f.pres, ...(c ? [...(c.past || []), ...(c.pres || [])] : [])].forEach((x) => set.add(keyOf(x)));
            verbExtras(word, Array.from(set)).forEach((x) => set.add(x));
        } else if (word.kind === "noun") {
            [base, ...f.list.map(keyOf)].forEach((k) => nounForms(k).forEach((x) => set.add(x)));
        } else if (word.kind === "adj") {
            adjForms(base).forEach((x) => set.add(x));
        }
        set.delete("");
        return Array.from(set);
    }

    /* Forms as the user wrote them (vowelled), for display. */
    const explicitForms = (word) => parseForms(word.forms).list;

    /* Exact key, else the longest stem left after removing clitics. */
    function resolve(k) {
        if (index.has(k)) return index.get(k);
        if (cache.has(k)) return cache.get(k);
        let best = null;
        let size = 0;
        ["", ...PREFIXES].forEach((p) => {
            if (!k.startsWith(p)) return;
            const rest = k.slice(p.length);
            ["", ...SUFFIXES].forEach((s) => {
                if ((!p && !s) || !rest.endsWith(s)) return;
                const stem = rest.slice(0, rest.length - s.length);
                if (stem.length < 2) return;
                const cands = [stem];
                if (s && stem.endsWith("ت")) cands.push(`${stem.slice(0, -1)}ة`);
                if (s && stem.endsWith("و")) cands.push(`${stem}ا`);
                if (s && /[ئؤ]$/.test(stem)) cands.push(`${stem.slice(0, -1)}ء`);
                if (p.endsWith("لل") || p.endsWith("ال")) cands.push(`ال${stem}`);
                cands.forEach((c) => { if (index.has(c) && c.length > size) { best = index.get(c); size = c.length; } });
            });
        });
        cache.set(k, best);
        return best;
    }

    function lookup(tokens, i, text) {
        let found = null;
        for (let n = 0; n < maxLen && i + n < tokens.length; n++) {
            if (n > 0 && /\S/.test(text.slice(tokens[i + n - 1].e, tokens[i + n].i))) break;
            const phrase = keyOf(text.slice(tokens[i].i, tokens[i + n].e));
            const ids = n === 0 ? resolve(phrase) : index.get(phrase);
            if (ids) found = { n: n + 1, ids };
        }
        return found;
    }

    /* Returns segments: { text } for gaps, { text, ids } for tokens (ids empty when unknown). */
    function scan(text) {
        const src = String(text || "");
        const tokens = [];
        let m;
        TOKEN.lastIndex = 0;
        while ((m = TOKEN.exec(src))) tokens.push({ i: m.index, e: m.index + m[0].length });
        const out = [];
        let pos = 0;
        for (let i = 0; i < tokens.length;) {
            const hit = lookup(tokens, i, src);
            const n = hit ? hit.n : 1;
            const start = tokens[i].i;
            const end = tokens[i + n - 1].e;
            if (start > pos) out.push({ text: src.slice(pos, start) });
            out.push({ text: src.slice(start, end), ids: hit ? hit.ids : [] });
            pos = end;
            i += n;
        }
        if (pos < src.length) out.push({ text: src.slice(pos) });
        return out;
    }

    /* Renders Arabic text with every word tappable; `hl` highlights one word id. */
    function linkify(text, hl) {
        return scan(text).map((s) => {
            if (!s.ids) return U.esc(s.text);
            const cls = s.ids.length ? "lw" : "uw";
            const mark = hl && s.ids.includes(hl) ? " hl" : "";
            return `<span class="${cls}${mark}" role="button" tabindex="0" data-w="${U.esc(s.ids.join(","))}">${U.esc(s.text)}</span>`;
        }).join("");
    }

    /* Unique word ids found in a text, in reading order. */
    function wordsIn(text) {
        const seen = new Set();
        scan(text).forEach((s) => (s.ids || []).forEach((id) => seen.add(id)));
        return Array.from(seen);
    }

    /* Splits a text around the first use of `word` in its base form (the article may stay), for gap questions. */
    function findBase(text, word) {
        const base = keyOf(bare(word));
        const segs = scan(text);
        for (let at = 0; at < segs.length; at++) {
            const s = segs[at];
            if (!s.ids || !s.ids.includes(word.id)) continue;
            const k = keyOf(s.text);
            let lead = "";
            if (k !== base) {
                if (k !== `ال${base}`) continue;
                const m = /^[اٱ]\p{M}*ل\p{M}*/u.exec(s.text);
                if (!m) continue;
                lead = m[0];
            }
            return {
                before: segs.slice(0, at).map((x) => x.text).join("") + lead,
                surface: s.text.slice(lead.length),
                after: segs.slice(at + 1).map((x) => x.text).join(""),
            };
        }
        return null;
    }

    /* Table for the word page: rows of { p, past, pres }. */
    function conjugation(word) {
        const c = conjugate(word);
        if (!c) return null;
        return { past: !!c.past, pres: !!c.pres, rows: PERSONS.map((p, i) => ({ p, past: c.past ? c.past[i] : "", pres: c.pres ? c.pres[i] : "" })), he: c.pres ? c.pres[3] : "" };
    }

    /* A word's own written forms win over forms generated for another word (جِدًّا is not جَدّ + ـًا). */
    const primaryKeys = (w) => [w.ar, ...parseForms(w.forms).list].map(keyOf).filter(Boolean);

    function build(words, sentences, paragraphs) {
        index = new Map();
        cache = new Map();
        maxLen = 1;
        const primary = new Set(words.flatMap(primaryKeys));
        words.forEach((w) => {
            const own = new Set(primaryKeys(w));
            formsOf(w).forEach((f) => {
                if (!own.has(f) && primary.has(f)) return;
                const list = index.get(f);
                if (!list) index.set(f, [w.id]);
                else if (!list.includes(w.id)) list.push(w.id);
                maxLen = Math.max(maxLen, f.split(" ").length);
            });
        });
        occ = {};
        const add = (id, key, val) => {
            const o = occ[id] || (occ[id] = { s: [], p: [] });
            o[key].push(val);
        };
        sentences.forEach((s) => wordsIn(s.ar).forEach((id) => add(id, "s", s.id)));
        paragraphs.forEach((p) => wordsIn(p.ar).forEach((id) => add(id, "p", p.id)));
    }

    const occurrences = (id) => occ[id] || { s: [], p: [] };

    window.Linker = { build, scan, linkify, wordsIn, findBase, formsOf, explicitForms, occurrences, bare, conjugation, keyOf, TOKEN };
})();
