/*
 * Data layer: seed content + user records (localStorage).
 * A user record with a seed id overrides that seed item; `hidden` removes seed items.
 */
(function () {
    "use strict";

    const KEY = { user: "mar_user", stats: "mar_stats", exams: "mar_exams", live: "mar_live" };
    const APP = "madame-arabia";
    const LEVELS = ["A1", "A2", "B1"];
    const KINDS = { verb: "Fiil", noun: "İsim", adj: "Sıfat", adv: "Zarf", other: "Diğer" };
    const EMPTY_USER = () => ({ words: [], sentences: [], paragraphs: [], questions: [], pools: [], hidden: {} });
    const LIST = { word: "words", sentence: "sentences", paragraph: "paragraphs", question: "questions", pool: "pools" };

    let user = Object.assign(EMPTY_USER(), U.store.get(KEY.user, {}));
    let stats = U.store.get(KEY.stats, {});
    let exams = U.store.get(KEY.exams, []);

    /* Seed rows -> records. Ids come from the pool and the unvowelled word, so they stay stable. */
    const seedPools = SEED.pools.map((p) => Object.assign({ seed: true }, p));
    const seedWords = [];
    const taken = new Set();
    seedPools.forEach((p) => (SEED.words[p.id] || []).forEach(({ row: r, theme }) => {
        const ex = r[4] ? [{ ar: r[4], tr: r[5] }] : [];
        if (r[7]) ex.push({ ar: r[7], tr: r[8] });
        const base = `${p.id}:${U.slug(r[0])}`;
        let id = base;
        for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
        taken.add(id);
        seedWords.push({ id, ar: r[0], tr: r[1], level: r[2], forms: r[3], ex, note: r[6] || "", pool: p.id, kind: p.kind, theme: theme || "", seed: true });
    }));
    const seedOf = {
        words: seedWords,
        sentences: SEED.sentences.map((s) => Object.assign({ seed: true }, s)),
        paragraphs: SEED.paragraphs.map((p) => Object.assign({ seed: true }, p)),
        questions: [],
        pools: seedPools,
    };

    const merged = {};
    const byId = {};

    function rebuild() {
        Object.keys(seedOf).forEach((name) => {
            const map = new Map(seedOf[name].filter((r) => !user.hidden[r.id]).map((r) => [r.id, r]));
            user[name].forEach((r) => {
                if (user.hidden[r.id]) return;
                const base = map.get(r.id);
                map.set(r.id, base ? Object.assign({ theme: base.theme }, r, { seed: true, edited: true }) : r);
            });
            merged[name] = Array.from(map.values());
            byId[name] = {};
            merged[name].forEach((r) => { byId[name][r.id] = r; });
        });
        Linker.build(merged.words, merged.sentences, merged.paragraphs);
    }

    const persist = () => { const ok = U.store.set(KEY.user, user); rebuild(); return ok; };

    function save(type, rec) {
        const name = LIST[type];
        const out = Object.assign({}, rec);
        delete out.seed;
        delete out.edited;
        if (!out.id) out.id = U.uid();
        const at = user[name].findIndex((r) => r.id === out.id);
        if (at >= 0) user[name][at] = out; else user[name].push(out);
        persist();
        return byId[name][out.id];
    }

    const isSeed = (name, id) => seedOf[name].some((r) => r.id === id);

    function remove(type, id) {
        const name = LIST[type];
        user[name] = user[name].filter((r) => r.id !== id);
        if (isSeed(name, id)) user.hidden[id] = true;
        if (type === "pool") user.words = user.words.filter((w) => w.pool !== id);
        persist();
    }

    /* Drops a user's edit of a seed item and shows the original again. */
    function revert(type, id) {
        const name = LIST[type];
        user[name] = user[name].filter((r) => r.id !== id);
        persist();
    }

    /* ---------- Learning stats ---------- */
    const stat = (id) => stats[id] || { r: 0, w: 0, s: 0 };
    const isKnown = (id) => { const s = stat(id); return s.k === undefined ? s.s >= 3 : s.k; };

    function setKnown(id, value) {
        stats[id] = Object.assign({}, stat(id), { k: value });
        U.store.set(KEY.stats, stats);
    }

    function recordAnswer(id, ok) {
        const s = Object.assign({}, stat(id));
        if (ok) { s.r++; s.s++; } else { s.w++; s.s = 0; delete s.k; }
        stats[id] = s;
    }
    const flushStats = () => U.store.set(KEY.stats, stats);
    const weakWords = () => merged.words.filter((w) => stat(w.id).w > 0 && !isKnown(w.id))
        .sort((a, b) => stat(b.id).w - stat(a.id).w);

    /* ---------- Exam history and the in-progress exam ---------- */
    function addExam(result) {
        exams = [result].concat(exams).slice(0, 30);
        U.store.set(KEY.exams, exams);
    }
    const live = () => U.store.get(KEY.live, null);
    const setLive = (v) => { if (v) U.store.set(KEY.live, v); else U.store.del(KEY.live); };

    /* ---------- Backup ---------- */
    const str = (v, max) => (typeof v === "string" ? v.slice(0, max || 6000) : "");
    const arr = (v) => (Array.isArray(v) ? v : []);
    const safeId = (v) => (typeof v === "string" && /^[\p{L}\p{N}_:-]{1,120}$/u.test(v) ? v : U.uid());
    const level = (v) => (LEVELS.includes(v) ? v : "A1");
    const question = (q) => {
        const o = arr(q.o).map((x) => str(x, 300)).filter(Boolean).slice(0, 6);
        return { q: str(q.q, 600), o, a: Number.isInteger(q.a) && q.a >= 0 && q.a < o.length ? q.a : 0 };
    };

    const clean = {
        pools: (r) => (str(r.name, 80).trim() ? { id: safeId(r.id), name: str(r.name, 80), title: str(r.title, 80), code: str(r.code, 4), kind: KINDS[r.kind] ? r.kind : "other" } : null),
        words: (r) => (str(r.ar, 200).trim() && str(r.tr, 300).trim() ? {
            id: safeId(r.id), ar: str(r.ar, 200).trim(), tr: str(r.tr, 300).trim(), level: level(r.level), forms: str(r.forms, 1200), note: str(r.note, 600),
            pool: str(r.pool, 120) || "custom", kind: KINDS[r.kind] ? r.kind : "other",
            ...(typeof r.theme === "string" ? { theme: str(r.theme, 40) } : {}),
            ex: arr(r.ex).map((e) => ({ ar: str(e && e.ar), tr: str(e && e.tr) })).filter((e) => e.ar).slice(0, 20),
        } : null),
        sentences: (r) => (str(r.ar).trim() ? { id: safeId(r.id), ar: str(r.ar).trim(), tr: str(r.tr), level: level(r.level), topic: str(r.topic, 60) } : null),
        paragraphs: (r) => (str(r.ar, 20000).trim() && str(r.title, 200).trim() ? {
            id: safeId(r.id), title: str(r.title, 200).trim(), ar: str(r.ar, 20000).trim(), tr: str(r.tr, 20000), level: level(r.level), topic: str(r.topic, 60),
            q: arr(r.q).map(question).filter((q) => q.q && q.o.length >= 2).slice(0, 20),
        } : null),
        questions: (r) => {
            const q = question(r);
            return q.q && q.o.length >= 2 ? Object.assign(q, { id: safeId(r.id), level: level(r.level), pool: str(r.pool, 120), explain: str(r.explain, 800) }) : null;
        },
    };

    function exportData() {
        return { app: APP, version: 1, exportedAt: new Date().toISOString(), user, stats, exams };
    }

    /* Merges a backup into current data; incoming records win on equal ids. Returns added count. */
    function importData(data) {
        if (!data || data.app !== APP || !data.user) throw new Error("bad backup");
        let added = 0;
        Object.keys(clean).forEach((name) => {
            arr(data.user[name]).forEach((r) => {
                const rec = r && typeof r === "object" ? clean[name](r) : null;
                if (!rec) return;
                const at = user[name].findIndex((x) => x.id === rec.id);
                if (at >= 0) user[name][at] = rec; else { user[name].push(rec); added++; }
            });
        });
        const hidden = data.user.hidden;
        if (hidden && typeof hidden === "object") Object.keys(hidden).forEach((id) => { if (safeId(id) === id) user.hidden[id] = true; });
        user.words.forEach((w) => { if (!user.pools.some((p) => p.id === w.pool) && !isSeed("pools", w.pool)) w.pool = "custom"; });
        if (data.stats && typeof data.stats === "object") {
            Object.keys(data.stats).forEach((id) => {
                const s = data.stats[id] || {};
                if (safeId(id) !== id) return;
                stats[id] = { r: +s.r || 0, w: +s.w || 0, s: +s.s || 0 };
                if (typeof s.k === "boolean") stats[id].k = s.k;
            });
            flushStats();
        }
        persist();
        return added;
    }

    function clearUser() {
        user = EMPTY_USER();
        persist();
    }
    function restoreHidden() {
        user.hidden = {};
        persist();
    }

    rebuild();

    window.DB = {
        LEVELS, KINDS, clean,
        pools: () => merged.pools,
        pool: (id) => byId.pools[id],
        words: () => merged.words,
        word: (id) => byId.words[id],
        wordsIn: (pool) => merged.words.filter((w) => w.pool === pool),
        themes: () => SEED.themes,
        theme: (id) => SEED.themes.find((t) => t.id === id),
        wordsInTheme: (theme) => merged.words.filter((w) => w.theme === theme),
        sentences: () => merged.sentences,
        sentence: (id) => byId.sentences[id],
        paragraphs: () => merged.paragraphs,
        paragraph: (id) => byId.paragraphs[id],
        questions: () => merged.questions,
        question: (id) => byId.questions[id],
        userList: (name) => user[name],
        hiddenCount: () => Object.keys(user.hidden).length,
        topics: () => Array.from(new Set(merged.sentences.concat(merged.paragraphs).map((x) => x.topic).filter(Boolean))).sort(),
        save, remove, revert, stat, isKnown, setKnown, recordAnswer, flushStats, weakWords,
        exams: () => exams, exam: (id) => exams.find((e) => e.id === id), addExam, live, setLive,
        exportData, importData, clearUser, restoreHidden,
    };
})();
