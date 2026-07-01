# ShaadiOS
### AI-Powered Wedding Intelligence & Management Platform

> Designed & Developed by **Jigyansh Kumar**

ShaadiOS is a production-grade SaaS platform that brings every Indian wedding decision under one beautifully-crafted dashboard — powered by specialised AI agents instead of a single chatbot.

---

## ✨ Modules
- **Auth** — JWT email/password, multi-wedding tenant isolation
- **Wedding Dashboard** — countdown, guest stats, budget, quick actions
- **Guest Management** — CRUD, family grouping, RSVP, plus-ones, VIP/elderly flags, CSV export, QR check-in
- **AI Headcount Predictor** — attendance/food/seating/parking/staff/wastage with confidence score
- **Vendor Marketplace** — 12 seeded vendors (photographers, caterers, decorators, makeup artists, DJs) with filter, search, booking
- **Smart Budget** — expenses CRUD, pie chart by category, overspend alerts
- **Digital Invitations** — 3 templates, shareable slug URL, WhatsApp share, public RSVP page
- **Wedding Timeline** — Roka, Engagement, Haldi, Mehendi, Sangeet, Wedding, Reception + task board
- **Family Hub** — announcements, notes, messages with notification fan-out
- **Accommodation** — hotel room manager + AI auto-allocator (VIP & elderly priority)
- **QR Check-in** — guest-specific QR codes + entry-time check-in API
- **AI Intelligence Center** — 6 specialist GPT-5.2 agents: Planner, Guest, Budget, Catering, Vendor, Risk
- **Analytics Dashboard** — attendance forecast, food forecast, budget forecast, wedding health score, risk alerts
- **Exports** — Guest list CSV, full wedding PDF report
- **Shaadi Saheli Assistant** — streaming GPT-5.2 chat in Hindi/English/Hinglish with wedding context

## 🧠 AI Layer (GPT-5.2 via Emergent Universal Key)
| Agent | Responsibility |
|---|---|
| Planner | Prioritized planning actions |
| Guest | RSVP pattern insights & next actions |
| Budget | Saving tips with ₹ estimates + warnings |
| Catering | Menu/portion/wastage strategies |
| Vendor | Missing categories + selection tips |
| Risk | 0–100 risk score + mitigations |

Each agent gathers wedding context (guests, expenses, events) and returns structured JSON.

## 🏗️ Stack
- **Frontend** — React 19 · React Router 7 · Tailwind · Shadcn UI · Framer Motion · Recharts
- **Backend** — FastAPI (async) · Motor (MongoDB) · JWT · bcrypt · reportlab · qrcode
- **AI** — `emergentintegrations` LlmChat (GPT-5.2, streaming)
- **DB** — MongoDB (collections: users, weddings, guests, vendors, bookings, expenses, invitations, events, tasks, hub_posts, rooms, chat_messages, notifications)

## 🔑 Environment
```bash
# backend/.env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
EMERGENT_LLM_KEY=sk-emergent-...
JWT_SECRET=change_me
JWT_ALGORITHM=HS256

# frontend/.env
REACT_APP_BACKEND_URL=https://your-domain.com
```

## 🚀 Run
```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn server:app --reload --port 8001

# Frontend
cd frontend && yarn && yarn start
```

## 🔌 API Highlights
| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` | JWT |
| GET / POST | `/api/weddings` | Per-user weddings |
| CRUD | `/api/weddings/{wid}/guests` | + PATCH RSVP |
| POST | `/api/weddings/{wid}/headcount` | Heuristic attendance prediction |
| GET | `/api/vendors?category=` | Marketplace |
| CRUD | `/api/weddings/{wid}/expenses` | + budget summary |
| POST | `/api/weddings/{wid}/invitations` | + public slug |
| POST | `/api/public/invitations/{slug}/rsvp` | Public guest RSVP |
| CRUD | `/api/weddings/{wid}/events` · `/tasks` | Timeline |
| CRUD | `/api/weddings/{wid}/hub` | Family hub |
| CRUD | `/api/weddings/{wid}/rooms` | + `/auto-allocate` |
| GET | `/api/weddings/{wid}/guests/{gid}/qr` | PNG QR |
| POST | `/api/checkin` | Scan QR |
| POST | `/api/weddings/{wid}/agents/{planner\|guest\|budget\|catering\|vendor\|risk}` | AI agents |
| GET | `/api/weddings/{wid}/analytics` | Health score + forecasts |
| GET | `/api/weddings/{wid}/export/guests.csv` · `report.pdf` | Exports |
| POST | `/api/assistant/chat` (SSE) | Streaming Shaadi Saheli |

## 📊 Entity Model
```
User ─< Wedding ─< Guest
              ├─< Expense
              ├─< Event ─< Task
              ├─< Invitation
              ├─< HubPost
              ├─< Room
              └─< Booking >─ Vendor

ChatMessage (session_id, user_id)
Notification (user_id, wedding_id)
```

## 🧪 Test Credentials
Create on demand at `/signup` (no seeded users) or use the seeded sample after signing up — register fresh accounts for clean isolation.

## 📦 Deploy
Set the four env vars, point `REACT_APP_BACKEND_URL` to the public backend domain, ensure MongoDB is reachable, and supervisor will manage both processes. CORS is permissive by default for staging.

---

**Designed & Developed by Jigyansh Kumar** · Built for final-year engineering projects, startup MVPs and production SaaS.
