# 🚧 Panduan Implementasi 2 Fitur Terakhir

> Kedua fitur ini adalah tugas **Anda** sesuai Implementation Plan.
> Panduan ini akan membimbing Anda langkah demi langkah.
> Tidak perlu hafal, cukup ikuti urutannya.

---

## ✅ Fitur 7 — Notifikasi In-App (Toast Notifications)

### 🎯 Tujuan
Menampilkan notifikasi kecil di pojok layar setiap ada event penting:
- Berhasil login → "Selamat datang, [Nama]! ✈"
- Berhasil booking → "Booking berhasil dibuat!"
- Berhasil bayar → "Pembayaran dikonfirmasi! 🎉"
- Berhasil simpan profil → "Profil diperbarui!"
- Error → notifikasi merah

### 📦 Apa yang Perlu Dibuat
Cukup **satu file baru** + **integrasi ke komponen yang sudah ada**.

---

### 📝 Langkah-langkah

#### Langkah 1: Buat `ToastNotification.jsx`
Buat file baru di: `frontend/src/components/ui/ToastNotification.jsx`

```jsx
// Isi dengan kode berikut:
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ─── Context ───────────────────────────────────────
const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast harus dipakai di dalam <ToastProvider>');
    return ctx;
};

// ─── Provider ──────────────────────────────────────
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    const icons = {
        success: <CheckCircle size={18} color="#10b981" />,
        error: <XCircle size={18} color="#ef4444" />,
        warning: <AlertCircle size={18} color="#f59e0b" />,
        info: <Info size={18} color="#0194f3" />,
    };

    const colors = {
        success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
        error:   { bg: '#fff1f2', border: '#fecdd3', text: '#be123c' },
        warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
        info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    };

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            {/* Toast Container */}
            <div style={{
                position: 'fixed', top: 20, right: 20,
                zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8,
                maxWidth: 360, width: '90vw',
                pointerEvents: 'none',
            }}>
                <AnimatePresence>
                    {toasts.map(t => {
                        const c = colors[t.type] || colors.info;
                        return (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    background: c.bg,
                                    border: `1.5px solid ${c.border}`,
                                    borderRadius: 14,
                                    padding: '12px 16px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                    fontSize: 14, fontWeight: 600, color: c.text,
                                    pointerEvents: 'auto',
                                    cursor: 'default',
                                }}
                            >
                                {icons[t.type]}
                                <span style={{ flex: 1 }}>{t.message}</span>
                                <button
                                    onClick={() => removeToast(t.id)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: c.text, opacity: 0.6, padding: 2,
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
```

---

#### Langkah 2: Bungkus App dengan `ToastProvider`

Buka `frontend/src/App.jsx`, tambahkan:

```jsx
// Di bagian import atas:
import { ToastProvider } from './components/ui/ToastNotification';

// Bungkus return value:
function App() {
  // ... kode yang sudah ada ...

  return (
    <ToastProvider>        {/* ← TAMBAHKAN INI */}
      {/* ... semua JSX yang sudah ada ... */}
    </ToastProvider>       {/* ← DAN INI */}
  );
}
```

---

#### Langkah 3: Pakai Toast di Komponen

Contoh pakai di **Login.jsx**:
```jsx
import { useToast } from '../ui/ToastNotification';

const Login = () => {
    const { toast } = useToast();

    const handleLogin = async () => {
        try {
            // ... logic login ...
            toast('Selamat datang kembali! ✈', 'success');
        } catch {
            toast('Email atau password salah', 'error');
        }
    };
};
```

Contoh di **UserProfile.jsx** (setelah simpan):
```jsx
import { useToast } from '../ui/ToastNotification';

// Di dalam komponen:
const { toast } = useToast();

// Di handleSave() setelah await axios.put():
toast('Profil berhasil diperbarui! 👤', 'success');

// Di catch:
toast('Gagal menyimpan perubahan', 'error');
```

Contoh di **PaymentPage.jsx** (setelah bayar sukses):
```jsx
toast('Pembayaran berhasil dikonfirmasi! 🎉', 'success');
```

---

#### Langkah 4: Tempat-tempat yang Perlu Ditambahkan Toast

| File | Event | Pesan Toast | Type |
|---|---|---|---|
| `Login.jsx` | Login berhasil | `Selamat datang, [nama]! ✈` | `success` |
| `Login.jsx` | Login gagal | `Email atau password salah` | `error` |
| `Register.jsx` | Daftar berhasil | `Akun berhasil dibuat!` | `success` |
| `UserProfile.jsx` | Simpan profil | `Profil diperbarui!` | `success` |
| `UserProfile.jsx` | Simpan gagal | `Gagal menyimpan` | `error` |
| `PaymentPage.jsx` | Bayar berhasil | `Pembayaran dikonfirmasi! 🎉` | `success` |
| `BookingView.jsx` | Booking dibuat | `Booking berhasil! Lanjut bayar.` | `info` |
| `ReviewForm.jsx` | Review terkirim | `Ulasan berhasil dikirim! 🙏` | `success` |

---

#### ✅ Checklist Fitur 7

- [x] Buat file `ToastNotification.jsx` ✅
- [x] Bungkus `App.jsx` dengan `<ToastProvider>` ✅
- [x] Tambahkan `toast()` di Login ✅
- [x] Tambahkan `toast()` di Register ✅
- [x] Tambahkan `toast()` di UserProfile ✅
- [x] Tambahkan `toast()` di PaymentPage ✅
- [x] Tambahkan `toast()` di BookingView ✅
- [x] Tambahkan `toast()` di ReviewForm ✅

---

---

## ✅ Fitur 8 — Responsive Mobile (Tampilan Handphone)

### 🎯 Tujuan
Membuat tampilan aplikasi nyaman diakses dari **smartphone** (layar kecil).
Saat ini tampilan hanya dioptimalkan untuk desktop.

### 📦 Apa yang Perlu Dibuat
- Hook `useIsMobile.js` — deteksi layar HP
- Update CSS/style di komponen-komponen utama

---

### 📝 Langkah-langkah

#### Langkah 1: Buat Hook `useIsMobile.js`

Buat file baru di: `frontend/src/hooks/useIsMobile.js`

```js
import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
    );

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [breakpoint]);

    return isMobile;
};

export default useIsMobile;
```

---

#### Langkah 2: Buat `responsive.js` — Style Helpers

Buat file baru di: `frontend/src/utils/responsive.js`

```js
// Helper untuk style kondisional berdasarkan layar
export const r = (mobile, desktop, isMobile) => isMobile ? mobile : desktop;

// Breakpoints
export const bp = {
    mobile: 768,
    tablet: 1024,
};
```

---

#### Langkah 3: Update `FlightSearch.jsx` — Yang Paling Penting

Bagian-bagian yang perlu diubah di `FlightSearch.jsx`:

```jsx
import useIsMobile from '../../hooks/useIsMobile';

const FlightSearch = ({ ... }) => {
    const isMobile = useIsMobile();

    // ...

    // Ubah styles yang ada menjadi responsive
    // Contoh: Search form dari 4 kolom jadi 1 kolom di mobile
};
```

**Style yang perlu diubah:**
```jsx
// Search form row: desktop = flex row, mobile = flex column
searchFormRow: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row', // ← ini
    gap: 12,
    flexWrap: 'wrap',
},

// Flight card: desktop = flex row, mobile = flex column
flightMain: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: 16,
    alignItems: isMobile ? 'flex-start' : 'center',
},

// Nav buttons: sembunyikan teks di mobile
navBtnText: {
    display: isMobile ? 'none' : 'inline', // sembunyikan label
},

// Hero padding: lebih kecil di mobile
hero: {
    padding: isMobile ? '40px 16px' : '80px 20px',
},

// Filter sidebar: jadi bottom sheet di mobile
filterPanel: {
    position: isMobile ? 'fixed' : 'relative',
    bottom: isMobile ? 0 : 'auto',
    left: isMobile ? 0 : 'auto',
    right: isMobile ? 0 : 'auto',
    zIndex: isMobile ? 1000 : 'auto',
    borderRadius: isMobile ? '20px 20px 0 0' : 14,
},
```

---

#### Langkah 4: Update `BookingView.jsx`

```jsx
import useIsMobile from '../../hooks/useIsMobile';

const BookingView = ({ ... }) => {
    const isMobile = useIsMobile();

    // Seat grid: lebih kecil di mobile
    // Passenger form: full width di mobile
};
```

Perubahan style utama:
```jsx
// Seat selector label
seatCell: {
    width: isMobile ? 32 : 40,
    height: isMobile ? 32 : 40,
    fontSize: isMobile ? 10 : 12,
},

// Form 2 kolom → 1 kolom di mobile
formRow: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: 12,
},
```

---

#### Langkah 5: Update `UserProfile.jsx`

```jsx
// Card width: full di mobile
card: {
    width: '100%',
    maxWidth: isMobile ? '100%' : 520,
    borderRadius: isMobile ? 0 : 24,
    minHeight: isMobile ? '100vh' : 'auto',
},
```

---

#### Langkah 6: Update `PaymentPage.jsx`

```jsx
// Main card: full screen di mobile
mainCard: {
    width: '100%',
    maxWidth: isMobile ? '100%' : 560,
    borderRadius: isMobile ? 0 : 24,
    minHeight: isMobile ? '100vh' : 'auto',
},
```

---

#### Langkah 7: Tambah Meta Viewport (Kalau Belum Ada)

Buka `frontend/index.html`, pastikan ada:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

---

#### Langkah 8: Test di Browser

1. Buka aplikasi di browser: **http://localhost:5173**
2. Tekan `F12` → klik ikon 📱 (Toggle Device Toolbar)
3. Pilih perangkat: iPhone SE, Pixel 5, dll
4. Pastikan tampilan tidak ada yang terpotong atau overflow

**Yang harus dicek:**
| Halaman | Yang Diperiksa |
|---|---|
| Landing Page | Teks dan tombol terbaca |
| Search Form | Field input tidak terpotong |
| Flight Cards | Tetap terbaca, tidak overflow |
| Booking View | Seat map dan form bisa digunakan |
| Payment Page | Metode bayar bisa dipilih |
| Profil | Form input full width |

---

#### ✅ Checklist Fitur 8

- [x] Buat `hooks/useIsMobile.js` ✅
- [x] Buat `utils/responsive.js` ✅
- [x] Update `FlightSearch.jsx` — navbar, hero, search form, flight cards ✅
- [x] Update `BookingView.jsx` — layout, seat grid, form nama ✅
- [x] Update `UserProfile.jsx` — card full-screen di mobile ✅
- [x] Update `PaymentPage.jsx` — card full-screen di mobile ✅
- [x] Cek `index.html` — meta viewport ada ✅
- [ ] Test di Chrome DevTools mode mobile
- [ ] Test di 3 ukuran: 375px (iPhone), 414px (Android), 768px (Tablet)

---

## 🗓️ Urutan Pengerjaan yang Disarankan

```
1. Fitur 7 (Toast) — lebih mudah, tidak terlalu banyak file
   Estimasi: 1-2 jam

2. Fitur 8 (Responsive) — butuh lebih banyak penyesuaian
   Estimasi: 2-4 jam
```

## 💡 Tips Debugging

- **Toast tidak muncul?** Pastikan komponen sudah dibungkus `<ToastProvider>` di `App.jsx`
- **`useToast` error?** Artinya komponen yang memanggilnya belum di dalam `<ToastProvider>`
- **Mobile overflow?** Tambahkan `overflow: 'hidden'` di container atau `box-sizing: 'border-box'` di input
- **Layout pecah di mobile?** Cek apakah ada `width` atau `minWidth` hardcoded (px) yang perlu diganti dengan `%` atau `100%`
