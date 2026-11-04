# Issue 017 — Bug Spinner akibat Ketidakcocokan Runtime

Status: Perbaikan kompatibilitas diterapkan dan diuji di cloud; batas waktu keras belum tersedia

## Gejala

Pesan `Sedang memproses pencarian...` tertinggal lebih dari dua menit. Sebagian percobaan menghasilkan error layanan dalam ratusan milidetik. Timeout aplikasi 20 detik tidak menghentikan spinner secara konsisten.

## Penyebab yang terverifikasi

Diagnosis melalui `tgcloud run` menghasilkan:

```text
AbortSignal: undefined
AbortSignal.timeout: undefined
setTimeout: undefined
```

Implementasi sebelumnya bergantung pada API tersebut. Watchdog mencoba memanggil `setTimeout` yang tidak tersedia, sedangkan perubahan fail-fast pada fetch justru menolak request karena `AbortSignal.timeout` tidak tersedia.

Fetch langsung dari runtime cloud ke endpoint KBBI untuk `semangat` berhasil dengan HTTP 200. Belum ada bukti bahwa flooding, pemblokiran IP, atau cache menjadi penyebab insiden ini.

## Perbaikan

- Gunakan AbortSignal hanya ketika API tersedia.
- Jalankan pencarian tanpa watchdog aplikasi apabila runtime tidak menyediakan timer.
- Tangkap exception sinkron dari fungsi pencarian di dalam alur penanganan error.
- Kirim hasil/error ke pengguna sebelum menunggu pengiriman laporan log.
- Injeksikan reporter dari handler melalui import statis agar search-flow tidak bergantung pada dynamic import untuk pelaporan.
- Gunakan sumber waktu yang sama untuk menghitung durasi proses.

## Verifikasi

- Alur lengkap pencarian `semangat` diuji langsung di cloud dan menghasilkan `status: ok`, sekitar 2,8 detik termasuk diagnosis fetch.
- Unit test menguji pencarian dengan `AbortSignal` dan `setTimeout` dinonaktifkan.
- Suite test lokal lulus sebelum deploy.
- Modul diagnosis sementara dihapus setelah pemeriksaan.

## Keterbatasan dan tindak lanjut

Timeout keras 20 detik belum dapat dijamin di runtime tgcloud tanpa timer. Jika operasi SDK atau platform benar-benar menggantung atau eksekusi dihentikan, kode aplikasi belum memiliki pemulihan independen untuk pesan progress.

Tindak lanjut memerlukan mekanisme deadline/cancellation resmi platform atau mekanisme pekerjaan terjadwal yang dapat memulihkan pesan tertinggal. Jangan menganggap `Promise.race` saja sebagai jaminan timeout tanpa sumber timer yang berfungsi.

Terkait: [Issue 015](015-search-timeout.md), [Issue 018](018-error-log-delivery.md).
