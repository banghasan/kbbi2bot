# Changelog

## [1.0.3] - 2026-11-04

### Added

- Error reporting ke chat atau topic Telegram yang dikonfigurasi melalui `.env`.
- Perintah private `/logtest` untuk admin bot.
- Generator `runtime-config.js` melalui `npm run deploy`.
- Dokumentasi diagnosis spinner, pengiriman log, dan akses admin.

### Changed

- Menyesuaikan alur pencarian dengan runtime tgcloud yang tidak menyediakan `AbortSignal` dan `setTimeout`.
- Mengirim respons pengguna sebelum menunggu laporan error.
- Membuat chat dan thread log opsional: chat kosong menonaktifkan log, thread kosong mengirim tanpa topic.
- Membatasi `/logtest` berdasarkan daftar Telegram user ID admin.

### Fixed

- Memulihkan pencarian yang tertahan pada pesan `Sedang memproses pencarian...` akibat ketidakcocokan API timeout runtime.
- Memperluas pelaporan ke error sumber KBBI dan error alur pencarian.
- Mengoreksi topic ID log Telegram dan memastikan promise pengiriman laporan ditunggu.

## [1.0.2] - 2026-11-04

### Changed

- Menandai lema utama, sublema, dan kata turunan dengan Rich Markdown marked text.
- Menghapus quote pada header lema agar detail definisi lebih mudah dibaca.
- Menambahkan custom emoji 🔵 pada setiap contoh definisi.
- Menambahkan keterangan singkatan bentuk kata dan label umum pada `/help`.
- Memperkuat parsing definisi bernomor dan variasi markup dari respons KBBI.
- Memperbarui cache key ke `v6` selama verifikasi format parser terbaru.

## [1.0.1] - 2026-11-04

- Menyimpan payload JSON mentah KBBI di cache.
- Memperbarui tampilan hasil terkait dan format definisi utama.

