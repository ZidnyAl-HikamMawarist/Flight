# 🛫 Flight Booking System - NEW PRO PLAN (E-Ticket Pro Edition)

## Fase 7: Smart E-Ticket System (PRO MODE) 🚀
*Fokus: Transformasi dari aplikasi booking biasa menjadi sistem reservasi standar industri.*

### 1. Infrastruktur Data E-Ticket
- [ ] **PNR & Ticket No Generator**: Buat fungsi di backend untuk generate 6 karakter Alphanumeric PNR (Kode Booking) dan 13 digit nomor tiket unik secara otomatis saat booking sukses.
- [ ] **Check-in Sequence Logic**: Sistem untuk mencatat urutan check-in (Sequence Number/SEQ) untuk setiap kursi di penerbangan tersebut.

### 2. Generator QR Code Dinamis (IATA Standard)
- [ ] **Backend QR Service**: Implementasi generator QR Code di server (menggunakan library `qrcode`) yang didalamnya berisi data terenkripsi:
    - **Identitas**: Nama Belakang/Nama Depan.
    - **Detail Penerbangan**: Nomor terbang, Airline Code (GA, ID, dll), Bandara Origin & Destination.
    - **PNR**: 6 digit unik.
    - **Seat & SEQ**: Nomor kursi dan urutan masuk.
    - **E-Ticket No**: 13 digit bukti bayar.
- [ ] **Secure QR**: Pastikan QR code digenerate di server agar data tidak bisa dimanipulasi dari frontend.

### 3. Integrated PDF Generator
- [ ] **Professional Ticket Template**: Membuat desain template tiket PDF yang elegan, lengkap dengan logo maskapai, garis potong boarding pass, dan penempatan QR code yang pas.
- [ ] **PDF Engine Implementation**: Menggunakan engine (seperti `puppeteer` atau `pdfkit`) di AdonisJS untuk merender template HTML menjadi file PDF siap cetak.
- [ ] **Frontend Download**: Menambahkan tombol "Download E-Ticket" di dashboard user dan riwayat pesanan.

### 4. Automated Email System (Traveloka Style)
- [ ] **Mail Server Setup**: Konfigurasi `@adonisjs/mail` untuk pengiriman email otomatis.
- [ ] **Auto-Send Trigger**: Begitu pembayaran dikonfirmasi/simulasi berhasil, sistem otomatis mengirim email berisi:
    *   Ringkasan perjalanan di body email.
    *   E-Ticket PDF sebagai file lampiran (attachment).
- [ ] **Responsive Email Design**: Tutorial visual email yang cantik agar tetap rapi dibuka di HP atau Laptop.

---

## 🛠️ Tooling & Library:
- **Backend**: `@adonisjs/mail`, `qrcode` (generator), `puppeteer` (PDF converter).
- **Frontend**: Handling PDF blob download.

---
*Rencana ini sekarang menjadi prioritas utama pengembangan.*
