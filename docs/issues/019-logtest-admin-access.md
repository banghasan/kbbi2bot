# Issue 019 — Pembatasan Log Test untuk Admin Bot

Status: Diimplementasikan, diuji lokal, dan dideploy

## Tujuan

Membatasi `/logtest` agar pengguna umum tidak dapat mengirim laporan uji ke grup log.

## Konfigurasi

```env
KBBI_ADMIN_IDS=123456789,987654321
```

Nilai adalah Telegram user ID positif, dipisahkan koma. Jangan menggunakan username atau chat ID grup. Daftar kosong menolak semua pengguna. Pada saat implementasi, `.env` ditambahkan dengan daftar kosong karena user ID admin belum diberikan.

## Alur

1. `npm run deploy` membaca `.env` dan memvalidasi format ID.
2. Generator menulis `ADMIN_IDS` ke `tgcloud/lib/runtime-config.js` yang di-ignore Git.
3. Handler memeriksa `message.from.id` terhadap daftar admin.
4. Non-admin menerima pesan penolakan tanpa memanggil reporter.
5. Admin hanya dapat menjalankan `/logtest` melalui private chat.

Perubahan `.env` memerlukan deploy ulang. Admin bot dalam konfigurasi ini berbeda dari admin grup Telegram. Pelaporan error otomatis tidak memerlukan pengguna pemicu menjadi admin.

## Verifikasi

- User ID terdaftar mendapat akses pada pemeriksaan identitas.
- User ID yang tidak terdaftar ditolak meskipun chat ID cocok dengan admin.
- Sender tanpa ID dan daftar kosong ditolak.
- Generator menolak ID yang bukan bilangan bulat positif.
- Suite test lokal lulus dan pembatasan telah dideploy.

Terkait: [Issue 016](016-error-reporting.md), [Issue 018](018-error-log-delivery.md).
