# Issue 012 — Rate Limit dan Concurrency Control

Status: Implemented and verified
Milestone: Hardening

## Tujuan

Melindungi bot dan sumber KBBI dari request berlebihan serta fetch yang berjalan bersamaan secara tidak terkendali.

## Rekomendasi aturan

- Maksimal 10 pencarian KBBI per pengguna per 60 detik.
- Berlaku untuk `/kbbi` dan guest mode.
- `/start`, `/help`, dan `/ping` tidak memakai kuota pencarian.
- Gunakan single-flight untuk query normalized yang sama agar cache miss bersamaan tidak memicu fetch duplikat.
- Batasi fetch KBBI aktif secara bersamaan; nilai awal yang disarankan: 3.
- Respons rate limit dan concurrency memakai rich message.

## Kriteria penerimaan

- Request berlebih ditolak dengan pesan yang informatif.
- Request identik yang datang bersamaan tidak menghasilkan fetch identik berulang bila masih dapat digabung.
- Rate limit tidak menggunakan isi kata sebagai data identitas.
- Batas dapat diubah melalui konfigurasi tanpa mengubah formatter.
- Error dari KBBI tidak menyebabkan slot concurrency tertahan selamanya.
