# 🚀 Quick Fix: Hubungkan Mobile ke Database Web

## ⚡ Langkah Cepat (5 Menit)

### 1️⃣ Dapatkan IP Komputer Anda

**Windows:**
```bash
# Jalankan salah satu:
get-ip.bat
# ATAU
ipconfig
```

**Mac/Linux:**
```bash
ifconfig
# ATAU
ip addr
```

Catat IP Address Anda, contoh: `192.168.1.100`

### 2️⃣ Update Konfigurasi Mobile

Buka file: `mobile/lib/config.dart`

Ganti baris ini:
```dart
static const String apiBaseUrl = 'http://192.168.1.100:3333/api'; // GANTI IP INI!
```

Dengan IP komputer Anda:
```dart
static const String apiBaseUrl = 'http://192.168.0.105:3333/api'; // Contoh IP Anda
```

### 3️⃣ Jalankan Backend

```bash
cd backend
npm run dev
```

Pastikan muncul: `Server started on http://localhost:3333`

### 4️⃣ Rebuild Aplikasi Mobile

```bash
cd mobile
flutter clean
flutter pub get
flutter run
```

### 5️⃣ Test Login

1. Pastikan HP dan komputer terhubung ke **Wi-Fi yang sama**
2. Buka aplikasi mobile
3. Login dengan akun yang sudah terdaftar di web
4. ✅ Berhasil!

---

## 🔧 Troubleshooting Cepat

### ❌ "Connection refused"
- ✅ Cek HP dan komputer di Wi-Fi yang sama
- ✅ Cek IP address sudah benar
- ✅ Cek backend sedang berjalan

### ❌ "Login failed"
- ✅ Pastikan akun sudah terdaftar (coba login di web dulu)
- ✅ Cek password benar
- ✅ Cek backend tidak error (lihat log di terminal)

### ❌ Masih tidak bisa
1. Test di browser HP: `http://[IP_ANDA]:3333/api/airports`
2. Jika muncul JSON data = koneksi OK
3. Jika tidak muncul = cek firewall Windows

---

## 📱 Konfigurasi untuk Berbagai Device

### Android Emulator
```dart
static const String apiBaseUrl = 'http://10.0.2.2:3333/api';
```

### Real Device (HP Fisik)
```dart
static const String apiBaseUrl = 'http://192.168.1.100:3333/api'; // IP komputer
```

### iOS Simulator
```dart
static const String apiBaseUrl = 'http://localhost:3333/api';
```

---

## ✅ Cara Verifikasi Berhasil

1. Login di **Web** dengan akun: `admin@example.com`
2. Login di **Mobile** dengan akun yang sama
3. Jika kedua-duanya berhasil = **SUKSES!** 🎉

---

## 📝 File yang Diubah

- ✅ `mobile/lib/config.dart` - Konfigurasi URL backend
- ✅ `mobile/lib/api_service.dart` - Menggunakan config.dart
- ✅ `mobile/lib/main.dart` - Print konfigurasi saat start

---

## 🆘 Butuh Bantuan?

Lihat panduan lengkap: `MOBILE_DATABASE_CONNECTION_GUIDE.md`
