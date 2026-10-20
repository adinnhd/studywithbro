# studywithbro

**Belajar bareng. Paham beneran.**

Platform belajar interaktif berbahasa Indonesia. MVP 1 mengimplementasikan Fisika: Katrol untuk siswa SMP. Aplikasi berjalan sepenuhnya di browser, tanpa backend, akun, atau database.

Modul Katrol kini memiliki empat tahap: Dasar Katrol, Usaha dan Energi, Efisiensi Katrol, serta Analisis Lanjutan. Lihat [audit, fitur, asumsi fisika, dan batas pengujian](docs/pulley-learning.md) untuk ekstensi pembelajaran ini.

## Jalankan secara lokal

Gunakan Node.js 22.12+ atau Node.js 24 LTS dan npm.

```bash
npm install
npm run dev
```

Buka **http://localhost:5173**. Jika port tersebut dipakai, gunakan alamat yang dicetak Vite.

```bash
npm test          # Unit test fisika, geometri, bank soal, state dan penilaian kuis
npm run build    # TypeScript + build produksi ke dist/
npm run preview  # Preview hasil build
```

Pengujian browser (desktop dan emulasi mobile, Chromium):

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright membangun dan menjalankan preview produksi sendiri di port 4173. Browser test memeriksa navigasi, semua route, simulasi, konfigurasi 1–10, input tidak valid, animasi, reduced motion, keyboard, segitiga rumus, overflow, batas SVG, dan aksesibilitas otomatis dengan axe. Kuis diuji dari pengerjaan sampai review: penyimpanan saat refresh, pengosongan jawaban, semua diagram dan zoom, kombinasi pernyataan, konfirmasi soal kosong, skor 0/100, filter, penguncian setelah submit, serta reset. Pemeriksaan otomatis tidak menggantikan evaluasi manual dengan pembaca layar atau perangkat fisik.

## Stack dan struktur

React, Vite, TypeScript, Tailwind CSS 4, React Router, dan Lucide React. Diagram memakai SVG asli dan requestAnimationFrame; tidak memerlukan library animasi. Rumus sederhana dirender sebagai teks aksesibel. Font Manrope di-host secara lokal; lisensi SIL OFL ada di `public/fonts/OFL.txt`.

```text
src/
  components/
    layout/         Navbar, footer, judul browser, perpindahan route
    navigation/     Breadcrumb dan tab materi
    ui/             Brand dan kartu reusable
    pulley/         Kontrol, renderer SVG, statistik, langkah hitung
    formula/        Segitiga rumus dan penjelasan
    quiz/           Soal, pilihan, navigasi, dialog, nilai, review dan pembahasan
  pages/            Beranda, kategori, materi, latihan, placeholder, 404
  data/             Kategori, topik, label navigasi, konfigurasi latihan
  hooks/            State simulasi, animasi, prefers-reduced-motion, progres kuis lokal
  lib/
    physics/        Perhitungan ideal dan validasi + unit test
    pulley/         Geometri tali, roda, perpindahan + unit test
    quiz/           Reducer, serialisasi/validasi progres, penilaian + unit test
  types/            Kontrak TypeScript untuk simulasi dan geometri
  styles/           Stylesheet modular dan responsive
public/
  favicon.svg
  fonts/            Font lokal dan lisensi
  latihan/katrol/    Tujuh SVG Paket A + PDF soal peserta A/B/C
  studywithbro/katrol/ Lima SVG sumber yang digunakan B/C
reference/katrol/    Sumber terpisah ke paket-a/ dan paket-bc/, dengan indeks README
scripts/            Ekstraksi A, impor JSON B/C, dan verifikasi PDF
```

## Route

- `/` — beranda dan lab mini interaktif.
- `/ipa` — pilihan Fisika, Kimia, Biologi.
- `/ipa/fisika` — kategori Usaha dan Energi serta Pesawat Sederhana.
- `/ipa/fisika/katrol` — konsep, simulasi, perhitungan, segitiga rumus.
- `/ipa/fisika/katrol#simulasi` — langsung ke simulasi.
- `/ipa/fisika/katrol/latihan` — daftar latihan.
- `/ipa/fisika/katrol/latihan/a` — kuis 20 soal, nilai, review, pembahasan dan unduhan PDF soal.
- `/ipa/fisika/katrol/latihan/b`, `/c` — masing-masing kuis 20 soal dengan nilai, review, pembahasan dan unduhan PDF soal.
- `/matematika`, `/ipa/kimia`, `/ipa/biologi`, `/coming-soon`, `/ipa/fisika/materi-lainnya` — placeholder yang bisa dibuka.
- Alamat lain, termasuk ID latihan tidak dikenal, menampilkan halaman 404.

Untuk hosting statis di luar Vite, arahkan permintaan route yang bukan file ke `index.html` agar deep link React Router tetap berfungsi.

## Navigasi materi Fisika

Seluruh definisi kategori, submateri, status dan label breadcrumb berada di `src/data/navigation.ts`. Halaman Fisika hanya menampilkan dua kategori. Sebelas route baru ditambahkan:

```text
/ipa/fisika/usaha-dan-energi
  /usaha-dan-perpindahan
  /energi-kinetik-dan-potensial
  /energi-mekanik-dan-kekekalannya
  /transformasi-energi
  /hubungan-usaha-dan-energi
  /daya

/ipa/fisika/pesawat-sederhana
  /tuas
  /bidang-miring
  /roda-berporos
```

Setiap path berindentasi ditambahkan ke path kategori di atasnya. Sembilan submateri tersebut membuka placeholder dengan nama materi, status Coming Soon, pesan “Materi sedang disiapkan.”, breadcrumb dan tombol kembali ke kategori induk. Tidak ada konten teori, rumus, simulator atau kuis baru.

Kategori Pesawat Sederhana juga menampilkan Katrol sebagai materi aktif yang langsung membuka URL lamanya, `/ipa/fisika/katrol`. Breadcrumb mengikuti `IPA → Fisika → Pesawat Sederhana → Katrol`; untuk halaman latihan, dilanjutkan dengan `Latihan Soal → Latihan A/B/C`. Tombol kembali mengikuti induk breadcrumb sehingga dari Katrol kembali ke Pesawat Sederhana, sementara dari latihan tetap kembali ke modul/daftar latihan.

Route lama Katrol, hash simulasi, latihan A/B/C, dan placeholder `materi-lainnya` tetap didukung. Identifier, versi bank, format penyimpanan dan key localStorage tidak dimigrasikan. Navbar, homepage, simulator, kuis, bank soal, kunci dan PDF tetap menggunakan implementasi/aset sebelumnya.

`PhysicsCategoryPage` menggunakan kembali `TopicCard`, `Breadcrumb` dan layout/style kategori yang sudah tersedia. Seluruh placeholder baru menggunakan satu `ComingSoonPage`; route dan label dihasilkan dari konfigurasi yang sama. Untuk menambah materi, tambahkan definisinya di kategori terkait, buat halaman dan route kontennya bila sudah tersedia, lalu ubah status `available` menjadi `true`.

Pengujian navigasi memeriksa seluruh kategori/placeholder, tombol kembali, breadcrumb, refresh nested route, lebar 320/768/1024 px, serta pemulihan progres lama A/B/C saat berpindah kategori. Seluruh pengujian simulator dan kuis tetap dijalankan sebagai regresi. Perubahan ini disiapkan dan diverifikasi secara lokal; deployment production dilakukan terpisah.

## Model fisika dan geometri

Referensi konsep: [OpenStax, Physics, 9.3 Simple Machines](https://openstax.org/books/physics/pages/9-3-simple-machines).

- `W = m × g`, `F = W / KM`, dan `s = KM × h`.
- Satuan masukan massa kg, gravitasi m/s², ketinggian cm; usaha dihitung dalam joule setelah konversi cm ke meter.
- Default: massa 50 kg, gravitasi 10 m/s², katrol tetap, ketinggian 0 cm.
- KM katrol tetap = 1. KM katrol bergerak = 2. KM majemuk = jumlah ruas tali penopang 1–10.
- Satu tali kontinu, tidak mulur, tidak bermassa, dengan roda tanpa massa/gesekan dan tegangan sama di setiap ruas. Gerak kuasistatis: percepatan beban, inersia roda, dan rugi energi tidak dimodelkan.
- Katrol bergerak sederhana memakai **satu roda** dan dua ruas penopang; ujung bebas ditarik **ke atas**.
- Katrol majemuk memakai susunan blok horizontal dengan ruas vertikal dan roda pengarah terakhir agar ujung bebas ditarik **ke bawah**. Untuk `n` ruas, ada `floor(n/2)` roda bergerak dan `ceil(n/2)` roda tetap. Ini adalah jumlah roda untuk **susunan yang dipilih**, bukan rumus umum KM. Misalnya katrol bergerak sederhana dan majemuk dua ruas sama-sama KM = 2, tetapi jumlah rodanya berbeda.
- Konfigurasi genap: ujung awal tali ditambatkan ke rangka tetap. Konfigurasi ganjil: ujung awal tali ditambatkan ke blok bergerak; tambatan ini ikut menopang beban.
- Majemuk 1 ruas ditampilkan sebagai katrol tetap dengan satu roda dan beban terikat pada tali. Tidak ada roda bergerak yang dipaksakan.
- Ruas penopang bernomor hijau. Sambungan ke roda memakai garis singgung vertikal dan busur setengah lingkaran yang kontinu. Batang penyangga poros berada di belakang tali.
- Titik gantung beban berada di bawah pusat resultan tegangan ruas penopang, termasuk pada konfigurasi ganjil, sehingga momen total pada blok bergerak bernilai nol.
- Panjang lengkap tali yang digambar tetap konstan untuk setiap tinggi angkat. Pada pengangkatan `h`, ruas penopang memendek total `KM × h`, dan ujung bebas berpindah sejauh itu.
- Putaran setiap roda dihitung dari perpindahan tali pada kedua titik singgung sehingga konsisten dengan kondisi tanpa selip. Semua poros roda atas tetap di rangka, sedangkan poros roda bawah mengikuti beban.
- Skala visual disesuaikan berdasarkan KM supaya seluruh tali tetap terlihat dalam diagram. Dalam setiap konfigurasi, perpindahan beban dan ujung bebas memakai **skala panjang yang sama**. Indikator numerik tetap menggunakan cm sebenarnya. Tidak ada looping atau teleportasi beban saat animasi berjalan: berhenti di 100 cm, lalu tombol play dapat memulai pengangkatan baru.

Test mencakup rumus contoh yang diminta, anchor ganjil/genap, jumlah ruas/roda, kontinuitas garis singgung, konservasi panjang tali pada tinggi 0–100 cm, perpindahan roda dan ujung bebas, putaran tanpa selip, serta keseimbangan momen blok. Model ini bukan simulasi dinamika atau model alat derek nyata; belum diverifikasi terhadap pengukuran eksperimen fisik.

## Kuis Latihan A, B, dan C

Soal Paket A disalin dari `reference/katrol/paket-a/pdf/Studywithbro_Latihan_Katrol.pdf` dan kunci/pembahasan dari `Studywithbro_Katrol_Pembahasan.pdf` di folder yang sama. Nama file berbeda dari brief awal; isi 20 soal dan seluruh kunci sudah dicocokkan. Lihat `reference/katrol/paket-a/README.md` untuk halaman sumber dan konversi soal 15/18/20.

Paket B/C menggunakan bank JSON asli di `reference/katrol/paket-bc/data/`, tanpa mengubah angka, cerita, opsi, gambar, kunci, atau pembahasan. `scripts/import-katrol-bc.mjs` memvalidasi bank, menghasilkan modul soal/solusi terpisah, dan menyalin hanya SVG yang digunakan beserta dua PDF soal peserta. Semua teks pertanyaan, opsi, kunci, dan pembahasan juga dicocokkan dengan PDF melalui `scripts/verify-katrol-bc.py`.

`src/data/quizPackages.ts` mengatur ketiga paket untuk satu implementasi `QuizPage`. `katrolQuestions.ts`, `katrolBQuestions.ts`, dan `katrolCQuestions.ts` hanya memuat soal, opsi, pernyataan jika ada, serta lokasi diagram. Modul `*Solutions.ts` memuat kunci/pembahasan dan dimuat dengan dynamic import setelah konfirmasi submit atau saat memulihkan paket yang sudah selesai. Kategori, tingkat kesulitan, dan petunjuk rumus tidak disertakan dalam data soal. SVG Paket A diekstrak dari panel PDF (teks menjadi path); SVG B/C disalin persis dari aset sumber. Tidak ada screenshot halaman PDF.

Satu jawaban benar bernilai 5 poin; salah atau kosong 0, tanpa nilai parsial. Nilai dan ketepatan dihitung terhadap seluruh 20 soal. Progres disimpan di `localStorage` dengan key `studywithbro:katrol:latihan-{a|b|c}:v1`, termasuk nomor aktif dan status selesai. Key dan format lama Paket A tetap kompatibel. Data divalidasi saat dipulihkan. Jika storage diblokir/penuh, latihan tetap berjalan dengan pemberitahuan bahwa progres belum tersimpan. Mulai ulang hanya menghapus jawaban dan hasil paket yang sedang dibuka. Komponen di-mount ulang saat berpindah paket/versi agar state tidak tercampur.

Pembahasan hanya dirender setelah submit; jawaban dan navigasi pengerjaan dikunci oleh reducer. Dialog dapat dioperasikan dengan keyboard, termasuk Escape, dan navigasi nomor menjadi panel pada mobile. Diagram dapat diperbesar sampai 300% di area gulir tersendiri. Rumus pembahasan menggunakan simbol matematika, subskrip, dan pecahan MathML bawaan browser.

Ini MVP browser tanpa backend: kunci tetap bisa diperiksa melalui developer tools atau berkas build, dan localStorage bisa dimodifikasi. Pemisahan chunk mencegah kunci dimuat dalam payload soal awal; **bukan keamanan ujian formal**. Tidak ada login, timer wajib, randomisasi, backend, atau database.

Regenerasi Paket A (opsional, bukan langkah menjalankan aplikasi):

```bash
python3 -m venv /tmp/studywithbro-pdf-env
/tmp/studywithbro-pdf-env/bin/pip install PyMuPDF
/tmp/studywithbro-pdf-env/bin/python scripts/extract-katrol.py
npx prettier --write src/data/katrolQuestions.ts src/data/katrolSolutions.ts
```

Skrip memeriksa kesamaan halaman soal dalam kedua PDF, jumlah soal, kombinasi pernyataan, dan kunci akhir sebelum menghasilkan file. Penilaian frontend tidak membutuhkan Python atau PyMuPDF.

Impor ulang Paket B/C dan verifikasi sumber (opsional):

```bash
node scripts/import-katrol-bc.mjs
npx prettier --write src/data/katrolB*.ts src/data/katrolC*.ts
python3 scripts/verify-katrol-bc.py  # memerlukan pdftotext/Poppler
```

Folder `reference/katrol` sudah dikelompokkan menurut paket. ZIP duplikat dihapus setelah isinya diverifikasi identik dengan hasil ekstraksi; instruksi asli, JSON, PDF soal/pengajar, sepuluh SVG sumber, dan generator tetap disimpan. [Indeks referensi](reference/README.md) menjelaskan lokasi sumber. PDF kunci/pembahasan dan JSON lengkap tidak ditempatkan di `public/`. Kartu dan header ketiga paket menawarkan unduhan PDF soal tanpa kunci.

## Mengembangkan materi

Kategori dan kartu materi berada di `src/data/navigation.ts`; konfigurasi kuis di `src/data/quizPackages.ts`, dengan kartu latihan dari `src/data/exercises.ts`. Jika bank soal berubah, naikkan versi paket terkait agar progres lama tidak dipakai untuk bank baru. Tambahkan materi lain di halaman baru, daftarkan route di `src/App.tsx`, dan perbarui label breadcrumb. Mesin fisika tidak bergantung pada React dan renderer SVG tidak memuat logika perhitungan gaya.

Massa divalidasi 0–1.000 kg, gravitasi lebih dari 0 hingga 30 m/s² (kontrol UI 0,1–30), ketinggian 0–100 cm, dan ruas majemuk integer 1–10. Input kosong atau di luar rentang menampilkan kesalahan tanpa mengganti hasil valid terakhir; saat meninggalkan input, nilai valid terakhir dipulihkan.

Fitur yang sengaja belum ada: materi selain katrol, backend, autentikasi, progres akun, dashboard, gamifikasi kompleks, dan AI tutor.
