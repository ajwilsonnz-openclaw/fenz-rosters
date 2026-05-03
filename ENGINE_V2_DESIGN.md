# FENZ Overtime Allocation Engine v2 — Design Specification

> **Status:** Implemented (Greedy Request-First Sort with 18-Group Cascade)
> **Updated:** May 2026

---

## Overview

The engine allocates overtime shifts across fire stations using a **Pre-Filtered Global Priority Sort** within an **18-Group Cascade**. 

It iterates through vacancies first (Specialist qualifications top-down), ensures strict geographical/rank boundaries using a centralized `matchesGroupRules` function, and calculates mathematically accurate `Must`, `Might`, and `Wont` thresholds *per vacancy*.

---

## 1. Candidate Groups (18 Strict Groups)

The engine processes candidates in up to 18 strict passes to ensure rank requirements and safety-net ride-downs are respected. 

| ID | Group Name | Phase Code | Rank Filter | Target Rank | District | CB? | OT Counter |
|---|---|---|---|---|---|---|---|
| 1 | FF In-District CB | `ff-callback` | FF | FF | `in` | Yes | `callback` |
| 2 | FF In-District NCB | `ff-noncallback` | FF | FF | `in` | No | `noncallback` |
| 3 | FF OOD-Adj CB | `ood-adj-cb` | FF | FF | `ood-adj` | Yes | `callback` |
| 4 | FF OOD-Adj NCB | `ood-adj-nc` | FF | FF | `ood-adj` | No | `noncallback` |
| 5 | FF OOD-Distant CB | `ood-dist-cb` | FF | FF | `ood-dist` | Yes | `callback` |
| 6 | FF OOD-Distant NCB | `ood-dist-nc` | FF | FF | `ood-dist` | No | `noncallback` |
| 7 | SO Callback | `so-callback` | SO | SO | `any` | Yes | `officer` |
| 8 | SO Non-Callback | `so-noncallback` | SO | SO | `any` | No | `officer` |
| 9 | SSO Callback | `sso-callback` | SSO | SSO | `any` | Yes | `officer` |
| 10| SSO Non-Callback | `sso-noncallback`| SSO | SSO | `any` | No | `officer` |
| 11| FF Ride-Up CB | `ff-rideup-cb` | FF | SO | `any` | Yes | `callback` |
| 12| FF Ride-Up NCB | `ff-rideup-nc` | FF | SO | `any` | No | `noncallback` |
| 13| SSO Ride-Down (SO) CB | `sso-ridedown-so-cb` | SSO | SO | `any` | Yes | `officer` |
| 14| SSO Ride-Down (SO) NCB| `sso-ridedown-so-nc` | SSO | SO | `any` | No | `officer` |
| 15| SO Ride-Down (FF) CB | `so-ridedown-ff-cb` | SO | FF | `any` | Yes | `officer` |
| 16| SO Ride-Down (FF) NCB | `so-ridedown-ff-nc` | SO | FF | `any` | No | `officer` |
| 17| SSO Ride-Down (FF) CB | `sso-ridedown-ff-cb` | SSO | FF | `any` | Yes | `officer` |
| 18| SSO Ride-Down (FF) NCB| `sso-ridedown-ff-nc` | SSO | FF | `any` | No | `officer` |

### 1.1 The Pre-Flight Surplus Check (Dynamic Execution Order)
Before running, the engine compares Total Available FFs against Total FF Vacancies.
*   **Surplus (Supply > Demand):** FF Ride-Up groups (11 & 12) jump ahead of normal FF groups (1-6). This rewards FFs with career progression.
*   **Shortage (Supply <= Demand):** FF Ride-Up groups stay at the bottom. FFs are forced to cover FF slots, leaving SO slots empty for SSOs to cover via Ride-Downs.

---

## 2. The Iteration Loop & Per-Vacancy Thresholds

1. **Specialists First:** Vacancies (`ot_requests`) are sorted by number of `required_qualifications` descending. PRT/Type4 slots are always evaluated before generic slots to prevent generic candidates from stealing specialized personnel.
2. **Per-Vacancy Math:** The engine filters all valid candidates for a specific vacancy and groups them into OT Count buckets.
   * If the bucket size `≤` remaining slots for *that specific vacancy*, they are **Must**.
   * The bucket that crosses the zero-slot line becomes **Might** (Maybe).
   * All subsequent buckets become **Won't** (Backup).
3. **Greedy Sort:** Candidates for the vacancy are sorted by `[Threshold -> OT Count -> Distance]` and assigned greedily. Wont/Backup candidates are preserved in the pool.

---

## 3. Candidate Availability (NEXT PHASE IMPLEMENTATION)

**Goal:** The engine must stop relying on global `want_to_work_day` booleans in the `firefighters` table. 
Instead, it must strictly cross-reference the `availability` table (populated by the PWA). 
A firefighter is only eligible to be evaluated for a shift if they have an active record in the `availability` table for that exact `[date, shift_type]`, and the target vacancy station exists within their `preferences` JSON.