/* App shell: home page, hash routing, global interactions, theme and PWA. */
(function () {
    "use strict";

    const { esc, icon } = U;
    const view = document.getElementById("view");
    const NAME = "Madame Arabia";

    /* Eight-point star lattice drawn over the hero. */
    const PATTERN = `<svg class="pattern" viewBox="0 0 240 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><pattern id="star" width="40" height="40" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#fff" stroke-width="1.3">
                <rect x="10" y="10" width="20" height="20"/><rect x="10" y="10" width="20" height="20" transform="rotate(45 20 20)"/>
                <circle cx="20" cy="20" r="4.5"/><path d="M0 0l6 6M40 0l-6 6M0 40l6-6M40 40l-6-6"/>
            </g></pattern></defs>
        <rect width="240" height="160" fill="url(#star)"/></svg>`;

    const knownCount = () => DB.words().filter((w) => DB.isKnown(w.id)).length;
    const examAverage = () => {
        const list = DB.exams();
        return list.length ? Math.round(list.reduce((a, e) => a + e.pct, 0) / list.length) : null;
    };

    function pageHome() {
        const words = DB.words();
        const sentences = DB.sentences();
        const paragraphs = DB.paragraphs();
        const avg = examAverage();
        const usable = words.filter((w) => w.ex.length);
        const word = (usable.length ? usable : words)[U.dayIndex((usable.length ? usable : words).length)];
        const sentence = sentences[U.dayIndex(sentences.length)];
        const para = paragraphs[U.dayIndex(paragraphs.length)];
        const live = DB.live();
        return {
            nav: "home", title: "",
            html: `<section class="hero">${PATTERN}<div>
                <p class="hero-ar" lang="ar">أَهْلًا وَسَهْلًا</p>
                <h1>Arapçayı adım adım öğren</h1>
                <p>A1, A2 ve B1 seviyesinde harekeli kelime havuzları, kelimelere bağlı cümle ve paragraflar, kendi içeriğinden sınavlar.</p>
                <div class="row-actions">
                    <a class="btn wh" href="#/sinavlar">${icon("exam")} ${live ? "Sınava devam et" : "Sınava başla"}</a>
                    <a class="btn glass" href="#/kelimeler">${icon("book")} Kelimeler</a>
                </div></div></section>
            <div class="stat-row">
                <div class="stat"><b>${words.length}</b><span>kelime</span></div>
                <div class="stat"><b>${knownCount()}</b><span>öğrenilen</span></div>
                <div class="stat"><b>${avg === null ? "–" : "%" + avg}</b><span>sınav ortalaması</span></div>
            </div>
            <h2 class="section-title">Bugün</h2>
            <div class="feature">
                ${word ? `<div class="card"><p class="eyebrow">Günün kelimesi</p><h3 lang="ar"><a href="#/kelime/${encodeURIComponent(word.id)}" style="color:inherit">${esc(word.ar)}</a></h3>
                    <p>${esc(word.tr)}</p>${word.ex[0] ? `<p class="ar small-ar" style="margin-top:8px" lang="ar">${Linker.linkify(word.ex[0].ar, word.id)}</p>` : ""}</div>` : ""}
                ${para ? `<div class="card"><p class="eyebrow">Günün okuması</p><h3 lang="ar"><a href="#/paragraf/${encodeURIComponent(para.id)}" style="color:inherit">${esc(para.title)}</a></h3>
                    <p class="muted ar small-ar" lang="ar">${esc(para.ar.slice(0, 110))}…</p><div class="word-meta"><span class="badge hi">${esc(para.level)}</span></div></div>` : ""}
            </div>
            ${sentence ? `<div style="margin-top:12px">${Pages.textCard(sentence)}</div>` : ""}
            <h2 class="section-title">Kelime havuzları <a href="#/kelimeler">Tümü</a></h2>
            <div class="plate-grid">${DB.pools().filter((p) => DB.wordsIn(p.id).length).slice(0, 6).map(Pages.plate).join("")}</div>
            <div class="card" style="margin-top:30px">
                <h2 style="font-size:21px">Telefona ekle</h2>
                <p class="muted small" style="margin-top:4px">Android: menü ⋮ → Uygulamayı yükle. iPhone: Paylaş → Ana Ekrana Ekle. Bir kez açıldıktan sonra internetsiz çalışır. Sesli okuma için cihazda Arapça konuşma sesi olmalı.</p>
                <div class="row-actions"><button class="btn sm blue" type="button" data-install hidden>Şimdi yükle</button></div>
            </div>`,
        };
    }

    const notFound = () => ({ nav: "", title: "Bulunamadı", html: `<div class="card empty"><h2>Sayfa bulunamadı</h2><div class="row-actions" style="justify-content:center"><a class="btn" href="#/">Ana sayfaya dön</a></div></div>` });

    function resolve(parts, query) {
        const [page, a, b] = parts;
        const id = (v) => (v ? decodeURIComponent(v) : "");
        switch (page || "home") {
            case "home": return pageHome();
            case "kelimeler": return Pages.pools();
            case "havuz": return Pages.pool(id(a));
            case "tema": return Pages.theme(id(a));
            case "kelime": return Pages.word(id(a));
            case "cumleler": return Pages.sentences();
            case "paragraflar": return Pages.paragraphs();
            case "paragraf": return Pages.paragraph(id(a));
            case "sinavlar": return Pages.exams();
            case "sinav": return Pages.run();
            case "sonuc": return Pages.result(id(a));
            case "ekle":
                if (!a) return Pages.add();
                if (a === "kelime") return Pages.editWord(id(b), query);
                if (a === "toplu") return Pages.bulk();
                if (a === "cumle") return Pages.editSentence(id(b));
                if (a === "paragraf") return Pages.editParagraph(id(b));
                if (a === "soru") return Pages.editQuestion(id(b));
                if (a === "havuz") return Pages.editPool(id(b));
                return null;
            default: return null;
        }
    }

    function route() {
        Pages.stopExamTimer();
        U.closeSheet();
        const raw = (location.hash || "#/").slice(1);
        const [path, qs] = raw.split("?");
        const parts = path.split("/").filter(Boolean);
        let res;
        try { res = resolve(parts, new URLSearchParams(qs || "")); } catch (e) { console.error(e); res = null; }
        res = res || notFound();
        if (res.redirect) { location.replace(res.redirect); return; }

        view.classList.add("fade");
        view.innerHTML = res.html;
        if (res.after) res.after();
        requestAnimationFrame(() => view.classList.remove("fade"));
        window.scrollTo(0, 0);
        document.querySelectorAll("[data-nav]").forEach((n) => n.classList.toggle("active", n.dataset.nav === res.nav));
        document.title = res.title ? `${res.title} · ${NAME}` : NAME;
        Pages.refreshSidebar();
        syncInstallButtons();
    }
    Pages.rerender = route;

    Pages.refreshSidebar = function () {
        const total = DB.words().length;
        const known = knownCount();
        const pct = total ? Math.round((known / total) * 100) : 0;
        document.getElementById("sidebarProgress").innerHTML = `<span>Öğrenilen kelime</span><b>${known} / ${total}</b><div class="bar"><span style="width:${pct}%"></span></div>`;
    };

    /* ---------- Delegated interactions (work on every page) ---------- */
    document.addEventListener("click", (e) => {
        const key = e.target.closest("[data-char]");
        if (key) { Pages.typeChar(key.dataset.char); return; }
        const say = e.target.closest("[data-speak]");
        if (say) { U.speak(say.dataset.speak); return; }
        const close = e.target.closest("[data-sheet-close]");
        if (close) { U.closeSheet(); return; }
        const toggle = e.target.closest("[data-toggle-tr]");
        if (toggle) {
            const tr = toggle.closest(".s-card").querySelector(".tr-text");
            if (tr) tr.hidden = !tr.hidden;
            return;
        }
        const w = e.target.closest(".lw, .uw");
        if (w) Pages.openWord(w.dataset.w ? w.dataset.w.split(",") : [], w.textContent);
    });
    document.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches(".lw, .uw")) {
            e.preventDefault();
            e.target.click();
        }
    });
    document.getElementById("sheet").addEventListener("click", (e) => { if (e.target.id === "sheet") U.closeSheet(); });

    /* ---------- Theme ---------- */
    function applyTheme() {
        const dark = document.documentElement.getAttribute("data-theme") === "dark";
        document.querySelectorAll("[data-theme-toggle]").forEach((b) => { b.innerHTML = icon(dark ? "sun" : "moon"); });
        document.querySelector('meta[name="theme-color"]').setAttribute("content", dark ? "#140f2b" : "#3d2384");
    }
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("mar_theme", next); } catch (e) { /* ignore */ }
        applyTheme();
    }));

    /* ---------- PWA ---------- */
    let installEvt = null;
    function syncInstallButtons() {
        document.querySelectorAll("[data-install]").forEach((b) => {
            b.hidden = !installEvt;
            if (b._bound) return;
            b._bound = true;
            b.addEventListener("click", async () => {
                if (!installEvt) return;
                installEvt.prompt();
                try { await installEvt.userChoice; } catch (e) { /* ignore */ }
                installEvt = null;
                syncInstallButtons();
            });
        });
    }
    window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; syncInstallButtons(); });
    window.addEventListener("appinstalled", () => { installEvt = null; syncInstallButtons(); U.toast("Uygulama yüklendi"); });
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
        window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => { /* app works without offline support */ }));
    }
    /* User data lives in localStorage only: ask the browser not to evict it. */
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

    document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
    window.addEventListener("hashchange", route);
    applyTheme();
    route();
})();
