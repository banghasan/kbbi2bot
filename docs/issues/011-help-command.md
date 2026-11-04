# Issue 011 — Perintah `/help`

Status: Implemented and verified
Milestone: MVP

## Tujuan

Menyediakan bantuan singkat dengan contoh penggunaan normal dan guest mode.

## Isi bantuan

```text
Private chat:
/kbbi rumah sakit

Guest mode di group:
@KBBI2bot rumah sakit
```

Jelaskan juga batas maksimal 3 kata dan 100 karakter.

## Kriteria penerimaan

- `/help` menghasilkan rich message berbahasa Indonesia.
- Contoh private chat dan guest mode tampil jelas.
- Mention guest dijelaskan tidak memerlukan `/kbbi`.
- Menyediakan tautan source code repository setelah URL publik ditetapkan.
- Tidak menampilkan detail internal, cache, atau metrik operasional.
