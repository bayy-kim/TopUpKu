# CHECKLIST — TopUpKu

Centang urut dari atas. Jangan loncat fase — tiap fase butuh fase sebelumnya sudah jalan.

## Fase 0 — Setup

- [ ] Buat monorepo (`apps/web`, `apps/api`, `docs/`) sesuai struktur di `SAR.md`
- [ ] Init Git repo + `.gitignore` (node_modules, .env, dist)
- [ ] Buat database di Neon, simpan connection string (pooled)
- [ ] Daftar akun sandbox Midtrans, simpan Server Key & Client Key
- [ ] Daftar akun Digiflazz, simpan username & API key (mode sandbox/testing dulu)
- [ ] Isi `.env` di `apps/api` sesuai daftar di `SAR.md` bagian Environment Variables

## Fase 1 — Database & Backend Core

- [ ] Tulis `schema.prisma` sesuai skema di `SAR.md`
- [ ] Jalankan migrasi pertama (`prisma migrate dev`)
- [ ] Buat `seed.ts` — isi 2–3 game contoh + beberapa produk/nominal
- [ ] Setup Express app dasar (`app.ts`) + health check endpoint
- [ ] Endpoint `GET /api/games` dan `GET /api/games/:slug/products`

## Fase 2 — Order & Payment (Midtrans)

- [ ] Endpoint `POST /api/orders` — buat order status `pending`, generate `orderNumber` unik
- [ ] Integrasi Midtrans Snap — generate token pembayaran saat order dibuat
- [ ] Endpoint `POST /api/webhooks/midtrans` — verifikasi signature, update `paymentStatus`
- [ ] Simpan setiap notifikasi ke tabel `PaymentLog`
- [ ] Test end-to-end pakai sandbox Midtrans (bayar dummy → webhook masuk → status berubah)

## Fase 3 — Auto Top Up (Digiflazz)

- [ ] Buat `digiflazz.service.ts` — fungsi create transaction ke Digiflazz
- [ ] Panggil service ini otomatis begitu `paymentStatus` jadi `paid`
- [ ] Endpoint `POST /api/webhooks/digiflazz` — verifikasi signature, update `topupStatus`
- [ ] Simpan setiap request/response ke tabel `TopupLog`
- [ ] Test end-to-end pakai produk sandbox Digiflazz (kalau tersedia) atau nominal termurah di mode live

## Fase 4 — Frontend Customer

- [ ] Setup Vite + Tailwind, import token warna/font dari `DESIGN.md`
- [ ] Halaman katalog game (list + search)
- [ ] Halaman detail game — pilih nominal, input Player ID/Zone ID
- [ ] Halaman checkout — pilih metode bayar, tampilkan instruksi (QR/VA)
- [ ] Halaman status transaksi — polling otomatis tiap 3–5 detik sampai status final
- [ ] Validasi form (Player ID wajib diisi, dsb.) pakai React Hook Form + Zod

## Fase 5 — Admin Dashboard

- [ ] Endpoint & halaman login admin (JWT)
- [ ] Halaman list transaksi + filter status
- [ ] Tombol retry manual untuk transaksi `topupStatus: failed`
- [ ] CRUD produk & harga (tambah game/nominal baru, ubah harga jual)
- [ ] Laporan omzet sederhana (total transaksi sukses per hari/bulan)

## Fase 6 — Testing & QA

- [x] Test alur penuh dari awal: pilih produk → bayar → auto top up → status sukses
- [x] Test alur gagal: pembayaran expired, top up gagal dari distributor, retry manual
- [x] Test webhook dikirim dobel oleh gateway (pastikan tidak double-process)
- [x] Cek semua secret tidak ter-expose ke frontend (inspect network tab) — ⚠️ temuan: DB password di .env, JWT secret lemah
- [ ] Test tampilan di HP (mayoritas user akses dari mobile) — skipped, perlu akses fisik HP/emulator

## Fase 7 — Deploy ke Vercel

- [x] Buat `apps/api/api/index.ts` — Vercel serverless entry (export Express app)
- [x] Buat `apps/api/vercel.json` — routing semua request ke `api/index.ts`
- [x] Fix `midtrans.service.ts`: ganti `require('crypto')` → ESM `import { createHash }`
- [x] Fix CORS: `app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))`
- [x] Move `react-router-dom` ke `apps/web/package.json` (supaya bisa standalone deploy)
- [x] Hapus deps duplikat dari root `package.json`
- [x] Tambah `vercel-build` script di API: `prisma generate && tsc`
- [x] Tambah `FRONTEND_URL` ke `.env` untuk lokal
- [ ] Push repo ke GitHub
- [ ] Buat Vercel project untuk `apps/web` — build command: `npm run build`, output dir: `dist`
- [ ] Buat Vercel project untuk `apps/api` — root dir: `apps/api`, build command: `npm run vercel-build`
- [ ] Isi semua Environment Variables di dashboard Vercel (bukan commit file `.env`)
  - `DATABASE_URL`, `JWT_SECRET`, `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `DIGIFLAZZ_USERNAME`, `DIGIFLAZZ_API_KEY`, `FRONTEND_URL`
- [ ] Ganti Midtrans & Digiflazz dari sandbox ke mode production (setelah akun siap)
- [ ] Update URL webhook di dashboard Midtrans & Digiflazz ke domain Vercel backend
- [ ] Test transaksi asli dengan nominal terkecil sebelum diumumkan ke publik

## Fase 8 — Post-Launch (opsional)

- [ ] Login member + riwayat transaksi
- [ ] Notifikasi WhatsApp otomatis
- [ ] Kode voucher/diskon
- [ ] Monitoring error (Sentry) + alert kalau webhook gagal terus-menerus
