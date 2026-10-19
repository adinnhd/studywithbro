import os,json,math,html,copy,zipfile,random,re
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak, Flowable, HRFlowable, CondPageBreak
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT,TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
ROOT=Path(__file__).resolve().parent
(ROOT/'pdf').mkdir(exist_ok=True)
(ROOT/'data').mkdir(exist_ok=True)
(ROOT/'assets').mkdir(exist_ok=True)

# level only for author QA and package metadata, never rendered on the test pages.
def q(id, level, text, options, key, explanation, diagram=None, proof=None):
    assert len(options)==5 and key in 'ABCDE'
    return dict(id=id, difficulty=level, text=text, options=[dict(id=a,text=v) for a,v in zip('ABCDE',options)],correctAnswer=key, explanation=explanation, diagram=diagram,proof=proof)
B=[
q(1,'mudah','Seorang pekerja menaikkan karung dengan berat 240 N memakai satu katrol tetap ideal. Beban bergerak perlahan. Berapa besar tarikan pekerja?', ['60 N','120 N','180 N','240 N','480 N'],'D','Katrol tetap hanya mengubah arah gaya. KM = 1, maka F = 240/1 = 240 N.',proof='240/1=240'),
q(2,'mudah','Kotak bermassa 28 kg diangkat dengan satu katrol bergerak ideal. Jika g = 10 m/s², berapakah gaya yang perlu diberikan?', ['70 N','140 N','280 N','560 N','14 N'],'B','W = m × g = 28 × 10 = 280 N. Katrol bergerak ditopang dua ruas tali, jadi F = 280/2 = 140 N.',proof='28*10/2=140'),
q(3,'mudah','Pada rangkaian katrol di bawah, sebuah beban mempunyai berat 360 N. Semua katrol ideal. Berapa besar gaya tarik pada ujung tali?', ['60 N','90 N','120 N','180 N','360 N'],'C','Terdapat tiga ruas tali yang menahan bagian bergerak. KM = 3, sehingga F = 360/3 = 120 N.',diagram=3,proof='360/3=120'),
q(4,'mudah','Sebuah rangkaian katrol ideal memiliki empat ruas tali penopang. Jika peti naik 60 cm, berapa panjang tali yang harus ditarik?', ['15 cm','60 cm','120 cm','240 cm','480 cm'],'D','Tarikan tali = KM × perpindahan beban = 4 × 60 = 240 cm.',proof='4*60=240'),
q(5,'mudah','Sebuah katrol majemuk ideal dengan tiga ruas tali penopang ditarik menggunakan gaya 75 N. Berapa berat benda yang dapat ditahan dalam keadaan seimbang?', ['75 N','150 N','225 N','300 N','450 N'],'C','Berat W = KM × F = 3 × 75 = 225 N.',proof='3*75=225'),
q(6,'mudah','Seorang siswa memasang satu katrol tetap tepat di atas sumur. Dibandingkan mengangkat ember langsung, manfaat utama pemasangan katrol tetap ideal tersebut adalah ...', ['mengurangi berat ember menjadi setengahnya','menghilangkan seluruh usaha untuk mengangkat ember','memperpendek jarak perpindahan ember','memungkinkan ember diangkat dengan menarik tali ke bawah','membuat massa ember berkurang'],'D','Katrol tetap mengubah arah gaya sehingga orang dapat menarik ke bawah, tetapi idealnya tidak mengurangi besar gaya maupun usaha.'),
q(7,'sedang','Perhatikan rangkaian katrol berikut. Ujung tali ditarik dengan gaya 200 N sehingga sistem seimbang. Jika g = 10 m/s², berapa massa beban maksimum yang ditopang secara ideal?', ['40 kg','60 kg','80 kg','100 kg','120 kg'],'C','Ada empat ruas penopang. Berat W = 4 × 200 = 800 N; massa = 800/10 = 80 kg.',diagram=4,proof='4*200/10=80'),
q(8,'sedang','Rangkaian katrol ideal dengan tiga ruas penopang mengangkat beban setinggi 1,2 m. Gaya yang dipakai 90 N. Berapa usaha yang dilakukan orang untuk menarik tali?', ['108 J','216 J','270 J','324 J','360 J'],'D','Panjang tali ditarik = 3 × 1,2 = 3,6 m. Usaha masukan = 90 × 3,6 = 324 J.',proof='90*3*1.2=324'),
q(9,'sedang','Dua alat ideal dipakai bergantian untuk mengangkat peti 1.000 N. Alat P memiliki dua ruas tali penopang, sedangkan Q memiliki lima ruas. Selisih besar gaya yang diperlukan P dan Q adalah ...', ['100 N','200 N','250 N','300 N','400 N'],'D','Alat P memerlukan 1000/2 = 500 N, sedangkan Q 1000/5 = 200 N. Selisih = 300 N.',proof='1000/2-1000/5=300'),
q(10,'sedang','Gambar menunjukkan sistem katrol yang efisiensinya 80%. Beban 440 N diangkat perlahan. Berapa gaya nyata yang diperlukan pada ujung tali?', ['110 N','125 N','137,5 N','155 N','176 N'],'C','Diagram memiliki empat ruas penopang, sehingga KM ideal = 4. Efisiensi = W/(F × KM ideal). Maka F = 440/(0,8 × 4) = 137,5 N.',diagram=4,proof='440/(.8*4)=137.5'),
q(11,'sedang','Sebuah mesin katrol menerima usaha masukan 1.500 J. Jika efisiensinya 80% dan peti dinaikkan setinggi 2 m di tempat dengan g = 10 m/s², berapa massa petinya?', ['40 kg','50 kg','60 kg','70 kg','75 kg'],'C','Usaha berguna = 80% × 1.500 = 1.200 J. Berat = 1.200/2 = 600 N. Massa = 600/10 = 60 kg.',proof='.8*1500/2/10=60'),
q(12,'sedang','Saat menarik tali sepanjang 7,5 m, seorang petugas melihat muatannya terangkat 1,5 m. Jika alat ideal dan muatan memiliki berat 750 N, berapa besar gaya tariknya?', ['100 N','125 N','150 N','180 N','250 N'],'C','KM = s/h = 7,5/1,5 = 5. Gaya F = 750/5 = 150 N.',proof='750/(7.5/1.5)=150'),
q(13,'sedang','Untuk memindahkan bahan bangunan ke lantai atas, alat katrol ideal memiliki empat ruas penopang. Tali yang masih bisa ditarik hanya 5 m. Target kenaikan beban adalah 1,5 m. Berapa kekurangan tinggi angkat dibanding target?', ['0,10 m','0,25 m','0,50 m','0,75 m','1,00 m'],'B','Kenaikan maksimum h = 5/4 = 1,25 m. Kekurangan dari target 1,5 m adalah 0,25 m.',proof='1.5-5/4=.25'),
q(14,'sedang','Dalam percobaan pada gambar, gaya yang terbaca pada dinamometer adalah 200 N untuk mengangkat beban 480 N. Berapa efisiensi alat?', ['60%','70%','75%','80%','90%'],'D','Gambar memiliki tiga ruas penopang. Efisiensi = 480/(3 × 200) × 100% = 80%.',diagram=3,proof='480/(3*200)=.8'),
q(15,'sulit','Sebuah mesin 900 N harus dinaikkan dalam dua tahap menggunakan alat ideal. Pada tahap pertama dipakai alat dengan tiga ruas penopang untuk menaikkan 0,8 m. Pada tahap kedua dipakai alat dengan lima ruas penopang untuk menaikkan 1,2 m lagi. Berapa panjang total tali yang ditarik dalam kedua tahap?', ['6,0 m','7,2 m','8,4 m','9,6 m','10,8 m'],'C','Tahap pertama: s1 = 3 × 0,8 = 2,4 m. Tahap kedua: s2 = 5 × 1,2 = 6,0 m. Total = 8,4 m.',proof='3*.8+5*1.2=8.4'),
q(16,'sulit','Dalam sistem nyata beruas empat, pekerja menarik tali sepanjang 6 m dengan gaya konstan 250 N. Beban yang terangkat mempunyai berat 800 N dan naik 1,5 m. Berapa energi yang berubah menjadi panas atau bentuk lain, bukan untuk mengangkat beban?', ['150 J','200 J','250 J','300 J','600 J'],'D','Usaha masukan = 250 × 6 = 1.500 J. Usaha berguna = 800 × 1,5 = 1.200 J. Selisih = 300 J.',proof='250*6-800*1.5=300'),
q(17,'sulit','Sebuah peti 1.000 N harus naik tepat 2 m. Pekerja hanya sanggup menarik dengan gaya paling besar 220 N dan ruang kerja membatasi panjang tali yang dapat ditarik hingga 10 m. Alat dianggap ideal. Konfigurasi manakah yang memenuhi kedua batas tersebut?', ['3 ruas penopang','4 ruas penopang','5 ruas penopang','6 ruas penopang','tidak ada yang memenuhi'],'C','Perlu KM ≥ 1000/220 = 4,55, sehingga minimal 5 ruas. Karena s = KM × 2 ≤ 10 m, KM maksimal 5. Jadi hanya 5 ruas.',proof='1000/5=200;5*2=10'),
q(18,'sulit','Berdasarkan susunan pada gambar, sebuah motor 120 kg diangkat di tempat dengan g = 10 m/s². Gaya tarik nyata sebesar 300 N; motor naik 2 m setelah tali ditarik 10 m. Berapa persen usaha masukan berubah menjadi usaha berguna?', ['60%','70%','75%','80%','90%'],'D','W = 120 × 10 = 1.200 N. Usaha keluaran = 1.200 × 2 = 2.400 J. Usaha masukan = 300 × 10 = 3.000 J. Efisiensi = 80%.',diagram=5,proof='120*10*2/(300*10)=.8'),
q(19,'sulit','Di pelabuhan, sistem katrol mengangkat kontainer dengan berat 900 N setinggi 4 m dalam 30 detik. Efisiensi sistem 75% dan gaya saat menarik konstan. Berapa daya rata-rata yang harus disediakan pekerja?', ['100 W','120 W','150 W','160 W','200 W'],'D','Usaha berguna = 900 × 4 = 3.600 J. Masukan = 3.600/0,75 = 4.800 J. Daya = 4.800/30 = 160 W.',proof='900*4/.75/30=160'),
q(20,'sulit','Pada alat dengan tiga ruas tali penopang, sebuah peti 600 N naik setinggi 1,5 m. Petugas mencatat gaya tarik konstan 250 N dan panjang tarikan 4,5 m. Pernyataan manakah yang tepat?', ['efisiensi alat 60%','usaha berguna 1.125 J','efisiensi alat 80%','gaya idealnya 250 N','usaha masukan 900 J'],'C','Usaha masukan = 250 × 4,5 = 1.125 J, usaha berguna = 600 × 1,5 = 900 J. Efisiensi = 900/1.125 = 80%. Gaya ideal = 600/3 = 200 N.',proof='600*1.5/(250*4.5)=.8'),
]
C=[
q(1,'mudah','Sebuah katrol tetap ideal digunakan untuk menaikkan tas berisi buku yang beratnya 600 N. Jika tarikan membuat tas naik perlahan, berapa gaya pada ujung tali?', ['150 N','300 N','450 N','600 N','1.200 N'],'D','Katrol tetap memiliki KM = 1. Besar gaya tetap 600 N; yang berubah hanya arah gaya.',proof='600/1=600'),
q(2,'mudah','Pada gambar, tali ditarik turun sejauh 9 m. Jika katrol ideal, berapa tinggi kenaikan beban?', ['2,25 m','3 m','4,5 m','9 m','18 m'],'C','Dua bagian tali menopang katrol bergerak, KM = 2. Maka h = s/KM = 9/2 = 4,5 m.',diagram=2,proof='9/2=4.5'),
q(3,'sedang','Sebuah alat ideal dengan empat ruas penopang mengangkat benda. Pengukuran menunjukkan gaya tarik 280 N. Jika g = 10 m/s², berapa massa benda?', ['56 kg','84 kg','100 kg','112 kg','140 kg'],'D','Berat W = 4 × 280 = 1.120 N, sehingga massa = 1.120/10 = 112 kg.',proof='4*280/10=112'),
q(4,'sedang','Pada sistem katrol di gambar, penarik menggunakan gaya 190 N dan sistem dianggap ideal. Berapa berat maksimum beban yang dapat ditahan?', ['380 N','570 N','760 N','950 N','1.140 N'],'D','Ada lima ruas tali penopang, maka W = 5 × 190 = 950 N.',diagram=5,proof='5*190=950'),
q(5,'sedang','Seorang tukang menaikkan beban sejauh 45 cm menggunakan katrol dengan enam ruas tali penopang. Semua komponen dianggap ideal. Berapa meter tali harus ditarik?', ['0,45 m','1,35 m','2,25 m','2,70 m','3,60 m'],'D','h = 45 cm = 0,45 m. Panjang tarikan = 6 × 0,45 = 2,70 m.',proof='6*.45=2.7'),
q(6,'sedang','Dalam uji alat beruas tiga, peti bermassa 54 kg diangkat perlahan dengan gaya nyata 225 N. Jika g = 10 m/s², berapa efisiensi alat?', ['60%','70%','75%','80%','90%'],'D','W = 54 × 10 = 540 N. KM nyata = 540/225 = 2,4. Efisiensi = 2,4/3 × 100% = 80%.',proof='54*10/(3*225)=.8'),
q(7,'sedang','Pada alat seperti gambar, muatan seberat 640 N naik 2 m. Ujung tali ditarik 8 m dengan gaya nyata 200 N. Berapa energi yang tidak menjadi usaha angkat berguna?', ['160 J','240 J','280 J','320 J','400 J'],'D','Masukan = 200 × 8 = 1.600 J; keluaran = 640 × 2 = 1.280 J. Energi hilang = 320 J.',diagram=4,proof='200*8-640*2=320'),
q(8,'sedang','Sebuah alat memiliki tiga ruas penopang. Selama percobaan, tali ditarik 5,4 m dengan gaya 240 N dan peti 600 N bergerak naik 1,8 m. Berapa selisih antara usaha masukan dan usaha yang diterima peti?', ['108 J','180 J','216 J','270 J','360 J'],'C','Usaha masukan = 240 × 5,4 = 1.296 J. Usaha berguna = 600 × 1,8 = 1.080 J. Selisih = 216 J.',proof='240*5.4-600*1.8=216'),
q(9,'sulit','Dua kelompok mengangkat peti seberat 900 N memakai katrol berbeda. Kelompok A: tiga ruas penopang dengan efisiensi 90%. Kelompok B: empat ruas penopang dengan efisiensi 75%. Selisih gaya nyata kedua kelompok paling mendekati ...', ['16,7 N','33,3 N','50 N','66,7 N','100 N'],'B','FA = 900/(3 × 0,90) ≈ 333,3 N. FB = 900/(4 × 0,75) = 300 N. Selisih ≈ 33,3 N.',proof='900/(3*.9)-900/(4*.75)=33.333333333'),
q(10,'sulit','Pada katrol di gambar, beban seberat 1.500 N dinaikkan dengan gaya konstan 300 N. Efisiensi sistem paling dekat dengan nilai ...', ['66,7%','75,0%','80,0%','83,3%','90,0%'],'D','Ada enam ruas penopang. Efisiensi = 1.500/(6 × 300) × 100% = 83,3%.',diagram=6,proof='1500/(6*300)=.83333333'),
q(11,'sulit','Dalam uji alat beruas empat, seorang siswa menarik tali dengan gaya 240 N untuk menaikkan beban setinggi 2,4 m. Efisiensi alat 75% dan g = 10 m/s². Berapa massa bebannya?', ['54 kg','60 kg','72 kg','80 kg','96 kg'],'C','s = 4 × 2,4 = 9,6 m. Masukan = 240 × 9,6 = 2.304 J, keluaran = 0,75 × 2.304 = 1.728 J. Berat = 1.728/2,4 = 720 N; massa = 72 kg.',proof='.75*240*4/10=72'),
q(12,'sulit','Sebuah peti 720 N dinaikkan dengan dua sistem ideal secara bergantian. Sistem pertama memiliki tiga ruas dan menaikkan peti 0,8 m, lalu sistem kedua memiliki empat ruas dan menaikkan peti 1,2 m. Pasangan (total tarikan tali; selisih besar gaya kedua sistem) yang benar adalah ...', ['6,0 m; 60 N','7,2 m; 60 N','7,2 m; 120 N','8,0 m; 60 N','8,0 m; 120 N'],'B','Total tali = 3 × 0,8 + 4 × 1,2 = 7,2 m. Gaya pertama = 720/3 = 240 N; kedua = 720/4 = 180 N; selisih = 60 N.',proof='3*.8+4*1.2=7.2;720/3-720/4=60'),
q(13,'sulit','Sebuah sistem seperti pada gambar dipakai menarik muatan 1.000 N. Panjang tali yang dapat ditarik maksimal 8 m, dan gaya tarik nyata adalah 250 N. Jika gaya tetap dan tali ditarik seluruhnya, berapa energi yang tidak berubah menjadi kenaikan energi potensial muatan?', ['200 J','250 J','300 J','400 J','500 J'],'D','Ada lima ruas penopang. Kenaikan beban = 8/5 = 1,6 m. Masukan = 250 × 8 = 2.000 J, keluaran = 1.000 × 1,6 = 1.600 J; selisih = 400 J.',diagram=5,proof='250*8-1000*(8/5)=400'),
q(14,'sulit','Muatan 960 N harus dinaikkan setinggi 2 m. Tersedia sistem ideal yang dapat diatur jumlah ruas penopangnya. Gaya pekerja tidak boleh melebihi 180 N dan panjang tali yang dapat ditarik paling jauh 12 m. Sistem manakah yang dapat digunakan?', ['4 ruas','5 ruas','6 ruas','7 ruas','8 ruas'],'C','Syarat gaya: n ≥ 960/180 ≈ 5,33, jadi minimal 6 ruas. Syarat tali: n × 2 ≤ 12, jadi maksimal 6 ruas. Tepat 6 ruas.',proof='960/6=160;6*2=12'),
q(15,'sulit','Dua sistem katrol nyata dipakai mengangkat beban yang sama, 720 N. Sistem P memiliki tiga ruas penopang dan efisiensi 80%; sistem Q memiliki empat ruas dan efisiensi 75%. Perbandingan gaya tarik nyata P : Q adalah ...', ['4 : 5','5 : 4','3 : 4','4 : 3','2 : 1'],'B','FP = 720/(3 × 0,8) = 300 N. FQ = 720/(4 × 0,75) = 240 N. Perbandingan 300 : 240 = 5 : 4.',proof='(720/(3*.8))/(720/(4*.75))=1.25'),
q(16,'sulit','Pada susunan seperti gambar, gaya tarik konstan terukur sebesar 250 N dan efisiensi alat 90%. Jika g = 10 m/s², berapa massa benda yang dapat terangkat perlahan?', ['72 kg','80 kg','90 kg','100 kg','112,5 kg'],'C','Ada empat ruas penopang. Berat W = efisiensi × KM ideal × F = 0,9 × 4 × 250 = 900 N. Massa = 900/10 = 90 kg.',diagram=4,proof='.9*4*250/10=90'),
q(17,'sulit','Untuk mengangkat peti 1.000 N setinggi 1,5 m digunakan alat beruas lima. Catatan pengujian menyebut energi yang terbuang akibat gesekan selama pengangkatan sebesar 375 J. Jika tarikan stabil, berapakah gaya tarik rata-rata yang dibutuhkan?', ['200 N','225 N','250 N','275 N','300 N'],'C','Usaha berguna = 1000 × 1,5 = 1.500 J. Masukan = 1.500 + 375 = 1.875 J. Tali ditarik 5 × 1,5 = 7,5 m. F = 1.875/7,5 = 250 N.',proof='(1000*1.5+375)/(5*1.5)=250'),
q(18,'sulit','Seorang siswa mencatat percobaan katrol: beban 1.200 N naik 1 m; rangkaian memiliki empat ruas penopang; gaya pada ujung tali 250 N dan tali ditarik 4 m. Jika hanya katrol dan tali pasif yang digunakan, kesimpulan paling tepat adalah ...', ['alat memiliki efisiensi 83,3%','data menunjukkan sistem ideal dengan KM = 4','usaha masukan lebih besar 200 J daripada keluaran','setidaknya ada satu data pengukuran keliru karena usaha keluaran melebihi masukan','gaya 250 N selalu cukup untuk beban 1.200 N'],'D','Masukan = 250 × 4 = 1.000 J, tetapi keluaran = 1.200 × 1 = 1.200 J. Efisiensi >100% tidak mungkin untuk katrol pasif, sehingga ada data yang salah. Tidak tepat menganggap alat menciptakan energi.',proof='250*4=1000<1200*1'),
q(19,'sulit','Pada gambar, alat mengangkat peti 1.500 N setinggi 1,2 m dengan efisiensi 80%. Pasangan (panjang tali yang harus ditarik; gaya tarik nyata) yang benar adalah ...', ['6,0 m; 250 N','7,2 m; 250 N','7,2 m; 312,5 N','8,4 m; 312,5 N','8,4 m; 375 N'],'C','Diagram memiliki enam ruas penopang. Panjang tali = 6 × 1,2 = 7,2 m. F = 1.500/(6 × 0,8) = 312,5 N.',diagram=6,proof='6*1.2=7.2;1500/(6*.8)=312.5'),
q(20,'sulit','Sebuah generator 1.050 N akan dinaikkan 2 m. Dua katrol nyata tersedia: sistem A memiliki tiga ruas dengan efisiensi 90%, sistem B memiliki lima ruas dengan efisiensi 70%. Pernyataan yang benar adalah ...', ['A memerlukan gaya lebih kecil dan usaha masukan lebih kecil','B memerlukan gaya lebih kecil, tetapi usaha masukan lebih besar','B memerlukan gaya lebih besar dan usaha masukan lebih besar','kedua sistem membutuhkan gaya dan usaha masukan yang sama','A memerlukan usaha masukan lebih besar walau efisiensinya lebih tinggi'],'B','FA = 1050/(3 × 0,9) ≈ 388,9 N; FB = 1050/(5 × 0,7) = 300 N. Usaha masukan A = 2100/0,9 ≈ 2333,3 J; B = 2100/0,7 = 3000 J. Jadi B lebih ringan ditarik tetapi lebih boros usaha.',proof='1050/(3*.9)>1050/(5*.7); 2100/.9<2100/.7'),
]

# SVG drawing: one contiguous rope path through alternating upper fixed and lower moving pulleys.
def pulley_svg(n):
    assert 1<=n<=10
    xx=lambda i: 75+i*62
    top=70; bottom=171; rad=21
    is_even=(n%2==0)
    moving_i=[i for i in range(1,n+1) if (i%2==1 if is_even else i%2==0)]
    fixed_i=[i for i in range(1,n+1) if i not in moving_i]
    # n odd: moving anchor is at left; n even: fixed anchor at left.
    path=[]
    if is_even:
        path.append('M 35 37')
    else:
        path.append('M 35 201')
    for i in range(1,n+1):
        x=xx(i)
        if i in moving_i:
            path.append(f'L {x-rad} {bottom}')
            path.append(f'Q {x} {bottom+rad*2} {x+rad} {bottom}')
        else:
            path.append(f'L {x-rad} {top}')
            path.append(f'Q {x} {top-rad*2} {x+rad} {top}')
    # Last pulley is always fixed, irrespective parity.
    xf=xx(n)+rad
    path.append(f'L {xf} 244')
    max_x=max(735,xf+93)
    center=round((min([xx(i) for i in moving_i]+([35] if not is_even else [])) + max([xx(i) for i in moving_i]+([35] if not is_even else [])))/2) if moving_i else 35
    svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{max_x}" height="290" viewBox="0 0 {max_x} 290">',
      f'<rect width="{max_x}" height="290" rx="18" fill="#F4F8FC"/>',
      f'<line x1="24" y1="25" x2="{max_x-28}" y2="25" stroke="#394B68" stroke-width="10" stroke-linecap="round"/>',
      f'<line x1="24" y1="25" x2="{max_x-28}" y2="25" stroke="#8BA2BC" stroke-width="2" stroke-dasharray="5 9"/>']
    for i in fixed_i:
        x=xx(i)
        svg.append(f'<line x1="{x}" y1="29" x2="{x}" y2="{top-21}" stroke="#51637E" stroke-width="4"/>')
    if is_even:
        svg.append('<circle cx="35" cy="37" r="6" fill="#1E3A8A"/>')
    if moving_i:
        left=min([xx(i) for i in moving_i]+([35] if not is_even else []))-18
        right=max([xx(i) for i in moving_i]+([35] if not is_even else []))+18
        for i in moving_i:
            x=xx(i)
            svg.append(f'<line x1="{x}" y1="{bottom+21}" x2="{x}" y2="228" stroke="#546B8C" stroke-width="4"/>')
        svg.append(f'<rect x="{left}" y="223" width="{right-left}" height="10" rx="4" fill="#536D95"/>')
        center=(left+right)/2
    else:
        center=35
        svg.append('<line x1="35" y1="201" x2="35" y2="224" stroke="#546B8C" stroke-width="5"/>')
    svg.append(f'<line x1="{center}" y1="230" x2="{center}" y2="246" stroke="#354B6B" stroke-width="4"/>')
    svg.append(f'<rect x="{center-37}" y="245" width="74" height="30" rx="6" fill="#233B68"/>')
    svg.append(f'<text x="{center}" y="264" fill="white" font-family="DejaVu Sans" font-size="12" text-anchor="middle">BEBAN</text>')
    for i in range(1,n+1):
        x=xx(i); y=bottom if i in moving_i else top
        fill='#FFF4D5' if i in moving_i else '#DBEAFE'
        svg.append(f'<circle cx="{x}" cy="{y}" r="{rad}" fill="{fill}" stroke="#334965" stroke-width="5"/>')
        svg.append(f'<circle cx="{x}" cy="{y}" r="5.5" fill="#475F7A"/>')
    if not is_even:
        svg.append('<circle cx="35" cy="201" r="5" fill="#1E3A8A"/>')
    svg.append(f'<path d="{" ".join(path)}" fill="none" stroke="#0284C7" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>')
    svg.append(f'<path d="M {xf-6} 231 L {xf} 244 L {xf+6} 231" fill="none" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>')
    svg.append(f'<text x="{xf+17}" y="232" fill="#164E83" font-family="DejaVu Sans" font-size="17" font-weight="bold">F</text>')
    svg.append(f'<line x1="{center}" y1="278" x2="{center}" y2="288" stroke="#7A4D31" stroke-width="3"/>')
    svg.append('</svg>')
    return ''.join(svg)
for n in range(1,11): (ROOT/'assets'/f'katrol_{n}_ruas.svg').write_text(pulley_svg(n),encoding='utf-8')

# Material data output, with relative web static files refs; difficulty should not be displayed in test.
for package,arr,comps in [('B',B,{'mudah':6,'sedang':8,'sulit':6}),('C',C,{'mudah':2,'sedang':6,'sulit':12})]:
    assert len(arr)==20
    assert [v['id'] for v in arr]==list(range(1,21))
    assert {k:sum(q['difficulty']==k for q in arr) for k in comps}==comps
    assert len({q['text'] for q in arr})==20
    for v in arr:
        if v['diagram'] is not None:
            v['image']=f'/studywithbro/katrol/katrol_{v["diagram"]}_ruas.svg'
        else: v['image']=None
    output={'slug':f'katrol-{package.lower()}', 'title':f'Latihan {package} - Katrol', 'numberOfQuestions':20,'pointsPerCorrect':5,'questions':[{k:vv for k,vv in v.items() if k not in ('difficulty','proof','diagram')} for v in arr]}
    (ROOT/'data'/f'latihan_{package.lower()}_katrol.json').write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf-8')

font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
pdfmetrics.registerFont(TTFont('DejaVu',font))
pdfmetrics.registerFont(TTFont('DejaVuBold',bold))
NAVY=HexColor('#1E3557'); BLUE=HexColor('#086CA7'); PALE=HexColor('#EEF5FA'); DIM=HexColor('#4B5B6D'); LIGHT=HexColor('#D9E7F1'); GREEN=HexColor('#237B60'); BG=HexColor('#F5F9FC')
styles={
'h1':ParagraphStyle('Title',fontName='DejaVuBold',fontSize=23,leading=30,textColor=NAVY,spaceAfter=11),
'h2':ParagraphStyle('H2',fontName='DejaVuBold',fontSize=13.8,leading=20,textColor=NAVY,spaceAfter=9),
'body':ParagraphStyle('Body',fontName='DejaVu',fontSize=9.3,leading=15.2,textColor=NAVY),
'small':ParagraphStyle('Small',fontName='DejaVu',fontSize=8.3,leading=12.8,textColor=DIM),
'question':ParagraphStyle('Question',fontName='DejaVu',fontSize=10,leading=16.5,textColor=NAVY),
'option':ParagraphStyle('Option',fontName='DejaVu',fontSize=9.2,leading=14,textColor=NAVY),
'exp':ParagraphStyle('Explanation',fontName='DejaVu',fontSize=8.7,leading=14.5,textColor=NAVY),
'key':ParagraphStyle('Key',fontName='DejaVuBold',fontSize=10,leading=14.5,textColor=BLUE),
'cover':ParagraphStyle('Cover',fontName='DejaVuBold',fontSize=27,leading=36,textColor=NAVY),
}

def p(text,style='body'):
    return Paragraph(escape(text).replace('\n','<br/>'), styles[style])
class Diagram(Flowable):
    def __init__(self,n,w=452):
        Flowable.__init__(self);self.n=n;self.width=w;self.height=w*290/735+2
    def draw(self):
        g=svg2rlg(str(ROOT/'assets'/f'katrol_{self.n}_ruas.svg'))
        targetw=self.width
        scale=targetw/g.width
        self.canv.saveState();self.canv.scale(scale,scale);renderPDF.draw(g,self.canv,0,0);self.canv.restoreState()

def footer(canvas, doc):
    canvas.setFont('DejaVu',7.4); canvas.setFillColor(DIM)
    canvas.drawString(18*mm,13*mm,'studywithbro  /  IPA · Fisika · Katrol')
    canvas.drawRightString(192*mm,13*mm,str(doc.page))
    canvas.setStrokeColor(LIGHT);canvas.line(18*mm,16.5*mm,192*mm,16.5*mm)

def box_line(text):
    return Table([[p(text,'small')]],colWidths=[171*mm],style=[('BACKGROUND',(0,0),(-1,-1),PALE),('BOX',(0,0),(-1,-1),0.5,LIGHT),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),('LEFTPADDING',(0,0),(-1,-1),12)])

def question_flow(v):
    # use keepTogether per question: dynamic page breaks avoid clipping.
    number=Paragraph(f'<font color="#0873A9"><b>{v["id"]:02d}</b></font>',styles['question'])
    t=Table([[number,p(v['text'],'question')]],colWidths=[12*mm,159*mm])
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),4),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    parts=[t]
    if v['diagram']:
        parts.append(Diagram(v['diagram'],w=420));parts.append(Spacer(1,5))
    ops=[[p(opt['id']+'.','option'),p(opt['text'],'option')] for opt in v['options']]
    optable=Table(ops,colWidths=[11*mm,160*mm],hAlign='LEFT')
    optable.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),2.5),('BOTTOMPADDING',(0,0),(-1,-1),2.5),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),5)]))
    parts.append(optable);parts.append(Spacer(1,5));parts.append(HRFlowable(width='100%',thickness=.55,color=LIGHT,spaceBefore=4,spaceAfter=12))
    return KeepTogether(parts)

def build_pdf(pack,arr,mode='questions'):
    title=f'Studywithbro_Paket_{pack}_{"Soal" if mode=="questions" else "Kunci_Pembahasan"}.pdf'
    output=ROOT/'pdf'/title
    doc=SimpleDocTemplate(str(output),pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=21*mm,bottomMargin=21*mm, title=f'studywithbro - Paket {pack} Katrol', author='studywithbro', pageCompression=1)
    story=[]
    story.append(Spacer(1,10*mm))
    story.append(p('studywithbro','h2'))
    story.append(Spacer(1,8*mm))
    story.append(p(f'PAKET {pack}','cover'))
    story.append(p('20 SOAL KATROL' if mode=='questions' else 'KUNCI & PEMBAHASAN','cover'))
    story.append(Spacer(1,5*mm))
    story.append(p('Latihan IPA kelas VIII · Format pilihan ganda A–E · Satu jawaban benar','body'))
    story.append(Spacer(1,8*mm))
    if mode=='questions':
        story.append(box_line('Petunjuk: kerjakan semua soal. Pilih satu jawaban A–E paling tepat. Setiap jawaban benar bernilai 5 poin. Jangan buka berkas pembahasan sebelum selesai.'))
        story.append(Spacer(1,6*mm))
        story.append(p('Nama: ............................................................    Tanggal: ....................................','body'))
        story.append(Spacer(1,4*mm))
        story.append(p('Kecuali dinyatakan lain: sistem katrol ideal, tanpa gesekan, beban bergerak perlahan, massa tali dan katrol diabaikan. Ruas tali penopang adalah ruas yang menyangga bagian bergerak bersama beban.','small'))
        story.append(Spacer(1,5*mm))
        story.append(p('Catatan: soal ini orisinal, tidak diklaim sebagai naskah ujian TKA resmi.','small'))
    else:
        story.append(box_line('Untuk pengajar: kunci dikumpulkan terpisah dari lembar soal. Pembahasan disiapkan untuk review setelah seluruh jawaban diserahkan.'))
        story.append(Spacer(1,8*mm))
        rows=[]
        for row in range(0,20,5):rows.append([f'{i+1:02d}: {arr[i]["correctAnswer"]}' for i in range(row,row+5)])
        tt=Table(rows,colWidths=[34.2*mm]*5,rowHeights=12*mm)
        tt.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),PALE),('GRID',(0,0),(-1,-1),0.4,LIGHT),('TEXTCOLOR',(0,0),(-1,-1),NAVY),('FONTNAME',(0,0),(-1,-1),'DejaVuBold'),('FONTSIZE',(0,0),(-1,-1),11),('ALIGN',(0,0),(-1,-1),'CENTER')]))
        story.append(tt)
        story.append(Spacer(1,6*mm))
        story.append(p('Skor = jumlah benar × 5, maksimum 100.','small'))
    story.append(PageBreak())
    if mode=='questions':
        for v in arr:story.append(question_flow(v))
        story.append(PageBreak());story.append(Spacer(1,5*mm));story.append(p('LEMBAR JAWABAN','h2'))
        rows=[['No','Jawaban','No','Jawaban']]
        for i in range(1,11):rows.append([f'{i:02d}','A / B / C / D / E',f'{i+10:02d}','A / B / C / D / E'])
        t=Table(rows,colWidths=[17*mm,68*mm,17*mm,68*mm],rowHeights=11*mm)
        t.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),'DejaVu'),('FONTSIZE',(0,0),(-1,-1),9),('BACKGROUND',(0,0),(-1,0),PALE),('GRID',(0,0),(-1,-1),0.5,LIGHT),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),7)]))
        story.append(t)
    else:
        story.append(p('PEMBAHASAN NOMOR 01–20','h2'))
        for v in arr:
            inner=[p(f'{v["id"]:02d}  /  {v["correctAnswer"]}','key'),Spacer(1,1.5*mm),p(v['explanation'],'exp'),Spacer(1,4*mm),HRFlowable(width='100%',thickness=0.5,color=LIGHT,spaceAfter=9)]
            story.append(KeepTogether(inner))
        story.append(Spacer(1,6*mm))
        story.append(p('Rujukan konsep','h2'))
        story.append(p('OpenStax Physics 9.3 Simple Machines — https://openstax.org/books/physics/pages/9-3-simple-machines','small'))
        story.append(Spacer(1,2*mm))
        story.append(p('Kemendikdasmen — materi pesawat sederhana / katrol: https://repositori.kemendikdasmen.go.id/9581/1/SD_KELAS_TINGGI_KK_E.pdf','small'))
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    return output

for pack,arr in [('B',B),('C',C)]:
    for mode in ('questions','answers'):
        outfile=build_pdf(pack,arr,mode)
        print('Created PDF:',outfile,round(outfile.stat().st_size/1024),'KB')

print('KEYS', 'B',' '.join(v['correctAnswer'] for v in B),'C',' '.join(v['correctAnswer'] for v in C))
