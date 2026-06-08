# Script untuk test koneksi mobile ke backend
# Jalankan dengan: powershell .\test-mobile-connection.ps1

param(
    [string]$IpAddress = "localhost"
)

$baseUrl = "http://${IpAddress}:3333"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  TEST KONEKSI MOBILE KE BACKEND" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing URL: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Check if backend is running
Write-Host "Test 1: Checking backend status..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/airports" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running!" -ForegroundColor Green
        Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Backend is NOT running or not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Solusi:" -ForegroundColor Yellow
    Write-Host "1. Pastikan backend sedang berjalan: cd backend && npm run dev" -ForegroundColor White
    Write-Host "2. Cek firewall tidak memblokir port 3333" -ForegroundColor White
    exit
}

Write-Host ""

# Test 2: Check airports endpoint
Write-Host "Test 2: Testing /api/airports endpoint..." -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/airports" -Method GET
    $count = ($response.data | Measure-Object).Count
    Write-Host "✅ Airports endpoint working!" -ForegroundColor Green
    Write-Host "   Found $count airports" -ForegroundColor Gray
} catch {
    Write-Host "❌ Airports endpoint failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Test 3: Check flights endpoint
Write-Host "Test 3: Testing /api/flights endpoint..." -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/flights" -Method GET
    $count = ($response.data | Measure-Object).Count
    Write-Host "✅ Flights endpoint working!" -ForegroundColor Green
    Write-Host "   Found $count flights" -ForegroundColor Gray
} catch {
    Write-Host "❌ Flights endpoint failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  HASIL TEST" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Jika semua test ✅, maka:" -ForegroundColor Green
Write-Host "1. Backend berjalan dengan baik" -ForegroundColor White
Write-Host "2. Koneksi dari IP ini berhasil" -ForegroundColor White
Write-Host "3. Mobile app seharusnya bisa connect" -ForegroundColor White
Write-Host ""
Write-Host "URL untuk mobile/lib/config.dart:" -ForegroundColor Yellow
Write-Host "$baseUrl/api" -ForegroundColor Green
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Cara penggunaan
Write-Host "CARA PENGGUNAAN:" -ForegroundColor Cyan
Write-Host "Test dari localhost:" -ForegroundColor White
Write-Host "  .\test-mobile-connection.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Test dari IP tertentu:" -ForegroundColor White
Write-Host "  .\test-mobile-connection.ps1 -IpAddress 192.168.1.100" -ForegroundColor Gray
Write-Host ""
