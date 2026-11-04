# Issue 013 — Metrik dan Perintah `/stats`

Status: Proposed
Milestone: Operations

## Tujuan

Menyediakan metrik operasional untuk memantau kesehatan bot tanpa menyimpan data pribadi pengguna.

## Metrik minimum

- Total request per command.
- Cache hit dan cache miss.
- Fetch KBBI sukses, kosong, timeout, dan error.
- Parse error.
- Rate-limit rejection.
- Concurrency rejection/wait.
- Latensi respons: minimum, rata-rata, dan p95.
- Jumlah respons guest mode.

## Akses `/stats`

Command dapat digunakan siapa saja di private chat bot. `/stats` tidak diproses di group atau guest mode. Karena output dapat dilihat pengguna, hanya metrik agregat yang aman ditampilkan; jangan menyertakan isi pencarian, user ID, username, chat ID, token, atau detail internal.

## Privasi

- Jangan menyimpan isi query.
- Jangan menampilkan user ID, username, atau chat ID pada output statistik.
- Gunakan counter agregat dan periode waktu yang jelas.
- Semua output `/stats` menggunakan rich message.

## Kriteria penerimaan

- Admin dapat menjalankan `/stats` dan menerima ringkasan yang rapi.
- Pengguna private chat mana pun dapat menjalankan `/stats`.
- `/stats` pada group dan guest mode diabaikan atau ditolak dengan rich message yang aman.
- Metrik tetap bertambah untuk jalur normal dan guest mode.
- Statistik tidak mengganggu cache atau alur pencarian.
