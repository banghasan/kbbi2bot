# Issue 006 — Perintah `/ping`

Status: Implemented and verified
Milestone: MVP

## Tujuan

Menyediakan pemeriksaan sederhana bahwa bot aktif sekaligus menampilkan waktu pemrosesan.

## Respons

```text
🏓 Pong!
⚡ Response time: <n> ms
```

## Kriteria penerimaan

- `/ping` menghasilkan respons rich message.
- Nilai waktu menggunakan pengukuran monotonic/performance timer.
- Satuan selalu miliseconds (`ms`).
- Tidak ada request ke KBBI.
- Tidak ada inline button.
