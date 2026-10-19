# Website Kafe Personal

Website landing page untuk kafe dengan palet kopi gelap, krem hangat, dan aksen karamel. Dibuat menggunakan HTML5, CSS3, dan Vanilla JavaScript tanpa framework atau backend.

## Menjalankan website

1. Ekstrak ZIP.
2. Buka folder `website-kafe-personal`.
3. Buka `index.html` di browser. Tidak perlu instalasi atau build.
4. Untuk pengujian yang lebih mendekati hosting, jalankan folder ini menggunakan ekstensi server lokal sederhana atau unggah ke hosting statis.

## Struktur file

- `index.html` — struktur semantik dan konten website.
- `assets/css/style.css` — seluruh desain, responsive layout, dan animasi.
- `assets/js/main.js` — menu mobile, smooth scroll, scroll reveal, filter menu, konfigurasi kontak, dan copyright.
- `assets/images/` — aset lokal. Saat ini berisi `coffee-beans-bg.webp`, foto biji kopi yang dipakai sebagai latar hero dan dipanggil lewat variabel `--img-hero`.

## Mengubah identitas kafe

Buka `index.html`, lalu cari dan ganti:
- `Nama Kafe`
- tagline pada brand
- judul dan deskripsi hero
- teks tentang kafe
- footer dan meta description

Nama kafe muncul pada title halaman, navbar, dan footer. Sesuaikan seluruh kemunculannya agar konsisten.

## Mengganti menu dan harga

Di `index.html`, cari bagian `id="menu"`. Setiap menu adalah elemen `<article class="menu-card">`.

- Ubah nama di `<h3>`.
- Ubah deskripsi di paragraf menu.
- Ubah harga di elemen `.price`.
- Ubah foto pada atribut `src` dan teks alternatif pada `alt`.
- Ubah kategori di `data-category` menjadi `coffee`, `non-coffee`, atau `food`.
- Untuk menambah menu, salin satu blok `<article class="menu-card">...</article>` dan edit isinya.
- Untuk menghapus menu, hapus satu blok artikel tersebut.

Harga yang tersedia saat ini hanyalah contoh, bukan harga bisnis nyata.

## Mengganti foto

Foto awal menggunakan URL gambar eksternal Unsplash dan membutuhkan koneksi internet. Untuk memakai foto lokal:

1. Simpan foto milik kafe di `assets/images/`, misalnya `hero-cafe.webp`.
2. Ubah `src` gambar yang sesuai menjadi `assets/images/hero-cafe.webp`.
3. Pertahankan atribut `alt` yang menjelaskan foto.
4. Gunakan gambar yang dikompresi dan berukuran wajar. WebP direkomendasikan.
5. Pastikan rasio gambar cocok dengan tempatnya; CSS menggunakan `object-fit: cover`.

Sebagian foto masih memakai URL Unsplash sehingga membutuhkan koneksi internet, kecuali latar hero yang sudah tersimpan lokal di `assets/images/coffee-beans-bg.webp`. Jika gambar eksternal gagal dimuat, layout tetap terjaga, tetapi foto tentu tidak akan tampil.

## Mengubah warna tema

Buka `assets/css/style.css`, lalu edit CSS variables di bagian `:root`. Palet utama:

- `--espresso` — dasar gelap halaman (juga dipakai sebagai `theme-color` di `index.html`).
- `--coffee-dark`, `--coffee-brown` — lapisan cokelat untuk section dan kartu.
- `--caramel`, `--caramel-soft` — aksen tombol, garis, dan highlight.
- `--cream`, `--cream-deep`, `--off-white` — latar terang dan teks di atas latar gelap.
- `--text-muted`, `--eyebrow-dark` — teks sekunder.
- `--ink`, `--muted` — teks gelap pada section krem.

Efek kaca diatur oleh `--glass-bg`, `--glass-bg-strong`, `--glass-border`, `--glass-border-strong`, `--glass-dark`, `--glass-dark-strong`, dan `--glass-blur`. Bila perangkat tidak mendukung `backdrop-filter`, CSS otomatis memakai latar solid (lihat bagian fallback di akhir file).

Alias lama (`--coffee`, `--coffee-soft`, `--cream-light`, `--orange`, `--rust`, `--line`) tetap tersedia dan mengarah ke token baru, jadi aturan lama tidak rusak. Sebaiknya ubah token utama agar warna berubah konsisten di seluruh halaman. Gunakan kontras warna yang cukup agar teks tetap mudah dibaca.

## Mengubah latar hero dan font

Latar hero memakai variabel `--img-hero` di `:root`:

```css
--img-hero: url("../images/coffee-beans-bg.webp");
```

Untuk memakai foto sendiri, simpan berkas di `assets/images/` (WebP, lebar sekitar 2000px, kompresi wajar), lalu sesuaikan nama berkasnya. Setelah diganti, perbarui juga `<link rel="preload" as="image">` di `index.html` agar foto tetap dimuat lebih awal, dan sesuaikan `--espresso` supaya overlay gelap di hero tetap kontras.

Font dimuat dari Google Fonts lewat `<link>` di `index.html` (DM Sans untuk teks, Playfair Display untuk judul). Pemakaiannya ditentukan variabel `--font-body` dan `--font-display` di `:root`. Untuk font lokal, simpan berkas font di `assets/`, tambahkan `@font-face` di bagian atas `style.css`, lalu ubah kedua variabel tersebut.

## Mengatur kontak, lokasi, dan jam operasional

Buka `assets/js/main.js`, cari fungsi `initContactLinks()`, lalu edit object `config`:

- `whatsapp`: nomor WhatsApp dengan kode negara, tanpa `+`, spasi, atau tanda baca.
- `email`: alamat email yang benar.
- `instagram`: URL akun Instagram resmi.
- `maps`: URL Google Maps resmi untuk lokasi kafe.
- `address`: alamat lengkap kafe.
- `hours`: jam operasional.
- `phone`: nomor yang ditampilkan di bagian informasi.
- `whatsappMessage`: pesan awal WhatsApp.

Biarkan nilai tautan kosong jika belum tersedia. Tombol yang belum dikonfigurasi akan memberi pemberitahuan dan tidak berpura-pura telah menghubungkan pengunjung ke bisnis nyata.

## Mengatur kategori

Filter menggunakan atribut `data-filter` pada tombol dan `data-category` pada setiap `.menu-card`. Nilai kategori yang digunakan: `all`, `coffee`, `non-coffee`, dan `food`. Jika menambah kategori, sesuaikan tombol dan logika `initMenuFilter()` di JavaScript.

## Mengatur animasi

Durasi dan kurva gerak memakai variabel `--dur-xs` sampai `--dur-lg` serta `--ease`, `--ease-out`, dan `--ease-soft`. Animasi muncul (`.reveal`, `.reveal-delay`) dijalankan `initScrollReveal()` dengan IntersectionObserver dan hanya menganimasikan `opacity` juga `transform`, sehingga tidak menggeser layout.

Bila pengguna mengaktifkan `prefers-reduced-motion`, seluruh transisi dan animasi dimatikan otomatis.

## Menguji responsive dan interaksi

Uji setidaknya pada lebar 320px, 375px, 768px, 1024px, dan desktop lebar.

Checklist:
- Menu tiga titik dibuka dan ditutup dengan mouse dan sentuhan.
- Menu menutup saat link dipilih, klik di luar panel, atau tombol Escape ditekan.
- Fokus keyboard terlihat.
- Filter kategori menampilkan menu yang sesuai.
- Anchor navigasi menuju section yang benar.
- Foto tidak meluber ke luar layar.
- Tombol kontak belum dikonfigurasi tidak mengarah ke tujuan palsu.
- Periksa console browser untuk error.

Website menghormati `prefers-reduced-motion`. Konten utama tetap memiliki styling dasar jika JavaScript tidak aktif; animasi reveal hanya diaktifkan setelah JavaScript berjalan.

## Publikasi ke hosting statis

Unggah `index.html`, folder `assets/`, dan `README.md` ke document root hosting statis (sering bernama `public_html`). Pastikan struktur folder tetap sama dan URL file CSS/JS tidak berubah. Tidak diperlukan PHP atau database.

## Catatan

- Tidak ada backend, database, login, keranjang, checkout, atau pemrosesan pembayaran.
- Teks menu dan harga adalah contoh yang harus diperiksa sebelum website dipublikasikan.
- Foto eksternal membutuhkan internet. Untuk website produksi, lebih baik gunakan foto yang memang dimiliki atau sudah mendapat izin, lalu simpan secara lokal.
