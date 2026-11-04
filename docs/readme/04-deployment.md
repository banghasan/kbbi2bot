# Deployment

Telegram Serverless menggunakan alur terpisah untuk code dan database:

```text
npx tgcloud status
npx tgcloud diff
npx tgcloud push
npx tgcloud migrate
```

`push` digunakan untuk module, sedangkan `migrate` digunakan untuk perubahan schema.

Sebelum deploy:

- Jalankan fixture dan smoke test.
- Pastikan secret tidak masuk Git.
- Uji private command dan guest mode.
- Verifikasi batas input, timeout, rate limit, dan output panjang.
