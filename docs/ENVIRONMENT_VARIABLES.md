# Environment Variables Guide

This document lists the environment variables required for QuantaLab.

## Frontend

Create `frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:8000/api
```

The app also accepts the public Supabase names used in many auth examples:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Backend

Create `backend/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
GEMINI_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

`SUPABASE_SERVICE_KEY` is preferred for trusted backend operations. Use `SUPABASE_ANON_KEY` only for limited fallback scenarios.

## Where To Find Values

- Supabase URL and keys: Supabase Dashboard > Project Settings > API.
- Gemini API key: Google AI Studio > Get API Key.
- API base URL: your FastAPI backend URL.

## Security Notes

- Never commit `.env` files.
- Treat the Supabase service role key as a backend-only secret.
- Only expose anon/public keys to the frontend.
- Restart dev servers after changing environment variables.

## Troubleshooting

**Supabase session does not load**
- Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set.
- Confirm the Google provider redirect URL matches `/auth/callback`.
- Confirm Email provider is enabled if using email/password sign in.

**Backend cannot connect to Supabase**
- Confirm `SUPABASE_URL` is set.
- Confirm `SUPABASE_SERVICE_KEY` or `SUPABASE_ANON_KEY` is set.

**Gemini features fail**
- Confirm `GEMINI_API_KEY` is configured and valid.
