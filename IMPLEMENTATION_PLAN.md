# 🛠️ Implementation Plan — 6 Fitur Baru FlightBooking

## Pembagian Kerja
- **AI kerjakan:** Payment Flow, E-Ticket/Boarding Pass, Profil Pengguna, Round Trip, Filter & Sorting, Review & Rating
- **Anda kerjakan (nanti):** Notifikasi In-App, Responsive Mobile

---

## Urutan Pengerjaan

### ✅ Fitur 1 — Filter & Sorting (Frontend only, paling mudah)
- Filter maskapai, waktu, sorting harga/waktu di `FlightSearch.jsx`

### ✅ Fitur 2 — Round Trip (Frontend + sedikit backend)
- Toggle One Way / Round Trip di search form
- Tampilkan hasil dua arah

### ✅ Fitur 3 — Profil Pengguna (Backend + Frontend)
- Halaman profil: edit nama, email, ganti password
- Backend: `PUT /api/auth/profile`

### ✅ Fitur 4 — Simulasi Pembayaran (Backend + Frontend)
- Backend: tambah kolom `payment_status`, `payment_method` di bookings
- Backend: `POST /api/bookings/:id/pay`
- Frontend: PaymentPage.jsx dengan pilihan metode, countdown, konfetti

### ✅ Fitur 5 — E-Ticket / Boarding Pass (Frontend)
- Komponen BoardingPass.jsx dengan desain visual tiket
- Integrasi ke halaman sukses booking
- Tombol download/print

### ✅ Fitur 6 — Review & Rating (Backend + Frontend)
- Backend: tabel `reviews`, model, controller
- Frontend: form review setelah booking selesai, tampilkan rating di flight card
