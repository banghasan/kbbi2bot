# Deployment

Telegram Serverless menggunakan alur terpisah untuk code dan database:

```text
npx tgcloud status
npm run deploy
npx tgcloud migrate
```

`npm run deploy` menjalankan generator konfigurasi dari `.env`, membuat `tgcloud/lib/runtime-config.js`, lalu menjalankan `tgcloud push`. File runtime tersebut di-ignore Git agar konfigurasi lokal tidak masuk repository, tetapi tetap ikut dideploy.

`migrate` digunakan untuk perubahan schema database. Deployment code tidak otomatis menjalankan migrasi.

Sebelum deploy:

- Jalankan fixture dan smoke test.
- Pastikan secret tidak masuk Git.
- Isi `KBBI_LOG_CHAT_ID` jika error reporting digunakan; kosongkan untuk menonaktifkan log. `KBBI_LOG_THREAD_ID` opsional, kosongkan untuk mengirim tanpa menentukan topic.
- Uji private command dan guest mode.
- Verifikasi batas input, timeout, rate limit, dan output panjang.
