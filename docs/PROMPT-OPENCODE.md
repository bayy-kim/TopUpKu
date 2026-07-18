# PROMPT untuk OpenCode

Cara pakai: dari root folder project, jalankan `opencode run "..."` dengan flag `-f` untuk attach dokumen supaya OpenCode baca konteksnya dulu sebelum ngoding. Kerjakan **satu fase per prompt** — jangan gabung semua sekaligus, supaya hasilnya rapi dan gampang direview.

Setelah tiap fase selesai: buka `docs/CHECKLIST.md`, centang manual item yang sudah kelar, baru lanjut prompt fase berikutnya.

---

## 0. Prompt Pembuka (jalankan sekali di awal)

Paste ini dulu supaya OpenCode paham keseluruhan project sebelum mulai ngoding apa pun:

```
opencode run "Baca docs/PRD.md, docs/SAR.md, dan docs/CHECKLIST.md di attachment. Ini adalah project website top up game bernama TopUpKu. Jangan mulai coding apa pun dulu — cukup ringkas ke saya dalam 5-10 baris: (1) fitur utama yang kamu tangkap, (2) tech stack yang dipakai, (3) urutan fase pembangunan sesuai CHECKLIST.md. Saya mau konfirmasi pemahamanmu benar sebelum kita mulai Fase 0." -f docs/PRD.md -f docs/SAR.md -f docs/CHECKLIST.md
```

Kalau ringkasannya sudah benar, lanjut ke prompt Fase 0.

---

## Fase 0 — Setup Monorepo

```
opencode run "Setup monorepo untuk project TopUpKu sesuai struktur folder di SAR.md bagian 'Struktur Folder'. Buat apps/web (React+TypeScript+Vite+Tailwind, kosong dulu) dan apps/api (Node+Express+TypeScript+Prisma, kosong dulu), plus root package.json dengan workspaces. Buat .gitignore yang benar (node_modules, dist, .env). Jangan buat fitur apa pun dulu, cukup skeleton foldernya jalan (npm install sukses di kedua apps)." -f docs/SAR.md
```

---

## Fase 1 — Database & Backend Core

```
opencode run "Kerjakan Fase 1 di docs/CHECKLIST.md. Tulis schema.prisma di apps/api sesuai skema database di SAR.md bagian 4. Jalankan migrasi. Buat seed.ts dengan 2-3 game contoh (misal Mobile Legends, Free Fire) dan beberapa produk/nominal per game. Setup Express app dasar dengan health check endpoint, lalu buat endpoint GET /api/games dan GET /api/games/:slug/products sesuai daftar endpoint di SAR.md bagian 5." -f docs/SAR.md -f docs/CHECKLIST.md
```

---

## Fase 2 — Order & Payment (Midtrans)

```
opencode run "Kerjakan Fase 2 di docs/CHECKLIST.md. Buat endpoint POST /api/orders yang generate orderNumber unik, simpan order dengan paymentStatus pending, lalu integrasikan Midtrans Snap untuk generate token pembayaran. Buat endpoint POST /api/webhooks/midtrans yang verifikasi signature (SHA512 sesuai dokumentasi resmi Midtrans) dan update paymentStatus, serta simpan payload mentahnya ke tabel PaymentLog. Pastikan endpoint ini idempotent — kalau webhook yang sama terkirim dobel, jangan diproses ulang." -f docs/SAR.md -f docs/CHECKLIST.md
```

---

## Fase 3 — Auto Top Up (Digiflazz)

```
opencode run "Kerjakan Fase 3 di docs/CHECKLIST.md. Buat digiflazz.service.ts untuk create transaction ke Digiflazz, dipanggil otomatis begitu paymentStatus berubah jadi paid. Buat endpoint POST /api/webhooks/digiflazz untuk terima callback status top up, verifikasi signature, update topupStatus, dan simpan request/response mentah ke tabel TopupLog. Ini bagian paling kritis — pastikan tidak ada request dobel ke Digiflazz untuk order yang sama." -f docs/SAR.md -f docs/CHECKLIST.md
```

---

## Fase 4 — Frontend Customer

```
opencode run "Kerjakan Fase 4 di docs/CHECKLIST.md. Setup Tailwind config di apps/web memakai token warna, font, dan rounded dari docs/DESIGN.md. Buat halaman: katalog game, detail game (pilih nominal + input Player ID/Zone ID pakai React Hook Form + Zod), checkout (pilih metode bayar), dan halaman status transaksi yang polling GET /api/orders/:orderNumber tiap 3-5 detik sampai status final. Ikuti alur user flow di PRD.md bagian 7." -f docs/PRD.md -f docs/DESIGN.md -f docs/SAR.md -f docs/CHECKLIST.md
```

> Kalau kamu sudah generate mock-up UI dari Stitch, lampirkan juga screenshot/kode hasil Stitch dengan flag `-f` biar OpenCode ngikutin tampilannya persis, bukan menerka-nerka dari deskripsi teks.

---

## Fase 5 — Admin Dashboard

```
opencode run "Kerjakan Fase 5 di docs/CHECKLIST.md. Buat login admin pakai JWT, halaman list transaksi dengan filter status, tombol retry manual untuk order yang topupStatus-nya failed, CRUD produk & harga, dan laporan omzet sederhana. Lindungi semua endpoint admin dengan middleware JWT sesuai SAR.md bagian Keamanan." -f docs/PRD.md -f docs/SAR.md -f docs/CHECKLIST.md
```

---

## Fase 6 — Testing

```
opencode run "Kerjakan Fase 6 di docs/CHECKLIST.md. Tulis test untuk: alur sukses penuh (order->bayar->webhook->topup->sukses), alur gagal (payment expired, topup gagal, retry manual), dan webhook yang terkirim dobel (pastikan tidak double-process). Laporkan kalau ada celah keamanan yang kamu temukan, misal secret yang ke-expose ke frontend."
```

---

## Fase 7 — Deploy ke Vercel

```
opencode run "Kerjakan Fase 7 di docs/CHECKLIST.md. Siapkan apps/api supaya bisa deploy sebagai Vercel serverless function (buat api/index.ts yang export Express app, dan vercel.json yang benar). Siapkan apps/web untuk deploy sebagai static site di Vercel (build command dan output dir yang benar). Jangan hardcode environment variable apa pun — pastikan semua dibaca dari process.env sesuai daftar di SAR.md bagian Environment Variables." -f docs/SAR.md -f docs/CHECKLIST.md
```

Setelah OpenCode selesai bagian ini, langkah manual yang **tidak bisa** diwakilkan ke OpenCode (harus kamu lakukan sendiri lewat dashboard):

1. Push repo ke GitHub, connect ke Vercel (2 project: `apps/web` dan `apps/api`)
2. Isi Environment Variables di dashboard Vercel untuk masing-masing project
3. Update URL webhook di dashboard Midtrans & Digiflazz ke domain backend Vercel yang sudah live
4. Ganti mode Midtrans & Digiflazz dari sandbox ke production
5. Test 1 transaksi asli dengan nominal terkecil sebelum diumumkan ke publik
