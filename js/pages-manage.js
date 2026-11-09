/* Views: everything the user adds, edits, imports and exports; the on-screen Arabic keyboard. */
(function () {
    "use strict";

    const { esc, icon } = U;
    const val = (id) => document.getElementById(id).value.trim();
    const levelOptions = (sel) => DB.LEVELS.map((l) => `<option${l === sel ? " selected" : ""}>${l}</option>`).join("");
    const topicList = () => `<datalist id="topics">${DB.topics().map((t) => `<option value="${esc(t)}"></option>`).join("")}</datalist>`;
    const crumbs = (label) => `<div class="crumbs"><a href="#/ekle">Ekle</a> › ${esc(label)}</div>`;

    function deleteButton(rec) {
        return rec ? `<span class="spacer"></span>
            ${rec.edited ? `<button class="btn ghost" type="button" id="revert">Orijinale dön</button>` : ""}
            <button class="btn danger-text" type="button" id="del">${icon("trash")} Sil</button>` : "";
    }

    function bindRemove(type, rec, label, back) {
        const del = document.getElementById("del");
        if (del) del.addEventListener("click", async () => {
            if (!(await U.confirmDialog(`${label} silinsin mi?`, "Sil", true))) return;
            DB.remove(type, rec.id);
            U.toast("Silindi");
            location.hash = back;
        });
        const rev = document.getElementById("revert");
        if (rev) rev.addEventListener("click", () => {
            DB.revert(type, rec.id);
            U.toast("Orijinal hâline döndü");
            Pages.rerender();
        });
    }

    /* ---------- Add hub ---------- */
    Pages.add = function () {
        const mine = (n) => DB.userList(n).length;
        const box = (href, title, sub) => `<a class="preset" href="${href}"><b>${title}</b><span>${sub}</span></a>`;
        const rows = (name, label, editPath, text) => DB.userList(name).slice().reverse().slice(0, 30).map((r) => `<div class="item-row">
            <a href="#/ekle/${editPath}/${encodeURIComponent(r.id)}"><bdi>${esc(text(r))}</bdi></a><span class="badge">${label}</span></div>`).join("");
        const list = [
            rows("words", "Kelime", "kelime", (r) => `${r.ar} — ${r.tr}`),
            rows("sentences", "Cümle", "cumle", (r) => r.ar),
            rows("paragraphs", "Paragraf", "paragraf", (r) => r.title),
            rows("questions", "Soru", "soru", (r) => r.q),
            rows("pools", "Havuz", "havuz", (r) => r.name),
        ].join("");
        return {
            nav: "add", title: "Ekle",
            html: `<div class="page-head"><h1>Ekle</h1><p>Eklediklerin bu cihazda saklanır, metinlerdeki kelimelere otomatik bağlanır ve sınavlara girer.</p></div>
            <div class="preset-grid">
                ${box("#/ekle/kelime", "Kelime", "Anlam, tür, seviye, çoğul, örnek cümleler")}
                ${box("#/ekle/toplu", "Toplu kelime", "Liste yapıştırarak çok kelime ekle")}
                ${box("#/ekle/cumle", "Cümle", "İçindeki kelimelere otomatik bağlanır")}
                ${box("#/ekle/paragraf", "Paragraf", "Okuma metni ve anlama soruları")}
                ${box("#/ekle/soru", "Sınav sorusu", "Çoktan seçmeli kendi sorun")}
                ${box("#/ekle/havuz", "Kelime havuzu", "Kendi kategorini oluştur")}
            </div>
            <h2 class="section-title">Eklediklerim</h2>
            <div class="card">${list || `<div class="empty">Henüz bir şey eklemedin.</div>`}</div>
            <h2 class="section-title">Yedek</h2>
            <div class="card">
                <p class="muted">Veriler yalnızca bu tarayıcıda durur. Telefon değiştirmeden veya tarayıcı verilerini silmeden önce yedek al. Yedek dosyası başka bir cihaza da yüklenebilir.</p>
                <div class="row-actions">
                    <button class="btn blue" type="button" id="export">Yedeği indir</button>
                    <label class="btn ghost" for="importFile">Yedeği yükle</label>
                    <input id="importFile" type="file" accept="application/json,.json" hidden>
                    ${DB.hiddenCount() ? `<button class="btn ghost" type="button" id="restore">Silinen hazır içerikleri geri getir (${DB.hiddenCount()})</button>` : ""}
                </div>
                ${mine("words") + mine("sentences") + mine("paragraphs") + mine("questions") + mine("pools") ? `<div class="row-actions"><button class="btn danger-text" type="button" id="wipe">Eklediklerimin tümünü sil</button></div>` : ""}
            </div>`,
            after() {
                document.getElementById("export").addEventListener("click", () => {
                    const blob = new Blob([JSON.stringify(DB.exportData(), null, 1)], { type: "application/json" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `madame-arabia-yedek-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
                    U.toast("Yedek indirildi");
                });
                document.getElementById("importFile").addEventListener("change", async (e) => {
                    const f = e.target.files[0];
                    if (!f) return;
                    try {
                        const added = DB.importData(JSON.parse(await f.text()));
                        U.toast(`Yedek yüklendi: ${added} yeni kayıt`);
                        Pages.rerender();
                    } catch (err) { U.toast("Bu dosya geçerli bir Madame Arabia yedeği değil"); }
                    e.target.value = "";
                });
                const restore = document.getElementById("restore");
                if (restore) restore.addEventListener("click", () => { DB.restoreHidden(); U.toast("Geri getirildi"); Pages.rerender(); });
                const wipe = document.getElementById("wipe");
                if (wipe) wipe.addEventListener("click", async () => {
                    if (!(await U.confirmDialog("Eklediğin tüm kelime, cümle, paragraf, soru ve havuzlar silinecek. Bu işlem geri alınamaz.", "Tümünü sil", true))) return;
                    DB.clearUser();
                    U.toast("Silindi");
                    Pages.rerender();
                });
            },
        };
    };

    /* ---------- On-screen Arabic keyboard; types into the last focused Arabic field ---------- */
    const LETTERS = "ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي".split(" ");
    const HAMZA = "ء أ إ آ ؤ ئ ى ة".split(" ");
    const MARKS = ["َ", "ُ", "ِ", "ْ", "ّ", "ً", "ٌ", "ٍ"];
    const BACK = "⌫";
    let lastField = null;
    document.addEventListener("focusin", (e) => { if (e.target.matches('input[lang="ar"], textarea[lang="ar"]')) lastField = e.target; });
    document.addEventListener("mousedown", (e) => { if (e.target.closest("[data-char]")) e.preventDefault(); });

    const key = (c, label, cls) => `<button class="key${cls ? " " + cls : ""}" type="button" data-char="${esc(c)}" aria-label="${esc(label || c)}">${esc(label || c)}</button>`;
    Pages.keyboard = (open) => `<details class="kbd-box"${open ? " open" : ""}><summary>Arapça klavye</summary>
        <div class="kbd" dir="rtl" lang="ar">
            <div class="kbd-row">${LETTERS.map((c) => key(c)).join("")}</div>
            <div class="kbd-row">${HAMZA.map((c) => key(c)).join("")}${MARKS.map((m) => key(m, `ـ${m}`, "mark")).join("")}</div>
            <div class="kbd-row">${key(" ", "boşluk", "wide")}${key(BACK, "sil ⌫", "wide")}</div>
        </div></details>`;

    Pages.typeChar = function (ch) {
        const el = lastField && lastField.isConnected ? lastField : document.querySelector('#view input[lang="ar"], #view textarea[lang="ar"]');
        if (!el || el.disabled) return;
        const s = el.selectionStart === null ? el.value.length : el.selectionStart;
        const e = el.selectionEnd === null ? s : el.selectionEnd;
        if (ch === BACK) {
            if (s !== e) el.setRangeText("", s, e, "end");
            else if (s > 0) el.setRangeText("", s - 1, s, "end");
        } else el.setRangeText(ch, s, e, "end");
        el.focus();
        el.dispatchEvent(new Event("input", { bubbles: true }));
    };

    /* ---------- Word ---------- */
    const exampleRow = (e) => `<div class="ex-row">
        <input class="input" data-ex="ar" lang="ar" placeholder="Örnek cümle (Arapça)" aria-label="Örnek cümle" value="${esc(e.ar)}">
        <input class="input" data-ex="tr" placeholder="Türkçesi" aria-label="Türkçesi" value="${esc(e.tr)}">
        <button class="s-btn" type="button" data-remove-ex>${icon("trash")} Kaldır</button></div>`;

    Pages.editWord = function (id, query) {
        const rec = id ? DB.word(id) : null;
        if (id && !rec) return null;
        const defaultPool = (rec && rec.pool) || query.get("pool") || "custom";
        const poolKind = (p) => (DB.pool(p) ? DB.pool(p).kind : "other");
        const w = rec || { ar: query.get("ar") || "", tr: "", level: "A1", forms: "", note: "", ex: [{ ar: "", tr: "" }], kind: poolKind(defaultPool), theme: query.get("theme") || "" };
        return {
            nav: "add", title: rec ? "Kelimeyi düzenle" : "Kelime ekle",
            html: `<div class="page-head">${crumbs("Kelime")}<h1>${rec ? "Kelimeyi düzenle" : "Kelime ekle"}</h1></div>
            <form class="card" id="form">
                <div class="form-grid">
                    <div class="form-row"><label for="ar">Arapça *</label><input class="input" id="ar" required lang="ar" autocapitalize="off" value="${esc(w.ar)}"><p class="hint">Harekeli yazman önerilir. İsmi ال olmadan (<span lang="ar">كِتَاب</span>), fiili geçmiş zaman “o” hâliyle (<span lang="ar">كَتَبَ</span>) yaz.</p></div>
                    <div class="form-row"><label for="tr">Türkçe anlamı *</label><input class="input" id="tr" required value="${esc(w.tr)}"></div>
                </div>
                <div class="form-grid">
                    <div class="form-row"><label for="pool">Havuz</label><select class="input" id="pool">${DB.pools().map((p) => `<option value="${esc(p.id)}"${p.id === defaultPool ? " selected" : ""}>${esc(p.name)}</option>`).join("")}</select></div>
                    <div class="form-row"><label for="kind">Tür</label><select class="input" id="kind">${Object.keys(DB.KINDS).map((k) => `<option value="${k}"${k === w.kind ? " selected" : ""}>${DB.KINDS[k]}</option>`).join("")}</select></div>
                    <div class="form-row"><label for="level">Seviye</label><select class="input" id="level">${levelOptions(w.level)}</select></div>
                </div>
                <div class="form-row"><label for="theme">Tema</label><select class="input" id="theme"><option value="">Temasız</option>${DB.themes().map((t) => `<option value="${esc(t.id)}"${t.id === w.theme ? " selected" : ""}>${esc(t.name)}</option>`).join("")}</select></div>
                <div class="form-row"><label for="forms">Çoğul ve düzensiz biçimler</label><input class="input" id="forms" lang="ar" placeholder="كُتُب" value="${esc(w.forms)}">
                    <p class="hint">Virgülle ayır. İsim: kırık çoğul (<span lang="ar">كُتُب</span>). Sıfat: düzensiz dişil/çoğul (<span lang="ar">حَمْرَاء، كِبَار</span>). Fiil: önce geniş zaman (<span lang="ar">يَكْتُبُ</span>); çekimi düzensizse <code>past=</code> ve <code>pres=</code> ile 8 kişiyi boşlukla sırala (أنا، أنتَ، أنتِ، هو، هي، نحن، أنتم، هم). Düzenli ekler (ـة، ـات، ـون) ve ön ekler (و، ب، ال…) otomatik tanınır.</p></div>
                ${Pages.keyboard(false)}
                <div class="form-row" style="margin-top:14px"><label for="note">Not</label><input class="input" id="note" value="${esc(w.note)}"></div>
                <div class="form-row"><span class="form-label">Örnek cümleler</span><div id="examples">${(w.ex.length ? w.ex : [{ ar: "", tr: "" }]).map(exampleRow).join("")}</div>
                    <button class="btn ghost sm" type="button" id="addEx">${icon("plus")} Örnek ekle</button></div>
                <div class="row-actions"><button class="btn" type="submit">Kaydet</button>${deleteButton(rec)}</div>
            </form>`,
            after() {
                const box = document.getElementById("examples");
                document.getElementById("addEx").addEventListener("click", () => box.insertAdjacentHTML("beforeend", exampleRow({ ar: "", tr: "" })));
                box.addEventListener("click", (e) => { const b = e.target.closest("[data-remove-ex]"); if (b) b.parentElement.remove(); });
                document.getElementById("pool").addEventListener("change", (e) => { document.getElementById("kind").value = poolKind(e.target.value); });
                document.getElementById("form").addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const ex = Array.from(box.querySelectorAll(".ex-row")).map((r) => ({ ar: r.querySelector('[data-ex="ar"]').value.trim(), tr: r.querySelector('[data-ex="tr"]').value.trim() })).filter((x) => x.ar);
                    const data = { id: rec ? rec.id : undefined, ar: val("ar"), tr: val("tr"), pool: val("pool"), kind: val("kind"), theme: val("theme"), level: val("level"), forms: val("forms"), note: val("note"), ex };
                    const dup = DB.words().find((x) => x.id !== data.id && x.pool === data.pool && U.fold(x.ar) === U.fold(data.ar));
                    if (dup && !(await U.confirmDialog(`"${data.ar}" bu havuzda zaten var. Yine de eklensin mi?`, "Ekle"))) return;
                    const saved = DB.save("word", data);
                    U.toast("Kelime kaydedildi");
                    location.hash = `#/kelime/${encodeURIComponent(saved.id)}`;
                });
                bindRemove("word", rec, rec ? `"${rec.ar}"` : "", `#/havuz/${defaultPool}`);
            },
        };
    };

    /* ---------- Bulk words: one per line, "kelime | anlam | örnek | örnek çevirisi" ---------- */
    Pages.bulk = function () {
        return {
            nav: "add", title: "Toplu kelime",
            html: `<div class="page-head">${crumbs("Toplu kelime")}<h1>Toplu kelime ekle</h1><p>Her satıra bir kelime yaz. Alanları <b>|</b> ile ayır: <code>kelime | anlam | örnek | örneğin çevirisi</code>. Son ikisi isteğe bağlı.</p></div>
            <form class="card" id="form">
                <div class="form-row"><label for="lines">Liste *</label><textarea class="input" id="lines" rows="9" required lang="ar" placeholder="تُفَّاحَة | elma | آكُلُ تُفَّاحَةً. | Bir elma yiyorum."></textarea>${Pages.keyboard(false)}</div>
                <div class="form-grid">
                    <div class="form-row"><label for="pool">Havuz</label><select class="input" id="pool">${DB.pools().map((p) => `<option value="${esc(p.id)}"${p.id === "custom" ? " selected" : ""}>${esc(p.name)}</option>`).join("")}</select></div>
                    <div class="form-row"><label for="kind">Tür</label><select class="input" id="kind">${Object.keys(DB.KINDS).map((k) => `<option value="${k}"${k === "other" ? " selected" : ""}>${DB.KINDS[k]}</option>`).join("")}</select></div>
                    <div class="form-row"><label for="level">Seviye</label><select class="input" id="level">${levelOptions("A1")}</select></div>
                </div>
                <button class="btn" type="submit">Ekle</button>
            </form>`,
            after() {
                document.getElementById("pool").addEventListener("change", (e) => { const p = DB.pool(e.target.value); if (p) document.getElementById("kind").value = p.kind; });
                document.getElementById("form").addEventListener("submit", (e) => {
                    e.preventDefault();
                    const pool = val("pool");
                    let added = 0;
                    let skipped = 0;
                    val("lines").split(/\r?\n/).forEach((line) => {
                        if (!line.trim()) return;
                        const [ar, tr, exAr, exTr] = line.split("|").map((s) => s.trim());
                        const dup = ar && DB.words().some((x) => x.pool === pool && U.fold(x.ar) === U.fold(ar));
                        if (!ar || !tr || dup) { skipped++; return; }
                        DB.save("word", { ar, tr, pool, kind: val("kind"), level: val("level"), forms: "", note: "", ex: exAr ? [{ ar: exAr, tr: exTr || "" }] : [] });
                        added++;
                    });
                    U.toast(`${added} kelime eklendi${skipped ? `, ${skipped} satır atlandı` : ""}`);
                    location.hash = `#/havuz/${encodeURIComponent(pool)}`;
                });
            },
        };
    };

    /* ---------- Sentence ---------- */
    function linkPreview(text) {
        const segs = Linker.scan(text).filter((s) => s.ids);
        if (!segs.length) return `<span class="muted small">Cümleyi yazınca bağlanan kelimeler burada görünür.</span>`;
        return `<div class="word-chips">${segs.map((s) => {
            const w = s.ids.length ? DB.word(s.ids[0]) : null;
            return w ? `<span class="word-chip"><span lang="ar">${esc(s.text)}</span> <small>${esc(w.tr)}</small></span>` : `<span class="word-chip unknown" lang="ar">${esc(s.text)}</span>`;
        }).join("")}</div>`;
    }

    Pages.editSentence = function (id) {
        const rec = id ? DB.sentence(id) : null;
        if (id && !rec) return null;
        const s = rec || { ar: "", tr: "", level: "A1", topic: "" };
        return {
            nav: "add", title: rec ? "Cümleyi düzenle" : "Cümle ekle",
            html: `<div class="page-head">${crumbs("Cümle")}<h1>${rec ? "Cümleyi düzenle" : "Cümle ekle"}</h1></div>
            <form class="card" id="form">
                <div class="form-row"><label for="ar">Arapça cümle *</label><textarea class="input" id="ar" rows="2" required lang="ar">${esc(s.ar)}</textarea>${Pages.keyboard(false)}</div>
                <div class="form-row"><span class="form-label">Bağlanan kelimeler</span><div id="preview"></div><p class="hint">Kesik çizgililer havuzda yok; kaydettikten sonra dokunup ekleyebilirsin.</p></div>
                <div class="form-row"><label for="tr">Türkçesi</label><textarea class="input" id="tr" rows="2">${esc(s.tr)}</textarea></div>
                <div class="form-grid">
                    <div class="form-row"><label for="level">Seviye</label><select class="input" id="level">${levelOptions(s.level)}</select></div>
                    <div class="form-row"><label for="topic">Konu</label><input class="input" id="topic" list="topics" value="${esc(s.topic)}">${topicList()}</div>
                </div>
                <div class="row-actions"><button class="btn" type="submit">Kaydet</button>${deleteButton(rec)}</div>
            </form>`,
            after() {
                const ar = document.getElementById("ar");
                const preview = document.getElementById("preview");
                const draw = () => { preview.innerHTML = linkPreview(ar.value); };
                ar.addEventListener("input", draw);
                draw();
                document.getElementById("form").addEventListener("submit", (e) => {
                    e.preventDefault();
                    DB.save("sentence", { id: rec ? rec.id : undefined, ar: val("ar"), tr: val("tr"), level: val("level"), topic: val("topic") });
                    U.toast("Cümle kaydedildi");
                    location.hash = "#/cumleler";
                });
                bindRemove("sentence", rec, "Bu cümle", "#/cumleler");
            },
        };
    };

    /* ---------- Paragraph ---------- */
    const questionRow = (q) => `<div class="ex-row" data-q-row>
        <input class="input" data-q-text lang="ar" placeholder="Soru" aria-label="Soru" value="${esc(q.q)}">
        ${[0, 1, 2, 3].map((i) => optionInput(q, i, true)).join("")}
        <button class="s-btn" type="button" data-remove-ex>${icon("trash")} Soruyu kaldır</button></div>`;
    let radioGroup = 0;
    function optionInput(q, i, arabic) {
        if (i === 0) radioGroup++;
        return `<div class="opt-row"><input type="radio" name="ans${radioGroup}" value="${i}" ${q.a === i ? "checked" : ""} aria-label="Şık ${i + 1} doğru"><input class="input" data-q-opt ${arabic ? 'lang="ar"' : 'dir="auto"'} placeholder="Şık ${i + 1}" aria-label="Şık ${i + 1}" value="${esc(q.o[i] || "")}"></div>`;
    }
    const emptyQ = () => ({ q: "", o: [], a: 0 });
    function readQuestionRow(row) {
        const o = Array.from(row.querySelectorAll("[data-q-opt]")).map((x) => x.value.trim());
        const checked = +row.querySelector('input[type="radio"]:checked').value;
        const filled = o.filter(Boolean);
        const text = row.querySelector("[data-q-text]");
        return { q: text ? text.value.trim() : "", o: filled, a: Math.max(0, filled.indexOf(o[checked])) };
    }

    Pages.editParagraph = function (id) {
        const rec = id ? DB.paragraph(id) : null;
        if (id && !rec) return null;
        const p = rec || { title: "", ar: "", tr: "", level: "A1", topic: "", q: [] };
        return {
            nav: "add", title: rec ? "Paragrafı düzenle" : "Paragraf ekle",
            html: `<div class="page-head">${crumbs("Paragraf")}<h1>${rec ? "Paragrafı düzenle" : "Paragraf ekle"}</h1></div>
            <form class="card" id="form">
                <div class="form-row"><label for="title">Başlık *</label><input class="input" id="title" required lang="ar" value="${esc(p.title)}"></div>
                <div class="form-row"><label for="ar">Arapça metin *</label><textarea class="input" id="ar" rows="7" required lang="ar">${esc(p.ar)}</textarea>${Pages.keyboard(false)}</div>
                <div class="form-row"><label for="tr">Türkçesi</label><textarea class="input" id="tr" rows="5">${esc(p.tr)}</textarea></div>
                <div class="form-grid">
                    <div class="form-row"><label for="level">Seviye</label><select class="input" id="level">${levelOptions(p.level)}</select></div>
                    <div class="form-row"><label for="topic">Konu</label><input class="input" id="topic" list="topics" value="${esc(p.topic)}">${topicList()}</div>
                </div>
                <div class="form-row"><span class="form-label">Anlama soruları</span><p class="hint" style="margin:0 0 6px">Yuvarlak düğme doğru şıkkı gösterir. Sorular Okuma sınavına girer.</p>
                    <div id="qs">${p.q.map(questionRow).join("")}</div>
                    <button class="btn ghost sm" type="button" id="addQ">${icon("plus")} Soru ekle</button></div>
                <div class="row-actions"><button class="btn" type="submit">Kaydet</button>${deleteButton(rec)}</div>
            </form>`,
            after() {
                const qs = document.getElementById("qs");
                document.getElementById("addQ").addEventListener("click", () => qs.insertAdjacentHTML("beforeend", questionRow(emptyQ())));
                qs.addEventListener("click", (e) => { const b = e.target.closest("[data-remove-ex]"); if (b) b.parentElement.remove(); });
                document.getElementById("form").addEventListener("submit", (e) => {
                    e.preventDefault();
                    const questions = Array.from(qs.querySelectorAll("[data-q-row]")).map(readQuestionRow).filter((q) => q.q && q.o.length >= 2);
                    const saved = DB.save("paragraph", { id: rec ? rec.id : undefined, title: val("title"), ar: val("ar"), tr: val("tr"), level: val("level"), topic: val("topic"), q: questions });
                    U.toast("Paragraf kaydedildi");
                    location.hash = `#/paragraf/${encodeURIComponent(saved.id)}`;
                });
                bindRemove("paragraph", rec, `"${rec ? rec.title : ""}"`, "#/paragraflar");
            },
        };
    };

    /* ---------- Exam question ---------- */
    Pages.editQuestion = function (id) {
        const rec = id ? DB.question(id) : null;
        if (id && !rec) return null;
        const q = rec || { q: "", o: [], a: 0, level: "A1", pool: "", explain: "" };
        return {
            nav: "add", title: rec ? "Soruyu düzenle" : "Sınav sorusu ekle",
            html: `<div class="page-head">${crumbs("Sınav sorusu")}<h1>${rec ? "Soruyu düzenle" : "Sınav sorusu ekle"}</h1></div>
            <form class="card" id="form">
                <div class="form-row"><label for="q">Soru *</label><textarea class="input" id="q" rows="2" required dir="auto">${esc(q.q)}</textarea></div>
                <div class="form-row" data-q-row><span class="form-label">Şıklar (en az 2, yuvarlak düğme doğruyu gösterir)</span>${[0, 1, 2, 3].map((i) => optionInput(q, i, false)).join("")}</div>
                <div class="form-row"><label for="explain">Açıklama</label><input class="input" id="explain" dir="auto" value="${esc(q.explain)}"></div>
                <div class="form-grid">
                    <div class="form-row"><label for="level">Seviye</label><select class="input" id="level">${levelOptions(q.level)}</select></div>
                    <div class="form-row"><label for="pool">İlgili havuz</label><select class="input" id="pool"><option value="">Genel</option>${DB.pools().map((p) => `<option value="${esc(p.id)}"${p.id === q.pool ? " selected" : ""}>${esc(p.name)}</option>`).join("")}</select></div>
                </div>
                <div class="row-actions"><button class="btn" type="submit">Kaydet</button>${deleteButton(rec)}</div>
            </form>`,
            after() {
                document.getElementById("form").addEventListener("submit", (e) => {
                    e.preventDefault();
                    const row = readQuestionRow(document.querySelector("[data-q-row]"));
                    if (row.o.length < 2) { U.toast("En az iki şık yaz"); return; }
                    DB.save("question", { id: rec ? rec.id : undefined, q: val("q"), o: row.o, a: row.a, level: val("level"), pool: val("pool"), explain: val("explain") });
                    U.toast("Soru kaydedildi");
                    location.hash = "#/ekle";
                });
                bindRemove("question", rec, "Bu soru", "#/ekle");
            },
        };
    };

    /* ---------- Pool ---------- */
    Pages.editPool = function (id) {
        const rec = id ? DB.pool(id) : null;
        if (id && (!rec || rec.seed)) return null;
        const p = rec || { name: "", title: "", code: "", kind: "other" };
        const count = rec ? DB.wordsIn(rec.id).length : 0;
        return {
            nav: "add", title: rec ? "Havuzu düzenle" : "Havuz oluştur",
            html: `<div class="page-head">${crumbs("Havuz")}<h1>${rec ? "Havuzu düzenle" : "Kelime havuzu oluştur"}</h1></div>
            <form class="card" id="form">
                <div class="form-grid">
                    <div class="form-row"><label for="name">Ad *</label><input class="input" id="name" required maxlength="60" placeholder="Mutfak kelimeleri" value="${esc(p.name)}"></div>
                    <div class="form-row"><label for="title">Arapça ad</label><input class="input" id="title" maxlength="60" lang="ar" placeholder="اَلْمَطْبَخ" value="${esc(p.title)}"></div>
                </div>
                <div class="form-grid">
                    <div class="form-row"><label for="code">Kemer numarası</label><input class="input" id="code" maxlength="4" lang="ar" placeholder="١٣" value="${esc(p.code)}"><p class="hint">Kartın kemerinde görünen numara.</p></div>
                    <div class="form-row"><label for="kind">Varsayılan tür</label><select class="input" id="kind">${Object.keys(DB.KINDS).map((k) => `<option value="${k}"${k === p.kind ? " selected" : ""}>${DB.KINDS[k]}</option>`).join("")}</select></div>
                </div>
                <div class="row-actions"><button class="btn" type="submit">Kaydet</button>${deleteButton(rec)}</div>
            </form>`,
            after() {
                document.getElementById("form").addEventListener("submit", (e) => {
                    e.preventDefault();
                    const saved = DB.save("pool", { id: rec ? rec.id : undefined, name: val("name"), title: val("title"), code: val("code"), kind: val("kind") });
                    U.toast("Havuz kaydedildi");
                    location.hash = `#/havuz/${encodeURIComponent(saved.id)}`;
                });
                bindRemove("pool", rec, count ? `Bu havuz ve içindeki ${count} kelime` : "Bu havuz", "#/kelimeler");
            },
        };
    };
})();
