# 🔄 Fix: Loading Terus Menerus (Muter-muter)

## ❌ Masalah

Aplikasi mobile loading terus (muter-muter) saat register atau login, tidak bisa masuk ke home screen.

---

## 🔍 Penyebab

1. **Backend tidak bisa diakses** - HP tidak bisa connect ke backend
2. **IP address salah** - IP di config.dart tidak sesuai
3. **Backend tidak running** - Backend belum dijalankan
4. **Firewall memblokir** - Windows Firewall block port 3333
5. **Wi-Fi berbeda** - HP dan komputer tidak di jaringan yang sama
6. **Backend tidak return token** - Register tidak mengembalikan token (SUDAH DIPERBAIKI)

---

## ✅ Solusi yang Sudah Dilakukan

### 1. Fix Backend - Return Token saat Register
File: `backend/app/controllers/auth_controller.ts`
- ✅ Sekarang backend mengembalikan token saat register
- ✅ User bisa auto-login setelah register

### 2. Fix Mobile - Error Handling & Timeout
File: `mobile/lib/api_service.dart`
- ✅ Tambah try-catch untuk handle error
- ✅ Tambah timeout 10 detik untuk setiap request
- ✅ Tampilkan error message yang jelas jika gagal connect

### 3. Update IP Address
File: `mobile/lib/config.dart`
- ✅ IP address sudah diset ke: `10.18.45.85`

---

## 🚀 Langkah-langkah Testing

### 1️⃣ Pastikan Backend Running

Buka terminal di folder backend:
```bash
cd d:\projek\Flight\backend
npm run dev
```

Pastikan muncul:
```
Server started on http://localhost:3333
```

### 2️⃣ Test Backend dari Browser Komputer

Buka browser di komputer, akses:
```
http://localhost:3333/api/airports
```

Harus muncul data JSON. Jika tidak, backend bermasalah.

### 3️⃣ Test Backend dari Browser HP

**PENTING:** HP harus terhubung ke Wi-Fi yang sama dengan komputer!

Buka browser di HP, akses:
```
http://10.18.45.85:3333/api/airports
```

- ✅ **Jika muncul JSON** = Koneksi OK, lanjut ke langkah 4
- ❌ **Jika error/timeout** = Masalah koneksi, lihat troubleshooting di bawah

### 4️⃣ Rebuild Mobile App

```bash
cd d:\projek\Flight\mobile
flutter clean
flutter pub get
flutter run
```

### 5️⃣ Test Register

1. Isi form register dengan data baru
2. Klik tombol Register
3. Tunggu maksimal 10 detik
4. Jika berhasil, akan masuk ke home screen
5. Jika gagal, akan muncul error message yang jelas

---

## 🔧 Troubleshooting

### ❌ Error: "Connection error: TimeoutException"

**Artinya:** Request timeout, backend tidak merespon dalam 10 detik

**Solusi:**
1. Cek backend sedang running
2. Cek IP address benar di `config.dart`
3. Cek HP dan komputer di Wi-Fi yang sama
4. Test dari browser HP dulu (langkah 3 di atas)

### ❌ Error: "Connection error: SocketException"

**Artinya:** Tidak bisa connect ke backend sama sekali

**Solusi:**
1. Cek IP address benar: `10.18.45.85`
2. Cek backend running di port 3333
3. Cek firewall tidak block port 3333
4. Cek HP dan komputer di jaringan yang sama

### ❌ Error: "Registration failed" atau "Login failed"

**Artinya:** Backend merespon tapi ada error validasi

**Solusi:**
1. Cek email belum terdaftar (untuk register)
2. Cek password minimal 8 karakter
3. Cek email dan password benar (untuk login)
4. Lihat log backend untuk detail error

### ❌ Masih Loading Terus (Tidak Ada Error)

**Artinya:** Kode lama masih di-cache

**Solusi:**
```bash
cd mobile
flutter clean
flutter pub get
flutter run
```

---

## 🔥 Cek Firewall Windows

### Cara 1: Via GUI
1. Buka **Windows Defender Firewall**
2. Klik **"Allow an app through firewall"**
3. Cari **Node.js**
4. Centang untuk **Private** dan **Public** networks
5. Klik **OK**

### Cara 2: Via Command (Run as Administrator)
```powershell
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
```

---

## 📱 Cek Koneksi HP dan Komputer

### Cek IP Komputer:
```bash
ipconfig
```
Catat IPv4 Address (contoh: `10.18.45.85`)

### Cek IP HP:
1. Buka **Settings** di HP
2. Pilih **Wi-Fi**
3. Tap pada Wi-Fi yang terhubung
4. Lihat IP address HP

**Pastikan:**
- IP komputer: `10.18.45.xxx`
- IP HP: `10.18.45.yyy`
- Prefix harus sama (`10.18.45`)

---

## 🎯 Test Koneksi dengan Curl

Dari terminal komputer:
```bash
curl http://10.18.45.85:3333/api/airports
```

Harus muncul data JSON. Jika tidak, ada masalah di backend atau firewall.

---

## 📝 Checklist Debugging

- [ ] Backend running di port 3333
- [ ] Test dari browser komputer berhasil (`http://localhost:3333/api/airports`)
- [ ] Test dari browser HP berhasil (`http://10.18.45.85:3333/api/airports`)
- [ ] IP address di `config.dart` benar: `10.18.45.85`
- [ ] HP dan komputer di Wi-Fi yang sama
- [ ] Firewall tidak block port 3333
- [ ] Mobile app sudah di-rebuild (`flutter clean && flutter run`)
- [ ] Tidak ada error di console backend
- [ ] Tidak ada error di console mobile

---

## 🎉 Jika Berhasil

Setelah register berhasil:
1. ✅ Otomatis masuk ke home screen
2. ✅ Token tersimpan di SharedPreferences
3. ✅ Bisa browse flights
4. ✅ Bisa booking
5. ✅ Data sinkron dengan web

---

## 🆘 Masih Bermasalah?

### Lihat Log Backend:
Terminal backend akan menampilkan setiap request yang masuk. Cek apakah ada request dari mobile.

### Lihat Log Mobile:
```bash
flutter run
```
Console akan menampilkan error jika ada.

### Test dengan Postman:
```
POST http://10.18.45.85:3333/api/auth/register
Content-Type: application/json

{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

Jika berhasil di Postman tapi gagal di mobile, berarti masalah di kode mobile.

---

## 📞 Quick Commands

### Restart Backend:
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
curl http://10.18.45.85:3333/api/airports
```

---

**Good luck!** 🚀
