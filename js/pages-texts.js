/* Views: sentence bank, paragraph list and paragraph reader. */
(function () {
    "use strict";

    const { esc, icon } = U;
    const tabs = (active) => `<div class="tabs">
        <a class="tab${active === "s" ? " active" : ""}" href="#/cumleler">Cümleler</a>
        <a class="tab${active === "p" ? " active" : ""}" href="#/paragraflar">Paragraflar</a></div>`;

    /* Shared sentence card; pass an editable record (with id) to get the edit link. */
    Pages.textCard = function (s, opts) {
        const o = opts || {};
        return `<article class="s-card">
            <p class="ar" lang="ar">${Linker.linkify(s.ar, o.hl)}</p>
            ${s.tr ? `<p class="tr-text" hidden>${esc(s.tr)}</p>` : ""}
            <div class="s-foot">
                <button class="s-btn" type="button" data-speak="${esc(s.ar)}">${icon("sound")} Dinle</button>
                ${s.tr ? `<button class="s-btn" type="button" data-toggle-tr>${icon("translate")} Türkçesi</button>` : ""}
                ${s.id ? `<a class="s-btn" href="#/ekle/cumle/${encodeURIComponent(s.id)}">${icon("edit")} Düzenle</a>` : ""}
                ${s.level ? `<span class="spacer"></span><span class="badge">${esc(s.level)}</span>` : ""}
            </div></article>`;
    };

    Pages.paragraphRow = function (p) {
        return `<a class="card p-row" href="#/paragraf/${encodeURIComponent(p.id)}">
            <h3 lang="ar">${esc(p.title)}</h3><p lang="ar">${esc(p.ar)}</p>
            <div class="word-meta"><span class="badge hi">${esc(p.level)}</span>${p.topic ? `<span class="badge">${esc(p.topic)}</span>` : ""}${p.q && p.q.length ? `<span class="badge">${p.q.length} soru</span>` : ""}</div>
        </a>`;
    };

    function filters(items) {
        const levels = DB.LEVELS.filter((l) => items.some((x) => x.level === l));
        const topics = Array.from(new Set(items.map((x) => x.topic).filter(Boolean))).sort();
        return `<div class="toolbar">
            <div class="search">${icon("search")}<input id="q" type="search" placeholder="Metinlerde ara" aria-label="Metinlerde ara"></div>
            <select class="input" id="topic" style="width:auto" aria-label="Konu"><option value="">Tüm konular</option>${topics.map((t) => `<option>${esc(t)}</option>`).join("")}</select>
        </div>
        <div class="chips" id="levels" style="margin-bottom:14px"><button class="chip on" type="button" data-l="">Tüm seviyeler</button>${levels.map((l) => `<button class="chip" type="button" data-l="${l}">${l}</button>`).join("")}</div>`;
    }

    function bindFilters(getItems, render) {
        const state = { q: "", level: "", topic: "" };
        const list = document.getElementById("list");
        const draw = () => {
            const n = U.norm(state.q);
            const items = getItems().filter((x) => (!state.level || x.level === state.level) && (!state.topic || x.topic === state.topic)
                && (!n || U.norm(`${x.title || ""} ${x.ar} ${x.tr || ""}`).includes(n)));
            list.innerHTML = items.length ? items.map(render).join("") : `<div class="card empty">Bu görünümde metin yok.</div>`;
        };
        draw();
        document.getElementById("q").addEventListener("input", (e) => { state.q = e.target.value; draw(); });
        document.getElementById("topic").addEventListener("change", (e) => { state.topic = e.target.value; draw(); });
        document.getElementById("levels").addEventListener("click", (e) => {
            const b = e.target.closest("[data-l]");
            if (!b) return;
            state.level = b.dataset.l;
            e.currentTarget.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === b));
            draw();
        });
    }

    Pages.sentences = function () {
        return {
            nav: "texts", title: "Cümleler",
            html: `<div class="page-head"><h1>Cümle &amp; Paragraf</h1><p>Altı noktalı kelimeler havuzlara bağlıdır; و، ب، ال gibi ön ekler ve ي، ك، ه gibi zamir ekleri olsa da tanınır. Anlamını görmek için dokun.</p></div>
            ${tabs("s")}
            <div class="row-actions" style="margin:0 0 14px"><a class="btn" href="#/ekle/cumle">${icon("plus")} Cümle ekle</a></div>
            ${filters(DB.sentences())}<div id="list"></div>`,
            after() { bindFilters(DB.sentences, (s) => Pages.textCard(s)); },
        };
    };

    Pages.paragraphs = function () {
        return {
            nav: "texts", title: "Paragraflar",
            html: `<div class="page-head"><h1>Cümle &amp; Paragraf</h1><p>Okuma parçalarında her kelimeye dokunabilir, metni dinleyebilir ve anlama sorularını çözebilirsin.</p></div>
            ${tabs("p")}
            <div class="row-actions" style="margin:0 0 14px"><a class="btn" href="#/ekle/paragraf">${icon("plus")} Paragraf ekle</a></div>
            ${filters(DB.paragraphs())}<div id="list"></div>`,
            after() { bindFilters(DB.paragraphs, Pages.paragraphRow); },
        };
    };

    const LOW_VALUE = new Set(["conjunctions", "prepositions", "pronouns"]);

    function wordChips(text) {
        const known = [];
        const unknown = new Set();
        const seen = new Set();
        Linker.scan(text).forEach((s) => {
            if (!s.ids) return;
            if (!s.ids.length) { unknown.add(s.text); return; }
            const w = DB.word(s.ids[0]);
            if (w && !seen.has(w.id) && !LOW_VALUE.has(w.pool)) { seen.add(w.id); known.push(w); }
        });
        return `<div class="word-chips">${known.map((w) => `<a class="word-chip" href="#/kelime/${encodeURIComponent(w.id)}"><span lang="ar">${esc(w.ar)}</span> <small>${esc(w.tr)}</small></a>`).join("")}</div>
            ${unknown.size ? `<p class="hint" style="margin-top:12px">Havuzda olmayanlar (eklemek için dokun):</p>
            <div class="word-chips" style="margin-top:6px">${Array.from(unknown).slice(0, 40).map((u) => `<a class="word-chip unknown" href="#/ekle/kelime?ar=${encodeURIComponent(u)}" lang="ar">${esc(u)}</a>`).join("")}</div>` : ""}`;
    }

    Pages.paragraph = function (id) {
        const p = DB.paragraph(id);
        if (!p) return null;
        return {
            nav: "texts", title: U.strip(p.title),
            html: `<div class="page-head"><div class="crumbs"><a href="#/paragraflar">Paragraflar</a> › <bdi>${esc(p.title)}</bdi></div>
                <h1 lang="ar">${esc(p.title)}</h1>
                <div class="word-meta"><span class="badge hi">${esc(p.level)}</span>${p.topic ? `<span class="badge">${esc(p.topic)}</span>` : ""}</div></div>
            <article class="card reader">
                <p class="ar" lang="ar">${Linker.linkify(p.ar)}</p>
                ${p.tr ? `<p class="reader-tr" hidden id="trText">${esc(p.tr)}</p>` : ""}
                <div class="row-actions">
                    <button class="btn ghost sm" type="button" data-speak="${esc(p.ar)}">${icon("sound")} Dinle</button>
                    ${p.tr ? `<button class="btn ghost sm" type="button" id="showTr">${icon("translate")} Türkçesi</button>` : ""}
                </div>
            </article>
            <h2 class="section-title">Bu metindeki kelimeler</h2>${wordChips(p.ar)}
            ${p.q && p.q.length ? `<h2 class="section-title">Anlama soruları</h2><div id="quiz">${p.q.map((q, i) => `<div class="q-card" style="margin-bottom:10px">
                <p class="ar q-small" lang="ar">${i + 1}. ${esc(q.q)}</p>
                <div class="options" data-q="${i}">${q.o.map((o, j) => `<button class="option" type="button" data-o="${j}"><i>${"ABCDEF"[j]}</i><span lang="ar">${esc(o)}</span></button>`).join("")}</div>
            </div>`).join("")}</div>` : ""}
            <div class="row-actions" style="margin-top:26px">
                <a class="btn ghost" href="#/ekle/paragraf/${encodeURIComponent(id)}">${icon("edit")} Düzenle</a>
                <button class="btn danger-text" type="button" id="del">${icon("trash")} Sil</button>
            </div>`,
            after() {
                const tr = document.getElementById("showTr");
                if (tr) tr.addEventListener("click", () => { const el = document.getElementById("trText"); el.hidden = !el.hidden; });
                const quiz = document.getElementById("quiz");
                if (quiz) quiz.addEventListener("click", (e) => {
                    const b = e.target.closest(".option");
                    if (!b || b.disabled) return;
                    const box = b.parentElement;
                    const q = p.q[+box.dataset.q];
                    box.querySelectorAll(".option").forEach((x, j) => {
                        x.disabled = true;
                        if (j === q.a) x.classList.add("right");
                        else if (x === b) x.classList.add("wrong");
                    });
                });
                document.getElementById("del").addEventListener("click", async () => {
                    if (!(await U.confirmDialog(`"${p.title}" silinsin mi?`, "Sil", true))) return;
                    DB.remove("paragraph", id);
                    U.toast("Paragraf silindi");
                    location.hash = "#/paragraflar";
                });
            },
        };
    };
})();
