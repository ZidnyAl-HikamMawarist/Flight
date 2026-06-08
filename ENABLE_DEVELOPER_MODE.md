# Cara Mengaktifkan Developer Mode di Windows

## Langkah-langkah:

### 1. Buka Settings
- Tekan `Windows + I` untuk membuka Settings
- ATAU klik Start Menu → Settings (ikon gear)

### 2. Masuk ke Developer Settings
- Klik **"Privacy & Security"** (Windows 11)
- ATAU klik **"Update & Security"** (Windows 10)

### 3. Aktifkan Developer Mode
- Klik **"For developers"** di sidebar kiri
- Toggle **"Developer Mode"** menjadi **ON**
- Klik **"Yes"** jika muncul konfirmasi

### 4. Restart Terminal
- Tutup semua terminal/command prompt yang terbuka
- Buka terminal baru

### 5. Verifikasi
```bash
flutter doctor
```

## Alternatif: Menggunakan Command

Buka PowerShell sebagai Administrator dan jalankan:

```powershell
# Aktifkan Developer Mode
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /t REG_DWORD /f /v "AllowDevelopmentWithoutDevLicense" /d "1"
```

Kemudian restart komputer.

## Troubleshooting

Jika masih error setelah mengaktifkan Developer Mode:
1. Restart komputer
2. Jalankan `flutter doctor` lagi
3. Pastikan tidak ada error lain
