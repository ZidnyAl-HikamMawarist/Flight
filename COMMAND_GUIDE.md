# 📖 Command Guide — FlightBooking Project

> Semua command yang perlu kamu tahu, dikelompokkan berdasarkan kategorinya.
> Jalankan command backend di folder `c:\laragon\www\Flight\backend`
> Jalankan command frontend di folder `c:\laragon\www\Flight\frontend`

---

## 📁 Struktur Folder Penting

```
Flight/
├── backend/          ← Server AdonisJS (Node.js)
│   ├── app/
│   │   ├── controllers/   ← Logic API (auth, booking, dll)
│   │   ├── models/        ← Representasi tabel database
│   │   └── middleware/    ← Pengecekan sebelum request masuk
│   ├── database/
│   │   ├── migrations/    ← Script perubahan struktur database
│   │   └── seeders/       ← Script isi data awal
│   └── start/
│       └── routes.ts      ← Daftar semua endpoint API
│
└── frontend/         ← Aplikasi React (Vite)
    └── src/
        └── components/    ← Semua halaman & komponen UI
```

---

## 🗄️ Kategori 1: Migration (Perubahan Struktur Database)

> Migration = script yang mengubah struktur tabel di database (tambah kolom, buat tabel baru, dll).
> Wajib dijalankan setiap kali ada file migration baru di folder `backend/database/migrations/`.

| Command | Fungsi |
|---|---|
| `node ace migration:run` | ✅ **Jalankan semua migration yang belum dijalankan** |
| `node ace migration:rollback` | ↩️ Batalkan migration terakhir (satu batch) |
| `node ace migration:rollback --batch 0` | ↩️ Batalkan SEMUA migration (reset total) |
| `node ace migration:status` | 📋 Lihat status migration mana sudah/belum jalan |
| `node ace migration:refresh` | 🔄 Rollback semua lalu run ulang dari awal |
| `node ace migration:fresh` | 💣 Drop semua tabel lalu migration ulang (HATI-HATI: data hilang!) |
| `node ace make:migration nama_file` | ✏️ Buat file migration baru |

**Kapan pakai:**
- Ada fitur baru yang butuh kolom/tabel baru → jalankan `migration:run`
- Ada bug di migration yang baru dibuat → `migration:rollback` lalu perbaiki
- Ingin reset database bersih → `migration:fresh` (data akan hilang!)

**Contoh bikin migration baru:**
```bash
node ace make:migration add_phone_to_users
# → Membuat file: database/migrations/xxxx_add_phone_to_users.ts
# → Edit file tersebut, lalu jalankan: node ace migration:run
```

---

## 🌱 Kategori 2: Seeder (Isi Data Awal / Dummy)

> Seeder = script untuk mengisi data awal ke database (airport, penerbangan, user, dll).

| Command | Fungsi |
|---|---|
| `node ace db:seed` | 🌱 **Jalankan semua seeder** |
| `node ace db:seed --file seeders/nama_seeder` | 🌱 Jalankan seeder tertentu saja |
| `node ace make:seeder NamaSeeder` | ✏️ Buat file seeder baru |

**Kapan pakai:**
- Database baru/fresh → jalankan seeder untuk isi data awal
- Mau tambah data dummy untuk testing

---

## 🖥️ Kategori 3: Server Development

### Backend (AdonisJS)

| Command | Fungsi |
|---|---|
| `node ace serve --hmr` | 🚀 **Jalankan server backend + auto-reload saat ada perubahan** |
| `node ace serve` | 🚀 Jalankan server tanpa auto-reload |
| `node ace build` | 📦 Build backend untuk production |

> Server berjalan di: **http://localhost:3333**

### Frontend (React + Vite)

| Command | Fungsi |
|---|---|
| `npm run dev` | 🚀 **Jalankan development server frontend** |
| `npm run build` | 📦 Build frontend untuk production |
| `npm run preview` | 👁️ Preview hasil build production |

> Frontend berjalan di: **http://localhost:5173**

**Cara menjalankan keduanya sekaligus:**
```bash
# Terminal 1 (di folder backend/)
node ace serve --hmr

# Terminal 2 (di folder frontend/)  
npm run dev
```

---

## 📦 Kategori 4: Package / Dependency

### Backend (npm)

| Command | Fungsi |
|---|---|
| `npm install` | 📥 Install semua dependency dari `package.json` |
| `npm install nama-package` | ➕ Tambah package baru |
| `npm uninstall nama-package` | ➖ Hapus package |

### Frontend (npm)

| Command | Fungsi |
|---|---|
| `npm install` | 📥 Install semua dependency |
| `npm install nama-package` | ➕ Tambah package (misal: `npm install axios`) |
| `npm install -D nama-package` | ➕ Tambah package development only |

---

## 🏗️ Kategori 5: Generate File (Make Commands)

> Command untuk membuat file boilerplate otomatis dari AdonisJS.

| Command | Hasil |
|---|---|
| `node ace make:controller NamaController` | Buat file controller baru |
| `node ace make:model NamaModel` | Buat file model baru |
| `node ace make:migration nama_migration` | Buat file migration baru |
| `node ace make:seeder NamaSeeder` | Buat file seeder baru |
| `node ace make:middleware NamaMiddleware` | Buat file middleware baru |
| `node ace make:validator NamaValidator` | Buat file validator baru |

---

## 🔍 Kategori 6: Debugging & Informasi

| Command | Fungsi |
|---|---|
| `node ace routes:list` | 📋 Lihat semua route/endpoint yang terdaftar |
| `node ace repl` | 💻 Buka REPL interaktif (bisa test model dll) |
| `node ace --help` | ❓ Lihat semua command yang tersedia |
| `node ace migration:status` | 📋 Cek status tiap migration |
| `npm list` | 📋 Lihat daftar package yang terinstall |

---

## 🗃️ Kategori 7: Database Langsung (MySQL / Laragon)

> Untuk akses database langsung tanpa AdonisJS.

| Command | Fungsi |
|---|---|
| Buka **HeidiSQL** / **phpMyAdmin** di Laragon | Lihat dan edit data database secara visual |
| `mysql -u root -p` | Masuk ke MySQL via terminal |
| `SHOW TABLES;` (di dalam MySQL) | Lihat semua tabel |
| `SELECT * FROM bookings;` | Lihat isi tabel bookings |
| `DESCRIBE bookings;` | Lihat struktur kolom tabel bookings |

---

## ⚡ Cheat Sheet — Skenario Umum

### Skenario A: Baru clone/pull project
```bash
# 1. Install dependency backend
cd backend && npm install

# 2. Copy dan isi .env (edit DB_DATABASE, DB_USER, dll)
cp .env.example .env

# 3. Jalankan migration
node ace migration:run

# 4. Isi data awal
node ace db:seed

# 5. Jalankan server
node ace serve --hmr

# 6. Di terminal lain, jalankan frontend
cd ../frontend && npm install && npm run dev
```

### Skenario B: Dapat file migration baru dari tim
```bash
cd backend
node ace migration:run
```

### Skenario C: Buat fitur baru yang perlu tabel/kolom baru
```bash
# 1. Buat migration
node ace make:migration add_kolom_baru_ke_tabel

# 2. Edit file migration yang baru dibuat

# 3. Jalankan migration
node ace migration:run

# 4. Update model yang sesuai (tambah @column() baru)
```

### Skenario D: Database error / mau reset
```bash
# ⚠️ HATI-HATI: Semua data akan hilang!
node ace migration:fresh

# Isi ulang data awal
node ace db:seed
```

### Skenario E: Cek endpoint API apa saja yang ada
```bash
node ace routes:list
```

---

## 🌐 URL Penting Saat Development

| URL | Keterangan |
|---|---|
| http://localhost:5173 | Frontend React (halaman web) |
| http://localhost:3333 | Backend API |
| http://localhost:3333/api/flights | Contoh endpoint API penerbangan |
| http://localhost:3333/api/auth/me | Cek data user yang login |
| http://localhost/phpmyadmin | phpMyAdmin (kalau Laragon aktif) |

---

## ❗ Catatan Penting

1. **Urutan startup WAJIB:** Backend dulu, baru Frontend
2. **Setiap ada file migration baru** → wajib jalankan `node ace migration:run`
3. **Jangan lupa .env** → pastikan `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`, `APP_KEY` sudah terisi
4. **`--hmr`** = Hot Module Replacement (server restart otomatis kalau ada perubahan kode)
5. **Port bentrok?** Matikan proses lama dulu, atau ganti port di `.env` (`PORT=3334`)
