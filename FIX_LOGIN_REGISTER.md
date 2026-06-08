# Fix: Login & Register Terus Loading (Muter Terus)

## 🔍 Masalah yang Ditemukan

Login dan register terus loading karena **URL API hardcoded** menggunakan `localhost:3333`, sehingga ketika aplikasi diakses dari IP address lain (bukan localhost), request API gagal.

### Contoh Masalah:
- Frontend diakses via: `http://192.168.1.100:5173`
- API dipanggil ke: `http://localhost:3333` ❌ (SALAH!)
- Seharusnya: `http://192.168.1.100:3333` ✅

## ✅ Solusi yang Diterapkan

### 1. Dibuat File Konfigurasi API Terpusat
**File baru:** `frontend/src/config/api.js`

File ini menggunakan hostname dinamis:
```javascript
export const API_BASE_URL = `http://${window.location.hostname}:3333`;
```

**Keuntungan:**
- ✅ Otomatis menyesuaikan dengan hostname yang digunakan
- ✅ Bekerja di localhost, IP address, atau domain
- ✅ Mudah maintenance (satu tempat untuk semua endpoint)

### 2. File yang Sudah Diperbaiki

#### ✅ Login Component
**File:** `frontend/src/components/auth/Login.jsx`
- Import konfigurasi API
- Gunakan `getApiUrl(API_ENDPOINTS.LOGIN)` untuk login
- Gunakan `getApiUrl(API_ENDPOINTS.SOCIAL_GOOGLE)` untuk Google SSO

#### ✅ Register Component  
**File:** `frontend/src/components/auth/Register.jsx`
- Import konfigurasi API
- Gunakan `getApiUrl(API_ENDPOINTS.REGISTER)` untuk register

#### ✅ App Component
**File:** `frontend/src/App.jsx`
- Import konfigurasi API
- Gunakan `getApiUrl(API_ENDPOINTS.ME)` untuk fetch user

## 🚀 Cara Menggunakan

### 1. Pastikan Backend Berjalan
```bash
cd backend
node ace serve --watch
```

Pastikan muncul:
```
Server started on http://0.0.0.0:3333
```

### 2. Pastikan Frontend Berjalan
```bash
cd frontend
npm run dev
```

### 3. Test API (Opsional)

**Windows PowerShell:**
```powershell
.\test-api.ps1
```

**Linux/Mac:**
```bash
bash test-api.sh
```

### 4. Akses Aplikasi

Buka browser dan akses salah satu:
- `http://localhost:5173` (jika di komputer yang sama)
- `http://192.168.1.100:5173` (jika dari komputer lain di jaringan)
- `http://[IP-ADDRESS]:5173` (ganti dengan IP address server)

**Sekarang login/register akan bekerja dengan benar!** ✅

## 🔧 Troubleshooting

### Masih Loading Terus?

#### 1. Buka Browser Console (F12)
Perhatikan tab **Network** dan **Console**:

**Jika muncul error:**
- `ERR_CONNECTION_REFUSED` → Backend tidak berjalan
- `CORS error` → Masalah CORS (seharusnya sudah fix)
- `404 Not Found` → Endpoint salah
- `500 Internal Server Error` → Error di backend

#### 2. Clear Cache & LocalStorage
```javascript
// Buka Console (F12), ketik:
localStorage.clear()
// Lalu refresh halaman (Ctrl+R)
```

#### 3. Cek Backend Logs
Lihat terminal backend, apakah ada error saat request masuk?

#### 4. Test API Manual
Buka browser, akses:
```
http://localhost:3333/api/airports
```

Jika muncul data JSON = Backend OK ✅
Jika error = Backend bermasalah ❌

### Masalah Umum & Solusi

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| Loading terus | Backend tidak jalan | `cd backend && node ace serve --watch` |
| CORS error | CORS tidak dikonfigurasi | Sudah diperbaiki di `config/cors.ts` |
| 404 Not Found | Database kosong | `node ace migration:run && node ace db:seed` |
| Token invalid | Token expired | Clear localStorage dan login ulang |

## 📝 File yang Masih Perlu Diupdate (Opsional)

File-file berikut masih menggunakan `localhost:3333` hardcoded, tapi **tidak mempengaruhi login/register**:

- `frontend/src/components/dashboard/FlightSearch.jsx`
- `frontend/src/components/dashboard/BookingView.jsx`
- `frontend/src/components/dashboard/BookingHistory.jsx`
- `frontend/src/components/dashboard/BookingDetail.jsx`
- `frontend/src/components/payment/PaymentPage.jsx`
- `frontend/src/components/admin/AdminPanel.jsx`
- `frontend/src/components/reviews/ReviewForm.jsx`
- `frontend/src/components/LandingPage.jsx`
- `frontend/src/components/dashboard/UserProfile.jsx`

**Rekomendasi:** Update file-file ini juga untuk konsistensi, terutama jika akan deploy ke production.

### Cara Update File Lain:

1. Import konfigurasi:
```javascript
import { getApiUrl, API_ENDPOINTS, API_BASE_URL } from '../../config/api';
```

2. Ganti URL hardcoded:
```javascript
// Sebelum:
axios.get('http://localhost:3333/api/flights')

// Sesudah:
axios.get(getApiUrl(API_ENDPOINTS.FLIGHTS))
```

## 🎯 Kesimpulan

**Masalah:** URL API hardcoded `localhost:3333`
**Solusi:** Gunakan hostname dinamis `window.location.hostname:3333`
**Status:** ✅ Login & Register sudah diperbaiki
**Next:** Update file-file lain untuk konsistensi (opsional)

---

**Catatan:** Untuk production deployment, ganti `http://` dengan `https://` dan sesuaikan port di file `frontend/src/config/api.js`
