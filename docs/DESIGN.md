---
version: alpha
name: Neon Arcade
description: Dark gaming-tech interface with a single neon-violet accent for actions and status.
colors:
  primary: "#0B0F19"
  secondary: "#8B93A7"
  tertiary: "#7C3AED"
  neutral: "#F4F5F7"
  success: "#22C55E"
  danger: "#EF4444"
  warning: "#F59E0B"
  surface: "#111827"
  surfaceAlt: "#1A2033"
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 2.5rem
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Space Grotesk
    fontSize: 1.75rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  h3:
    fontFamily: Space Grotesk
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 600
    letterSpacing: "0.05em"
rounded:
  sm: 6px
  md: 12px
  lg: 20px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "#FFFFFF"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 14px
  button-primary-hover:
    backgroundColor: "#6D28D9"
  button-secondary:
    backgroundColor: "{colors.surfaceAlt}"
    textColor: "{colors.neutral}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 14px
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  input-field:
    backgroundColor: "{colors.surfaceAlt}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 12px
  status-badge-success:
    backgroundColor: "{colors.success}"
    textColor: "#052E12"
    rounded: "{rounded.full}"
    padding: 6px
  status-badge-pending:
    backgroundColor: "{colors.warning}"
    textColor: "#3A2400"
    rounded: "{rounded.full}"
    padding: 6px
  status-badge-failed:
    backgroundColor: "{colors.danger}"
    textColor: "#3A0A0A"
    rounded: "{rounded.full}"
    padding: 6px
---

## Overview

Neon Arcade menyasar pemain game yang terbiasa dengan UI aplikasi game modern: gelap, fokus, dan cepat dibaca di HP. Satu warna aksen (violet) dipakai konsisten untuk semua aksi utama (tombol beli, checkout, konfirmasi) — supaya mata user langsung tahu ke mana harus tap tanpa bingung banyak warna bersaing. Latar gelap juga membuat status transaksi (sukses/pending/gagal) lebih menonjol karena kontras warnanya jelas.

## Colors

- **Primary (#0B0F19):** latar belakang utama seluruh halaman, hampir hitam dengan sedikit nuansa navy.
- **Secondary (#8B93A7):** teks sekunder, deskripsi, placeholder — jangan dipakai untuk teks penting.
- **Tertiary (#7C3AED):** satu-satunya warna untuk aksi (tombol beli, link aktif, ikon terpilih). Jangan dipakai untuk elemen dekoratif biar tetap terasa "penting".
- **Neutral (#F4F5F7):** teks utama di atas latar gelap.
- **Surface (#111827) & Surface Alt (#1A2033):** latar untuk card dan input, memberi kedalaman tanpa keluar dari nuansa gelap.
- **Success/Warning/Danger:** khusus untuk badge status transaksi (sukses/pending/gagal) — tidak dipakai di tempat lain supaya maknanya tetap konsisten.

## Typography

Space Grotesk untuk semua heading — karakternya sedikit teknikal/geometris, cocok untuk brand gaming tanpa terkesan kekanakan. Inter untuk seluruh body text karena sangat mudah dibaca di ukuran kecil pada layar HP. Hindari lebih dari 2 family font dalam satu tampilan.

## Layout

Mobile-first. Konten utama dibatasi max-width 480px di layar besar supaya tetap terasa seperti aplikasi, bukan website lebar. Gunakan token `spacing` untuk jarak antar elemen — `md` (16px) sebagai jarak standar antar komponen, `lg` (24px) sebagai jarak antar section.

## Elevation & Depth

Hindari shadow berat khas UI terang. Kedalaman dibangun lewat perbedaan warna latar (`primary` → `surface` → `surfaceAlt`), bukan drop-shadow, supaya tetap terasa flat dan modern di tema gelap.

## Shapes

Sudut membulat sedang (`rounded.md` = 12px) untuk card dan tombol — cukup lembut tapi tidak terlalu bulat. Badge status pakai `rounded.full` supaya terbaca sebagai "pill" kecil yang jelas beda dari elemen lain.

## Components

- `button-primary` dipakai untuk semua aksi utama satu halaman (checkout, konfirmasi bayar). Maksimal satu `button-primary` per layar aktif.
- `button-secondary` untuk aksi kedua (batal, kembali).
- `input-field` untuk Player ID, Zone ID/Server ID — beri state fokus dengan border tipis warna `{colors.tertiary}`.
- `status-badge-*` dipakai konsisten di halaman status transaksi dan dashboard admin — jangan buat varian warna baru untuk status yang sama.

## Do's and Don'ts

- **Do** pakai satu warna aksen (`tertiary`) untuk semua CTA — konsistensi lebih penting daripada variasi.
- **Do** pastikan teks di atas `button-primary` selalu putih (`#FFFFFF`) untuk kontras yang cukup di latar gelap.
- **Don't** pakai warna `success`/`danger`/`warning` di luar konteks status transaksi.
- **Don't** menambah shadow tebal atau gradient ramai — akan bertabrakan dengan nuansa flat-dark yang jadi ciri khas tema ini.
