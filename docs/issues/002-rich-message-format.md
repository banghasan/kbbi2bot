# Issue 002 — Kontrak Rich Message

Status: Proposed
Milestone: MVP

## Tujuan

Membuat satu kontrak formatter agar seluruh respons bot konsisten dan dikirim sebagai rich message.

## Cakupan

- Formatter Markdown rich message.
- Escape karakter Markdown dari input dan data KBBI.
- Konversi markup HTML ter-escape dari JSON KBBI ke rich Markdown.
- Heading, bold, italic, block quote, dan expandable block quote.
- Inline mono untuk istilah atau markup kode bila tersedia.
- Inline keyboard sebagai tombol sumber atau support.
- Pemeriksaan batas karakter Telegram.
- Batas internal 30.000 karakter.
- Strategi pemangkasan dengan prioritas definisi utama.

## Kriteria penerimaan

- Definisi utama langsung terlihat.
- Contoh, peribahasa, dan sublema dapat disembunyikan dalam expandable block quote.
- Tombol sumber memakai label `🔗 Buka <kata/frasa>`.
- Tidak ada markup sumber yang dapat merusak Markdown Telegram.
- `<b>`, `<em>`, `<i>`, `<code>`, dan `<br>` dipetakan secara konsisten.
- Tag HTML yang tidak didukung tidak diteruskan mentah ke Telegram.
- Formatter menghasilkan output yang valid untuk normal message dan guest result.
- Output yang mendekati batas panjang dipangkas sebelum mencapai batas Telegram.
