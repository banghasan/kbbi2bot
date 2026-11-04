# Issue 008 — Cache dan Database

Status: Implemented and verified
Milestone: MVP

## Tujuan

Mengurangi request berulang ke KBBI dengan cache SQLite bawaan Telegram Serverless.

## Desain

- Cache key: input yang telah dinormalisasi.
- TTL: 24 jam.
- Isi: data KBBI terstruktur atau hasil rich message yang telah disanitasi.
- Hanya hasil fetch dan parse yang sukses yang disimpan.
- Cache expired diperlakukan sebagai cache miss.

## Kriteria penerimaan

- Request kedua untuk input yang sama dalam 24 jam tidak memanggil KBBI lagi.
- Perbedaan kapitalisasi/spasi yang tidak bermakna menggunakan cache key yang sama.
- Cache tidak menyimpan token atau data pribadi pengguna.
- Perubahan schema dilakukan melalui alur `push` lalu `migrate`.
- Kegagalan cache tidak membuat command gagal bila fetch KBBI masih tersedia.
