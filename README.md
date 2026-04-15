# SolarFlow CRM

Residential Solar CRM + Project Management — Next.js + Supabase + Vercel

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.local.example` to `.env.local` and add your Supabase anon key:
```bash
cp .env.local.example .env.local
```
Open `.env.local` and paste your anon key.

### 3. Run the database schema
- Go to your Supabase project → SQL Editor
- Paste the contents of `supabase/schema.sql` and run it

### 4. Enable email auth in Supabase
- Go to Authentication → Providers → Email → make sure it's enabled
- Go to Authentication → Users → Add user → create your login

### 5. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 6. Add your logo
Drop your logo file into `/public/logo.png` — the sidebar will use it automatically once you wire it in.

## Deploy to Vercel
```bash
npx vercel
```
Add your two env vars in the Vercel dashboard under Project Settings → Environment Variables.

## Tech Stack
- Next.js 14 (App Router)
- Supabase (Postgres + Auth + RLS)
- Vercel (hosting)
- Calibri / navy / gold / cream design system
