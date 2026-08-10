# SANKALP
### Empowering Transparent Rural Workforce Management

> AI-powered rural workforce attendance platform built for the Government of India's Digital India initiative.

---

## Problem Statement

Rural employment schemes like MGNREGA suffer from:
- **Proxy attendance** — workers signing in on behalf of others
- **Manual registers** — error-prone, tamper-prone paper records
- **Wage disputes** — lack of transparent, verifiable attendance data
- **No accountability** — no audit trail for supervisor actions

## Solution

SANKALP digitizes rural workforce attendance using **AI face recognition**, providing:
- Secure, biometric attendance marking
- Real-time supervisor dashboard
- Automated wage calculation
- Government-ready reports and full audit trail

---

## Features

| Feature | Description |
|---|---|
| Face Recognition Attendance | Automatic attendance via OpenCV + face_recognition |
| Manual Review Queue | Low-confidence matches reviewed by supervisors |
| Worker Management | Register, update, delete workers with face enrollment |
| Analytics Dashboard | Rule-based insights on attendance trends |
| CSV Export | Government-ready attendance and wage reports |
| Audit Logs | Full trail of every supervisor action |
| Role-Based Access | Separate supervisor and worker dashboards |
| Wage Calculation | Automatic `present_days × daily_wage` computation |

---

## Architecture

```
┌─────────────────────────────────────────┐
│           Next.js Frontend              │
│  (App Router + TypeScript + Tailwind)   │
└────────────────┬────────────────────────┘
                 │ REST API (HTTPS)
┌────────────────▼────────────────────────┐
│           FastAPI Backend               │
│  (Python + Motor + face_recognition)    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│           MongoDB Atlas                 │
│  (Users, Workers, Attendance, Audit)    │
└─────────────────────────────────────────┘
```

---

## Technology Stack

**Frontend**
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Shadcn UI
- Recharts (analytics charts)
- Zustand (state management)
- React Hook Form + Zod

**Backend**
- FastAPI (Python)
- Motor (async MongoDB driver)
- face_recognition + OpenCV
- JWT (python-jose)
- bcrypt (passlib)
- Pydantic v2

**Database**
- MongoDB Atlas

**Deployment**
- Frontend → Vercel
- Backend → Railway

---

## Project Structure

```
Sankalp/
├── sankalp-frontend/          # Next.js application
│   ├── app/                   # App Router pages
│   │   ├── (auth)/login/      # Login page
│   │   ├── (dashboard)/       # Protected dashboard layout
│   │   │   ├── supervisor/    # Supervisor pages
│   │   │   └── worker/        # Worker pages
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── layout/            # Sidebar, Navbar
│   │   ├── shared/            # Reusable UI components
│   │   └── features/          # Feature-specific components
│   ├── services/              # API service layer
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript interfaces
│   ├── context/               # React contexts
│   ├── store/                 # Zustand store
│   └── utils/                 # Formatters and validators
│
└── sankalp-backend/           # FastAPI application
    ├── api/v1/routers/        # Route handlers
    ├── services/              # Business logic
    ├── models/                # Pydantic models
    ├── schemas/               # Request/response schemas
    ├── middleware/            # Auth middleware
    ├── utils/                 # JWT, password, image, CSV
    ├── database/              # MongoDB connection
    ├── config/                # Settings
    └── main.py                # Entry point
```

---

## Installation & Running Locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (or local MongoDB)
- Webcam for face recognition

### Backend Setup

```bash
cd sankalp-backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run the server
python main.py
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend Setup

```bash
cd sankalp-frontend

# Install dependencies
npm install

# Configure environment
copy .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Run development server
npm run dev
# App available at http://localhost:3000
```

### Default Login

```
Email:    admin@sankalp.gov.in
Password: Admin@1234
Role:     Supervisor
```

---

## API Documentation

Full Swagger UI available at: `http://localhost:8000/docs`

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | Login and get JWT token |
| GET | `/api/v1/workers` | List all workers |
| POST | `/api/v1/workers` | Register new worker |
| POST | `/api/v1/workers/{id}/enroll-face` | Enroll worker face |
| POST | `/api/v1/attendance/mark` | Mark attendance via face |
| POST | `/api/v1/attendance/sessions/start` | Start session |
| GET | `/api/v1/attendance/today` | Today's attendance feed |
| GET | `/api/v1/manual-reviews/pending` | Pending reviews |
| POST | `/api/v1/manual-reviews/{id}/decide` | Approve/reject review |
| GET | `/api/v1/analytics` | Full analytics data |
| POST | `/api/v1/reports/export-csv` | Download CSV report |
| GET | `/api/v1/audit-logs` | Audit trail |

---

## Deployment

### Frontend (Vercel)

```bash
cd sankalp-frontend
npm run build

# Deploy to Vercel
npx vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://your-backend.railway.app
```

### Backend (Railway)

1. Push `sankalp-backend/` to a GitHub repo
2. Create new Railway project → Deploy from GitHub
3. Set environment variables from `.env.example`
4. Railway auto-detects Python and runs `python main.py`

---

## Database Collections

| Collection | Purpose |
|---|---|
| `users` | Supervisor and worker accounts |
| `workers` | Worker profiles and face embeddings |
| `attendance` | Attendance records |
| `manual_reviews` | Low-confidence attendance pending review |
| `audit_logs` | Complete action history |

---

## Security

- **JWT authentication** — stateless, signed tokens
- **bcrypt password hashing** — work factor 12
- **Role-based access control** — supervisor vs worker
- **Input validation** — Pydantic v2 on all endpoints
- **Image sanitization** — Pillow resize + MIME validation
- **CORS** — restricted to frontend domain only
- **No secrets in code** — all via environment variables

---

## Face Recognition Flow

```
Capture Frame → Generate 128-dim Embedding → Compare with DB
    ↓                                              ↓
No Face / Multi Face               Confidence ≥ 70%  |  Confidence < 70%
    ↓                                    ↓                    ↓
  Error                         Auto Mark Attendance    Manual Review Queue
                                       ↓                    ↓
                                  Audit Log          Supervisor Decides
                                                          ↓
                                                     Audit Log
```

---

## Future Scope

- Offline sync for poor connectivity areas
- SMS/WhatsApp notifications via Twilio
- Liveness detection to prevent photo spoofing
- Multi-language support (Hindi, regional languages)
- GPS-based geofencing
- Government portal integration (NREGASoft)
- Mobile app (React Native)

---

## License

MIT License — Built for Government of India Digital India Initiative.

---

*SANKALP — Empowering Transparent Rural Workforce Management*
