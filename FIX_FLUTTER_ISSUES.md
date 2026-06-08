# 🔧 Fix Flutter Issues - Panduan Lengkap

## Masalah yang Muncul:

1. ❌ **Dependency conflict** - 5 packages incompatible
2. ❌ **Developer Mode belum aktif** - Symlink support required
3. ❌ **Flutter command not found** (mungkin)

---

## ✅ Solusi Lengkap

### 1️⃣ Aktifkan Developer Mode (WAJIB!)

#### Cara Manual (Recommended):
1. Tekan `Windows + I` untuk buka Settings
2. Pilih **"Privacy & Security"** (Windows 11) atau **"Update & Security"** (Windows 10)
3. Klik **"For developers"** di sidebar
4. Toggle **"Developer Mode"** menjadi **ON**
5. Klik **"Yes"** untuk konfirmasi
6. **Restart komputer**

#### Cara Command (Alternatif):
Buka PowerShell sebagai Administrator:
```powershell
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /t REG_DWORD /f /v "AllowDevelopmentWithoutDevLicense" /d "1"
```
Kemudian restart komputer.

---

### 2️⃣ Pastikan Flutter Terinstall

Cek apakah Flutter sudah terinstall:
```bash
flutter --version
```

Jika muncul error "flutter is not recognized":

#### Install Flutter:
1. Download Flutter SDK: https://docs.flutter.dev/get-started/install/windows
2. Extract ke folder (contoh: `C:\src\flutter`)
3. Tambahkan ke PATH:
   - Buka **Environment Variables**
   - Edit **Path** di System Variables
   - Tambahkan: `C:\src\flutter\bin`
4. Restart terminal
5. Jalankan: `flutter doctor`

---

### 3️⃣ Fix Dependency Conflict

Setelah Developer Mode aktif dan Flutter terinstall:

#### Opsi A: Update Dependencies (Recommended)
```bash
cd mobile
flutter pub upgrade --major-versions
flutter pub get
```

#### Opsi B: Clean & Reinstall
```bash
cd mobile
flutter clean
flutter pub get
```

#### Opsi C: Fix Manual (Jika masih error)

Edit `pubspec.yaml` dan update versi packages:

```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  http: ^1.2.0              # Turunkan versi jika conflict
  shared_preferences: ^2.2.0 # Turunkan versi jika conflict
  google_fonts: ^6.0.0       # Turunkan versi jika conflict

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0      # Turunkan versi jika conflict
```

Kemudian:
```bash
flutter pub get
```

---

### 4️⃣ Verifikasi Setup

Jalankan Flutter Doctor untuk cek semua requirement:
```bash
flutter doctor -v
```

Pastikan semua checklist ✅:
- [✓] Flutter (Channel stable)
- [✓] Windows Version (Windows 10 or later)
- [✓] Android toolchain
- [✓] Chrome
- [✓] Visual Studio
- [✓] Android Studio
- [✓] VS Code

---

### 5️⃣ Test Build

Setelah semua fix:
```bash
cd mobile
flutter clean
flutter pub get
flutter run
```

---

## 🎯 Checklist Troubleshooting

- [ ] Developer Mode sudah aktif
- [ ] Komputer sudah di-restart setelah aktifkan Developer Mode
- [ ] Flutter sudah terinstall dan ada di PATH
- [ ] `flutter doctor` tidak ada error critical
- [ ] `flutter pub get` berhasil tanpa error
- [ ] Bisa build dan run aplikasi

---

## 🆘 Error Spesifik & Solusinya

### Error: "Building with plugins requires symlink support"
**Solusi:** Aktifkan Developer Mode (lihat langkah 1)

### Error: "flutter is not recognized"
**Solusi:** Install Flutter atau tambahkan ke PATH

### Error: "5 packages have newer versions incompatible"
**Solusi:** Jalankan `flutter pub upgrade --major-versions`

### Error: "Because mobile depends on..."
**Solusi:** 
1. Coba `flutter pub upgrade`
2. Jika masih error, turunkan versi package yang conflict di `pubspec.yaml`
3. Jalankan `flutter pub get`

### Error: "Android SDK not found"
**Solusi:** Install Android Studio dan setup Android SDK

---

## 📝 Catatan Penting

1. **Developer Mode WAJIB** untuk Flutter di Windows
2. **Restart komputer** setelah aktifkan Developer Mode
3. **Restart terminal** setelah install Flutter atau ubah PATH
4. Jika masih error, coba **downgrade versi packages** di pubspec.yaml

---

## 🔗 Resources

- Flutter Installation: https://docs.flutter.dev/get-started/install/windows
- Flutter Doctor: https://docs.flutter.dev/get-started/install/windows#run-flutter-doctor
- Developer Mode: https://learn.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development

---

## ✅ Setelah Semua Fix

Jika sudah tidak ada error, lanjutkan dengan:

1. **Jalankan Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Jalankan Mobile App:**
   ```bash
   cd mobile
   flutter run
   ```

3. **Test Login:**
   - Login dengan akun yang sama dengan web
   - Cek apakah data sinkron

---

**Good luck!** 🚀
