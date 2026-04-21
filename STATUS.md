# FENZ Overtime Allocation — Status

## 2026-04-19 — Spec Rewrite Complete

**Status:** 🔄 In Progress — allocation engine rebuild running as subagent (e7040805)
**Supabase:** Schema applied to Docker DB (fenz_ot). Seed data dumped. CLI at /tmp/supabase v2.90.0.

**URL:** `http://100.77.94.99:3005/`
**Server:** `next-server` (pid 530082) serving `/home/ubuntu/fenz-ot-prototype`
**DB:** PostgreSQL 14 on port 5433 (`fenz_ot`)

### Doc Audit Complete (2026-04-19)

| File | Action |
|------|--------|
| `SPEC.md` | New — authoritative allocation engine design (8 blocks, distance phases, groups, preferences, specialist fill) |
| `SELECTION_LOGIC.md` | Rewritten — references SPEC.md, covers algorithm overview |
| `PLAN.md` | Rewritten — schema, watch math, API, bugs, file structure, commands |
| `IMPLEMENTATION_NOTES.md` | Rewritten — engine patterns, DB notes, testing |
| `STATUS.md` | This file |
| `AGENTS.md` | Stub (no change needed) |
| `CLAUDE.md` | Stub (no change needed) |
| `README.md` | Boilerplate Next.js readme (no change needed) |

### Design Changes In Progress

The allocation engine (`src/engine/allocation-engine.ts`) is currently the **old architecture** (sequential station processing, 5-phase cascade). It needs to be rebuilt to the **new architecture** described in SPEC.md:

- **Blocks 1-8** instead of Phases 1-5
- **Distance sweeps** (0km → max) within each Block
- **All stations processed simultaneously** at each distance phase
- **Groups** running in parallel: District FF groups, SO, SSO
- **Preferences** field on all firefighters (not just officers)
- **Specialist fill** applies to all ranks (officers too)

### Next Steps

1. [ ] Rebuild `allocation-engine.ts` to new spec
2. [ ] Add `preferences` JSONB column to `firefighters` table
3. [ ] Fix and verify test endpoint works
4. [ ] Run 3rs test, compare output to expected

### Server Status

```bash
pm2 list                 # mission-control, mole-hunt-backend, mole-hunt-web
ss -tlnp | grep 3005     # next-server (pid 530082) on port 3005
curl http://100.77.94.99:3005/test  # Test page loads
```