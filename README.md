# Driving School Auth Portal

This Vite + React app showcases a Supabase-backed authentication flow where:

- New users can create an account and choose a **user** or **admin** role.
- Returning users log in and land on a role-aware dashboard.
- Admins reach an admin control surface, while regular users are routed to a learner-focused dashboard.

## 1. Prerequisites

- [Node.js 18+](https://nodejs.org/en/download)
- A Supabase project (free tier works great)

Install dependencies:

```bash
npm install
```

## 2. Supabase setup

1. Create a **profiles** table linked to Supabase Auth:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'user',
  inserted_at timestamp with time zone default now()
);
```

2. Grant row-level access by enabling RLS on `profiles` and adding a policy such as:

```sql
alter table profiles enable row level security;

create policy "Public profiles access"
  on profiles
  for select
  using (auth.uid() = id);

create policy "Users manage their profile"
  on profiles
  for insert with check (auth.uid() = id)
  using (auth.uid() = id);
```

3. In Supabase Dashboard → **Authentication → Providers**, keep Email enabled.

4. Create a `.env` file in the project root and set:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Restart the dev server after editing env vars.

## 3. Running the app

```bash
npm run dev
```

Visit the printed URL (usually http://localhost:5173) and:

1. Switch to **Create account**, pick a role, and sign up.
2. Verify the email (if you left email confirmations on).
3. Sign in and you will automatically land on the matching dashboard.

## 4. Project structure

- `src/lib/supabaseClient.js` – Supabase singleton that reads env vars.
- `src/App.jsx` – Auth forms, dashboard routing, and profile syncing logic.
- `src/App.css` & `src/index.css` – Minimal styling for the experience.

Feel free to expand the dashboards, add routing, or plug in real data now that the foundational auth flow is set up.*** End Patch
