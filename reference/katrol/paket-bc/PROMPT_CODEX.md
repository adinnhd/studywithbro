# Codex — Integrasi Latihan Katrol B dan C di studywithbro

Kamu adalah Senior React/TypeScript Engineer sekaligus pengembang asesmen edukasi. **Lanjutkan repository studywithbro yang sudah ada; jangan inisialisasi ulang project, mengganti stack, atau merusak Latihan A serta simulasi katrol.**

## Sumber yang wajib dibaca

Di folder yang saya lampirkan ada:
- `data/latihan_b_katrol.json` dan `data/latihan_c_katrol.json`: **sumber utama konten digital** (masing-masing 20 soal, 5 opsi A–E, satu jawaban benar, pembahasan, dan URL gambar).
- `assets/katrol_1_ruas.svg` sampai `katrol_10_ruas.svg`: aset gambar vektor.
- `pdf/Studywithbro_Paket_B_Soal.pdf` dan `pdf/Studywithbro_Paket_C_Soal.pdf`: acuan visual dan sumber tombol unduh.
- `pdf/Studywithbro_Paket_B_Kunci_Pembahasan.pdf` dan `pdf/Studywithbro_Paket_C_Kunci_Pembahasan.pdf`: acuan verifikasi kunci/pembahasan (khusus pengajar).

Jangan membuat ulang, mengacak, mengubah angka, mengganti diagram, mengubah kunci, atau menyederhanakan soal. Gunakan **JSON sebagai sumber data** aplikasi, bukan OCR PDF. Semua soal orisinal; semua pilihan hanya satu yang benar.

## Integrasi ke alur eksisting

1. Pertahankan Latihan A di `/ipa/fisika/katrol/latihan/a` tanpa perubahan konten, skor, atau penyimpanannya.
2. Tambahkan **Latihan B** pada `/ipa/fisika/katrol/latihan/b` dan **Latihan C** pada `/ipa/fisika/katrol/latihan/c`.
3. Ubah placeholder B/C yang ada menjadi kuis CBT aktif. Di halaman daftar latihan, tampilkan kartu A/B/C dan tombol `Kerjakan` serta opsi `Unduh PDF Soal` untuk B/C.
4. Salin aset SVG ke `public/studywithbro/katrol/` agar URL pada JSON berfungsi, atau adaptasi URL melalui satu mapping terpusat yang dapat diuji. Salin kedua PDF soal ke lokasi public yang jelas. **Jangan menempatkan PDF kunci/pembahasan di public**, cukup simpan sebagai referensi nonpublik untuk pengembangan.
5. Buat tipe data/loader/config **reusable** untuk A/B/C, jangan duplikasi 3 implementasi kuis. Ikuti komponen dan gaya UI studywithbro yang sudah digunakan.

## UX kuis

- Satu soal per layar, pilihan A–E sebagai radio/selection card.
- Navigasi nomor 1–20; status sedang dibuka, terjawab, belum terjawab.
- Bisa mengubah atau mengosongkan pilihan sebelum submit.
- Progress `x/20 terjawab`, prev/next, responsive mobile-first.
- **Jangan membocorkan bentuk perhitungan, nama konsep yang diuji, kategori, tingkat kesulitan, langkah rumus, jawaban, atau label seperti "gaya kuasa" di atas soal.** Tampilkan hanya nomor, pertanyaan, diagram jika ada, dan opsi A–E.
- Matematika dan satuan mudah dibaca (N, kg, J, m, %, m/s²).
- Tampilkan konfirmasi sebelum submit dan peringatan jumlah belum terjawab; pengguna masih boleh kembali.
- Setelah submit, kunci jawaban, tampilkan nilai 0–100 (`benar × 5`), jumlah benar/salah/kosong, lalu tombol untuk review & pembahasan tiap soal.
- Review menampilkan jawaban siswa, kunci, penjelasan bertahap, dan filter salah/benar/kosong. Review **hanya setelah submit**.
- Tombol `Coba Lagi` membersihkan progres **paket itu saja**.
- Simpan progres dengan `localStorage`, **namespace terpisah per paket** (dan versi bank soal); refresh halaman tidak menghapus jawaban.
- PDF unduh mengambil **PDF soal saja**, bukan PDF pembahasan atau bank JSON.

## Data dan keamanan realistis

- Gunakan `questions[].image` yang mengarah ke SVG, perhatikan bahwa tidak semua soal punya gambar.
- Jangan tampilkan `correctAnswer`/`explanation` pada UI sampai kuis selesai.
- Jika tanpa backend, kunci di source/frontend masih bisa dilihat lewat developer tools. Jangan mengklaim sistem anticurang untuk ujian resmi.
- Jangan pernah menampilkan properti `difficulty` atau `proof` di UI; tidak ada properti tersebut di JSON final.

## Validasi wajib

- Paket B: 20 soal, kunci urut `D B C D C D C D D C C C B D C D C D D C`.
- Paket C: 20 soal, kunci urut `D C D D D D D C B D C B D C B C C D C B`.
- B dan C masing-masing 5 opsi A–E dan tepat 1 kunci.
- Rumus penilaian: skor = jumlah jawaban benar × 5, maksimum 100. Kosong/salah = 0.
- Aset gambar pada soal harus sesuai dan dapat dibuka/di-zoom terutama di mobile.
- Pastikan semua route berfungsi, tidak ada duplikasi nomor atau soal, dan state antarpaket tidak tercampur.
- Tambahkan unit test untuk skor 0/100/parsial, reset per paket, submit dengan kosong, dan render gambar.
- Jalankan build, typecheck, dan test; laporkan langkah verifikasi serta file yang berubah.

## Batasan

Jangan tambahkan login, backend, dashboard admin, leaderboard, timer wajib, randomisasi soal, atau fitur di luar permintaan. Fokus kualitas **akurasi data soal > penilaian > pengalaman siswa > tampilan**. Tuntaskan integrasi sampai berjalan, jangan berhenti di rencana.
