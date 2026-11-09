/* Views: exam menu and builder, exam runner, results. */
(function () {
    "use strict";

    const { esc, icon } = U;
    const LETTERS = "ABCDEF";
    let current = null;
    let timerId = null;

    const ALL = ["mean", "rmean", "gap", "write", "order", "read", "custom"];
    const PRESETS = [
        { id: "quick", name: "Hızlı Test", sub: "10 karışık soru, anında geri bildirim", cls: "hi", cfg: { title: "Hızlı Test", types: ALL, count: 10, instant: true, minutes: 0 } },
        { id: "gap", name: "Boşluk Doldurma", sub: "Cümlelerdeki boşlukları doldur", cfg: { title: "Boşluk Doldurma", types: ["gap"], count: 10, instant: true, minutes: 0 } },
        { id: "vocab", name: "Kelime Sınavı", sub: "Anlam ve yazım, 20 soru", cfg: { title: "Kelime Sınavı", types: ["mean", "rmean", "write"], count: 20, instant: true, minutes: 0 } },
        { id: "order", name: "Cümle Kurma", sub: "Kelimeleri sağdan sola doğru sıraya diz", cfg: { title: "Cümle Kurma", types: ["order"], count: 10, instant: true, minutes: 0 } },
        { id: "read", name: "Okuma Sınavı", sub: "Paragraflara dayalı anlama soruları", cfg: { title: "Okuma Sınavı", types: ["read"], count: 10, instant: true, minutes: 0 } },
        { id: "mock", name: "Deneme Sınavı", sub: "30 soru, 30 dakika, sonuç sonda", cfg: { title: "Deneme Sınavı", types: ALL, count: 30, instant: false, minutes: 30 } },
    ];

    function stopTimer() { clearInterval(timerId); timerId = null; }
    Pages.stopExamTimer = stopTimer;

    Pages.startExam = function (cfg) {
        const ex = Exam.create(cfg);
        if (!ex) { U.toast("Bu seçimle soru üretilemedi. Filtreleri genişlet."); return; }
        if (ex.questions.length < cfg.count) U.toast(`Bu seçimden ${ex.questions.length} soru çıktı`);
        current = ex;
        DB.setLive(ex);
        if (location.hash === "#/sinav") Pages.rerender(); else location.hash = "#/sinav";
    };

    function historyList() {
        const list = DB.exams();
        if (!list.length) return `<div class="card empty">Henüz sınav yok. İlk sınavını yukarıdan başlat.</div>`;
        return `<div class="card">${list.slice(0, 10).map((e) => `<a class="hist-row" href="#/sonuc/${encodeURIComponent(e.id)}">
            <div><b>${esc(e.title)}</b><span class="muted small">${new Date(e.date).toLocaleDateString("tr-TR")} · ${e.correct}/${e.total} doğru</span></div>
            <span class="badge${e.pct >= 50 ? "" : " hi"}">%${e.pct} ${esc(e.grade)}</span></a>`).join("")}</div>`;
    }

    Pages.exams = function () {
        const live = DB.live();
        const weak = DB.weakWords().length;
        const customCount = DB.questions().length;
        return {
            nav: "exams", title: "Sınavlar",
            html: `<div class="page-head"><h1>Sınavlar</h1><p>Sorular kelime havuzlarından, cümlelerden ve paragraflardan üretilir; eklediklerin de sınava girer.</p></div>
            ${live ? `<div class="card" style="margin-bottom:12px"><b>Yarım kalan sınav:</b> ${esc(live.cfg.title)}
                <div class="row-actions"><a class="btn" href="#/sinav">Devam et</a><button class="btn ghost" type="button" id="dropLive">Sil</button></div></div>` : ""}
            <div class="preset-grid">
                ${PRESETS.map((p) => `<button class="preset${p.cls ? " " + p.cls : ""}" type="button" data-preset="${p.id}"><b>${p.name}</b><span>${p.sub}</span></button>`).join("")}
                <button class="preset" type="button" id="weak" ${weak ? "" : "disabled"}><b>Yanlışlarım</b><span>${weak ? `${weak} zayıf kelimeyi tekrar et` : "Yanlış yaptığın kelimeler burada toplanır"}</span></button>
            </div>

            <h2 class="section-title">Kendi sınavını oluştur</h2>
            <form class="card" id="builder">
                <div class="form-row"><span class="form-label">Soru türleri</span><div class="chips">
                    ${Object.keys(Exam.TYPES).map((t) => `<label class="check" style="margin-right:10px"><input type="checkbox" name="type" value="${t}" ${t === "custom" && !customCount ? "" : "checked"}> ${Exam.TYPES[t].label}</label>`).join("")}
                </div></div>
                <div class="form-row"><span class="form-label">Seviye (boş bırakılırsa hepsi)</span><div class="chips">
                    ${DB.LEVELS.map((l) => `<label class="check" style="margin-right:10px"><input type="checkbox" name="level" value="${l}"> ${l}</label>`).join("")}
                </div></div>
                <div class="form-row"><span class="form-label">Havuzlar (boş bırakılırsa hepsi)</span><div class="chips">
                    ${DB.pools().filter((p) => DB.wordsIn(p.id).length).map((p) => `<label class="check" style="margin-right:10px"><input type="checkbox" name="pool" value="${esc(p.id)}"> ${esc(p.name)}</label>`).join("")}
                </div></div>
                <div class="form-row"><span class="form-label">Temalar (boş bırakılırsa hepsi)</span><div class="chips">
                    ${DB.themes().filter((t) => DB.wordsInTheme(t.id).length).map((t) => `<label class="check" style="margin-right:10px"><input type="checkbox" name="theme" value="${esc(t.id)}"> ${esc(t.name)}</label>`).join("")}
                </div></div>
                <div class="form-grid">
                    <div class="form-row"><label for="count">Soru sayısı</label><select class="input" id="count"><option>10</option><option selected>20</option><option>30</option><option>40</option></select></div>
                    <div class="form-row"><label for="minutes">Süre</label><select class="input" id="minutes"><option value="0">Süresiz</option><option value="10">10 dakika</option><option value="20">20 dakika</option><option value="30">30 dakika</option><option value="45">45 dakika</option></select></div>
                    <div class="form-row"><label for="mode">Mod</label><select class="input" id="mode"><option value="1">Alıştırma (anında sonuç)</option><option value="0">Sınav (sonuç sonda)</option></select></div>
                </div>
                <button class="btn" type="submit">Sınavı başlat</button>
            </form>

            <h2 class="section-title">Geçmiş sınavlar</h2>
            ${historyList()}`,
            after() {
                document.querySelectorAll("[data-preset]").forEach((b) => b.addEventListener("click", () => {
                    Pages.startExam(Object.assign({ pools: [], levels: [] }, PRESETS.find((p) => p.id === b.dataset.preset).cfg));
                }));
                const w = document.getElementById("weak");
                if (weak) w.addEventListener("click", () => Pages.startExam({ title: "Yanlışlarım", weak: true, pools: [], levels: [], types: ["mean", "rmean", "gap", "write"], count: Math.min(20, Math.max(weak, 4)), instant: true, minutes: 0 }));
                const drop = document.getElementById("dropLive");
                if (drop) drop.addEventListener("click", () => { DB.setLive(null); current = null; Pages.rerender(); });
                document.getElementById("builder").addEventListener("submit", (e) => {
                    e.preventDefault();
                    const values = (n) => Array.from(e.target.querySelectorAll(`input[name="${n}"]:checked`)).map((i) => i.value);
                    const types = values("type");
                    if (!types.length) { U.toast("En az bir soru türü seç"); return; }
                    Pages.startExam({
                        title: "Özel Sınav", types, levels: values("level"), pools: values("pool"), themes: values("theme"),
                        count: +e.target.querySelector("#count").value, minutes: +e.target.querySelector("#minutes").value, instant: e.target.querySelector("#mode").value === "1",
                    });
                });
            },
        };
    };

    /* ---------- Runner ---------- */
    const persist = () => DB.setLive(current);
    const answered = (a) => a !== null && a !== undefined && a !== "" && !(Array.isArray(a) && !a.length);

    function stops(ex) {
        return `<div class="metro" role="img" aria-label="Soru ${ex.idx + 1} / ${ex.questions.length}">${ex.questions.map((q, i) => {
            let c = "";
            if (ex.locked[i]) c = Exam.isCorrect(q, ex.answers[i]) ? " ok" : " bad";
            else if (answered(ex.answers[i])) c = " done";
            return `<button class="stop${c}${i === ex.idx ? " now" : ""}" type="button" data-go="${i}" aria-label="Soru ${i + 1}"><i></i></button>`;
        }).join("")}</div>`;
    }

    function optionList(q, a, locked) {
        const lang = Exam.AR_OPTIONS.has(q.type) ? ' lang="ar"' : "";
        return `<div class="options">${q.options.map((o, i) => {
            let cls = "";
            if (locked) { if (i === q.answer) cls = " right"; else if (i === a) cls = " wrong"; } else if (i === a) cls = " sel";
            return `<button class="option${cls}" type="button" data-opt="${i}" ${locked ? "disabled" : ""}><i>${LETTERS[i]}</i><span${lang}>${esc(o)}</span></button>`;
        }).join("")}</div>`;
    }

    function orderBody(q, a, locked) {
        const picked = a || [];
        const left = q.options.map((t, i) => ({ t, i }));
        const usedIdx = [];
        picked.forEach((t) => { const hit = left.find((x) => x.t === t && !usedIdx.includes(x.i)); if (hit) usedIdx.push(hit.i); });
        return `<div class="builder" dir="rtl" aria-label="Kurduğun cümle">${picked.map((t, i) => `<button class="tile" type="button" lang="ar" data-back="${i}" ${locked ? "disabled" : ""}>${esc(t)}</button>`).join("") || `<span class="muted small" dir="ltr">Aşağıdaki kelimelere sırayla dokun (cümle sağdan başlar)</span>`}</div>
            <div class="bank" dir="rtl">${left.map((x) => `<button class="tile${usedIdx.includes(x.i) ? " used" : ""}" type="button" lang="ar" data-tile="${x.i}" ${locked ? "disabled" : ""}>${esc(x.t)}</button>`).join("")}</div>`;
    }

    function feedback(q, a) {
        const ok = Exam.isCorrect(q, a);
        const slip = Exam.spellingSlip(q, a) ? " · Hemze / ة yazımına dikkat" : "";
        const show = ok ? q.explain : `Doğru cevap: ${Exam.answerText(q)}${q.explain && q.type !== "mean" && q.type !== "rmean" && q.type !== "write" ? ` · ${q.explain}` : ""}`;
        return `<div class="feedback${ok ? "" : " bad"}"><b>${ok ? "Doğru" : "Yanlış"}</b>${show ? ` <bdi class="mixed">${esc(show)}</bdi>` : ""}${slip}</div>`;
    }

    function questionBody(q, a, locked) {
        const type = Exam.TYPES[q.type];
        let head = "";
        if (q.type === "gap") {
            const fill = locked ? `<span class="gap-mark fill">${esc(Exam.answerText(q))}</span>` : `<span class="gap-mark" aria-label="boşluk"></span>`;
            head = `<p class="q-prompt" lang="ar">${esc(q.before)}${fill}${esc(q.after)}</p><p class="q-hint">${esc(q.sub)}</p>`;
        } else {
            const para = q.type === "read" ? DB.paragraph(q.paraId) : null;
            const lang = Exam.AR_PROMPT.has(q.type) ? ' lang="ar"' : ' dir="auto"';
            head = `${para ? `<details class="para-box" open><summary><bdi lang="ar">${esc(para.title)}</bdi></summary><p class="ar" lang="ar">${esc(para.ar)}</p></details>` : ""}
                <p class="q-prompt"${lang}>${esc(q.prompt)}</p>${q.sub ? `<p class="q-hint">${esc(q.sub)}</p>` : ""}`;
        }
        let body;
        if (q.type === "write") {
            body = `<div class="form-row" style="margin-top:14px"><input class="input" id="writeIn" autocomplete="off" autocapitalize="off" spellcheck="false" lang="ar" value="${esc(a || "")}" placeholder="Arapçasını yaz" aria-label="Cevabın" ${locked ? "disabled" : ""}></div>
                ${locked ? "" : `${Pages.keyboard(true)}<div class="row-actions"><button class="btn blue sm" type="button" id="checkWrite">Kontrol et</button></div>`}`;
        } else if (q.type === "order") body = orderBody(q, a, locked);
        else body = optionList(q, a, locked);
        return `<div class="q-card"><p class="eyebrow" style="margin-bottom:6px">${esc(type.label)}</p>${head}
            ${q.speak && q.type === "mean" ? `<div class="row-actions" style="margin-top:6px">${Pages.speakBtn(q.speak)}</div>` : ""}
            ${body}${locked ? feedback(q, a) : ""}</div>`;
    }

    function drawRunner() {
        const ex = current;
        const root = document.getElementById("runner");
        if (!root) return;
        const q = ex.questions[ex.idx];
        const a = ex.answers[ex.idx];
        const locked = ex.locked[ex.idx];
        const last = ex.idx === ex.questions.length - 1;
        const needsCheck = ex.cfg.instant && q.type === "order" && !locked;
        root.innerHTML = `${stops(ex)}
            <div class="q-top"><span>Soru ${ex.idx + 1} / ${ex.questions.length}</span>${ex.deadline ? `<span class="timer" id="timer">${icon("clock")}<span></span></span>` : ""}</div>
            ${questionBody(q, a, locked)}
            <div class="row-actions">
                <button class="btn ghost" type="button" id="prev" ${ex.idx ? "" : "disabled"}>Geri</button>
                <span class="spacer"></span>
                ${needsCheck ? `<button class="btn blue" type="button" id="checkOrder" ${answered(a) ? "" : "disabled"}>Kontrol et</button>` : ""}
                ${last ? `<button class="btn" type="button" id="finish">Sınavı bitir</button>` : `<button class="btn${ex.cfg.instant && !locked ? " ghost" : ""}" type="button" id="next">${ex.cfg.instant && !locked ? "Atla" : "Sonraki"}</button>`}
            </div>`;
        tick();
        const input = document.getElementById("writeIn");
        if (input && !locked) {
            input.addEventListener("input", () => { ex.answers[ex.idx] = input.value; persist(); });
            input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); submitWrite(); } });
            if (window.matchMedia("(min-width: 900px)").matches) input.focus();
        }
    }

    function lockCurrent() {
        current.locked[current.idx] = true;
        persist();
        drawRunner();
    }

    function submitWrite() {
        const ex = current;
        if (ex.cfg.instant) { if (answered(ex.answers[ex.idx])) lockCurrent(); return; }
        if (ex.idx < ex.questions.length - 1) { ex.idx++; persist(); drawRunner(); }
    }

    async function finishExam(force) {
        const ex = current;
        const blank = ex.answers.filter((a) => !answered(a)).length;
        if (!force && blank && !(await U.confirmDialog(`${blank} soru boş. Sınav yine de bitirilsin mi?`, "Bitir"))) return;
        stopTimer();
        const result = Exam.finish(ex);
        current = null;
        location.hash = `#/sonuc/${result.id}`;
    }

    function tick() {
        const ex = current;
        if (!ex || !ex.deadline) return;
        const left = Math.max(0, Math.round((ex.deadline - Date.now()) / 1000));
        const el = document.getElementById("timer");
        if (el) {
            el.lastElementChild.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
            el.classList.toggle("low", left <= 60);
        }
        if (left === 0) { U.toast("Süre doldu"); finishExam(true); }
    }

    function onRunnerClick(e) {
        const ex = current;
        if (!ex) return;
        const t = e.target.closest("button");
        if (!t) return;
        const q = ex.questions[ex.idx];
        if (t.dataset.go !== undefined) { ex.idx = +t.dataset.go; persist(); drawRunner(); return; }
        if (t.id === "prev") { ex.idx--; persist(); drawRunner(); return; }
        if (t.id === "next") { ex.idx++; persist(); drawRunner(); return; }
        if (t.id === "finish") { finishExam(false); return; }
        if (t.id === "checkWrite") { submitWrite(); return; }
        if (t.id === "checkOrder") { lockCurrent(); return; }
        if (ex.locked[ex.idx]) return;
        if (t.dataset.opt !== undefined) {
            ex.answers[ex.idx] = +t.dataset.opt;
            if (ex.cfg.instant) lockCurrent(); else { persist(); drawRunner(); }
            return;
        }
        if (t.dataset.tile !== undefined) {
            ex.answers[ex.idx] = (ex.answers[ex.idx] || []).concat(q.options[+t.dataset.tile]);
            persist(); drawRunner();
            return;
        }
        if (t.dataset.back !== undefined) {
            const list = (ex.answers[ex.idx] || []).slice();
            list.splice(+t.dataset.back, 1);
            ex.answers[ex.idx] = list.length ? list : null;
            persist(); drawRunner();
        }
    }

    Pages.run = function () {
        if (!current) current = DB.live();
        if (!current) return { redirect: "#/sinavlar" };
        return {
            nav: "exams", title: current.cfg.title,
            html: `<div class="page-head"><div class="crumbs"><a href="#/sinavlar">Sınavlar</a> › ${esc(current.cfg.title)}</div></div><div id="runner"></div>`,
            after() {
                document.getElementById("runner").addEventListener("click", onRunnerClick);
                drawRunner();
                if (current.deadline) timerId = setInterval(tick, 1000);
            },
        };
    };

    /* ---------- Results ---------- */
    function reviewCard(item, i) {
        const q = item.q;
        const prompt = q.type === "gap" ? `${q.before}____${q.after}` : q.prompt;
        const lang = q.type === "gap" || Exam.AR_PROMPT.has(q.type) ? ' lang="ar"' : ' dir="auto"';
        return `<div class="card review${item.ok ? "" : " bad"}">
            <p class="small muted">${i + 1}. ${esc(Exam.TYPES[q.type].label)}</p>
            <p class="review-q"${lang}>${esc(prompt)}</p>
            <p class="small"><b>Cevabın:</b> <bdi class="mixed">${esc(Exam.givenText(q, item.a))}</bdi>${item.ok ? "" : ` · <b>Doğrusu:</b> <bdi class="mixed">${esc(Exam.answerText(q))}</bdi>`}</p>
            ${q.explain ? `<p class="small muted"><bdi class="mixed">${esc(q.explain)}</bdi></p>` : ""}
            ${q.wordId && DB.word(q.wordId) ? `<a class="small" href="#/kelime/${encodeURIComponent(q.wordId)}">Kelimeye git</a>` : ""}
        </div>`;
    }

    Pages.result = function (id) {
        const r = DB.exam(id);
        if (!r) return null;
        const grade = Exam.gradeOf(r.pct);
        const wrong = r.items.filter((x) => !x.ok);
        return {
            nav: "exams", title: "Sonuç",
            html: `<div class="page-head"><div class="crumbs"><a href="#/sinavlar">Sınavlar</a> › ${esc(r.title)}</div></div>
            <div class="card result-head">
                <p class="muted">${esc(r.title)}</p>
                <div class="result-grade" lang="ar">${esc(grade.name)}</div>
                <p class="muted">${esc(grade.tr)}</p>
                <p class="result-pct">%${r.pct} · ${r.correct} / ${r.total} doğru · ${Math.floor(r.secs / 60)} dk ${r.secs % 60} sn</p>
                <div class="row-actions" style="justify-content:center"><a class="btn blue" href="#/sinavlar">Sınavlara dön</a></div>
            </div>
            ${wrong.length ? `<h2 class="section-title">Yanlışların (${wrong.length})</h2>${r.items.map((x, i) => (x.ok ? "" : reviewCard(x, i))).join("")}` : ""}
            ${wrong.length < r.total ? `<h2 class="section-title">Doğruların (${r.total - wrong.length})</h2>${r.items.map((x, i) => (x.ok ? reviewCard(x, i) : "")).join("")}` : ""}`,
        };
    };
})();
