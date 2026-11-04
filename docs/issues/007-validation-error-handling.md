# Issue 007 — Validasi dan Error Handling

Status: Proposed
Milestone: MVP

## Tujuan

Menangani input invalid, kata tidak ditemukan, gangguan KBBI, serta kegagalan Telegram secara aman dan konsisten.

## Kondisi

- Input kosong.
- Lebih dari 100 karakter.
- Lebih dari 3 kata.
- Kata/frasa tidak ditemukan.
- KBBI timeout atau mengembalikan status non-sukses.
- Respons KBBI tidak valid.
- Telegram API mengembalikan error.
- Rate limit tercapai.
- Concurrency limit tercapai.

## Pesan pengguna

Input invalid:

```text
⚠️ Masukkan maksimal 3 kata dan 100 karakter.
Contoh: /kbbi rumah sakit
```

Tidak ditemukan:

```text
🔎 Kata atau frasa tidak ditemukan.
```

Gangguan sumber:

```text
⚠️ Layanan KBBI sedang tidak dapat diakses. Silakan coba lagi beberapa saat.
```

## Kriteria penerimaan

- Semua pesan error memakai rich message.
- Detail internal, URL debug, token, dan stack trace tidak dikirim ke pengguna.
- Error transient tidak disimpan sebagai cache sukses.
- Input yang mengandung markup tidak dapat menyisipkan Markdown Telegram.
- Request yang melebihi rate limit mendapat respons rich message yang jelas.
- Request yang menunggu concurrency slot tidak membuat fetch KBBI ganda.
