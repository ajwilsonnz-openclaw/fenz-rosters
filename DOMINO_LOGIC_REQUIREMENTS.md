# FENZ Overtime Prototype: Domino Logic Requirements

This document serves as the authoritative record of the "Domino Logic" requirements for the FENZ Overtime Prototype, compiled from historical user directives and technical feedback sessions.

## 1. Core Definition (Adam's Intricate Domino Logic)

> "I already told you that if someone is moved from their home station then it leaves a gap at that station and the logic then needs to look for someone to fill that station and then if that person is moved it leaves a gap etc... That is the intricate domino logic I was talking about."

The system must recognize that a single vacancy at one station often triggers a sequence of movements. If a Firefighter (FF) who is already working their normal shift at their **Home Station** is moved to fill an Overtime (OT) vacancy at another station, they leave a "hole" at their Home Station that now needs to be filled.

## 2. Technical Algorithm Requirements

### 2.1 Chain Tracing (Backward Search)
The domino chain must be built by tracing existing assignments in the database for the selected date and shift:

1.  **Initial Hole**: The station selected by the Officer (the target vacancy).
2.  **Trace Step**: Look for any `ot_assignment` where the assigned station matches the current hole.
3.  **Gap Detection**: If an assigned FF's `home_station` is different from the station they are filling, the `home_station` becomes the **New Hole**.
4.  **Recurse**: Repeat the search for the New Hole until a station is reached that has no assigned replacement.
5.  **Final Hole**: The last station in the chain is the "Final Remaining Hole" where the actual candidate selection must occur.

### 2.2 Strict Database Reality
> "The system should show the existing Domino Chain (based strictly on real `ot_assignments` already in the DB). If the engine already moved someone from Henderson to fill Devonport, *that* is a move."

*   **No "Suggested" Moves**: Candidates who have not yet been assigned must **never** appear in the domino chain.
*   **Marama Scenario (Failure Case)**: If Marama is at Henderson (her home station) and hasn't been assigned yet, the system must **not** show her as "moving" or leaving a gap at Henderson. She is simply an available candidate for the final hole.

## 3. UI and User Workflow Requirements

### 3.1 Candidate Selection for the Final Hole
Available candidates must be evaluated based on their distance to the **Final Remaining Hole**, not the initial station.

### 3.2 Refusal System
> "Where is the refusal and the reasons for choices etc... That I previously had."

*   **Manual Assign**: Officers must be able to click "Assign" to finalize a choice.
*   **Refusal (Decline)**: The system must provide a way to record a refusal if a candidate is called but cannot work.
*   **Reason Prompts**: When a candidate is skipped or refuses, the system must prompt for a reason (e.g., "Not available / No answer").
*   **Audit Trail**: These reasons must be stored to provide transparency on why certain candidates were bypassed.

## 4. Architectural Rules (Adam's Rule)

From the "OOD Starvation" example in the algorithm design:

*   **Priority over Distance**: The engine must ensure that higher-priority blocks (In-District) are served before lower-priority blocks (Out-of-District), BUT it must also re-evaluate if an OOD candidate is objectively better (closer) than a previous assignment.
*   **Displacement**: If a closer candidate is found in a later phase, the system should allow displacement to optimize the overall district coverage.

## 5. Key Example Scenarios

### Scenario A: The Henderson/Albany Ripple
1.  **Vacancy**: Albany needs 1 FF.
2.  **Assignment**: The engine assigned `Wiremu Hemara` (Home: Henderson) to Albany.
3.  **Domino**: The chain shows: `Wiremu moves from Henderson -> Albany`.
4.  **Final Hole**: Henderson is now the "Final Remaining Hole".
5.  **Candidates**: The list shows FFs available to work at **Henderson**.

### Scenario B: Direct Fill (No Domino)
1.  **Vacancy**: Henderson needs 1 FF.
2.  **Status**: No one from Henderson has been moved elsewhere.
3.  **Chain**: Empty.
4.  **Final Hole**: Henderson.
5.  **Candidates**: People available to work at Henderson (Callbacks on rest days).

---
**Status**: Authoritative Reference  
**Created By**: Compilation of User Directives  
**Instruction to AI**: Adhere to this logic strictly. Do not attempt to "predict" moves for unassigned candidates.
