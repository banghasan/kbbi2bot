# Konsep Bot KBBI

Status: Disetujui untuk diturunkan menjadi issue

## Ringkasan

KBBI adalah bot Telegram berbahasa Indonesia untuk mencari arti kata dan frasa melalui data dari `kbbi.web.id`. Bot berjalan di Telegram Serverless, menggunakan JavaScript module, handler update Telegram, SQLite bawaan, dan outbound HTTP.

Identitas:

- Nama: `KBBI`
- Username: `@KBBI2bot`
- Tagline: `Kamus Besar Bahasa Indonesia`
- Bahasa antarmuka: Bahasa Indonesia
- Lisensi kode: `AGPL-3.0-or-later`

## Tujuan

- Menyediakan pencarian kata atau frasa KBBI langsung dari Telegram.
- Menampilkan hasil dalam rich message yang rapi dan mudah dibaca.
- Menyediakan rujukan langsung ke halaman sumber KBBI.
- Mendukung private chat, group chat, dan guest mode.
- Mengurangi beban request ke sumber melalui cache 24 jam.

## Batasan produk

- Bot hanya merespons `/start`, `/kbbi`, `/ping`, `/help`, `/stats`, dan guest invocation yang eksplisit.
- Pesan teks biasa tanpa command diabaikan.
- Input pencarian maksimal 100 karakter dan maksimal 3 kata.
- Hasil pencarian dibatasi maksimal 5 definisi utama dan 10 sublema.
- Jika hasil tetap melewati batas Telegram, isi akan dipangkas secara aman.
- Sumber data adalah KBBI Online di `kbbi.web.id`, bukan klaim sebagai layanan resmi Badan Bahasa.

## Perintah

### `/start`

Menampilkan informasi singkat tentang bot, cara menggunakan `/kbbi`, dan tombol:

- `🤝 Support Telegram Bot Indonesia` → `https://t.me/botindonesia`

### `/kbbi <kata atau frasa>`

Contoh:

```text
/kbbi kucing
/kbbi rumah sakit
```

Hasil berisi kata/frasa yang dicari, bentuk/pelafalan jika tersedia, kelas kata, definisi utama, bagian tambahan yang dapat dibuka, footer sumber, dan tombol dinamis:

```text
🔗 Buka kucing
🔗 Buka rumah sakit
```

Tombol mengarah ke URL yang sudah di-URL-encode: `https://kbbi.web.id/<kata-atau-frasa>`.

### `/ping`

Menampilkan:

```text
🏓 Pong!
⚡ Response time: <n> ms
```

Waktu yang ditampilkan adalah waktu pemrosesan bot sejak update diterima sampai request respons disiapkan/dikirim. Ini bukan round-trip time perangkat pengguna.

### `/help`

Menampilkan bantuan dan contoh penggunaan di private chat serta guest mode:

```text
Private chat:
/kbbi rumah sakit

Guest mode di group:
@KBBI2bot rumah sakit
```

Setelah repository publik tersedia, bantuan juga menyertakan tautan source code proyek untuk memenuhi ketentuan AGPL.

### `/stats`

Menampilkan metrik operasional seperti jumlah request, cache hit/miss, fetch KBBI, error, rate-limit, serta waktu respons. Command ini dapat digunakan siapa saja di private chat bot. Metrik tidak boleh memuat isi pencarian atau data pribadi pengguna.

### Guest mode

Guest invocation menggunakan mention langsung tanpa `/kbbi`:

```text
@KBBI2bot rumah sakit
```

Guest mode hanya menerima query eksplisit kepada bot. Pencocokan username mention tidak membedakan huruf besar dan kecil. Input tetap dibatasi maksimal 100 karakter dan maksimal 3 kata.

Pada jalur normal, bot menggunakan `sendRichMessage`. Pada guest mode, Telegram mengharuskan penggunaan `answerGuestQuery` dengan `InputRichMessageContent`; isi dan format tetap rich message.

## Sumber dan pengambilan data

URL sumber utama:

```text
https://kbbi.web.id/<kata-atau-frasa>
```

Endpoint data:

```text
https://kbbi.web.id/<kata-atau-frasa>/ajax_<random_text>
```

`random_text` dibuat sebagai 5 karakter acak base36, mengikuti perilaku halaman KBBI. Input dinormalisasi dengan trim, dipertahankan dalam bentuk frasa, dan di-URL-encode. Normalisasi khusus ` atau ` menjadi `-atau-` mengikuti halaman KBBI.

Respons endpoint berupa JSON berisi item hasil dengan identitas kata dan field definisi yang dapat berisi markup HTML ter-escape. Parser harus memproses JSON terlebih dahulu, kemudian mengubah markup yang diizinkan pada field definisi menjadi Markdown rich message yang aman; halaman HTML utama tidak digunakan sebagai sumber data utama.

Pemetaan markup minimum:

- `<b>` atau `<strong>` → bold.
- `<em>` atau `<i>` → italic.
- `<code>` → inline mono.
- `<br>` → baris baru.
- Struktur contoh, peribahasa, dan keterangan tambahan → quote atau expandable quote.
- Tag lain yang tidak diperlukan → dihapus atau dikonversi menjadi teks biasa.

## Format tampilan

Prinsip tampilan:

- Definisi utama selalu langsung terlihat.
- Kata/frasa ditampilkan sebagai heading dengan emoji `📚`.
- Kelas kata menggunakan italic.
- Nomor definisi menggunakan bold.
- Contoh, peribahasa, dan sublema dikelompokkan dalam expandable block quote agar tidak memenuhi layar.
- Footer sumber dibuat ringkas.
- Tombol sumber diletakkan sebagai inline keyboard.

Contoh struktur visual:

```text
📚 Kucing

ku·cing  _n_

1. **binatang yang rupanya seperti harimau kecil, biasa dipiara orang**

> _Contoh dan keterangan tambahan_
> ▸ Buka untuk melihat contoh, peribahasa, dan sublema

Sumber: KBBI Online
[🔗 Buka kucing]
```

Detail parser boleh menyesuaikan markup sumber selama struktur dan keterbacaan tetap terjaga.

## Batas hasil

- Maksimal 5 definisi utama untuk hasil utama.
- Maksimal 10 sublema/kata turunan dalam bagian expandable.
- Maksimal 100 karakter untuk input.
- Maksimal 3 kata untuk input.
- Terapkan batas karakter rich message Telegram sebelum pengiriman.
- Terapkan batas internal 30.000 karakter agar memiliki ruang aman dari batas Telegram.
- Jika perlu memangkas, prioritaskan urutan: judul → bentuk/kategori → definisi utama → footer sumber. Bagian tambahan dipangkas lebih dahulu.

## Cache dan database

- Cache hanya respons KBBI yang berhasil diparse.
- Kunci cache berdasarkan input yang sudah dinormalisasi.
- TTL cache: 24 jam.
- Cache menyimpan data terstruktur atau hasil ter-normalisasi, bukan kredensial.
- Error jaringan dan hasil kosong tidak disimpan sebagai hasil sukses.

## Error dan fallback

Kata tidak ditemukan:

```text
🔎 Kata atau frasa tidak ditemukan.
```

Input tidak valid:

```text
⚠️ Masukkan maksimal 3 kata dan 100 karakter.
Contoh: /kbbi rumah sakit
```

KBBI tidak dapat diakses:

```text
⚠️ Layanan KBBI sedang tidak dapat diakses. Silakan coba lagi beberapa saat.
```

Semua pesan keluaran bot tetap menggunakan kontrak rich message.

## Keamanan dan ketahanan

- Token Telegram dan kredensial Serverless tidak masuk repository.
- Input pengguna harus di-escape agar markup Markdown tidak rusak atau berubah menjadi link/entity yang tidak diinginkan.
- URL sumber dibangun dari input yang telah divalidasi dan di-URL-encode.
- Request ke KBBI memiliki timeout dan penanganan status HTTP non-sukses.
- Rate limit dan concurrency control diterapkan sebelum fetch KBBI.
- Parser tidak boleh mengizinkan HTML sumber menyisipkan markup Telegram secara mentah.
- Guest query harus dijawab menggunakan `guest_query_id` yang sesuai.
- Metrik operasional tidak menyimpan isi query atau data pribadi.
- `/stats` hanya diproses di private chat, bukan group atau guest mode.

## Arsitektur logis

```text
Telegram Update
      |
      v
Handler message / guest_message
      |
      +--> parse command dan validasi input
      |
      +--> baca cache SQLite
      |       |
      |       +--> hit: format rich message
      |       |
      |       +--> miss: fetch ajax KBBI -> parse -> simpan cache
      |
      +--> rate limit dan concurrency control
      |
      +--> sendRichMessage
      |
      +--> atau answerGuestQuery untuk guest mode
```

## Referensi resmi

- Telegram Serverless: https://core.telegram.org/bots/serverless
- Telegram Bot API: https://core.telegram.org/bots/api
- Rich message formatting: https://core.telegram.org/bots/api#rich-message-formatting-options
- KBBI Online: https://kbbi.web.id/

## Daftar issue

1. `001-serverless-foundation.md`
2. `002-rich-message-format.md`
3. `003-start-command.md`
4. `004-kbbi-fetch-parser.md`
5. `005-kbbi-command.md`
6. `006-ping-command.md`
7. `007-validation-error-handling.md`
8. `008-cache-database.md`
9. `009-guest-mode.md`
10. `010-testing-deployment.md`
11. `011-help-command.md`
12. `012-rate-limit-concurrency.md`
13. `013-metrics-stats.md`
