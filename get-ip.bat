@echo off
REM Script untuk mendapatkan IP Address komputer
REM Jalankan dengan double-click atau: get-ip.bat

echo ==================================
echo   IP ADDRESS KOMPUTER ANDA
echo ==================================
echo.

echo Mencari IP Address...
echo.

ipconfig | findstr /i "IPv4"

echo.
echo ==================================
echo LANGKAH SELANJUTNYA:
echo ==================================
echo 1. Lihat IPv4 Address di atas
echo 2. Copy IP address (contoh: 192.168.1.100)
echo 3. Buka file: mobile\lib\api_service.dart
echo 4. Ganti baseUrl menjadi: http://[IP_ANDA]:3333/api
echo 5. Pastikan HP dan komputer di Wi-Fi yang sama
echo 6. Rebuild aplikasi: flutter clean ^&^& flutter run
echo ==================================
echo.

pause
