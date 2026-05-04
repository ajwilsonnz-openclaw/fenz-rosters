# FENZ Overtime Rostering — Development Plan

> **For AI agents:** Read[ENGINE_V2_DESIGN.md](./ENGINE_V2_DESIGN.md) for the authoritative allocation engine design.

---

## 1. Project Overview

Multi-district overtime allocation system for **Fire and Emergency New Zealand (FENZ)**. 
**Tech Stack:** Next.js 16.2.2, PostgreSQL 14 (Self-Hosted Supabase), React 19, Tailwind CSS.

---

## 2. Priority Task List

### Completed Milestones
- [x] Shift engine from 8-block distance-sweep to 18-Group Global Sort (Ride-ups and Ride-downs).
- [x] Implement Pre-Flight Surplus check to dynamically reward FF Ride-Ups.
-[x] Build Per-Vacancy Must/Might/Won't threshold calculation.
- [x] Decouple UI table rendering order from Backend Engine execution order.
- [x] Restructure Engine API wrapper to generate `ot_offers` (pending state) instead of forced assignments.
- [x] Extract legacy PWA components and integrate them into the new `(pwa)` Route Group.
- [x] Build Smart Distance selection modal in the PWA `/availability` route.

### Immediate Next Steps (For Antigravity AI)
- [x] **Shift Engine Availability Logic:** Rewrite `src/app/api/allocate/route.ts` to fetch records from the `availability` table (filtering by date and shift_type). Pass this list into `allocation-engine-v2.ts`.
- [x] **Update Engine Rules:** Modify `allocation-engine-v2.ts` to strictly ignore the old `want_to_work_day/night` booleans. Instead, assert that a firefighter is only eligible if they exist in the passed `availability` array, AND the vacancy's `station_id` exists in their `preferences` JSON.
- [x] **Build the Firefighter Response Endpoint:** Create `/api/offers/respond` to handle Accept/Decline actions from the PWA.
- [x] **The Rejection Backfill Loop:** When the PWA sends a Decline, trigger a targeted API call to the Engine to read the `requestExclusions`, recalculate the pool, and fire off a new offer to the next-in-line Backup candidate.

### Medium Term
- [x] **Authentication (Supabase Auth):** Implement secure login. **IMPORTANT:** Currently, `rebecca.taylor@fenz.slack.com` is hardcoded as a fallback in `(pwa)/availability/page.tsx`, `profile/page.tsx`, `confirmed/page.tsx`, and `offers/page.tsx`. This must be removed once Auth is active.
- [ ] **Push Notifications:** Wire up the VAPID keys to send a real web-push ping when `ot_offers` are generated.
- [ ] **Historical Analytics & Reporting.**
- [ ] **Admin Manual Override Interface:** For handling leave/exceptional circumstances.