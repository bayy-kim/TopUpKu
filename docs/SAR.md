# SAR — System Architecture & Requirements
## TopUpKu (Web Top Up Game)

### 1. Arsitektur Sistem (Overview)

```
[ Browser User ]
      │
      ▼
[ Frontend (React+Vite) ]  ──deploy──▶  Vercel (static hosting)
      │  fetch API
      ▼
[ Backend (Express+TS) ]   ──deploy──▶  Vercel (serverless function)
      │            │
      │            └──▶ [ PostgreSQL (Neon) ] via Prisma
      │
      ├──▶ [ Midtrans Snap API ]  (create payment)
      │        ▲
      │        └── webhook "payment notification" ──▶ Backend
      │
      └──▶ [ Digiflazz API ]     (create top up transaction)
               ▲
               └── callback/webhook "topup status" ──▶ Backend
```

Alur intinya: **Backend adalah orkestrator**. Dia yang menghubungkan Payment Gateway dan Distributor lewat webhook — bukan frontend, dan bukan proses manual.

### 2. Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Frontend framework | React 18 + TypeScript | Type-safety, ekosistem luas |
| Build tool | Vite | Dev server cepat, build ringan |
| Styling | Tailwind CSS | Konsisten dengan token di `DESIGN.md` |
| State/data fetching | TanStack Query | Auto-refetch untuk status transaksi real-time |
| Form & validasi | React Hook Form + Zod | Validasi Player ID/Zone ID sebelum checkout |
| Backend framework | Node.js + Express + TypeScript | Familiar, gampang dikonversi ke serverless |
| ORM | Prisma | Type-safe query, migrasi mudah |
| Database | PostgreSQL via Neon | Serverless, cocok dipasangkan dengan Vercel |
| Validasi backend | Zod | Validasi payload webhook & request |
| Payment Gateway | Midtrans Snap | Dukungan QRIS/VA/e-wallet, populer di Indonesia |
| Distributor top up | Digiflazz | API H2H, harga kompetitif, dokumentasi jelas |
| Notifikasi (Fase 2) | Fonnte / WhatsApp Business API | Update status ke user via WA |
| Hosting frontend | Vercel | Auto-deploy dari Git, gratis untuk MVP |
| Hosting backend | Vercel (serverless function via `@vercel/node`) | Satu platform untuk FE+BE, gratis untuk MVP |
| Monitoring | Vercel Logs (+ Sentry opsional di Fase 2) | Debug error production |

### 3. Struktur Folder (Monorepo)

```
topup-game/
├── apps/
│   ├── web/                        # Frontend
│   │   ├── src/
│   │   │   ├── components/         # Button, Card, StatusBadge, dll
│   │   │   ├── pages/               # Home, GameDetail, Checkout, TransactionStatus, Admin/*
│   │   │   ├── hooks/               # useOrderStatus, useProducts, dll
│   │   │   ├── lib/                 # api client (axios/fetch wrapper)
│   │   │   ├── store/               # Zustand store (cart/checkout state)
│   │   │   ├── types/               # shared TS types
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── tailwind.config.ts
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                         # Backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── games.route.ts
│       │   │   ├── products.route.ts
│       │   │   ├── orders.route.ts
│       │   │   ├── webhook.payment.route.ts
│       │   │   ├── webhook.distributor.route.ts
│       │   │   └── admin.route.ts
│       │   ├── controllers/
│       │   ├── services/
│       │   │   ├── midtrans.service.ts
│       │   │   ├── digiflazz.service.ts
│       │   │   └── notification.service.ts
│       │   ├── middlewares/          # auth, error handler, signature verify
│       │   ├── lib/prisma.ts
│       │   ├── utils/
│       │   ├── app.ts                # Express app setup
│       │   └── server.ts             # local dev entry
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       ├── api/index.ts              # Vercel serverless entry point
│       ├── vercel.json
│       └── package.json
│
├── docs/                             # Folder dokumen ini
│   ├── README.md
│   ├── PRD.md
│   ├── SAR.md
│   ├── DESIGN.md
│   ├── CHECKLIST.md
│   └── PROMPT-OPENCODE.md
│
├── .gitignore
└── package.json                      # root, workspaces: ["apps/*"]
```

### 4. Skema Database (Prisma)

```prisma
model Game {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique
  iconUrl   String?
  isActive  Boolean   @default(true)
  products  Product[]
  createdAt DateTime  @default(now())
}

model Product {
  id           String   @id @default(cuid())
  game         Game     @relation(fields: [gameId], references: [id])
  gameId       String
  name         String   // contoh: "86 Diamonds"
  skuCode      String   // kode produk di Digiflazz
  priceBuy     Int      // harga modal dari distributor
  priceSell    Int      // harga jual ke user
  isActive     Boolean  @default(true)
  orders       Order[]
  createdAt    DateTime @default(now())
}

model Order {
  id              String    @id @default(cuid())
  orderNumber     String    @unique
  product         Product   @relation(fields: [productId], references: [id])
  productId       String
  playerId        String
  serverId        String?
  customerContact String    // no WA atau email untuk notifikasi
  price           Int
  paymentMethod   String?
  paymentStatus   String    @default("pending")   // pending | paid | failed | expired
  topupStatus     String    @default("pending")   // pending | processing | success | failed
  paymentLogs     PaymentLog[]
  topupLogs       TopupLog[]
  createdAt       DateTime  @default(now())
  paidAt          DateTime?
  completedAt     DateTime?
}

model PaymentLog {
  id        String   @id @default(cuid())
  order     Order    @relation(fields: [orderId], references: [id])
  orderId   String
  gateway   String   @default("midtrans")
  rawPayload Json
  status    String
  createdAt DateTime @default(now())
}

model TopupLog {
  id           String   @id @default(cuid())
  order        Order    @relation(fields: [orderId], references: [id])
  orderId      String
  distributor  String   @default("digiflazz")
  rawRequest   Json
  rawResponse  Json
  status       String
  createdAt    DateTime @default(now())
}

model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

> Field `rawPayload`/`rawRequest`/`rawResponse` **wajib** disimpan apa adanya — ini bukti kalau ada dispute soal "kenapa transaksi gagal" atau "kenapa saldo ke potong tapi item ga masuk".

### 5. Daftar API Endpoint

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/games` | List semua game aktif | Publik |
| GET | `/api/games/:slug/products` | List nominal/produk untuk 1 game | Publik |
| POST | `/api/orders` | Buat order baru + generate Midtrans Snap token | Publik |
| GET | `/api/orders/:orderNumber` | Cek status transaksi | Publik |
| POST | `/api/webhooks/midtrans` | Terima notifikasi status pembayaran | Signature verify |
| POST | `/api/webhooks/digiflazz` | Terima callback status top up | Signature verify |
| POST | `/api/admin/login` | Login admin | Publik (rate-limited) |
| GET | `/api/admin/orders` | List semua order (filter status) | Admin (JWT) |
| POST | `/api/admin/orders/:id/retry` | Retry manual top up gagal | Admin (JWT) |
| GET/POST/PUT | `/api/admin/products` | CRUD produk & harga | Admin (JWT) |

### 6. Alur Data End-to-End

1. `POST /api/orders` → simpan order (`paymentStatus: pending`) → panggil Midtrans → return Snap token/URL ke frontend
2. User bayar di Midtrans → Midtrans `POST /api/webhooks/midtrans`
3. Backend verifikasi signature → update `paymentStatus: paid` → simpan `PaymentLog` → panggil Digiflazz
4. Digiflazz terima request → balas langsung (`topupStatus: processing`) → simpan `TopupLog`
5. Digiflazz proses ke server game → kirim callback ke `POST /api/webhooks/digiflazz`
6. Backend verifikasi signature → update `topupStatus: success/failed` → simpan `TopupLog` kedua
7. Frontend polling `GET /api/orders/:orderNumber` tiap 3–5 detik di halaman status sampai status final

### 7. Environment Variables

```
# Database
DATABASE_URL=

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Digiflazz
DIGIFLAZZ_USERNAME=
DIGIFLAZZ_API_KEY=

# Auth
JWT_SECRET=

# App
FRONTEND_URL=
```

### 8. Keamanan

- Verifikasi signature **wajib** di kedua webhook (Midtrans pakai SHA512 dari order_id+status_code+gross_amount+server_key, Digiflazz pakai md5 signature sesuai dokumentasi mereka).
- Rate limit endpoint publik (`/api/orders`, `/api/admin/login`) untuk cegah spam/brute force.
- Semua secret hanya di environment variable server — tidak pernah dikirim ke frontend.
- Endpoint admin selalu di belakang JWT middleware.
- Idempotency: webhook bisa terkirim dobel dari gateway — cek dulu status order sebelum proses ulang biar tidak double topup.

### 9. Deployment Architecture (Vercel + Neon)

- **Frontend (`apps/web`)**: deploy sebagai Vercel project terpisah, build command `vite build`, output `dist/`.
- **Backend (`apps/api`)**: deploy sebagai Vercel project terpisah dengan entry `api/index.ts` yang mengekspor Express app (`@vercel/node` otomatis membungkusnya jadi serverless function). `vercel.json` mengarahkan semua request ke entry ini.
- **Database**: Neon PostgreSQL, gunakan **pooled connection string** (bukan direct) karena serverless function sering buka koneksi baru — hindari exhaust connection limit.
- **Environment Variables**: diisi lewat dashboard Vercel (Project Settings → Environment Variables), bukan file `.env` yang ikut ter-commit.
- **Domain**: frontend & backend bisa pakai subdomain berbeda (misal `topupku.vercel.app` dan `api-topupku.vercel.app`), atur `FRONTEND_URL`/CORS di backend sesuai domain frontend final.
