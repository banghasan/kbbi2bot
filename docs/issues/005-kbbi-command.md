# Issue 005 — Perintah `/kbbi`

Status: Proposed
Milestone: MVP

## Tujuan

Menyediakan pencarian KBBI melalui command Telegram.

## Alur

1. Ambil teks setelah `/kbbi`.
2. Normalisasi dan validasi input.
3. Cek cache.
4. Jika cache miss, fetch dan parse KBBI.
5. Format hasil menjadi rich message.
6. Kirim dengan inline button sumber.

## Kriteria penerimaan

- `/kbbi kucing` menampilkan hasil KBBI.
- `/kbbi rumah sakit` menampilkan hasil frasa.
- Tombol diberi label `🔗 Buka kucing` atau `🔗 Buka rumah sakit` sesuai request.
- Tombol membuka URL halaman sumber yang telah di-URL-encode.
- Hanya definisi utama yang langsung terlihat.
- Contoh, peribahasa, dan sublema berada di expandable block quote.
- Command tanpa input memakai pesan validasi rich message.
