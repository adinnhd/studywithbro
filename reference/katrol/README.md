# Referensi latihan katrol

Ketiga paket sudah terintegrasi di `/ipa/fisika/katrol/latihan/a`, `/b`, dan `/c`, masing-masing 20 soal pilihan tunggal A–E. Komponen CBT, penilaian dan review digunakan bersama; progres terpisah per paket dan versi.

```text
reference/katrol/
  README.md
  paket-a/
    README.md
    pdf/                    2 PDF sumber Paket A
  paket-bc/
    README.md               Petunjuk dan isi rilis B/C
    PROMPT_CODEX.md          Instruksi integrasi asli
    build.py                Generator sumber PDF/JSON/SVG
    data/                   2 bank JSON sumber lengkap
    assets/                 10 SVG asli (1–10 ruas)
    pdf/                    2 PDF soal + 2 PDF kunci/pembahasan
```

- [Paket A](paket-a/README.md): soal dan pembahasan diekstrak dari dua PDF asli. Konten, kunci, dan format penyimpanan Paket A dipertahankan.
- [Paket B/C](paket-bc/README.md): JSON menjadi sumber utama aplikasi; PDF menjadi acuan verifikasi dan unduhan soal. [Instruksi integrasi asli](paket-bc/PROMPT_CODEX.md) tetap disimpan.

Arsip ZIP duplikat dihapus setelah seluruh 19 entri dipastikan identik dengan berkas hasil ekstraksinya dan integrasi selesai. Tidak ada sumber soal, PDF pengajar, atau SVG asli yang dibuang. Salinan di `public/` hanya untuk aset yang dipakai website: lima SVG B/C dan tiga PDF soal peserta A/B/C; tujuh SVG Paket A tetap tersedia di lokasi semula.

## Memperbarui data aplikasi

```bash
# Paket B/C: validasi kedua bank dan pisahkan soal dari solusi
node scripts/import-katrol-bc.mjs
npx prettier --write src/data/katrolB*.ts src/data/katrolC*.ts

# Opsional, cocokkan kembali isi JSON dengan PDF (perlu pdftotext/Poppler)
python3 scripts/verify-katrol-bc.py

# Jalankan pemeriksaan aplikasi
npm test
npm run test:e2e
```

`scripts/extract-katrol.py` tetap digunakan khusus Paket A; path PDF sudah mengikuti folder baru. Panduan dependensi ekstraksi ada di README utama proyek.

Jika konten soal berubah pada masa mendatang, naikkan `version` paket terkait di `src/data/quizPackages.ts` agar progres versi lama tidak dipakai untuk bank baru. Kunci dan pembahasan dimuat setelah konfirmasi submit, tetapi tetap dapat diinspeksi melalui developer tools karena aplikasi tanpa backend.
