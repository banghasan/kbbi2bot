# Issue 015 — Timeout Pencarian

Status: Runtime compatibility verified; hard deadline unavailable in tgcloud
Milestone: MVP

## Tujuan

Riwayat bug, bukti diagnosis cloud, dan keterbatasan pemulihan dijelaskan di [Issue 017](017-spinner-runtime-compatibility.md).

Mencegah pesan `Sedang memproses pencarian...` tertinggal tanpa akhir ketika fetch KBBI, cache, database, atau alur handler mengalami keterlambatan.

## Keputusan

- Target timeout pencarian 20 detik dan fetch 8 detik hanya aktif pada runtime yang menyediakan timer/AbortSignal.
- Verifikasi langsung tgcloud menunjukkan `AbortSignal` dan `setTimeout` tidak tersedia. Di runtime ini pencarian berjalan tanpa watchdog aplikasi; batas keras belum dapat dijamin.
- Fetch tetap dijalankan ketika AbortSignal tidak tersedia. Ketiadaan API tersebut tidak dianggap sebagai kegagalan KBBI.
- Respons pengguna dikirim sebelum laporan log agar kegagalan pelaporan tidak menahan hasil.
- Jika timeout pencarian tercapai, pesan progress diedit menjadi pesan error yang informatif.
- Timeout pencarian juga dikirim ke grup log.
- Hasil yang datang terlambat diabaikan agar tidak mengedit pesan dua kali.
- Waktu respons tetap ditampilkan pada pesan timeout.

## Pesan timeout

```text
⌛ Pencarian membutuhkan waktu terlalu lama.

Silakan coba lagi beberapa saat.
```

## Kriteria penerimaan

- Pada runtime dengan timer, watchdog diuji dengan operasi pencarian yang tidak selesai.
- Pada tgcloud tanpa timer, alur lengkap diverifikasi melalui `tgcloud run` dengan hasil `status: ok`.
- Pesan timeout memakai rich message yang sama dengan hasil normal.
- Operasi yang selesai setelah timeout tidak mengirim hasil tambahan.
- Timeout dapat diuji tanpa menunggu 20 detik melalui parameter test.
