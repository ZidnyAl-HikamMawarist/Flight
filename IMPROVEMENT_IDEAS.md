# 🚀 Ide Pengembangan Lanjutan — FlightBooking

> Dokumen ini berisi saran fitur dan penyempurnaan yang bisa ditambahkan ke project **FlightBooking** berdasarkan kondisi saat ini.
> Disusun berdasarkan **prioritas** dari yang paling berpengaruh ke UX hingga yang bersifat "nice-to-have".

---

## 🔴 PRIORITAS TINGGI — Wajib Ada (Feel Kosong tanpa ini)

### 1. 💳 Simulasi Pembayaran (Payment Flow)
Saat ini booking langsung "confirmed" tanpa proses bayar. Ini membuat alur terasa tidak nyata.

**Yang bisa dibuat:**
- Halaman **"Pilih Metode Pembayaran"** (kartu kredit, transfer bank, dompet digital)
- Simulasi form input kartu kredit dengan validasi
- Status booking: `pending_payment` → `paid` → `confirmed`
- Countdown timer pembayaran (misal: 15 menit untuk bayar)
- Halaman **"Pembayaran Berhasil"** dengan animasi konfetti ✨

**File yang perlu dibuat:**
- `frontend/src/components/payment/PaymentPage.jsx`
- `backend/app/controllers/payments_controller.ts`
- Kolom baru di tabel `bookings`: `payment_status`, `payment_method`, `paid_at`

---

### 2. 🎫 E-Ticket / Boarding Pass yang Proper
Saat ini tiket hanya berupa ringkasan teks biasa. Tidak ada sesuatu yang bisa "disimpan" user.

**Yang bisa dibuat:**
- Desain **E-Ticket / Boarding Pass** visual mirip tiket fisik (dengan barcode/QR code dummy)
- Tombol **"Download PDF"** tiket (bisa pakai `html2canvas` + `jsPDF`)
- Tombol **"Bagikan ke WhatsApp/Email"**
- **QR Code** unik per booking (pakai library `qrcode.react`)

**Contoh tampilan:**
```
┌─────────────────────────────────────────────┐
│ ✈ FlightBooking           Boarding Pass      │
│ JAKARTA (CGK) ────────► BALI (DPS)           │
│ Penerbangan: GA-401   Kelas: Economy          │
│ Tgl: 20 Feb 2026   Berangkat: 08:00          │
│ Penumpang: Budi Santoso   Kursi: 14A          │
│         [████ QR CODE ████]                   │
└─────────────────────────────────────────────┘
```

---

### 3. 🔔 Notifikasi & Status Real-time
Pengguna tidak tahu apa yang terjadi setelah booking. Tidak ada feedback.

**Yang bisa dibuat:**
- **Notifikasi in-app** (bell icon di navbar) untuk:
  - Booking confirmed
  - Pengingat 24 jam sebelum terbang
  - Perubahan jadwal penerbangan
- **Badge counter** notifikasi belum dibaca
- Tabel `notifications` di database

---

### 4. 📊 Profil Pengguna yang Lengkap
Halaman profil sama sekali tidak ada padahal user sudah login.

**Yang bisa dibuat:**
- Halaman **"Akun Saya"** dengan:
  - Edit nama, email, nomor HP
  - Foto profil (upload avatar)
  - Ganti password
  - Daftar dokumen (KTP/Paspor) yang tersimpan
- **Traveler Profiles**: simpan data penumpang yang sering digunakan agar tidak perlu input ulang


### 6. 🧳 Filter & Sorting Hasil Pencarian yang Lebih Canggih
Saat ini hasil pencarian tampil apa adanya tanpa filter apapun.

**Yang bisa dibuat:**
- Sidebar filter:
  - **Maskapai** (Garuda, Lion Air, dll)
  - **Rentang harga** (slider)
  - **Waktu keberangkatan** (Dini hari / Pagi / Siang / Malam)
  - **Durasi penerbangan**
  - **Kelas** (Economy / Business / First)
- **Sorting**: Termurah, Tercepat, Paling Awal, Paling Akhir
- **Map view** destinasi (opsional, pakai Leaflet.js)

---

### 7. ⭐ Sistem Review & Rating Penerbangan
Pengguna yang sudah terbang bisa memberikan penilaian.

**Yang bisa dibuat:**
- Setelah penerbangan selesai, user bisa beri rating (1–5 bintang)
- Review singkat (komentar)
- Rata-rata rating tampil di card hasil pencarian
- Admin bisa moderasi review



### 9. 📱 Responsive Mobile yang Proper
Saat ini tampilan di mobile kemungkinan pecah/berantakan karena menggunakan inline style.

**Yang bisa dibuat:**
- Tambahkan CSS media queries atau gunakan CSS Modules
- Hamburger menu untuk navbar di mobile
- Bottom navigation bar seperti aplikasi mobile
- Form pencarian yang kolaps menjadi satu baris di mobile



---

### 14. 📧 Email Notifikasi (Nodemailer / Resend)
Konfirmasi booking via email agar terasa lebih profesional.

**Yang bisa dibuat:**
- Email konfirmasi booking dengan lampiran E-Ticket (PDF)
- Email reminder H-1 penerbangan
- Email selamat datang saat registrasi
- Pakai **Resend** atau **Nodemailer** di backend AdonisJS

---

### 15. 🔍 Halaman "Tentang Kami" & FAQ
Melengkapi halaman yang biasanya ada di website perusahaan.

**Yang bisa dibuat:**
- Halaman `/about` — cerita singkat, tim, visi misi
- Halaman `/faq` — pertanyaan dan jawaban umum
- Halaman `/bantuan` — form kontak / live chat

---

## 📋 Tabel Prioritas

| #  | Fitur                          | Dampak UX | Kompleksitas | Prioritas |
|----|-------------------------------|-----------|--------------|-----------|
| 1  | Simulasi Pembayaran           | ⭐⭐⭐⭐⭐   | 🔴 Sedang    | 🔴 Tinggi |
| 2  | E-Ticket / Boarding Pass       | ⭐⭐⭐⭐⭐   | 🟡 Mudah     | 🔴 Tinggi |
| 3  | Notifikasi In-App             | ⭐⭐⭐⭐    | 🟡 Sedang    | 🔴 Tinggi |
| 4  | Profil Pengguna Lengkap       | ⭐⭐⭐⭐    | 🟡 Mudah     | 🔴 Tinggi |
| 5  | Round Trip (Pulang-Pergi)     | ⭐⭐⭐⭐⭐   | 🟡 Sedang    | 🟡 Sedang |
| 6  | Filter & Sorting Canggih      | ⭐⭐⭐⭐    | 🟡 Sedang    | 🟡 Sedang |
| 7  | Review & Rating               | ⭐⭐⭐     | 🟢 Mudah     | 🟡 Sedang |
| 8  | Promo & Kode Voucher          | ⭐⭐⭐⭐    | 🟡 Sedang    | 🟡 Sedang |
| 9  | Responsive Mobile             | ⭐⭐⭐⭐    | 🔴 Sulit     | 🟡 Sedang |
| 10 | Peta Rute Penerbangan         | ⭐⭐⭐     | 🔴 Sulit     | 🟢 Rendah |
| 11 | Info Cuaca Destinasi          | ⭐⭐⭐     | 🟢 Mudah     | 🟢 Rendah |
| 12 | Chatbot Bantuan               | ⭐⭐      | 🟡 Sedang    | 🟢 Rendah |
| 13 | Loyalty Points                | ⭐⭐⭐     | 🔴 Sulit     | 🟢 Rendah |
| 14 | Email Notifikasi              | ⭐⭐⭐⭐    | 🟡 Sedang    | 🟢 Rendah |
| 15 | Halaman About / FAQ           | ⭐⭐      | 🟢 Mudah     | 🟢 Rendah |

---

## 🎯 Rekomendasi Urutan Pengerjaan

Kalau mau project ini terasa "hidup" dan komplet, saya sarankan urutan ini:

```
1. E-Ticket Boarding Pass (visual, mudah, dampak besar)
   ↓
2. Profil Pengguna
   ↓
3. Simulasi Pembayaran (flow paling penting)
   ↓
4. Round Trip Support
   ↓
5. Filter & Sorting Hasil Pencarian
   ↓
6. Notifikasi In-App
   ↓
7. Promo & Kode Voucher
```

---

> 💡 **Catatan**: Mulai dari yang paling **visual** dulu (E-Ticket, Profil) agar project langsung terlihat berbeda saat demo. Setelah itu masuk ke fitur logic (Payment, Round Trip, Filter).
