# Panduan Pengembangan

Struktur utama Telegram Serverless berada di `tgcloud/`:

- `handlers/` — handler update Telegram.
- `lib/` — formatter, parser, fetcher, dan utilitas bersama.
- `schema.js` — schema SQLite.

Sebelum coding, baca:

- [Konsep produk](../concept.md)
- [Issue 001](../issues/001-serverless-foundation.md)
- [Issue 002](../issues/002-rich-message-format.md)

Prinsip penting:

- Endpoint KBBI diproses sebagai JSON.
- Markup HTML di dalam field JSON dikonversi menggunakan allowlist.
- Semua output bot menggunakan rich message.
- Jangan menyimpan token, query mentah, atau data pribadi di repository/log.
