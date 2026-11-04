# Issue 016 — Error Reporting ke Grup Log

Status: Implemented
Milestone: MVP

Riwayat perbaikan pengiriman log: [Issue 018](018-error-log-delivery.md). Konfigurasi dan pembatasan admin `/logtest`: [Issue 019](019-logtest-admin-access.md).

## Tujuan

Mengirim laporan otomatis ke grup/topic log ketika terjadi error sumber KBBI atau error tak terduga, tanpa mengganggu respons pengguna.

## Konfigurasi

Konfigurasi lokal disimpan di `.env` dan tidak masuk Git:

```env
KBBI_LOG_CHAT_ID=-1004308477891
KBBI_LOG_THREAD_ID=727
```

`npm run deploy` membaca `.env`, membuat `tgcloud/lib/runtime-config.js`, lalu menjalankan `tgcloud push`. File runtime tersebut di-ignore Git tetapi ikut dideploy.

- Chat ID kosong: logging nonaktif, deploy tetap berjalan; thread ID diabaikan.
- Chat ID terisi dan thread ID kosong: kirim ke chat tanpa parameter `message_thread_id`.
- Keduanya terisi: kirim ke topic yang dikonfigurasi. Thread ID harus bilangan bulat positif.
- Perubahan `.env` baru berlaku setelah `npm run deploy`; konfigurasi cloud sebelumnya tetap aktif sampai deploy berhasil.

## Data laporan

Laporan hanya berisi:

- Jenis error.
- Query pencarian.
- Durasi proses.
- Nama dan pesan error yang sudah dipotong.

User ID, chat ID pengguna, token, dan isi pesan lain tidak dikirim.

## Perilaku

- Laporan hanya dikirim untuk error sumber KBBI atau error tak terduga.
- Error `tidak ditemukan`, rate limit, dan hasil normal tidak dilaporkan.
- Kegagalan mengirim laporan hanya dicatat ke `console.error` dan tidak menggagalkan respons bot.
- `/logtest` hanya tersedia di private chat untuk admin bot yang user ID-nya tercantum dalam `KBBI_ADMIN_IDS` di `.env` (dipisahkan koma). Daftar kosong menolak semua pengguna. Identitas diperiksa dari `message.from.id`, bukan admin grup atau chat ID.
- Pesan dikirim ke topic menggunakan `message_thread_id`.
