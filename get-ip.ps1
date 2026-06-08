# Script untuk mendapatkan IP Address komputer
# Jalankan dengan: powershell .\get-ip.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  IP ADDRESS KOMPUTER ANDA" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Mendapatkan IP Address dari adapter yang aktif
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.PrefixOrigin -eq "Dhcp" -or $_.PrefixOrigin -eq "Manual"
}

if ($ipAddresses) {
    Write-Host "IP Address yang ditemukan:" -ForegroundColor Green
    Write-Host ""
    
    foreach ($ip in $ipAddresses) {
        Write-Host "  Interface: $($ip.InterfaceAlias)" -ForegroundColor Yellow
        Write-Host "  IP Address: $($ip.IPAddress)" -ForegroundColor White
        Write-Host ""
        
        # Tampilkan URL yang harus digunakan
        Write-Host "  Gunakan URL ini di mobile/lib/api_service.dart:" -ForegroundColor Cyan
        Write-Host "  http://$($ip.IPAddress):3333/api" -ForegroundColor Green
        Write-Host ""
        Write-Host "  ----------------------------------"
        Write-Host ""
    }
    
    Write-Host "LANGKAH SELANJUTNYA:" -ForegroundColor Yellow
    Write-Host "1. Copy salah satu URL di atas" -ForegroundColor White
    Write-Host "2. Buka file: mobile/lib/api_service.dart" -ForegroundColor White
    Write-Host "3. Ganti nilai baseUrl dengan URL tersebut" -ForegroundColor White
    Write-Host "4. Pastikan HP dan komputer terhubung ke Wi-Fi yang sama" -ForegroundColor White
    Write-Host "5. Rebuild aplikasi mobile: flutter clean && flutter run" -ForegroundColor White
    
} else {
    Write-Host "Tidak dapat menemukan IP Address yang valid." -ForegroundColor Red
    Write-Host "Coba jalankan: ipconfig" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
