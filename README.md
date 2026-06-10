# 🎓 Academic Pathway Recommendation Engine

A full-stack web application that recommends the best academic programme based on a user's background, qualifications, and career goals — complete with a personalised explanation and step-by-step roadmap.

Built with **React + Vite + Tailwind CSS** (frontend), **Node.js + Express** (backend), **Supabase** (PostgreSQL), and **Nodemailer** for email notifications.

---

## ✨ Features

| Feature | Detail |
|---|---|
| Smart recommendation engine | Rules-based engine covering Certification, DBA, PhD, Honorary Doctorate |
| Personalised explanation | Every recommendation includes a plain-English rationale |
| Step-by-step roadmap | 5-6 actionable steps tailored to each pathway |
| Email notification | Nodemailer sends a branded HTML email on submission |
| Submissions dashboard | Table view with expandable explanation rows; skeleton loading |
| Analytics dashboard | KPI cards, distribution bars, daily trend chart, avg-experience grid |
| Mobile responsive | Full mobile layout for all pages |
| Deployment ready | `render.yaml`, `vercel.json`, `_redirects` included |

---

## 🗂 Project Structure

```
academic-pathway/
├── backend/
│   ├── index.js                  # Express server, CORS, health check
│   ├── supabase.js               # Supabase client
│   ├── mailer.js                 # Nodemailer — HTML email template
│   ├── render.yaml               # Render deployment config
│   ├── routes/
│   │   └── recommendation.js     # POST /recommendation · GET /submissions · GET /analytics
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html
    ├── vite.config.js            # /api proxy for development
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vercel.json               # SPA rewrite rule for Vercel
    ├── public/
    │   └── _redirects            # SPA fallback for Netlify
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx               # Router + Navbar (Home · Submissions · Analytics)
        ├── index.css             # Tailwind directives + component classes
        └── pages/
            ├── Home.jsx          # Recommendation form → result card (explanation + roadmap)
            ├── Submissions.jsx   # All submissions table with expandable explanation
            └── Analytics.jsx     # KPI dashboard, distribution bars, daily trend chart
```

---

## 🧠 Recommendation Logic

| Condition | Recommendation |
|-----------|---------------|
| Bachelor + < 2 years experience | Certification Program |
| (Bachelor \| Master) + 2–8 yrs + leadership/business keywords | DBA |
| Master + research/academic keywords | PhD |
| > 15 years + senior/leadership keywords | Honorary Doctorate |
| All other cases | Certification Program (default) |

Each outcome includes a detailed **explanation** and a **6-step roadmap** computed server-side and returned in the API response.

---

## 🗄 Supabase Setup

### 1. Create a project

Go to [supabase.com](https://supabase.com), create a new project, and note your **Project URL** and **Anon Key** from **Settings → API**.

### 2. Create the `submissions` table

Run the following SQL in the **Supabase SQL Editor**:

```sql
CREATE TABLE submissions (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name        TEXT          NOT NULL,
  email            TEXT          NOT NULL,
  qualification    TEXT          NOT NULL,
  years_experience INTEGER       NOT NULL,
  profession       TEXT          NOT NULL,
  career_goal      TEXT          NOT NULL,
  recommendation   TEXT          NOT NULL,
  explanation      TEXT,                       -- personalised rationale
  created_at       TIMESTAMPTZ   DEFAULT timezone('utc', now()) NOT NULL
);

-- Row Level Security (allow public read/write for this demo)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select" ON submissions
  FOR SELECT USING (true);
```

> **Existing table?** Add the new column with:
> ```sql
> ALTER TABLE submissions ADD COLUMN IF NOT EXISTS explanation TEXT;
> ```

---

## ⚙️ Environment Variables

### Backend — `backend/.env`

```env
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server
PORT=5000
NODE_ENV=development

# CORS — comma-separated, e.g. http://localhost:3000,https://academic-pathway.vercel.app
FRONTEND_URL=http://localhost:3000

# Email (Nodemailer) — leave blank to disable
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=you@gmail.com
```

### Frontend — `frontend/.env`

```env
# Leave blank in development (Vite proxy handles /api automatically)
# Set to your Render URL in production, e.g. https://academic-pathway-api.onrender.com
VITE_API_URL=
```

---

## 🚀 Running Locally

### Prerequisites

- Node.js ≥ 18 and npm
- A Supabase project (see above)

```bash
# 1. Clone
git clone https://github.com/your-username/academic-pathway.git
cd academic-pathway

# 2. Backend
cd backend
npm install
cp .env.example .env
# → fill in SUPABASE_URL + SUPABASE_ANON_KEY in .env
npm run dev          # http://localhost:5000

# 3. Frontend (new terminal)
cd ../frontend
npm install
cp .env.example .env
npm run dev          # http://localhost:3000
```

---

## 🌐 API Reference

### `POST /api/recommendation`

```json
// Request
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "qualification": "Master",
  "yearsExperience": 4,
  "profession": "Data Scientist",
  "careerGoal": "I want to pursue academic research and publish papers in AI."
}

// Response 201
{
  "message": "Recommendation generated successfully.",
  "recommendation": "PhD",
  "explanation": "A Master's degree combined with clear research...",
  "roadmap": [
    "Identify potential supervisors...",
    "Apply to PhD programmes...",
    "..."
  ],
  "submission": { ...db row }
}
```

### `GET /api/submissions`

Returns all submissions ordered by `created_at DESC`.

### `GET /api/analytics`

```json
{
  "total": 42,
  "byRecommendation": { "Certification Program": 18, "DBA": 12, "PhD": 9, "Honorary Doctorate": 3 },
  "byQualification": { "Master": 20, "Bachelor": 16, "High School": 6 },
  "dailyTrend": [ { "date": "2025-01-01", "count": 2 }, ... ],
  "avgExperienceByRecommendation": { "DBA": 5.2, "PhD": 3.8, ... }
}
```

### `GET /health`

Returns `{ "status": "ok", "timestamp": "..." }`.

---

## 🚢 Deployment

### Backend → Render

1. Push code to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service** → connect repo.
3. Set **Root Directory** to `backend`.
4. **Build command:** `npm install` · **Start command:** `node index.js`
5. Add env vars in the Render dashboard (see `.env.example`).
   - Set `FRONTEND_URL` to your Vercel frontend URL.
6. Deploy — note the service URL (e.g. `https://academic-pathway-api.onrender.com`).

> A `render.yaml` is included in `backend/` for blueprint-based deployment.

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add Project** → import repo.
2. Set **Root Directory** to `frontend`.
3. Add env var `VITE_API_URL` = your Render backend URL.
4. Deploy.

> `vercel.json` handles SPA client-side routing rewrites automatically.

### Frontend → Netlify (alternative)

1. Set **Base directory** to `frontend`, **Build command** to `npm run build`, **Publish directory** to `dist`.
2. Add `VITE_API_URL` env var.
3. The `public/_redirects` file handles SPA routing fallback.

---

## 📧 Email Setup (optional)

The app works without email — notifications are fire-and-forget and non-blocking. To enable:

**Gmail (recommended for dev/demo):**
1. Enable 2-Factor Authentication on your Google account.
2. Generate an **App Password** at myaccount.google.com/apppasswords.
3. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=you@gmail.com`, `SMTP_PASS=<app_password>`.

**Mailtrap (testing):**
1. Create a free account at [mailtrap.io](https://mailtrap.io).
2. Copy the SMTP credentials from your inbox settings.

---

## 🎨 Recommendation Badge Colours

| Programme | Colour |
|-----------|--------|
| Certification Program | 🟢 Green |
| DBA | 🔵 Blue |
| PhD | 🟣 Purple |
| Honorary Doctorate | 🟡 Yellow/Gold |

---

## 📄 License

MIT — free to use, modify, and distribute.
