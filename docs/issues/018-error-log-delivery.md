# Issue 018 — Bug Pengiriman Log Error Otomatis

Status: Jalur pelaporan diperbaiki; pengiriman manual terverifikasi, pengiriman otomatis perlu verifikasi setelah error nyata

## Gejala

Pengguna menerima pesan error layanan tetapi laporan tidak masuk grup log. `/logtest` berhasil mengirim laporan ke topic yang dikonfigurasi.

## Temuan

- Link `/c/4308477891/727/728` memuat topic ID `727` dan message ID `728`. Konfigurasi awal keliru memakai `728` sebagai thread ID dan telah dikoreksi ke `727`.
- Pelaporan awal menggunakan `void reportError(...)`, sehingga penyelesaiannya tidak ditunggu oleh handler.
- Reporter awal hanya dipanggil pada error di dispatch; error dari search-flow belum tercakup.
- Reporter yang ditunggu sebelum respons pengguna dapat menunda pembaruan pesan progress.
- Keberhasilan `/logtest` membuktikan konfigurasi dan akses pengiriman manual berfungsi, tetapi tidak membuktikan seluruh jalur error otomatis terpanggil.

## Perbaikan

- Tunggu promise laporan agar pengiriman tidak ditinggalkan saat handler selesai.
- Kirim respons pengguna terlebih dahulu, kemudian laporan.
- Pasang reporter pada jalur error tak terduga dan timeout di search-flow.
- Injeksikan reporter dari handler normal dan guest melalui import statis.
- Kegagalan Bot API pada reporter ditangkap dan dicatat ke console tanpa mengulang laporan secara rekursif.
- Tambahkan `/logtest` sebagai alat diagnosis; akses dibatasi pada admin bot.

## Verifikasi dan batasan

- Pengguna mengonfirmasi laporan manual `/logtest` masuk ke grup.
- Unit test menguji pemanggilan reporter pada error search-flow.
- Diagnosis cloud membuktikan pencarian normal dapat kembali berhasil.
- Pengiriman otomatis end-to-end setelah perbaikan terakhir belum dikonfirmasi lewat error nyata.
- Deduplikasi/rate limit laporan belum diimplementasikan; hindari menyebut fitur tersebut sudah tersedia.

Terkait: [Issue 016](016-error-reporting.md), [Issue 017](017-spinner-runtime-compatibility.md), [Issue 019](019-logtest-admin-access.md).
