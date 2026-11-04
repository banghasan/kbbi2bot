# Issue 010 — Testing dan Deployment

Status: Proposed
Milestone: MVP

## Tujuan

Memastikan bot dapat diuji secara lokal melalui fixture dan dideploy secara aman ke Telegram Serverless.

## Skenario minimum

- `/start`.
- `/kbbi kucing`.
- `/kbbi rumah sakit`.
- `/kbbi` tanpa input.
- Input lebih dari 3 kata.
- Input lebih dari 100 karakter.
- Kata tidak ditemukan.
- KBBI timeout/status error.
- `/ping`.
- `/help` dari private chat.
- `/help` dengan contoh guest mode.
- `/stats` dari private chat oleh pengguna biasa.
- `/stats` dari group/guest mode ditolak atau diabaikan sesuai kontrak akses.
- Guest query `@KBBI2bot rumah sakit`.
- Karakter Markdown khusus pada input dan hasil sumber.
- Hasil yang mendekati batas panjang Telegram.
- Cache hit dan cache expired.

## Deployment

- Gunakan `npx tgcloud status` dan `npx tgcloud diff` sebelum deploy.
- Deploy module melalui `npx tgcloud push`.
- Terapkan perubahan database melalui `npx tgcloud migrate` jika diperlukan.
- Jalankan smoke test setelah deploy.
- Pastikan secret tidak masuk commit.

## Kriteria penerimaan

- Seluruh skenario minimum memiliki fixture atau langkah uji terdokumentasi.
- Deploy dapat diulang tanpa menghapus database.
- Perubahan code dan migration dapat ditinjau terpisah.
- README atau dokumentasi proyek menjelaskan setup developer baru.
