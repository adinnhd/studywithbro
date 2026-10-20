# Pengembangan materi Katrol

## Audit awal

- `PulleyLessonPage` menyusun konsep, `PulleySimulator`, `CalculationSteps` (dari simulator), dan `FormulaTriangle`. Simulator memakai `usePulleySimulation`, mesin `lib/physics/pulley.ts`, serta SVG/geometri dalam `components/pulley` dan `lib/pulley`.
- Segitiga interaktif dan mnemonic “Kamar Mandi kebagian WiFi” memakai W untuk berat. Implementasi tersebut dipertahankan; materi tambahan menjelaskan w = berat dan U = usaha agar Work tidak tertukar dengan Weight.
- Layout, warna hijau/kertas, tipografi Manrope, tombol, breadcrumb, serta navigasi materi sudah tersedia. Ekstensi memakai stylesheet tambahan dengan kelas khusus; tidak ada redesign global.
- Kurikulum sudah memuat Pesawat Sederhana dan Usaha dan Energi. Katrol tetap di `/ipa/fisika/katrol`; breadcrumb memasukkan Pesawat Sederhana. Sembilan placeholder submateri lain tidak diubah.
- Latihan A/B/C memakai satu `QuizPage`, bank soal terpisah dari dynamic import solusi, dan key localStorage per paket/versi. Data soal, diagram, solusi, scoring, reducer, penyimpanan, submit, dan navigasi ujian tidak disentuh.
- SVG lama dapat dipakai kembali untuk perbandingan geometri. Sketsa perbandingan selalu diberi keterangan bahwa posisi yang digambar adalah snapshot kenaikan 40 cm; target meter sebenarnya dihitung terpisah. Renderer, geometri, animasi dan mesin dasar tidak diedit.

## Susunan pembelajaran

1. **Dasar Katrol** (`#dasar`): seluruh materi, simulator, dan segitiga lama. Hash `#konsep`, `#simulasi`, dan `#rumus` tetap tersedia.
2. **Usaha dan Energi** (`#usaha`): konsep usaha searah gaya, Joule, notasi, usaha operator/beban, energi ke bentuk lain, eksperimen berdasarkan panjang tarikan, diagram aliran, dan langkah hitung.
3. **Efisiensi Katrol** (`#efisiensi`): ideal/nyata, persen/desimal, KM ideal/aktual, eksperimen dengan tinggi tetap dan efisiensi default 100%, hubungan antar-rumus, dan tantangan pengamatan.
4. **Analisis Lanjutan** (`#analisis`): dua konfigurasi berdampingan, batas gaya/tarikan operator, semua pilihan 1–10 ruas beserta alasan gagal/lolos, massa maksimum, dan dua contoh dengan tujuh langkah yang dibuka bertahap.

Referensi `#referensi-rumus` memiliki tiga kelompok dan sepuluh kartu dengan definisi simbol, satuan, konteks, dan pilihan susunan ulang rumus. Materi usaha di sini merupakan penerapan pada katrol, bukan pengganti bab umum Usaha dan Energi.

## Model fisika tambahan

Mesin baru `src/lib/physics/pulleyEnergy.ts` independen dari mesin dasar dan React. Semua perhitungan memakai SI (N, m, J, kg, m/s²).

```text
η = efisiensi persen / 100
KM ideal = n
KM aktual = η × n = w / F
F = w / (η × n)
s = n × h
U_in = F × s = U_out / η
U_out = w × h
E_hilang = U_in − U_out
m_maks = F_maks × η × n / g, jika n × h ≤ s_maks
```

Asumsi: gerak perlahan dengan kecepatan tetap, tali tidak mulur, konfigurasi penopang benar, efisiensi total sistem diketahui dan dianggap tetap selama satu pengangkatan. Efisiensi tidak diturunkan dari gesekan masing-masing roda. Tegangan tiap ruas pada sistem nyata tidak dimodelkan. Energi “hilang” berarti energi yang berubah ke bentuk lain, bukan musnah. Lebar cabang diagram menyatakan proporsi energi masuk, bukan skala joule mutlak.

“Panjang tali maksimum” pada kasus operator berarti panjang tarikan yang tersedia. Panjang tali terpasang, panjang lilitan, batas kekuatan material, dimensi alat, percepatan, dan daya tidak dimodelkan. Semua kandidat 1–10 ruas dibandingkan dengan efisiensi yang sama. Kapasitas nol karena tarikan kurang berarti tidak ada massa positif yang dapat mencapai target; kapasitas yang hanya ditentukan gaya tetap dijelaskan terpisah.

Eksperimen tambahan memakai berat dan tinggi positif serta efisiensi 1–100%, sehingga tidak menghasilkan pembagian nol atau efisiensi tak terdefinisi. Batas kontrol tertera pada setiap input. Input kosong, negatif, non-finite, di luar rentang, atau ruas pecahan ditolak; hasil valid terakhir dipertahankan dan nilai dipulihkan saat blur. Rentang mesin lebih lebar daripada kontrol untuk mendukung parameter turunan. Angka tampilan dibulatkan dua desimal; kalkulasi memakai presisi penuh.

Referensi konsep: [OpenStax Physics 9.3 — Simple Machines](https://openstax.org/books/physics/pages/9-3-simple-machines).

## Verifikasi

- Hasil lokal: **229 unit test lulus**, **78 browser test lulus** (desktop dan mobile), serta TypeScript dan build production berhasil. Setelah perapihan label kontrol, suite interaksi baru dijalankan ulang untuk memeriksa aksesibilitas dan tampilan sempit.
- Unit test baru mencakup kasus A–D pada brief, invariansi energi untuk ruas 1–10 dan berbagai efisiensi, konversi persen, batas operator, kegagalan tarikan, kapasitas maksimum, data tak valid, serta contoh cerita baru.
- Browser test baru mencakup navigasi empat tahap, reaktivitas kedua sisi diagram, angka kasus ideal/80%, invalid input, perbandingan, seluruh batas operator, pembahasan bertahap, transformasi rumus, overflow 320/390/768/1024 px, dan aksesibilitas axe pada keadaan interaktif.
- Jalankan `npm test`, `npm run build`, dan `npm run test:e2e`. Suite lama ikut memeriksa simulator, SVG, animasi, seluruh route, sumber soal, kuis A/B/C, submit, skor, serta pemulihan progres.
- Pengujian browser memakai Chromium desktop dan emulasi mobile. Evaluasi pembaca layar langsung, perangkat fisik, Safari/Firefox, dan uji penggunaan oleh siswa belum dilakukan. Perubahan disiapkan lokal; tidak melakukan deployment production.
