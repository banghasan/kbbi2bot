# Issue 003 — Perintah `/start`

Status: Proposed
Milestone: MVP

## Tujuan

Memberikan pengenalan singkat tentang bot KBBI dan cara penggunaannya.

## Respons

Respons menggunakan rich message berbahasa Indonesia yang menjelaskan:

- Nama bot: KBBI.
- Fungsi: mencari arti kata atau frasa.
- Contoh penggunaan `/kbbi kucing` dan `/kbbi rumah sakit`.
- Keterangan bahwa bot menggunakan KBBI Online dan bukan layanan resmi Badan Bahasa.

Inline button:

- `🤝 Support Telegram Bot Indonesia` → `https://t.me/botindonesia`

## Kriteria penerimaan

- `/start` pada private chat menghasilkan satu rich message.
- Tombol support membuka URL yang benar.
- Tidak ada tombol sumber KBBI pada respons `/start`.
- Respons tidak menggunakan `sendMessage` biasa.
