/*
 * Seed container and word themes. Loaded first; the word files fill SEED through SEED.add.
 * A theme is a second grouping across pools: seed ids stay `pool:slug`, so a word keeps its pool
 * and only gains a theme. A word has at most one theme; core words may have none.
 *
 * Word row format: [arabic, turkish, level, forms, exampleAr, exampleTr, note?, example2Ar?, example2Tr?]
 * Arabic is fully vowelled. Nouns have no article and no case ending; verbs are past 3rd masc. (see linker.js).
 */
window.SEED = { pools: [], words: {}, sentences: [], paragraphs: [] };

SEED.themes = [
    { id: "home", name: "Ev ve Eşyalar", title: "اَلْبَيْت" },
    { id: "family", name: "Aile ve İlişkiler", title: "اَلْعَائِلَة" },
    { id: "body", name: "Vücut ve Sağlık", title: "اَلْجِسْمُ وَالصِّحَّة" },
    { id: "food", name: "Yiyecek ve İçecek", title: "اَلطَّعَام" },
    { id: "nature", name: "Doğa ve Hava Durumu", title: "اَلطَّبِيعَة" },
    { id: "animals", name: "Hayvanlar", title: "اَلْحَيَوَانَات" },
    { id: "city", name: "Şehir ve Yerler", title: "اَلْمَدِينَة" },
    { id: "travel", name: "Ulaşım ve Seyahat", title: "اَلسَّفَر" },
    { id: "work", name: "İş ve Meslekler", title: "اَلْعَمَل" },
    { id: "school", name: "Okul ve Eğitim", title: "اَلْمَدْرَسَة" },
    { id: "clothes", name: "Giyim", title: "اَلْمَلَابِس" },
    { id: "shopping", name: "Alışveriş ve Para", title: "اَلتَّسَوُّق" },
    { id: "leisure", name: "Hobi ve Spor", title: "اَلْهِوَايَات" },
    { id: "tech", name: "Teknoloji ve Medya", title: "اَلتِّكْنُولُوجْيَا" },
    { id: "feelings", name: "Duygular ve Karakter", title: "اَلْمَشَاعِر" },
    { id: "daily", name: "Günlük Hayat", title: "اَلْحَيَاةُ الْيَوْمِيَّة" },
    { id: "greetings", name: "Selamlaşma ve Nezaket", title: "اَلتَّحِيَّات" },
    { id: "description", name: "Tanımlama Sıfatları", title: "اَلْوَصْف" },
    { id: "colors", name: "Renkler", title: "اَلْأَلْوَان" },
    { id: "countries", name: "Ülkeler ve Milliyetler", title: "اَلْبُلْدَان" },
    { id: "time", name: "Zaman", title: "اَلْوَقْت" },
    { id: "numbers", name: "Sayılar", title: "اَلْأَعْدَاد" },
    { id: "arab", name: "Arap Dünyası", title: "اَلْعَالَمُ الْعَرَبِيّ" },
    { id: "society", name: "Toplum ve Çevre", title: "اَلْمُجْتَمَع" },
    { id: "arts", name: "Sanat ve Kültür", title: "اَلثَّقَافَة" },
    { id: "opinions", name: "Fikir ve Tartışma", title: "اَلْآرَاء" }
];

/* Adds rows to a pool, optionally tagging them all with one theme. */
SEED.add = function (pool, rows, theme) {
    const list = SEED.words[pool] || (SEED.words[pool] = []);
    rows.forEach((row) => list.push({ row, theme: theme || "" }));
};
