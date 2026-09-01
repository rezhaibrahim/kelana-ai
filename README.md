# KelanaAI

AI Travel Planner — dibangun bertahap lintas sesi bootcamp. Backend FastAPI + PostgreSQL dengan autentikasi JWT dan itinerary bertenaga Amazon Bedrock (termasuk RAG lewat Knowledge Base), frontend Next.js dengan dashboard trip milik masing-masing user.

## Fitur

- Registrasi & login (JWT)
- Buat trip, lihat riwayat trip (hanya milik user yang login), generate itinerary AI
- Kategori & gaya perjalanan otomatis (Backpacker/Standard/Luxury, Solo/Couple/Family)
- Itinerary AI via Amazon Nova Lite (Bedrock)
- Tanya-jawab berbasis dokumen (RAG) lewat Knowledge Base Bedrock — `POST /api/v1/ask`
- Proteksi kepemilikan data: setiap user hanya bisa lihat/ubah/hapus trip miliknya sendiri

## Struktur Proyek

```
kelana-ai/
├── backend/                        # FastAPI + SQLAlchemy (PostgreSQL: kelana_ai)
│   ├── main.py                     # semua route API
│   ├── database.py                 # koneksi & session SQLAlchemy
│   ├── models.py                   # model User & Trip
│   ├── schemas.py                  # skema request/response Pydantic
│   ├── auth.py                     # hashing password, JWT, dependency get_current_user
│   ├── services/
│   │   ├── trip_service.py         # logika kategori, musim, budget harian
│   │   ├── bedrock_service.py      # generate itinerary via Amazon Nova Lite
│   │   └── knowledge_base_service.py  # RAG: retrieve dari Knowledge Base + generate jawaban
│   ├── .env                        # kredensial (gitignored, jangan pernah commit)
│   └── .env.example
├── frontend/                       # Next.js 16 (App Router) + Tailwind CSS
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # homepage: hero + form buat trip (dilindungi login)
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx
│       │   ├── profile/page.tsx    # info akun + logout (dilindungi login)
│       │   └── trips/page.tsx      # riwayat trip milik user, dengan pagination
│       ├── components/
│       │   ├── TripForm.tsx
│       │   ├── TripCard.tsx
│       │   ├── RequireAuth.tsx     # guard: redirect ke /login kalau belum login
│       │   ├── FormField.tsx
│       │   └── Footer.tsx
│       ├── context/AuthContext.tsx # state login (token JWT di localStorage)
│       └── lib/                    # api helper, tipe data, util flag negara
└── knowledge-base-docs/            # dokumen travel untuk Knowledge Base (RAG)
```

## Cara Menjalankan

### Backend

```bash
cd backend
python3 -m pip install -r requirements.txt
cp .env.example .env   # lalu isi dengan kredensial asli, jangan commit .env
python3 -m uvicorn main:app --reload --port 8000
```

Butuh PostgreSQL aktif (`brew services start postgresql@16`) dengan database `kelana_ai`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Endpoint API (backend/main.py)

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/v1/recommendations` | daftar rekomendasi statis (publik) |
| GET | `/api/v1/transportations` | daftar transportasi statis (publik) |
| POST | `/api/v1/auth/register` | registrasi user baru |
| POST | `/api/v1/auth/login` | login, mengembalikan JWT |
| POST | `/api/v1/ask` | tanya AI berbasis Knowledge Base (RAG), butuh login |
| POST | `/api/v1/trips` | buat trip baru, butuh login |
| GET | `/api/v1/trips` | daftar trip milik user yang login |
| GET/PUT/DELETE | `/api/v1/trips/{id}` | detail/ubah/hapus trip — 403 kalau bukan pemilik |
| POST | `/api/v1/trips/{id}/generate` | generate itinerary AI untuk trip tsb |

## Environment Variables (backend/.env)

```
AWS_BEARER_TOKEN_BEDROCK=...      # untuk invoke_model biasa (itinerary generation)
AWS_REGION=ap-southeast-2
JWT_SECRET_KEY=...
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
AWS_ACCESS_KEY_ID=...             # untuk akses Knowledge Base (RAG)
AWS_SECRET_ACCESS_KEY=...
KNOWLEDGE_BASE_ID=...
KNOWLEDGE_BASE_MODEL_ARN=...
```

Lihat `backend/.env.example` untuk daftar lengkap dan format placeholder. **Jangan pernah commit `.env` asli.**

## Catatan Model AI

Menggunakan **Amazon Nova Lite** (`amazon.nova-lite-v1:0`, region `ap-southeast-2`), bukan model Anthropic Claude — akun AWS yang dipakai belum menyelesaikan form use-case Anthropic di Bedrock console.

## Riwayat Sesi (git tag)

`v0.1.0` → `v0.3.0`, lalu `session-4` s.d. `session-9` — setiap tag menandai checkpoint akhir sesi bootcamp.
