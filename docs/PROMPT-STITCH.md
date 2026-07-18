# PROMPT untuk Stitch

`DESIGN.md` tetap jadi patokan resmi (dipakai OpenCode buat Tailwind config nanti). File ini isinya terjemahan praktis dari `DESIGN.md` jadi prompt siap-paste ke Stitch (stitch.withgoogle.com), satu per layar.

Jalankan urut dari atas ke bawah — jangan loncat, karena tiap prompt bilang "style yang sama seperti sebelumnya".

---

## 0. Prompt Fondasi (wajib jalan duluan, sekali saja)

```
Buatkan style guide UI untuk website top up game bernama TopUpKu. Tema dark gaming-tech, latar hampir hitam (#0B0F19), satu warna aksen violet neon (#7C3AED) untuk semua tombol utama dengan teks putih di atasnya. Font heading Space Grotesk, font body Inter. Sudut membulat sedang (12px), tanpa shadow tebal, kedalaman dibuat dari beda warna latar (lebih terang sedikit untuk card) bukan dari bayangan. Badge status transaksi pakai hijau untuk sukses, kuning untuk pending, merah untuk gagal. Layout mobile-first, lebar konten maksimal 480px.
```

## 1. Halaman Katalog Game (landing page)

```
Pakai style yang sama seperti sebelumnya. Buatkan landing page website top up game. Ada: search bar di paling atas untuk cari game, grid/list card game (tiap card: ikon game, nama game, label singkat "Top up cepat"), dan tombol pada tiap card untuk masuk ke halaman detail. Tambahkan header sederhana berisi logo "TopUpKu".
```

## 2. Halaman Detail Game (pilih nominal + Player ID)

```
Pakai style yang sama seperti sebelumnya. Buatkan halaman detail game top up. Bagian atas: banner/ikon game + nama game. Di bawahnya: grid pilihan nominal/denominasi dalam bentuk card yang bisa dipilih (radio card), tiap card menampilkan nama nominal dan harga. Di bawah pilihan nominal: form input Player ID dan Zone ID/Server ID, dengan teks peringatan kecil "Pastikan Player ID dan Zone ID sudah benar sebelum lanjut". Tombol besar di paling bawah "Lanjut ke Pembayaran".
```

## 3. Halaman Checkout (pilih metode bayar)

```
Pakai style yang sama seperti sebelumnya. Buatkan halaman checkout/ringkasan pesanan. Tampilkan ringkasan di atas: nama game, nominal yang dipilih, Player ID, dan total harga. Di bawahnya, daftar metode pembayaran yang bisa dipilih (radio list): QRIS, e-wallet (ikon OVO/DANA/GoPay), dan Virtual Account bank (BCA/BRI/Mandiri). Tombol besar di bawah "Bayar Sekarang" menampilkan total harga di dalam tombolnya.
```

## 4. Halaman Menunggu Pembayaran

```
Pakai style yang sama seperti sebelumnya. Buatkan halaman menunggu pembayaran. Tampilkan QR code besar di tengah, di bawahnya nomor invoice dan countdown timer "Bayar dalam 14:59", dan badge status berwarna kuning bertuliskan "Menunggu Pembayaran". Tambahkan instruksi singkat cara scan QRIS dalam 3 langkah bernomor.
```

## 5. Halaman Status Transaksi

```
Pakai style yang sama seperti sebelumnya. Buatkan halaman cek status transaksi. Bagian atas: nomor invoice dan badge status besar di tengah (contoh: hijau "Berhasil"). Di bawahnya, detail transaksi dalam bentuk list: nama game, nominal, Player ID, waktu transaksi, metode pembayaran. Tambahkan teks kecil di bawah "Status akan otomatis diperbarui" untuk menandakan halaman ini auto-refresh.
```

## 6. Dashboard Admin

```
Pakai style yang sama seperti sebelumnya tapi versi dashboard desktop (bukan mobile-first). Buatkan halaman dashboard admin dengan sidebar navigasi kiri (menu: Dashboard, Transaksi, Produk, Logout). Konten utama: 3 summary card di atas (Total Transaksi Hari Ini, Omzet Hari Ini, Transaksi Pending), di bawahnya tabel daftar transaksi dengan kolom Nomor Invoice, Game, Nominal, Status (pakai badge warna), dan tombol aksi "Retry" untuk transaksi yang gagal. Tambahkan dropdown filter status di atas tabel.
```

---

**Setelah semua layar jadi:** hubungkan pakai fitur Prototypes di Stitch (urutan: Katalog → Detail → Checkout → Menunggu Pembayaran → Status), klik Play untuk cek alurnya. Lalu export HTML/CSS-nya dan lampirkan ke prompt OpenCode Fase 4 di `PROMPT-OPENCODE.md`.
