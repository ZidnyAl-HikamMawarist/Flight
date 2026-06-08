# Troubleshooting Guide - Flight Booking System

## Masalah Login/Register Terus Loading (Muter Terus)

### Penyebab Umum:
1. **Backend tidak berjalan** - Port 3333 tidak aktif
2. **URL API salah** - Hardcoded localhost tidak cocok dengan hostname
3. **CORS error** - Browser memblokir request
4. **Network error** - Firewall atau antivirus memblokir koneksi

### Solusi yang Sudah Diterapkan:

#### 1. Konfigurasi API Dinamis
Dibuat file `frontend/src/config/api.js` yang menggunakan hostname dinamis:
```javascript
export const API_BASE_URL = `http://${window.location.hostname}:3333`;
```

Ini memastikan:
- Jika akses via `localhost` → API: `http://localhost:3333`
- Jika akses via `192.168.1.100` → API: `http://192.168.1.100:3333`
- Jika akses via IP lain → API akan menyesuaikan

#### 2. File yang Sudah Diupdate:
- ✅ `frontend/src/components/auth/Login.jsx`
- ✅ `frontend/src/components/auth/Register.jsx`
- ✅ `frontend/src/App.jsx`

#### 3. File yang Masih Perlu Diupdate (Opsional):
File-file berikut masih menggunakan `localhost:3333` hardcoded, tapi tidak mempengaruhi login/register:
- `frontend/src/components/dashboard/FlightSearch.jsx`
- `frontend/src/components/dashboard/BookingView.jsx`
- `frontend/src/components/dashboard/BookingHistory.jsx`
- `frontend/src/components/payment/PaymentPage.jsx`
- `frontend/src/components/admin/AdminPanel.jsx`
- Dan lainnya...

### Cara Mengecek Masalah:

#### 1. Cek Backend Berjalan
```bash
cd backend
node ace serve --watch
```
Pastikan muncul: `Server started on http://0.0.0.0:3333`

#### 2. Cek Frontend Berjalan
```bash
cd frontend
npm run dev
```
Catat URL yang muncul (misal: `http://localhost:5173`)

#### 3. Buka Browser Console (F12)
Saat login/register, perhatikan:
- **Network tab**: Lihat request ke `/api/auth/login` atau `/api/auth/register`
  - Status 200 = Berhasil
  - Status 404 = Backend tidak ditemukan
  - Status 500 = Error di backend
  - Failed/CORS = Masalah koneksi/CORS
  
- **Console tab**: Lihat error message
  - `ERR_CONNECTION_REFUSED` = Backend tidak berjalan
  - `CORS error` = Masalah CORS
  - `Network Error` = Firewall/antivirus

#### 4. Test API Manual
Buka browser dan akses:
```
http://localhost:3333/api/airports
```
Jika muncul data JSON = Backend OK
Jika error = Backend bermasalah

### Solusi Cepat:

#### Jika Backend Tidak Berjalan:
```bash
cd backend
npm install
node ace migration:run
node ace db:seed
node ace serve --watch
```

#### Jika CORS Error:
File `backend/config/cors.ts` sudah dikonfigurasi dengan benar:
```typescript
origin: true,  // Izinkan semua origin
credentials: true,  // Izinkan credentials
```

#### Jika Masih Loading Terus:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear localStorage:
   - Buka Console (F12)
   - Ketik: `localStorage.clear()`
   - Refresh halaman
3. Restart backend dan frontend
4. Coba browser lain (Chrome/Firefox/Edge)

### Testing Login/Register:

#### Test Register:
```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"password123"}'
```

#### Test Login:
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Jika curl berhasil tapi browser gagal = Masalah di frontend/CORS

### Catatan Penting:
- Pastikan backend dan frontend berjalan bersamaan
- Jangan gunakan port yang sama untuk backend (3333) dan frontend (5173)
- Jika menggunakan IP address, pastikan firewall tidak memblokir port 3333
- Untuk production, ganti `http://` dengan `https://` dan sesuaikan port
