# Issue 004 — Fetch dan Parser Data KBBI

Status: Implemented and verified
Milestone: MVP

## Tujuan

Mengambil dan mengubah respons endpoint KBBI menjadi data terstruktur yang dapat diformat oleh bot.

## Cakupan

- Normalisasi input kata/frasa.
- Validasi maksimal 100 karakter dan maksimal 3 kata.
- URL encoding untuk path sumber dan endpoint.
- Pembuatan suffix acak 5 karakter base36.
- Request HTTP dengan timeout.
- Validasi content type dan status HTTP.
- Parsing JSON endpoint `ajax_<random_text>` sebagai sumber data utama.
- Item `x: 1` diprioritaskan sebagai hasil utama; item `x: 5` dan `x: 9` menjadi hasil terkait.
- Decode dan sanitasi markup HTML yang berada di field definisi JSON menjadi data teks/markup yang aman.
- Tidak menggunakan halaman HTML utama sebagai sumber data utama.
- Pemilihan maksimal 5 definisi utama, 10 sublema, dan 5 kata turunan berdefinisi dari segmen tambahan field `d`.
- Kata turunan tidak disamakan dengan hasil terkait `x:5`/`x:9`; definisinya tetap dipertahankan.

## Aturan URL

- Halaman sumber: `https://kbbi.web.id/<input-encoded>`.
- Endpoint data: `https://kbbi.web.id/<input-encoded>/ajax_<suffix>`.
- Normalisasi khusus ` atau ` menjadi `-atau-` mengikuti perilaku halaman KBBI.

## Kriteria penerimaan

- `kucing` dan `rumah sakit` menghasilkan data yang dapat diformat.
- Input dengan spasi tetap diperlakukan sebagai frasa.
- Perbedaan huruf besar dan kecil tidak mengubah hasil normalisasi.
- JSON kosong diperlakukan sebagai tidak ditemukan.
- HTML yang tidak dikenal tidak menyebabkan bot mengirim markup mentah.
- Hasil yang terlalu panjang dapat dipangkas oleh formatter.
