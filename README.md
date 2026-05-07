# 🔧 Mecha Foundry

> Together, we create. Together, we build. Together, we innovate.

A full-stack platform where innovators post ideas, teams collaborate, and products launch to the world — with built-in investor deal flow.

---

## Tech Stack

| Layer       | Technology                          | Why                                      |
|-------------|-------------------------------------|------------------------------------------|
| Frontend    | React 18 + TypeScript + Vite        | Fast dev, type-safe, excellent DX        |
| Styling     | Tailwind CSS + custom CSS vars      | Scalable design system                   |
| State       | Zustand (auth) + TanStack Query (server state) | Minimal boilerplate, great caching |
| Routing     | TanStack Router                     | Type-safe routes, file-based in future   |
| Forms       | React Hook Form + Zod               | Validation co-located with schemas       |
| Backend     | Supabase                            | Auth, DB, realtime, storage, RLS — all-in-one |
| Hosting     | Vercel (frontend) + Supabase (backend) | Zero-config deployment                |

---

## Project Structure

```
src/
├── components/
│   ├── auth/          # AuthProvider, AuthPage (sign in / sign up)
│   ├── layout/        # Navbar, Sidebar, PageShell
│   ├── ideas/         # IdeaCard, PostIdeaModal, ApplyModal, ApplicationsPanel
│   ├── groups/        # (expand here: GroupCard, MilestoneList, UpdateFeed)
│   └── ui/            # Button, Badge, Avatar, Input, Modal, Spinner, etc.
├── pages/             # One file per route: IdeasPage, GroupsPage, MarketplacePage, InvestorsPage, SettingsPage
├── hooks/             # useIdeas.ts, useData.ts — all TanStack Query wrappers
├── lib/
│   ├── api/           # ideas.ts, applications.ts, groups.ts, products.ts, auth.ts
│   ├── supabase.ts    # Supabase client
│   ├── database.types.ts # Generated DB types
│   └── utils.ts       # cn(), timeAgo(), badge helpers, etc.
├── store/
│   └── auth.store.ts  # Zustand auth store with persistence
├── types/
│   └── index.ts       # All TypeScript interfaces
├── router.tsx         # TanStack Router setup
└── main.tsx           # App entry point
supabase/
└── migrations/
    └── 001_initial_schema.sql  # Full Postgres schema + RLS policies
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-org/mecha-foundry.git
cd mecha-foundry
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. In the SQL editor, paste and run `supabase/migrations/001_initial_schema.sql`
3. Enable GitHub OAuth: **Authentication → Providers → GitHub** → add your GitHub OAuth app credentials
4. Copy your **Project URL** and **anon public key** from **Settings → API**

### 3. Configure Environment

```bash
cp .env.example .env
```

Fill in `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Platform Flow

```
1. User signs up → profile created automatically (trigger)
2. Creator posts idea (title, problem, solution, stage, category, collab setting)
3. Viewers apply to collaborate
4. Creator reviews applications → accepts/rejects
5. On acceptance → project group auto-created, member added
6. Team posts updates, checks off milestones in group
7. Product finalized → published to Marketplace
8. If funding wanted → pitch created on Investor tab
9. Investors browse pitches, contact founders via in-app messages
```

---

## Roles

| Role     | Can Do                                                               |
|----------|----------------------------------------------------------------------|
| Viewer   | Browse, upvote, save, comment, apply to collaborate, request invest  |
| Creator  | All viewer actions + post ideas, manage groups, publish products     |
| Investor | All viewer actions + access deal flow, contact founders              |

Users can switch roles in Settings at any time.

---

## Key Files to Extend

### Add a new page
1. Create `src/pages/NewPage.tsx`
2. Add route in `src/router.tsx`
3. Add nav link in `src/components/layout/Navbar.tsx`

### Add a new data model
1. Add SQL table to `supabase/migrations/`
2. Add TypeScript interface to `src/types/index.ts`
3. Add API functions to `src/lib/api/`
4. Add React Query hooks to `src/hooks/`

### Regenerate Supabase types
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set these environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Docker (self-host)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

---

## Scale Path

This architecture is designed to grow:

| Stage       | What to add                                                   |
|-------------|---------------------------------------------------------------|
| Now (MVP)   | Supabase free tier, Vercel hobby — zero cost                  |
| 1k users    | Supabase Pro, add Realtime subscriptions for group chat       |
| 10k users   | Add Redis for caching, Supabase read replicas                 |
| 100k users  | Migrate to dedicated Postgres + separate API layer (FastAPI/Node) |
| Platform    | Add Stripe for marketplace fees, Supabase Edge Functions for webhooks |

### Planned Features (backlog)
- [ ] Real-time group chat (Supabase Realtime)
- [ ] File attachments (Supabase Storage)
- [ ] Notification system (push + email)
- [ ] Full-text search (Postgres `tsvector` already indexed)
- [ ] Investor verification flow
- [ ] Platform fee on investment deals
- [ ] Mobile app (React Native + same API)
- [ ] GitHub integration (auto-link commits to milestones)
- [ ] AI idea validation (Anthropic API)

---

## License

MIT — build something amazing.

---

*Mecha Foundry — and after success, we all invest in Moon's Kitchen 🍜*
