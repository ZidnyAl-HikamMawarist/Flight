# Script untuk testing API Flight Booking System (Windows PowerShell)
# Gunakan: .\test-api.ps1

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Flight Booking API Test Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:3333"

# Test 1: Cek Backend Running
Write-Host "[1] Testing Backend Connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/airports" -Method GET -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend is running!" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Backend is NOT running or not accessible" -ForegroundColor Red
    Write-Host "   Please start backend with: cd backend && node ace serve --watch" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Test Register
Write-Host "[2] Testing Register Endpoint..." -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$registerBody = @{
    fullName = "Test User $timestamp"
    email = "test$timestamp@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ Register endpoint working!" -ForegroundColor Green
    Write-Host "   Response: $($registerResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Register failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Test Login
Write-Host "[3] Testing Login Endpoint..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@flight.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ Login endpoint working!" -ForegroundColor Green
    $token = $loginResponse.token.token
    Write-Host "   Token received: $($token.Substring(0, [Math]::Min(20, $token.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Note: Make sure you run 'node ace db:seed' first" -ForegroundColor Yellow
    $token = $null
}
Write-Host ""

# Test 4: Test /me endpoint
if ($token) {
    Write-Host "[4] Testing /me Endpoint..." -ForegroundColor Yellow
    try {
        $headers = @{
            Authorization = "Bearer $token"
        }
        $meResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/me" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "✓ /me endpoint working!" -ForegroundColor Green
        Write-Host "   User: $($meResponse.email)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ /me endpoint failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 5: Test CORS
Write-Host "[5] Testing CORS Configuration..." -ForegroundColor Yellow
try {
    $headers = @{
        Origin = "http://localhost:5173"
        "Access-Control-Request-Method" = "POST"
    }
    $corsResponse = Invoke-WebRequest -Uri "$API_URL/api/auth/login" -Method OPTIONS -Headers $headers -UseBasicParsing -ErrorAction Stop
    if ($corsResponse.Headers["Access-Control-Allow-Origin"]) {
        Write-Host "✓ CORS is configured!" -ForegroundColor Green
    } else {
        Write-Host "✗ CORS might have issues" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠ Could not test CORS (this might be normal)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Test Summary:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "If all tests passed, your API is working correctly!"
Write-Host "If login/register still loading in browser:"
Write-Host "1. Check browser console (F12) for errors"
Write-Host "2. Clear browser cache and localStorage"
Write-Host "3. Make sure frontend is accessing the correct URL"
Write-Host "4. Check firewall/antivirus settings"
Write-Host ""
