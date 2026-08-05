# Özge'nin Sağlık Günlüğü 🌸

Kilo ve ölçü takibi, yapay zekâ destekli yemek günlüğü, protein ağırlıklı haftalık
beslenme programı, kalça-bacak odaklı antrenman planı ve motivasyon günlüğü.

Amaç **kilo vermek değil, kilo ve kas kazanmak**: hızlı kilo kaybı sonrası
kaybedilen dolgunluğu (özellikle kalça ve bacaklarda) sağlıklı biçimde geri
kazanmak. Uygulamadaki tüm hesaplar ve metinler bu yöne göre yazıldı.

> Bu uygulama kişisel takip aracıdır, tıbbi tavsiye vermez ve hekim/diyetisyen
> takibinin yerine geçmez.

---

## Sayfalar

| Sayfa | Ne yapar |
|---|---|
| **Bugün** | Günün kalori/protein/su halkaları, kilo girişi, VKİ, haftalık eğilim, hedefe ilerleme, günün menüsü ve antrenmanı |
| **Yemek** | Ne yediğini normal cümleyle yaz → kalori ve makro tahmini, düzenleyip günlüğe ekleme |
| **Ölçüm** | Kilo grafiği (hedef çizgisiyle) + vücut şeması üzerinden mezura ölçüleri ve ilk ölçümden bu yana değişim |
| **Program** | Haftalık beslenme menüsü, antrenman planı ve market listesi |
| **Koç** | Kayıtlarını gören yapay zekâ koçuyla karşılıklı sohbet |
| **Günce** | Ruh hâli + cilt takibi, günlük not, rozetler, zor gün rehberi, cilt notları, motivasyon panosu |

## Giriş

Şifre: `pembeinci`

Değiştirmek için `src/lib/config.js` içindeki `SITE_PASSWORD` değerini güncelle.
Bu şifre tarayıcı tarafında tutulur; siteyi meraklı gözlerden korur, ciddi bir
kimlik doğrulama değildir.

## Görseller

Hazırladığın görselleri `public/ozge/` klasörüne koy. Beklenen dosya adları ve
boyutlar `public/ozge/README.md` içinde listeli. Bir dosya yoksa sayfa yine
çalışır — o alanda yumuşak bir degrade + emoji görünür.

## Kurulum

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ klasörüne üretim derlemesi
npm run lint
```

Hiçbir ayar yapmadan çalışır: ortam değişkeni tanımlı değilse tüm kayıtlar
tarayıcıda (localStorage) tutulur, kalori tahmini de yerel besin tablosundan
yapılır.

## Ortam değişkenleri (isteğe bağlı)

`.env.example` dosyasına bak. İkisi de bağımsız olarak açılıp kapatılabilir:

| Değişken | Ne sağlar | Yoksa ne olur |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yapay zekâ ile kalori analizi ve koç sohbeti (Netlify fonksiyonları) | Kalori tahmini yerel besin tablosuna düşer, koç sohbeti kapalı kalır |
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` | Kayıtların buluta yazılması, telefon-bilgisayar senkronu | Kayıtlar yalnızca o tarayıcıda kalır |

`ANTHROPIC_API_KEY` sunucu tarafındadır (Netlify ortam değişkeni), tarayıcıya
hiç gönderilmez.

## Supabase (isteğe bağlı)

1. Yeni bir Supabase projesi aç.
2. SQL Editor'a `supabase/schema.sql` dosyasını yapıştırıp çalıştır.
3. Proje URL'i ve `anon` anahtarını Netlify ortam değişkenlerine ekle.

Şema, tek kişilik gizli bir kullanım için açık RLS politikalarıyla gelir; anon
anahtarını bilen okuyup yazabilir. Daha sıkı bir kurulum gerekiyorsa Supabase
Auth'a geçilmeli.

## Yayınlama (Netlify)

`netlify.toml` hazır: derleme komutu `npm run build`, yayın klasörü `dist`,
fonksiyonlar `netlify/functions`. Netlify panelinde ortam değişkenlerini ekleyip
depoyu bağlaman yeterli.

## Yapay zekâ fonksiyonları

| Dosya | Görev |
|---|---|
| `netlify/functions/analiz.js` | Serbest metinden öğünü kalemlere ayırır, kalori/makro tahmini döner (yapılandırılmış JSON çıktı) |
| `netlify/functions/kocluk.js` | Kullanıcının güncel kayıtlarını bağlam alarak koç yanıtı üretir |

İkisi de resmî Anthropic SDK'sını kullanır ve şu davranışa sahiptir:

- **Model yedeklemesi:** önce `claude-opus-5` denenir; API aşırı yüklenmiş
  (429/5xx) dönerse `claude-sonnet-5` denenir. Diğer hatalar gizlenmez.
- **Süre bütçesi:** her istek toplam 22 saniyeyle sınırlı, kalan süre modeller
  arasında paylaştırılır. `AI_BUDGET_MS` ortam değişkeniyle değiştirilebilir.
  (Ölçüm: bu projede 16 saniyelik yanıtlar sorunsuz döndü.) Tipik süreler —
  öğün analizi 7-11 sn, koç yanıtı 12-17 sn.
- **Hata yanıtı**, hangi modellerin denendiğini ve ne kadar sürdüğünü `tried`
  alanında döner; sorun ararken buraya bakmak yeterli.

Fonksiyona ulaşılamazsa arayüz sessizce yerel yedeğe düşer; hata ekranı çıkmaz.

## Hesaplamalar

- **Bazal metabolizma:** Mifflin-St Jeor
- **Günlük ihtiyaç:** BMH × 1,45 (haftada 3-4 gün ağırlık + normal hareket)
- **Hedef kalori:** ihtiyaç + 350 kcal (ılımlı fazla)
- **Protein:** kilo başına 2,2 g · **Yağ:** kalorinin %30'u · **Karbonhidrat:** kalanı

Hedefler güncel kiloya göre otomatik güncellenir. Değerler `src/lib/nutrition.js`
içinde tek yerde toplandı.
