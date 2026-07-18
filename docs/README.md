# TopUpKu — Web Top Up Game

Dokumentasi lengkap untuk membangun website top up game (Mobile Legends, Free Fire, dll) dengan proses **otomatis** dari user bayar sampai item masuk ke akun game — tanpa admin klik manual.

> Ganti nama "TopUpKu" di semua file dengan nama brand kamu sendiri kalau sudah fix.

## Isi Folder Ini

| File | Isi | Dipakai untuk |
|---|---|---|
| `PRD.md` | Product Requirements — fitur, user flow, scope | Referensi produk, buat OpenCode paham "apa yang dibangun" |
| `SAR.md` | System Architecture & Requirements — stack, folder structure, skema DB, API, deployment | Referensi teknis utama buat OpenCode |
| `DESIGN.md` | Design token (warna, font, komponen) format resmi Google `design.md` | **Paste ke Stitch** untuk generate UI yang konsisten |
| `CHECKLIST.md` | Checklist pembangunan per-fase, urut dari setup sampai deploy | Progress tracker, dicentang manual atau oleh OpenCode |
| `PROMPT-OPENCODE.md` | Prompt siap-paste buat OpenCode, per fase | **Paste ke terminal OpenCode** |

## Urutan Kerja yang Disarankan

1. Buka `DESIGN.md` → paste ke **Stitch** (Google Labs) → generate mock-up UI halaman katalog, detail produk, checkout, dan status transaksi.
2. Baca `PRD.md` dan `SAR.md` sekali dulu biar tahu gambaran besarnya (5 menit baca).
3. Buka `PROMPT-OPENCODE.md` → jalankan prompt **Fase 1** dulu di OpenCode. Jangan langsung minta semua fitur sekaligus — biar OpenCode tidak "ngarang" struktur sendiri.
4. Lanjut fase demi fase sesuai `CHECKLIST.md`, centang setiap selesai.
5. Fase terakhir = deploy ke Vercel (sudah ada instruksinya di `SAR.md` bagian Deployment).

## Ringkasan Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript + Prisma ORM
- **Database:** PostgreSQL (Neon, serverless)
- **Payment Gateway:** Midtrans Snap (QRIS, e-wallet, VA)
- **Distributor Top Up (H2H):** Digiflazz
- **Deploy:** Vercel (frontend statis + backend sebagai serverless function)

Detail lengkap tiap poin ada di `SAR.md`.
