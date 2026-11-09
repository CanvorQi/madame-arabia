/*
 * Exam engine. Questions are generated from the live data, so user-added words, sentences,
 * paragraphs and questions appear automatically. A question is plain JSON (resumable, storable).
 */
(function () {
    "use strict";

    const { shuffle } = U;
    const TYPES = {
        mean: { label: "Anlam (AR → TR)", hint: "Kelimenin Türkçe anlamını seç." },
        rmean: { label: "Anlam (TR → AR)", hint: "Arapça karşılığını seç." },
        gap: { label: "Boşluk doldurma", hint: "Boşluğa gelecek kelimeyi seç." },
        write: { label: "Yazım", hint: "Arapçasını yaz." },
        order: { label: "Cümle kurma", hint: "Kelimeleri doğru sıraya diz." },
        read: { label: "Okuma", hint: "Paragrafa göre cevapla." },
        custom: { label: "Benim sorularım", hint: "Soruyu cevapla." },
    };
    /* Which parts of a question are Arabic text (for direction and font). */
    const AR_PROMPT = new Set(["mean", "read", "gap"]);
    const AR_OPTIONS = new Set(["rmean", "gap", "read", "order"]);

    const GRADES = [
        { min: 85, name: "مُمْتَاز", tr: "Pekiyi" },
        { min: 70, name: "جَيِّد جِدًّا", tr: "İyi" },
        { min: 50, name: "مَقْبُول", tr: "Geçer" },
        { min: 0, name: "ضَعِيف", tr: "Yetersiz" },
    ];
    const gradeOf = (pct) => GRADES.find((g) => pct >= g.min);

    /* Picks 3 wrong answers, preferring the same pool, never repeating the shown text. */
    function distractors(word, get) {
        const seen = new Set([U.fold(get(word))]);
        const same = shuffle(DB.wordsIn(word.pool).filter((w) => w.kind === word.kind));
        const out = [];
        same.concat(shuffle(DB.words())).forEach((w) => {
            const v = get(w);
            if (out.length < 3 && !seen.has(U.fold(v))) { seen.add(U.fold(v)); out.push(v); }
        });
        return out;
    }

    function withOptions(q, correct, wrong) {
        const options = shuffle([correct].concat(wrong));
        return Object.assign(q, { options, answer: options.indexOf(correct) });
    }

    const makers = {
        mean(w) {
            const wrong = distractors(w, (x) => x.tr);
            if (wrong.length < 3) return null;
            return withOptions({ type: "mean", wordId: w.id, prompt: w.ar, speak: w.ar, explain: `${w.ar} = ${w.tr}` }, w.tr, wrong);
        },
        rmean(w) {
            const wrong = distractors(w, (x) => x.ar);
            if (wrong.length < 3) return null;
            return withOptions({ type: "rmean", wordId: w.id, prompt: w.tr, explain: `${w.tr} = ${w.ar}` }, w.ar, wrong);
        },
        gap(w) {
            const texts = w.ex.concat(Linker.occurrences(w.id).s.map(DB.sentence).filter(Boolean));
            for (const t of shuffle(texts)) {
                const hit = Linker.findBase(t.ar, w);
                if (!hit || !t.tr) continue;
                const wrong = distractors(w, Linker.bare);
                if (wrong.length < 3) return null;
                return withOptions({ type: "gap", wordId: w.id, before: hit.before, after: hit.after, sub: t.tr, explain: t.ar }, Linker.bare(w), wrong);
            }
            return null;
        },
        write(w) {
            if (w.ar.includes("...")) return null;
            const bare = Linker.bare(w);
            const plain = U.strip(bare).replace(/\s/g, "");
            return { type: "write", wordId: w.id, prompt: w.tr, sub: `İlk harf: ${plain[0]} · ${plain.length} harf · harekesiz yazabilirsin`, answer: w.ar, bare, explain: `${w.tr} = ${w.ar}` };
        },
    };

    function orderQuestion(s) {
        const clean = s.ar.replace(/[.?!؟]+$/, "").trim();
        const tokens = clean.split(/\s+/);
        if (tokens.length < 3 || tokens.length > 10 || !s.tr || tokens.some((t) => !/\p{L}/u.test(t))) return null;
        let options = shuffle(tokens);
        if (options.join(" ") === clean) options = options.slice().reverse();
        return { type: "order", prompt: s.tr, options, answer: clean, explain: s.ar, speak: s.ar };
    }

    const readQuestion = (p, q) => ({ type: "read", paraId: p.id, prompt: q.q, options: q.o, answer: q.a, explain: `Paragraf: ${p.title}` });
    const customQuestion = (q) => ({ type: "custom", prompt: q.q, options: q.o, answer: q.a, explain: q.explain || "" });

    /* Builds shuffled candidates for each type, then takes them round-robin. */
    function build(cfg) {
        const levelOk = (x) => !cfg.levels || !cfg.levels.length || cfg.levels.includes(x.level);
        const themeOk = (w) => !cfg.themes || !cfg.themes.length || cfg.themes.includes(w.theme);
        let words = cfg.weak ? DB.weakWords() : DB.words().filter((w) => (!cfg.pools || !cfg.pools.length || cfg.pools.includes(w.pool)) && themeOk(w) && levelOk(w));
        words = cfg.weak ? words : shuffle(words);

        const texts = () => {
            const fromSentences = DB.sentences().filter(levelOk);
            const fromWords = words.flatMap((w) => w.ex.map((e) => ({ ar: e.ar, tr: e.tr })));
            const linked = (cfg.pools && cfg.pools.length) || (cfg.themes && cfg.themes.length)
                ? fromWords
                : fromSentences.concat(fromWords);
            return shuffle(linked);
        };

        const queues = {};
        cfg.types.forEach((t) => {
            if (makers[t]) queues[t] = words.map((w) => () => makers[t](w));
            if (t === "order") queues[t] = texts().map((s) => () => orderQuestion(s));
            if (t === "read") queues[t] = shuffle(DB.paragraphs().filter(levelOk).flatMap((p) => p.q.map((q) => () => readQuestion(p, q))));
            if (t === "custom") {
                queues[t] = shuffle(DB.questions().filter((q) => levelOk(q) && (!q.pool || !cfg.pools || !cfg.pools.length || cfg.pools.includes(q.pool))).map((q) => () => customQuestion(q)));
            }
        });

        const out = [];
        const used = new Set();
        const order = cfg.types.filter((t) => queues[t]);
        let active = order.slice();
        while (out.length < cfg.count && active.length) {
            active = active.filter((t) => {
                if (out.length >= cfg.count) return true;
                while (queues[t].length) {
                    const q = queues[t].shift()();
                    if (!q) continue;
                    const key = q.wordId || q.prompt;
                    if (used.has(key)) continue;
                    used.add(key);
                    out.push(q);
                    return true;
                }
                return false;
            });
        }
        return shuffle(out);
    }

    const canon = (s) => String(s || "").normalize("NFC").toLowerCase().replace(/\s+/g, " ").replace(/[\s.?!,;:؟،؛]+$/g, "").trim();

    /*
     * Written answers: harakat are optional; hamza seats and ة/ه, ى/ي are forgiven but flagged (spellingSlip).
     * The article ال may be added or left out.
     */
    const noArticle = (s) => s.replace(/^ال(?=\S{2,})/, "");
    const writeMatch = (q, a, key) => {
        const given = key(canon(a));
        return [q.answer, q.bare].some((t) => { const want = key(canon(t)); return given === want || noArticle(given) === noArticle(want); });
    };
    const loose = (s) => U.fold(s);
    const strict = (s) => U.strip(s);
    const spellingSlip = (q, a) => q.type === "write" && writeMatch(q, a, loose) && !writeMatch(q, a, strict);

    function isCorrect(q, a) {
        if (a === null || a === undefined || a === "") return false;
        if (q.type === "write") return writeMatch(q, a, loose);
        if (q.type === "order") return canon(Array.isArray(a) ? a.join(" ") : a) === canon(q.answer);
        return a === q.answer;
    }

    const answerText = (q) => (typeof q.answer === "number" ? q.options[q.answer] : q.answer);
    function givenText(q, a) {
        if (a === null || a === undefined || a === "" || (Array.isArray(a) && !a.length)) return "Boş";
        if (Array.isArray(a)) return a.join(" ");
        return typeof a === "number" ? q.options[a] : a;
    }

    function create(cfg) {
        const questions = build(cfg);
        if (!questions.length) return null;
        const now = Date.now();
        return {
            cfg, questions, answers: questions.map(() => null), locked: questions.map(() => false), idx: 0, startedAt: now,
            deadline: cfg.minutes ? now + cfg.minutes * 60000 : null,
        };
    }

    /* Grades a finished exam, updates word stats and stores the result. */
    function finish(ex) {
        const items = ex.questions.map((q, i) => {
            const ok = isCorrect(q, ex.answers[i]);
            if (q.wordId) DB.recordAnswer(q.wordId, ok);
            return { q, a: ex.answers[i], ok };
        });
        DB.flushStats();
        const correct = items.filter((x) => x.ok).length;
        const pct = Math.round((correct / items.length) * 100);
        const result = { id: U.uid(), title: ex.cfg.title, date: Date.now(), total: items.length, correct, pct, grade: gradeOf(pct).tr, secs: Math.round((Date.now() - ex.startedAt) / 1000), items };
        DB.addExam(result);
        DB.setLive(null);
        return result;
    }

    window.Exam = { TYPES, GRADES, AR_PROMPT, AR_OPTIONS, gradeOf, create, isCorrect, spellingSlip, answerText, givenText, finish };
})();
