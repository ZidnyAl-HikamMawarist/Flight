# ✅ Setup Checklist: Hubungkan Mobile ke Database Web

Print atau screenshot checklist ini untuk memudahkan setup!

---

## 📋 Pre-Requirements

- [ ] Flutter sudah terinstall
- [ ] Node.js sudah terinstall
- [ ] PostgreSQL sudah terinstall dan running
- [ ] Backend dependencies sudah terinstall (`npm install`)
- [ ] Mobile dependencies sudah terinstall (`flutter pub get`)

---

## 🔧 Setup Backend

- [ ] Database PostgreSQL sudah dibuat
- [ ] File `.env` sudah dikonfigurasi dengan benar
- [ ] Migrations sudah dijalankan (`node ace migration:run`)
- [ ] Seeders sudah dijalankan (`node ace db:seed`)
- [ ] Backend bisa dijalankan tanpa error (`npm run dev`)
- [ ] Backend accessible di `http://localhost:3333`

---

## 🌐 Network Configuration

- [ ] Komputer terhubung ke Wi-Fi
- [ ] HP terhubung ke Wi-Fi **yang sama** dengan komputer
- [ ] IP address komputer sudah didapatkan:
  ```
  Windows: ipconfig
  Mac/Linux: ifconfig
  ```
  IP Address saya: `___________________` (tulis di sini!)

---

## 📱 Mobile Configuration

- [ ] File `mobile/lib/config.dart` sudah dibuat
- [ ] IP address di `config.dart` sudah diupdate:
  ```dart
  static const String apiBaseUrl = 'http://[IP_ANDA]:3333/api';
  ```
- [ ] File `mobile/lib/api_service.dart` sudah menggunakan `config.dart`
- [ ] File `mobile/lib/main.dart` sudah import `config.dart`

---

## 🔥 Firewall Configuration

### Windows:
- [ ] Windows Defender Firewall dibuka
- [ ] "Allow an app through firewall" diklik
- [ ] Node.js dicentang untuk Private networks
- [ ] Node.js dicentang untuk Public networks

### Mac:
- [ ] System Preferences > Security & Privacy > Firewall dibuka
- [ ] Firewall Options diklik
- [ ] Node.js diizinkan

---

## 🧪 Testing

### Test 1: Backend Accessibility
- [ ] Buka browser di **komputer**
- [ ] Akses: `http://localhost:3333/api/airports`
- [ ] Muncul data JSON ✅

### Test 2: Network Connectivity
- [ ] Buka browser di **HP**
- [ ] Akses: `http://[IP_KOMPUTER]:3333/api/airports`
- [ ] Muncul data JSON ✅

### Test 3: Web Login
- [ ] Buka web app di browser komputer
- [ ] Login dengan akun: `admin@example.com` / `password`
- [ ] Berhasil login ✅

### Test 4: Mobile Login
- [ ] Rebuild mobile app: `flutter clean && flutter run`
- [ ] Login dengan akun yang sama: `admin@example.com` / `password`
- [ ] Berhasil login ✅

---

## 🎯 Final Verification

- [ ] Login di web berhasil
- [ ] Login di mobile berhasil dengan akun yang sama
- [ ] Buat booking di mobile
- [ ] Booking muncul di web (cek booking history)
- [ ] Buat booking di web
- [ ] Booking muncul di mobile (cek booking history)

---

## ✅ SUCCESS!

Jika semua checklist di atas sudah ✅, maka:
- Mobile dan web sudah terhubung ke database yang sama
- User bisa login di kedua platform dengan akun yang sama
- Data booking sinkron antara mobile dan web

---

## 🆘 Troubleshooting

Jika ada yang tidak berfungsi, cek:

### Connection Error
1. [ ] Cek Wi-Fi sama
2. [ ] Cek IP address benar
3. [ ] Cek backend running
4. [ ] Cek firewall tidak block

### Login Failed
1. [ ] Cek akun sudah terdaftar (test di web dulu)
2. [ ] Cek password benar
3. [ ] Cek backend logs untuk error

### Data Tidak Sinkron
1. [ ] Cek token tersimpan dengan benar
2. [ ] Cek API endpoint benar
3. [ ] Cek backend logs untuk error

---

## 📞 Quick Commands

### Get IP Address:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

### Run Backend:
```bash
cd backend
npm run dev
```

### Rebuild Mobile:
```bash
cd mobile
flutter clean
flutter pub get
flutter run
```

### Test Connection:
```bash
# Dari root project
.\test-mobile-connection.ps1 -IpAddress [IP_ANDA]
```

---

## 📚 Documentation

- `QUICK_FIX_MOBILE_CONNECTION.md` - Panduan cepat
- `MOBILE_DATABASE_CONNECTION_GUIDE.md` - Panduan lengkap
- `ARCHITECTURE_DIAGRAM.md` - Diagram arsitektur sistem

---

**Tanggal Setup:** _______________

**IP Address Digunakan:** _______________

**Catatan:**
_________________________________________________
_________________________________________________
_________________________________________________
