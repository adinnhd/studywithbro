# Sumber Paket A

- `pdf/Studywithbro_Latihan_Katrol.pdf`: soal pada halaman PDF 2–10.
- `pdf/Studywithbro_Katrol_Pembahasan.pdf`: halaman soal identik; kunci dan pembahasan pada halaman PDF 12–13.

Kedua nama file ini berbeda dari nama pada brief awal, tetapi isi 20 soal dan kuncinya sudah dicocokkan. PDF asli hanya dipindahkan folder, tanpa perubahan isi.

PDF soal tanpa kunci juga tersedia sebagai `public/latihan/katrol/Studywithbro_Paket_A_Soal.pdf`, disalin persis dari `pdf/Studywithbro_Latihan_Katrol.pdf`. Tombol unduh tersedia pada kartu Latihan A dan header kuis. Skrip ekstraksi memperbarui salinan ini saat regenerasi.

Tujuh panel diagram diekstrak dari PDF menjadi SVG di `public/latihan/katrol/`: soal 03, 05, 09, 12, 15, 18, dan 20. Teks soal, kategori, tingkat kesulitan dan konten di luar panel tidak disertakan dalam SVG. Diagram tetap vektor dan susunan tali/katrol asli dipertahankan.

Soal 15, 18, dan 20 dikonversi dari multi-jawaban menjadi pilihan tunggal kombinasi pernyataan sesuai brief:

| Soal | Pernyataan benar di PDF | Kombinasi     | Kunci baru |
| ---- | ----------------------- | ------------- | ---------- |
| 15   | A, B, D                 | (1), (2), (4) | D          |
| 18   | B, C, D                 | (2), (3), (4) | B          |
| 20   | A, B, E                 | (1), (2), (5) | E          |

Seluruh data aplikasi Paket A tetap di `src/data/katrolQuestions.ts` dan `src/data/katrolSolutions.ts`. Regenerasi memakai `scripts/extract-katrol.py` (Python + PyMuPDF). Kunci localStorage tetap `studywithbro:katrol:latihan-a:v1`, sehingga progres sebelumnya tetap bisa dipulihkan.

Kunci akhir: B, C, C, D, C, C, D, D, C, D, C, A, C, B, D, D, B, B, C, E.
