# FENZ Overtime Allocation Prototype — Status Log

## 2026-04-05 — Regression Cycles 1-5 Complete
- **Status:** ✅ ALL FIXES DEPLOYED & VERIFIED
- **URL:** `http://100.77.94.99:3005/`
- **Server:** `npx next start -p 3005` running via `setsid`
- **DB:** PostgreSQL 14 on port 5433 (`fenz_ot`)
- **Seed:** 40 stations, 20 firefighters (IDs 81–100), 4 watch anchors, system settings
- **Restart script:** `bash restart-fenz.sh` (atomically reseed + restart server)
- **All 5 regression cycles passed** (all fixes verified live)

### Current Skills Installed
- `architecture-designer` — System architecture reviews
- `code-refactoring-planner` (Journey) — Refactoring analysis, impact assessment
- `e2e-testing` — End-to-end testing workflows
- `e2e-testing-patterns` — Systematic E2E testing
- `nextjs` — Next.js-specific best practices
- `postgresql-db` — PostgreSQL management, query optimization
- `project-planning` — Project planning & work breakdown
- `qa-browser-tester` — Black-box browser QA testing
- `react-expert` — React best practices
- `react-typescript` — React TypeScript patterns
- `vitest-testing` — Unit/integration testing with Vitest

### Open Items / Backlog
- [ ] Accept/Decline forms on /firefighter page (server actions point to localhost:3005 — need DB direct calls)
- [ ] Seed API route (`/api/seed`) still broken (NULL constraint on Yellow watch anchor) — but `seed-fix.ts` + `restart-fenz.sh` works
- [ ] Add `sm:` responsive breakpoints (tablet range 640–760px)
- [ ] Add security headers (X-Frame-Options, X-Content-Type-Options)
- [ ] Add robots.txt
- [ ] Add specialist_type dropdown UI on /officer form
- [ ] Show "Firefighter not found" for invalid `?ff=` IDs (currently graceful but silent)
- [ ] Add per-page metadata titles (e.g., "Officer OT Management | FENZ")

### Architecture
- Next.js 16 (App Router, Tailwind, TypeScript)
- Raw `pg` client to local PostgreSQL 14
- All pages marked `export const dynamic = 'force-dynamic'` to prevent stale prerendering
- Allocation engine: `src/engine/allocation-engine.ts` (530 lines)
- Seed script: `seed-fix.ts` (works reliably, idempotent via TRUNCATE CASCADE)

### Lessons Learned
- **`fuser -k` kills seed processes too** — use `lsof -ti :3005 | xargs kill` instead
- **TRUNCATE CASCADE** on areas doesn't clear watch_anchors — must truncate both separately
- **Rebuild AFTER seeding** — Next.js `npx next start` serves static prerendered HTML if pages aren't force-dynamic
- **Force-dynamic pages always fetch live data** — no stale cache issues
