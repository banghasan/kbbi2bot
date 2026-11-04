# Issue 008 — Cache dan Database

Status: Implemented and verified
Milestone: MVP

## Tujuan

Mengurangi request berulang ke KBBI dengan cache SQLite bawaan Telegram Serverless.

## Desain

- Cache key: `v4:<input-yang-telah-dinormalisasi>`.
- TTL: 24 jam.
- Isi: payload JSON mentah dari endpoint KBBI, bukan hasil parser atau rich message.
- Payload JSON diparse ulang setiap kali dibaca dari cache agar perubahan parser langsung berlaku.
- Hanya payload fetch yang valid dan dapat diparse saat pertama kali diterima yang disimpan.
- Cache expired diperlakukan sebagai cache miss.

## Alasan menyimpan JSON mentah

Cache tidak menyimpan hasil parser karena formatter dan parser dapat berubah setelah data tersimpan. Jika hasil terstruktur disimpan, perubahan seperti:

- format indeks homonim menjadi `kamus¹`;
- pemisahan definisi ke baris baru;
- pengelompokan variasi dan hasil terkait;
- perubahan rich message;

baru terlihat setelah cache kedaluwarsa atau cache dihapus.

Dengan menyimpan JSON mentah, alurnya menjadi:

```text
cache hit JSON mentah
        ↓
parse ulang dengan kode terbaru
        ↓
format rich message terbaru
```

Perubahan struktur cache yang tidak kompatibel menggunakan kenaikan `CACHE_KEY_VERSION`. Cache versi lama tidak dihapus secara langsung, tetapi tidak lagi dibaca dan akan kedaluwarsa secara alami.

## Alur request

1. Normalisasi query.
2. Baca payload JSON dari cache berdasarkan key versi aktif.
3. Jika cache hit, parse payload dengan parser saat ini.
4. Jika cache miss atau payload gagal diparse, ambil JSON terbaru dari endpoint KBBI.
5. Validasi dan parse payload.
6. Simpan JSON mentah yang valid ke cache.
7. Format hasil sesuai formatter saat ini.

## Kriteria penerimaan

- Request kedua untuk input yang sama dalam 24 jam tidak memanggil KBBI lagi.
- Perbedaan kapitalisasi/spasi yang tidak bermakna menggunakan cache key yang sama.
- Cache tidak menyimpan token atau data pribadi pengguna.
- Perubahan schema dilakukan melalui alur `push` lalu `migrate`.
- Kegagalan cache tidak membuat command gagal bila fetch KBBI masih tersedia.
- Perubahan parser dapat diverifikasi tanpa menghapus data cache secara manual.
- Cache hit tetap menghasilkan format berdasarkan versi parser terbaru.

## Pengujian

- Fetcher tetap dapat mengembalikan hasil terstruktur untuk handler.
- Fetcher menyediakan payload JSON mentah untuk kebutuhan cache.
- Payload JSON kosong tetap dianggap tidak ditemukan.
- Cache lama dilewati setelah `CACHE_KEY_VERSION` dinaikkan.
- Parser ulang terhadap payload cache menghasilkan struktur yang sama dengan fetch baru.
