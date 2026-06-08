# 🚀 Quick Fix Summary - Error Flutter Mobile

## ❌ Error yang Muncul:

1. **"5 packages have newer versions incompatible"** - Dependency conflict
2. **"Building with plugins requires symlink support"** - Developer Mode belum aktif

---

## ✅ Solusi Cepat (Ikuti Urutan Ini!)

### 1️⃣ AKTIFKAN DEVELOPER MODE (PALING PENTING!)

**Cara Cepat:**
1. Tekan `Windows + I`
2. Pilih **"Privacy & Security"** → **"For developers"**
3. Toggle **"Developer Mode"** menjadi **ON**
4. Klik **"Yes"**
5. **RESTART KOMPUTER** ← WAJIB!

**Atau via Command (Run as Administrator):**
```powershell
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /t REG_DWORD /f /v "AllowDevelopmentWithoutDevLicense" /d "1"
```
Kemudian restart komputer.

---

### 2️⃣ FIX DEPENDENCY CONFLICT

Saya sudah update `pubspec.yaml` dengan versi yang lebih kompatibel:
- `http: ^1.2.0` (dari 1.6.0)
- `shared_preferences: ^2.2.0` (dari 2.5.5)
- `google_fonts: ^6.0.0` (dari 8.1.0)
- `flutter_lints: ^3.0.0` (dari 6.0.0)

**Jalankan command ini:**
```bash
cd mobile
flutter clean
flutter pub get
```

**Atau double-click file:**
```
mobile/fix-dependencies.bat
```

---

### 3️⃣ JALANKAN APLIKASI

Setelah Developer Mode aktif dan dependencies fix:

```bash
cd mobile
flutter run
```

---

## 🎯 Checklist

- [ ] Developer Mode sudah ON
- [ ] Komputer sudah di-restart
- [ ] `pubspec.yaml` sudah diupdate (sudah saya lakukan)
- [ ] Jalankan `flutter clean`
- [ ] Jalankan `flutter pub get`
- [ ] Tidak ada error lagi
- [ ] Jalankan `flutter run`

---

## 🆘 Jika Masih Error

### Error: "flutter is not recognized"
**Solusi:** Flutter belum terinstall atau belum di PATH
- Install Flutter: https://docs.flutter.dev/get-started/install/windows
- Tambahkan ke PATH: `C:\src\flutter\bin`
- Restart terminal

### Error: Masih ada dependency conflict
**Solusi:** Coba upgrade semua packages
```bash
flutter pub upgrade --major-versions
flutter pub get
```

### Error: Android SDK not found
**Solusi:** Install Android Studio dan setup Android SDK
```bash
flutter doctor
```

---

## 📋 Urutan Lengkap (Step by Step)

1. ✅ Aktifkan Developer Mode
2. ✅ Restart komputer
3. ✅ Buka terminal baru
4. ✅ `cd d:\projek\Flight\mobile`
5. ✅ `flutter clean`
6. ✅ `flutter pub get`
7. ✅ `flutter run`

---

## 🎉 Setelah Berhasil

Jika aplikasi sudah bisa dijalankan:

1. **Pastikan backend running:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Pastikan HP dan komputer di jaringan yang sama**

3. **Test login dengan akun yang sama dengan web**

4. **Verifikasi database sama:**
   - Buat booking di mobile
   - Cek di web, harus muncul booking yang sama

---

## 📚 Dokumentasi Lengkap

Lihat file-file ini untuk detail:
- `FIX_FLUTTER_ISSUES.md` - Panduan lengkap fix Flutter
- `ENABLE_DEVELOPER_MODE.md` - Cara aktifkan Developer Mode
- `QUICK_FIX_MOBILE_CONNECTION.md` - Setup koneksi database

---

**Kenapa error ini muncul?**

1. **Developer Mode:** Windows memerlukan Developer Mode untuk membuat symlink yang dibutuhkan Flutter plugins
2. **Dependency Conflict:** Versi packages terlalu baru dan tidak kompatibel dengan Flutter SDK yang digunakan

**Solusinya:** Aktifkan Developer Mode + downgrade versi packages ke versi yang lebih stabil.

---

Good luck! 🚀
