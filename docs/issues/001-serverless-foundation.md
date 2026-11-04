# Issue 001 — Fondasi Telegram Serverless

Status: Proposed
Milestone: MVP

## Tujuan

Menyiapkan struktur proyek Telegram Serverless untuk bot KBBI tanpa mengimplementasikan fitur pencarian terlebih dahulu.

## Cakupan

- Inisialisasi project Telegram Serverless.
- Struktur `tgcloud/` untuk handler, library, dan schema.
- Konfigurasi lokal yang tidak menyimpan secret di Git.
- Handler awal untuk `message` dan `guest_message`.
- Dokumentasi perintah deploy, run, status, push, dan migrate.

## Kriteria penerimaan

- Project dapat dijalankan sesuai dokumentasi Telegram Serverless.
- Secret lokal berada di file yang di-ignore.
- Handler dapat menerima fixture update tanpa error.
- Belum ada logika scraping KBBI di issue ini.
