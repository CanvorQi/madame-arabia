/* Shared helpers: escaping, Arabic normalisation, storage, toast, dialogs, speech, icons. */
(function () {
    "use strict";

    const ICONS = {
        home: "M3 11l9-8 9 8M5 10v10h14V10",
        book: "M5 4h14v16H7a2 2 0 01-2-2zM5 18a2 2 0 012-2h12",
        text: "M4 6h16M4 11h16M10 16h10",
        exam: "M9 4h6v3H9zM9 5H6v15h12V5h-3M9 13l2 2 4-4",
        plus: "M12 5v14M5 12h14",
        sound: "M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11",
        check: "M5 12l5 5 9-10",
        edit: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4",
        trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
        search: "M11 4a7 7 0 100 14 7 7 0 000-14zM16 16l5 5",
        moon: "M20 14a8 8 0 01-10-10 8 8 0 1010 10z",
        sun: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2",
        clock: "M12 4a8 8 0 100 16 8 8 0 000-16zM12 8v4l3 2",
        close: "M6 6l12 12M18 6L6 18",
        translate: "M4 6h9M8 4v2c0 4-2 7-4 8M6 10c1 2 3 3 5 4M12 20l4-9 4 9M13.5 17h5",
        arrow: "M9 6l6 6-6 6",
    };

    const esc = (s) => String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const icon = (name) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name] || ""}"/></svg>`;

    const store = {
        get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
        set(k, v) {
            try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { toast("Kayıt yapılamadı: tarayıcı depolaması dolu veya kapalı"); return false; }
        },
        del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
    };

    function toast(msg) {
        const t = document.getElementById("toast");
        if (!t) return;
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(toast._t);
        toast._t = setTimeout(() => t.classList.remove("show"), 2400);
    }

    const uid = () => "u-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    /* Harakat, Quranic marks and tatweel; letters (including hamza seats) are kept. */
    const HARAKAT = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
    const strip = (s) => String(s).normalize("NFC").replace(HARAKAT, "");
    /* Loose form for search and answers: no harakat, no hamza seats, ة = ه, ى = ي, Turkish ı = i. */
    const fold = (s) => strip(s).toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae").normalize("NFD").replace(/\p{M}/gu, "")
        .replace(/ı/g, "i").replace(/ٱ/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");
    const slug = (s) => fold(s).replace(/['’]/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
    const norm = (s) => fold(s).trim();

    function shuffle(list) {
        const a = list.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /* Stable per-day pick, so "word of the day" does not change on reload. */
    function dayIndex(n) {
        const d = new Date();
        return n ? (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % n : 0;
    }

    function speak(text) {
        if (!("speechSynthesis" in window)) { toast("Bu tarayıcı sesli okumayı desteklemiyor"); return; }
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ar-SA";
        u.rate = 0.85;
        const voices = speechSynthesis.getVoices();
        const voice = voices.find((v) => /^ar[-_]SA/i.test(v.lang)) || voices.find((v) => /^ar/i.test(v.lang));
        if (voice) u.voice = voice;
        else if (voices.length) toast("Cihazda Arapça ses yok; ayarlardan Arapça konuşma sesi yükleyebilirsin");
        speechSynthesis.speak(u);
    }

    /* Modal confirm built on <dialog>; resolves true when the user accepts. */
    function confirmDialog(message, okLabel, danger) {
        const d = document.getElementById("dialog");
        d.innerHTML = `<form method="dialog" class="dialog-body">
            <p>${esc(message)}</p>
            <div class="row-actions end">
                <button class="btn ghost" value="no">Vazgeç</button>
                <button class="btn${danger ? " danger" : " blue"}" value="yes">${esc(okLabel || "Tamam")}</button>
            </div></form>`;
        d.returnValue = "";
        d.showModal();
        /* Resolve on submit: the dialog's close event waits for an animation frame. */
        return new Promise((resolve) => {
            d.querySelector("form").addEventListener("submit", (e) => resolve(!!e.submitter && e.submitter.value === "yes"));
            d.addEventListener("cancel", () => resolve(false), { once: true });
        });
    }

    function openSheet(html) {
        const s = document.getElementById("sheet");
        s.innerHTML = `<div class="sheet-body" tabindex="-1" autofocus><button class="icon-btn sheet-close" type="button" data-sheet-close aria-label="Kapat">${icon("close")}</button>${html}</div>`;
        if (!s.open) s.showModal();
    }
    const closeSheet = () => { const s = document.getElementById("sheet"); if (s.open) s.close(); };

    window.U = { esc, icon, store, toast, uid, slug, norm, fold, strip, shuffle, dayIndex, speak, confirmDialog, openSheet, closeSheet };
})();
