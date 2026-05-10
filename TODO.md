# FENZ Roster Prototype - Pending Issues

## Matrix Dashboard
- [x] **Filter Desync**: (Fixed) Callback and Day/Night filters now have unique IDs per firefighter and work independently.
- [x] **Modal Layout**: (Fixed) Matrix modal action button overflow fixed by constraining max-height to the phone frame.

## PWA (Firefighter App)
- [x] **Availability Management**: (Fixed) Unified 'Review Changes' modal for additions and removals. Removed red cross. Optimized performance by fixing Supabase lock contention in Matrix.
- [x] **Confirmed Status**: (Fixed) Roster tab now shows 'Shift Confirmed' instead of 'Pending Allocation'.

## Allocation Engine / Admin
- [ ] **Vacancy Deletion**: Currently unable to delete vacancies once created.
- [ ] **Declined Offers**: Investigate issues occurring when overtimes are turned down (User reported issues here).

## Admin
- [ ] **Admin Dashboard**: Implement general administrative oversight and settings.

