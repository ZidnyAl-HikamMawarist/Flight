# Flight Booking Mobile Pro ✈️

Aplikasi mobile modern untuk pemesanan tiket pesawat yang terhubung langsung dengan backend yang sama dengan versi website. Aplikasi ini telah diperbarui dengan tampilan yang lebih modern, premium, dan fungsional.

## ✨ Fitur Baru & Modernisasi
- **UI/UX Modern:** Desain premium dengan skema warna Deep Blue & Orange, tipografi Inter, dan layout yang responsif.
- **Material 3:** Menggunakan standar desain terbaru dari Google.
- **Sinkronisasi Website:** Login, pendaftaran, dan data pemesanan terhubung langsung ke database website melalui satu API.
- **Manajemen Kursi:** Tampilan layout pesawat yang lebih jelas dan interaktif untuk pemilihan kursi.
- **Riwayat Booking:** Daftar riwayat pemesanan yang rapi dan terorganisir.

## 🚀 Persiapan & Koneksi Database

Agar aplikasi mobile bisa saling terhubung dengan database website:

### 1. Konfigurasi Endpoint API
Buka file `lib/config.dart` dan sesuaikan URL backend Anda:

```dart
// Untuk produksi (terhubung ke website live)
static const String productionApiBaseUrl = 'https://api.website-anda.com/api';

// Untuk development (terhubung ke laptop lokal)
// Ganti dengan IP laptop Anda yang menjalankan backend
static const String productionApiBaseUrl = 'http://192.168.1.XX:3333/api';
```

### 2. Jalankan Backend
Pastikan backend (AdonisJS atau lainnya) sudah berjalan dan dapat diakses dari jaringan HP Anda.

### 3. Jalankan Aplikasi
```bash
flutter pub get
flutter run
```

## 📱 Struktur Layar (Modern)
Aplikasi menggunakan versi modern (V2) untuk layar-layar utama:
- `login_screen.dart` (Modernized)
- `register_screen.dart` (Modernized)
- `home_screen_v2.dart` (Premium Search & List)
- `flight_detail_screen_v2.dart` (Detailed Info)
- `seat_selection_screen_v2.dart` (Interactive Aircraft Layout)
- `booking_history_screen_v2.dart` (History List)

## 🛠 Troubleshooting Koneksi
- **Cek Jaringan:** Pastikan HP dan Laptop berada di Wi-Fi yang sama jika menggunakan backend lokal.
- **Cek Firewall:** Pastikan port backend (misal: 3333) tidak diblokir.
- **Test URL:** Buka `http://[IP_LAPTOP]:3333/api/airports` di browser HP Anda. Jika bisa diakses, aplikasi mobile juga bisa terhubung.

---
*Dibuat dengan ❤️ untuk pengalaman terbang yang lebih baik.*
