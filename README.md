# Madame Arabia

Türkçe konuşanlar için Arapça (Fasih, harekeli) öğrenme uygulaması (PWA), A1, A2 ve B1 seviyesinde. Kurulum veya derleme adımı yoktur; saf HTML/CSS/JS'dir. Madame Française'in kardeşidir; renkleri mor, beyaz ve mavidir.

- **Temalar:** ev, aile, sağlık, yiyecek, doğa, şehir, seyahat, iş, okul, Arap dünyası gibi 26 konu; her temanın kendi listesi ve sınavı vardır.
- **Kelime havuzları:** fiil, isim, sıfat, Arap dünyası, sayı, zaman, zarf, bağlaç, edat, zamir, kalıp ifade. Fiillerde geçmiş ve şimdiki zaman çekim tablosu, isimlerde kırık çoğul vardır.
- **Cümle ve paragraflar:** içindeki kelimeler havuzlara otomatik bağlanır (و، ف، ب، ل، ك، س ön ekleri, ال takısı ve ي، ك، ه، ها… zamir ekleri dâhil); dokununca anlamı açılır.
- **Sınavlar:** anlam, boşluk doldurma, yazım, cümle kurma, okuma ve kendi soruların; süreli sınav, yanlışları tekrar. Yazımda hareke gerekmez; ekrandaki Arapça klavye Arapça klavyesi olmayanlar içindir.
- **Ekleme:** kelime, toplu kelime, cümle, paragraf, soru, havuz; JSON yedek al / yükle.
- **Sesli okuma:** cihazdaki Arapça konuşma sesini kullanır (yoksa sistem ayarlarından yüklenebilir).

## Yerelde çalıştırma

```bash
python -m http.server 8000
# tarayıcıda: http://localhost:8000
```

Service worker `file://` üzerinden çalışmaz; bir sunucuyla aç.

## GitHub Pages'te yayınlama

1. Bu klasörü bir GitHub deposuna yükle (`index.html` depo kökünde olmalı).
2. Depo → Settings → Pages → Source: Deploy from a branch, branch: `main`, klasör: `/ (root)`.

## Veriler

Eklenenler ve ilerleme yalnızca tarayıcının localStorage'ında durur. Cihaz değiştirmeden önce **Ekle → Yedeği indir** ile yedek al.

## Yeni dosya eklerken

`index.html` ve `sw.js` içindeki `APP_SHELL` listesine ekle; dosya değiştirince `sw.js` içindeki `CACHE_NAME` sürümünü artır.
