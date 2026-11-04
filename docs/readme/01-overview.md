# Ringkasan Proyek

KBBI adalah bot Telegram dengan username `@KBBI2bot` dan tagline `Kamus Besar Bahasa Indonesia`.

Fitur utama:

- `/start` — informasi bot dan disclaimer sumber.
- `/help` — bantuan penggunaan private chat dan guest mode.
- `/kbbi <kata/frasa>` — pencarian KBBI.
- `/ping` — waktu pemrosesan bot.
- `/stats` — metrik agregat di private chat.
- Guest mode: `@KBBI2bot rumah sakit`.

Bot menggunakan Telegram Serverless dan data JSON dari endpoint KBBI Online. Data definisi tidak dibundel sebagai database lokal.

Lisensi kode: `AGPL-3.0-or-later`.
