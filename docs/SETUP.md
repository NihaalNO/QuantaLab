# QuantaLab Setup Guide

## Prerequisites

1. Node.js 18+ and npm
2. Python 3.10+ and pip
3. Supabase project
4. Google OAuth client for Supabase Auth
5. Google Gemini API key

## 1. Supabase Setup

1. Create a Supabase project.
2. Go to Project Settings > API and copy:
   - Project URL
   - anon public key
   - service role key for backend-only use
3. Go to Authentication > Providers > Google.
4. Enable Google and add your OAuth client ID and secret.
5. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/forgot-password`
   - `http://localhost:3000/reset-password`
   - your production callback URL
6. Run `quantalab_auth_activity_schema.sql` in the Supabase SQL editor.
7. In Authentication > Providers > Email, keep email/password authentication enabled.

## 2. Frontend Setup

```bash
cd frontend
npm install
cp env.example .env
npm run dev
```

Required frontend variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:8000/api
```

The frontend runs at `http://localhost:3000` by default.

## 3. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy env.example .env
uvicorn main:app --reload
```

Required backend variables:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
GEMINI_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

The backend runs at `http://localhost:8000`; API docs are available at `http://localhost:8000/docs`.

## 4. Verify Setup

1. Open `http://localhost:3000`.
2. Click `Get Started`.
3. Sign in with Google.
4. Confirm you are redirected to `/dashboard`.
5. Confirm a profile row is created in Supabase.

## Troubleshooting

**OAuth callback fails**
- Confirm the redirect URL in Supabase exactly matches the app origin plus `/auth/callback`.
- Confirm Google provider credentials are enabled in Supabase.

**Dashboard stays empty**
- Run `quantalab_auth_activity_schema.sql`.
- Confirm RLS policies exist and the user is authenticated.

**Backend connection fails**
- Confirm Supabase backend variables are set.
- Confirm CORS includes the frontend origin.
