# Görseller buraya

Hazırladığın görselleri **bu klasöre** koy. Uygulama dosyaları buradaki
isimlerle arar. Bir dosya yoksa sayfa yine çalışır — o alanda emoji/degrade
görünür. Yani hepsini birden koymak zorunda değilsin.

## Beklenen dosya isimleri

| Dosya | Nerede görünür | Önerilen boyut |
|---|---|---|
| `login.jpg` | Giriş (şifre) ekranının arka planı | 1200 × 1600 (dikey) |
| `avatar.jpg` | Üst bardaki küçük yuvarlak profil | 400 × 400 (kare) |
| `hero.jpg` | "Bugün" sayfasının üst kapak görseli | 1600 × 900 (yatay) |
| `hedef.jpg` | İlerleme kartındaki hedef görseli | 800 × 1000 |
| `yemek.jpg` | Beslenme programı sayfası başlığı | 1600 × 900 |
| `antrenman.jpg` | Antrenman sekmesi başlığı | 1600 × 900 |
| `cilt.jpg` | Cilt bakımı bölümü başlığı | 1600 × 900 |
| `galeri-1.jpg` … `galeri-8.jpg` | Motivasyon galerisi (kaç tane koyarsan o kadarı görünür) | 800 × 800 (kare) |

## Notlar

- Uzantı `.jpg` olmalı. Elindeki dosya PNG ise ya `.jpg`'ye çevir ya da
  `src/lib/media.js` içindeki yolları `.png` olarak güncelle.
- Dosyaları küçültmeye çalış (her biri ideal olarak 300 KB altı) — sayfa
  telefonda daha hızlı açılır.
- Bu klasördeki her şey herkese açık olarak yayınlanır (site linkine sahip
  olan görebilir). Özel görselleri buraya koyma.
