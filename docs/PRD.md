# PRD — Product Requirements Document
## TopUpKu (Web Top Up Game)

### 1. Ringkasan

TopUpKu adalah website top up game (Mobile Legends, Free Fire, PUBG Mobile, dst) di mana user beli diamond/UC/voucher, bayar, dan item **otomatis masuk** ke akun game mereka dalam hitungan detik sampai beberapa menit — tanpa campur tangan admin.

### 2. Masalah yang Diselesaikan

- Top up manual (via chat WA admin) lambat dan tidak bisa diandalkan di luar jam kerja.
- User butuh kepastian status transaksi real-time, bukan nunggu balasan chat.
- Owner butuh sistem yang bisa jalan 24/7 tanpa harus standby proses order.

### 3. Tujuan

- Auto-fulfillment: dari bayar sampai item masuk, tanpa aksi manual admin di jalur normal.
- Waktu proses target: **< 1 menit** untuk 90% transaksi (tergantung SLA distributor).
- Status transaksi bisa dicek user kapan saja tanpa login (pakai nomor invoice).

### 4. Target Pengguna

- **Pembeli** — pemain game usia 13–30 tahun, mayoritas akses dari HP, ingin proses cepat dan murah.
- **Admin/Owner** — 1–2 orang, butuh dashboard buat pantau transaksi, atur harga, dan retry kalau ada yang gagal.

### 5. Ruang Lingkup

**MVP (Fase 1 — wajib ada sebelum launch):**
- Katalog game & daftar nominal/produk
- Checkout tanpa wajib login (guest checkout)
- Pembayaran via Midtrans Snap (QRIS, e-wallet, VA)
- Auto top up via Digiflazz setelah pembayaran sukses
- Halaman cek status transaksi pakai nomor invoice
- Dashboard admin dasar (lihat transaksi, kelola produk & harga, retry manual)

**Fase 2 (setelah MVP jalan):**
- Login member + riwayat transaksi tersimpan
- Notifikasi WhatsApp otomatis (status berubah)
- Kode voucher/diskon
- Cek nickname otomatis dari Player ID (kalau game & distributor mendukung)
- Rating/testimoni transaksi

**Di luar scope (tidak dibangun dulu):**
- Aplikasi mobile native
- Sistem afiliasi/reseller berjenjang
- Multi-currency / pembayaran luar negeri

### 6. Fitur Utama

**A. Customer-facing**
1. Landing page dengan daftar game (search + kategori)
2. Halaman detail game — pilih nominal/denominasi
3. Form input Player ID (+ Zone ID/Server ID jika game memerlukan)
4. Ringkasan pesanan & pilih metode pembayaran
5. Halaman menunggu pembayaran (QR code / instruksi VA)
6. Halaman status transaksi real-time (auto-refresh tiap beberapa detik)
7. (Fase 2) Riwayat transaksi untuk member yang login

**B. Admin**
1. Login admin (terpisah dari customer)
2. Kelola daftar game & produk (nama, harga beli dari distributor, harga jual, markup, aktif/nonaktif)
3. Daftar semua transaksi + filter status (pending/diproses/sukses/gagal)
4. Retry manual untuk transaksi yang gagal auto-proses
5. Laporan omzet sederhana (harian/bulanan)

**C. Sistem/Otomatisasi (tidak terlihat user, tapi krusial)**
1. Webhook penerima notifikasi dari Midtrans saat pembayaran sukses/gagal/expired
2. Auto-panggil API Digiflazz begitu pembayaran dikonfirmasi sukses
3. Webhook/callback penerima update status dari Digiflazz
4. Semua request & response dari payment gateway dan distributor disimpan mentah (untuk audit/dispute)
5. Auto-expire pesanan yang tidak dibayar dalam waktu tertentu (misal 1 jam)

### 7. User Flow (jalur normal)

1. User pilih game → pilih nominal → isi Player ID (+ Zone ID) → klik lanjut
2. User pilih metode pembayaran → sistem generate order + kirim ke Midtrans
3. User bayar (QRIS/VA/e-wallet)
4. Midtrans kirim webhook "payment sukses" ke server → status order jadi `processing`
5. Server panggil API Digiflazz untuk eksekusi top up
6. Digiflazz proses ke server game, lalu kirim callback status ke server
7. Server update status order jadi `success` atau `failed`
8. User melihat status berubah otomatis di halaman status transaksi (tanpa refresh manual)
9. Jika gagal: order masuk antrian "perlu retry" di dashboard admin

### 8. Requirement Non-Fungsional

- Endpoint webhook harus membalas dalam < 3 detik (gateway & distributor biasanya retry/timeout kalau lambat)
- Semua endpoint publik pakai HTTPS
- Verifikasi signature wajib di setiap webhook (jangan percaya payload begitu saja)
- Semua secret (API key Midtrans, Digiflazz) disimpan di environment variable, tidak pernah di kode/frontend
- Sistem harus tetap mencatat transaksi meski salah satu pihak ketiga sedang down (retry queue)

### 9. Asumsi & Risiko

- **Asumsi:** akun merchant Midtrans dan akun reseller Digiflazz sudah/akan didaftarkan sebelum development payment dimulai.
- **Risiko:** SLA kecepatan top up bergantung penuh ke Digiflazz — bukan sesuatu yang bisa dipercepat dari sisi kode kita.
- **Risiko:** kalau Player ID salah input dan tidak ada validasi nickname, top up bisa nyasar ke akun orang lain — perlu konfirmasi ulang di UI sebelum checkout.

### 10. Ketergantungan Pihak Ketiga

| Pihak Ketiga | Fungsi | Catatan |
|---|---|---|
| Midtrans | Payment gateway | Perlu akun merchant + Server Key & Client Key |
| Digiflazz | Distributor H2H top up game | Perlu akun reseller + saldo deposit + API key |
| Neon | Hosting database PostgreSQL | Free tier cukup untuk MVP |
| Vercel | Hosting frontend + backend serverless | Free tier cukup untuk MVP |
