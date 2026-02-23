# 🛫 Flight Booking System Development Plan (Traveloka Clone)

Rencana pengembangan ini dibagi menjadi beberapa fase untuk memastikan pondasi yang kuat sebelum masuk ke fitur yang lebih kompleks.

## Fase 1: Dasar & Infrastruktur (SELESAI ✅)
- [x] Setup Project AdonisJS (Backend) & React (Frontend).
- [x] Desain Database (ERD).
- [x] Implementasi Migrasi & Model.
- [x] Seeding data awal (Master data: Status, Class).

## Fase 2: Autentikasi & User Management (SELESAI ✅)
*Fokus: Mengamankan sistem dan mengelola pengguna.*
- [x] Implementasi Register & Login API (menggunakan AdonisJS Auth).
- [x] Middleware/Guard untuk membatasi akses (Logout & Auth protection).
- [x] UI Login & Register di Frontend.
- [x] Profil pengguna (Ambil data & Logout).

## Fase 3: Pencarian Penerbangan (SELESAI ✅)
*Fokus: Menampilkan jadwal terbang kepada pengguna.*
- [x] **Data Seeding Lanjutan:** Mengisi data bandara (Airports), Pesawat (Aircrafts), dan Jadwal (Schedules) yang realistis.
- [x] **Flight Search API:** Endpoint untuk mencari penerbangan berdasarkan `asal`, `tujuan`, `tanggal`, dan `kelas`.
- [x] **Frontend Search Box:** Membuat UI pencarian yang elegan (seperti Traveloka).
- [x] **Flight Result Page:** Menampilkan daftar hasil pencarian dengan filter (Harga, Waktu, Maskapai).

## Fase 4: Proses Booking & Kursi (SELESAI ✅)
*Fokus: Logika pemilihan kursi dan pembuatan reservasi.*
- [x] **Seat Availability:** Logika untuk mengecek kursi mana yang masih kosong di pesawat tertentu.
- [x] **Seat Selection UI:** Tampilan visual denah kursi pesawat di Frontend.
- [x] **Booking API:** Endpoint untuk menyimpan reservasi (menghubungkan `Client`, `Flight`, dan `Seat`).
- [x] **Group Booking Support:** Mendukung pemilihan banyak kursi sekaligus sesuai jumlah penumpang.
- [x] **Validasi:** Mencegah satu kursi dipesan oleh dua orang di waktu yang sama.

## Fase 5: Dashboard & Riwayat Transaksi (SELESAI ✅)
*Fokus: Menampilkan hasil booking ke pengguna.*
- [x] **Booking Details:** Halaman ringkasan setelah melakukan pemesanan (E-ticket mockup).
- [x] **Riwayat Pesanan:** Daftar semua penerbangan yang pernah dipesan oleh user.

## Fase 6: Admin Panel (SELESAI ✅)
*Fokus: Internal tool untuk admin.*
- [x] Manajemen Bandara & Pesawat.
- [x] Penjadwalan Penerbangan (CRUD Schedules).
- [x] Monitoring Booking yang masuk.

---

## Tips Pengembangan
1. **API First:** Selesaikan endpoint di Backend dulu, test menggunakan Postman, baru pindah ke Frontend.
2. **Atomic Commits:** Lakukan commit git setiap kali satu poin di atas selesai.
3. **Clean Design:** Gunakan sistem komponen di React agar UI konsisten.
