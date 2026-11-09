/*
 * Seed word pools: numbers, time, adverbs, function words and set expressions.
 * Row format: see themes.js. Multi-word rows link as phrases; "..." marks a split pair (never linked).
 */
SEED.pools.push(
    { id: "numbers", name: "Sayılar", title: "اَلْأَعْدَاد", code: "٥", kind: "other" },
    { id: "time", name: "Zaman", title: "اَلْوَقْت", code: "٦", kind: "noun" },
    { id: "adverbs", name: "Zarflar", title: "اَلظُّرُوف", code: "٧", kind: "adv" },
    { id: "conjunctions", name: "Bağlaçlar", title: "حُرُوفُ الْعَطْف", code: "٨", kind: "other" },
    { id: "prepositions", name: "Edatlar", title: "حُرُوفُ الْجَرّ", code: "٩", kind: "other" },
    { id: "pronouns", name: "Zamirler ve Soru Sözcükleri", title: "اَلضَّمَائِر", code: "١٠", kind: "other" },
    { id: "expressions", name: "Kalıp İfadeler", title: "اَلتَّعَابِير", code: "١١", kind: "other" },
    { id: "custom", name: "Benim Kelimelerim", title: "كَلِمَاتِي", code: "١٢", kind: "other" }
);

const ORDINAL = "Sıra sayısı: ";
SEED.add("numbers", [
    ["صِفْر", "sıfır", "A1", "", "دَرَجَةُ الْحَرَارَةِ صِفْرٌ.", "Sıcaklık sıfır derece."],
    ["وَاحِد", "bir", "A1", "وَاحِدَة", "لِي أَخٌ وَاحِدٌ.", "Bir erkek kardeşim var.", "Dişili: وَاحِدَة"],
    ["اِثْنَان", "iki", "A1", "اِثْنَيْنِ, اِثْنَتَانِ, اِثْنَتَيْنِ, ثَانٍ, ثَانِي, ثَانِيَة", "اِثْنَانِ وَاثْنَانِ أَرْبَعَةٌ.", "İki iki daha dört eder.", "Çoğu zaman ikil ekiyle anlatılır: كِتَابَانِ (iki kitap). " + ORDINAL + "ثَانٍ"],
    ["ثَلَاثَة", "üç", "A1", "ثَلَاث, ثَالِث, ثَالِثَة", "عِنْدَنَا ثَلَاثَةُ أَطْفَالٍ.", "Üç çocuğumuz var.", "3–10 arası sayılar, saydıkları ismin tersi cinsiyette olur: ثَلَاثَةُ أَوْلَادٍ، ثَلَاثُ بَنَاتٍ. " + ORDINAL + "ثَالِث"],
    ["أَرْبَعَة", "dört", "A1", "أَرْبَع, رَابِع, رَابِعَة", "فِي بَيْتِنَا أَرْبَعُ غُرَفٍ.", "Evimizde dört oda var.", ORDINAL + "رَابِع"],
    ["خَمْسَة", "beş", "A1", "خَمْس, خَامِس, خَامِسَة", "يَعْمَلُ أَبِي خَمْسَةَ أَيَّامٍ فِي الْأُسْبُوعِ.", "Babam haftada beş gün çalışır.", ORDINAL + "خَامِس"],
    ["سِتَّة", "altı", "A1", "سِتّ, سَادِس, سَادِسَة", "اِشْتَرَيْتُ سِتَّ تُفَّاحَاتٍ.", "Altı elma aldım.", ORDINAL + "سَادِس"],
    ["سَبْعَة", "yedi", "A1", "سَبْع, سَابِع, سَابِعَة", "فِي الْأُسْبُوعِ سَبْعَةُ أَيَّامٍ.", "Haftada yedi gün var.", ORDINAL + "سَابِع"],
    ["ثَمَانِيَة", "sekiz", "A1", "ثَمَانِي, ثَمَانٍ, ثَامِن, ثَامِنَة", "عِنْدِي ثَمَانِيَةُ أَقْلَامٍ.", "Sekiz kalemim var.", ORDINAL + "ثَامِن"],
    ["تِسْعَة", "dokuz", "A1", "تِسْع, تَاسِع, تَاسِعَة", "عُمْرُ أَخِي تِسْعُ سَنَوَاتٍ.", "Kardeşim dokuz yaşında.", ORDINAL + "تَاسِع"],
    ["عَشَرَة", "on", "A1", "عَشْر, عَاشِر, عَاشِرَة", "تَعَلَّمْتُ عَشْرَ كَلِمَاتٍ.", "On kelime öğrendim.", ORDINAL + "عَاشِر"],
    ["عِشْرُون", "yirmi", "A1", "عِشْرِينَ", "عُمْرِي عِشْرُونَ سَنَةً.", "Yirmi yaşındayım."],
    ["ثَلَاثُون", "otuz", "A1", "ثَلَاثِينَ", "فِي الْفَصْلِ ثَلَاثُونَ طَالِبًا.", "Sınıfta otuz öğrenci var."],
    ["مِئَة", "yüz", "A1", "مِائَة, مِئَتَانِ", "ثَمَنُ الْكِتَابِ مِئَةُ لِيرَةٍ.", "Kitabın fiyatı yüz lira."],
    ["أَلْف", "bin", "A1", "آلَاف", "فِي الْمَدْرَسَةِ أَلْفُ طَالِبٍ.", "Okulda bin öğrenci var."],
    ["نِصْف", "yarım, yarı; buçuk", "A1", "", "اَلسَّاعَةُ الثَّالِثَةُ وَالنِّصْفُ.", "Saat üç buçuk."]
], "numbers");

SEED.add("time", [
    ["وَقْت", "zaman, vakit", "A1", "أَوْقَات", "لَيْسَ عِنْدِي وَقْتٌ.", "Vaktim yok."],
    ["يَوْم", "gün", "A1", "أَيَّام", "أَدْرُسُ كُلَّ يَوْمٍ.", "Her gün ders çalışırım."],
    ["أُسْبُوع", "hafta", "A1", "أَسَابِيع", "أُسَافِرُ بَعْدَ أُسْبُوعٍ.", "Bir hafta sonra yola çıkıyorum."],
    ["شَهْر", "ay (takvim)", "A1", "أَشْهُر, شُهُور", "رَمَضَانُ شَهْرٌ مُبَارَكٌ.", "Ramazan mübarek bir aydır."],
    ["سَنَة", "yıl; yaş", "A1", "سَنَوَات, سِنِين", "أَتَعَلَّمُ الْعَرَبِيَّةَ مُنْذُ سَنَةٍ.", "Bir yıldır Arapça öğreniyorum."],
    ["سَاعَة", "saat", "A1", "", "كَمِ السَّاعَةُ الْآنَ؟", "Saat şimdi kaç?"],
    ["دَقِيقَة", "dakika", "A1", "دَقَائِق", "اِنْتَظِرْ دَقِيقَةً، مِنْ فَضْلِكَ.", "Bir dakika bekle, lütfen."],
    ["صَبَاح", "sabah", "A1", "", "أَشْرَبُ الْقَهْوَةَ فِي الصَّبَاحِ.", "Sabah kahve içerim."],
    ["مَسَاء", "akşam", "A1", "", "نَأْكُلُ الْعَشَاءَ فِي الْمَسَاءِ.", "Akşam yemeğini akşam yeriz."],
    ["لَيْل", "gece", "A1", "", "اَللَّيْلُ طَوِيلٌ فِي الشِّتَاءِ.", "Kışın gece uzundur."],
    ["نَهَار", "gündüz", "A2", "", "أَعْمَلُ فِي النَّهَارِ.", "Gündüz çalışırım."],
    ["لَيْلَة", "gece (tek bir gece)", "A1", "لَيَالٍ, لَيَالِي", "تَحْكِي جَدَّتِي قِصَّةً كُلَّ لَيْلَةٍ.", "Büyükannem her gece bir hikâye anlatır.", "اَللَّيْلَةَ: bu gece"],
    ["مُسْتَقْبَل", "gelecek", "A2", "", "أُفَكِّرُ فِي الْمُسْتَقْبَلِ.", "Geleceği düşünüyorum."],
    ["مَاضٍ", "geçen, geçmiş", "A2", "مَاضِي, مَاضِيَة", "سَافَرْتُ فِي الصَّيْفِ الْمَاضِي.", "Geçen yaz yolculuk yaptım.", "Belirli hâli: اَلْمَاضِي"],
    ["قَادِم", "gelecek, önümüzdeki", "A2", "قَادِمَة", "أُسَافِرُ فِي الْأُسْبُوعِ الْقَادِمِ.", "Önümüzdeki hafta yolculuğa çıkıyorum."],
    ["اَلسَّبْت", "Cumartesi", "A1", "", "نُنَظِّفُ الْبَيْتَ يَوْمَ السَّبْتِ.", "Cumartesi günü evi temizleriz."],
    ["اَلْأَحَد", "Pazar", "A1", "", "يَوْمَ الْأَحَدِ نَزُورُ جَدَّتِي.", "Pazar günü büyükannemi ziyaret ederiz."],
    ["اَلِاثْنَيْن", "Pazartesi", "A1", "", "يَبْدَأُ الْعَمَلُ يَوْمَ الِاثْنَيْنِ.", "İş pazartesi başlar."],
    ["اَلثُّلَاثَاء", "Salı", "A1", "", "عِنْدِي دَرْسٌ يَوْمَ الثُّلَاثَاءِ.", "Salı günü dersim var."],
    ["اَلْأَرْبِعَاء", "Çarşamba", "A1", "", "نَلْتَقِي يَوْمَ الْأَرْبِعَاءِ.", "Çarşamba günü buluşuyoruz."],
    ["اَلْخَمِيس", "Perşembe", "A1", "", "اَلِامْتِحَانُ يَوْمَ الْخَمِيسِ.", "Sınav perşembe günü."],
    ["اَلْجُمُعَة", "Cuma", "A1", "", "يَوْمُ الْجُمُعَةِ عُطْلَةٌ فِي مِصْرَ.", "Mısır'da cuma tatil günüdür."],
    ["صَيْف", "yaz", "A1", "", "نُسَافِرُ فِي الصَّيْفِ.", "Yazın yolculuğa çıkarız."],
    ["شِتَاء", "kış", "A1", "", "اَلشِّتَاءُ بَارِدٌ.", "Kış soğuk."],
    ["رَبِيع", "ilkbahar", "A1", "", "اَلرَّبِيعُ فَصْلٌ جَمِيلٌ.", "İlkbahar güzel bir mevsim."],
    ["خَرِيف", "sonbahar", "A1", "", "تَسْقُطُ الْأَوْرَاقُ فِي الْخَرِيفِ.", "Sonbaharda yapraklar düşer."]
], "time");

SEED.add("adverbs", [
    ["اَلْيَوْم", "bugün", "A1", "", "اَلْجَوُّ حَارٌّ الْيَوْمَ.", "Bugün hava sıcak."],
    ["أَمْس", "dün", "A1", "", "زُرْتُ صَدِيقِي أَمْسِ.", "Dün arkadaşımı ziyaret ettim."],
    ["غَدًا", "yarın", "A1", "غَد", "سَأُسَافِرُ غَدًا.", "Yarın yola çıkacağım."],
    ["اَلْآنَ", "şimdi", "A1", "", "أَنَا مَشْغُولٌ الْآنَ.", "Şimdi meşgulüm."],
    ["دَائِمًا", "her zaman", "A1", "", "أَشْرَبُ الشَّايَ دَائِمًا.", "Her zaman çay içerim."],
    ["أَحْيَانًا", "bazen", "A1", "", "أَحْيَانًا أَمْشِي إِلَى الْعَمَلِ.", "Bazen işe yürüyerek giderim."],
    ["عَادَةً", "genellikle", "A2", "", "أَنَامُ عَادَةً فِي السَّاعَةِ الْعَاشِرَةِ.", "Genellikle saat onda uyurum."],
    ["مُبَكِّرًا", "erken", "A1", "", "أَسْتَيْقِظُ مُبَكِّرًا.", "Erken uyanırım."],
    ["مُتَأَخِّرًا", "geç", "A1", "", "وَصَلَ الْقِطَارُ مُتَأَخِّرًا.", "Tren geç geldi."],
    ["قَرِيبًا", "yakında", "A2", "", "سَنَلْتَقِي قَرِيبًا.", "Yakında buluşacağız."]
], "time");

SEED.add("adverbs", [
    ["جِدًّا", "çok (sıfattan sonra)", "A1", "", "اَلطَّعَامُ لَذِيذٌ جِدًّا.", "Yemek çok lezzetli.", "Sıfattan sonra gelir."],
    ["كَثِيرًا", "çok (fiille)", "A1", "", "أُحِبُّ الْقِرَاءَةَ كَثِيرًا.", "Okumayı çok severim."],
    ["هُنَا", "burada, buraya", "A1", "", "اِجْلِسْ هُنَا.", "Buraya otur."],
    ["هُنَاكَ", "orada; var", "A1", "", "هُنَاكَ مَطْعَمٌ جَدِيدٌ فِي الشَّارِعِ.", "Caddede yeni bir restoran var."],
    ["أَيْضًا", "de, da; ayrıca", "A1", "", "أَنَا أَيْضًا طَالِبٌ.", "Ben de öğrenciyim."],
    ["فَقَطْ", "sadece", "A1", "", "عِنْدِي دَقِيقَةٌ وَاحِدَةٌ فَقَطْ.", "Sadece bir dakikam var."],
    ["مَعًا", "birlikte", "A1", "", "نَأْكُلُ مَعًا كُلَّ يَوْمٍ.", "Her gün birlikte yeriz."],
    ["أَبَدًا", "asla, hiç", "A2", "", "لَا أَشْرَبُ الْقَهْوَةَ أَبَدًا.", "Hiç kahve içmem."]
]);

SEED.add("conjunctions", [
    ["وَ", "ve", "A1", "", "أَكَلْتُ خُبْزًا وَجُبْنًا.", "Ekmek ve peynir yedim.", "Sonraki kelimeye bitişik yazılır."],
    ["أَوْ", "veya", "A1", "", "هَلْ تُرِيدُ شَايًا أَوْ قَهْوَةً؟", "Çay mı kahve mi istersin?"],
    ["لَكِنَّ", "ama, fakat", "A1", "لَكِنْ", "اَلْقَمِيصُ جَمِيلٌ لَكِنَّهُ غَالٍ.", "Gömlek güzel ama pahalı."],
    ["ثُمَّ", "sonra, ardından", "A1", "", "أَغْسِلُ وَجْهِي ثُمَّ آكُلُ الْفُطُورَ.", "Yüzümü yıkarım, sonra kahvaltı ederim."],
    ["لِأَنَّ", "çünkü", "A1", "", "لَا أَخْرُجُ لِأَنَّ الْجَوَّ بَارِدٌ.", "Dışarı çıkmıyorum çünkü hava soğuk."],
    ["إِذَا", "eğer, -se", "A2", "", "إِذَا كُنْتَ مُتْعَبًا فَنَمْ.", "Yorgunsan uyu."],
    ["عِنْدَمَا", "-dığında, -ince", "A2", "", "عِنْدَمَا وَصَلْتُ، كَانَ الْجَمِيعُ نَائِمِينَ.", "Vardığımda herkes uyuyordu."],
    ["حَتَّى", "-e kadar; hatta", "A2", "", "اِنْتَظَرْتُ حَتَّى الْمَسَاءِ.", "Akşama kadar bekledim."],
    ["أَنْ", "-mek, -mesi (fiilden önce)", "A1", "", "أُرِيدُ أَنْ أَنَامَ.", "Uyumak istiyorum.", "Ardından şimdiki zaman fiili gelir."],
    ["أَنَّ", "ki, -dığı", "A2", "", "أَعْرِفُ أَنَّكَ مَشْغُولٌ.", "Meşgul olduğunu biliyorum."],
    ["لِكَيْ", "-mek için", "A2", "كَيْ", "أَدْرُسُ لِكَيْ أَنْجَحَ.", "Başarmak için çalışıyorum."]
]);

SEED.add("prepositions", [
    ["فِي", "-de, -da; içinde", "A1", "", "أَنَا فِي الْبَيْتِ.", "Ben evdeyim."],
    ["مِنْ", "-den, -dan", "A1", "", "أَنَا مِنْ تُرْكِيَا.", "Ben Türkiye'denim."],
    ["إِلَى", "-e, -a (yön)", "A1", "إِلَيْ", "أَذْهَبُ إِلَى السُّوقِ.", "Çarşıya gidiyorum."],
    ["عَلَى", "üzerinde; -e", "A1", "عَلَيْ", "اَلْكِتَابُ عَلَى الطَّاوِلَةِ.", "Kitap masanın üzerinde."],
    ["مَعَ", "ile, beraber", "A1", "", "أَسْكُنُ مَعَ عَائِلَتِي.", "Ailemle oturuyorum."],
    ["عِنْدَ", "yanında; -de (sahiplik)", "A1", "", "عِنْدِي سَيَّارَةٌ.", "Benim bir arabam var.", "عِنْدِي = bende var"],
    ["لِـ", "için; -in (aitlik)", "A1", "لِي, لَكَ, لَكِ, لَهُ, لَهَا, لَنَا, لَكُمْ, لَهُمْ", "هَذَا الْكِتَابُ لِي.", "Bu kitap benim.", "Kelimeye bitişik yazılır: لِلْبَيْتِ"],
    ["بِـ", "ile (araç); -de", "A1", "بِي, بِكَ, بِهِ, بِهَا, بِنَا, بِهِمْ", "أُسَافِرُ بِالْقِطَارِ.", "Trenle seyahat ederim.", "Kelimeye bitişik yazılır."],
    ["تَحْتَ", "altında", "A1", "", "اَلْقِطَّةُ تَحْتَ الطَّاوِلَةِ.", "Kedi masanın altında."],
    ["فَوْقَ", "üstünde", "A1", "", "اَلصُّورَةُ فَوْقَ السَّرِيرِ.", "Resim yatağın üstünde."],
    ["أَمَامَ", "önünde", "A1", "", "اَلسَّيَّارَةُ أَمَامَ الْبَيْتِ.", "Araba evin önünde."],
    ["خَلْفَ", "arkasında", "A1", "", "اَلْحَدِيقَةُ خَلْفَ الْبَيْتِ.", "Bahçe evin arkasında."],
    ["بَيْنَ", "arasında", "A1", "", "اَلْبَنْكُ بَيْنَ الْمَسْجِدِ وَالْمَدْرَسَةِ.", "Banka caminin ve okulun arasında."],
    ["بِجَانِبِ", "yanında", "A1", "", "اَلصَّيْدَلِيَّةُ بِجَانِبِ الْمَخْبَزِ.", "Eczane fırının yanında."],
    ["قَبْلَ", "önce", "A1", "", "أَغْسِلُ يَدَيَّ قَبْلَ الْأَكْلِ.", "Yemekten önce ellerimi yıkarım."],
    ["بَعْدَ", "sonra", "A1", "", "أَرْتَاحُ بَعْدَ الْعَمَلِ.", "İşten sonra dinlenirim."],
    ["عَنْ", "hakkında; -den (uzaklık)", "A2", "", "نَتَكَلَّمُ عَنِ الْعُطْلَةِ.", "Tatil hakkında konuşuyoruz."],
    ["مُنْذُ", "-den beri", "A2", "", "أَسْكُنُ هُنَا مُنْذُ سَنَتَيْنِ.", "İki yıldır burada oturuyorum."],
    ["حَوْلَ", "etrafında; hakkında", "B1", "", "جَلَسْنَا حَوْلَ الطَّاوِلَةِ.", "Masanın etrafına oturduk."]
]);

SEED.add("pronouns", [
    ["أَنَا", "ben", "A1", "", "أَنَا طَالِبٌ.", "Ben öğrenciyim."],
    ["أَنْتَ", "sen (erkek)", "A1", "", "أَنْتَ صَدِيقِي.", "Sen benim arkadaşımsın."],
    ["أَنْتِ", "sen (kadın)", "A1", "", "أَنْتِ طَالِبَةٌ ذَكِيَّةٌ.", "Sen zeki bir öğrencisin."],
    ["هُوَ", "o (erkek)", "A1", "", "هُوَ مُعَلِّمٌ.", "O öğretmen."],
    ["هِيَ", "o (kadın)", "A1", "", "هِيَ طَبِيبَةٌ.", "O doktor."],
    ["نَحْنُ", "biz", "A1", "", "نَحْنُ مِنْ تُرْكِيَا.", "Biz Türkiye'deniz."],
    ["أَنْتُمْ", "siz", "A1", "", "أَنْتُمْ طُلَّابٌ مُجْتَهِدُونَ.", "Siz çalışkan öğrencilersiniz."],
    ["هُمْ", "onlar", "A1", "", "هُمْ أَصْدِقَائِي.", "Onlar benim arkadaşlarım."],
    ["هَذَا", "bu (erkek)", "A1", "", "هَذَا كِتَابِي.", "Bu benim kitabım."],
    ["هَذِهِ", "bu (kadın)", "A1", "", "هَذِهِ سَيَّارَتِي.", "Bu benim arabam."],
    ["ذَلِكَ", "şu, o (erkek)", "A2", "", "ذَلِكَ الرَّجُلُ طَبِيبٌ.", "Şu adam doktor."],
    ["تِلْكَ", "şu, o (kadın)", "A2", "", "تِلْكَ الْمَدِينَةُ جَمِيلَةٌ.", "O şehir güzel."],
    ["هَؤُلَاءِ", "bunlar", "A2", "", "هَؤُلَاءِ طُلَّابٌ جُدُدٌ.", "Bunlar yeni öğrenciler."],
    ["اَلَّذِي", "ki o, -en (erkek)", "A2", "اَلَّتِي, اَلَّذِينَ", "اَلرَّجُلُ الَّذِي يَعْمَلُ هُنَا لَطِيفٌ.", "Burada çalışan adam nazik.", "Dişili: اَلَّتِي, çoğulu: اَلَّذِينَ"],
    ["كُلّ", "her, bütün", "A1", "", "أَدْرُسُ كُلَّ يَوْمٍ.", "Her gün ders çalışırım."],
    ["بَعْض", "bazı, biraz", "A2", "", "بَعْضُ الطُّلَّابِ غَائِبُونَ.", "Bazı öğrenciler yok."],
    ["جَمِيع", "hepsi, herkes", "A2", "", "ضَحِكَ الْجَمِيعُ.", "Herkes güldü.", "اَلْجَمِيعُ: herkes"],
    ["مَا", "ne (isimle)", "A1", "", "مَا اسْمُكَ؟", "Adın ne?"],
    ["مَاذَا", "ne (fiille)", "A1", "", "مَاذَا تَفْعَلُ؟", "Ne yapıyorsun?"],
    ["مَنْ", "kim", "A1", "", "مَنْ هَذَا؟", "Bu kim?"],
    ["أَيْنَ", "nerede, nereye", "A1", "", "أَيْنَ الْمَحَطَّةُ؟", "İstasyon nerede?"],
    ["مَتَى", "ne zaman", "A1", "", "مَتَى يَبْدَأُ الدَّرْسُ؟", "Ders ne zaman başlıyor?"],
    ["كَيْفَ", "nasıl", "A1", "", "كَيْفَ تَذْهَبُ إِلَى الْعَمَلِ؟", "İşe nasıl gidiyorsun?"],
    ["لِمَاذَا", "neden, niçin", "A1", "", "لِمَاذَا أَنْتَ حَزِينٌ؟", "Neden üzgünsün?"],
    ["كَمْ", "kaç, ne kadar", "A1", "", "كَمْ عُمْرُكَ؟", "Kaç yaşındasın?"],
    ["هَلْ", "mi? (soru edatı)", "A1", "", "هَلْ أَنْتَ طَالِبٌ؟", "Öğrenci misin?", "Evet/hayır sorularının başına gelir."],
    ["أَيّ", "hangi", "A1", "أَيَّة", "أَيُّ كِتَابٍ تُرِيدُ؟", "Hangi kitabı istiyorsun?"]
]);

SEED.add("expressions", [
    ["مَرْحَبًا", "merhaba", "A1", "", "مَرْحَبًا! كَيْفَ حَالُكَ؟", "Merhaba! Nasılsın?"],
    ["اَلسَّلَامُ عَلَيْكُمْ", "selamün aleyküm", "A1", "", "اَلسَّلَامُ عَلَيْكُمْ يَا أَصْدِقَائِي.", "Selamün aleyküm arkadaşlarım."],
    ["وَعَلَيْكُمُ السَّلَامُ", "ve aleyküm selam", "A1", "", "- اَلسَّلَامُ عَلَيْكُمْ. - وَعَلَيْكُمُ السَّلَامُ.", "- Selamün aleyküm. - Ve aleyküm selam."],
    ["صَبَاحُ الْخَيْرِ", "günaydın", "A1", "", "صَبَاحُ الْخَيْرِ يَا أُمِّي!", "Günaydın anneciğim!"],
    ["صَبَاحُ النُّورِ", "günaydın (cevap)", "A1", "", "- صَبَاحُ الْخَيْرِ. - صَبَاحُ النُّورِ.", "- Günaydın. - Sana da günaydın."],
    ["مَسَاءُ الْخَيْرِ", "iyi akşamlar", "A1", "", "مَسَاءُ الْخَيْرِ، كَيْفَ حَالُكُمْ؟", "İyi akşamlar, nasılsınız?"],
    ["تُصْبِحُ عَلَى خَيْرٍ", "iyi geceler", "A1", "تُصْبِحِينَ عَلَى خَيْرٍ", "تُصْبِحُ عَلَى خَيْرٍ يَا أَبِي.", "İyi geceler babacığım.", "Kadına: تُصْبِحِينَ عَلَى خَيْرٍ"],
    ["شُكْرًا", "teşekkürler", "A1", "", "شُكْرًا عَلَى الْهَدِيَّةِ.", "Hediye için teşekkürler."],
    ["شُكْرًا جَزِيلًا", "çok teşekkürler", "A1", "", "شُكْرًا جَزِيلًا يَا صَدِيقِي.", "Çok teşekkürler dostum."],
    ["عَفْوًا", "rica ederim; affedersiniz", "A1", "", "- شُكْرًا. - عَفْوًا.", "- Teşekkürler. - Rica ederim."],
    ["مِنْ فَضْلِكَ", "lütfen", "A1", "مِنْ فَضْلِكِ", "كُوبَ مَاءٍ، مِنْ فَضْلِكَ.", "Bir bardak su, lütfen.", "Kadına: مِنْ فَضْلِكِ"],
    ["نَعَمْ", "evet", "A1", "", "نَعَمْ، أَنَا مِنْ تُرْكِيَا.", "Evet, Türkiye'denim."],
    ["لَا", "hayır; -me (olumsuzluk)", "A1", "", "لَا، شُكْرًا.", "Hayır, teşekkürler."],
    ["كَيْفَ حَالُكَ", "nasılsın?", "A1", "كَيْفَ حَالُكِ", "مَرْحَبًا يَا أَحْمَدُ، كَيْفَ حَالُكَ؟", "Merhaba Ahmet, nasılsın?", "Kadına: كَيْفَ حَالُكِ؟"],
    ["بِخَيْرٍ", "iyi(yim)", "A1", "", "أَنَا بِخَيْرٍ، شُكْرًا.", "İyiyim, teşekkürler."],
    ["اَلْحَمْدُ لِلَّهِ", "elhamdülillah, çok şükür", "A1", "", "بِخَيْرٍ، اَلْحَمْدُ لِلَّهِ.", "İyiyim, çok şükür."],
    ["مَعَ السَّلَامَةِ", "güle güle, hoşça kal", "A1", "", "مَعَ السَّلَامَةِ، إِلَى اللِّقَاءِ.", "Hoşça kal, görüşürüz."],
    ["إِلَى اللِّقَاءِ", "görüşmek üzere", "A1", "", "إِلَى اللِّقَاءِ غَدًا.", "Yarın görüşmek üzere."],
    ["أَهْلًا وَسَهْلًا", "hoş geldin(iz)", "A1", "", "أَهْلًا وَسَهْلًا فِي بَيْتِنَا.", "Evimize hoş geldiniz."],
    ["تَشَرَّفْنَا", "tanıştığımıza memnun oldum", "A1", "", "تَشَرَّفْنَا يَا أُسْتَاذُ.", "Tanıştığımıza memnun oldum hocam."],
    ["آسِف", "özür dilerim", "A1", "آسِفَة", "آسِفٌ، لَا أَفْهَمُ.", "Özür dilerim, anlamıyorum.", "Kadın söylerse: آسِفَة"],
    ["إِنْ شَاءَ اللَّهُ", "inşallah", "A1", "", "سَأَزُورُكَ غَدًا إِنْ شَاءَ اللَّهُ.", "Yarın seni ziyaret edeceğim inşallah."],
    ["يَا", "ey (hitap)", "A1", "", "يَا أَحْمَدُ، تَعَالَ هُنَا!", "Ahmet, buraya gel!", "İsimden önce gelir; Türkçede çoğu zaman çevrilmez."]
], "greetings");

SEED.add("expressions", [
    ["لَيْسَ", "değil", "A1", "لَسْتُ, لَسْتَ, لَسْتِ, لَيْسَتْ, لَسْنَا, لَسْتُمْ, لَيْسُوا", "لَيْسَ عِنْدِي وَقْتٌ.", "Vaktim yok.", "İsim cümlesini olumsuz yapar: لَسْتُ طَالِبًا (Öğrenci değilim)."],
    ["يَجِبُ", "gerekir, -meli", "A2", "", "يَجِبُ أَنْ أَذْهَبَ الْآنَ.", "Şimdi gitmeliyim.", "Ardından أَنْ + fiil gelir."],
    ["يُمْكِنُ", "mümkün, -ebilir", "A2", "", "هَلْ يُمْكِنُنِي أَنْ أَجْلِسَ هُنَا؟", "Buraya oturabilir miyim?", "Zamir ekiyle: يُمْكِنُكَ = yapabilirsin"]
]);
