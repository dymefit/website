# ProgramLab

An exercise-programming web app for coaches. Manage clients, build training
programs day-by-day, and schedule sessions on a calendar.

- **Frontend:** React + Vite
- **Backend / auth / database:** Supabase (hosted Postgres)
- **Layout:** 20% sidebar (clients, programs, calendar) · 80% main program view

---

## One-time setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account + new project.
2. Wait for it to finish provisioning (~1 min).

### 3. Load the database schema

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
   This creates the tables (clients, programs, days, exercises, sessions),
   indexes, and row-level-security policies so each coach only sees their own data.

### 4. Add your project keys

1. In Supabase: **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. In this folder, copy the example env file and fill it in:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

### 5. (Optional) Make signups instant for local dev

By default Supabase emails a confirmation link on signup. To skip that while
developing: **Authentication → Providers → Email → turn off "Confirm email"**.

---

## Run it

```bash
npm run dev
```

Open the URL it prints (default <http://localhost:5173>). Create an account,
then:

1. **Add a client** (+ in the Clients panel).
2. **Add a program** for that client (+ in the Programs panel).
3. **Add training days** and **exercises** in the main view — everything is
   editable (edit, delete, reorder).
4. Switch to **Calendar** and click any date to schedule one of that client's
   program days. Click a scheduled tag to remove it.

All data is saved to your Supabase database and synced across devices/logins.

---

## Project structure

```
index.html              Vite entry
supabase/schema.sql     Database schema + RLS (run once in Supabase)
src/
  main.jsx              React root
  App.jsx               Auth gate + top-level state
  auth.jsx              Supabase auth context
  styles.css            All styles
  lib/
    supabase.js         Supabase client (reads .env)
    api.js              All database queries (CRUD)
  components/
    Login.jsx           Sign in / sign up
    Sidebar.jsx         20% column: clients, programs, nav
    ProgramView.jsx     80% column: editable days + exercises
    CalendarView.jsx    Month calendar + session scheduling
    Modal.jsx           Reusable modal
legacy/                 Original vanilla-JS prototype (reference only)
```

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

When you're ready to deploy (Vercel/Netlify), set the two `VITE_SUPABASE_*`
environment variables in the host's dashboard.
