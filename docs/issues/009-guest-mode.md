# Issue 009 — Guest Mode

Status: Implemented and verified
Milestone: Guest Mode

## Tujuan

Memungkinkan pengguna mencari KBBI di chat yang tidak menjadi anggota bot melalui mention langsung.

## Input

```text
@KBBI2bot rumah sakit
```

Aturan:

- Tidak memerlukan `/kbbi`.
- Username mention tidak membedakan huruf besar dan kecil.
- Maksimal 100 karakter.
- Maksimal 3 kata.
- Hanya mention eksplisit kepada bot yang diproses.
- Pesan biasa tanpa mention tetap diabaikan.

## Respons Telegram

- Terima `guest_message`.
- Ambil `guest_query_id`.
- Bangun hasil menggunakan formatter rich message yang sama dengan command normal.
- Jawab melalui `answerGuestQuery` dengan `InputRichMessageContent`.
- Kirim hasil sementara melalui `answerGuestQuery`, lalu edit hasil guest menggunakan `inline_message_id` dari respons menjadi hasil akhir.
- Sertakan tombol `🔗 Buka <kata/frasa>`.

## Kriteria penerimaan

- Query guest untuk `@KBBI2bot rumah sakit` diproses tanpa `/kbbi`.
- Query lebih dari 3 kata ditolak dengan rich error message.
- Hasil guest memiliki tampilan dan batas hasil yang sama dengan `/kbbi`.
- Guest query dijawab menggunakan identifier query yang benar.
- Tidak ada respons ganda dari handler `message` dan `guest_message`.
- Status awal dan waktu respons akhir ditampilkan dengan alur edit pesan.
