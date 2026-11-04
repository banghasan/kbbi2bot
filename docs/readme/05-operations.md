# Operasional dan Metrik

Rate limit awal:

- 10 pencarian per pengguna per 60 detik.
- Maksimal 3 fetch KBBI aktif.
- Query identik yang berjalan bersamaan digabung melalui single-flight.

`/stats` hanya tersedia di private chat dan dapat digunakan semua pengguna. Output hanya berisi data agregat:

- jumlah request
- cache hit/miss
- fetch sukses/gagal/timeout
- parse error
- rate-limit
- guest query
- latency rata-rata dan p95

Tidak ditampilkan: query, user ID, username, chat ID, token, atau data pribadi.

## Error reporting

Error sumber KBBI dan error tak terduga dikirim ke grup/topic log yang dikonfigurasi melalui `.env`. Laporan berisi jenis error, query pencarian, durasi, serta nama dan pesan error yang sudah dibatasi panjangnya.

Error `tidak ditemukan`, rate limit, dan hasil normal tidak dikirim ke grup log. Kegagalan mengirim laporan hanya dicatat melalui `console.error` dan tidak mengganggu respons bot.
