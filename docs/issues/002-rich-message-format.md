# Issue 002 — Kontrak Rich Message

Status: Implemented and verified
Milestone: MVP

## Tujuan

Membuat satu kontrak formatter agar seluruh respons bot konsisten dan dikirim sebagai rich message.

## Cakupan

- Formatter Markdown rich message.
- Escape karakter Markdown dari input dan data KBBI.
- Konversi markup HTML ter-escape dari JSON KBBI ke rich Markdown.
- Heading, bold, italic, block quote, dan expandable block quote.
- Custom emoji Telegram untuk heading, informasi, contoh perintah, statistik, dan sumber kode.
- Inline mono untuk istilah atau markup kode bila tersedia.
- Rich message button (`<tg-button>`) sebagai tombol sumber atau support; inline keyboard tidak digunakan.
- Statistik dirender sebagai tabel Markdown agar mudah dipindai.
- Pemeriksaan batas karakter Telegram.
- Batas internal 30.000 karakter.
- Strategi pemangkasan dengan prioritas definisi utama.

## Kriteria penerimaan

- Definisi utama langsung terlihat.
- Sublema dan kata turunan berisi definisi nyata dari sumber, bukan keterangan generik; bagian ini dapat disembunyikan dalam expandable block.
- Tombol sumber memakai label `🔗 Buka <kata/frasa>`.
- Tidak ada markup sumber yang dapat merusak Markdown Telegram.
- `<b>`, `<em>`, `<i>`, `<code>`, `<sup>`, `<sub>`, dan `<br>` dipetakan secara konsisten.
- Tag HTML yang tidak didukung tidak diteruskan mentah ke Telegram.
- Formatter menghasilkan output yang valid untuk normal message dan guest result.
- Output yang mendekati batas panjang dipangkas sebelum mencapai batas Telegram.
