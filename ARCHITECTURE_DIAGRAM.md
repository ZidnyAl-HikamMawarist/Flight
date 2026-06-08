# Arsitektur Sistem Flight Booking

## 🏗️ Diagram Koneksi

```
┌─────────────────────────────────────────────────────────────────┐
│                         KOMPUTER ANDA                            │
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Frontend   │         │   Backend    │                      │
│  │     Web      │────────▶│   AdonisJS   │                      │
│  │   (React)    │         │  Port: 3333  │                      │
│  └──────────────┘         └──────┬───────┘                      │
│                                   │                               │
│                                   │                               │
│                                   ▼                               │
│                          ┌─────────────────┐                     │
│                          │    Database     │                     │
│                          │   PostgreSQL    │                     │
│                          └─────────────────┘                     │
│                                                                   │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                                    │ Wi-Fi
                                    │ (Jaringan yang sama)
                                    │
                        ┌───────────▼───────────┐
                        │                       │
                        │   HP / Emulator       │
                        │                       │
                        │  ┌─────────────────┐  │
                        │  │  Mobile App     │  │
                        │  │   (Flutter)     │  │
                        │  └─────────────────┘  │
                        │                       │
                        └───────────────────────┘
```

## 🔄 Alur Data

### Sebelum Fix (MASALAH):
```
Web App ──────▶ Backend ──────▶ Database A ✅
                                    
Mobile App ───▶ ??? ──────────▶ Database B ❌ (Database berbeda!)
```

### Setelah Fix (SOLUSI):
```
Web App ──────▶ Backend ──────▶ Database (PostgreSQL) ✅
                   ▲
                   │
                   │ (Koneksi via IP Address)
                   │
Mobile App ────────┘                                  ✅
```

## 📡 Konfigurasi URL

### Frontend Web
```javascript
// frontend/src/config/api.js
export const API_BASE_URL = `http://${window.location.hostname}:3333`;
```
- Menggunakan hostname dinamis
- Otomatis menyesuaikan dengan domain yang diakses

### Mobile App

#### SEBELUM (Salah):
```dart
// mobile/lib/api_service.dart
static const String baseUrl = 'http://10.0.2.2:3333/api';
```
- Hanya berfungsi untuk Android Emulator
- Tidak bisa akses database yang sama dengan web

#### SESUDAH (Benar):
```dart
// mobile/lib/config.dart
static const String apiBaseUrl = 'http://192.168.1.100:3333/api';
```
- Menggunakan IP address komputer
- Terhubung ke backend yang sama dengan web
- Akses database yang sama ✅

## 🔐 Alur Autentikasi

```
┌─────────────┐
│   User      │
│  (Mobile)   │
└──────┬──────┘
       │
       │ 1. Login (email + password)
       ▼
┌─────────────────────────────────────┐
│  POST /api/auth/login               │
│  Backend (AdonisJS)                 │
└──────┬──────────────────────────────┘
       │
       │ 2. Cek credentials di Database
       ▼
┌─────────────────────────────────────┐
│  Database PostgreSQL                │
│  - Cek email & password             │
│  - Generate token                   │
└──────┬──────────────────────────────┘
       │
       │ 3. Return token
       ▼
┌─────────────────────────────────────┐
│  Mobile App                         │
│  - Simpan token di SharedPreferences│
│  - Gunakan untuk request selanjutnya│
└─────────────────────────────────────┘
```

## 🌐 Network Requirements

### Untuk Development:

1. **Komputer dan HP harus di Wi-Fi yang sama**
   ```
   Komputer: 192.168.1.100 (Wi-Fi: "MyHome")
   HP:       192.168.1.xxx (Wi-Fi: "MyHome") ✅
   ```

2. **Port 3333 harus terbuka**
   - Cek firewall Windows
   - Allow Node.js di firewall

3. **Backend harus running**
   ```bash
   cd backend
   npm run dev
   ```

### Untuk Production:

```dart
// mobile/lib/config.dart
static const String apiBaseUrl = 'https://api.yourdomain.com/api';
```

## 📊 Data Flow

### Booking Flow:
```
Mobile App
    │
    │ 1. GET /api/flights (Browse flights)
    ▼
Backend ──▶ Database (Fetch flights)
    │
    │ 2. GET /api/flights/:id/seats (Select seat)
    ▼
Backend ──▶ Database (Fetch available seats)
    │
    │ 3. POST /api/bookings (Create booking)
    ▼
Backend ──▶ Database (Save booking + Update seat status)
    │
    │ 4. Return booking confirmation
    ▼
Mobile App (Show success + booking details)
```

## 🔧 Troubleshooting Flow

```
Connection Error?
    │
    ├─▶ Cek Wi-Fi sama? ──▶ No ──▶ Hubungkan ke Wi-Fi yang sama
    │                      Yes
    │                       │
    ├─▶ Cek IP benar? ─────▶ No ──▶ Update config.dart dengan IP yang benar
    │                      Yes
    │                       │
    ├─▶ Backend running? ──▶ No ──▶ Jalankan: npm run dev
    │                      Yes
    │                       │
    ├─▶ Firewall block? ───▶ Yes ─▶ Allow Node.js di firewall
    │                      No
    │                       │
    └─▶ Test di browser HP: http://[IP]:3333/api/airports
            │
            ├─▶ Muncul JSON? ──▶ Yes ─▶ Koneksi OK! Rebuild app
            └─▶ Error? ────────▶ Cek backend logs
```

## 📱 Device-Specific Configuration

### Android Emulator
```dart
// Emulator menggunakan 10.0.2.2 untuk akses localhost host machine
static const String apiBaseUrl = 'http://10.0.2.2:3333/api';
```

### Real Android Device
```dart
// Gunakan IP address komputer di jaringan lokal
static const String apiBaseUrl = 'http://192.168.1.100:3333/api';
```

### iOS Simulator
```dart
// Simulator bisa langsung akses localhost
static const String apiBaseUrl = 'http://localhost:3333/api';
```

### Real iOS Device
```dart
// Sama seperti Android, gunakan IP address komputer
static const String apiBaseUrl = 'http://192.168.1.100:3333/api';
```

## ✅ Verification Checklist

- [ ] Backend running di port 3333
- [ ] Database PostgreSQL running
- [ ] Komputer dan HP di Wi-Fi yang sama
- [ ] IP address di config.dart sudah benar
- [ ] Firewall allow port 3333
- [ ] Test di browser HP berhasil
- [ ] Mobile app bisa login dengan akun yang sama dengan web
- [ ] Booking history sama di web dan mobile

## 🎯 Success Indicators

Jika setup berhasil, Anda bisa:
1. ✅ Login di web dengan akun tertentu
2. ✅ Login di mobile dengan akun yang sama
3. ✅ Booking di mobile muncul di web
4. ✅ Booking di web muncul di mobile
5. ✅ Data user sama di kedua platform
