# studywithbro — 2 Paket Latihan Katrol Baru

Paket B: 20 soal (6 mudah, 8 sedang, 6 sulit).
Paket C: 20 soal (2 mudah, 6 sedang, 12 sulit).

Masing-masing paket: 5 opsi A-E per nomor, **satu** jawaban benar, 5 poin per jawaban benar (total 100), dengan soal cerita, analisis, dan beberapa diagram asli.

## Isi sumber

- `pdf/*_Soal.pdf` — untuk peserta, tanpa kunci.
- `pdf/*_Kunci_Pembahasan.pdf` — untuk pengajar saja, **jangan publikasikan sebelum kuis**.
- `data/latihan_b_katrol.json`, `data/latihan_c_katrol.json` — bank soal digital dengan jawaban dan pembahasan untuk website.
- `assets/katrol_1_ruas.svg` sampai `katrol_10_ruas.svg` — diagram vektor dinamis (soal memakai subset).
- `PROMPT_CODEX.md` — prompt yang dapat ditempel ke Codex.
- `build.py` — generator untuk memperbarui PDF/data/aset (membutuhkan reportlab dan svglib), disertakan agar konten dapat direvisi.

## Integrasi website

Paket B dan C sudah aktif pada `/ipa/fisika/katrol/latihan/b` dan `/c`. `PROMPT_CODEX.md` menyimpan instruksi integrasi asli. JSON di `data/` menjadi sumber utama; isi soal, opsi, angka, gambar, kunci dan pembahasan dipertahankan. PDF soal peserta dapat diunduh; PDF kunci/pembahasan tetap hanya sebagai referensi pengembangan.

Dari root repository:

```bash
node scripts/import-katrol-bc.mjs
npx prettier --write src/data/katrolB*.ts src/data/katrolC*.ts
python3 scripts/verify-katrol-bc.py  # opsional; perlu pdftotext/Poppler
npm test
npm run test:e2e
```

Importer memisahkan data soal dari modul solusi yang baru dimuat setelah konfirmasi submit. Dari sepuluh SVG sumber, lima yang dirujuk soal disalin persis ke `public/studywithbro/katrol/` (2–6 ruas). Hanya dua PDF berakhiran `_Soal.pdf` yang disalin ke `public/latihan/katrol/`. Ketiga paket memakai implementasi CBT yang sama dengan penyimpanan dan reset terpisah per paket/versi.

`build.py` adalah generator sumber bawaan rilis dan tidak diperlukan untuk menjalankan website. Path keluarannya sudah disesuaikan ke direktori file ini. Regenerasi PDF/JSON/SVG memerlukan Python, reportlab, svglib, dan font DejaVu. Jalankan hanya saat merevisi sumber, lalu impor kembali dan periksa hasilnya; naikkan versi paket di konfigurasi aplikasi bila konten berubah.

**Peringatan keamanan:** Bank soal JSON mengandung kunci. Untuk MVP tanpa backend, jawaban masih dapat diperiksa lewat developer tools; ini cocok latihan mandiri, bukan ujian resmi anticurang.

**Referensi konsep:**

- OpenStax, Physics 9.3 Simple Machines: https://openstax.org/books/physics/pages/9-3-simple-machines
- Direktorat Jenderal Guru dan Tenaga Kependidikan, Kemendikdasmen: https://repositori.kemendikdasmen.go.id/9581/1/SD_KELAS_TINGGI_KK_E.pdf

Soal ditulis baru, bukan salinan butir soal dari sumber tersebut; tidak diklaim sebagai soal resmi TKA SMP.
