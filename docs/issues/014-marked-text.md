# Issue 014 — Marked Text untuk Lema dan Variasi

Status: Implemented and verified
Milestone: MVP

## Tujuan

Membuat lema utama, sublema, dan kata turunan lebih mudah dipindai tanpa memenuhi pesan dengan quote atau bold.

## Keputusan

- Lema utama memakai Rich Markdown `==teks==`.
- Sublema dan kata turunan pada bagian **Variasi** juga memakai `==teks==`.
- Bentuk kata seperti `_n_`, `_v_`, dan `_adv_` tetap berada di luar marked text.
- Detail definisi tetap memakai format normal.
- Quote tidak digunakan pada header yang sudah memakai marked text.

## Contoh

```text
==bi·sa¹== _v_

• mampu melakukan sesuatu ...

<details><summary>📌 Variasi</summary>
==-- jadi==
• mungkin; boleh jadi;

==ke·bi·sa·an== _n_
• kepandaian; kecakapan; kebolehan;
</details>
```

## Kriteria penerimaan

- Lema utama tampil dengan `==...==`.
- Setiap sublema dan kata turunan tampil dengan `==...==`.
- Bentuk kata tidak ikut terkena marked text.
- Variasi tetap berada dalam blok expandable.
- Parser dan formatter tidak mengubah isi definisi.

