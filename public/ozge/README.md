# Görseller buraya

Özge'nin çizimleri **bu klasöre** konur. Uygulama dosyaları buradaki isimlerle
arar. Bir dosya yoksa sayfa yine çalışır — o alan sessizce gizlenir ya da
yerine emoji/degrade gelir. Yani hepsini birden koymak zorunda değilsin.

Hepsi **şeffaf zeminli PNG** olarak beklenir ve kırpılmadan, olduğu gibi
gösterilir.

## Dosyalar

| Dosya | Görsel | Nerede görünür |
|---|---|---|
| `olcum.png` | Ölçü noktaları etiketli tam boy şema | **Ölçüm** sayfasındaki interaktif şema — noktalara dokununca ölçü girilir |
| `su.png` | Su içerken | "Bugün" sayfasında su takibi bölümü |
| `yuruyus.png` | Yürüyüş (akıllı saate bakarken) | "Bugün" karşılama kartı ve Program → Antrenman başlığı |
| `meditasyon.png` | Meditasyon (bağdaş kurmuş) | Giriş ekranı ve Günce → "Zor bir gün mü?" |
| `uyku.png` | Uyurken | Günce → uyku hatırlatması |
| `galeri-1.png` … `galeri-8.png` | Serbest | Günce → motivasyon panosu (kaç tane koyarsan o kadarı görünür) |

## `olcum.png` hakkında

Bu görselin üzerindeki mavi noktalar ve etiketler (BOYUN, OMUZLAR, GÖĞÜS,
PAZI, BEL, KALÇA, ÜST BACAK, ALT BALDIR) uygulamanın ölçüm alanlarıyla birebir
eşleşir. Uygulama görselin üstüne kendi noktalarını çizmez; sadece seçili olanı
parlatır ve doldurulmuş olanları yeşil halkayla işaretler.

Nokta konumları `src/lib/bodyPoints.js` içinde yüzde olarak tutulur. Görseli
değiştirirsen (nokta yerleri kayarsa) oradaki `x` / `y` değerlerini ve
`DIAGRAM_RATIO` en-boy oranını güncellemek gerekir.

## Notlar

- Uzantı `.png` olmalı. Farklı bir uzantı kullanacaksan `src/lib/media.js`
  içindeki yolları güncelle.
- Dosyaları küçültmeye çalış (her biri ideal olarak 300 KB altı) — sayfa
  telefonda daha hızlı açılır.
- Bu klasördeki her şey herkese açık olarak yayınlanır (site linkine sahip
  olan görebilir). Özel görselleri buraya koyma.
