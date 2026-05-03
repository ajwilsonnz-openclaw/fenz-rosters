# Project Snapshot: FENZ OT Prototype

> **Note**: This is a best-effort snapshot of the current state of the project. It is possible that some legacy code or logic from previous iterations might be mixed in, as this project is evolving rapidly.

## File Structure
```
├── data/
│   └── station_distances.json
├── memory/
│   └── 2026-04-05.md
├── Screenshots/
│   └── Screenshot 2026-04-26 194742.png
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── officer/
│   │   │   │   └── page.tsx
│   │   │   └── rosters/
│   │   │       ├── filled/
│   │   │       │   └── page.tsx
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── allocate/
│   │   │   │   └── route.ts
│   │   │   ├── chat-test/
│   │   │   │   └── route.ts
│   │   │   ├── debug/
│   │   │   │   └── route.ts
│   │   │   ├── officer/
│   │   │   │   └── evaluate/
│   │   │   │       └── route.ts
│   │   │   ├── seed/
│   │   │   │   └── route.ts
│   │   │   └── test/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DateToolbar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── collapsible.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── progress.tsx
│   │       ├── scroll-area.tsx
│   │       ├── separator.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   ├── engine/
│   │   ├── allocation-debug.ts
│   │   ├── allocation-engine-v2.ts
│   │   ├── allocation-engine.ts
│   │   ├── allocation-engine.ts.bak
│   │   ├── allocation-engine.ts.bak2
│   │   ├── allocation-engine.ts.bak3
│   │   ├── ui-helpers.ts
│   │   └── watch-math.ts
│   └── lib/
│       ├── db.ts
│       ├── seed.ts
│       ├── supabase.ts
│       ├── truncate_tables.sql
│       └── utils.ts
├── supabase/
│   ├── migrations/
│   │   └── 000001_initial_schema.sql
│   ├── seeds/
│   │   ├── 001_full_seed.sql
│   │   └── 001_reference_data.sql
│   ├── .gitignore
│   └── config.toml
├── .env.local
├── .gitignore
├── AGENTS.md
├── ALGORITHM.md
├── check-watch.ts.bak
├── CLAUDE.md
├── components.json
├── ecosystem-fenz.js
├── ENGINE_V2_DESIGN.md
├── eslint.config.mjs
├── IMPLEMENTATION_NOTES.md
├── next-env.d.ts
├── next.config.ts
├── package.json
├── PLAN.md
├── postcss.config.mjs
├── README.md
├── regression-check.sh
├── restart-fenz.sh
├── run-all-tests.sh
├── run-alloc-test.ts.bak
├── run-fenz.sh
├── run-seed.mjs.bak
├── run-seed.ts.bak
├── run-tests-full.js.bak
├── run-tests.js.bak
├── run.js
├── seed-fix.ts.bak
├── seed-runner.ts
├── SELECTION_LOGIC.md
├── server.js.bak
├── SPEC.md
├── start-fenz.sh
├── start-server.js
├── STATUS.md
├── test-alloc.mjs
├── test-allocation.mjs.bak
├── test-clean.js.bak
├── test-engine.js.bak
├── test-engine.mjs.bak
├── test-full.js.bak
├── test-pg.js.bak
├── test-pg2.js.bak
├── test-pure.js.bak
├── test-report.js.bak
├── test-runner.js.bak
├── test-suite.js.bak
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

--- 

## File Contents

## File: data\station_distances.json
```json
[
  {
    "station": "Albany",
    "distances": {
      "Auckland City": 17.0,
      "Remuera": 22.0,
      "Onehunga": 26.0,
      "Mt Wellington": 28.0,
      "St Heliers": 29.0,
      "Parnell": 20.0,
      "Grey Lynn": 21.0,
      "Ellerslie": 24.0,
      "Manurewa": 41.0,
      "Otahuhu": 31.0,
      "Howick": 34.0,
      "Otara": 36.0,
      "Papatoetoe": 38.0,
      "Mangere": 32.0,
      "Papakura": 45.0,
      "Avondale": 26.0,
      "Balmoral": 21.0,
      "Mt Roskill": 24.0,
      "Glen Eden": 25.0,
      "Henderson": 20.0,
      "Te Atatu": 18.0,
      "West Harbour": 12.0,
      "Titirangi": 29.0,
      "Takapuna": 6.0,
      "Devonport": 14.0,
      "Birkenhead": 9.0,
      "East Coast Bays": 7.0,
      "Albany": 0.0,
      "Silverdale": 21.0
    },
    "area": "Waitemata"
  },
  {
    "station": "Auckland City",
    "distances": {
      "Auckland City": 0.0,
      "Remuera": 6.0,
      "Onehunga": 10.0,
      "Mt Wellington": 13.0,
      "St Heliers": 13.0,
      "Parnell": 4.0,
      "Grey Lynn": 3.0,
      "Ellerslie": 9.0,
      "Manurewa": 26.0,
      "Otahuhu": 14.0,
      "Howick": 19.0,
      "Otara": 20.0,
      "Papatoetoe": 22.0,
      "Mangere": 16.0,
      "Papakura": 30.0,
      "Avondale": 9.0,
      "Balmoral": 5.0,
      "Mt Roskill": 8.0,
      "Glen Eden": 15.0,
      "Henderson": 16.0,
      "Te Atatu": 12.0,
      "West Harbour": 18.0,
      "Titirangi": 16.0,
      "Takapuna": 12.0,
      "Devonport": 14.0,
      "Birkenhead": 10.0,
      "East Coast Bays": 20.0,
      "Albany": 17.0,
      "Silverdale": 34.0
    },
    "area": "Auckland"
  },
  {
    "station": "Avondale",
    "distances": {
      "Auckland City": 9.0,
      "Remuera": 13.0,
      "Onehunga": 10.0,
      "Mt Wellington": 19.0,
      "St Heliers": 20.0,
      "Parnell": 11.0,
      "Grey Lynn": 7.0,
      "Ellerslie": 13.0,
      "Manurewa": 27.0,
      "Otahuhu": 17.0,
      "Howick": 23.0,
      "Otara": 27.0,
      "Papatoetoe": 22.0,
      "Mangere": 15.0,
      "Papakura": 32.0,
      "Avondale": 0.0,
      "Balmoral": 6.0,
      "Mt Roskill": 6.0,
      "Glen Eden": 6.0,
      "Henderson": 9.0,
      "Te Atatu": 9.0,
      "West Harbour": 15.0,
      "Titirangi": 8.0,
      "Takapuna": 19.0,
      "Devonport": 20.0,
      "Birkenhead": 16.0,
      "East Coast Bays": 26.0,
      "Albany": 26.0,
      "Silverdale": 42.0
    },
    "area": "Auckland"
  },
  {
    "station": "Balmoral",
    "distances": {
      "Auckland City": 5.0,
      "Remuera": 6.0,
      "Onehunga": 6.0,
      "Mt Wellington": 12.0,
      "St Heliers": 12.0,
      "Parnell": 7.0,
      "Grey Lynn": 4.0,
      "Ellerslie": 6.0,
      "Manurewa": 25.0,
      "Otahuhu": 12.0,
      "Howick": 18.0,
      "Otara": 19.0,
      "Papatoetoe": 21.0,
      "Mangere": 14.0,
      "Papakura": 30.0,
      "Avondale": 6.0,
      "Balmoral": 0.0,
      "Mt Roskill": 4.0,
      "Glen Eden": 11.0,
      "Henderson": 15.0,
      "Te Atatu": 11.0,
      "West Harbour": 17.0,
      "Titirangi": 13.0,
      "Takapuna": 16.0,
      "Devonport": 17.0,
      "Birkenhead": 13.0,
      "East Coast Bays": 24.0,
      "Albany": 21.0,
      "Silverdale": 38.0
    },
    "area": "Auckland"
  },
  {
    "station": "Birkenhead",
    "distances": {
      "Auckland City": 10.0,
      "Remuera": 15.0,
      "Onehunga": 18.0,
      "Mt Wellington": 21.0,
      "St Heliers": 22.0,
      "Parnell": 13.0,
      "Grey Lynn": 10.0,
      "Ellerslie": 18.0,
      "Manurewa": 34.0,
      "Otahuhu": 24.0,
      "Howick": 27.0,
      "Otara": 29.0,
      "Papatoetoe": 31.0,
      "Mangere": 25.0,
      "Papakura": 39.0,
      "Avondale": 16.0,
      "Balmoral": 13.0,
      "Mt Roskill": 17.0,
      "Glen Eden": 21.0,
      "Henderson": 23.0,
      "Te Atatu": 19.0,
      "West Harbour": 20.0,
      "Titirangi": 23.0,
      "Takapuna": 6.0,
      "Devonport": 11.0,
      "Birkenhead": 0.0,
      "East Coast Bays": 13.0,
      "Albany": 9.0,
      "Silverdale": 28.0
    },
    "area": "Waitemata"
  },
  {
    "station": "Devonport",
    "distances": {
      "Auckland City": 14.0,
      "Remuera": 19.0,
      "Onehunga": 22.0,
      "Mt Wellington": 25.0,
      "St Heliers": 26.0,
      "Parnell": 17.0,
      "Grey Lynn": 14.0,
      "Ellerslie": 22.0,
      "Manurewa": 38.0,
      "Otahuhu": 28.0,
      "Howick": 31.0,
      "Otara": 33.0,
      "Papatoetoe": 35.0,
      "Mangere": 29.0,
      "Papakura": 43.0,
      "Avondale": 20.0,
      "Balmoral": 17.0,
      "Mt Roskill": 21.0,
      "Glen Eden": 27.0,
      "Henderson": 27.0,
      "Te Atatu": 23.0,
      "West Harbour": 26.0,
      "Titirangi": 29.0,
      "Takapuna": 8.0,
      "Devonport": 0.0,
      "Birkenhead": 11.0,
      "East Coast Bays": 14.0,
      "Albany": 14.0,
      "Silverdale": 32.0
    },
    "area": "Waitemata"
  },
  {
    "station": "East Coast Bays",
    "distances": {
      "Auckland City": 20.0,
      "Remuera": 25.0,
      "Onehunga": 29.0,
      "Mt Wellington": 31.0,
      "St Heliers": 32.0,
      "Parnell": 23.0,
      "Grey Lynn": 21.0,
      "Ellerslie": 27.0,
      "Manurewa": 44.0,
      "Otahuhu": 34.0,
      "Howick": 38.0,
      "Otara": 39.0,
      "Papatoetoe": 41.0,
      "Mangere": 25.0,
      "Papakura": 49.0,
      "Avondale": 26.0,
      "Balmoral": 24.0,
      "Mt Roskill": 27.0,
      "Glen Eden": 31.0,
      "Henderson": 27.0,
      "Te Atatu": 25.0,
      "West Harbour": 19.0,
      "Titirangi": 35.0,
      "Takapuna": 8.0,
      "Devonport": 14.0,
      "Birkenhead": 13.0,
      "East Coast Bays": 0.0,
      "Albany": 7.0,
      "Silverdale": 19.0
    },
    "area": "Waitemata"
  },
  {
    "station": "Ellerslie",
    "distances": {
      "Auckland City": 9.0,
      "Remuera": 4.0,
      "Onehunga": 4.0,
      "Mt Wellington": 6.0,
      "St Heliers": 9.0,
      "Parnell": 10.0,
      "Grey Lynn": 10.0,
      "Ellerslie": 0.0,
      "Manurewa": 19.0,
      "Otahuhu": 6.0,
      "Howick": 12.0,
      "Otara": 13.0,
      "Papatoetoe": 15.0,
      "Mangere": 11.0,
      "Papakura": 23.0,
      "Avondale": 13.0,
      "Balmoral": 6.0,
      "Mt Roskill": 9.0,
      "Glen Eden": 18.0,
      "Henderson": 21.0,
      "Te Atatu": 18.0,
      "West Harbour": 24.0,
      "Titirangi": 18.0,
      "Takapuna": 19.0,
      "Devonport": 22.0,
      "Birkenhead": 18.0,
      "East Coast Bays": 27.0,
      "Albany": 24.0,
      "Silverdale": 40.0
    },
    "area": "Auckland"
  },
  {
    "station": "Glen Eden",
    "distances": {
      "Auckland City": 15.0,
      "Remuera": 18.0,
      "Onehunga": 16.0,
      "Mt Wellington": 25.0,
      "St Heliers": 28.0,
      "Parnell": 17.0,
      "Grey Lynn": 12.0,
      "Ellerslie": 18.0,
      "Manurewa": 32.0,
      "Otahuhu": 22.0,
      "Howick": 28.0,
      "Otara": 32.0,
      "Papatoetoe": 27.0,
      "Mangere": 19.0,
      "Papakura": 37.0,
      "Avondale": 6.0,
      "Balmoral": 11.0,
      "Mt Roskill": 10.0,
      "Glen Eden": 0.0,
      "Henderson": 4.0,
      "Te Atatu": 7.0,
      "West Harbour": 13.0,
      "Titirangi": 4.0,
      "Takapuna": 24.0,
      "Devonport": 27.0,
      "Birkenhead": 21.0,
      "East Coast Bays": 31.0,
      "Albany": 25.0,
      "Silverdale": 45.0
    },
    "area": "Waitemata"
  },
  {
    "station": "Grey Lynn",
    "distances": {
      "Auckland City": 3.0,
      "Remuera": 11.0,
      "Onehunga": 11.0,
      "Mt Wellington": 15.0,
      "St Heliers": 17.0,
      "Parnell": 6.0,
      "Grey Lynn": 0.0,
      "Ellerslie": 10.0,
      "Manurewa": 28.0,
      "Otahuhu": 16.0,
      "Howick": 21.0,
      "Otara": 22.0,
      "Papatoetoe": 24.0,
      "Mangere": 16.0,
      "Papakura": 32.0,
      "Avondale": 7.0,
      "Balmoral": 4.0,
      "Mt Roskill": 8.0,
      "Glen Eden": 12.0,
      "Henderson": 13.0,
      "Te Atatu": 9.0,
      "West Harbour": 15.0,
      "Titirangi": 13.0,
      "Takapuna": 13.0,
      "Devonport": 14.0,
      "Birkenhead": 10.0,
      "East Coast Bays": 21.0,
      "Albany": 21.0,
      "Silverdale": 35.0
    },
    "area": "Auckland"
  },
  {
    "station": "Henderson",
    "distances": {
      "Auckland City": 16.0,
      "Remuera": 19.0,
      "Onehunga": 23.0,
      "Mt Wellington": 26.0,
      "St Heliers": 26.0,
      "Parnell": 18.0,
      "Grey Lynn": 13.0,
      "Ellerslie": 21.0,
      "Manurewa": 34.0,
      "Otahuhu": 25.0,
      "Howick": 32.0,
      "Otara": 33.0,
      "Papatoetoe": 29.0,
      "Mangere": 22.0,
      "Papakura": 39.0,
      "Avondale": 9.0,
      "Balmoral": 15.0,
      "Mt Roskill": 13.0,
      "Glen Eden": 4.0,
      "Henderson": 0.0,
      "Te Atatu": 5.0,
      "West Harbour": 9.0,
      "Titirangi": 9.0,
      "Takapuna": 25.0,
      "Devonport": 23.0,
      "Birkenhead": 23.0,
      "East Coast Bays": 27.0,
      "Albany": 20.0,
      "Silverdale": 41.0
    },
    "area": "Waitemata"
  },
  {
    "station": "Howick",
    "distances": {
      "Auckland City": 19.0,
      "Remuera": 13.0,
      "Onehunga": 14.0,
      "Mt Wellington": 7.0,
      "St Heliers": 12.0,
      "Parnell": 20.0,
      "Grey Lynn": 21.0,
      "Ellerslie": 12.0,
      "Manurewa": 16.0,
      "Otahuhu": 11.0,
      "Howick": 0.0,
      "Otara": 9.0,
      "Papatoetoe": 13.0,
      "Mangere": 18.0,
      "Papakura": 21.0,
      "Avondale": 23.0,
      "Balmoral": 18.0,
      "Mt Roskill": 19.0,
      "Glen Eden": 28.0,
      "Henderson": 32.0,
      "Te Atatu": 28.0,
      "West Harbour": 34.0,
      "Titirangi": 28.0,
      "Takapuna": 30.0,
      "Devonport": 31.0,
      "Birkenhead": 27.0,
      "East Coast Bays": 38.0,
      "Albany": 34.0,
      "Silverdale": 51.0
    },
    "area": "Counties Manukau"
  },
  {
    "station": "Mangere",
    "distances": {
      "Auckland City": 16.0,
      "Remuera": 13.0,
      "Onehunga": 7.0,
      "Mt Wellington": 15.0,
      "St Heliers": 18.0,
      "Parnell": 16.0,
      "Grey Lynn": 16.0,
      "Ellerslie": 11.0,
      "Manurewa": 17.0,
      "Otahuhu": 8.0,
      "Howick": 18.0,
      "Otara": 13.0,
      "Papatoetoe": 10.0,
      "Mangere": 0.0,
      "Papakura": 19.0,
      "Avondale": 15.0,
      "Balmoral": 14.0,
      "Mt Roskill": 11.0,
      "Glen Eden": 19.0,
      "Henderson": 22.0,
      "Te Atatu": 23.0,
      "West Harbour": 29.0,
      "Titirangi": 20.0,
      "Takapuna": 27.0,
      "Devonport": 29.0,
      "Birkenhead": 25.0,
      "East Coast Bays": 25.0,
      "Albany": 32.0,
      "Silverdale": 49.0
    },
    "area": "Counties Manukau"
  },
  {
    "station": "Manurewa",
    "distances": {
      "Auckland City": 26.0,
      "Remuera": 22.0,
      "Onehunga": 20.0,
      "Mt Wellington": 22.0,
      "St Heliers": 23.0,
      "Parnell": 27.0,
      "Grey Lynn": 28.0,
      "Ellerslie": 19.0,
      "Manurewa": 0.0,
      "Otahuhu": 6.0,
      "Howick": 16.0,
      "Otara": 9.0,
      "Papatoetoe": 6.0,
      "Mangere": 17.0,
      "Papakura": 6.0,
      "Avondale": 27.0,
      "Balmoral": 25.0,
      "Mt Roskill": 23.0,
      "Glen Eden": 32.0,
      "Henderson": 34.0,
      "Te Atatu": 35.0,
      "West Harbour": 41.0,
      "Titirangi": 32.0,
      "Takapuna": 37.0,
      "Devonport": 38.0,
      "Birkenhead": 34.0,
      "East Coast Bays": 44.0,
      "Albany": 41.0,
      "Silverdale": 58.0
    },
    "area": "Counties Manukau"
  },
  {
    "station": "Mount Roskill",
    "distances": {
      "Auckland City": 8.0,
      "Remuera": 9.0,
      "Onehunga": 6.0,
      "Mt Wellington": 15.0,
      "St Heliers": 15.0,
      "Parnell": 13.0,
      "Grey Lynn": 8.0,
      "Ellerslie": 9.0,
      "Manurewa": 23.0,
      "Otahuhu": 13.0,
      "Howick": 19.0,
      "Otara": 21.0,
      "Papatoetoe": 18.0,
      "Mangere": 11.0,
      "Papakura": 28.0,
      "Avondale": 6.0,
      "Balmoral": 4.0,
      "Mt Roskill": 0.0,
      "Glen Eden": 10.0,
      "Henderson": 13.0,
      "Te Atatu": 13.0,
      "West Harbour": 19.0,
      "Titirangi": 10.0,
      "Takapuna": 19.0,
      "Devonport": 21.0,
      "Birkenhead": 17.0,
      "East Coast Bays": 27.0,
      "Albany": 24.0,
      "Silverdale": 41.0
    },
    "area": "Auckland"
  },
  {
    "station": "Mount Wellington",
    "distances": {
      "Auckland City": 13.0,
      "Remuera": 7.0,
      "Onehunga": 9.0,
      "Mt Wellington": 0.0,
      "St Heliers": 5.0,
      "Parnell": 12.0,
      "Grey Lynn": 15.0,
      "Ellerslie": 6.0,
      "Manurewa": 22.0,
      "Otahuhu": 7.0,
      "Howick": 7.0,
      "Otara": 10.0,
      "Papatoetoe": 14.0,
      "Mangere": 15.0,
      "Papakura": 23.0,
      "Avondale": 19.0,
      "Balmoral": 12.0,
      "Mt Roskill": 15.0,
      "Glen Eden": 25.0,
      "Henderson": 26.0,
      "Te Atatu": 23.0,
      "West Harbour": 29.0,
      "Titirangi": 27.0,
      "Takapuna": 24.0,
      "Devonport": 25.0,
      "Birkenhead": 21.0,
      "East Coast Bays": 31.0,
      "Albany": 28.0,
      "Silverdale": 45.0
    },
    "area": "Auckland"
  },
  {
    "station": "Onehunga",
    "distances": {
      "Auckland City": 10.0,
      "Remuera": 6.0,
      "Onehunga": 0.0,
      "Mt Wellington": 9.0,
      "St Heliers": 11.0,
      "Parnell": 11.0,
      "Grey Lynn": 11.0,
      "Ellerslie": 4.0,
      "Manurewa": 20.0,
      "Otahuhu": 8.0,
      "Howick": 14.0,
      "Otara": 17.0,
      "Papatoetoe": 16.0,
      "Mangere": 7.0,
      "Papakura": 25.0,
      "Avondale": 10.0,
      "Balmoral": 6.0,
      "Mt Roskill": 6.0,
      "Glen Eden": 16.0,
      "Henderson": 23.0,
      "Te Atatu": 19.0,
      "West Harbour": 26.0,
      "Titirangi": 15.0,
      "Takapuna": 21.0,
      "Devonport": 22.0,
      "Birkenhead": 18.0,
      "East Coast Bays": 29.0,
      "Albany": 26.0,
      "Silverdale": 42.0
    },
    "area": "Auckland"
  },
  {
    "station": "Otahuhu",
    "distances": {
      "Auckland City": 14.0,
      "Remuera": 10.0,
      "Onehunga": 8.0,
      "Mt Wellington": 7.0,
      "St Heliers": 11.0,
      "Parnell": 15.0,
      "Grey Lynn": 16.0,
      "Ellerslie": 6.0,
      "Manurewa": 6.0,
      "Otahuhu": 0.0,
      "Howick": 11.0,
      "Otara": 7.0,
      "Papatoetoe": 9.0,
      "Mangere": 8.0,
      "Papakura": 18.0,
      "Avondale": 17.0,
      "Balmoral": 12.0,
      "Mt Roskill": 13.0,
      "Glen Eden": 22.0,
      "Henderson": 25.0,
      "Te Atatu": 24.0,
      "West Harbour": 31.0,
      "Titirangi": 22.0,
      "Takapuna": 25.0,
      "Devonport": 28.0,
      "Birkenhead": 24.0,
      "East Coast Bays": 34.0,
      "Albany": 31.0,
      "Silverdale": 47.0
    },
    "area": "Counties Manukau"
  },
  {
    "station": "Otara",
    "distances": {
      "Auckland City": 20.0,
      "Remuera": 16.0,
      "Onehunga": 17.0,
      "Mt Wellington": 10.0,
      "St Heliers": 15.0,
      "Parnell": 21.0,
      "Grey Lynn": 22.0,
      "Ellerslie": 13.0,
      "Manurewa": 9.0,
      "Otahuhu": 7.0,
      "Howick": 9.0,
      "Otara": 0.0,
      "Papatoetoe": 6.0,
      "Mangere": 13.0,
      "Papakura": 16.0,
      "Avondale": 27.0,
      "Balmoral": 19.0,
      "Mt Roskill": 21.0,
      "Glen Eden": 32.0,
      "Henderson": 33.0,
      "Te Atatu": 30.0,
      "West Harbour": 36.0,
      "Titirangi": 29.0,
      "Takapuna": 31.0,
      "Devonport": 33.0,
      "Birkenhead": 29.0,
      "East Coast Bays": 39.0,
      "Albany": 36.0,
      "Silverdale": 53.0
    },
    "area": "Counties Manukau"
  },
  {
    "station": "Papakura",
    "distances": {
      "Auckland City": 30.0,
      "Remuera": 26.0,
      "Onehunga": 25.0,
      "Mt Wellington": 23.0,
      "St Heliers": 27.0,
      "Parnell": 31.0,
      "Grey Lynn": 32.0,
      "Ellerslie": 23.0,
      "Manurewa": 6.0,
      "Otahuhu": 18.0,
      "Howick": 21.0,
      "Otara": 16.0,
      "Papatoetoe": 12.0,
      "Mangere": 19.0,
      "Papakura": 0.0,
      "Avondale": 32.0,
      "Balmoral": 30.0,
      "Mt Roskill": 28.0,
      "Glen Eden": 37.0,
      "Henderson": 39.0,
      "Te Atatu": 40.0,
      "West Harbour": 46.0,
      "Titirangi": 37.0,
      "Takapuna": 42.0,
      "Devonport": 43.0,
      "Birkenhead": 39.0,
      "East Coast Bays": 49.0,
      "Albany": 45.0,
      "Silverdale": 63.0
    },
    "area": "Counties Manukau"
  },
  {
    "station": "Papatoetoe",
    "distances": {
      "Auckland City": 22.0,
      "Remuera": 18.0,
      "Onehunga": 16.0,
      "Mt Wellington": 14.0,
      "St Heliers": 19.0,
      "Parnell": 23.0,
      "Grey Lynn": 24.0,
      "Ellerslie": 15.0,
      "Manurewa": 6.0,
      "Otahuhu": 9.0,
      "Howick": 13.0,
      "Otara": 6.0,
      "Papatoetoe": 0.0,
      "Mangere": 10.0,
      "Papakura": 12.0,
      "Avondale": 22.0,
      "Balmoral": 21.0,
      "Mt Roskill": 18.0,
      "Glen Eden": 27.0,
      "Henderson": 29.0,
      "Te Atatu": 30.0,
      "West Harbour": 36.0,
      "Titirangi": 27.0,
      "Takapuna": 33.0,
      "Devonport": 35.0,
      "Birkenhead": 31.0,
      "East Coast Bays": 41.0,
      "Albany": 38.0,
      "Silverdale": 55.0
    },
    "area": "Counties Manukau"
  },
  {
    "station": "Parnell",
    "distances": {
      "Auckland City": 4.0,
      "Remuera": 6.0,
      "Onehunga": 11.0,
      "Mt Wellington": 12.0,
      "St Heliers": 9.0,
      "Parnell": 0.0,
      "Grey Lynn": 6.0,
      "Ellerslie": 10.0,
      "Manurewa": 27.0,
      "Otahuhu": 15.0,
      "Howick": 20.0,
      "Otara": 21.0,
      "Papatoetoe": 23.0,
      "Mangere": 16.0,
      "Papakura": 31.0,
      "Avondale": 11.0,
      "Balmoral": 7.0,
      "Mt Roskill": 13.0,
      "Glen Eden": 17.0,
      "Henderson": 18.0,
      "Te Atatu": 14.0,
      "West Harbour": 20.0,
      "Titirangi": 18.0,
      "Takapuna": 16.0,
      "Devonport": 17.0,
      "Birkenhead": 13.0,
      "East Coast Bays": 23.0,
      "Albany": 20.0,
      "Silverdale": 37.0
    },
    "area": "Auckland"
  },
  {
    "station": "Remuera",
    "distances": {
      "Auckland City": 6.0,
      "Remuera": 0.0,
      "Onehunga": 6.0,
      "Mt Wellington": 7.0,
      "St Heliers": 7.0,
      "Parnell": 6.0,
      "Grey Lynn": 11.0,
      "Ellerslie": 4.0,
      "Manurewa": 22.0,
      "Otahuhu": 10.0,
      "Howick": 13.0,
      "Otara": 16.0,
      "Papatoetoe": 18.0,
      "Mangere": 13.0,
      "Papakura": 26.0,
      "Avondale": 13.0,
      "Balmoral": 6.0,
      "Mt Roskill": 9.0,
      "Glen Eden": 18.0,
      "Henderson": 19.0,
      "Te Atatu": 16.0,
      "West Harbour": 22.0,
      "Titirangi": 18.0,
      "Takapuna": 17.0,
      "Devonport": 19.0,
      "Birkenhead": 15.0,
      "East Coast Bays": 25.0,
      "Albany": 22.0,
      "Silverdale": 39.0
    },
    "area": "Auckland"
  },
  {
    "station": "Silverdale",
    "distances": {
      "Auckland City": 34.0,
      "Remuera": 39.0,
      "Onehunga": 42.0,
      "Mt Wellington": 45.0,
      "St Heliers": 46.0,
      "Parnell": 37.0,
      "Grey Lynn": 35.0,
      "Ellerslie": 40.0,
      "Manurewa": 58.0,
      "Otahuhu": 47.0,
      "Howick": 51.0,
      "Otara": 53.0,
      "Papatoetoe": 55.0,
      "Mangere": 49.0,
      "Papakura": 63.0,
      "Avondale": 43.0,
      "Balmoral": 38.0,
      "Mt Roskill": 41.0,
      "Glen Eden": 45.0,
      "Henderson": 41.0,
      "Te Atatu": 39.0,
      "West Harbour": 33.0,
      "Titirangi": 48.0,
      "Takapuna": 23.0,
      "Devonport": 32.0,
      "Birkenhead": 28.0,
      "East Coast Bays": 19.0,
      "Albany": 21.0,
      "Silverdale": 0.0
    },
    "area": "Waitemata"
  },
  {
    "station": "St Heliers",
    "distances": {
      "Auckland City": 13.0,
      "Remuera": 7.0,
      "Onehunga": 11.0,
      "Mt Wellington": 5.0,
      "St Heliers": 0.0,
      "Parnell": 9.0,
      "Grey Lynn": 17.0,
      "Ellerslie": 9.0,
      "Manurewa": 23.0,
      "Otahuhu": 11.0,
      "Howick": 12.0,
      "Otara": 15.0,
      "Papatoetoe": 19.0,
      "Mangere": 18.0,
      "Papakura": 27.0,
      "Avondale": 20.0,
      "Balmoral": 12.0,
      "Mt Roskill": 15.0,
      "Glen Eden": 28.0,
      "Henderson": 26.0,
      "Te Atatu": 23.0,
      "West Harbour": 29.0,
      "Titirangi": 27.0,
      "Takapuna": 24.0,
      "Devonport": 26.0,
      "Birkenhead": 22.0,
      "East Coast Bays": 32.0,
      "Albany": 29.0,
      "Silverdale": 46.0
    },
    "area": "Auckland"
  },
  {
    "station": "Takapuna",
    "distances": {
      "Auckland City": 12.0,
      "Remuera": 17.0,
      "Onehunga": 21.0,
      "Mt Wellington": 24.0,
      "St Heliers": 24.0,
      "Parnell": 16.0,
      "Grey Lynn": 13.0,
      "Ellerslie": 19.0,
      "Manurewa": 37.0,
      "Otahuhu": 25.0,
      "Howick": 30.0,
      "Otara": 31.0,
      "Papatoetoe": 33.0,
      "Mangere": 27.0,
      "Papakura": 42.0,
      "Avondale": 19.0,
      "Balmoral": 16.0,
      "Mt Roskill": 19.0,
      "Glen Eden": 24.0,
      "Henderson": 25.0,
      "Te Atatu": 22.0,
      "West Harbour": 17.0,
      "Titirangi": 25.0,
      "Takapuna": 0.0,
      "Devonport": 8.0,
      "Birkenhead": 6.0,
      "East Coast Bays": 8.0,
      "Albany": 6.0,
      "Silverdale": 23.0
    },
    "area": "Waitemata"
  },
  {
    "station": "Te Atatu",
    "distances": {
      "Auckland City": 12.0,
      "Remuera": 16.0,
      "Onehunga": 19.0,
      "Mt Wellington": 23.0,
      "St Heliers": 23.0,
      "Parnell": 14.0,
      "Grey Lynn": 9.0,
      "Ellerslie": 18.0,
      "Manurewa": 35.0,
      "Otahuhu": 24.0,
      "Howick": 28.0,
      "Otara": 30.0,
      "Papatoetoe": 30.0,
      "Mangere": 23.0,
      "Papakura": 40.0,
      "Avondale": 9.0,
      "Balmoral": 11.0,
      "Mt Roskill": 13.0,
      "Glen Eden": 7.0,
      "Henderson": 5.0,
      "Te Atatu": 0.0,
      "West Harbour": 7.0,
      "Titirangi": 11.0,
      "Takapuna": 22.0,
      "Devonport": 23.0,
      "Birkenhead": 19.0,
      "East Coast Bays": 25.0,
      "Albany": 18.0,
      "Silverdale": 39.0
    },
    "area": "Waitemata"
  },
  {
    "station": "Titirangi",
    "distances": {
      "Auckland City": 16.0,
      "Remuera": 18.0,
      "Onehunga": 15.0,
      "Mt Wellington": 27.0,
      "St Heliers": 27.0,
      "Parnell": 18.0,
      "Grey Lynn": 13.0,
      "Ellerslie": 18.0,
      "Manurewa": 32.0,
      "Otahuhu": 22.0,
      "Howick": 28.0,
      "Otara": 30.0,
      "Papatoetoe": 27.0,
      "Mangere": 20.0,
      "Papakura": 37.0,
      "Avondale": 8.0,
      "Balmoral": 13.0,
      "Mt Roskill": 10.0,
      "Glen Eden": 4.0,
      "Henderson": 9.0,
      "Te Atatu": 11.0,
      "West Harbour": 17.0,
      "Titirangi": 0.0,
      "Takapuna": 25.0,
      "Devonport": 29.0,
      "Birkenhead": 23.0,
      "East Coast Bays": 35.0,
      "Albany": 29.0,
      "Silverdale": 48.0
    },
    "area": "Waitemata"
  },
  {
    "station": "West Harbour",
    "distances": {
      "Auckland City": 18.0,
      "Remuera": 22.0,
      "Onehunga": 26.0,
      "Mt Wellington": 29.0,
      "St Heliers": 29.0,
      "Parnell": 20.0,
      "Grey Lynn": 15.0,
      "Ellerslie": 24.0,
      "Manurewa": 41.0,
      "Otahuhu": 31.0,
      "Howick": 34.0,
      "Otara": 36.0,
      "Papatoetoe": 36.0,
      "Mangere": 29.0,
      "Papakura": 46.0,
      "Avondale": 15.0,
      "Balmoral": 17.0,
      "Mt Roskill": 19.0,
      "Glen Eden": 13.0,
      "Henderson": 9.0,
      "Te Atatu": 7.0,
      "West Harbour": 0.0,
      "Titirangi": 17.0,
      "Takapuna": 17.0,
      "Devonport": 26.0,
      "Birkenhead": 20.0,
      "East Coast Bays": 19.0,
      "Albany": 12.0,
      "Silverdale": 33.0
    },
    "area": "Waitemata"
  }
]
```

## File: memory\2026-04-05.md
```md
# 2026-04-05 — FENZ OT Rostering Session

## Allocation Engine Watch-Math Fix

### Bug: Brown Watch Assigned Instead of Blue for Blue Callback
- **Root cause**: Allocation engine never imported `watch-math.ts` and lacked eligibility filters. Regular working shifts (Day/Night without callbacks) were slipping through as "eligible" because they matched the requested shift type.
- **Fix applied to `src/engine/allocation-engine.ts`**:
  - Imported `watch-math` functions (`getShiftStatus`, `getShift`, `getCallbackType`)
  - Added `isWatchEligibleForDay()` / `isWatchEligibleForNight()` filters in `runSingleAllocation`:
    - "On Leave" (first 16 days of 160-day cycle) → excluded
    - "Off" with no callback → excluded
    - `#2a-EveningDay2` callback → excluded for Day shift (evening extension only)
    - `#3-AfterLastNight` → excluded for Day shift (night only)
    - `#2b-DayOfNight1` → excluded for Day shift (night only)
    - **New**: Regular working shift with NO callback → excluded for callback OT (prevents regular workers from double-counting)
  - OT callbacks captured and saved in `ot_assignments.callback_type`

### Test Dashboard (`/test` page)
- Built by subagent at `src/app/test/page.tsx` + `src/app/api/test/route.ts`
- Dark-mode Tailwind UI with 6 test scenarios
- "Run All Tests" + per-test run buttons
- Watch eligibility matrix display
- Source code verification panel

### DB Issues Found
- **FK constraint**: `ot_count_log.related_ot_request_id` → `ot_requests.id` blocks `DELETE FROM ot_requests`
- **Station IDs**: Albany = 1055 (not 1). Test API uses 1055, main `/api/allocate` route hardcodes 1
- Test API uses `pool.query('DELETE FROM ot_count_log')` before `DELETE FROM ot_requests` — this works
- Test API uses station_id 1055 (Albany)
```

## File: src\app\(dashboard)\officer\page.tsx
```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  MapPin, 
  Search, 
  Users, 
  ShieldCheck, 
  Clock, 
  Sun, 
  Moon, 
  Calendar, 
  PlusCircle, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { 
  getOperationalTime, 
  getWatchColor, 
  REGIONS, 
  REGION_TO_DISTRICTS 
} from "@/engine/ui-helpers";
import { Watch, getOnDutyWatch, findWatchOccurrence } from "@/engine/watch-math";
import Sidebar from "@/components/layout/Sidebar";
import DateToolbar from "@/components/layout/DateToolbar";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase";

export default function OfficerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<any[]>([]);
  
  // Date/Shift State
  const [opTime, setOpTime] = useState(getOperationalTime(new Date()));
  const operativeDate = opTime.date;
  const operativeShift = opTime.shift;
  // App State (Hydrated in useEffect)
  const [regionParam, setRegionParam] = useState("Te Hiku");
  const [districtParam, setDistrictParam] = useState("All");
  const [selectedRanks, setSelectedRanks] = useState<string[]>(['Firefighters', 'Station Officers', 'Senior Station Officers']);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedRegion = sessionStorage.getItem('fenz_region');
    const savedDistrict = sessionStorage.getItem('fenz_district');
    const savedRanks = sessionStorage.getItem('fenz_ranks');
    
    if (savedRegion) setRegionParam(savedRegion);
    if (savedDistrict) setDistrictParam(savedDistrict);
    if (savedRanks) setSelectedRanks(JSON.parse(savedRanks));
  }, []);

  // Persist changes
  useEffect(() => {
    if (!mounted) return;
    sessionStorage.setItem('fenz_region', regionParam);
  }, [regionParam, mounted]);

  useEffect(() => {
    if (!mounted) return;
    sessionStorage.setItem('fenz_district', districtParam);
  }, [districtParam, mounted]);

  useEffect(() => {
    if (!mounted) return;
    sessionStorage.setItem('fenz_ranks', JSON.stringify(selectedRanks));
  }, [selectedRanks, mounted]);
  
  // Form State
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [selectedRank, setSelectedRank] = useState<string>("FF");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [engineRunDone, setEngineRunDone] = useState(false);

  const QUALS = ["PRT", "TYPE4", "DRIVER", "NOT_ROOKIE"];

  useEffect(() => {
    async function loadStations() {
      const { data } = await supabase.from('stations').select('*').order('name');
      if (data) setStations(data);
    }
    loadStations();
  }, []);

  const onDutyWatch = getOnDutyWatch(operativeDate, operativeShift);

  const regionDistricts = REGION_TO_DISTRICTS[regionParam] || [];
  const sidebarDistricts = (regionParam === "New Zealand" 
    ? Array.from(new Set(stations.map(s => s.district))).map(d => ({ id: d, name: d }))
    : regionDistricts.map((name: string) => ({ id: name, name })))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  const filteredStations = stations.filter(s => {
    if (districtParam !== "All" && s.district !== districtParam) return false;
    
    // Region Filter (Skip if New Zealand)
    if (regionParam !== "New Zealand") {
      const allowed = REGION_TO_DISTRICTS[regionParam] || [];
      if (!allowed.includes(s.district)) return false;
    }
    
    return true;
  });

  const toggleQual = (q: string) => {
    if (qualifications.includes(q)) setQualifications(qualifications.filter(x => x !== q));
    else setQualifications([...qualifications, q]);
  };

  const [evaluationResults, setEvaluationResults] = useState<any | null>(null);

  const handleCreateVacancy = async () => {
    if (!selectedStation) return;
    setLoading(true);
    
    try {
      const dateStr = operativeDate.toLocaleDateString('en-CA');
      const targetStation = stations.find(s => String(s.id) === String(selectedStation));
      
      if (!targetStation) throw new Error("Please select a valid station");

      const { data, error } = await supabase
        .from('ot_requests')
        .insert({
          station_id: targetStation.id,
          district: targetStation.district || '',
          date: dateStr,
          shift_type: operativeShift,
          specialist_type: selectedRank,
          required_qualification_ids: qualifications, // Pass array directly to JSONB
          status: 'pending',
          number_of_slots: 1
        })
        .select()
        .single();

      if (error) throw error;
      
      if (engineRunDone) {
        // Trigger immediate evaluation logic
        const response = await fetch('/api/officer/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: data.id })
        });
        const result = await response.json();
        setEvaluationResults(result); // Store the full result object { dominoChain, candidates }
      } else {
        router.push('/rosters');
      }
    } catch (err: any) {
      console.error("Error creating vacancy:", err);
      alert(`Failed to create vacancy: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAssign = async (candidate: any) => {
    if (!evaluationResults) return;
    setLoading(true);
    try {
      const response = await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual_assign',
          requestId: (evaluationResults as any).requestId,
          firefighterId: candidate.id,
          distance: candidate.distance,
          status: 'assigned'
        })
      });
      const result = await response.json();
      if (result.success) {
        alert(`${candidate.name} has been assigned.`);
        // Refresh or navigate
        router.push('/rosters');
      } else {
        throw new Error(result.error || 'Failed to assign');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefuse = async (candidate: any) => {
    if (!evaluationResults) return;
    const reason = window.prompt(`Enter refusal reason for ${candidate.name}:`, "Not available / No answer");
    if (reason === null) return; // Cancelled

    setLoading(true);
    try {
      const response = await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual_assign',
          requestId: (evaluationResults as any).requestId,
          firefighterId: candidate.id,
          distance: candidate.distance,
          status: 'declined',
          declineReason: reason
        })
      });
      const result = await response.json();
      if (result.success) {
        alert(`Refusal recorded for ${candidate.name}.`);
        // Remove from list or refresh evaluation
        setEvaluationResults({
          ...evaluationResults,
          candidates: (evaluationResults as any).candidates.filter((c: any) => c.id !== candidate.id)
        });
      } else {
        throw new Error(result.error || 'Failed to record refusal');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white text-gray-900 font-sans selection:bg-blue-500/30">
      {/* TOP HEADER */}
      <Header title="Vacancy Management" />

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR - Starts below header */}
        <Sidebar 
          regionParam={regionParam}
          districtParam={districtParam}
          updateUrlParams={(r, d) => { setRegionParam(r); setDistrictParam(d); }}
          sidebarDistricts={sidebarDistricts}
          selectedRanks={selectedRanks}
          setSelectedRanks={setSelectedRanks}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* SHARED DATE TOOLBAR */}
          <DateToolbar 
            operativeDate={operativeDate}
            operativeShift={operativeShift}
            setOpTime={setOpTime}
          />

          {/* MAIN WORKSPACE */}
          <main className="flex-1 p-8 overflow-y-auto bg-[#f3f7fa]">
           <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                    <Activity className="w-6 h-6 text-blue-600" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Create New Vacancy</h2>
                    <p className="text-gray-500 text-sm font-bold">Configure shift requirements for automated allocation</p>
                 </div>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
                 <div className="p-10 space-y-10">
                    
                    {/* SECTION: LOCATION & RANK */}
                    <div className="grid grid-cols-2 gap-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Target Station</label>
                          <div className="relative">
                             <select 
                                value={selectedStation} 
                                onChange={e => setSelectedStation(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-black appearance-none outline-none focus:border-blue-500 transition-colors text-blue-900"
                             >
                                <option value="" className="text-gray-400">Select Station...</option>
                                {filteredStations.map(s => <option key={s.id} value={s.id} className="text-blue-900">{s.name} ({s.district})</option>)}
                             </select>
                             <ChevronDown className="absolute right-5 top-5 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Required Rank</label>
                          <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-200">
                             {['FF', 'SO', 'SSO'].map(rank => (
                                <button 
                                   key={rank}
                                   onClick={() => setSelectedRank(rank)}
                                   className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${selectedRank === rank ? 'bg-white shadow-md text-blue-600 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                   {rank}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* SECTION: QUALIFICATIONS */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] shrink-0">Required Qualifications</span>
                          <div className="h-px bg-gray-100 w-full" />
                       </div>
                       <div className="grid grid-cols-4 gap-4">
                          {QUALS.map(q => (
                             <button 
                                key={q}
                                onClick={() => toggleQual(q)}
                                className={`p-4 rounded-2xl border-2 font-black text-[11px] tracking-widest transition-all text-center ${qualifications.includes(q) ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                             >
                                {q.replace('_', ' ')}
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* SECTION: SHIFT SUMMARY */}
                    <div className="bg-blue-50 rounded-3xl p-8 flex items-center justify-between border border-blue-100">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                             {operativeShift === 'Day' ? <Sun className="w-7 h-7 text-orange-500" /> : <Moon className="w-7 h-7 text-blue-600" />}
                          </div>
                          <div>
                             <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Scheduled Shift</span>
                             <p className="text-blue-900 font-black text-lg leading-tight">
                                {operativeDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                             </p>
                             <p className="text-blue-600 font-bold text-sm">{operativeShift} Shift ({onDutyWatch} Watch Active)</p>
                          </div>
                       </div>

                       {/* ENGINE STATUS TOGGLE (Temporary for dev) */}
                       <div className="flex items-center gap-4 bg-white/50 px-6 py-3 rounded-2xl border border-blue-100 shadow-sm">
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Daily Engine Status</span>
                             <span className="text-[11px] font-bold text-blue-900">{engineRunDone ? 'Post-Scheduled Run' : 'Pre-Scheduled Run'}</span>
                          </div>
                          <button 
                            onClick={() => setEngineRunDone(!engineRunDone)}
                            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${engineRunDone ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${engineRunDone ? 'left-7' : 'left-1'}`} />
                          </button>
                       </div>
                       
                       <button 
                          onClick={handleCreateVacancy}
                          disabled={!selectedStation || loading}
                          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black px-10 py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm flex items-center gap-3"
                       >
                          <PlusCircle className="w-5 h-5" />
                          {loading ? 'Processing...' : 'Create Overtime'}
                       </button>
                    </div>

                     {/* DOMINO CHAIN & EVALUATION RESULTS */}
                     {evaluationResults && (
                       <div className="mt-12 pt-12 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
                         
                         {/* THE DOMINO CHAIN (The "Intricate" part) */}
                         {evaluationResults.dominoChain?.length > 0 && (
                            <div className="mb-12 space-y-4">
                               <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4">Domino Effect: Movement Chain</h3>
                               <div className="space-y-2">
                                  {evaluationResults.dominoChain.map((step: any, idx: number) => (
                                     <div key={idx} className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                                           {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                           <div className="text-xs font-black text-blue-900">{step.name}</div>
                                           <div className="text-[10px] font-bold text-blue-400 uppercase">
                                              Moves from <span className="text-blue-600">{step.leavesHoleAt}</span> ➔ to fill <span className="text-blue-600">{step.movesTo}</span>
                                           </div>
                                        </div>
                                        <div className="text-[10px] font-black text-blue-300 uppercase italic">
                                          {step.is_preview ? 'Suggested Move' : 'Re-Assigning...'}
                                        </div>
                                     </div>
                                  ))}
                                  <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                     <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">!</div>
                                     <div className="text-[10px] font-black text-orange-900 uppercase">
                                        Final Remaining Hole: <span className="underline">{evaluationResults.currentGapStation}</span>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         )}

                         <div className="flex items-center justify-between mb-6">
                           <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Available Candidates for Final Hole</h3>
                           <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-blue-100">
                             {evaluationResults.candidates?.length || 0} Eligible
                           </span>
                         </div>

                         <div className="grid gap-3">
                           {evaluationResults.candidates?.length > 0 ? (
                             evaluationResults.candidates.map((c: any, i: number) => (
                               <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all">
                                 <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-blue-600 shadow-sm">
                                     {i + 1}
                                   </div>
                                   <div>
                                     <div className="font-black text-gray-900">{c.name}</div>
                                     <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">{c.watch} Watch • {c.rank} • {c.distance}km away</div>
                                     <div className="flex flex-wrap gap-1">
                                        {Object.entries(c.qualifications || {})
                                          .filter(([,v]) => v)
                                          .map(([q]) => (
                                            <span key={q} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-blue-100/50">{q}</span>
                                          ))
                                        }
                                     </div>
                                   </div>
                                 </div>
                                 <div className="flex gap-2">
                                   <button 
                                     onClick={() => handleRefuse(c)}
                                     className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-100 transition-all border border-red-100"
                                   >
                                     Refuse
                                   </button>
                                   <button 
                                     onClick={() => handleManualAssign(c)}
                                     className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-500 transition-all"
                                   >
                                     Assign
                                   </button>
                                 </div>
                               </div>
                             ))
                           ) : (
                             <div className="p-12 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No suitable candidates found for the final hole</p>
                             </div>
                           )}
                           <button 
                             onClick={() => router.push('/rosters')}
                             className="mt-4 w-full py-4 text-[11px] font-black uppercase text-gray-400 hover:text-blue-600 transition-all tracking-widest"
                           >
                             View on Full Roster
                           </button>
                         </div>
                       </div>
                     )}

                 </div>
              </div>
           </div>
        </main>
      </div>
    </div>
  </div>
  );
}

```

## File: src\app\(dashboard)\rosters\filled\page.tsx
```typescript
'use client';

import { useState, useEffect, Suspense } from 'react';
import { getOperationalTime } from '@/engine/ui-helpers';
import Sidebar from "@/components/layout/Sidebar";
import DateToolbar from "@/components/layout/DateToolbar";
import Header from "@/components/layout/Header";
import { supabase } from '@/lib/supabase';

function FilledContent() {
  const [regionParam, setRegionParam] = useState("Te Hiku");
  const [districtParam, setDistrictParam] = useState("All");
  const [selectedRanks, setSelectedRanks] = useState<string[]>(['Firefighters', 'Station Officers', 'Senior Station Officers']);
  const [stations, setStations] = useState<any[]>([]);
  const [allDistricts, setAllDistricts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedRegion = sessionStorage.getItem('fenz_region');
    const savedDistrict = sessionStorage.getItem('fenz_district');
    const savedRanks = sessionStorage.getItem('fenz_ranks');
    
    if (savedRegion) setRegionParam(savedRegion);
    if (savedDistrict) setDistrictParam(savedDistrict);
    if (savedRanks) setSelectedRanks(JSON.parse(savedRanks));
  }, []);

  const [opTime, setOpTime] = useState(() => getOperationalTime(new Date()));
  const { date: operativeDate, shift: operativeShift } = opTime;

  useEffect(() => {
    if (!mounted) return;
    sessionStorage.setItem('fenz_region', regionParam);
    sessionStorage.setItem('fenz_ranks', JSON.stringify(selectedRanks));
  }, [regionParam, selectedRanks, mounted]);

  useEffect(() => {
    async function loadInitialData() {
      const { data: areaData } = await supabase.from('areas').select('*');
      if (areaData) setAllDistricts(areaData);
      const { data: stationData } = await supabase.from('stations').select('*');
      if (stationData) setStations(stationData);
    }
    loadInitialData();
  }, []);

  const updateUrlParams = (region: string, district: string) => {
    setRegionParam(region);
    setDistrictParam(district);
    sessionStorage.setItem('fenz_district', district);
  };

  const sidebarDistricts = (regionParam === "New Zealand" 
    ? allDistricts 
    : allDistricts.filter(d => {
        // This is a simplified version of the region mapping logic
        return true; 
      }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white text-gray-900 font-sans selection:bg-blue-500/30">
      {/* TOP HEADER */}
      <Header title="Filled Shifts" />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          regionParam={regionParam}
          districtParam={districtParam}
          updateUrlParams={updateUrlParams}
          sidebarDistricts={sidebarDistricts}
          selectedRanks={selectedRanks}
          setSelectedRanks={setSelectedRanks}
        />

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <DateToolbar 
            operativeDate={operativeDate}
            operativeShift={operativeShift}
            setOpTime={setOpTime}
          />

          <main className="flex-1 p-8 overflow-hidden bg-[#f3f7fa]">
             <div className="h-full w-full border-2 border-dashed border-gray-200 rounded-[40px] flex items-center justify-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Filled Positions View (Blank Prototype)</p>
             </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function FilledPage() {
  return (
    <Suspense fallback={<div>Loading Roster State...</div>}>
      <FilledContent />
    </Suspense>
  );
}

```

## File: src\app\(dashboard)\rosters\page.tsx
```typescript
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Users, ChevronRight, Moon, Sun, ChevronDown, ChevronUp, Activity, Shield, RefreshCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { canDoOT } from '@/engine/allocation-engine-v2';
import { getOperationalTime, getWatchColor, getCalendarDays, REGIONS, REGION_TO_DISTRICTS } from '@/engine/ui-helpers';
import { Watch, getCallbackType, getOnDutyWatch } from '@/engine/watch-math';
import Sidebar from "@/components/layout/Sidebar";
import DateToolbar from "@/components/layout/DateToolbar";
import Header from "@/components/layout/Header";

const getPrimaryCallbackWatch = (date: Date, shift: 'Day' | 'Night'): Watch | null => {
  const WATCHES: Watch[] = ['Red', 'Green', 'Brown', 'Blue'];
  for (const w of WATCHES) {
    const cb = getCallbackType(w, date);
    if (!cb) continue;
    if (shift === 'Day' && (cb === '#1-BeforeDay1' || cb === '#2b-DayOfNight1')) return w;
    if (shift === 'Night' && (cb === '#2a-EveningDay2' || cb === '#3-AfterLastNight')) return w;
  }
  return null;
};

function RostersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialDistrict = searchParams.get('district') || (typeof window !== 'undefined' ? sessionStorage.getItem('fenz_district') : "All") || "All";
  const initialRegion = searchParams.get('region') || (typeof window !== 'undefined' ? sessionStorage.getItem('fenz_region') : "New Zealand") || "New Zealand";

  const [baselineData, setBaselineData] = useState<{ firefighters: any[], requests: any[] }>({ firefighters: [], requests: [] });
  const [allDistricts, setAllDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [regionParam, setRegionParam] = useState(initialRegion);
  const [districtParam, setDistrictParam] = useState(initialDistrict);
  const [selectedRanks, setSelectedRanks] = useState<string[]>(['Firefighters', 'Station Officers', 'Senior Station Officers']);
  const [searchTerm, setSearchTerm] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedRegion = sessionStorage.getItem('fenz_region');
    const savedDistrict = sessionStorage.getItem('fenz_district');
    const savedRanks = sessionStorage.getItem('fenz_ranks');
    
    if (savedRegion) setRegionParam(savedRegion);
    if (savedDistrict) setDistrictParam(savedDistrict);
    if (savedRanks) setSelectedRanks(JSON.parse(savedRanks));
  }, []);

  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [opTime, setOpTime] = useState(() => getOperationalTime(new Date()));
  const { date: operativeDate, shift: operativeShift } = opTime;

  useEffect(() => {
    if (!mounted) return;
    sessionStorage.setItem('fenz_region', regionParam);
    sessionStorage.setItem('fenz_ranks', JSON.stringify(selectedRanks));
  }, [regionParam, selectedRanks, mounted]);

  const updateUrlParams = (region: string, district: string) => {
    setRegionParam(region);
    setDistrictParam(district);
    sessionStorage.setItem('fenz_district', district);
    const params = new URLSearchParams(searchParams);
    params.set('region', region);
    params.set('district', district);
    router.push(`${pathname}?${params.toString()}`);
  };

  const dateStr = operativeDate.toLocaleDateString('en-CA');
  const onDutyWatch = getOnDutyWatch(operativeDate, operativeShift);
  const callbackWatch = getPrimaryCallbackWatch(operativeDate, operativeShift);

  const Skeleton = () => (
    <div className="animate-pulse space-y-4 p-4">
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-gray-200/50 rounded-xl w-full" />)}
    </div>
  );

  const shortenQual = (q: string) => {
    if (!q) return '';
    const u = q.toUpperCase();
    if (u === 'TYPE4') return 'T4';
    if (u === 'DRIVER') return 'DR';
    if (u === 'PRT') return 'PRT';
    if (u === 'CBR') return 'CBR';
    return u;
  };

  useEffect(() => {
    if (allDistricts.length === 0) return;
    const regionDistricts = REGION_TO_DISTRICTS[regionParam] || [];
    const visibleDistricts = regionParam === "New Zealand" ? allDistricts : allDistricts.filter(d => regionDistricts.includes(d.name));
    const sortedDistricts = [...visibleDistricts].sort((a, b) => a.name.localeCompare(b.name));
    const visibleDistrictNames = sortedDistricts.map(d => d.name);

    if (districtParam === "All") {
      setSelectedDistricts(visibleDistrictNames);
    } else if (visibleDistrictNames.includes(districtParam)) {
      setSelectedDistricts([districtParam]);
    } else {
      setSelectedDistricts(visibleDistrictNames);
    }
  }, [regionParam, districtParam, allDistricts]);

  useEffect(() => {
    async function fetchData() {
      if (baselineData.firefighters.length === 0) setLoading(true);
      const { data: areaData } = await supabase.from('areas').select('*');
      if (areaData) setAllDistricts(areaData);
      const { data: ffData } = await supabase.from('firefighters').select(`*, stations (*)`);
      const { data: reqData } = await supabase
        .from('ot_requests')
        .select(`*, stations (*)`)
        .eq('date', dateStr)
        .eq('shift_type', operativeShift);

      const mappedFF = (ffData || []).map(ff => {
        const station = Array.isArray(ff.stations) ? ff.stations[0] : ff.stations;
        return {
          ...ff,
          station_name: station?.name || 'Unknown',
          district: station?.district || ff.district || 'Unknown',
          otCount: (operativeShift === 'Day' ? ff.ot_count_days : ff.ot_count_nights) || 0
        };
      });

      const mappedRequests = (reqData || []).map(r => {
        const station = Array.isArray(r.stations) ? r.stations[0] : r.stations;
        const rank = r.specialist_type || 'FF';
        let quals = [];
        try {
          quals = Array.isArray(r.required_qualification_ids) 
            ? r.required_qualification_ids 
            : JSON.parse(r.required_qualification_ids || '[]');
        } catch (e) {
          console.error("Failed to parse quals for request", r.id, e);
        }

        return { 
          ...r, 
          station_name: station?.name || 'Unknown', 
          district: station?.district || r.district || 'Unknown', 
          required_rank: rank,
          quals: quals
        };
      });

      setBaselineData({ firefighters: mappedFF, requests: mappedRequests });
      setLoading(false);
    }
    fetchData();
  }, [operativeShift, dateStr]);

  const filteredRequests = baselineData.requests.filter((r: any) => {
    const fullName = r.station_name.toLowerCase();
    if (!searchTerm.toLowerCase().split(' ').every(term => fullName.includes(term) || r.district?.toLowerCase().includes(term))) return false;
    
    if (regionParam !== "New Zealand") {
      const allowedDistricts = REGION_TO_DISTRICTS[regionParam] || [];
      if (!allowedDistricts.includes(r.district)) return false;
    }

    if (selectedDistricts.length > 0 && !selectedDistricts.includes(r.district)) return false;
    
    const isFF = ['FF', 'QFF', 'SFF'].includes(r.required_rank);
    const isSO = r.required_rank === 'SO';
    const isSSO = r.required_rank === 'SSO';
    if (isFF && !selectedRanks.includes('Firefighters')) return false;
    if (isSO && !selectedRanks.includes('Station Officers')) return false;
    if (isSSO && !selectedRanks.includes('Senior Station Officers')) return false;
    return true;
  });

  const availablePersonnel = baselineData.firefighters.filter((ff: any) => {
    const fullName = `${ff.first_name} ${ff.last_name}`.toLowerCase();
    if (!searchTerm.toLowerCase().split(' ').every(term => fullName.includes(term) || ff.station_name.toLowerCase().includes(term))) return false;
    
    if (regionParam !== "New Zealand") {
      const allowedDistricts = REGION_TO_DISTRICTS[regionParam] || [];
      if (!allowedDistricts.includes(ff.district)) return false;
    }

    if (selectedDistricts.length > 0 && !selectedDistricts.includes(ff.district)) return false;
    
    const isFF = ['FF', 'QFF', 'SFF'].includes(ff.rank);
    const isSO = ff.rank === 'SO';
    const isSSO = ff.rank === 'SSO';
    if (isFF && !selectedRanks.includes('Firefighters')) return false;
    if (isSO && !selectedRanks.includes('Station Officers')) return false;
    if (isSSO && !selectedRanks.includes('Senior Station Officers')) return false;

    if (ff.watch === onDutyWatch) return false;

    return canDoOT(ff, dateStr, operativeShift).pass;
  }).sort((a: any, b: any) => {
    const rankWeight: Record<string, number> = { 'SSO': 0, 'SO': 1, 'SFF': 2, 'QFF': 2, 'FF': 2 };
    if (rankWeight[a.rank] !== rankWeight[b.rank]) return (rankWeight[a.rank] ?? 9) - (rankWeight[b.rank] ?? 9);
    return (a.otCount || 0) - (b.otCount || 0);
  });

  const regionDistricts = REGION_TO_DISTRICTS[regionParam] || [];
  const sidebarDistricts = (regionParam === "New Zealand" 
    ? allDistricts 
    : allDistricts.filter(d => regionDistricts.includes(d.name)))
    .sort((a, b) => a.name.localeCompare(b.name));

  const WatchBadge = ({ watch }: { watch: string }) => {
    const color = getWatchColor(watch as Watch);
    return (
      <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border" 
            style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}30` }}>
        {watch}
      </span>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white text-gray-900 font-sans selection:bg-blue-500/30">
      <Header title="Available Candidates" />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          regionParam={regionParam}
          districtParam={districtParam}
          updateUrlParams={updateUrlParams}
          sidebarDistricts={sidebarDistricts}
          selectedRanks={selectedRanks}
          setSelectedRanks={setSelectedRanks}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <DateToolbar 
            operativeDate={operativeDate}
            operativeShift={operativeShift}
            setOpTime={setOpTime}
          />

          <main className="flex-1 grid grid-cols-12 gap-6 p-8 overflow-hidden bg-[#f3f7fa]">
            <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden min-h-[400px]">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 bg-white">
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-800">Vacancies</h2>
                  <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black border border-red-100 uppercase">{loading ? '...' : filteredRequests.length} Holes</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loading ? <Skeleton /> : (
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Station</th>
                          <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                          <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quals</th>
                          <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Shift</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredRequests.map((r: any) => (
                          <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer text-xs">
                            <td className="px-6 py-4 font-black text-gray-900 leading-tight">
                              <div>{r.station_name}</div>
                              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{r.district}</div>
                            </td>
                            <td className="px-3 py-4 font-bold text-gray-500">
                              {r.required_rank} 
                              {r.specialist_type && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] border border-blue-100 ml-1">{shortenQual(r.specialist_type)}</span>}
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex flex-wrap gap-1">
                                {(r.quals || []).map((q: string) => (
                                  <span key={q} className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-amber-100/50">{shortenQual(q)}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-4 text-[10px] font-bold text-gray-400 text-center uppercase whitespace-nowrap">{operativeShift}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-800 mb-6">Roster Summary</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Total Vacancies', value: filteredRequests.length, color: 'text-red-600' },
                    { label: 'Available Personnel', value: availablePersonnel.length, color: 'text-blue-600' },
                    { label: 'Filled', value: 0, color: 'text-green-600' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{item.label}</span>
                      <span className={`text-sm font-black ${item.color}`}>{loading ? '...' : item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <section className="col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-800">Available Personnel</h2>
                <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black border border-blue-100 uppercase">{loading ? '...' : availablePersonnel.length} Ready</span>
              </div>
              
              <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col">
                {loading ? <Skeleton /> : (
                  <>
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
                      <div className="px-5 py-3 border-b flex items-center justify-between sticky top-0 z-10" 
                           style={{ backgroundColor: `${getWatchColor(callbackWatch)}08`, borderBottomColor: `${getWatchColor(callbackWatch)}20` }}>
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: getWatchColor(callbackWatch) }}>
                          Callback ({callbackWatch?.toUpperCase()} WATCH)
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
                            <tr>
                              <th className="px-5 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                              <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                              <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Station</th>
                              <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">District</th>
                              <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Qualifications</th>
                              <th className="px-5 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">CB #</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {availablePersonnel.filter(p => p.watch === callbackWatch).map((ff: any) => (
                              <tr key={ff.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-3">
                                    <WatchBadge watch={ff.watch} />
                                    <span className="font-bold text-gray-900 text-xs">{ff.first_name} {ff.last_name}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-3 font-bold text-gray-400 w-16 uppercase text-[10px]">{ff.rank}</td>
                                <td className="px-3 py-3 text-[10px] font-bold text-gray-500">{ff.station_name}</td>
                                <td className="px-3 py-3 text-[9px] font-black text-blue-400 uppercase tracking-tighter">{ff.district}</td>
                                <td className="px-3 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(ff.qualifications || {})
                                      .filter(([,v]) => v)
                                      .map(([k]) => k)
                                      .sort((a,b) => a.localeCompare(b))
                                      .map(q => (
                                        <span key={q} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-blue-100/50">{q}</span>
                                      ))
                                    }
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-right font-black text-green-600 text-sm">{ff.otCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
                      <div className="bg-gray-100/80 px-5 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Non-Callback</span>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
                            <tr>
                              <th className="px-5 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                              <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                              <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Station</th>
                              <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">District</th>
                              <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Qualifications</th>
                              <th className="px-5 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">NCB #</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {availablePersonnel.filter(p => p.watch !== callbackWatch && p.watch !== onDutyWatch).map((ff: any) => (
                              <tr key={ff.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-3">
                                    <WatchBadge watch={ff.watch} />
                                    <span className="font-bold text-gray-900 text-xs">{ff.first_name} {ff.last_name}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-3 font-bold text-gray-400 w-16 uppercase text-[10px]">{ff.rank}</td>
                                <td className="px-3 py-3 text-[10px] font-bold text-gray-500">{ff.station_name}</td>
                                <td className="px-3 py-3 text-[9px] font-black text-blue-400 uppercase tracking-tighter">{ff.district}</td>
                                <td className="px-3 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(ff.qualifications || {})
                                      .filter(([,v]) => v)
                                      .map(([k]) => k)
                                      .sort((a,b) => a.localeCompare(b))
                                      .map(q => (
                                        <span key={q} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-blue-100/50">{q}</span>
                                      ))
                                    }
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-right font-black text-orange-600 text-sm">{ff.otCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function RostersPage() {
  return (
    <Suspense fallback={<div>Loading Roster State...</div>}>
      <RostersContent />
    </Suspense>
  );
}

```

## File: src\app\api\allocate\route.ts
```typescript
import { query, getPool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { loadAllFirefighters, loadDistanceMatrix, allocateForOTRequest, type OTRequest } from '@/engine/allocation-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (body.action === 'create_request') {
      const res = await query(
        `INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, number_of_slots, required_qualification_ids, status, number_filled, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, 'pending', 0, NOW(), NOW()) RETURNING *`,
        [body.station_id, body.date, body.shift_type, body.specialist_type || null, body.number_of_slots || 1, JSON.stringify(body.required_qualification_ids || [])]
      );
      return NextResponse.json({ success: true, request: res.rows[0] });
    }

    if (body.action === 'run_allocation') {
      const pool = getPool();
      const allFFs = await loadAllFirefighters(pool);
      const distMatrix = await loadDistanceMatrix(pool);
      const otReq: OTRequest[] = [{
        station_id: 1485,
        station_name: 'Albany',
        district: 'Waitemata',
        date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        shift_type: 'Day',
        slots: 3,
        specialist_type: null,
      }];
      const stationResults = await allocateForOTRequest(otReq, allFFs, distMatrix, new Set());
      return NextResponse.json({ success: true, stationResults });
    }

    if (body.action === 'manual_assign') {
      const { requestId, firefighterId, distance, status, declineReason } = body;
      const res = await query(
        `INSERT INTO ot_assignments (ot_request_id, firefighter_id, distance_km, status, assigned_at, declined_reason)
         VALUES ($1, $2, $3, $4, NOW(), $5)
         RETURNING *`,
        [requestId, firefighterId, distance || 0, status || 'assigned', declineReason || null]
      );
      
      // If we are assigning, increment number_filled on the request
      if ((status || 'assigned') !== 'declined') {
        await query(`UPDATE ot_requests SET number_filled = number_filled + 1 WHERE id = $1`, [requestId]);
      }
      
      return NextResponse.json({ success: true, assignment: res.rows[0] });
    }

    if (body.action === 'update_assignment') {
      const { assignmentId, assignmentAction, declineReason } = body;
      if (assignmentAction === 'accept') {
        await query(`UPDATE ot_assignments SET status = 'accepted', accepted_at = NOW() WHERE id = $1`, [assignmentId]);
        return NextResponse.json({ success: true, status: 'accepted' });
      }
      if (assignmentAction === 'decline') {
        await query(`UPDATE ot_assignments SET status = 'declined', declined_reason = $2 WHERE id = $1`, [assignmentId, declineReason || '']);
        return NextResponse.json({ success: true, status: 'declined' });
      }
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Allocate API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

## File: src\app\api\chat-test\route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getShift, getCallbackType, getShiftStatus } from '@/engine/watch-math';
import { loadAllFirefighters, loadDistanceMatrix, allocateForOTRequest } from '@/engine/allocation-engine';
import { buildCascadeDebugTrace } from '@/engine/allocation-debug';

export const dynamic = 'force-dynamic';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function computeWatchMatrix(date: Date, requestShiftType: 'Day' | 'Night') {
  const watches = ['Green', 'Red', 'Brown', 'Blue'];
  return watches.map((watch) => {
    const shift = getShift(watch as any, date);
    const callback = getCallbackType(watch as any, date);
    const shiftStatus = getShiftStatus(watch as any, date);
    let eligible = false;
    let reason = '';
    if (shiftStatus.includes('On Leave')) { eligible = false; reason = 'On Leave'; }
    else if (shift === 'Off' && !callback) { reason = 'Off duty, non-callback'; }
    else if (callback === '#2a-EveningDay2' && requestShiftType === 'Day') { reason = '#2a excluded for Day'; }
    else if (requestShiftType === 'Day' && callback === '#3-AfterLastNight') { reason = '#3 night-only'; }
    else if (requestShiftType === 'Day' && callback === '#2b-DayOfNight1') { reason = '#2b night-only'; }
    else if (requestShiftType === 'Day' && shift === 'Night') { reason = 'Night shift, not Day'; }
    else if (requestShiftType === 'Night' && shift === 'Day' && !callback) { reason = 'Day shift, not Night'; }
    else if (!callback && shift !== 'Off') { reason = 'Regular working shift, non-callback'; }
    else { eligible = true; reason = 'Eligible'; }
    return { watch, shift: shiftStatus, onLeave: shiftStatus.includes('On Leave'), callback, eligible, reason };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, shift, stationId, slots, specialist }: { date: string; shift: 'Day' | 'Night'; stationId: number; slots: number; specialist?: string } = body;

    if (!date || !shift || !stationId || !slots) {
      return NextResponse.json({ error: 'Missing required fields: date, shift, stationId, slots' }, { status: 400 });
    }

    // Clean slate for single scenario
    await pool.query('TRUNCATE ot_count_log, ot_assignments, ot_requests, allocation_runs CASCADE');
    await pool.query('UPDATE firefighters SET ot_count_days = 0, ot_count_nights = 0');
    await pool.query('UPDATE firefighters SET want_to_work_day = true, want_to_work_night = true');

    const dateStr = date;
    const otReq = await pool.query(
      specialist
        ? `INSERT INTO ot_requests (station_id, date, shift_type, specialist_type, required_qualification_ids, status, number_of_slots, number_filled)
           VALUES ($1::int, $2::date, $3, $4::varchar, $5::jsonb, 'pending', $6::int, 0) RETURNING id`
        : `INSERT INTO ot_requests (station_id, date, shift_type, status, number_of_slots, number_filled)
           VALUES ($1::int, $2::date, $3, 'pending', $4::int, 0) RETURNING id`,
      specialist
        ? [Number(stationId), dateStr, shift, specialist, JSON.stringify([specialist]), Number(slots)]
        : [Number(stationId), dateStr, shift, Number(slots)]
    );
    const requestId = otReq.rows[0].id;

    const allFirefighters = await loadAllFirefighters(pool);
    const distances = await loadDistanceMatrix(pool);
    const assignedThisRun = new Set<number>();

    const otRequest = {
station_id: Number(stationId),
station_name: '',
district: '',
date,
shift_type: shift,
slots: Number(slots),
specialist_type: specialist || null,
};

    const stationResults = await allocateForOTRequest([otRequest], allFirefighters, distances, assignedThisRun);
    const debugTrace = await buildCascadeDebugTrace(allFirefighters, distances, { date, shift_type: shift, station_id: Number(stationId), number_of_slots: Number(slots) });

    const actualPhases = stationResults.flatMap((r: any) => r.assignedFirefighters.map((af: any) => af.cascadePhase));
    const uniquePhases = [...new Set(actualPhases)];
    const watchMatrix = computeWatchMatrix(parseDateStr(date), shift);

    return NextResponse.json({
      id: `custom-${date}-${shift}`,
      name: `${shift} ${date}`,
      passed: true,
      assignmentsCount: stationResults.flatMap((r: any) => r.assignedFirefighters).length,
      expectedSlots: Number(slots),
      assigned: stationResults.flatMap((r: any) =>
 r.assignedFirefighters.map((af: any) => ({
 name: af.firefighter_name,
 watch: af.watch,
 rank: af.rank,
 threshold: af.threshold,
 distance: af.distance,
 cascadePhase: af.cascadePhase,
 }))),
      allFirefightersDetail: debugTrace.candidates,
      watchMatrix,
      debugTrace,
      phasesUsed: uniquePhases,
      errors: [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

```

## File: src\app\api\debug\route.ts
```typescript
import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { loadAllFirefighters, loadDistanceMatrix, allocateForOTRequest } from '@/engine/allocation-engine';
import { getShift, getCallbackType } from '@/engine/watch-math';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pool = getPool();
  const ffs = await loadAllFirefighters(pool);
  const dm = await loadDistanceMatrix(pool);

  const albanyId = 3510;
  const req = {
    station_id: albanyId,
    station_name: 'Albany',
    district: 'Waitemata',
    date: '2026-04-07',
    shift_type: 'Day' as const,
    slots: 3,
    specialist_type: null as string | null,
  };

  const results = await allocateForOTRequest([req], ffs, dm, new Set());
  const albany = results.find(r => r.station_name === 'Albany')!;

  const evans = ffs.filter(f => f.first_name === 'Chris' && f.last_name === 'Evans');
  const evansRaw = evans.map(e => ({
    id: e.id,
    name: `${e.first_name} ${e.last_name}`,
    district: e.district,
    watch: e.watch,
    shift: getShift(e.watch as any, new Date('2026-04-07')),
    callback: getCallbackType(e.watch as any, new Date('2026-04-07')),
    homeStationId: e.station_id,
    homeStation: e.station_name,
  }));

  const albanyHomeFFs = ffs.filter(f => f.station_id === albanyId);

  return NextResponse.json({
    evans: evansRaw,
    albanyHomeFFs: albanyHomeFFs.map(f => ({
      id: f.id,
      name: `${f.first_name} ${f.last_name}`,
      watch: f.watch,
      shift: getShift(f.watch as any, new Date('2026-04-07')),
      callback: getCallbackType(f.watch as any, new Date('2026-04-07')),
    })),
    assigned: albany.assignedFirefighters.map(a => ({
      ff_id: a.firefighter_id,
      name: a.firefighter_name,
      rank: a.rank,
      phase: a.cascadePhase,
      threshold: a.threshold,
    })),
  });
}
```

## File: src\app\api\officer\evaluate\route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { canDoOT, getDistance, getEligibleGroups } from '@/engine/allocation-engine-v2';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { requestId } = payload;
    
    if (!requestId) throw new Error("Missing requestId");
    
    const supabase = getSupabaseAdmin();

    // 1. Fetch the actual vacancy details
    const { data: vacancy, error: vError } = await supabase
      .from('ot_requests')
      .select('*, stations(*)')
      .eq('id', requestId)
      .single();
    
    if (vError || !vacancy) throw new Error("Vacancy not found");

    // 2. Fetch Firefighters with Stations
    const { data: ffData, error: ffError } = await supabase
      .from('firefighters')
      .select('*, stations(*)');
    if (ffError) throw ffError;

    // 3. Fetch Distance Matrix
    const { data: distData, error: distError } = await supabase
      .from('station_distances')
      .select('*');
    if (distError) throw distError;

    // 4. Create a Name-to-ID map for distance lookup
    const nameToId: Record<string, number> = {};
    ffData.forEach((ff: any) => { if (ff.stations?.name) nameToId[ff.stations.name] = ff.stations.id; });

    const distanceMatrix: Record<number, any> = {};
    distData.forEach((d: any) => { distanceMatrix[d.station_id] = d.distances; });

    const ffs = ffData.map((ff: any) => {
      const station = ff.stations;
      return { 
        ...ff, 
        station_name: station?.name || 'Unknown', 
        district: station?.district || 'Unknown',
        is_traveling_today: false 
      };
    });
    
    const gapToFill = vacancy.stations?.name;

    // 5. Fetch Existing Assignments for this Date/Shift
    // We join with ot_requests to get the date/shift info
    let { data: assignments, error: aError } = await supabase
      .from('ot_assignments')
      .select('id, firefighter_id, ot_request_id, station_id, ot_requests!inner(date, shift_type, station_id, specialist_type)')
      .eq('ot_requests.date', vacancy.date)
      .eq('ot_requests.shift_type', vacancy.shift_type);
    
    if (aError) {
      console.warn("Join failed, trying manual mapping:", aError.message);
      // Fallback: Fetch all assignments and filter manually if join fails
      const { data: allAsgn } = await supabase.from('ot_assignments').select('*');
      const { data: allReqs } = await supabase.from('ot_requests').select('id, date, shift_type').eq('date', vacancy.date).eq('shift_type', vacancy.shift_type);
      
      const validReqIds = new Set(allReqs?.map((r: any) => r.id));
      const filteredAsgn = allAsgn?.filter((a: any) => validReqIds.has(a.ot_request_id)) || [];
      // Assign to assignments for the rest of the logic
      assignments = filteredAsgn as any;
    }

    // 6. Build the Domino Chain
    const dominoChain: any[] = [];
    let currentHole = gapToFill;
    let found = true;
    const usedIds = new Set();
    
    // Create a Station ID to Name map for manual mapping
    const stationIdToName: Record<number, string> = {};
    ffData.forEach((ff: any) => { if (ff.stations) stationIdToName[ff.stations.id] = ff.stations.name; });

    while (found) {
      found = false;
      const assignment = assignments?.find((a: any) => {
        const request = Array.isArray(a.ot_requests) ? a.ot_requests[0] : a.ot_requests;
        const sId = a.station_id || request?.station_id;
        const assignedStationName = stationIdToName[sId];
        return assignedStationName === currentHole && !usedIds.has(a.firefighter_id);
      });

      if (assignment) {
        const ff = ffs.find((f: any) => f.id === assignment.firefighter_id);
        if (ff && ff.station_name !== currentHole) {
          dominoChain.push({
            name: `${ff.first_name} ${ff.last_name}`,
            movesTo: currentHole,
            leavesHoleAt: ff.station_name
          });
          usedIds.add(ff.id);
          currentHole = ff.station_name;
          found = true;
        }
      }
    }

    // NEW: If no domino chain exists from assignments, 
    // and we are evaluating a NEW vacancy, let's look at the candidates pool later 
    // and potentially show a preview of the first one if it creates a domino.
    // (We'll do this after calculating directFills)

    const gapStationId = vacancy.station_id;
    const gapDistrict = vacancy.stations?.district || vacancy.district;

    // Direct Fill Pool (Firefighters NOT already assigned)
    const assignedFfIds = new Set(assignments?.map((a: any) => a.firefighter_id) || []);

    const directFills = ffs.filter((ff: any) => {
      if (assignedFfIds.has(ff.id)) return false;
      
      // Pass existing assignments to check for fatigue/conflicts
      const elig = canDoOT(ff, vacancy.date, vacancy.shift_type, assignments || []);
      if (!elig.pass) return false;

      // Use the engine's group logic to check rank eligibility
      const groups = getEligibleGroups(ff, { 
          date: vacancy.date, 
          shift: vacancy.shift_type, 
          station_name: currentHole, 
          district: gapDistrict, 
          required_rank: vacancy.specialist_type || 'FF' 
      } as any);
      
      if (groups.length === 0) return false;

      // Qualifications check
      const reqQuals = Array.isArray(vacancy.required_qualification_ids) 
        ? vacancy.required_qualification_ids 
        : JSON.parse(vacancy.required_qualification_ids || '[]');
      
      for (const q of reqQuals) {
        if (!ff.qualifications?.[q.toLowerCase()]) return false;
      }

      return true;
    }).map((ff: any) => {
       const stationDistances = distanceMatrix[ff.station_id] || {};
       let dist = 999;
       
       if (ff.station_name === currentHole) {
         dist = 0;
       } else {
         dist = stationDistances[currentHole] || 999;
       }
       
       const otCount = (vacancy.shift_type === 'Day' ? ff.ot_count_days : ff.ot_count_nights) || 0;
       
       const groups = getEligibleGroups(ff, { 
           date: vacancy.date, 
           shift: vacancy.shift_type, 
           station_name: currentHole, 
           district: gapDistrict, 
           required_rank: vacancy.specialist_type || 'FF' 
       } as any);
       const groupInfo = groups[0];
       
       return { 
         id: ff.id,
         name: `${ff.first_name} ${ff.last_name}`, 
         watch: ff.watch,
         rank: ff.rank,
         distance: dist, 
         otCount, 
         group: groupInfo,
         qualifications: ff.qualifications
       };
    });

    directFills.sort((a: any, b: any) => {
       if (a.group.id !== b.group.id) return a.group.id - b.group.id;
       if (a.otCount !== b.otCount) return a.otCount - b.otCount;
       return a.distance - b.distance;
    });

    // Domino Visual: Only show moves for firefighters already assigned
    const finalGap = currentHole;

    return NextResponse.json({ 
      success: true, 
      requestId,
      dominoChain, 
      candidates: directFills, 
      currentGapStation: finalGap 
    });
  } catch (err: any) {
    console.error("Evaluation Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

```

## File: src\app\api\seed\route.ts
```typescript
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { seedDatabase } = await import('@/lib/seed');
    const result = await seedDatabase();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

```

## File: src\app\api\test\route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { loadAllFirefighters, loadDistanceMatrix, allocateV2, type Firefighter } from '@/engine/allocation-engine-v2';
import { seedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test scenario — v2 engine
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SCENARIO = {
  id: 'v2-comprehensive',
  name: 'Comprehensive v2 — FF + SO + SSO across 3 districts',
  date: '2026-04-07',
  shift: 'Day' as const,
  stations: [
    // FF stations
    { stationName: 'Albany',        district: 'Waitemata',          slots: 3, required_rank: 'FF',       specialist: null  },
    { stationName: 'Devonport',     district: 'Waitemata',          slots: 2, required_rank: 'FF',       specialist: null  },
    // SSO stations
    { stationName: 'Silverdale',    district: 'Waitemata',          slots: 2, required_rank: 'SSO',      specialist: 'prt' },
    { stationName: 'Takapuna',      district: 'Waitemata',          slots: 2, required_rank: 'SSO',      specialist: null  },
    // SO stations
    { stationName: 'Papakura',      district: 'Counties Manukau',   slots: 3, required_rank: 'SO',       specialist: null  },
    { stationName: 'Manurewa',      district: 'Counties Manukau',   slots: 2, required_rank: 'SO',       specialist: null  },
    { stationName: 'Otahuhu',       district: 'Counties Manukau',   slots: 2, required_rank: 'SO',       specialist: null  },
    // SSO station
    { stationName: 'Papatoetoe',    district: 'Counties Manukau',   slots: 2, required_rank: 'SSO',      specialist: null  },
    // SO stations
    { stationName: 'Grey Lynn',     district: 'Auckland',          slots: 2, required_rank: 'SO',       specialist: null  },
    { stationName: 'Remuera',       district: 'Auckland',          slots: 2, required_rank: 'SO',       specialist: null  },
    // SSO stations
    { stationName: 'Avondale',      district: 'Auckland',          slots: 2, required_rank: 'SSO',      specialist: null  },
    { stationName: 'Mount Roskill', district: 'Auckland',          slots: 2, required_rank: 'SSO',      specialist: null  },
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function parseNzDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

async function applyHomeStationQuals(ffs: Firefighter[]): Promise<void> {
  const pool = getPool();
  const { rows } = await pool.query<{ id: number; specialist_type: string }>(
    `SELECT id, specialist_type FROM stations WHERE specialist_type IS NOT NULL`);
  const stationSpecTypes: Record<number, string> = {};
  for (const r of rows) stationSpecTypes[r.id] = r.specialist_type;
  for (const ff of ffs) {
    const homeSpec = stationSpecTypes[ff.station_id];
    if (homeSpec && !ff.qualifications[homeSpec]) ff.qualifications[homeSpec] = true;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function POST(request: NextRequest) {
  try {
    const date = parseNzDate(SCENARIO.date);

    // Reset + reseed
    const pool = getPool();
    await pool.query(`SET session_replication_role = replica`);
    for (const t of ['ot_count_log','audit_logs','ot_offers','availability',
      'district_relievers','ot_assignments','ot_requests','allocation_runs',
      'station_distances','system_settings','watch_anchors','areas','firefighters','stations']) {
      await pool.query(`DELETE FROM ${t}`).catch(() => {});
    }
    await seedDatabase();

    // Resolve station IDs
    const stationIdMap: Record<string, number> = {};
    const stationDistrictMap: Record<string, string> = {};
    const stationRankMap: Record<string, string> = {};
    const stationSpecMap: Record<string, string | null> = {};
    for (const sc of SCENARIO.stations) {
      const res = await pool.query(
        `SELECT s.id, a.name as district FROM stations s JOIN areas a ON s.area_id = a.id WHERE s.name = $1`,
        [sc.stationName]);
      if (res.rows.length === 0) throw new Error(`Station "${sc.stationName}" not found`);
      stationIdMap[sc.stationName] = res.rows[0].id;
      stationDistrictMap[sc.stationName] = res.rows[0].district;
      stationRankMap[sc.stationName] = sc.required_rank;
      stationSpecMap[sc.stationName] = sc.specialist;
    }

    // Load data
    let allFirefighters = await loadAllFirefighters(pool);
    await applyHomeStationQuals(allFirefighters);
    const distanceMatrix = await loadDistanceMatrix(pool);

    // Build OT requests (v2 format)
    const requests = SCENARIO.stations.map(st => ({
      station_id: stationIdMap[st.stationName],
      station_name: st.stationName,
      district: stationDistrictMap[st.stationName],
      date: date.toISOString().split('T')[0],
      shift_type: SCENARIO.shift,
      slots: st.slots,
      specialist_type: st.specialist,
      required_rank: st.required_rank as 'FF' | 'SO' | 'SSO' | 'SO_OR_SSO',
      required_qualifications: st.specialist ? [st.specialist] : [],
    }));

    // Run v2 allocation
    const stationResults = await allocateV2(requests, allFirefighters, distanceMatrix, new Set());

    // Build summaries
    let totalAssigned = 0;
    let totalSlots = 0;
    const allPhases = new Set<string>();
    const assignmentMap = new Map<number, { stationName: string; distance: number; phase: string; threshold: string; group: number }>();
    const GROUP_NAMES: Record<number, string> = {
      1: 'FF in-district callback', 2: 'FF in-district non-callback',
      3: 'FF OOD-adj callback',     4: 'FF OOD-adj non-callback',
      5: 'FF OOD-dist callback',    6: 'FF OOD-dist non-callback',
      7: 'SO pool', 8: 'SSO pool', 9: 'SSO→SO overflow',
    };

    for (const sr of stationResults) {
      totalAssigned += sr.assignedFirefighters.length;
      for (const af of sr.assignedFirefighters) {
        assignmentMap.set(af.firefighter_id, {
          stationName: sr.station_name,
          distance: af.distance,
          phase: af.cascadePhase,
          threshold: af.threshold,
          group: af.assignedAtGroup,
        });
        allPhases.add(af.cascadePhase);
      }
    }
    for (const sc of SCENARIO.stations) totalSlots += sc.slots;

    // ── Watch summary ────────────────────────────────────────────────────────
    const { getShift, getCallbackType } = await import('@/engine/watch-math');
    const WATCH_ORDER = ['Red', 'Green', 'Brown', 'Blue'];
    const dateStr = date.toISOString().split('T')[0];
    const watchSummary: Record<string, { label: string; type: string; callback: string | null; shift: string; eligible: number; assigned: number }> = {};

    for (const watch of WATCH_ORDER) {
      const watchFFs = allFirefighters.filter(ff => ff.watch === watch);
      const shift = getShift(watch as any, date);
      const callback = getCallbackType(watch as any, date);
      const shiftLabel = shift === 'Off' ? 'Off' : shift === 'Day' ? 'Day shift' : 'Night shift';
      const watchType = callback ? 'callback' : shift === 'Off' ? 'non-callback' : 'leave';

      let eligible = 0;
      for (const ff of watchFFs) {
        const shiftForFF = getShift(ff.watch as any, date);
        if (shiftForFF !== 'Off') continue;
        eligible++;
      }

      watchSummary[watch] = {
        label: watch,
        type: watchType,
        callback: callback || null,
        shift: shiftLabel,
        eligible,
        assigned: Array.from(assignmentMap.entries()).filter(([id]) => watchFFs.some(f => f.id === id)).length,
      };
    }

    // ── Station breakdown ────────────────────────────────────────────────────
    const stationBreakdown = stationResults.map(sr => {
      const sc = SCENARIO.stations.find(s => s.stationName === sr.station_name)!;
      return {
        stationName: sr.station_name,
        district: stationDistrictMap[sr.station_name],
        slots: sr.slots,
        specialist: sr.specialist,
        requiredRank: sr.required_rank,
        filled: sr.assignedFirefighters.length,
        complete: sr.assignedFirefighters.length >= sr.slots,
        phasesUsed: sr.phasesUsed,
        assigned: sr.assignedFirefighters.map(af => {
          const ff = allFirefighters.find(f => f.id === af.firefighter_id)!;
          return {
            name: af.firefighter_name,
            district: ff?.district || '?',
            rank: af.rank,
            watch: ff?.watch || '?',
            distance: af.distance,
            threshold: af.threshold,
            group: af.assignedAtGroup,
            phase: af.cascadePhase,
            homeStation: af.home_station,
            cbDays: ff?.ot_count_callback_days || 0,
            cbNights: ff?.ot_count_callback_nights || 0,
            ncDays: ff?.ot_count_noncallback_days || 0,
            ncNights: ff?.ot_count_noncallback_nights || 0,
          };
        }),
      };
    });

    // ── Phase coverage ───────────────────────────────────────────────────────
    const phaseCoverage: Record<string, number> = {};
    for (const phase of Object.values(GROUP_NAMES)) phaseCoverage[phase] = 0;
    for (const sr of stationResults) {
      for (const af of sr.assignedFirefighters) {
        phaseCoverage[af.cascadePhase] = (phaseCoverage[af.cascadePhase] || 0) + 1;
      }
    }

    // ── All FF detail list ───────────────────────────────────────────────────
    const PHASE_PRIORITY: Record<string, number> = {
      'ff-callback': 1, 'ff-noncallback': 2, 'ood-adj-cb': 3, 'ood-adj-nc': 4,
      'ood-dist-cb': 5, 'ood-dist-nc': 6, 'so': 7, 'sso': 8, 'sso-overflow': 9, unassigned: 98,
    };

    const allFirefightersDetail = allFirefighters.map(ff => {
      const a = assignmentMap.get(ff.id);
      const quals = Object.keys(ff.qualifications).filter(k => ff.qualifications[k]);
      return {
        id: ff.id,
        name: `${ff.first_name} ${ff.last_name}`,
        district: ff.district,
        watch: ff.watch,
        rank: ff.rank,
        homeStation: ff.station_name,
        otStation: a?.stationName || '',
        distance: a?.distance || 0,
        cbDays: ff.ot_count_callback_days,
        cbNights: ff.ot_count_callback_nights,
        ncDays: ff.ot_count_noncallback_days,
        ncNights: ff.ot_count_noncallback_nights,
        isAssigned: !!a,
        phase: a?.phase || 'unassigned',
        threshold: a?.threshold || 'unassigned',
        group: a?.group || 0,
        quals,
      };
    });

    allFirefightersDetail.sort((a, b) => {
      if (a.isAssigned !== b.isAssigned) return a.isAssigned ? -1 : 1;
      const pd = (PHASE_PRIORITY[a.phase] || 99) - (PHASE_PRIORITY[b.phase] || 99);
      if (pd !== 0) return pd;
      return (a.cbDays + a.cbNights) - (b.cbDays + b.cbNights);
    });

    return NextResponse.json({
      scenarioId: SCENARIO.id,
      scenarioName: SCENARIO.name,
      date: SCENARIO.date,
      shift: SCENARIO.shift,
      totalSlots,
      totalAssigned,
      fillRate: totalSlots > 0 ? Math.round((totalAssigned / totalSlots) * 100) : 0,
      phasesUsed: Array.from(allPhases),
      phaseCoverage,
      stationBreakdown,
      allFirefightersDetail,
      watchSummary,
      seedSummary: {
        totalFirefighters: allFirefighters.length,
        totalStations: SCENARIO.stations.length,
        totalSlots,
      },
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
```

## File: src\app\globals.css
```css
@import "tailwindcss";

@theme inline {
  --color-background: #09090b;
  --color-foreground: #fafafa;
  --color-card: #09090b;
  --color-card-foreground: #fafafa;
  --color-popover: #09090b;
  --color-popover-foreground: #fafafa;
  --color-primary: #fafafa;
  --color-primary-foreground: #18181b;
  --color-secondary: #27272a;
  --color-secondary-foreground: #fafafa;
  --color-muted: #27272a;
  --color-muted-foreground: #a1a1aa;
  --color-accent: #27272a;
  --color-accent-foreground: #fafafa;
  --color-destructive: #7f1d1d;
  --color-destructive-foreground: #fafafa;
  --color-border: #27272a;
  --color-input: #27272a;
  --color-ring: #d4d4d8;
  --color-chart-1: #e11d48;
  --color-chart-2: #2563eb;
  --color-chart-3: #16a34a;
  --color-chart-4: #ca8a04;
  --color-chart-5: #9333ea;
  --radius: 0.625rem;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: #09090b;
  color: #fafafa;
  font-family: Arial, Helvetica, sans-serif;
}

```

## File: src\app\layout.tsx
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rosters",
  description: "FENZ Overtime Allocation Engine - Fair, transparent roster management for New Zealand firefighters",
  icons: {
    icon: "/fenz-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

```

## File: src\app\page.tsx
```typescript
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { query } from '@/lib/db';

async function getStats() {
  try {
    const [stations, firefighters, otRuns, pendingOT] = await Promise.all([
      query('SELECT COUNT(*) as count FROM stations'),
      query('SELECT COUNT(*) as count FROM firefighters WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM allocation_runs'),
      query("SELECT COUNT(*) as count FROM ot_requests WHERE status = 'pending'"),
    ]);
    return {
      stations: parseInt(stations.rows[0]?.count || '0'),
      firefighters: parseInt(firefighters.rows[0]?.count || '0'),
      otRuns: parseInt(otRuns.rows[0]?.count || '0'),
      pendingOT: parseInt(pendingOT.rows[0]?.count || '0'),
    };
  } catch {
    return { stations: 0, firefighters: 0, otRuns: 0, pendingOT: 0 };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🚒 FENZ Overtime Prototype</h1>
        <p className="text-gray-400 mb-8">Allocation Engine v1 — Built for Adam</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-amber-400">{stats.stations}</div>
            <div className="text-gray-400 text-sm mt-1">Stations</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.firefighters}</div>
            <div className="text-gray-400 text-sm mt-1">Firefighters</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.otRuns}</div>
            <div className="text-gray-400 text-sm mt-1">OT Runs</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.pendingOT}</div>
            <div className="text-gray-400 text-sm mt-1">Pending OT</div>
          </div>
        </div>

        {/* Navigation */}
        <h2 className="text-xl font-semibold mb-4">Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/officer" className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors">
            <div className="text-2xl mb-2">👨‍🚒</div>
            <h3 className="font-semibold text-lg">Officer Tool</h3>
            <p className="text-gray-400 text-sm mt-1">Create OT shifts, run allocation, see results & reports</p>
          </Link>
          <Link href="/firefighter" className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500 transition-colors">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold text-lg">Firefighter Sim</h3>
            <p className="text-gray-400 text-sm mt-1">Simulate accepting/declining OT offers</p>
          </Link>
          <Link href="/audit" className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-amber-500 transition-colors">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-lg">Audit Trail</h3>
            <p className="text-gray-400 text-sm mt-1">View full history of OT counter changes</p>
          </Link>
          <Link href="/generate" className="block bg-purple-900/30 border border-purple-800 rounded-xl p-6 hover:border-purple-500 transition-colors">
            <div className="text-2xl mb-2">🎲</div>
            <h3 className="font-semibold text-lg">Firefighter Generator</h3>
            <p className="text-gray-400 text-sm mt-1">Generate random firefighters for stress testing</p>
          </Link>
          <Link href="/test" className="block bg-indigo-900/30 border border-indigo-800 rounded-xl p-6 hover:border-indigo-500 transition-colors">
            <div className="text-2xl mb-2">🧪</div>
            <h3 className="font-semibold text-lg">Test Dashboard</h3>
            <p className="text-gray-400 text-sm mt-1">Run allocation engine tests with pass/fail results</p>
          </Link>
        </div>

        {/* Seed Button */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Database</h2>
          <p className="text-gray-400 text-sm mb-4">Seed the database with 40 stations, 20 firefighters, and watch anchors.</p>
          <SeedButton />
        </div>
      </div>
    </div>
  );
}

function SeedButton() {
  async function seed(formData: FormData) {
    'use server';
    const fs = require('fs');
    const { Pool } = require('pg');
    const seedScript = fs.readFileSync('/home/ubuntu/fenz-ot-prototype/seed-fix.ts', 'utf-8');
    // Execute the seed via tsx
    const { execSync } = require('child_process');
    try {
      const result = execSync('npx tsx seed-fix.ts', { cwd: '/home/ubuntu/fenz-ot-prototype', encoding: 'utf-8' });
      console.log('Seed result:', result);
    } catch (error: any) {
      console.error('Seed error:', error.stderr);
    }
    // Revalidate all pages
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');
    revalidatePath('/officer');
    revalidatePath('/firefighter');
    revalidatePath('/audit');
  }

  return (
    <form action={seed}>
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
        🌱 Seed Database
      </button>
    </form>
  );
}


```

## File: src\components\layout\DateToolbar.tsx
```typescript
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Sun, Moon, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOnDutyWatch, findWatchOccurrence } from '@/engine/watch-math';
import { getOperationalTime } from '@/engine/ui-helpers';
import { getWatchColor, getCalendarDays } from '@/engine/ui-helpers';

interface DateToolbarProps {
  operativeDate: Date;
  operativeShift: 'Day' | 'Night';
  setOpTime: (opTime: { date: Date; shift: 'Day' | 'Night' }) => void;
}

export default function DateToolbar({ 
  operativeDate, 
  operativeShift, 
  setOpTime 
}: DateToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(operativeDate);

  const handleSetOpTime = (newOpTime: { date: Date; shift: 'Day' | 'Night' }) => {
    const dateStr = newOpTime.date.toLocaleDateString('en-CA'); // YYYY-MM-DD
    sessionStorage.setItem('fenz_op_date', newOpTime.date.toISOString());
    sessionStorage.setItem('fenz_op_shift', newOpTime.shift);
    
    // Update URL to help persistence across direct navigation
    const params = new URLSearchParams(searchParams);
    params.set('date', dateStr);
    params.set('shift', newOpTime.shift);
    router.replace(`${pathname}?${params.toString()}`);
    
    setOpTime(newOpTime);
  };

  // Sync from URL or SessionStorage on load if not already set
  useEffect(() => {
    const urlDate = searchParams.get('date');
    const urlShift = searchParams.get('shift');
    
    if (urlDate && urlShift) {
      const d = new Date(urlDate);
      if (d.toDateString() !== operativeDate.toDateString() || urlShift !== operativeShift) {
        setOpTime({ date: d, shift: urlShift as any });
      }
    } else {
      const savedDate = sessionStorage.getItem('fenz_op_date');
      const savedShift = sessionStorage.getItem('fenz_op_shift');
      if (savedDate && savedShift) {
        setOpTime({ date: new Date(savedDate), shift: savedShift as any });
      }
    }
  }, []);

  const onDutyWatch = getOnDutyWatch(operativeDate, operativeShift);

  const prevShiftDate = new Date(operativeDate.getTime());
  let prevShiftType: 'Day' | 'Night' = 'Night';
  if (operativeShift === 'Night') prevShiftType = 'Day'; else prevShiftDate.setDate(prevShiftDate.getDate() - 1);
  const prevShiftWatch = getOnDutyWatch(prevShiftDate, prevShiftType);

  const nextShiftDate = new Date(operativeDate.getTime());
  let nextShiftType: 'Day' | 'Night' = 'Day';
  if (operativeShift === 'Day') nextShiftType = 'Night'; else nextShiftDate.setDate(nextShiftDate.getDate() + 1);
  const nextShiftWatch = getOnDutyWatch(nextShiftDate, nextShiftType);

  const calendarDays = getCalendarDays(calendarViewDate, operativeShift);

  return (
    <div className="px-8 py-3 bg-[#e0f2fe] border-b border-blue-200 flex items-center justify-between shrink-0 relative">
      <div className="flex items-center gap-6">
        <span className="text-[11px] font-bold text-blue-900/60 uppercase tracking-wider">Select date</span>
        
        <div className="flex items-center gap-1">
          {/* PREV CURRENT WATCH */}
          <button 
            onClick={() => { 
              // Find previous shift for the CURRENT on-duty watch
              const occ = findWatchOccurrence(onDutyWatch, operativeDate, 'prev', operativeShift); 
              // If it's the same day, force go back further
              if (occ.date.toDateString() === operativeDate.toDateString()) {
                const dayBefore = new Date(operativeDate.getTime() - 86400000);
                handleSetOpTime(findWatchOccurrence(onDutyWatch, dayBefore, 'prev', operativeShift));
              } else {
                handleSetOpTime(occ);
              }
            }}
            className="flex flex-col items-center justify-center h-10 rounded text-white shadow-sm hover:opacity-90 transition-all w-20"
            style={{ backgroundColor: getWatchColor(onDutyWatch) }}
          >
            <span className="text-[8px] font-black leading-none mb-1 uppercase">PREV</span>
            <span className="text-[10px] font-black leading-none uppercase">{onDutyWatch}</span>
          </button>

          {/* PREV SHIFT */}
          <button 
            onClick={() => handleSetOpTime({ date: prevShiftDate, shift: prevShiftType })}
            className="flex items-center justify-center gap-1.5 h-10 rounded text-white shadow-sm hover:opacity-90 transition-all w-16"
            style={{ backgroundColor: getWatchColor(prevShiftWatch) }}
          >
            {prevShiftType === 'Day' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-black uppercase">{prevShiftDate.getDate().toString().padStart(2, '0')}</span>
          </button>

          {/* CURRENT SHIFT BUTTON */}
          <div className="flex items-center gap-2 h-10 px-6 rounded text-white shadow-md border-2 min-w-[150px] justify-center"
               style={{ backgroundColor: getWatchColor(onDutyWatch), borderColor: `${getWatchColor(onDutyWatch)}90` }}>
            {operativeShift === 'Day' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-[11px] font-black uppercase whitespace-nowrap">
              {operativeDate.toLocaleDateString('en-NZ', { weekday: 'short' }).toUpperCase()} {operativeDate.getDate().toString().padStart(2, '0')} {operativeDate.toLocaleDateString('en-NZ', { month: 'short' }).toUpperCase()}
            </span>
          </div>

          {/* NEXT SHIFT */}
          <button 
            onClick={() => handleSetOpTime({ date: nextShiftDate, shift: nextShiftType })}
            className="flex items-center justify-center gap-1.5 h-10 rounded text-white shadow-sm hover:opacity-90 transition-all w-16"
            style={{ backgroundColor: getWatchColor(nextShiftWatch) }}
          >
            {nextShiftType === 'Day' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-black uppercase">{nextShiftDate.getDate().toString().padStart(2, '0')}</span>
          </button>

          {/* NEXT CURRENT WATCH */}
          <button 
            onClick={() => { 
              // Find next shift for the CURRENT on-duty watch
              const occ = findWatchOccurrence(onDutyWatch, operativeDate, 'next', operativeShift); 
              // If it's the same day, force go forward further
              if (occ.date.toDateString() === operativeDate.toDateString()) {
                const dayAfter = new Date(operativeDate.getTime() + 86400000);
                handleSetOpTime(findWatchOccurrence(onDutyWatch, dayAfter, 'next', operativeShift));
              } else {
                handleSetOpTime(occ);
              }
            }}
            className="flex flex-col items-center justify-center h-10 rounded text-white shadow-sm hover:opacity-90 transition-all w-20"
            style={{ backgroundColor: getWatchColor(onDutyWatch) }}
          >
            <span className="text-[8px] font-black leading-none mb-1 uppercase">NEXT</span>
            <span className="text-[10px] font-black leading-none uppercase">{onDutyWatch}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 ml-4">
          <button 
            onClick={() => handleSetOpTime(getOperationalTime(new Date()))}
            className="px-5 h-10 bg-[#0284c7] text-white text-[11px] font-black uppercase rounded shadow-sm hover:bg-blue-600 transition-all"
          >
            Today
          </button>
          <button 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="w-10 h-10 bg-[#0284c7] text-white rounded shadow-sm hover:bg-blue-600 transition-all flex items-center justify-center"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CURRENT DATE STATUS ON FAR RIGHT */}
      <div className="flex items-center gap-3 pr-4 border-l border-blue-300/30 pl-6">
        <span className="text-[10px] font-black text-blue-800/50 uppercase tracking-tighter">Current:</span>
        <span className="text-[11px] font-black text-blue-900 whitespace-nowrap">{operativeDate.toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        {operativeShift === 'Day' ? <Sun className="w-3.5 h-3.5 text-orange-500" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
      </div>

      {/* CALENDAR PICKER OVERLAY */}
      {isCalendarOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsCalendarOpen(false)} />
          <div className="absolute top-full left-[620px] -translate-x-1/2 mt-3 bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 z-[70] w-[340px]">
            <div className="flex items-center justify-between mb-6 px-1">
               <button onClick={() => { const d = new Date(calendarViewDate); d.setMonth(d.getMonth()-1); setCalendarViewDate(d); }} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><ChevronLeft className="w-5 h-5" /></button>
               <span className="text-[11px] font-black uppercase text-gray-900 tracking-widest">{calendarViewDate.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })}</span>
               <button onClick={() => { const d = new Date(calendarViewDate); d.setMonth(d.getMonth()+1); setCalendarViewDate(d); }} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-4">
              {['S','M','T','W','T','F','S'].map((d, idx) => <div key={`${d}-${idx}`} className="font-black text-gray-300">{d}</div>)}
              {calendarDays.map((day, i) => (
                <div key={i} className="flex items-center justify-center">
                  {day ? (
                    <button 
                      onClick={() => { handleSetOpTime({ date: day.date, shift: operativeShift }); setIsCalendarOpen(false); }} 
                      className={`w-9 h-9 flex items-center justify-center font-black rounded-xl transition-all relative ${day.date.toDateString() === operativeDate.toDateString() ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {day.day}
                      <div className="absolute bottom-1 w-4 h-1 rounded-full" style={{ backgroundColor: day.color }} />
                    </button>
                  ) : <div className="w-9 h-9" />}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center mb-2">
              <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button 
                  onClick={() => handleSetOpTime({ date: operativeDate, shift: 'Day' })}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${operativeShift === 'Day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Sun className="w-3 h-3" /> Day
                </button>
                <button 
                  onClick={() => handleSetOpTime({ date: operativeDate, shift: 'Night' })}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${operativeShift === 'Night' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Moon className="w-3 h-3" /> Night
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

```

## File: src\components\layout\Header.tsx
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Vacancy Management" }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-20 bg-[#0A0A3D] border-b border-blue-900/30 flex items-center justify-between shrink-0">
      <div className="h-full flex items-center">
        {/* LOGO SECTION - Hits top and bottom */}
        <div className="h-full px-6 flex items-center gap-4 bg-[#0B0B45]">
          <div className="h-20 w-20 flex-shrink-0">
            <img src="/fenz-logo.svg" alt="FENZ Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black italic leading-none tracking-tighter text-white uppercase">Rosters</h1>
          </div>
        </div>

        <div className="h-8 w-px bg-blue-900/30 mx-2" />
        
        <h2 className="px-6 text-xs font-black text-white uppercase tracking-[0.2em]">{title}</h2>
      </div>

      <div className="flex items-center gap-6 px-8">
        {/* CLOCK */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-950/50 rounded-full border border-blue-800/30 min-w-[200px] justify-center">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest tabular-nums">
            {!mounted ? '-- --- ---- --:--:--' : (
              <>
                {time.toLocaleDateString('en-NZ', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} {time.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </>
            )}
          </span>
        </div>

        {/* USER PROFILE */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white uppercase tracking-wider">Station Officer</span>
            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Shift Supervisor</span>
          </div>
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center border-2 border-blue-400/30 shadow-lg shadow-blue-900/20">
            <span className="text-xs font-black text-white">ST</span>
          </div>
        </div>
      </div>
    </header>
  );
}

```

## File: src\components\layout\Sidebar.tsx
```typescript
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, ChevronDown, Check, Search, ShieldCheck } from 'lucide-react';
import { REGIONS } from '@/engine/ui-helpers';

interface SidebarProps {
  regionParam?: string;
  districtParam?: string;
  setRegionParam?: (v: string) => void;
  setDistrictParam?: (v: string) => void;
  updateUrlParams?: (r: string, d: string) => void;
  sidebarDistricts?: { id: string; name: string }[];
  selectedRanks?: string[];
  setSelectedRanks?: (r: string[]) => void;
  searchTerm?: string;
  setSearchTerm?: (s: string) => void;
  activePage?: string;
}

export default function Sidebar({
  regionParam = "Te Hiku",
  districtParam = "All",
  setRegionParam,
  setDistrictParam,
  updateUrlParams,
  sidebarDistricts = [],
  selectedRanks = [],
  setSelectedRanks,
  searchTerm = "",
  setSearchTerm,
  activePage
}: SidebarProps) {
  const router = useRouter();
  const path = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-64 bg-[#0B0B45] border-r border-blue-900/30 flex-shrink-0" />; 

  const navItems = [
    { name: 'Create Vacancy', id: 'officer', icon: LayoutDashboard, route: '/officer' },
    { name: 'Available', id: 'rosters', icon: Users, route: '/rosters', exact: true },
    { name: 'Filled', id: 'filled', icon: UserCheck, route: '/rosters/filled' },
  ];

  return (
    <div className="w-64 bg-[#0B0B45] border-r border-blue-900/30 text-white flex-shrink-0 flex flex-col h-full overflow-y-auto">
      
      <div className="px-5 py-6 space-y-4">
        {/* Region Select */}
        <div>
          <label className="text-[11px] font-bold text-blue-300/50 tracking-wide mb-2 block ml-1">Region</label>
          <div className="relative">
            <select
              value={regionParam}
              onChange={(e) => {
                const val = e.target.value;
                if (setRegionParam) setRegionParam(val);
                if (updateUrlParams) updateUrlParams(val, "All");
              }}
              className="w-full bg-[#1A1A5A] border border-blue-800/50 rounded-xl px-4 py-2.5 text-xs font-bold appearance-none focus:outline-none focus:border-blue-400 transition-all text-white"
            >
              <option value="New Zealand">New Zealand</option>
              {REGIONS.filter(r => r !== 'New Zealand').map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-3 h-3 w-3 text-blue-400 pointer-events-none" />
          </div>
        </div>

        {/* District Select */}
        <div>
          <label className="text-[11px] font-bold text-blue-300/50 tracking-wide mb-2 block ml-1">District</label>
          <div className="relative">
            <select
              value={districtParam}
              onChange={(e) => {
                const val = e.target.value;
                if (setDistrictParam) setDistrictParam(val);
                if (updateUrlParams) updateUrlParams(regionParam, val);
              }}
              className="w-full bg-[#1A1A5A] border border-blue-800/50 rounded-xl px-4 py-2.5 text-xs font-bold appearance-none focus:outline-none focus:border-blue-400 transition-all text-white"
            >
              <option value="All">All Districts</option>
              {sidebarDistricts.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-3 h-3 w-3 text-blue-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 px-3 space-y-1">
        <label className="px-3 text-[11px] font-bold text-blue-300/50 tracking-wide mb-3 block">Navigation</label>
        {navItems.map((item) => {
          const isActive = activePage 
            ? activePage === item.id 
            : item.exact 
              ? path === item.route 
              : path.startsWith(item.route);

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.route)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 border-l-4 ${
                isActive 
                  ? 'bg-[#1A1A5A] text-white border-blue-500 shadow-lg' 
                  : 'text-blue-300/70 border-transparent hover:text-white hover:bg-blue-800/30'
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-blue-500'}`} />
              {item.name}
            </button>
          );
        })}

        {/* FILTERS */}
        {setSelectedRanks && (
          <div className="mt-8 pt-8 border-t border-blue-900/30 px-2">
            <label className="text-[11px] font-bold text-blue-300/50 tracking-wide mb-5 block">Filter</label>
            <div className="space-y-4">
              {[
                { id: 'Firefighters', label: 'Firefighters' },
                { id: 'Station Officers', label: 'Station Officers' },
                { id: 'Senior Station Officers', label: 'Senior Station Officers' }
              ].map(rank => {
                const isSelected = selectedRanks.includes(rank.id);
                return (
                  <label key={rank.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-[#1A1A5A] border-blue-800 group-hover:border-blue-700'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
                    </div>
                    <span className={`text-[11px] font-black tracking-tight transition-colors ${isSelected ? 'text-white' : 'text-blue-300/60 group-hover:text-blue-200'}`}>
                      {rank.label}
                    </span>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setSelectedRanks(selectedRanks.filter(r => r !== rank.id));
                        } else {
                          setSelectedRanks([...selectedRanks, rank.id]);
                        }
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SEARCH AT BOTTOM */}
      {setSearchTerm && (
        <div className="p-4 border-t border-blue-900/30 bg-[#0A0A3D]">
          <label className="text-[11px] font-bold text-blue-300/50 tracking-wide mb-3 block ml-1">Search</label>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-blue-400" />
            <input
              type="text"
              placeholder="Search personnel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A1A5A] border border-blue-800/50 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold focus:outline-none focus:border-blue-400 text-white placeholder-blue-300/30 transition-all shadow-inner"
            />
          </div>
        </div>
      )}
    </div>
  );
}

```

## File: src\components\ui\badge.tsx
```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

```

## File: src\components\ui\button.tsx
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

```

## File: src\components\ui\card.tsx
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

## File: src\components\ui\collapsible.tsx
```typescript
"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

```

## File: src\components\ui\dialog.tsx
```typescript
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

```

## File: src\components\ui\input.tsx
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```

## File: src\components\ui\progress.tsx
```typescript
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

```

## File: src\components\ui\scroll-area.tsx
```typescript
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }

```

## File: src\components\ui\separator.tsx
```typescript
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

```

## File: src\components\ui\table.tsx
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
  )
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  )
)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
  )
)
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />
  )
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)} {...props} />
  )
)
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)} {...props} />
  )
)
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  )
)
TableCaption.displayName = "TableCaption"

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }

```

## File: src\components\ui\tabs.tsx
```typescript
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

```

## File: src\components\ui\textarea.tsx
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

```

## File: src\engine\allocation-debug.ts
```typescript
// Allocation Debug Trace — step-by-step logging of the cascade engine

import { getShift, getCallbackType, isOnLeave, getShiftStatus } from './watch-math';
import type { Firefighter, OTRequest } from './allocation-engine';
import type { DistanceMatrix } from './allocation-engine';

type CascadePhase = 'ff-callback' | 'ff-noncallback' | 'ood-ff-callback' | 'ood-ff-noncallback' | 'so-callback' | 'sso-callback' | 'so-noncallback' | 'sso-noncallback';
type MustMightWont = 'must' | 'might' | 'wont';

export interface TraceStep {
  phase: CascadePhase | 'filter' | 'threshold' | 'assign' | 'summary';
  message: string;
  detail?: string;
  badge: 'info' | 'pass' | 'reject' | 'assign' | 'warn' | 'header';
  indent?: number;
}

export interface DebugTraceCandidate {
  id: number;
  name: string;
  watch: string;
  station: string;
  stationId: number;
  district: string | null;
  rank: string;
  otDays: number;
  otNights: number;
  totalOt: number;
  shift: string;
  callback: string | null;
  distance: number;
  threshold: string;
  qualifications: Record<string, boolean>;
  isAssigned: boolean;
  isEligible: boolean;
  cascadePhase: CascadePhase | null;
  filterReason: string;
}

export interface DebugTrace {
  steps: TraceStep[];
  candidates: DebugTraceCandidate[];
  summary: {
    totalCandidates: number;
    passedFilter: number;
    mustCount: number;
    mightCount: number;
    lockedOutCount: number;
    wontCount: number;
    assigned: number;
    slotsRequested: number;
    slotsFilled: number;
    slotsUnfilled: number;
    cascadePhasesUsed: CascadePhase[];
  };
}



/**
 * Build a full debug trace for an OT request, running every cascade phase.
 */
export async function buildCascadeDebugTrace(
  allFirefighters: Firefighter[],
  distanceMatrix: DistanceMatrix,
  request: { date: string; shift_type: 'Day' | 'Night'; station_id: number; number_of_slots: number },
): Promise<DebugTrace> {
  const steps: TraceStep[] = [];
  const candidates: DebugTraceCandidate[] = [];

  const rawDate = request.date as unknown;
  let otDate: Date;
  if (typeof rawDate === 'string') {
    const [y, mo, d] = rawDate.split('-').map(Number);
    otDate = new Date(Date.UTC(y, mo - 1, d));
  } else if (rawDate instanceof Date) {
    otDate = new Date(Date.UTC(rawDate.getUTCFullYear(), rawDate.getUTCMonth(), rawDate.getUTCDate()));
  } else {
    return createEmptyTrace();
  }

  // Header
  steps.push({ phase: 'summary', message: `━━━ OT Request: ${request.date} | ${request.shift_type} Shift | ${request.number_of_slots} slots ━━━`, badge: 'info' });

  // Phase definitions — same cascade order as engine
  const phases: CascadePhase[] = ['ff-callback', 'ff-noncallback', 'ood-ff-callback', 'ood-ff-noncallback', 'so-callback', 'sso-callback', 'so-noncallback', 'sso-noncallback'];
  let slotsRemaining = request.number_of_slots;
  const assignedIds = new Set<number>();

  for (const phase of phases) {
    if (slotsRemaining <= 0) {
      steps.push({ phase, message: `━━━ Phase ${phase.toUpperCase()} — SKIPPED (all slots filled) ━━━`, badge: 'info' });
      continue;
    }

    steps.push({ phase, message: `━━━ Phase: ${phase.toUpperCase()} ━━━`, badge: 'header' });

    // Filter by phase
    let eligible: Firefighter[] = [];
    const reasons = new Map<number, string>();

    for (const ff of allFirefighters) {
      if (assignedIds.has(ff.id)) {
        reasons.set(ff.id, 'Already assigned this run');
        continue;
      }

      const { pass, reason } = filterByPhase(ff, phase, otDate, request);
      if (pass) {
        eligible.push(ff);
        reasons.set(ff.id, '✅ Eligible');
      } else {
        reasons.set(ff.id, reason);
      }
    }

    steps.push({ phase, message: `Filtered: ${eligible.length} / ${allFirefighters.length} eligible`, badge: 'info', indent: 1 });

    // Show per-firefighter filter results
    const byPhase: Record<string, string[]> = {};
    for (const ff of allFirefighters) {
      const r = reasons.get(ff.id) || 'Unknown';
      const key = r.startsWith('✅') ? 'Eligible' : 'Excluded';
      if (!byPhase[key]) byPhase[key] = [];
      byPhase[key].push(`${ff.first_name} ${ff.last_name} (${ff.watch}) → ${r}`);
    }

    for (const ff of allFirefighters) {
      const distance = getDist(ff.station_id, request.station_id, distanceMatrix);
      const r = reasons.get(ff.id) || '';
      const isEligible = r.startsWith('✅');
      steps.push({
        phase,
        message: `${ff.first_name} ${ff.last_name}`,
        detail: `${ff.watch} | ${ff.station_name || 'Unknown'} | shift=${getShift(ff.watch as any, otDate)} | cb=${getCallbackType(ff.watch as any, otDate) || 'none'} | OT=${(ff.ot_count_days + ff.ot_count_nights)} | dist=${distance > 900 ? '???' : distance + 'km'} → ${r}`,
        badge: isEligible ? 'pass' : 'reject',
        indent: 1,
      });
    }

    if (eligible.length === 0) {
      steps.push({ phase, message: `No eligible candidates in phase ${phase}`, badge: 'warn', indent: 1 });
      continue;
    }

    // Compute Must/Might/Won't
    const thresholds = computeMustMightWonThreshold(eligible, slotsRemaining);
    for (const ff of eligible) {
      const t = thresholds.get(ff.id) || 'wont';
      const d = getDist(ff.station_id, request.station_id, distanceMatrix);
      candidates.push({
        id: ff.id,
        name: `${ff.first_name} ${ff.last_name}`,
        watch: ff.watch,
        station: ff.station_name || 'Unknown',
        stationId: ff.station_id,
        district: ff.district,
        rank: ff.rank,
        otDays: ff.ot_count_days,
        otNights: ff.ot_count_nights,
        totalOt: (ff.ot_count_days + ff.ot_count_nights),
        shift: getShift(ff.watch as any, otDate),
        callback: getCallbackType(ff.watch as any, otDate),
        distance: d,
        threshold: t,
        qualifications: ff.qualifications,
        isAssigned: false,
        isEligible: true,
        cascadePhase: phase,
        filterReason: reasons.get(ff.id) || '',
      });
    }

    // Sort: must → might → locked_out by threshold → OT → distance
    const thresholdOrder: Record<string, number> = { must: 0, might: 1, locked_out: 2, wont: 3 };
    const sorted = [...eligible].sort((a, b) => {
      const at = thresholds.get(a.id) || 'wont';
      const bt = thresholds.get(b.id) || 'wont';
      if (thresholdOrder[at] !== thresholdOrder[bt]) return thresholdOrder[at] - thresholdOrder[bt];
      if (a.ot_count_days + a.ot_count_nights !== b.ot_count_days + b.ot_count_nights) return (a.ot_count_days + a.ot_count_nights) - (b.ot_count_days + b.ot_count_nights);
      return (getDist(a.station_id, request.station_id, distanceMatrix)) - (getDist(b.station_id, request.station_id, distanceMatrix));
    });

    // Assign
    let assigned = 0;
    for (const ff of sorted) {
      if (assigned >= slotsRemaining) break;
      const t = thresholds.get(ff.id) || 'wont';
      if (t === 'wont') continue;

      const candidate = candidates.find(c => c.id === ff.id);
      if (candidate) candidate.isAssigned = true;

      steps.push({
        phase: 'assign',
        message: `✅ ASSIGNED: ${ff.first_name} ${ff.last_name}`,
        detail: `${ff.watch} | threshold=${t} | OT=${(ff.ot_count_days + ff.ot_count_nights)} | dist=${getDist(ff.station_id, request.station_id, distanceMatrix)}km | phase=${phase}`,
        badge: 'assign',
      });

      assignedIds.add(ff.id);
      assigned++;
      slotsRemaining--;
    }

    steps.push({ phase, message: `${assigned} assigned in phase ${phase} (${slotsRemaining} remaining)`, badge: assigned > 0 ? 'info' : 'warn', indent: 1 });
  }

  // Summary
  const assignedCount = candidates.filter(c => c.isAssigned).length;
  const mustCount = candidates.filter(c => c.threshold === 'must').length;
  const mightCount = candidates.filter(c => c.threshold === 'might').length;
  const lockedCount = candidates.filter(c => c.threshold === 'wont').length;
  const wontCount = candidates.filter(c => c.threshold === 'wont').length;

  steps.push({
    phase: 'summary',
    message: `━━━━━━━━ SUMMARY ━━━━━━━━`,
    detail: `Assigned: ${assignedCount}/${request.number_of_slots} | Must: ${mustCount} | Might: ${mightCount} | Locked: ${lockedCount} | Won't: ${wontCount} | Remaining: ${slotsRemaining}`,
    badge: 'info',
  });

  return {
    steps,
    candidates,
    summary: {
      totalCandidates: allFirefighters.length,
      passedFilter: candidates.length,
      mustCount,
      mightCount,
      lockedOutCount: lockedCount,
      wontCount,
      assigned: assignedCount,
      slotsRequested: request.number_of_slots,
      slotsFilled: assignedCount,
      slotsUnfilled: request.number_of_slots - assignedCount,
      cascadePhasesUsed: [...new Set(candidates.map(c => c.cascadePhase).filter(Boolean))] as CascadePhase[],
    },
  };
}

function filterByPhase(
  ff: Firefighter,
  phase: CascadePhase,
  otDate: Date,
  request: { date: string; shift_type: 'Day' | 'Night' },
): { pass: boolean; reason: string } {
  const shiftInfo = getShiftStatus(ff.watch as any, otDate);
  if (shiftInfo.includes('On Leave')) return { pass: false, reason: 'On Leave' };

  const shift = getShift(ff.watch as any, otDate);
  const callback = getCallbackType(ff.watch as any, otDate);

  if ((phase as string) === 'callback') {
    if (shift === 'Off' && !callback) return { pass: false, reason: 'Off, no callback' };
    if (callback === '#2a-EveningDay2' && request.shift_type === 'Day') return { pass: false, reason: '#2a excluded for Day shift' };
    if (request.shift_type === 'Day' && callback === '#3-AfterLastNight') return { pass: false, reason: '#3 is Night-only' };
    if (request.shift_type === 'Day' && callback === '#2b-DayOfNight1') return { pass: false, reason: '#2b is Night-only' };
    if (request.shift_type === 'Day' && shift === 'Night') return { pass: false, reason: 'Night shift, not Day' };
    if (request.shift_type === 'Night' && shift === 'Day' && !callback) return { pass: false, reason: 'Day shift, not Night' };
    if (!callback && shift !== 'Off') return { pass: false, reason: 'Regular working shift, no callback' };
    return { pass: true, reason: 'Eligible via callback or working shift' };
  }

  if ((phase as string) === 'non-callback') {
    if (callback) return { pass: false, reason: 'Already in callback pool' };
    if (ff.district !== 'Waitemata') return { pass: false, reason: `Not Waitemata (${ff.district})` };
    if (request.shift_type === 'Day' && shift === 'Day') {
      if (ff.want_to_work_day) return { pass: true, reason: 'Day shift, wants work' };
      return { pass: false, reason: 'Day shift, does not want work' };
    }
    if (request.shift_type === 'Night' && shift === 'Night') {
      if (ff.want_to_work_night) return { pass: true, reason: 'Night shift, wants work' };
      return { pass: false, reason: 'Night shift, does not want work' };
    }
    return { pass: false, reason: `Wrong shift (${shift})` };
  }

  if ((phase as string) === 'out-of-district') {
    if (ff.district === 'Waitemata') return { pass: false, reason: 'Waitemata (check non-callback first)' };
    if (request.shift_type === 'Day' && !ff.want_to_work_day) return { pass: false, reason: 'Day shift, does not want work' };
    if (request.shift_type === 'Night' && !ff.want_to_work_night) return { pass: false, reason: 'Night shift, does not want work' };
    return { pass: true, reason: 'Out-of-district, wants work' };
  }

  if ((phase as string) === 'SO') {
    if (ff.rank !== 'SO') return { pass: false, reason: 'Not SO rank' };
    if (request.shift_type === 'Day' && !ff.want_to_work_day) return { pass: false, reason: 'Does not want Day work' };
    if (request.shift_type === 'Night' && !ff.want_to_work_night) return { pass: false, reason: 'Does not want Night work' };
    return { pass: true, reason: 'SO rank, wants work' };
  }

  if ((phase as string) === 'SSO') {
    if (ff.rank !== 'SSO') return { pass: false, reason: 'Not SSO rank' };
    if (request.shift_type === 'Day' && !ff.want_to_work_day) return { pass: false, reason: 'Does not want Day work' };
    if (request.shift_type === 'Night' && !ff.want_to_work_night) return { pass: false, reason: 'Does not want Night work' };
    return { pass: true, reason: 'SSO rank, wants work' };
  }

  return { pass: false, reason: 'Unknown phase' };
}

function computeMustMightWonThreshold(
  candidates: Firefighter[],
  availableSlots: number,
): Map<number, MustMightWont> {
  const result = new Map<number, MustMightWont>();
  if (candidates.length === 0) return result;
  const sorted = [...candidates].sort((a, b) => (a.ot_count_days + a.ot_count_nights) - (b.ot_count_days + b.ot_count_nights));
  const groups = new Map<number, Firefighter[]>();
  for (const ff of sorted) {
    if (!groups.has((ff.ot_count_days + ff.ot_count_nights))) groups.set((ff.ot_count_days + ff.ot_count_nights), []);
    groups.get((ff.ot_count_days + ff.ot_count_nights))!.push(ff);
  }
  let cumulative = 0;
  let allRemainingAreWonT = false;
  for (const [, group] of groups) {
    if (allRemainingAreWonT) {
      for (const ff of group) result.set(ff.id, 'wont');
      continue;
    }
    const newCumulative = cumulative + group.length;
    if (newCumulative <= availableSlots) {
      for (const ff of group) result.set(ff.id, 'must');
      cumulative = newCumulative;
    } else {
      const slotsRemaining = availableSlots - cumulative;
      for (let i = 0; i < group.length; i++) {
        if (i < slotsRemaining) result.set(group[i].id, 'might');
        else result.set(group[i].id, 'wont');
      }
      cumulative = availableSlots;
      allRemainingAreWonT = true;
    }
  }
  return result;
}

function getDist(a: number, b: number, m: DistanceMatrix): number {
  return m[a]?.[b] ?? 999;
}

function createEmptyTrace(): DebugTrace {
  return {
    steps: [],
    candidates: [],
    summary: {
      totalCandidates: 0, passedFilter: 0, mustCount: 0, mightCount: 0,
      lockedOutCount: 0, wontCount: 0, assigned: 0, slotsRequested: 0,
      slotsFilled: 0, slotsUnfilled: 0, cascadePhasesUsed: [],
    },
  };
}

```

## File: src\engine\allocation-engine-v2.ts
```typescript
import { Pool } from 'pg';
import { canDoOT as canDoOTBase, getShift, getCallbackType, isOnLeave, type Watch, type ShiftType, type CallbackType } from './watch-math';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Firefighter {
  id: number;
  first_name: string;
  last_name: string;
  station_id: number;
  station_name: string;
  district: string;
  area_id: number;
  watch: string;
  rank: 'FF' | 'QFF' | 'SFF' | 'SO' | 'SSO';
  qualifications: Record<string, boolean>;
  preferences: { districts: string[]; stations: string[] };
  want_to_work_day: boolean;
  want_to_work_night: boolean;
  ot_count_days: number;
  ot_count_nights: number;
  ot_count_callback_days: number;
  ot_count_callback_nights: number;
  ot_count_noncallback_days: number;
  ot_count_noncallback_nights: number;
  is_active: boolean;
}

export interface OTRequest {
  station_id: number;
  station_name: string;
  district: string;
  date: string;
  shift_type: 'Day' | 'Night';
  slots: number;
  specialist_type: string | null;
  required_rank: 'FF' | 'SO' | 'SSO' | 'SO_OR_SSO';
  required_qualifications: string[];
}

export interface DistanceMatrix {
  [fromStationId: number]: { [toStationId: number]: number };
}

export interface Assignment {
  firefighter_id: number;
  firefighter_name: string;
  rank: string;
  home_station: string;
  home_district: string;
  distance: number;
  cascadePhase: string;
  otCount: number;
  threshold: 'must' | 'might' | 'wont';
  callback: string | null;
  qualifications: string[];
  assignedAtGroup: number;
  assignedStation: string;
}

export interface AllocationResult {
  station_name: string;
  station_id: number;
  slots: number;
  specialist: string | null;
  required_rank: string;
  assignedFirefighters: Assignment[];
  phasesUsed: string[];
}

export interface TraceEntry {
  type: 'header' | 'info' | 'debug' | 'assign' | 'skip' | 'lost';
  message: string;
  detail?: string;
}

// ─── Group Definitions ────────────────────────────────────────────────────────

export interface GroupDef {
  id: number;
  name: string;
  phase: string;
  rankFilter: 'FF' | 'SO' | 'SO_OR_SSO' | 'SSO' | 'FF_OR_SO' | 'SO_OR_SSO';
  districtFilter: 'in' | 'ood-adj' | 'ood-distant' | 'any';
  isCallback: boolean | null; // null = not applicable (officers)
  otCounter: 'callback' | 'noncallback' | 'officer';
}

export const GROUPS: GroupDef[] = [
  { id: 1, name: 'FF in-district callback',         phase: 'ff-callback',        rankFilter: 'FF',         districtFilter: 'in',        isCallback: true,  otCounter: 'callback' },
  { id: 2, name: 'FF in-district non-callback',      phase: 'ff-noncallback',      rankFilter: 'FF',         districtFilter: 'in',        isCallback: false, otCounter: 'noncallback' },
  { id: 3, name: 'FF OOD-adjacent callback',         phase: 'ood-adj-cb',          rankFilter: 'FF',         districtFilter: 'ood-adj',   isCallback: true,  otCounter: 'callback' },
  { id: 4, name: 'FF OOD-adjacent non-callback',     phase: 'ood-adj-nc',          rankFilter: 'FF',         districtFilter: 'ood-adj',   isCallback: false, otCounter: 'noncallback' },
  { id: 5, name: 'FF OOD-distant callback',          phase: 'ood-dist-cb',         rankFilter: 'FF',         districtFilter: 'ood-distant',isCallback: true,  otCounter: 'callback' },
  { id: 6, name: 'FF OOD-distant non-callback',      phase: 'ood-dist-nc',         rankFilter: 'FF',         districtFilter: 'ood-distant',isCallback: false, otCounter: 'noncallback' },
  { id: 7, name: 'SO pool',                          phase: 'so',                  rankFilter: 'SO_OR_SSO',  districtFilter: 'any',       isCallback: null,  otCounter: 'officer' },
  { id: 8, name: 'SSO pool',                         phase: 'sso',                 rankFilter: 'SSO',        districtFilter: 'any',       isCallback: null,  otCounter: 'officer' },
];

// ─── OOD Adjacency Map ────────────────────────────────────────────────────────

type DistrictRing = 'in' | 'ood-adj' | 'ood-distant';

const ADJACENCY_RINGS: Record<string, Record<string, DistrictRing>> = {
  'Auckland':           { 'Auckland': 'in', 'Waitemata': 'ood-adj', 'Counties Manukau': 'ood-adj' },
  'Waitemata':          { 'Waitemata': 'in', 'Auckland': 'ood-adj', 'Counties Manukau': 'ood-distant' },
  'Counties Manukau':   { 'Counties Manukau': 'in', 'Auckland': 'ood-adj', 'Waitemata': 'ood-distant' },
};

function getDistrictRing(ffDistrict: string, stationDistrict: string): DistrictRing {
  return ADJACENCY_RINGS[stationDistrict]?.[ffDistrict] ?? 'ood-distant';
}

// ─── Watch Helpers ────────────────────────────────────────────────────────────

export function getShiftForWatch(watch: string, dateStr: string): 'Day' | 'Night' | 'Off' {
  return getShift(watch as Watch, new Date(dateStr));
}

export function getCallbackForWatch(watch: string, dateStr: string): string | null {
  return getCallbackType(watch as Watch, new Date(dateStr));
}

export function canDoOT(
  ff: Firefighter,
  dateStr: string,
  shiftType: 'Day' | 'Night',
): { pass: boolean; reason: string } {
  // Use the universal logic from watch-math for consistent rule enforcement
  return canDoOTBase(ff as any, dateStr, shiftType);
}

// ─── OT Count Helpers ─────────────────────────────────────────────────────────

function getOTCount(ff: Firefighter, counter: 'callback' | 'noncallback' | 'officer', shiftType: 'Day' | 'Night'): number {
  if (counter === 'callback') {
    return shiftType === 'Day' ? ff.ot_count_callback_days : ff.ot_count_callback_nights;
  }
  if (counter === 'noncallback') {
    return shiftType === 'Day' ? ff.ot_count_noncallback_days : ff.ot_count_noncallback_nights;
  }
  // officer counter — use callback counter as the primary OT measure
  return shiftType === 'Day' ? ff.ot_count_callback_days : ff.ot_count_callback_nights;
}

const OFFICER_HOME_GRACE = 2; // admin-configurable; loaded from DB in production

function adjustedOTCount(ff: Firefighter, counter: 'callback' | 'noncallback' | 'officer', shiftType: 'Day' | 'Night', isHomeStation: boolean): number {
  const raw = getOTCount(ff, counter, shiftType);
  if (counter === 'officer' && isHomeStation) {
    return Math.max(0, raw - OFFICER_HOME_GRACE);
  }
  return raw;
}

// ─── Qualification / Preference Helpers ──────────────────────────────────────

function checkQualifications(ff: Firefighter, quals: string[]): boolean {
  if (!quals || quals.length === 0) return true;
  for (const q of quals) { if (!ff.qualifications[q]) return false; }
  return true;
}

function checkPreferences(ff: Firefighter, otStationName: string, otDistrict: string): boolean {
  const { districts, stations } = ff.preferences;
  if (!districts?.length && !stations?.length) return true;
  if (stations?.length > 0) return stations.includes(otStationName);
  if (districts?.length > 0) return districts.includes(otDistrict);
  return true;
}

function rankMatchesFilter(rank: string, filter: GroupDef['rankFilter']): boolean {
  switch (filter) {
    case 'FF':        return rank === 'FF' || rank === 'QFF' || rank === 'SFF';
    case 'SO_OR_SSO': return rank === 'SO' || rank === 'SSO';
    case 'SSO':       return rank === 'SSO';
    case 'FF_OR_SO':  return rank === 'FF' || rank === 'QFF' || rank === 'SFF' || rank === 'SO';
    default:          return false;
  }
}

export function getDistance(fromStationId: number, toStationId: number, matrix: DistanceMatrix): number {
  if (fromStationId === toStationId) return 0;
  const from = matrix[fromStationId];
  if (!from) return 999;
  return from[toStationId] ?? 999;
}

// ─── Must / Might / Won't ─────────────────────────────────────────────────────

function computeMustMightThreshold(
  candidates: { ff: Firefighter; distance: number; otCount: number }[],
  slots: number,
): Map<number, 'must' | 'might' | 'wont'> {
  const result = new Map<number, 'must' | 'might' | 'wont'>();
  if (candidates.length === 0 || slots <= 0) return result;

  const sorted = [...candidates].sort((a, b) => {
    if (a.otCount !== b.otCount) return a.otCount - b.otCount;
    return a.distance - b.distance;
  });

  const mustCount = Math.min(slots, sorted.length);
  for (let i = 0; i < sorted.length; i++) {
    const t: 'must' | 'might' | 'wont' = i < mustCount ? 'must' : 'might';
    result.set(sorted[i].ff.id, t);
  }
  return result;
}

// ─── Candidate Collection ─────────────────────────────────────────────────────

interface CandidateEntry {
  ff: Firefighter;
  req: OTRequest;
  distKm: number;
  otCount: number;
  group: GroupDef;
  isHomeStation: boolean;
  threshold: 'must' | 'might' | 'wont';
}

export function getEligibleGroups(ff: Firefighter, req: OTRequest): GroupDef[] {
  // Determine which groups this FF belongs to for this request
  const results: GroupDef[] = [];
  const ffDistrict = ff.district;
  const reqDistrict = req.district;
  const districtRing = getDistrictRing(ffDistrict, reqDistrict);
  const shift = getShiftForWatch(ff.watch, req.date);
  const watchCb = getCallbackForWatch(ff.watch, req.date);

  // FF groups (1-6)
  if (ff.rank === 'FF' || ff.rank === 'QFF' || ff.rank === 'SFF') {
    // In-district
    if (districtRing === 'in') {
      if (watchCb) results.push(GROUPS[0]); // Group 1: callback
      else results.push(GROUPS[1]);          // Group 2: non-callback
    }
    // OOD-adjacent
    if (districtRing === 'ood-adj') {
      if (watchCb) results.push(GROUPS[2]); // Group 3
      else results.push(GROUPS[3]);          // Group 4
    }
    // OOD-distant
    if (districtRing === 'ood-distant') {
      if (watchCb) results.push(GROUPS[4]); // Group 5
      else results.push(GROUPS[5]);          // Group 6
    }
  }

  // SO pool (Group 7) — SO and SSO can ride up to fill SO requests
  if ((ff.rank === 'SO' || ff.rank === 'SSO') && (req.required_rank === 'SO' || req.required_rank === 'SO_OR_SSO')) {
    results.push(GROUPS[6]); // Group 7: SO pool
  }

  // SSO pool (Group 8) — SSO only
  if (ff.rank === 'SSO' && req.required_rank === 'SSO') {
    results.push(GROUPS[7]); // Group 8: SSO pool
  }

  return results;
}

// ─── Candidate Collection ────────────────────────────────────────────────────

export function collectCandidatesAtDistance(
  ffs: Firefighter[],
  reqs: OTRequest[],
  distanceMatrix: DistanceMatrix,
  globalAssigned: Set<number>,
  slotsRemaining: Record<number, number>,
): Map<number, { ff: Firefighter; req: OTRequest; distKm: number; otCount: number; group: GroupDef; isHomeStation: boolean }[]> {

  const byStation = new Map<number, { ff: Firefighter; req: OTRequest; distKm: number; otCount: number; group: GroupDef; isHomeStation: boolean }[]>();

  for (const ff of ffs) {
    if (globalAssigned.has(ff.id)) continue;

    for (const req of reqs) {
      if (slotsRemaining[req.station_id] <= 0) continue;

      // ── Rank compatibility ──────────────────────────────────────────────
      const isFF = ff.rank === 'FF' || ff.rank === 'QFF' || ff.rank === 'SFF';
      if (isFF && (req.required_rank === 'SO' || req.required_rank === 'SSO')) continue;
      if (ff.rank === 'SO' && req.required_rank === 'SSO') continue;

      // ── Group assignment ─────────────────────────────────────────────────
      const ffDistrict = ff.district;
      const reqDistrict = req.district;
      const distKm = getDistance(ff.station_id, req.station_id, distanceMatrix);
      const isHomeStation = ff.station_id === req.station_id;
      const shift = getShiftForWatch(ff.watch, req.date);
      const watchCb = getCallbackForWatch(ff.watch, req.date);
      const eligible = canDoOT(ff, req.date, req.shift_type);
      if (!eligible.pass) continue;

      // Determine district ring
      const ring = ADJACENCY_RINGS[reqDistrict]?.[ffDistrict] ?? 'ood-distant';

      // Required quals
      const requiredQuals = req.required_qualifications.length > 0
        ? req.required_qualifications
        : req.specialist_type ? [req.specialist_type] : [];
      if (!checkQualifications(ff, requiredQuals)) continue;
      if (!checkPreferences(ff, req.station_name, req.district)) continue;

      // Non-callback FFs must want the shift
      if (watchCb === null && shift === 'Off') {
        const wantField = req.shift_type === 'Day' ? ff.want_to_work_day : ff.want_to_work_night;
        if (!wantField) continue;
      }

      // Build group list for this FF / request
      const groups: GroupDef[] = [];

      // FF groups (1–6)
      if (isFF) {
        if (ring === 'in') {
          if (watchCb) groups.push(GROUPS[0]); else groups.push(GROUPS[1]);
        } else if (ring === 'ood-adj') {
          if (watchCb) groups.push(GROUPS[2]); else groups.push(GROUPS[3]);
        } else {
          if (watchCb) groups.push(GROUPS[4]); else groups.push(GROUPS[5]);
        }
      }

      // SO pool (Group 7) — SO or SSO can ride up to fill SO requests
      if ((ff.rank === 'SO' || ff.rank === 'SSO') &&
          (req.required_rank === 'SO' || req.required_rank === 'SO_OR_SSO')) {
        groups.push(GROUPS[6]);
      }

      // SSO pool (Group 8) — SSO only
      if (ff.rank === 'SSO' && req.required_rank === 'SSO') {
        groups.push(GROUPS[7]);
      }

      if (groups.length === 0) continue;

      const otCount = adjustedOTCount(ff, groups[0].otCounter, req.shift_type, isHomeStation);

      for (const group of groups) {
        if (!byStation.has(req.station_id)) byStation.set(req.station_id, []);
        byStation.get(req.station_id)!.push({ ff, req, distKm, otCount, group, isHomeStation });
      }
    }
  }

  return byStation;
}

// ─── Core Allocation ──────────────────────────────────────────────────────────

export async function allocateV2(
  requests: OTRequest[],
  allFirefighters: Firefighter[],
  distanceMatrix: DistanceMatrix,
  existingAssigned: Set<number> = new Set(),
): Promise<AllocationResult[]> {

  const globalAssigned = new Set<number>(existingAssigned);
  const slotsRemaining: Record<number, number> = {};
  for (const req of requests) slotsRemaining[req.station_id] = req.slots;

  const results = new Map<number, AllocationResult>();
  for (const req of requests) {
    results.set(req.station_id, {
      station_name: req.station_name,
      station_id: req.station_id,
      slots: req.slots,
      specialist: req.specialist_type,
      required_rank: req.required_rank,
      assignedFirefighters: [],
      phasesUsed: [],
    });
  }

  // Determine max distance
  let maxDistance = 0;
  for (const from of Object.values(distanceMatrix)) {
    for (const km of Object.values(from)) {
      if (Number(km) > maxDistance) maxDistance = Number(km);
    }
  }

  // ── Distance phases (all stations in lockstep) ───────────────────────────
  for (let dist = 0; dist <= maxDistance; dist++) {
    const candidatesByStation = collectCandidatesAtDistance(
      allFirefighters, requests, distanceMatrix, globalAssigned, slotsRemaining,
    );

    // Filter to exactly this distance
    const atThisDist = new Map<number, any[]>();
    for (const [stationId, cands] of Array.from(candidatesByStation)) {
      const filtered = cands.filter(c => c.distKm === dist);
      if (filtered.length > 0) atThisDist.set(stationId, filtered);
    }

    if (atThisDist.size === 0) continue;
    if (Array.from(atThisDist.values()).every(c => c.length === 0 || slotsRemaining[Array.from(atThisDist.keys())[atThisDist.size - 1]] <= 0)) {
      // Check if any station still needs fill
      const anyNeeds = Array.from(atThisDist.keys()).some(sid => slotsRemaining[sid] > 0);
      if (!anyNeeds) break;
    }

    // ── Process groups 1–8 in priority order ──────────────────────────────
    for (const group of GROUPS) {
      const groupByStation = new Map<number, any[]>();
      for (const [stationId, cands] of Array.from(atThisDist)) {
        const gc = cands.filter(c => c.group.id === group.id);
        if (gc.length > 0) groupByStation.set(stationId, gc);
      }
      if (groupByStation.size === 0) continue;

      for (const [stationId, cands] of Array.from(groupByStation)) {
        if (slotsRemaining[stationId] <= 0) continue;
        const req = requests.find(r => r.station_id === stationId)!;

        // Must / Might / Won't threshold
        const threshold = computeMustMightThreshold(
          cands.map(c => ({ ff: c.ff, distance: c.distKm, otCount: c.otCount })),
          slotsRemaining[stationId],
        );

        // Sort: must (lowest OT) first, then might, then distance
        cands.sort((a, b) => {
          const ta = threshold.get(a.ff.id)!;
          const tb = threshold.get(b.ff.id)!;
          if (ta !== tb) {
            if (ta === 'must') return -1;
            if (tb === 'must') return 1;
            return ta === 'might' ? -1 : 1;
          }
          if (a.otCount !== b.otCount) return a.otCount - b.otCount;
          return a.distKm - b.distKm;
        });

        // Assign only 'must' candidates; 'might' waits for next distance
        for (const c of cands) {
          if (slotsRemaining[stationId] <= 0) break;
          const t = threshold.get(c.ff.id)!;
          if (t === 'wont') break;
          if (t === 'might') continue;

          globalAssigned.add(c.ff.id);
          slotsRemaining[stationId]--;

          const assignment: Assignment = {
            firefighter_id: c.ff.id,
            firefighter_name: `${c.ff.first_name} ${c.ff.last_name}`,
            rank: c.ff.rank,
            home_station: c.ff.station_name,
            home_district: c.ff.district,
            distance: c.distKm,
            cascadePhase: c.group.phase,
            otCount: c.otCount,
            threshold: t,
            callback: getCallbackForWatch(c.ff.watch, c.req.date),
            qualifications: Object.keys(c.ff.qualifications).filter(k => c.ff.qualifications[k]),
            assignedAtGroup: c.group.id,
            assignedStation: c.req.station_name,
          };

          const result = results.get(stationId)!;
          result.assignedFirefighters.push(assignment);
          if (!result.phasesUsed.includes(c.group.phase)) result.phasesUsed.push(c.group.phase);
        }
      }
    }
  }

  // ── SSO → SO overflow ────────────────────────────────────────────────────
  for (const req of requests) {
    if (slotsRemaining[req.station_id] <= 0) continue;
    if (req.required_rank !== 'SO' && req.required_rank !== 'SO_OR_SSO') continue;

    const ssoPool = allFirefighters.filter(f =>
      f.rank === 'SSO' &&
      !globalAssigned.has(f.id) &&
      canDoOT(f, req.date, req.shift_type).pass &&
      checkQualifications(f, req.required_qualifications) &&
      checkPreferences(f, req.station_name, req.district)
    );

    if (ssoPool.length === 0) continue;

    ssoPool.sort((a, b) => {
      const ota = adjustedOTCount(a, 'officer', req.shift_type, a.station_id === req.station_id);
      const otb = adjustedOTCount(b, 'officer', req.shift_type, b.station_id === req.station_id);
      if (ota !== otb) return ota - otb;
      return getDistance(a.station_id, req.station_id, distanceMatrix) -
             getDistance(b.station_id, req.station_id, distanceMatrix);
    });

    while (slotsRemaining[req.station_id] > 0 && ssoPool.length > 0) {
      const sso = ssoPool.shift()!;
      globalAssigned.add(sso.id);
      slotsRemaining[req.station_id]--;

      const assignment: Assignment = {
        firefighter_id: sso.id,
        firefighter_name: `${sso.first_name} ${sso.last_name}`,
        rank: sso.rank,
        home_station: sso.station_name,
        home_district: sso.district,
        distance: getDistance(sso.station_id, req.station_id, distanceMatrix),
        cascadePhase: 'sso-overflow',
        otCount: adjustedOTCount(sso, 'officer', req.shift_type, sso.station_id === req.station_id),
        threshold: 'must',
        callback: null,
        qualifications: Object.keys(sso.qualifications).filter(k => sso.qualifications[k]),
        assignedAtGroup: 9,
        assignedStation: req.station_name,
      };

      const result = results.get(req.station_id)!;
      result.assignedFirefighters.push(assignment);
      if (!result.phasesUsed.includes('sso-overflow')) result.phasesUsed.push('sso-overflow');
    }
  }

  return Array.from(results.values());
}

export async function loadAllFirefighters(pool: Pool): Promise<Firefighter[]> {
  const { rows } = await pool.query(`
    SELECT ff.id, ff.first_name, ff.last_name, ff.station_id, s.name AS station_name,
           s.area_id, a.name AS district, ff.watch, ff.rank, ff.qualifications, ff.preferences,
           ff.want_to_work_day, ff.want_to_work_night,
           ff.ot_count_days, ff.ot_count_nights,
           ff.ot_count_callback_days, ff.ot_count_callback_nights,
           ff.ot_count_noncallback_days, ff.ot_count_noncallback_nights,
           ff.is_active
    FROM firefighters ff
    JOIN stations s ON ff.station_id = s.id
    JOIN areas a ON s.area_id = a.id
    WHERE ff.is_active = true
    ORDER BY a.name, s.name, ff.last_name, ff.first_name
  `);
  return rows.map((row: Record<string, unknown>) => ({
    id: Number(row.id),
    first_name: String(row.first_name),
    last_name: String(row.last_name),
    station_id: Number(row.station_id),
    station_name: String(row.station_name),
    district: String(row.district),
    area_id: Number(row.area_id),
    watch: String(row.watch),
    rank: String(row.rank) as Firefighter['rank'],
    qualifications: typeof row.qualifications === 'string' ? JSON.parse(row.qualifications as string) : (row.qualifications || {}),
    preferences: typeof row.preferences === 'string' ? JSON.parse(row.preferences as string) : (row.preferences || { districts: [], stations: [] }),
    want_to_work_day: Boolean(row.want_to_work_day),
    want_to_work_night: Boolean(row.want_to_work_night),
    ot_count_days: Number(row.ot_count_days),
    ot_count_nights: Number(row.ot_count_nights),
    ot_count_callback_days: Number(row.ot_count_callback_days),
    ot_count_callback_nights: Number(row.ot_count_callback_nights),
    ot_count_noncallback_days: Number(row.ot_count_noncallback_days),
    ot_count_noncallback_nights: Number(row.ot_count_noncallback_nights),
    is_active: Boolean(row.is_active),
  }));
}

export async function loadDistanceMatrix(pool: Pool): Promise<DistanceMatrix> {
  const { rows } = await pool.query(`SELECT station_id, distances FROM station_distances`);
  const matrix: DistanceMatrix = {};
  for (const row of rows) {
    const distObj: Record<number, number> = {};
    for (const [k, v] of Object.entries(row.distances as Record<string, unknown>)) {
      distObj[Number(k)] = Number(v);
    }
    matrix[row.station_id] = distObj;
  }
  return matrix;
}

export async function runAllocation(
  requests: OTRequest[],
  pool: Pool,
): Promise<{ stationResults: AllocationResult[]; traces: Record<string, TraceEntry[]> }> {
  const [allFFs, distMatrix] = await Promise.all([
    loadAllFirefighters(pool),
    loadDistanceMatrix(pool),
  ]);
  const stationResults = await allocateV2(requests, allFFs, distMatrix, new Set());
  return { stationResults, traces: {} };
}

```

## File: src\engine\allocation-engine.ts
```typescript
import { Pool } from 'pg';
import { getShift, getCallbackType, isOnLeave } from './watch-math';
import { getPool } from '../lib/db';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Firefighter {
  id: number; first_name: string; last_name: string; station_id: number;
  station_name: string; district: string; area_id: number; watch: string;
  rank: 'FF' | 'QFF' | 'SFF' | 'SO' | 'SSO';
  qualifications: Record<string, boolean>; preferences: { districts: string[]; stations: string[] };
  want_to_work_day: boolean; want_to_work_night: boolean;
  ot_count_days: number; ot_count_nights: number;
  ot_count_callback_days: number; ot_count_callback_nights: number;
  ot_count_noncallback_days: number; ot_count_noncallback_nights: number;
  is_active: boolean;
}

export interface OTRequest {
  station_id: number; station_name: string; district: string;
  date: string; shift_type: 'Day' | 'Night'; slots: number; specialist_type: string | null;
}

export interface DistanceMatrix { [fromStationId: number]: { [toStationId: number]: number }; }

export interface Assignment {
  firefighter_id: number; firefighter_name: string; rank: string;
  home_station: string; distance: number; cascadePhase: string;
  otCount: number; threshold: 'must' | 'might' | 'wont';
  callback: string | null; qualifications: string[]; assignedAtBlock: number;
  assignedStation: string;
}

export interface AllocationResult {
  station_name: string; station_id: number; slots: number;
  specialist: string | null; assignedFirefighters: Assignment[]; phasesUsed: string[];
}

export interface TraceEntry {
  type: 'header' | 'info' | 'debug' | 'assign' | 'skip' | 'lost'; message: string; detail?: string;
}

// ─── Block Definitions ────────────────────────────────────────────────────────

interface BlockDef {
  id: number; phase: string;
  rankFilter: 'FF' | 'SO' | 'SSO' | 'FF+SO' | 'FF+SSO' | 'SO+SSO';
  inDistrict: boolean | 'any'; isCallback: boolean;
  otCounter: 'callback' | 'noncallback'; note: string;
}

const BLOCKS: BlockDef[] = [
  { id:1, phase:'ff-callback',       rankFilter:'FF',    inDistrict:true,  isCallback:true,  otCounter:'callback',    note:'In-district FF callback' },
  { id:2, phase:'ff-noncallback',    rankFilter:'FF',    inDistrict:true,  isCallback:false, otCounter:'noncallback', note:'In-district FF non-callback' },
  { id:3, phase:'ood-ff-callback',   rankFilter:'FF',    inDistrict:'any', isCallback:true,  otCounter:'callback',    note:'Out-of-district FF callback' },
  { id:4, phase:'ood-ff-noncallback',rankFilter:'FF',    inDistrict:'any', isCallback:false, otCounter:'noncallback', note:'Out-of-district FF non-callback' },
  { id:5, phase:'so-callback',       rankFilter:'FF+SO', inDistrict:'any', isCallback:true,  otCounter:'callback',    note:'SO callback (all districts)' },
  { id:6, phase:'sso-callback',      rankFilter:'SO+SSO',inDistrict:'any', isCallback:true,  otCounter:'callback',    note:'SSO callback (all districts)' },
  { id:7, phase:'so-noncallback',    rankFilter:'FF+SO', inDistrict:'any', isCallback:false, otCounter:'noncallback', note:'SO non-callback (all districts)' },
  { id:8, phase:'sso-noncallback',   rankFilter:'SO+SSO',inDistrict:'any', isCallback:false, otCounter:'noncallback', note:'SSO non-callback (all districts)' },
];

function getRank(ff: Firefighter): 'FF' | 'SO' | 'SSO' {
  if (ff.rank === 'SO') return 'SO';
  if (ff.rank === 'SSO') return 'SSO';
  return 'FF';
}

function rankMatchesFilter(rank: 'FF' | 'SO' | 'SSO', filter: BlockDef['rankFilter']): boolean {
  switch (filter) {
    case 'FF':    return rank === 'FF';
    case 'SO':    return rank === 'SO';
    case 'SSO':   return rank === 'SSO';
    case 'FF+SO': return rank === 'FF' || rank === 'SO';
    case 'FF+SSO':return rank === 'FF' || rank === 'SSO';
    case 'SO+SSO':return rank === 'SO' || rank === 'SSO';
  }
}

function getOTCount(ff: Firefighter, counter: 'callback' | 'noncallback', shiftType: 'Day' | 'Night'): number {
  if (counter === 'callback') return shiftType === 'Day' ? ff.ot_count_callback_days : ff.ot_count_callback_nights;
  return shiftType === 'Day' ? ff.ot_count_noncallback_days : ff.ot_count_noncallback_nights;
}

export function getShiftForWatch(watch: string, dateStr: string): 'Day' | 'Night' | 'Off' {
  return getShift(watch as any, new Date(dateStr));
}

export function getCallbackForWatch(watch: string, dateStr: string): string | null {
  return getCallbackType(watch as any, new Date(dateStr));
}

export function canDoOT(ff: Firefighter, dateStr: string, shiftType: 'Day' | 'Night'): { pass: boolean; reason: string } {
  const shift = getShiftForWatch(ff.watch, dateStr);
  if (shift === 'Off' && isOnLeave(ff.watch as any, new Date(dateStr))) return { pass: false, reason: 'On Leave' };
  const cb = getCallbackForWatch(ff.watch, dateStr);
  if (cb === '#3-AfterLastNight' && shiftType === 'Day') return { pass: false, reason: 'Between Nights Day OT excluded' };
  if (cb === '#2a-EveningDay2'    && shiftType === 'Day') return { pass: false, reason: '#2a EveningDay2 excludes Day' };
  if (cb === '#2b-DayOfNight1'    && shiftType === 'Day') return { pass: false, reason: '#2b DayOfNight1 excludes Day' };
  if (shift !== 'Off' && cb === null) {
    if (shiftType === 'Day'   && shift === 'Night') return { pass: false, reason: 'On Night shift' };
    if (shiftType === 'Night' && shift === 'Day')    return { pass: false, reason: 'On Day shift' };
  }
  return { pass: true, reason: 'Watch-eligible' };
}

function checkQualifications(ff: Firefighter, quals: string[]): boolean {
  if (!quals || quals.length === 0) return true;
  for (const q of quals) { if (!ff.qualifications[q]) return false; }
  return true;
}

function checkPreferences(ff: Firefighter, otStationName: string, otDistrict: string): boolean {
  const { districts, stations } = ff.preferences;
  if ((!districts?.length) && (!stations?.length)) return true;
  if (stations?.length > 0) return stations.includes(otStationName);
  if (districts?.length > 0) return districts.includes(otDistrict);
  return true;
}

export function getDistance(fromStationId: number, toStationId: number, matrix: DistanceMatrix): number {
  if (fromStationId === toStationId) return 0;
  const from = matrix[fromStationId];
  if (!from) return 999;
  return from[toStationId] ?? 999;
}

/**
 * Threshold: candidates sorted by OT count.
 * The first `slots` candidates get 'must'.
 * Any remaining slots (up to len-slots) get 'might'.
 * Beyond that: 'wont'.
 *
 * lowerPriorityAssigned: seats already taken by higher blocks — reduces
 * the effective slot pool for this block's threshold calculation.
 */
export function computeMustMightWonThreshold(
  candidates: { ff: Firefighter; distance: number; otCount: number }[],
  slots: number,
  lowerPriorityAssigned: number = 0,
): Map<number, 'must' | 'might' | 'wont'> {
  const result = new Map<number, 'must' | 'might' | 'wont'>();
  if (candidates.length === 0 || slots <= 0) return result;
  const sorted = [...candidates].sort((a, b) => {
    if (a.otCount !== b.otCount) return a.otCount - b.otCount;
    return a.distance - b.distance;
  });
  const effectiveSlots = Math.max(0, slots - lowerPriorityAssigned);
  const mustCount = effectiveSlots > 0 ? Math.min(effectiveSlots, sorted.length) : 0;
  for (let i = 0; i < sorted.length; i++) {
    const threshold: 'must' | 'might' | 'wont' =
      i < mustCount ? 'must' :
      i - mustCount < Math.max(0, slots - lowerPriorityAssigned - mustCount) ? 'might' :
      'wont';
    result.set(sorted[i].ff.id, threshold);
  }
  return result;
}

// ─── Data Loading ─────────────────────────────────────────────────────────────

export async function loadAllFirefighters(pool: Pool): Promise<Firefighter[]> {
  const rows = await pool.query<Record<string, unknown>>(
    `SELECT ff.id, ff.first_name, ff.last_name, ff.station_id, s.name AS station_name,
            s.area_id, a.name AS district, ff.watch, ff.rank, ff.qualifications,
            ff.preferences, ff.want_to_work_day, ff.want_to_work_night,
            ff.ot_count_days, ff.ot_count_nights,
            ff.ot_count_callback_days, ff.ot_count_callback_nights,
            ff.ot_count_noncallback_days, ff.ot_count_noncallback_nights,
            ff.is_active
     FROM firefighters ff
     JOIN stations s ON ff.station_id = s.id
     JOIN areas a ON s.area_id = a.id
     WHERE ff.is_active = true
     ORDER BY a.name, s.name, ff.last_name, ff.first_name`
  );
  return rows.rows.map(row => {
    const r = row as Record<string, unknown>;
    return {
      id:Number(r.id), first_name:String(r.first_name), last_name:String(r.last_name),
      station_id:Number(r.station_id), station_name:String(r.station_name),
      district:String(r.district), area_id:Number(r.area_id),
      watch:String(r.watch), rank:r.rank as Firefighter['rank'],
      qualifications:typeof r.qualifications==='string'?JSON.parse(r.qualifications):(r.qualifications||{}),
      preferences:typeof r.preferences==='string'?JSON.parse(r.preferences):(r.preferences||{districts:[],stations:[]}),
      want_to_work_day:Boolean(r.want_to_work_day), want_to_work_night:Boolean(r.want_to_work_night),
      ot_count_days:Number(r.ot_count_days), ot_count_nights:Number(r.ot_count_nights),
      ot_count_callback_days:Number(r.ot_count_callback_days), ot_count_callback_nights:Number(r.ot_count_callback_nights),
      ot_count_noncallback_days:Number(r.ot_count_noncallback_days), ot_count_noncallback_nights:Number(r.ot_count_noncallback_nights),
      is_active:Boolean(r.is_active),
    } as Firefighter;
  });
}

export async function loadDistanceMatrix(pool: Pool): Promise<DistanceMatrix> {
  const rows = await pool.query<{ station_id: number; distances: Record<string, number> }>(
    `SELECT station_id, distances FROM station_distances`
  );
  const matrix: DistanceMatrix = {};
  for (const row of rows.rows) {
    const distObj: Record<number, number> = {};
    for (const [k, v] of Object.entries(row.distances)) distObj[Number(k)] = Number(v);
    matrix[row.station_id] = distObj;
  }
  return matrix;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Allocation Engine v2 — Group/Global assignment per distance phase
//
// Key difference from v1:
//   - Candidates are collected for ALL stations at once (not per-station)
//   - Sorted by OT count globally
//   - Assigned in order: each FF takes their nearest AVAILABLE station
//     within their eligible set
//   - This enables cross-station coordination: a FF can "spill over"
//     to a distant station if their nearest is full, freeing up their
//     nearest for a higher-priority candidate
// ─────────────────────────────────────────────────────────────────────────────

export async function allocateForOTRequest(
  requests: OTRequest[],
  allFirefighters: Firefighter[],
  distanceMatrix: DistanceMatrix,
  existingAssigned: Set<number> = new Set(),
): Promise<AllocationResult[]> {
  // Map station_id → request for quick lookup
  const requestByStation = new Map<number, OTRequest>();
  for (const req of requests) requestByStation.set(req.station_id, req);

  // Track slots remaining per station
  const slotsRemaining: Record<number, number> = {};
  for (const req of requests) slotsRemaining[req.station_id] = req.slots;

  // Global assignment set: once an FF is assigned, they can't be reassigned
  const globalAssigned = new Set<number>(existingAssigned);

  // Per-station results
  const results: Map<number, AllocationResult> = new Map();
  for (const req of requests) {
    results.set(req.station_id, {
      station_name: req.station_name, station_id: req.station_id,
      slots: req.slots, specialist: req.specialist_type,
      assignedFirefighters: [], phasesUsed: [],
    });
  }

  // Determine max distance
  let maxDistance = 0;
  for (const from of Object.values(distanceMatrix)) {
    for (const km of Object.values(from)) {
      if (Number(km) > maxDistance) maxDistance = Number(km);
    }
  }

  // ── Per distance phase: collect ALL candidates across ALL stations
for (let dist = 0; dist <= maxDistance; dist++) {
  // Collect candidates at this distance for each (block, station) pair
  const candidatesByBlock = new Map<number, { ff: Firefighter; req: OTRequest; distance: number; otCount: number }[]>();

  for (const block of BLOCKS) {
    candidatesByBlock.set(block.id, []);
    for (const req of requests) {
      if (slotsRemaining[req.station_id] <= 0) continue;
      for (const ff of allFirefighters) {
        if (globalAssigned.has(ff.id)) continue;
        const shift = getShiftForWatch(ff.watch as any, req.date);
        const watchCb = getCallbackForWatch(ff.watch as any, req.date);
        if (block.isCallback) { if (!watchCb) continue; }
        else { if (watchCb) continue; }
        const eligible = canDoOT(ff, req.date, req.shift_type);
        if (!eligible.pass) continue;
        if (!rankMatchesFilter(getRank(ff), block.rankFilter)) continue;
        if (block.inDistrict === true && ff.district !== req.district) continue;
        const distKm = getDistance(ff.station_id, req.station_id, distanceMatrix);
        if (distKm !== dist) continue;
        // OOD blocks must exclude in-district FFs (inDistrict===true filter handles
        // in-district blocks; OOD blocks use inDistrict:any but still need this check)
        if (block.inDistrict === 'any' && ff.district === req.district) continue;
        const requiredQuals = req.specialist_type ? [req.specialist_type] : [];
        if (!checkQualifications(ff, requiredQuals)) continue;
        if (!checkPreferences(ff, req.station_name, req.district)) continue;
        if (!block.isCallback && shift !== 'Off') {
          const wantField = req.shift_type === 'Day' ? ff.want_to_work_day : ff.want_to_work_night;
          if (!wantField) continue;
        }
        candidatesByBlock.get(block.id)!.push({ ff, req, distance: distKm, otCount: getOTCount(ff, block.otCounter, req.shift_type) });
      }
    }
  }

  // DEBUG: log distance phase summary
    let totalAssignedThisDist = 0;
    for (const req of requests) totalAssignedThisDist += (req.slots - slotsRemaining[req.station_id]);
    console.log(`DIST=${dist}: total assigned so far=${totalAssignedThisDist}`);
  // DEBUG: log distance phase summary
  // Check if ANY block has candidates at this distance
  let anyCandidateAtThisDist = false;
  for (const cands of Array.from(candidatesByBlock.values())) {
    if (cands.length > 0) { anyCandidateAtThisDist = true; break; }
  }
  if (!anyCandidateAtThisDist) continue;

  // Per-station threshold: each station independently decides must/might/wont
  // Rule: only "must" candidates fill slots. "might" wait for next distance.
  // Every evaluated candidate (must or might) is consumed globally.
  for (const block of BLOCKS) {
    const candidates = candidatesByBlock.get(block.id)!;
    if (candidates.length === 0) continue;

    // Slots taken by higher-priority blocks at each station
    const slotsTakenByHigher = new Map<number, number>();
    for (const req of requests) {
      const result = results.get(req.station_id)!;
      slotsTakenByHigher.set(req.station_id, req.slots - slotsRemaining[req.station_id]);
    }

    // Group candidates by target station for per-station threshold
    const byStation = new Map<number, typeof candidates>();
    for (const c of candidates) {
      if (!byStation.has(c.req.station_id)) byStation.set(c.req.station_id, []);
      byStation.get(c.req.station_id)!.push(c);
    }

    // Assign station-by-station: only "must" fills; "might" waits next distance
    for (const [stationId, stationCands] of Array.from(byStation)) {
      const req = requests.find(r => r.station_id === stationId)!;

      // Station full: mark ALL candidates as globally consumed
      if (slotsRemaining[stationId] <= 0) {
        for (const c of stationCands) globalAssigned.add(c.ff.id);
        continue;
      }

      const higherTaken = slotsTakenByHigher.get(stationId) ?? 0;

      // Threshold scoped to REMAINING slots (not req.slots) to prevent over-filling
      const threshold = computeMustMightWonThreshold(
        stationCands.map(c => ({ ff: c.ff, distance: c.distance, otCount: c.otCount })),
        slotsRemaining[stationId],
        higherTaken,
      );

      // Sort: must first (lowest OT), then might, then distance
      stationCands.sort((a, b) => {
        const ta = threshold.get(a.ff.id)!;
        const tb = threshold.get(b.ff.id)!;
        if (ta !== tb) {
          if (ta === 'must') return -1;
          if (tb === 'must') return 1;
          return ta === 'might' ? -1 : 1;
        }
        if (a.otCount !== b.otCount) return a.otCount - b.otCount;
        return a.distance - b.distance;
      });

      // Only "must" fills slots. "might" waits next distance.
      // Every evaluated candidate (must or might) is consumed globally.
      for (const c of stationCands) {
        const t = threshold.get(c.ff.id)!;
        if (t === 'wont') {
          // Below threshold - skip but do NOT consume globally; lower OT at same
          // distance still valid at next distance phase
          continue;
        }
        // Evaluated (must or might) - consume globally
        globalAssigned.add(c.ff.id);

        if (t === 'must' && slotsRemaining[stationId] > 0) {
          slotsRemaining[stationId]--;
          const assignment: Assignment = {
            firefighter_id: c.ff.id,
            firefighter_name: `${c.ff.first_name} ${c.ff.last_name}`,
            rank: c.ff.rank,
            home_station: c.ff.station_name,
            distance: c.distance,
            cascadePhase: block.phase,
            otCount: c.otCount,
            threshold: t,
            callback: getCallbackForWatch(c.ff.watch as any, c.req.date),
            qualifications: Object.keys(c.ff.qualifications).filter(k => c.ff.qualifications[k]),
            assignedAtBlock: block.id,
            assignedStation: c.req.station_name,
          };
          const stationResult = results.get(stationId)!;
          stationResult.assignedFirefighters.push(assignment);
          if (!stationResult.phasesUsed.includes(block.phase)) stationResult.phasesUsed.push(block.phase);
        }
      }
    }
  }

}
return Array.from(results.values());
}


export async function runAllocation(
  requests: OTRequest[], pool: Pool,
): Promise<{ stationResults: AllocationResult[]; traces: Record<string, TraceEntry[]> }> {
  const [allFFs, distMatrix] = await Promise.all([
    loadAllFirefighters(pool), loadDistanceMatrix(pool),
  ]);
  const stationResults = await allocateForOTRequest(requests, allFFs, distMatrix, new Set());
  return { stationResults, traces: {} };
}


```

## File: src\engine\ui-helpers.ts
```typescript
export function getWatchColor(watch?: string | null): string {
  switch (watch) {
    case 'Red': return '#ef4444';
    case 'Green': return '#22c55e';
    case 'Blue': return '#3b82f6';
    case 'Brown': return '#a16207';
    case 'Yellow': return '#eab308';
    default: return '#9ca3af';
  }
}

export function getOperationalTime(realDate: Date): { date: Date; shift: 'Day' | 'Night' } {
  const hours = realDate.getHours();
  const d = new Date(realDate);
  if (hours < 8) {
    d.setDate(d.getDate() - 1);
    return { date: d, shift: 'Night' };
  } else if (hours < 18) {
    return { date: d, shift: 'Day' };
  } else {
    return { date: d, shift: 'Night' };
  }
}

export function getCalendarDays(viewDate: Date, shift: 'Day' | 'Night'): ({ date: Date; day: number; color: string } | null)[] {
  const year = viewDate.getUTCFullYear();
  const month = viewDate.getUTCMonth();
  
  // First day of month
  const firstDay = new Date(Date.UTC(year, month, 1));
  const startingDayOfWeek = firstDay.getUTCDay(); // 0 (Sun) to 6 (Sat)
  
  // Total days in month
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const totalDays = lastDay.getUTCDate();
  
  const days: ({ date: Date; day: number; color: string } | null)[] = [];
  
  // Padding for start of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Fill in days
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(Date.UTC(year, month, d));
    const { getOnDutyWatch } = require('./watch-math');
    const onDutyWatch = getOnDutyWatch(date, shift);
    days.push({
      date,
      day: d,
      color: getWatchColor(onDutyWatch)
    });
  }
  
  return days;
}

export const REGIONS = [
  "New Zealand",
  "Te Hiku",
  "Nga Tai ki te Puku",
  "Te Upoko",
  "Te Ihu"
];

export const REGION_TO_DISTRICTS: Record<string, string[]> = {
  "Te Hiku": ["Auckland", "Waitemata", "Counties Manukau", "Northland"],
  "Nga Tai ki te Puku": ["Waikato", "Bay of Plenty", "Taranaki", "Gisborne"],
  "Te Upoko": ["Wellington", "Manawatu-Whanganui", "Hawkes Bay"],
  "Te Ihu": ["Canterbury", "Otago", "Southland", "Nelson-Marlborough", "West Coast"]
};

```

## File: src\engine\watch-math.ts
```typescript
// ============================================================
// FENZ Overtime — Watch Mathematics Engine
// Computes shifts, callbacks, leave deterministically from anchor dates
// ============================================================

export type Watch = 'Green' | 'Red' | 'Brown' | 'Blue' | 'Yellow';
export type ShiftType = 'Day' | 'Night' | 'Off';
export type CallbackType = '#1-BeforeDay1' | '#2a-EveningDay2' | '#2b-DayOfNight1' | '#3-AfterLastNight' | null;

// All dates are parsed as NZ midnight (yyyy-mm-dd in local NZ time)
const ANCHORS: Record<Exclude<Watch, 'Yellow'>, string> = {
  Green: '2026-01-31',
  Red:   '2026-02-02',
  Brown: '2026-02-04',
  Blue:  '2026-02-06',
};

const CYCLE: ShiftType[] = ['Day', 'Day', 'Night', 'Night', 'Off', 'Off', 'Off', 'Off'];

function parseLocalDate(s: string): Date {
  // Parse as UTC, but treat the date string as NZ local date
  // This gives us the calendar date without timezone interference
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Returns the cycle index (0-7) for a given watch and date.
 * For Yellow: returns -1 (not in cycle).
 */
export function getCycleIndex(watch: Watch, date: Date): number {
  if (watch === 'Yellow') return -1;
  const anchor = parseLocalDate(ANCHORS[watch]);
  return ((daysBetween(anchor, date) % 8) + 8) % 8; // Handle negative diffs
}

/**
 * Returns shift type (Day/Night/Off) for a given watch and date.
 * Yellow: Mon-Fri → Day (simplified — actual day/night assignment TBD)
 *          Sat/Sun → Off (but eligible for OT)
 */
export function getShift(watch: Watch, date: Date): ShiftType {
  if (watch === 'Yellow') {
    const dow = date.getUTCDay();
    return dow >= 1 && dow <= 5 ? 'Day' : 'Off';
  }
  const idx = getCycleIndex(watch, date);
  return CYCLE[idx];
}

/**
 * Determine callback type for a watch on a given date.
 * Returns null if not a callback date.
 * 
 * Callback rules (relative to Day 1):
 * #1 = day before Day 1
 * #2a = evening of Day 2 (same calendar day as Day 2)
 * #2b = day of Night 1 (same calendar day as N1 starts)
 * #3 = night after last night (evening of Night 2's day)
 * 
 * Only ONE of #2a or #2b per cycle (to stay within 24h).
 */
export function getCallbackType(watch: Watch, date: Date): CallbackType {
  if (watch === 'Yellow') return null; // Yellow callbacks handled separately
  const idx = getCycleIndex(watch, date);
  
  switch (idx) {
    case 7: // Off 4 → day before Day 1 → Callback #1
      return '#1-BeforeDay1';
    case 1: // Day 2 → evening of Day 2 → Callback #2a
      return '#2a-EveningDay2';
    case 2: // Night 1 → day of Night 1 → Callback #2b
      return '#2b-DayOfNight1';
    case 4: // Off 1 → night after finishing Night 2 → Callback #3
      return '#3-AfterLastNight';
    default:
      return null;
  }
}

/**
 * Check if a date is a callback opportunity for a watch.
 */
export function isCallback(watch: Watch, date: Date): boolean {
  return getCallbackType(watch, date) !== null;
}

/**
 * Check if a firefighter is on leave on a given date.
 * Leave: 10 cycles × 16 days = 160-day full cycle.
 * Leave 1 starts on the anchor date for each watch.
 */
export function isOnLeave(watch: Watch, date: Date, leaveNumber?: number): boolean {
  if (watch === 'Yellow') return false; // TBD
  const anchor = parseLocalDate(ANCHORS[watch]);
  const days = daysBetween(anchor, date);
  const cyclePos = ((days % 160) + 160) % 160;
  return cyclePos < 16; // First 16 days of each 160-day cycle = leave
}

/**
 * Get the current leave number (1-10) for a watch on a given date.
 */
export function getLeaveNumber(watch: Watch, date: Date): number {
  if (watch === 'Yellow') return 1; // TBD
  const anchor = parseLocalDate(ANCHORS[watch]);
  const days = daysBetween(anchor, date);
  const cyclePos = ((days % 160) + 160) % 160;
  return Math.floor(cyclePos / 16) + 1;
}

export function canDoOT(
  ff: { watch: Watch }, 
  date: string | Date, 
  requestShiftType: 'Day' | 'Night'
): { pass: boolean; reason: string } {
  const d = typeof date === 'string' ? parseLocalDate(date) : date;
  const watch = ff.watch as Watch;

  // 1. On Leave
  if (isOnLeave(watch, d)) {
    return { pass: false, reason: "On Leave" };
  }

  const shift = getShift(watch, d);
  const cb = getCallbackType(watch, d);

  // 2. Already working this exact shift?
  if (shift === requestShiftType) {
    return { pass: false, reason: `Already working regular ${shift} shift` };
  }

  // 3. Callback Exemptions (Allow 24h shifts for valid callbacks)
  // FENZ rules allow working 24h if it's a designated callback window
  const isCorrectCallback = (
    (cb === '#1-BeforeDay1' && requestShiftType === 'Day') ||
    (cb === '#2a-EveningDay2' && requestShiftType === 'Night') ||
    (cb === '#2b-DayOfNight1' && requestShiftType === 'Day') ||
    (cb === '#3-AfterLastNight' && requestShiftType === 'Night')
  );

  if (isCorrectCallback) {
    return { pass: true, reason: "Callback-eligible" };
  }

  // 4. Non-Callback Fatigue Rules (No 24h shifts)
  
  // Rule: If working a regular shift today, cannot do the "other" OT shift (prevents 24h)
  if (shift !== 'Off') {
     return { pass: false, reason: `Regular ${shift} shift prevents ${requestShiftType} OT (24h limit)` };
  }

  // Rule: Cannot work Day OT if you just finished Night 2 (Specific fatigue)
  if (cb === '#3-AfterLastNight' && requestShiftType === 'Day') {
    return { pass: false, reason: "Just finished Nights - Day OT excluded" };
  }

  return { pass: true, reason: "Watch-eligible" };
}

/**
 * Get all callback dates for a watch within a date range.
 */
export function getCallbackDates(
  watch: Watch,
  startDate: Date,
  endDate: Date,
): { date: Date; type: CallbackType }[] {
  const results: { date: Date; type: CallbackType }[] = [];
  const d = new Date(startDate.getTime());
  while (d <= endDate) {
    const cb = getCallbackType(watch, d);
    if (cb) {
      results.push({ date: new Date(d.getTime()), type: cb });
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return results;
}

/**
 * For the prototype: compute shift status for display.
 * Returns: "Day Shift", "Night Shift", "Off Duty", "On Leave", "Callback #[n]"
 */
export function getShiftStatus(watch: Watch, date: Date): string {
  if (isOnLeave(watch, date)) {
    const leaveNum = getLeaveNumber(watch, date);
    return `On Leave (Leave ${leaveNum})`;
  }
  
  const callback = getCallbackType(watch, date);
  const shift = getShift(watch, date);
  
  if (callback) {
    return `${shift} | Callback ${callback}`;
  }
  
  switch (shift) {
    case 'Day': return 'Day Shift';
    case 'Night': return 'Night Shift';
    case 'Off': return 'Off Duty';
  }
}

export function getOnDutyWatch(date: Date, shift: ShiftType): Watch {
  const watches: Exclude<Watch, 'Yellow'>[] = ['Green', 'Red', 'Brown', 'Blue'];
  for (const w of watches) {
    if (getShift(w, date) === shift) return w;
  }
  return 'Green'; // Fallback
}

export function findWatchOccurrence(
  watch: Watch, 
  date: Date, 
  direction: 'prev' | 'next', 
  shiftType: ShiftType = 'Day'
): { date: Date; shift: ShiftType } {
  const d = new Date(date.getTime());
  const step = direction === 'next' ? 1 : -1;
  
  // Max search 16 days (2 full cycles)
  for (let i = 0; i < 16; i++) {
    if (getShift(watch, d) === shiftType) {
      return { date: new Date(d.getTime()), shift: shiftType };
    }
    d.setUTCDate(d.getUTCDate() + step);
  }
  
  return { date: new Date(date), shift: shiftType };
}

```

## File: src\lib\db.ts
```typescript
import { Pool } from 'pg';

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      host: process.env.PGHOST || '127.0.0.1',
      port: parseInt(process.env.PGPORT || '5433'),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'fenz_dev_pass',
      database: process.env.PGDATABASE || 'fenz_ot',
      ssl: false,
    });
  }
  return _pool;
}

export async function query(text: string, params?: any[]) {
  console.log("[DB]", text.substring(0, 80));
  const pool = getPool();
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text: text.substring(0, 60), duration, rows: res.rowCount });
  return res;
}

export async function getClient() {
  const client = await getPool().connect();
  return client;
}
```

## File: src\lib\seed.ts
```typescript
// FENZ Overtime Seed Script
// Populates 29 stations across 3 districts, full distance table, watch anchors, 48 firefighters

import { query } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

export async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  // --- 1. Clear existing data (FK-safe order) ---
  await query(`DELETE FROM ot_count_log`);
  await query(`DELETE FROM audit_logs`);
  await query(`DELETE FROM ot_assignments`);
  await query(`DELETE FROM ot_offers`);
  await query(`DELETE FROM ot_requests`);
  await query(`DELETE FROM availability`);
  await query(`DELETE FROM allocation_runs`);
  await query(`DELETE FROM district_relievers`);
  await query(`DELETE FROM station_distances`);
  await query(`DELETE FROM watch_anchors`);
  await query(`DELETE FROM firefighters`);
  await query(`DELETE FROM stations`);
  await query(`DELETE FROM areas`);
  await query(`DELETE FROM system_settings`);

  console.log('  ✅ Cleared existing data');

  // --- 2. Areas ---
  const areaWaitemata = await query(`INSERT INTO areas (name) VALUES ('Waitemata') RETURNING id`);
  const areaAuckland = await query(`INSERT INTO areas (name) VALUES ('Auckland') RETURNING id`);
  const areaCountiesManukau = await query(`INSERT INTO areas (name) VALUES ('Counties Manukau') RETURNING id`);

  const waitemataId = areaWaitemata.rows[0].id;
  const aucklandId = areaAuckland.rows[0].id;
  const countiesManukauId = areaCountiesManukau.rows[0].id;

  console.log('  ✅ Areas created');

  // --- 3. Stations (29 total) ---
  const stationDefs: { id: number; name: string; areaId: number }[] = [
    // Waitemata (11)
    { id: 1485, name: 'Albany', areaId: waitemataId },
    { id: 1482, name: 'Birkenhead', areaId: waitemataId },
    { id: 1481, name: 'Devonport', areaId: waitemataId },
    { id: 1483, name: 'East Coast Bays', areaId: waitemataId },
    { id: 1464, name: 'Glen Eden', areaId: waitemataId },
    { id: 1465, name: 'Henderson', areaId: waitemataId },
    { id: 1490, name: 'Silverdale', areaId: waitemataId },
    { id: 1480, name: 'Takapuna', areaId: waitemataId },
    { id: 1466, name: 'Te Atatu', areaId: waitemataId },
    { id: 1469, name: 'Titirangi', areaId: waitemataId },
    { id: 1467, name: 'West Harbour', areaId: waitemataId },
    // Auckland (11)
    { id: 1420, name: 'Auckland City', areaId: aucklandId },
    { id: 1460, name: 'Avondale', areaId: aucklandId },
    { id: 1461, name: 'Balmoral', areaId: aucklandId },
    { id: 1427, name: 'Ellerslie', areaId: aucklandId },
    { id: 1426, name: 'Grey Lynn', areaId: aucklandId },
    { id: 1462, name: 'Mount Roskill', areaId: aucklandId },
    { id: 1423, name: 'Mount Wellington', areaId: aucklandId },
    { id: 1422, name: 'Onehunga', areaId: aucklandId },
    { id: 1425, name: 'Parnell', areaId: aucklandId },
    { id: 1421, name: 'Remuera', areaId: aucklandId },
    { id: 1424, name: 'St Heliers', areaId: aucklandId },
    // Counties Manukau (7)
    { id: 1432, name: 'Howick', areaId: countiesManukauId },
    { id: 1435, name: 'Mangere', areaId: countiesManukauId },
    { id: 1430, name: 'Manurewa', areaId: countiesManukauId },
    { id: 1431, name: 'Otahuhu', areaId: countiesManukauId },
    { id: 1433, name: 'Otara', areaId: countiesManukauId },
    { id: 1434, name: 'Papatoetoe', areaId: countiesManukauId },
    { id: 1438, name: 'Papakura', areaId: countiesManukauId },
  ];

  const stationIds: Record<string, number> = {};
  for (const def of stationDefs) {
    const res = await query(
      `INSERT INTO stations (id, name, area_id, is_specialist, specialist_type) 
       VALUES ($1, $2, $3, false, NULL) 
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area_id = EXCLUDED.area_id
       RETURNING id`,
      [def.id, def.name, def.areaId]
    );
    stationIds[def.name] = res.rows[0].id;
  }

  // Sync district column with area name
  await query(`UPDATE stations s SET district = a.name FROM areas a WHERE s.area_id = a.id`);

  console.log(`  ✅ ${Object.keys(stationIds).length} stations created`);

  // Re-sync stationIds from actual DB IDs (seed may not have cleared
  // areas/stations, so INSERT-returnING IDs may not match real DB IDs)
  const realStationRows = await query(`SELECT id, name FROM stations`);
  for (const row of realStationRows.rows) {
    stationIds[row.name] = row.id;
  console.log("DB station IDs:", JSON.stringify(stationIds));
  }

// --- 4. Station Distances (per-station JSONB: station_id, district, distances) ---
const distancePath = path.resolve(process.cwd(), 'data/station_distances.json');
const distanceData: { station: string; distances: Record<string, number>; area: string }[] = JSON.parse(
  fs.readFileSync(distancePath, 'utf-8')
);
// Build per-station distance map keyed by station_id
const stationDistMaps: Record<number, Record<number, number>> = {};
for (const entry of distanceData) {
  const fromId = stationIds[entry.station];
  if (!fromId) continue;
  const distMap: Record<number, number> = {};
  for (const [dstKey, km] of Object.entries(entry.distances)) {
    // Try exact match first, then underscore-key match (handles "Mt Wellington" vs "Mount Wellington")
    const dstName =
      Object.keys(stationIds).find(n => n === dstKey) ||
      Object.keys(stationIds).find(n => n.toLowerCase().replace(/ /g, '_') === dstKey.toLowerCase());
    if (!dstName || dstName === entry.station) continue;
    const toId = stationIds[dstName];
    if (!toId) continue;
    distMap[toId] = km;
  }
  stationDistMaps[fromId] = distMap;
}
// Derive district per station from stationDefs areaId mapping
const areaNameMap: Record<number, string> = { [waitemataId]: 'Waitemata', [aucklandId]: 'Auckland', [countiesManukauId]: 'Counties Manukau' };
const stationDistrict: Record<number, string> = {};
for (const def of stationDefs) {
  stationDistrict[stationIds[def.name]] = areaNameMap[def.areaId] ?? '';
}
// Insert one row per station (station_id, district, distances JSONB)
let distCount = 0;
for (const [sidStr, distMap] of Object.entries(stationDistMaps)) {
  const sid = Number(sidStr);
  await query(
    `INSERT INTO station_distances (station_id, district, distances)
     VALUES ($1, $2, $3)
     ON CONFLICT (station_id) DO UPDATE SET district = $2, distances = $3`,
    [sid, stationDistrict[sid] ?? '', JSON.stringify(distMap)]
  );
  distCount += Object.keys(distMap).length;
}
console.log(` ✅ ${Object.keys(stationDistMaps).length} stations with distances (${distCount} connections total)`);

  // --- 5. Watch Anchors ---
  await query(`INSERT INTO watch_anchors (watch, anchor_date, note) VALUES 
    ('Green', '2026-01-31', 'Saturday anchor'),
    ('Red', '2026-02-02', 'Monday anchor'),
    ('Brown', '2026-02-04', 'Wednesday anchor'),
    ('Blue', '2026-02-06', 'Friday anchor'),
    ('Yellow', '2026-02-01', 'Mon-Fri only, placeholder anchor')
  `);

  console.log('  ✅ Watch anchors created');

  // --- 6. Firefighters (12 per watch, 48 total) ---
  // 4 OT counters: cbD=callback days, cbN=callback nights, ncD=noncallback days, ncN=noncallback nights
  const firefighters = [
    // ═══ GREEN WATCH (12) ═══
    // Waitemata (5)
    { first: 'Wiremu', last: 'Hemara', watch: 'Green', station: 'Albany', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 3, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Sarah', last: 'Mitchell', watch: 'Green', station: 'Devonport', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 1, cbN: 0, ncD: 2, ncN: 1 },
    { first: 'Tane', last: 'Rawiri', watch: 'Green', station: 'East Coast Bays', rank: 'SFF', quals: { driver: true, not_rookie: true }, cbD: 5, cbN: 3, ncD: 3, ncN: 1 },
    { first: 'Emma', last: 'Chen', watch: 'Green', station: 'Albany', rank: 'SO', quals: { driver: true, not_rookie: true, prt: true, type4: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Jordan', last: 'Park', watch: 'Green', station: 'Silverdale', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },
    // Auckland (4)
    { first: 'Nina', last: 'Kowalski', watch: 'Green', station: 'Henderson', rank: 'FF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 2, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Rangi', last: 'Tuhoe', watch: 'Green', station: 'Grey Lynn', rank: 'QFF', quals: { driver: true, not_rookie: true }, cbD: 4, cbN: 2, ncD: 2, ncN: 1 },
    { first: 'David', last: 'Wu', watch: 'Green', station: 'Grey Lynn', rank: 'SFF', quals: { driver: true, not_rookie: true, type4: true }, cbD: 1, cbN: 1, ncD: 2, ncN: 0 },
    { first: 'Lisa', last: 'Campbell', watch: 'Green', station: 'Te Atatu', rank: 'SSO', quals: { driver: true, not_rookie: true, type4: true, prt: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },
    // Counties Manukau (3)
    { first: 'Ben', last: 'Tafua', watch: 'Green', station: 'Howick', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 4, cbN: 2, ncD: 3, ncN: 1 },
    { first: 'Jade', last: 'Renata', watch: 'Green', station: 'Mangere', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Sam', last: 'Kapoor', watch: 'Green', station: 'Otara', rank: 'SO', quals: { driver: true, not_rookie: true, type4: true }, cbD: 3, cbN: 1, ncD: 2, ncN: 1 },

    // ═══ RED WATCH (12) ═══
    // Auckland (5)
    { first: 'Liam', last: 'OBrien', watch: 'Red', station: 'Auckland City', rank: 'FF', quals: { driver: true, not_rookie: true, CBR: true }, cbD: 2, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Aroha', last: 'Te Rangi', watch: 'Red', station: 'Grey Lynn', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 4, cbN: 2, ncD: 2, ncN: 1 },
    { first: 'Marcus', last: 'Williams', watch: 'Red', station: 'Grey Lynn', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Hemi', last: 'Ngata', watch: 'Red', station: 'St Heliers', rank: 'SFF', quals: { driver: true, not_rookie: true, type4: true }, cbD: 5, cbN: 2, ncD: 2, ncN: 1 },
    { first: 'Priya', last: 'Sharma', watch: 'Red', station: 'Auckland City', rank: 'SO', quals: { driver: true, not_rookie: true, prt: true, type4: true, CBR: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },
    // Waitemata (4)
    { first: 'Jake', last: 'Morrison', watch: 'Red', station: 'Takapuna', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 2, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Maia', last: 'Henare', watch: 'Red', station: 'Birkenhead', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 3, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Chris', last: 'Evans', watch: 'Red', station: 'Albany', rank: 'SFF', quals: { driver: true, not_rookie: true }, cbD: 6, cbN: 3, ncD: 2, ncN: 1 },
    { first: 'Mereana', last: 'Kahu', watch: 'Red', station: 'Silverdale', rank: 'SO', quals: { driver: true, not_rookie: true, prt: true, type4: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 0 },
    // Counties Manukau (3)
    { first: 'Tyler', last: 'Patel', watch: 'Red', station: 'Manurewa', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 2, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Anika', last: 'Singh', watch: 'Red', station: 'Papakura', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 2, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Rawiri', last: 'Tamati', watch: 'Red', station: 'Howick', rank: 'SSO', quals: { driver: true, not_rookie: true, type4: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },

    // ═══ BROWN WATCH (12) ═══
    // Waitemata (4) — changed Henderson/Glen Eden/Te Atatu to Waitemata FFs
    { first: 'Kahu', last: 'Makiha', watch: 'Brown', station: 'Henderson', rank: 'FF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 2, cbN: 1, ncD: 1, ncN: 1 },
    { first: 'Rebecca', last: 'Taylor', watch: 'Brown', station: 'Glen Eden', rank: 'QFF', quals: { driver: true, not_rookie: true }, cbD: 3, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Luke', last: 'Tanner', watch: 'Brown', station: 'Devonport', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 2, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Hinewai', last: 'Ruru', watch: 'Brown', station: 'Takapuna', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 4, cbN: 2, ncD: 2, ncN: 1 },
    // Auckland (5)
    { first: 'Dan', last: 'Reid', watch: 'Brown', station: 'Avondale', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Nikau', last: 'Tangaroa', watch: 'Brown', station: 'Grey Lynn', rank: 'SFF', quals: { driver: true, not_rookie: true, type4: true }, cbD: 7, cbN: 4, ncD: 2, ncN: 1 },
    { first: 'Grace', last: 'Whittaker', watch: 'Brown', station: 'Balmoral', rank: 'SSO', quals: { driver: true, not_rookie: true, type4: true, prt: true }, cbD: 0, cbN: 0, ncD: 0, ncN: 0 },
    { first: 'Pete', last: 'Douglas', watch: 'Brown', station: 'Ellerslie', rank: 'SFF', quals: { driver: true, not_rookie: true }, cbD: 2, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Whina', last: 'Cooper', watch: 'Brown', station: 'Silverdale', rank: 'SO', quals: { driver: true, not_rookie: true, prt: true, type4: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },
    // Counties Manukau (3)
    { first: 'Matt', last: 'Young', watch: 'Brown', station: 'Howick', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 5, cbN: 2, ncD: 2, ncN: 1 },
    { first: 'Aria', last: 'Matene', watch: 'Brown', station: 'Mangere', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Ross', last: 'McIntyre', watch: 'Brown', station: 'Manurewa', rank: 'SO', quals: { driver: true, not_rookie: true, type4: true }, cbD: 3, cbN: 1, ncD: 2, ncN: 1 },

    // ═══ BLUE WATCH (12) ═══
    // Counties Manukau (5)
    { first: 'Tommy', last: 'Ahu', watch: 'Blue', station: 'Howick', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 4, cbN: 2, ncD: 2, ncN: 1 },
    { first: 'Fiona', last: 'Cameron', watch: 'Blue', station: 'Howick', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 2, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Sam', last: 'Tong', watch: 'Blue', station: 'Manurewa', rank: 'SFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 5, cbN: 3, ncD: 2, ncN: 1 },
    { first: 'Mere', last: 'Whare', watch: 'Blue', station: 'Mangere', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },
    { first: 'Alex', last: 'Brown', watch: 'Blue', station: 'Otara', rank: 'SO', quals: { driver: true, not_rookie: true, type4: true }, cbD: 2, cbN: 0, ncD: 1, ncN: 1 },
    // Waitemata (4)
    { first: 'Zoe', last: 'Fletcher', watch: 'Blue', station: 'Albany', rank: 'FF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Tipene', last: 'Rata', watch: 'Blue', station: 'Devonport', rank: 'QFF', quals: { driver: true, not_rookie: true }, cbD: 3, cbN: 1, ncD: 2, ncN: 1 },
    { first: 'Kate', last: 'Sullivan', watch: 'Blue', station: 'Silverdale', rank: 'SFF', quals: { driver: true, not_rookie: true, prt: true, type4: true }, cbD: 2, cbN: 0, ncD: 1, ncN: 1 },
    { first: 'Rongo', last: 'Parata', watch: 'Blue', station: 'Takapuna', rank: 'SO', quals: { driver: true, not_rookie: true, type4: true }, cbD: 3, cbN: 1, ncD: 1, ncN: 1 },
    // Auckland (3)
    { first: 'Oliver', last: 'Hunt', watch: 'Blue', station: 'Grey Lynn', rank: 'FF', quals: { driver: true, not_rookie: true }, cbD: 4, cbN: 2, ncD: 2, ncN: 1 },
    { first: 'Marama', last: 'Te Awa', watch: 'Blue', station: 'Henderson', rank: 'QFF', quals: { driver: true, not_rookie: true, prt: true }, cbD: 1, cbN: 0, ncD: 1, ncN: 0 },
    { first: 'Gary', last: 'Chen', watch: 'Blue', station: 'St Heliers', rank: 'SSO', quals: { driver: true, not_rookie: true, type4: true, prt: true }, cbD: 0, cbN: 0, ncD: 1, ncN: 0 },
  ];

  for (const ff of firefighters) {
    const otDays = ff.cbD + ff.ncD;
    const otNights = ff.cbN + ff.ncN;
    await query(
      `INSERT INTO firefighters (first_name, last_name, email, station_id, watch, rank, 
       ot_count_days, ot_count_nights, ot_count_callback_days, ot_count_callback_nights,
       ot_count_noncallback_days, ot_count_noncallback_nights, is_active, qualifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        ff.first,
        ff.last,
        `${ff.first.toLowerCase()}.${ff.last.toLowerCase().replace(/'/g, '')}@fenz.slack.com`,
        stationIds[ff.station],
        ff.watch,
        ff.rank,
        otDays,
        otNights,
        ff.cbD,
        ff.cbN,
        ff.ncD,
        ff.ncN,
        true,
        JSON.stringify(ff.quals),
      ]
    );
  }

  console.log(`  ✅ ${firefighters.length} firefighters seeded`);

  // --- 7. System Settings ---
  await query(`INSERT INTO system_settings (key, value, description) VALUES 
    ('ot_offer_mode', '"mandatory"', 'mandatory or accept_decline'),
    ('relievers_enabled', 'true', 'Whether to auto-deploy district relievers'),
    ('non_callback_approach', '"single_pool"', 'single_pool or watch_tiered'),
    ('max_continuous_hours', '24', 'Maximum continuous work hours'),
    ('min_rest_hours', '8', 'Minimum rest between shifts'),
    ('max_hours_before_mandatory_rest', '67', 'Hours before mandatory 2 days off')
  `);

  console.log('  ✅ System settings created');
  console.log('🎉 Database seeded successfully!');

  return {
    stations: Object.keys(stationIds).length,
    firefighters: firefighters.length,
    areas: 3,
  };
}

```

## File: src\lib\supabase.ts
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://db.fenz.app';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1MzE1MzAzLCJleHAiOjE5MzI5OTUzMDN9.vpjufyjBtmqAidqiRWOkz4N5iTG6q1cca34R5Mtd1XQ';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
export const getSupabaseAdmin = () => createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

```

## File: src\lib\truncate_tables.sql
```sql
TRUNCATE areas CASCADE;
TRUNCATE watch_anchors CASCADE;
TRUNCATE system_settings CASCADE;
TRUNCATE station_distances CASCADE;
TRUNCATE firefighters CASCADE;
TRUNCATE district_relievers CASCADE;
TRUNCATE allocation_runs CASCADE;
TRUNCATE ot_offers CASCADE;
TRUNCATE ot_assignments CASCADE;
TRUNCATE ot_requests CASCADE;
TRUNCATE ot_count_log CASCADE;
TRUNCATE audit_logs CASCADE;
TRUNCATE availability CASCADE;

```

## File: src\lib\utils.ts
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

## File: supabase\migrations\000001_initial_schema.sql
```sql
-- FENZ Overtime Allocation System — Database Schema
-- For PostgreSQL 15+ (Self-hosted Supabase)
-- Run: psql -U postgres -d fenz_ot -f schema.sql

-- ============================================================
-- AREAS
-- ============================================================
CREATE TABLE IF NOT EXISTS areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    area_id INTEGER REFERENCES areas(id),
    is_specialist BOOLEAN DEFAULT FALSE,
    specialist_type VARCHAR(50),
    district VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STATION DISTANCES (Distance Matrix per station)
-- ============================================================
CREATE TABLE IF NOT EXISTS station_distances (
    id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES stations(id) UNIQUE,
    district VARCHAR(50),
    distances JSONB NOT NULL DEFAULT '{}', -- Key: target station name or ID, Value: distance in KM
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FIREFIGHTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS firefighters (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    station_id INTEGER REFERENCES stations(id),
    watch VARCHAR(20) NOT NULL, -- Green, Red, Brown, Blue, Yellow
    rank VARCHAR(20) NOT NULL DEFAULT 'FF', -- FF, QFF, SFF, SO, SSO
    ot_count_days INTEGER NOT NULL DEFAULT 0,
    ot_count_nights INTEGER NOT NULL DEFAULT 0,
    ot_count_callback_days INTEGER NOT NULL DEFAULT 0,
    ot_count_callback_nights INTEGER NOT NULL DEFAULT 0,
    ot_count_noncallback_days INTEGER NOT NULL DEFAULT 0,
    ot_count_noncallback_nights INTEGER NOT NULL DEFAULT 0,
    want_to_work_day BOOLEAN DEFAULT TRUE,
    want_to_work_night BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    qualifications JSONB DEFAULT '{}', -- e.g., {"driver": true, "prt": true, "type4": false}
    preferences JSONB DEFAULT '{"districts": [], "stations": []}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WATCH ANCHORS (for shift cycle calculation)
-- ============================================================
CREATE TABLE IF NOT EXISTS watch_anchors (
    id SERIAL PRIMARY KEY,
    watch VARCHAR(20) NOT NULL UNIQUE,
    anchor_date DATE NOT NULL,
    note VARCHAR(255)
);

-- ============================================================
-- OT REQUESTS (created by officers)
-- ============================================================
CREATE TABLE IF NOT EXISTS ot_requests (
    id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES stations(id),
    date DATE NOT NULL,
    shift_type VARCHAR(10) NOT NULL, -- Day, Night
    specialist_type VARCHAR(50),
    district VARCHAR(50),
    required_qualification_ids JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'pending', -- pending, allocated, filled, cancelled
    number_of_slots INTEGER DEFAULT 1,
    number_filled INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- OT ASSIGNMENTS (firefighter ↦ OT request)
-- ============================================================
CREATE TABLE IF NOT EXISTS ot_assignments (
    id SERIAL PRIMARY KEY,
    ot_request_id INTEGER REFERENCES ot_requests(id),
    firefighter_id INTEGER REFERENCES firefighters(id),
    status VARCHAR(20) DEFAULT 'assigned', -- assigned, accepted, declined, completed, cancelled
    distance_km FLOAT,
    callback_type VARCHAR(50), -- #1, #2a, #2b, #3 or NULL
    must_might_wont VARCHAR(10) DEFAULT 'must',
    hours_allocated INTEGER, -- 10 for day, 14 for night
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    declined_reason TEXT,
    UNIQUE(ot_request_id, firefighter_id)
);

-- ============================================================
-- OFFERS (for Accept/Decline mode)
-- ============================================================
CREATE TABLE IF NOT EXISTS ot_offers (
    id SERIAL PRIMARY KEY,
    ot_request_id INTEGER REFERENCES ot_requests(id),
    firefighter_id INTEGER REFERENCES firefighters(id),
    status VARCHAR(20) DEFAULT 'sent', -- sent, accepted, declined, expired
    offered_at TIMESTAMPTZ DEFAULT NOW(),
    deadline TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    decline_reason TEXT
);

-- ============================================================
-- AVAILABILITY (firefighter signals willingness to work OT)
-- ============================================================
CREATE TABLE IF NOT EXISTS availability (
    id SERIAL PRIMARY KEY,
    firefighter_id INTEGER REFERENCES firefighters(id),
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    area_id INTEGER REFERENCES areas(id), -- Which area they're offering for (null = home area)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(firefighter_id, date)
);

-- ============================================================
-- OT COUNT LOG (audit trail for OT counter changes)
-- ============================================================
CREATE TABLE IF NOT EXISTS ot_count_log (
    id SERIAL PRIMARY KEY,
    firefighter_id INTEGER REFERENCES firefighters(id),
    counter_type VARCHAR(20) NOT NULL, -- days, nights, callback_days, callback_nights, etc.
    old_value INTEGER NOT NULL,
    new_value INTEGER NOT NULL,
    change_reason VARCHAR(255),
    related_ot_request_id INTEGER REFERENCES ot_requests(id),
    allocation_run_id INTEGER,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ALLOCATION RUNS (one run covers a batch of OT shifts)
-- ============================================================
CREATE TABLE IF NOT EXISTS allocation_runs (
    id SERIAL PRIMARY KEY,
    run_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    status VARCHAR(20) DEFAULT 'running', -- running, completed, failed
    total_allocated INTEGER DEFAULT 0,
    total_unfilled INTEGER DEFAULT 0,
    duration_ms INTEGER
);

-- ============================================================
-- SYSTEM SETTINGS (admin toggles)
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DISTRICT RELIEVERS
-- ============================================================
CREATE TABLE IF NOT EXISTS district_relievers (
    id SERIAL PRIMARY KEY,
    firefighter_id INTEGER REFERENCES firefighters(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG (general audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    user_id INTEGER,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ft_active ON firefighters(is_active);
CREATE INDEX IF NOT EXISTS idx_ft_watch ON firefighters(watch);
CREATE INDEX IF NOT EXISTS idx_ot_requests_date ON ot_requests(date);
CREATE INDEX IF NOT EXISTS idx_ot_requests_status ON ot_requests(status);
CREATE INDEX IF NOT EXISTS idx_ot_assignments_status ON ot_assignments(status);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);
CREATE INDEX IF NOT EXISTS idx_ot_count_log_ff ON ot_count_log(firefighter_id);

```

## File: supabase\seeds\001_full_seed.sql
```sql
-- FENZ OT Supabase Seed
-- Generated 2026-04-19
INSERT INTO watch_anchors (watch, anchor_date, cycle_day) VALUES ;

```

## File: supabase\seeds\001_reference_data.sql
```sql
--
-- PostgreSQL database dump
--

\restrict P6jKgMz8WjzY6VAcsWteQHRzTpiUCdgv16PiINtSaiQ9pt6vLYWJCHIusd7YdqU

-- Dumped from database version 14.22 (Ubuntu 14.22-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.22 (Ubuntu 14.22-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.areas (id, name, created_at) VALUES (34, 'Waitemata', '2026-04-19 10:10:33.574152+12') ON CONFLICT DO NOTHING;
INSERT INTO public.areas (id, name, created_at) VALUES (35, 'Auckland', '2026-04-19 10:10:33.575547+12') ON CONFLICT DO NOTHING;
INSERT INTO public.areas (id, name, created_at) VALUES (36, 'Counties Manukau', '2026-04-19 10:10:33.576818+12') ON CONFLICT DO NOTHING;


--
-- Data for Name: stations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1427, 'Ellerslie', 35, false, NULL, '2026-04-19 10:10:33.606301+12', 'Auckland') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1426, 'Grey Lynn', 35, false, NULL, '2026-04-19 10:10:33.607873+12', 'Auckland') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1462, 'Mount Roskill', 35, false, NULL, '2026-04-19 10:10:33.609365+12', 'Auckland') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1423, 'Mount Wellington', 35, false, NULL, '2026-04-19 10:10:33.610769+12', 'Auckland') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1422, 'Onehunga', 35, false, NULL, '2026-04-19 10:10:33.612509+12', 'Auckland') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1425, 'Parnell', 35, false, NULL, '2026-04-19 10:10:33.614008+12', 'Auckland') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1421, 'Remuera', 35, false, NULL, '2026-04-19 10:10:33.615569+12', 'Auckland') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1424, 'St Heliers', 35, false, NULL, '2026-04-19 10:10:33.617055+12', 'Auckland') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1432, 'Howick', 36, false, NULL, '2026-04-19 10:10:33.618573+12', 'Counties Manukau') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1435, 'Mangere', 36, false, NULL, '2026-04-19 10:10:33.620095+12', 'Counties Manukau') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1430, 'Manurewa', 36, false, NULL, '2026-04-19 10:10:33.621493+12', 'Counties Manukau') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1431, 'Otahuhu', 36, false, NULL, '2026-04-19 10:10:33.622852+12', 'Counties Manukau') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1433, 'Otara', 36, false, NULL, '2026-04-19 10:10:33.624386+12', 'Counties Manukau') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1434, 'Papatoetoe', 36, false, NULL, '2026-04-19 10:10:33.625782+12', 'Counties Manukau') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1438, 'Papakura', 36, false, NULL, '2026-04-19 10:10:33.627373+12', 'Counties Manukau') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1485, 'Albany', 34, false, NULL, '2026-04-19 10:10:33.578205+12', 'Waitemata') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1482, 'Birkenhead', 34, false, NULL, '2026-04-19 10:10:33.579839+12', 'Waitemata') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1481, 'Devonport', 34, false, NULL, '2026-04-19 10:10:33.581377+12', 'Waitemata') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1483, 'East Coast Bays', 34, false, NULL, '2026-04-19 10:10:33.582906+12', 'Waitemata') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1464, 'Glen Eden', 34, false, NULL, '2026-04-19 10:10:33.584486+12', 'Waitemata') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1465, 'Henderson', 34, false, NULL, '2026-04-19 10:10:33.586251+12', 'Waitemata') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1490, 'Silverdale', 34, false, NULL, '2026-04-19 10:10:33.588109+12', 'Waitemata') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1480, 'Takapuna', 34, false, NULL, '2026-04-19 10:10:33.589907+12', 'Waitemata') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1466, 'Te Atatu', 34, false, NULL, '2026-04-19 10:10:33.591765+12', 'Waitemata') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1469, 'Titirangi', 34, false, NULL, '2026-04-19 10:10:33.594725+12', 'Waitemata') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1467, 'West Harbour', 34, false, NULL, '2026-04-19 10:10:33.597431+12', 'Waitemata') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1420, 'Auckland City', 35, false, NULL, '2026-04-19 10:10:33.600679+12', 'Auckland') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1460, 'Avondale', 35, false, NULL, '2026-04-19 10:10:33.602568+12', 'Auckland') ON CONFLICT DO NOTHING;
INSERT INTO public.stations (id, name, area_id, is_specialist, specialist_type, created_at, district) VALUES (1461, 'Balmoral', 35, false, NULL, '2026-04-19 10:10:33.604526+12', 'Auckland') ON CONFLICT DO NOTHING;


--
-- Data for Name: firefighters; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (534, 'Nina', 'Kowalski', 'nina.kowalski@fenz.slack.com', 1465, 'Green', 'FF', 4, 2, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.693672+12', '2026-04-19 10:10:33.693672+12', true, true, 2, 1, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (535, 'Rangi', 'Tuhoe', 'rangi.tuhoe@fenz.slack.com', 1426, 'Green', 'QFF', 6, 3, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.695532+12', '2026-04-19 10:10:33.695532+12', true, true, 4, 2, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (536, 'David', 'Wu', 'david.wu@fenz.slack.com', 1426, 'Green', 'SFF', 3, 1, true, '{"type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.697263+12', '2026-04-19 10:10:33.697263+12', true, true, 1, 1, 2, 0) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (538, 'Ben', 'Tafua', 'ben.tafua@fenz.slack.com', 1432, 'Green', 'FF', 7, 3, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.700659+12', '2026-04-19 10:10:33.700659+12', true, true, 4, 2, 3, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (539, 'Jade', 'Renata', 'jade.renata@fenz.slack.com', 1435, 'Green', 'QFF', 2, 1, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.702331+12', '2026-04-19 10:10:33.702331+12', true, true, 1, 0, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (540, 'Sam', 'Kapoor', 'sam.kapoor@fenz.slack.com', 1433, 'Green', 'SO', 5, 2, true, '{"type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.703867+12', '2026-04-19 10:10:33.703867+12', true, true, 3, 1, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (541, 'Liam', 'OBrien', 'liam.obrien@fenz.slack.com', 1420, 'Red', 'FF', 4, 2, true, '{"CBR": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.705432+12', '2026-04-19 10:10:33.705432+12', true, true, 2, 1, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (542, 'Aroha', 'Te Rangi', 'aroha.te rangi@fenz.slack.com', 1426, 'Red', 'QFF', 6, 3, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.706892+12', '2026-04-19 10:10:33.706892+12', true, true, 4, 2, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (532, 'Emma', 'Chen', 'emma.chen@fenz.slack.com', 1485, 'Green', 'SO', 3, 1, true, '{"prt": true, "type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.68757+12', '2026-04-19 10:10:33.68757+12', true, true, 1, 0, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (529, 'Wiremu', 'Hemara', 'wiremu.hemara@fenz.slack.com', 1485, 'Green', 'FF', 6, 2, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.6805+12', '2026-04-19 10:10:33.6805+12', true, true, 3, 1, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (530, 'Sarah', 'Mitchell', 'sarah.mitchell@fenz.slack.com', 1481, 'Green', 'QFF', 4, 1, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.681971+12', '2026-04-19 10:10:33.681971+12', true, true, 1, 0, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (533, 'Jordan', 'Park', 'jordan.park@fenz.slack.com', 1490, 'Green', 'FF', 2, 0, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.6894+12', '2026-04-19 10:10:33.6894+12', true, true, 0, 0, 1, 0) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (537, 'Lisa', 'Campbell', 'lisa.campbell@fenz.slack.com', 1466, 'Green', 'SSO', 2, 0, true, '{"prt": true, "type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.698803+12', '2026-04-19 10:10:33.698803+12', true, true, 0, 0, 1, 0) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (531, 'Tane', 'Rawiri', 'tane.rawiri@fenz.slack.com', 1483, 'Green', 'SFF', 9, 4, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.683761+12', '2026-04-19 10:10:33.683761+12', true, true, 5, 3, 3, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (543, 'Marcus', 'Williams', 'marcus.williams@fenz.slack.com', 1426, 'Red', 'FF', 2, 1, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.708314+12', '2026-04-19 10:10:33.708314+12', true, true, 1, 0, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (544, 'Hemi', 'Ngata', 'hemi.ngata@fenz.slack.com', 1424, 'Red', 'SFF', 7, 3, true, '{"type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.709841+12', '2026-04-19 10:10:33.709841+12', true, true, 5, 2, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (545, 'Priya', 'Sharma', 'priya.sharma@fenz.slack.com', 1420, 'Red', 'SO', 1, 0, true, '{"CBR": true, "prt": true, "type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.711533+12', '2026-04-19 10:10:33.711533+12', true, true, 0, 0, 1, 0) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (546, 'Jake', 'Morrison', 'jake.morrison@fenz.slack.com', 1480, 'Red', 'FF', 3, 1, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.71303+12', '2026-04-19 10:10:33.71303+12', true, true, 2, 0, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (547, 'Maia', 'Henare', 'maia.henare@fenz.slack.com', 1482, 'Red', 'QFF', 5, 2, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.714399+12', '2026-04-19 10:10:33.714399+12', true, true, 3, 1, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (548, 'Chris', 'Evans', 'chris.evans@fenz.slack.com', 1485, 'Red', 'SFF', 8, 4, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.715997+12', '2026-04-19 10:10:33.715997+12', true, true, 6, 3, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (549, 'Mereana', 'Kahu', 'mereana.kahu@fenz.slack.com', 1490, 'Red', 'SO', 2, 0, true, '{"prt": true, "type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.717559+12', '2026-04-19 10:10:33.717559+12', true, true, 1, 0, 1, 0) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (550, 'Tyler', 'Patel', 'tyler.patel@fenz.slack.com', 1430, 'Red', 'FF', 4, 2, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.719068+12', '2026-04-19 10:10:33.719068+12', true, true, 2, 1, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (551, 'Anika', 'Singh', 'anika.singh@fenz.slack.com', 1438, 'Red', 'QFF', 3, 1, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.720435+12', '2026-04-19 10:10:33.720435+12', true, true, 2, 0, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (552, 'Rawiri', 'Tamati', 'rawiri.tamati@fenz.slack.com', 1432, 'Red', 'SSO', 1, 0, true, '{"type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.721848+12', '2026-04-19 10:10:33.721848+12', true, true, 0, 0, 1, 0) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (553, 'Kahu', 'Makiha', 'kahu.makiha@fenz.slack.com', 1465, 'Brown', 'FF', 3, 2, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.723275+12', '2026-04-19 10:10:33.723275+12', true, true, 2, 1, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (554, 'Rebecca', 'Taylor', 'rebecca.taylor@fenz.slack.com', 1464, 'Brown', 'QFF', 5, 2, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.724738+12', '2026-04-19 10:10:33.724738+12', true, true, 3, 1, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (555, 'Luke', 'Tanner', 'luke.tanner@fenz.slack.com', 1481, 'Brown', 'FF', 4, 2, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.726275+12', '2026-04-19 10:10:33.726275+12', true, true, 2, 1, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (556, 'Hinewai', 'Ruru', 'hinewai.ruru@fenz.slack.com', 1480, 'Brown', 'QFF', 6, 3, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.727887+12', '2026-04-19 10:10:33.727887+12', true, true, 4, 2, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (557, 'Dan', 'Reid', 'dan.reid@fenz.slack.com', 1460, 'Brown', 'FF', 2, 1, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.729407+12', '2026-04-19 10:10:33.729407+12', true, true, 1, 0, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (558, 'Nikau', 'Tangaroa', 'nikau.tangaroa@fenz.slack.com', 1426, 'Brown', 'SFF', 9, 5, true, '{"type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.730978+12', '2026-04-19 10:10:33.730978+12', true, true, 7, 4, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (559, 'Grace', 'Whittaker', 'grace.whittaker@fenz.slack.com', 1461, 'Brown', 'SSO', 0, 0, true, '{"prt": true, "type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.732428+12', '2026-04-19 10:10:33.732428+12', true, true, 0, 0, 0, 0) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (560, 'Pete', 'Douglas', 'pete.douglas@fenz.slack.com', 1427, 'Brown', 'SFF', 3, 1, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.734088+12', '2026-04-19 10:10:33.734088+12', true, true, 2, 0, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (561, 'Whina', 'Cooper', 'whina.cooper@fenz.slack.com', 1490, 'Brown', 'SO', 1, 0, true, '{"prt": true, "type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.735664+12', '2026-04-19 10:10:33.735664+12', true, true, 0, 0, 1, 0) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (562, 'Matt', 'Young', 'matt.young@fenz.slack.com', 1432, 'Brown', 'FF', 7, 3, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.73727+12', '2026-04-19 10:10:33.73727+12', true, true, 5, 2, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (563, 'Aria', 'Matene', 'aria.matene@fenz.slack.com', 1435, 'Brown', 'QFF', 2, 1, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.738955+12', '2026-04-19 10:10:33.738955+12', true, true, 1, 0, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (564, 'Ross', 'McIntyre', 'ross.mcintyre@fenz.slack.com', 1430, 'Brown', 'SO', 5, 2, true, '{"type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.740853+12', '2026-04-19 10:10:33.740853+12', true, true, 3, 1, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (565, 'Tommy', 'Ahu', 'tommy.ahu@fenz.slack.com', 1432, 'Blue', 'FF', 6, 3, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.743056+12', '2026-04-19 10:10:33.743056+12', true, true, 4, 2, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (566, 'Fiona', 'Cameron', 'fiona.cameron@fenz.slack.com', 1432, 'Blue', 'QFF', 4, 2, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.744847+12', '2026-04-19 10:10:33.744847+12', true, true, 2, 1, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (567, 'Sam', 'Tong', 'sam.tong@fenz.slack.com', 1430, 'Blue', 'SFF', 7, 4, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.746463+12', '2026-04-19 10:10:33.746463+12', true, true, 5, 3, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (568, 'Mere', 'Whare', 'mere.whare@fenz.slack.com', 1435, 'Blue', 'FF', 1, 0, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.748041+12', '2026-04-19 10:10:33.748041+12', true, true, 0, 0, 1, 0) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (569, 'Alex', 'Brown', 'alex.brown@fenz.slack.com', 1433, 'Blue', 'SO', 3, 1, true, '{"type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.749516+12', '2026-04-19 10:10:33.749516+12', true, true, 2, 0, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (574, 'Oliver', 'Hunt', 'oliver.hunt@fenz.slack.com', 1426, 'Blue', 'FF', 6, 3, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.75772+12', '2026-04-19 10:10:33.75772+12', true, true, 4, 2, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (576, 'Gary', 'Chen', 'gary.chen@fenz.slack.com', 1424, 'Blue', 'SSO', 1, 0, true, '{"prt": true, "type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.761679+12', '2026-04-19 10:10:33.761679+12', true, true, 0, 0, 1, 0) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (570, 'Zoe', 'Fletcher', 'zoe.fletcher@fenz.slack.com', 1485, 'Blue', 'FF', 3, 1, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.750904+12', '2026-04-19 10:10:33.750904+12', true, true, 1, 0, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (571, 'Tipene', 'Rata', 'tipene.rata@fenz.slack.com', 1481, 'Blue', 'QFF', 6, 2, true, '{"driver": true, "not_rookie": true}', '2026-04-19 10:10:33.752677+12', '2026-04-19 10:10:33.752677+12', true, true, 3, 1, 2, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (572, 'Kate', 'Sullivan', 'kate.sullivan@fenz.slack.com', 1490, 'Blue', 'SFF', 4, 1, true, '{"prt": true, "type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.754333+12', '2026-04-19 10:10:33.754333+12', true, true, 2, 0, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (573, 'Rongo', 'Parata', 'rongo.parata@fenz.slack.com', 1480, 'Blue', 'SO', 5, 2, true, '{"type4": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.75603+12', '2026-04-19 10:10:33.75603+12', true, true, 3, 1, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO public.firefighters (id, first_name, last_name, email, station_id, watch, rank, ot_count_days, ot_count_nights, is_active, qualifications, created_at, updated_at, want_to_work_day, want_to_work_night, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights) VALUES (575, 'Marama', 'Te Awa', 'marama.te awa@fenz.slack.com', 1465, 'Blue', 'QFF', 3, 0, true, '{"prt": true, "driver": true, "not_rookie": true}', '2026-04-19 10:10:33.760023+12', '2026-04-19 10:10:33.760023+12', true, true, 1, 0, 1, 0) ON CONFLICT DO NOTHING;


--
-- Data for Name: station_distances; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.station_distances (station_id, district, distances) VALUES (1481, NULL, '{"Otara": 32, "Albany": 14, "Howick": 31, "Mangere": 37, "Otahuhu": 28, "Parnell": 16, "Remuera": 18, "Avondale": 21, "Balmoral": 19, "Manurewa": 38, "Onehunga": 22, "Papakura": 42, "Takapuna": 15, "Te Atatu": 24, "Ellerslie": 20, "Glen Eden": 27, "Grey Lynn": 14, "Henderson": 28, "Titirangi": 28, "Birkenhead": 10, "Papatoetoe": 34, "Silverdale": 30, "St Heliers": 25, "West Harbour": 25, "Auckland City": 13, "Mount Roskill": 25, "East Coast Bays": 17, "Mount Wellington": 23}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1485, NULL, '{"Otara": 36, "Howick": 35, "Mangere": 41, "Otahuhu": 31, "Parnell": 20, "Remuera": 22, "Avondale": 26, "Balmoral": 23, "Manurewa": 42, "Onehunga": 26, "Papakura": 46, "Takapuna": 5, "Te Atatu": 18, "Devonport": 14, "Ellerslie": 24, "Glen Eden": 24, "Grey Lynn": 18, "Henderson": 19, "Titirangi": 28, "Birkenhead": 8, "Papatoetoe": 38, "Silverdale": 21, "St Heliers": 29, "West Harbour": 12, "Auckland City": 17, "Mount Roskill": 29, "East Coast Bays": 7, "Mount Wellington": 27}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1482, NULL, '{"Otara": 28, "Albany": 8, "Howick": 27, "Mangere": 34, "Otahuhu": 24, "Parnell": 13, "Remuera": 14, "Avondale": 18, "Balmoral": 16, "Manurewa": 34, "Onehunga": 18, "Papakura": 39, "Takapuna": 5, "Te Atatu": 20, "Devonport": 10, "Ellerslie": 17, "Glen Eden": 23, "Grey Lynn": 10, "Henderson": 24, "Titirangi": 24, "Papatoetoe": 30, "Silverdale": 28, "St Heliers": 21, "West Harbour": 19, "Auckland City": 10, "Mount Roskill": 22, "East Coast Bays": 15, "Mount Wellington": 20}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1483, NULL, '{"Otara": 39, "Albany": 7, "Howick": 38, "Mangere": 44, "Otahuhu": 34, "Parnell": 23, "Remuera": 25, "Avondale": 28, "Balmoral": 26, "Manurewa": 45, "Onehunga": 29, "Papakura": 49, "Takapuna": 9, "Te Atatu": 25, "Devonport": 17, "Ellerslie": 27, "Glen Eden": 31, "Grey Lynn": 21, "Henderson": 26, "Titirangi": 35, "Birkenhead": 15, "Papatoetoe": 41, "Silverdale": 14, "St Heliers": 32, "West Harbour": 19, "Auckland City": 20, "Mount Roskill": 32, "Mount Wellington": 30}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1464, NULL, '{"Otara": 34, "Albany": 24, "Howick": 26, "Mangere": 22, "Otahuhu": 22, "Parnell": 17, "Remuera": 19, "Avondale": 6, "Balmoral": 11, "Manurewa": 31, "Onehunga": 15, "Papakura": 36, "Takapuna": 26, "Te Atatu": 6, "Devonport": 27, "Ellerslie": 17, "Grey Lynn": 12, "Henderson": 4, "Titirangi": 4, "Birkenhead": 23, "Papatoetoe": 27, "Silverdale": 44, "St Heliers": 26, "West Harbour": 12, "Auckland City": 15, "Mount Roskill": 10, "East Coast Bays": 31, "Mount Wellington": 20}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1465, NULL, '{"Otara": 33, "Albany": 19, "Howick": 32, "Mangere": 28, "Otahuhu": 29, "Parnell": 18, "Remuera": 19, "Avondale": 8, "Balmoral": 15, "Manurewa": 38, "Onehunga": 22, "Papakura": 42, "Takapuna": 24, "Te Atatu": 3, "Devonport": 28, "Ellerslie": 22, "Glen Eden": 4, "Grey Lynn": 13, "Titirangi": 8, "Birkenhead": 24, "Papatoetoe": 33, "Silverdale": 40, "St Heliers": 26, "West Harbour": 8, "Auckland City": 15, "Mount Roskill": 16, "East Coast Bays": 26, "Mount Wellington": 25}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1490, NULL, '{"Otara": 52, "Albany": 21, "Howick": 51, "Mangere": 57, "Otahuhu": 48, "Parnell": 36, "Remuera": 38, "Avondale": 41, "Balmoral": 39, "Manurewa": 58, "Onehunga": 42, "Papakura": 62, "Takapuna": 22, "Te Atatu": 38, "Devonport": 30, "Ellerslie": 40, "Glen Eden": 44, "Grey Lynn": 34, "Henderson": 40, "Titirangi": 48, "Birkenhead": 28, "Papatoetoe": 54, "St Heliers": 45, "West Harbour": 32, "Auckland City": 33, "Mount Roskill": 45, "East Coast Bays": 14, "Mount Wellington": 43}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1480, NULL, '{"Otara": 31, "Albany": 5, "Howick": 30, "Mangere": 36, "Otahuhu": 27, "Parnell": 15, "Remuera": 17, "Avondale": 20, "Balmoral": 18, "Manurewa": 37, "Onehunga": 21, "Papakura": 41, "Te Atatu": 22, "Devonport": 15, "Ellerslie": 19, "Glen Eden": 26, "Grey Lynn": 13, "Henderson": 24, "Titirangi": 27, "Birkenhead": 5, "Papatoetoe": 33, "Silverdale": 22, "St Heliers": 24, "West Harbour": 16, "Auckland City": 12, "Mount Roskill": 24, "East Coast Bays": 9, "Mount Wellington": 22}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1466, NULL, '{"Otara": 30, "Albany": 18, "Howick": 29, "Mangere": 25, "Otahuhu": 26, "Parnell": 14, "Remuera": 16, "Avondale": 9, "Balmoral": 12, "Manurewa": 34, "Onehunga": 18, "Papakura": 39, "Takapuna": 22, "Devonport": 24, "Ellerslie": 18, "Glen Eden": 6, "Grey Lynn": 10, "Henderson": 3, "Titirangi": 10, "Birkenhead": 20, "Papatoetoe": 30, "Silverdale": 38, "St Heliers": 23, "West Harbour": 6, "Auckland City": 12, "Mount Roskill": 13, "East Coast Bays": 25, "Mount Wellington": 21}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1469, NULL, '{"Otara": 35, "Albany": 28, "Howick": 28, "Mangere": 23, "Otahuhu": 23, "Parnell": 19, "Remuera": 20, "Avondale": 8, "Balmoral": 12, "Manurewa": 33, "Onehunga": 16, "Papakura": 37, "Takapuna": 27, "Te Atatu": 10, "Devonport": 28, "Ellerslie": 18, "Glen Eden": 4, "Grey Lynn": 14, "Henderson": 8, "Birkenhead": 24, "Papatoetoe": 28, "Silverdale": 48, "St Heliers": 27, "West Harbour": 17, "Auckland City": 16, "Mount Roskill": 10, "East Coast Bays": 35, "Mount Wellington": 21}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1467, NULL, '{"Otara": 36, "Albany": 12, "Howick": 35, "Mangere": 31, "Otahuhu": 32, "Parnell": 21, "Remuera": 22, "Avondale": 15, "Balmoral": 18, "Manurewa": 41, "Onehunga": 24, "Papakura": 45, "Takapuna": 16, "Te Atatu": 6, "Devonport": 25, "Ellerslie": 24, "Glen Eden": 12, "Grey Lynn": 16, "Henderson": 8, "Titirangi": 17, "Birkenhead": 19, "Papatoetoe": 36, "Silverdale": 32, "St Heliers": 29, "Auckland City": 18, "Mount Roskill": 19, "East Coast Bays": 19, "Mount Wellington": 27}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1420, NULL, '{"Otara": 19, "Albany": 17, "Howick": 18, "Mangere": 25, "Otahuhu": 15, "Parnell": 3, "Remuera": 5, "Avondale": 9, "Balmoral": 4, "Manurewa": 25, "Onehunga": 9, "Papakura": 29, "Takapuna": 12, "Te Atatu": 12, "Devonport": 13, "Ellerslie": 7, "Glen Eden": 14, "Grey Lynn": 2, "Henderson": 15, "Titirangi": 16, "Birkenhead": 9, "Papatoetoe": 21, "Silverdale": 33, "St Heliers": 12, "West Harbour": 19, "Mount Roskill": 13, "East Coast Bays": 20, "Mount Wellington": 10}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1460, NULL, '{"Otara": 28, "Albany": 26, "Howick": 22, "Mangere": 17, "Otahuhu": 17, "Parnell": 12, "Remuera": 14, "Balmoral": 5, "Manurewa": 27, "Onehunga": 11, "Papakura": 31, "Takapuna": 21, "Te Atatu": 8, "Devonport": 22, "Ellerslie": 16, "Glen Eden": 6, "Grey Lynn": 6, "Henderson": 8, "Titirangi": 7, "Birkenhead": 18, "Papatoetoe": 22, "Silverdale": 42, "St Heliers": 21, "West Harbour": 15, "Auckland City": 10, "Mount Roskill": 5, "East Coast Bays": 29, "Mount Wellington": 16}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1461, NULL, '{"Otara": 19, "Albany": 21, "Howick": 18, "Mangere": 16, "Otahuhu": 14, "Parnell": 7, "Remuera": 5, "Avondale": 5, "Manurewa": 25, "Onehunga": 6, "Papakura": 30, "Takapuna": 16, "Te Atatu": 11, "Devonport": 17, "Ellerslie": 6, "Glen Eden": 11, "Grey Lynn": 4, "Henderson": 14, "Titirangi": 12, "Birkenhead": 13, "Papatoetoe": 21, "Silverdale": 37, "St Heliers": 12, "West Harbour": 17, "Auckland City": 4, "Mount Roskill": 4, "East Coast Bays": 24, "Mount Wellington": 10}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1427, NULL, '{"Otara": 12, "Albany": 24, "Howick": 11, "Mangere": 13, "Otahuhu": 8, "Parnell": 9, "Remuera": 3, "Avondale": 14, "Balmoral": 6, "Manurewa": 18, "Onehunga": 4, "Papakura": 23, "Takapuna": 19, "Te Atatu": 17, "Devonport": 20, "Glen Eden": 17, "Grey Lynn": 9, "Henderson": 21, "Titirangi": 18, "Birkenhead": 16, "Papatoetoe": 14, "Silverdale": 40, "St Heliers": 7, "West Harbour": 24, "Auckland City": 7, "Mount Roskill": 8, "East Coast Bays": 27, "Mount Wellington": 4}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1426, NULL, '{"Otara": 21, "Albany": 18, "Howick": 19, "Mangere": 22, "Otahuhu": 16, "Parnell": 7, "Remuera": 7, "Avondale": 6, "Balmoral": 4, "Manurewa": 26, "Onehunga": 9, "Papakura": 31, "Takapuna": 13, "Te Atatu": 9, "Devonport": 14, "Ellerslie": 9, "Glen Eden": 11, "Henderson": 13, "Titirangi": 13, "Birkenhead": 10, "Papatoetoe": 22, "Silverdale": 34, "St Heliers": 14, "West Harbour": 16, "Auckland City": 2, "Mount Roskill": 10, "East Coast Bays": 21, "Mount Wellington": 12}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1462, NULL, '{"Otara": 26, "Albany": 29, "Howick": 18, "Mangere": 13, "Otahuhu": 13, "Parnell": 15, "Remuera": 9, "Avondale": 5, "Balmoral": 4, "Manurewa": 23, "Onehunga": 7, "Papakura": 27, "Takapuna": 24, "Te Atatu": 12, "Devonport": 25, "Ellerslie": 8, "Glen Eden": 10, "Grey Lynn": 10, "Henderson": 16, "Titirangi": 10, "Birkenhead": 21, "Papatoetoe": 18, "Silverdale": 45, "St Heliers": 15, "West Harbour": 19, "Auckland City": 7, "East Coast Bays": 32, "Mount Wellington": 12}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1423, NULL, '{"Otara": 10, "Albany": 27, "Howick": 8, "Mangere": 12, "Otahuhu": 4, "Parnell": 12, "Remuera": 7, "Avondale": 18, "Balmoral": 10, "Manurewa": 16, "Onehunga": 6, "Papakura": 20, "Takapuna": 22, "Te Atatu": 21, "Devonport": 23, "Ellerslie": 4, "Glen Eden": 23, "Grey Lynn": 12, "Henderson": 24, "Titirangi": 22, "Birkenhead": 19, "Papatoetoe": 12, "Silverdale": 44, "St Heliers": 7, "West Harbour": 28, "Auckland City": 11, "Mount Roskill": 12, "East Coast Bays": 30}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1422, NULL, '{"Otara": 16, "Albany": 25, "Howick": 13, "Mangere": 10, "Otahuhu": 7, "Parnell": 10, "Remuera": 5, "Avondale": 9, "Balmoral": 6, "Manurewa": 20, "Papakura": 24, "Takapuna": 20, "Te Atatu": 16, "Devonport": 22, "Ellerslie": 3, "Glen Eden": 14, "Grey Lynn": 9, "Henderson": 20, "Titirangi": 15, "Birkenhead": 18, "Papatoetoe": 15, "Silverdale": 42, "St Heliers": 10, "West Harbour": 23, "Auckland City": 9, "Mount Roskill": 5, "East Coast Bays": 29, "Mount Wellington": 6}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1425, NULL, '{"Otara": 20, "Albany": 20, "Howick": 19, "Mangere": 20, "Otahuhu": 16, "Remuera": 5, "Avondale": 11, "Balmoral": 6, "Manurewa": 26, "Onehunga": 10, "Papakura": 31, "Takapuna": 15, "Te Atatu": 14, "Devonport": 16, "Ellerslie": 9, "Glen Eden": 16, "Grey Lynn": 6, "Henderson": 17, "Titirangi": 18, "Birkenhead": 12, "Papatoetoe": 22, "Silverdale": 37, "St Heliers": 8, "West Harbour": 21, "Auckland City": 3, "Mount Roskill": 15, "East Coast Bays": 23, "Mount Wellington": 12}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1421, NULL, '{"Otara": 15, "Albany": 22, "Howick": 14, "Mangere": 16, "Otahuhu": 11, "Parnell": 5, "Avondale": 13, "Balmoral": 5, "Manurewa": 21, "Onehunga": 5, "Papakura": 25, "Takapuna": 17, "Te Atatu": 15, "Devonport": 18, "Ellerslie": 3, "Glen Eden": 18, "Grey Lynn": 7, "Henderson": 19, "Titirangi": 19, "Birkenhead": 14, "Papatoetoe": 17, "Silverdale": 38, "St Heliers": 7, "West Harbour": 22, "Auckland City": 5, "Mount Roskill": 9, "East Coast Bays": 25, "Mount Wellington": 6}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1424, NULL, '{"Otara": 13, "Albany": 29, "Howick": 11, "Mangere": 18, "Otahuhu": 10, "Parnell": 8, "Remuera": 7, "Avondale": 20, "Balmoral": 12, "Manurewa": 22, "Onehunga": 10, "Papakura": 26, "Takapuna": 24, "Te Atatu": 22, "Devonport": 25, "Ellerslie": 7, "Glen Eden": 25, "Grey Lynn": 14, "Henderson": 26, "Titirangi": 26, "Birkenhead": 21, "Papatoetoe": 18, "Silverdale": 45, "West Harbour": 29, "Auckland City": 12, "Mount Roskill": 15, "East Coast Bays": 32, "Mount Wellington": 7}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1432, NULL, '{"Otara": 8, "Albany": 35, "Mangere": 22, "Otahuhu": 10, "Parnell": 20, "Remuera": 14, "Avondale": 26, "Balmoral": 18, "Manurewa": 16, "Onehunga": 13, "Papakura": 21, "Takapuna": 30, "Te Atatu": 29, "Devonport": 31, "Ellerslie": 12, "Glen Eden": 31, "Grey Lynn": 20, "Henderson": 32, "Titirangi": 29, "Birkenhead": 27, "Papatoetoe": 13, "Silverdale": 51, "St Heliers": 12, "West Harbour": 35, "Auckland City": 18, "Mount Roskill": 19, "East Coast Bays": 38, "Mount Wellington": 8}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1435, NULL, '{"Otara": 18, "Albany": 40, "Howick": 21, "Otahuhu": 10, "Parnell": 18, "Remuera": 15, "Avondale": 16, "Balmoral": 14, "Manurewa": 16, "Onehunga": 10, "Papakura": 20, "Takapuna": 29, "Te Atatu": 23, "Devonport": 30, "Ellerslie": 13, "Glen Eden": 20, "Grey Lynn": 21, "Henderson": 26, "Titirangi": 22, "Birkenhead": 26, "Papatoetoe": 11, "Silverdale": 50, "St Heliers": 20, "West Harbour": 30, "Auckland City": 18, "Mount Roskill": 12, "East Coast Bays": 37, "Mount Wellington": 14}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1430, NULL, '{"Otara": 11, "Albany": 41, "Howick": 16, "Mangere": 14, "Otahuhu": 13, "Parnell": 26, "Remuera": 21, "Avondale": 27, "Balmoral": 25, "Onehunga": 20, "Papakura": 5, "Takapuna": 36, "Te Atatu": 34, "Devonport": 38, "Ellerslie": 18, "Glen Eden": 31, "Grey Lynn": 26, "Henderson": 37, "Titirangi": 32, "Birkenhead": 34, "Papatoetoe": 7, "Silverdale": 58, "St Heliers": 22, "West Harbour": 40, "Auckland City": 25, "Mount Roskill": 23, "East Coast Bays": 44, "Mount Wellington": 16}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1431, NULL, '{"Otara": 7, "Albany": 31, "Howick": 10, "Mangere": 7, "Parnell": 16, "Remuera": 11, "Avondale": 22, "Balmoral": 14, "Manurewa": 13, "Onehunga": 7, "Papakura": 17, "Takapuna": 26, "Te Atatu": 25, "Devonport": 27, "Ellerslie": 8, "Glen Eden": 22, "Grey Lynn": 16, "Henderson": 28, "Titirangi": 24, "Birkenhead": 23, "Papatoetoe": 9, "Silverdale": 47, "St Heliers": 12, "West Harbour": 32, "Auckland City": 15, "Mount Roskill": 14, "East Coast Bays": 34, "Mount Wellington": 5}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1433, NULL, '{"Albany": 36, "Howick": 8, "Mangere": 16, "Otahuhu": 7, "Parnell": 21, "Remuera": 15, "Avondale": 27, "Balmoral": 19, "Manurewa": 11, "Onehunga": 16, "Papakura": 15, "Takapuna": 31, "Te Atatu": 29, "Devonport": 32, "Ellerslie": 13, "Glen Eden": 34, "Grey Lynn": 21, "Henderson": 33, "Titirangi": 35, "Birkenhead": 28, "Papatoetoe": 5, "Silverdale": 52, "St Heliers": 14, "West Harbour": 36, "Auckland City": 19, "Mount Roskill": 25, "East Coast Bays": 39, "Mount Wellington": 10}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1434, NULL, '{"Otara": 5, "Albany": 38, "Howick": 13, "Mangere": 10, "Otahuhu": 9, "Parnell": 22, "Remuera": 17, "Avondale": 23, "Balmoral": 21, "Manurewa": 7, "Onehunga": 16, "Papakura": 11, "Takapuna": 33, "Te Atatu": 30, "Devonport": 34, "Ellerslie": 14, "Glen Eden": 27, "Grey Lynn": 23, "Henderson": 33, "Titirangi": 28, "Birkenhead": 30, "Silverdale": 54, "St Heliers": 18, "West Harbour": 36, "Auckland City": 21, "Mount Roskill": 19, "East Coast Bays": 41, "Mount Wellington": 12}') ON CONFLICT DO NOTHING;
INSERT INTO public.station_distances (station_id, district, distances) VALUES (1438, NULL, '{"Otara": 16, "Albany": 46, "Howick": 22, "Mangere": 18, "Otahuhu": 17, "Parnell": 31, "Remuera": 26, "Avondale": 31, "Balmoral": 30, "Manurewa": 5, "Onehunga": 25, "Takapuna": 41, "Te Atatu": 38, "Devonport": 42, "Ellerslie": 23, "Glen Eden": 36, "Grey Lynn": 31, "Henderson": 42, "Titirangi": 37, "Birkenhead": 38, "Papatoetoe": 11, "Silverdale": 62, "St Heliers": 27, "West Harbour": 45, "Auckland City": 30, "Mount Roskill": 27, "East Coast Bays": 49, "Mount Wellington": 20}') ON CONFLICT DO NOTHING;


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.system_settings (id, key, value, description, updated_at) VALUES (67, 'ot_offer_mode', '"mandatory"', 'mandatory or accept_decline', '2026-04-19 10:10:33.763184+12') ON CONFLICT DO NOTHING;
INSERT INTO public.system_settings (id, key, value, description, updated_at) VALUES (68, 'relievers_enabled', 'true', 'Whether to auto-deploy district relievers', '2026-04-19 10:10:33.763184+12') ON CONFLICT DO NOTHING;
INSERT INTO public.system_settings (id, key, value, description, updated_at) VALUES (69, 'non_callback_approach', '"single_pool"', 'single_pool or watch_tiered', '2026-04-19 10:10:33.763184+12') ON CONFLICT DO NOTHING;
INSERT INTO public.system_settings (id, key, value, description, updated_at) VALUES (70, 'max_continuous_hours', '24', 'Maximum continuous work hours', '2026-04-19 10:10:33.763184+12') ON CONFLICT DO NOTHING;
INSERT INTO public.system_settings (id, key, value, description, updated_at) VALUES (71, 'min_rest_hours', '8', 'Minimum rest between shifts', '2026-04-19 10:10:33.763184+12') ON CONFLICT DO NOTHING;
INSERT INTO public.system_settings (id, key, value, description, updated_at) VALUES (72, 'max_hours_before_mandatory_rest', '67', 'Hours before mandatory 2 days off', '2026-04-19 10:10:33.763184+12') ON CONFLICT DO NOTHING;


--
-- Data for Name: watch_anchors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.watch_anchors (id, watch, anchor_date, note) VALUES (56, 'Green', '2026-01-31', 'Saturday anchor') ON CONFLICT DO NOTHING;
INSERT INTO public.watch_anchors (id, watch, anchor_date, note) VALUES (57, 'Red', '2026-02-02', 'Monday anchor') ON CONFLICT DO NOTHING;
INSERT INTO public.watch_anchors (id, watch, anchor_date, note) VALUES (58, 'Brown', '2026-02-04', 'Wednesday anchor') ON CONFLICT DO NOTHING;
INSERT INTO public.watch_anchors (id, watch, anchor_date, note) VALUES (59, 'Blue', '2026-02-06', 'Friday anchor') ON CONFLICT DO NOTHING;
INSERT INTO public.watch_anchors (id, watch, anchor_date, note) VALUES (60, 'Yellow', '2026-02-01', 'Mon-Fri only, placeholder anchor') ON CONFLICT DO NOTHING;


--
-- Name: areas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.areas_id_seq', 36, true);


--
-- Name: firefighters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.firefighters_id_seq', 576, true);


--
-- Name: stations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stations_id_seq', 2000, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 72, true);


--
-- Name: watch_anchors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.watch_anchors_id_seq', 60, true);


--
-- PostgreSQL database dump complete
--

\unrestrict P6jKgMz8WjzY6VAcsWteQHRzTpiUCdgv16PiINtSaiQ9pt6vLYWJCHIusd7YdqU


```

## File: AGENTS.md
```md
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

```

## File: ALGORITHM.md
```md
# FENZ OT Allocation Engine — Algorithm Design v2

> **Status:** Draft for Adam's review  
> **Date:** 2026-04-20  
> **Goal:** Single-pass allocation with OOD boundary re-rank, before implementing

---

## 1. Problem with the Current 8-Block Cascade

The existing engine processes blocks 1–8 **sequentially**, each independently assigning candidates to their nearest available slot. This creates two failure modes:

### Failure Mode A: Callback Monopoly
```
Albany has 2 slots, Takapuna (0 km away) has callback FF available.
Block 1 (ff-callback, in-district): Takapuna FF → Albany ✓ (slot 1 filled)
                                    But Albany also had a non-callback FF from Devonport (4 km) in the same block.
                                    Devonport FF gets slot 2 in block 1.

Problem: Albany also needs to fill Henderson OT. The Henderson OT slot could have been filled by
Devonport FF. But Devonport FF is now assigned to Albany, so Henderson gets nothing from this run.
```

### Failure Mode B: OOD Starvation (Adam's Key Example)
```
Scenario: Albany OT + Henderson OT

Non-callback pass (Block 2):
  - FF-A from Takapuna (0 km from Albany) → assigned Albany
  - FF-B from East Coast Bays (3 km from Henderson) → assigned Henderson

OOD pass (Block 4):
  - OOD FF-C from Auckland district (2 km from Henderson) is available.
  - But Henderson's slot was already taken by FF-B in Block 2.
  - FF-C gets nothing.

Adam's rule: When we reach OOD (Block 4), we should KNOW that Henderson still needs a slot,
re-evaluate whether any earlier-phase candidate (Block 2) is closer to that slot than the
person currently assigned there, and RE-RANK accordingly.

Result: FF-C (2 km) should displace FF-B (3 km) at Henderson. FF-B then becomes available
for another station or stays unassigned.
```

**Root cause:** Blocks are isolated passes. Block 4 has no visibility into Block 2's assignments.

---

## 2. The New Approach: Pre-Computed, Single-Pass with Re-Rank Checkpoints

### Core Principles
1. **Know your pool first.** Before assigning anyone, compute the full eligible pool for all OT requests — count by phase category, check distances, filter by watch eligibility.
2. **Sort globally once.** All candidates are sorted by priority score (phase priority + OT count tiebreaker), then processed in order.
3. **Re-rank at group boundaries.** When moving from one phase group to the next (e.g., non-callback → OOD), run a re-rank check: for any slot still unfilled, is there a candidate from the previous group who would be displaced by a candidate in the current group? If yes, promote the closer one.
4. **One assignment per candidate.** A candidate can only be assigned once. When displaced, they return to the pool for reassignment.
5. **Specialist exception.** Secondary pass — if specialist slots (PRT, TYPE4, HA) are unfilled after primary pass, steal closest qualified FF from non-specialist stations that have spare capacity.

---

## 3. Candidate Classification (Pre-Compute Phase)

Before any assignment, bucket all FFs into priority groups:

### Group 0: In-District, Callback (Priority 0)
- `inDistrict(ff, station)` AND `isCallback(ff, date)`
- Ranks: FF only (no officers in callback for their home district)

### Group 1: In-District, Non-Callback (Priority 1)
- `inDistrict(ff, station)` AND `!isCallback(ff, date)`
- Ranks: FF, SO, SSO (any rank eligible)

### Group 2: Out-of-District, Callback (Priority 2)
- `!inDistrict(ff, station)` AND `isCallback(ff, date)`
- Ranks: FF only
- **Question for Adam:** Should OOD be district-restricted (e.g., only adjacent districts) or any district?
  - *Current assumption: any district, sorted by distance*

### Group 3: Out-of-District, Non-Callback (Priority 3)
- `!inDistrict(ff, station)` AND `!isCallback(ff, date)`
- Ranks: FF, SO, SSO

### Group 4: SSO Overflow (Priority 4)
- If SSO slots remain after Groups 0–3 exhausted
- All SSO FFs regardless of district/callback (they're officers, they cover gaps)

### Group 5: SSO Any Shift (Priority 5)
- SSO FFs who weren't on duty but can cover any shift
- Final fallback

---

## 4. Pre-Computation Output

```
For each OT request R:
  G0_pool[R] = list of eligible Group 0 FFs, sorted by (distance ASC, otCount ASC)
  G1_pool[R] = list of eligible Group 1 FFs, sorted by (distance ASC, otCount ASC)
  G2_pool[R] = list of eligible Group 2 FFs, sorted by (distance ASC, otCount ASC)
  G3_pool[R] = list of eligible Group 3 FFs, sorted by (distance ASC, otCount ASC)
  
  Phase 0_pre[R] = [FF from G0 whose home_station == R.station_id]  // home-station assignments
```

**Eligibility rules per group:**
- Group 0 (callback): Must be on leave or between nights (callback window active). Excluded if already working regular shift.
- Group 1 (non-callback): Must NOT be on leave. Cannot be in callback. Regular off-duty eligible. Watch eligibility checked.
- Group 2 (OOD callback): Same as Group 0 but any district.
- Group 3 (OOD non-callback): Same as Group 1 but any district.

**Questions for Adam on OOD:**
1. Should OOD FFs only fill districts adjacent to their home district (e.g., Waitemata ↔ Auckland, Auckland ↔ Counties Manukau)?
2. For specialists — if a PRT-qualified FF from Auckland is the closest qualified person to a Waitemata PRT slot, should they fill it? Or should specialists stay in-district first?

---

## 5. Primary Pass Algorithm (Single Sweep)

```
INPUT: List of OT requests R[1..n], each with slots S[R]
OUTPUT: assignments: Map<FF_id, {station, distance, group, phase}>

// Phase 0: Home-station pre-pass (Adam's requirement)
for each R where S[R] > 0:
  home_ffs = G0_pool[R].filter(ff => ff.home_station == R.station_id)  // already in pool
  assign min(home_ffs, S[R])  // assign closest home-station FFs
  S[R] -= assigned_count
  mark assigned FFs as used

// Primary sweep: process groups in priority order
groups = [G0, G1, G2, G3, G4, G5]

for each group G in groups:
  // Step A: Assign group candidates to nearest available slots
  all_candidates = flatten(G across all R, already sorted by distance within R)
  for each candidate C in all_candidates:
    R = C.target_station
    if S[R] > 0 and C.ff not in assignments:
      assign C to R
      S[R] -= 1
      assignments[C.ff] = {station: R, distance: C.distance, group: G.name}

  // Step B: Re-rank checkpoint at group boundary (Adam's key rule)
  // Before moving to next group, re-evaluate: should any current assignment be
  // displaced by a candidate in the NEXT group who's closer?
  if G is not last_group:
    for each R where S[R] > 0:  // unfilled slots
      next_group_candidates = G_next_pool[R]
      for each next_C in next_group_candidates:
        current_assignments_for_R = assignments where station == R
        
        for each current_C in current_assignments_for_R:
          // If next_C is closer AND lower priority (shouldn't happen by sorting),
          // but we need to check: is next_C from a LATER phase group?
          // If next_C is closer AND from a later group, displace current_C
          if next_C.distance < current_C.distance AND next_C.ff not in assignments:
            // Displace: unassign current_C, assign next_C
            unassign current_C from R
            assign next_C to R
            S[R] unchanged
            mark current_C available for reassignment
            mark next_C assigned
            log: "Displaced [current_C.ff] at [R] with [next_C.ff] (OOD re-rank)"
            break  // one displacement per next_C attempt
```

**Key insight on re-rank:** The re-rank check only matters at group boundaries. Within a group, candidates are already sorted by distance — so the closest candidate always wins. The re-rank ensures that when we enter a new (lower-priority) group, we don't permanently lock in assignments made by earlier groups if a lower-priority candidate is objectively closer.

---

## 6. Secondary Pass: Specialist Fill

After primary pass, check each station for specialist slots unfilled:

```
for each R with S[R] > 0 and R.specialist_type not null:
  qualified_pool = all FFs with R.specialist_type qualification
                   AND currently assigned to a NON-specialist station
                   AND have remaining capacity at their current station
  if qualified_pool is empty:
    log: "No qualified specialist for [R.station_name] [R.specialist_type]"
    continue

  // Steal closest qualified FF from a station that has spare capacity
  sorted = qualified_pool sorted by distance to R (ascending)
  for each specialist_C in sorted:
    current_station = assignments[specialist_C.ff].station
    if current_station has unfilled regular slots (capacity > assigned):
      // Steal them
      unassign specialist_C from current_station
      assign specialist_C to R
      S[current_station] += 1  // free up their old slot
      S[R] -= 1
      log: "Specialist [specialist_C.ff] reassigned: [current_station] → [R] (specialist fill)"
      break
```

**Specialist types in DB:** `prt`, `type4`, `ha` (Heavy Appliance)  
**Stations with specialist requirements:** Henderson (PRT), Te Atatu (TYPE4), other stations per `station_vacancies.specialist_type`.

---

## 7. Data Structures

### Firefighter eligibility record (computed once, reused)
```typescript
interface FFEligible {
  ff: Firefighter;
  target_station: OTRequest;
  distance: number;  // from station_distances JSONB
  group: 0 | 1 | 2 | 3 | 4 | 5;
  groupName: 'in-district-callback' | 'in-district-noncallback' | 
             'ood-callback' | 'ood-noncallback' | 'sso-overflow' | 'sso-final';
  isCallback: boolean;
  isInDistrict: boolean;
  watchEligible: boolean;
  qualifications: string[];
  otCount: number;
  homeStationMatch: boolean;  // for Phase 0
}
```

### Assignment record
```typescript
interface FFAssignment {
  ff_id: number;
  station_id: number;
  station_name: string;
  distance: number;
  group: string;
  displacementReason?: string;
  isSpecialistSteal?: boolean;
}
```

---

## 8. QOL / UI Requirements (from Adam's Feedback)

1. **Phase colour coding:**
   - In-district callback → 🔵 Blue (or district colour)
   - In-district non-callback → 🟢 Green
   - OOD callback → 🟠 Orange
   - OOD non-callback → 🟡 Yellow
   - SSO overflow → 🟣 Purple
   - Specialist → ⬜ White with badge

2. **Group borders:** Clear visual separation between phase groups in the assignment display. Each group gets a bordered card/section.

3. **"Must / Might / Won't" indicator:** Based on candidate density vs slots ratio per phase group. "Must" = slots < candidates. "Might" = slots ≈ candidates. "Won't" = slots exhausted.

4. **Per-station breakdown:** Show for each station: assigned FFs, their phase group, distance, why they were chosen.

5. **"Why this person?" tooltip:** On each assignment, explain: "Takapuna FF (0 km, in-district callback, 2nd lowest OT count)."

---

## 9. Database Changes Needed

### station_distances — already JSONB, no change needed ✅

### New view: `v_candidate_pool`
Pre-computed eligible FFs per OT request (materialized or computed at allocation time):
```sql
CREATE VIEW v_candidate_pool AS
SELECT 
  ff.id as ff_id,
  otr.id as request_id,
  otr.station_id,
  sd.distances->otr.station_id::text as distance_km,
  -- classification
  CASE 
    WHEN a.id = s.area_id AND is_callback(ff.watch, otr.date) THEN 'in-district-callback'
    WHEN a.id = s.area_id AND NOT is_callback(ff.watch, otr.date) THEN 'in-district-noncallback'
    WHEN a.id != s.area_id AND is_callback(ff.watch, otr.date) THEN 'ood-callback'
    WHEN a.id != s.area_id AND NOT is_callback(ff.watch, otr.date) THEN 'ood-noncallback'
  END as candidate_group,
  -- qualification check
  otr.specialist_type IS NULL OR ff.qualifications->otr.specialist_type = 'true' as has_quals,
  -- watch eligibility
  watch_eligible(ff.watch, otr.date, otr.shift_type) as watch_ok,
  -- OT counts
  ff.ot_count_days + ff.ot_count_nights as total_ot,
  ff.ot_count_callback_days + ff.ot_count_callback_nights as callback_ot
FROM firefighters ff
CROSS JOIN ot_requests otr
JOIN stations s ON s.id = otr.station_id
JOIN areas a ON s.area_id = a.id
LEFT JOIN station_distances sd ON sd.station_id = ff.station_id
WHERE ff.is_active = true
  AND otr.status = 'pending'
  AND watch_ok = true
  AND has_quals = true;
```

### New table: `allocation_run_summary`
Audit trail for each allocation run:
```sql
CREATE TABLE allocation_run_summary (
  id SERIAL PRIMARY KEY,
  run_at TIMESTAMP DEFAULT NOW(),
  requests_processed INT,
  assignments_made INT,
  fill_rate NUMERIC(5,2),
  phases_used TEXT[],
  displaced_assignments JSONB,  -- [{ff_id, from_station, to_station, reason}]
  specialist_fills JSONB,       -- [{ff_id, from_station, to_station, specialist_type}]
  total_candidates_considered INT,
  raw_pool JSONB                -- full candidate pool snapshot
);
```

---

## 10. Open Questions for Adam

1. **OOD District Restriction:** Should OOD FFs only fill adjacent districts, or any district?
2. **Specialist Cross-District:** Can a PRT-qualified FF from Auckland fill a Waitemata PRT slot? Or do specialists stay in-district first?
3. **SSO as Final Overflow:** Is Priority 4 (SSO overflow) the right last-resort, or should there be a separate step for "SSO on leave but available for callback"?
4. **Phase 0 Home-Station:** Should home-station assignment be automatic (no OT count consideration, just fill it), or should it still respect OT count fairness?
5. **Displacement Limit:** Should a candidate be displaceable only once per run, or unlimited?
6. **Memory Compaction:** Done ✅ (287KB → 91KB). What else do you need from memory?
```

## File: CLAUDE.md
```md
@AGENTS.md

```

## File: components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib"
  }
}

```

## File: ecosystem-fenz.js
```js
module.exports = {
  name: 'fenz-ot',
  script: '/home/ubuntu/fenz-ot-prototype/.next/standalone/server.js',
  cwd: '/home/ubuntu/fenz-ot-prototype/.next/standalone',
  env: {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://postgres:fenz_dev_pass@127.0.0.1:5433/fenz_ot',
    DIRECT_URL: 'postgresql://postgres:fenz_dev_pass@127.0.0.1:5433/fenz_ot',
    PORT: '3005',
  },
  autorestart: true,
  watch: false,
};
```

## File: ENGINE_V2_DESIGN.md
```md
# FENZ Overtime Allocation Engine v2 — Design Specification

> **Status:** Draft — pending implementation
> **See also:** `SELECTION_LOGIC.md` (v1, superseded), `SPEC.md` (authoritative backend spec)

---

## Overview

The engine allocates overtime shifts across fire stations. It replaces the Block-cascade model (v1) with a **pre-built priority queue → batch greedy assignment** model.

**Core principle:** Build the right ordered list of candidates once, then assign greedily to the nearest available station. No re-looping, no waterfall cascades.

---

## 1. Station OT Requests

A station OT request specifies:
- `station_id`, `station_name`, `district`
- `date`, `shift_type` (Day / Night)
- `slots` — number of OT slots to fill
- `specialist_type` — e.g. `'prt'` or `null`
- `required_rank` — `'FF'` | `'SO'` | `'SSO'` | `'SO_OR_SSO'`
- `required_qualifications` — array of qual codes, all must be held

Rank type determines which candidate pool fills the request:
- `FF` → Groups 1–6 only
- `SO` → Group 7 only (SO pool)
- `SSO` → Group 8 only (SSO pool)
- `SO_OR_SSO` → Groups 7 then 8 (SO exhausted → SSO overflow)

---

## 2. Candidate Groups (9 groups, strict priority order)

Groups are **mutually exclusive** — each FF/Officer belongs to exactly one group.

| Group | Members | District filter | Callback filter | OT counter |
|-------|---------|-----------------|-----------------|------------|
| 1 | FF | In-district | Yes | `ot_count_callback_{shift}` |
| 2 | FF | In-district | No | `ot_count_noncallback_{shift}` |
| 3 | FF | OOD-adjacent | Yes | `ot_count_callback_{shift}` |
| 4 | FF | OOD-adjacent | No | `ot_count_noncallback_{shift}` |
| 5 | FF | OOD-distant | Yes | `ot_count_callback_{shift}` |
| 6 | FF | OOD-distant | No | `ot_count_noncallback_{shift}` |
| 7 | SO | Any (all districts) | — | `ot_count_callback_{shift}` |
| 8 | SSO | Any (all districts) | — | `ot_count_callback_{shift}` |

**SSO → SO overflow:** Group 8 (SSO pool) can fill Group 7 (SO) slots only if Group 7 is exhausted. SSO cannot fill FF slots. FF cannot fill SO/SSO slots under any circumstances.

### OOD District Adjacency Rings

Hard-coded adjacency (Auckland is the hub):

| Target district | Adjacent (A-ring) | Distant (B-ring) |
|-----------------|-------------------|------------------|
| Auckland | Waitemata, Counties Manukau | — |
| Waitemata | Auckland | Counties Manukau |
| Counties Manukau | Auckland | Waitemata |

For a station, OOD candidates are drawn from A-ring districts first. B-ring is only considered after A-ring is fully exhausted at all distances.

---

## 3. Eligibility Rules (per candidate per request)

A candidate is eligible for a request if ALL of the following pass:

### Universal (all groups)
- `is_active = true`
- Watch is not on a regular working shift for the request date/shift (`getShift()` must return `'Off'`)
- Watch is not on leave (`isOnLeave()`)
- Requested date/shift not excluded by callback type:
  - `#2a-EveningDay2` → not available for Day
  - `#3-AfterLastNight` → not available for Day
- Candidate holds all `required_qualifications` for the request
- Candidate's preferences (if any) include the request district or station
- Candidate has `want_to_work_{shift}` = true (non-callback only; callback overrides want_to_work)

### FF Groups (1–6)
- Rank must be `FF`
- FF must belong to the required district ring (in / OOD-adjacent / OOD-distant)
- Callback status must match group:
  - Group 1, 3, 5: `getCallbackType()` must return a non-null callback name
  - Group 2, 4, 6: `getCallbackType()` must return `null`

### SO Groups (7)
- Rank must be `SO` or `SSO` (SSO can ride up to fill SO slots in overflow)
- No district restriction

### SSO Groups (8)
- Rank must be `SSO`
- No district restriction

---

## 4. Sorting Within Groups

### FF Groups (1–6) — Must / Might / Won't

Within each group, candidates at the same distance are sorted by:
1. **Threshold bucket:** `must` → `might` → `wont`
2. **OT count** (ascending — lower = more deserving)
3. **Distance** (ascending — tie-break)

**Must / Might / Won't threshold:**

For a given station and group, at the current distance phase:
- Sort all candidates by OT count (lowest first), ties by distance
- Candidates filling the first `slots_remaining` positions → `must`
- Candidates filling the next `slots_remaining` positions (if any remaining) → `might`
- All others → `wont`

Only `must` candidates are assigned. `might` candidates wait for the next distance phase.

**Distance phases advance together:**
All stations move through distance phases in lockstep. A phase only advances when every station has either: (a) all slots filled, or (b) no eligible candidates remaining at that phase.

### Officer Groups (7, 8) — Pure OT Count + Home Preference

Officers within Groups 7 and 8 are sorted by:
1. **Adjusted OT count** (see Home Station Preference below)
2. **Distance** (ascending)

No must/might bucket — every eligible officer at a given station is considered simultaneously.

---

## 5. Home Station Preference (Officers only)

**Admin setting (stored in DB, default = 2):**
```
officer_home_preference_grace = 2  # OT count grace for home station
```

For an officer candidate at their home station:
- Effective OT count = `ot_count_callback_{shift} - grace`
- For grace = 2: an SO with OT=8 at their home station competes as OT=6

This means an officer at their home station can outrank someone with a lower raw OT count, as long as the difference is within the grace. At non-home stations, raw OT count applies.

**Note:** Future-proofing: same rule can apply to FFs with `ff_home_preference_grace = 0` (currently disabled, always 0).

---

## 6. Overflow Logic (Cross-group redistribution)

A surplus FF from a higher group can only enter a lower group if:

1. The higher-priority group's stations are **all fully filled**, AND
2. The surplus FF has a **lower OT count** than every candidate currently assigned to the target station from the lower group

This preserves fairness — someone with a higher OT count cannot be displaced by a lower-ranked group candidate just because of proximity.

Practically: overflow is evaluated at the boundary between groups. For each station, after Group N is exhausted, check if any unassigned FFs from Group N−1 could fill remaining slots. If yes, they are moved into that station's assignment list, displacing the highest-OT candidate from the lower group.

---

## 7. Assignment Algorithm

```
1. Load all candidates and requests.
2. For each request, compute district ring (in / OOD-adj / OOD-distant) from adjacency map.
3. Build candidate groups 1–8 by applying eligibility rules.
4. Sort each group:
   - Groups 1–6: by threshold (must/might), then OT count, then distance
   - Groups 7–8: by adjusted OT count, then distance
5. For each request, build per-distance-phase candidate lists.
6. Assign in strict group priority order:
   For each group:
     For each distance phase:
       For each station:
         Assign must candidates in OT order
         Skip might candidates (they'll be re-evaluated at next distance)
         Advance distance phase when all stations at this phase are exhausted
7. After all FF groups (1–6), evaluate overflow (Section 6).
8. Assign SO pool (Group 7) to SO/SSO requests.
9. Assign SSO pool (Group 8) to SSO requests.
10. Evaluate SSO → SO overflow.
11. Return station results.
```

---

## 8. Test Scenario Data

### Station OT Requests (v2 test)

| Station | District | Slots | Rank | Specialist |
|---------|----------|-------|------|-----------|
| Albany | Waitemata | 3 | FF | — |
| Devonport | Waitemata | 2 | FF | — |
| Silverdale | Waitemata | 2 | SSO | PRT |
| Takapuna | Waitemata | 2 | SSO | — |
| Papakura | Counties Manukau | 3 | SO | — |
| Manurewa | Counties Manukau | 2 | SO | — |
| Otahuhu | Counties Manukau | 2 | SO | — |
| Papatoetoe | Counties Manukau | 2 | SSO | — |
| Grey Lynn | Auckland | 2 | SO | — |
| Remuera | Auckland | 2 | SO | — |
| Avondale | Auckland | 2 | SSO | — |
| Mount Roskill | Auckland | 2 | SSO | — |

### Test date: 2026-04-07, Day Shift

### Adjacency map for this test:
- Auckland → Adjacent: Waitemata + Counties Manukau; Distant: none
- Waitemata → Adjacent: Auckland; Distant: Counties Manukau
- Counties Manukau → Adjacent: Auckland; Distant: Waitemata

---

## 9. Open Questions

- [ ] Can an SO ride up to fill an SSO station? (Currently modelled as yes — SSO pool is the primary, SO pool fills SSO if SSO exhausted)
- [ ] When SSO overflows to SO slots, does SSO use their own OT count or SSO-specific OT count? (Currently: SSO `ot_count_callback` applies in both cases)
- [ ] Does `want_to_work_day/night` apply to SO/SSO officers? (Currently modelled as no — officer availability is purely watch-based)
- [ ] Admin setting for `officer_home_preference_grace` — table schema and UI needed

---

## 10. Open Items / Backlog

From previous sessions (not yet addressed):
- [ ] OOD adjacency ring expansion: A-ring → B-ring only when A-ring exhausted at all distances
- [ ] Specialist secondary pass: after primary FF pass, steal qualified candidates from other stations to fill specialist slots
- [ ] Per-FF OT count fairness tracking across multiple OT runs (cumulative vs per-round)
- [ ] Admin manual override for leave/exceptional circumstances
```

## File: eslint.config.mjs
```mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

```

## File: IMPLEMENTATION_NOTES.md
```md
# FENZ OT — Implementation Notes

> **Refer to [SPEC.md](./SPEC.md) for the authoritative design.**
> This file tracks implementation-level decisions and patterns.

---

## Allocation Engine Architecture

The engine processes all stations simultaneously within each distance phase. Key design patterns:

### 1. Cascade Pool Building

For each (Block, distance phase) combination, `buildCascadePool()` collects candidates with:
- Watch eligibility check (`canDoOT()`)
- Block-specific filter (callback or non-callback)
- Qualification + preference checks
- Excludes already-assigned firefighters

### 2. Must/Might Threshold

`computeMustMightWonThreshold()` runs after pool building. It sorts candidates by OT count, groups by count, then assigns thresholds:
- Groups where `cumulative + group_size <= slots` → all "must"
- Groups where `slots - cumulative < group_size` → partial "must" / "might" split
- Remaining groups → "won't"

Within tied groups, candidates are sorted by distance before threshold assignment.

### 3. OT Counter Selection

Passed through the cascade phase name:
- `ff-callback`, `ood-ff-callback`, `so-callback`, `sso-callback` → `ot_count_callback_[day/night]`
- `ff-noncallback`, `ood-ff-noncallback`, `so-noncallback`, `sso-noncallback` → `ot_count_noncallback_[day/night]`

### 4. Specialist Steal

Runs after Block 2. `stealForSpecialists()` iterates specialist stations, finds nearest qualified donor from non-specialist stations with ≥1 spare, and reassigns. Records STOLEN/LOST in both station trace logs.

---

## Database Patterns

### JSONB Usage

- `qualifications`: `{"prt": true, "driver": true, "not_rookie": true}`
- `preferences`: `{"districts": ["Waitemata"], "stations": ["Albany"]}`
- `distances`: `{"stationB_id": km, ...}`

Parse with:
```typescript
typeof r.qualifications === 'string' ? JSON.parse(r.qualifications) : r.qualifications || {}
```

### Distance Matrix

Loaded once per allocation run via `loadDistanceMatrix()`. Returns `{[fromStationId]: {[toStationId]: km}}`. Use `getDistance(from, to, matrix)` helper — returns 0 if same station, `?? 999` if no entry.

### FK-Safe DELETE Order (for tests)

When truncating all tables before reseeding:
```
ot_count_log → audit_logs → ot_offers → availability → district_relievers
→ ot_assignments → ot_requests → allocation_runs → station_distances
→ system_settings → watch_anchors → areas → firefighters → stations
```

Children tables before parent tables. `SET session_replication_role = replica` to bypass constraints during DELETE.

---

## Watch Math Notes

- `getShift(watch, date)` returns: `'Day' | 'Night' | 'Off'`
- `getCallbackType(watch, date)` returns: `#1-BeforeDay1` | `#2a-EveningDay2` | `#2b-DayOfNight1` | `#3-AfterLastNight` | `null`
- `getShiftStatus(watch, date)` returns: `'Day' | 'Night' | 'Off' | 'On Leave'`

Leave is computed from a 160-day super-cycle (first 16 days = leave).

---

## Testing Patterns

Use the test dashboard (`/test`) for visual regression testing. For scripted tests:
```bash
# Run a specific scenario
curl -X POST http://localhost:3005/api/test \
  -H "Content-Type: application/json" \
  -d '{"scenario": "known-result-complex"}'

# Reset before each test run
curl -X POST http://localhost:3005/api/test \
  -H "Content-Type: application/json" \
  -d '{"action": "reset_ot_counts"}'
```

---

## Open Implementation Items

- [ ] Rebuild allocation engine to new Block→Distance architecture per SPEC.md
- [ ] Add `preferences` column to `firefighters` table
- [ ] Verify SO/SSO preference filtering in allocation engine
- [ ] Ensure specialist fill applies to officer roles as well as FFs
```

## File: next-env.d.ts
```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

## File: next.config.ts
```typescript
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: ['100.77.94.99'],
  output: 'standalone',
};
export default nextConfig;

```

## File: package.json
```json
{
  "name": "fenz-ot-prototype",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "seed": "node --import=tsx seed-runner.ts",
    "lint": "eslint"
  },
  "dependencies": {
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.5.0",
    "@types/pg": "^8.20.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "dotenv": "^17.4.2",
    "lucide-react": "^1.7.0",
    "next": "16.2.2",
    "pg": "^8.20.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "tailwind-merge": "^3.5.0",
    "three": "^0.183.2"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.2",
    "tailwindcss": "^4",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}

```

## File: PLAN.md
```md
# FENZ Overtime Rostering — Development Plan

> **For AI agents:** Read [SPEC.md](./SPEC.md) for the authoritative allocation engine design.
> This file covers project context, schema, watch math, API, and development commands.

---

## 1. Project Overview

Multi-district overtime allocation system for **Fire and Emergency New Zealand (FENZ)**. When a firefighter calls in sick or a station needs extra cover, the system automatically finds the best available replacement.

**Tech Stack:**
- **Frontend/API:** Next.js 16.2.2 (App Router, React 19, TypeScript, Tailwind CSS)
- **Database:** PostgreSQL 14 (port 5433, raw `pg` driver — no ORM)
- **Runtime:** Node.js, PM2 process manager
- **UI Components:** Radix UI + shadcn/ui pattern

**Database Connection:**
```
DATABASE_URL=postgresql://postgres:fenz_dev_pass@localhost:5433/fenz_ot
```

---

## 2. Terminology

| Term | Meaning |
|------|---------|
| **District/Area** | Waitemata, Auckland, Counties Manukau (3 districts, configurable) |
| **Watch** | Green, Red, Brown, Blue (4 rotating shift groups, 8-day cycle) |
| **Callback** | When an off-duty watch has a callback obligation |
| **OOD** | Out-of-District — firefighters pulled from another district |
| **SO** | Station Officer |
| **SSO** | Senior Station Officer |
| **Ride up** | FF temporarily promoted to fill an officer vacancy |
| **Ride down** | Officer temporarily filling a firefighter role |
| **Block** | Eligibility tier (1–8, see SPEC.md Section 1.3) |
| **Distance phase** | km distance between home station and OT station (0km, 1km, etc.) |
| **Must / Might / Won't** | OT threshold — must (lowest OT count), might (mid), won't (highest) |
| **Preferences** | Dynamic per-shift district/station availability (not a qualification) |

---

## 3. Database Schema (14 tables)

| Table | Purpose |
|-------|---------|
| `areas` | Districts (loaded from DB at runtime — no hardcoded names) |
| `stations` | Stations linked to areas via `area_id`. Has `district` + `area_id` FK. Has `specialist_type` (nullable) |
| `firefighters` | Active FFs. Fields: `watch`, `rank`, `qualifications` (JSONB), `preferences` (JSONB), `want_to_work_day/night`, OT counters (see below) |
| `station_distances` | Pre-computed distances: `{station_id, distances JSONB: {stationB_id: km}}` |
| `watch_anchors` | Anchor dates for shift cycle calculation |
| `ot_requests` | OT slots needed per station/date/shift |
| `ot_assignments` | Final FF → OT request assignments |
| `ot_count_log` | Audit trail of OT counter changes |
| `ot_offers` | (unused) Future: offer/accept workflow |
| `allocation_runs` | (unused) Future: batch run tracking |
| `audit_logs` | General audit trail |
| `availability` | FF availability overrides |
| `district_relievers` | Cross-district reliever tracking |
| `system_settings` | Config key-value store |

### Firefighter OT Counter Columns

| Column | When Incremented |
|--------|-----------------|
| `ot_count_days` / `ot_count_nights` | Legacy total counters |
| `ot_count_callback_days` / `ot_count_callback_nights` | Blocks 1, 3, 5, 6 |
| `ot_count_noncallback_days` / `ot_count_noncallback_nights` | Blocks 2, 4, 7, 8 |

### Preferences JSONB Format

```json
{
  "districts": ["Waitemata"],
  "stations": ["Albany"]
}
```
- Empty arrays = all
- Non-empty = only these districts/stations
- Evaluated at allocation time (dynamic, not permanent)

### Important Data Notes

- **District resolution:** `firefighters.station_id → stations.area_id → areas.name`. The `loadAllFirefighters()` query does this join and aliases `areas.name` as `district`.
- **Specialist stations:** Stored in `stations.specialist_type`. Only firefighters with the matching qualification can fill those slots.
- **Qualifications:** JSONB on firefighters: `{"prt": true, "driver": true, ...}`

---

## 4. Watch Cycle Mathematics (`src/engine/watch-math.ts`)

Each watch follows an **8-day repeating cycle**:
`[Day, Day, Night, Night, Off, Off, Off, Off]`

Anchors (cycle day 0 = first Day):
- Green: 2026-01-31
- Red: 2026-02-02
- Brown: 2026-02-04
- Blue: 2026-02-06

**Callback rules** (relative to cycle position):

| Cycle Index | Shift | Callback Type |
|-------------|-------|---------------|
| 0 | Day 1 | — |
| 1 | Day 2 | #2a-EveningDay2 (evening extension) |
| 2 | Night 1 | #2b-DayOfNight1 (daytime before night) |
| 3 | Night 2 | #3-AfterLastNight (after last night shift) |
| 4-6 | Off 1-3 | — (no callback) |
| 7 | Off 4 | #1-BeforeDay1 (day before next Day 1) |

**Leave:** 160-day super-cycle. First 16 days = on leave.

**Callback eligibility for Day OT requests:**
- #1-BeforeDay1: ✅ Eligible (primary callback pool)
- #2a-EveningDay2: ❌ Excluded (evening only)
- #2b-DayOfNight1: ❌ Excluded (night-only)
- #3-AfterLastNight: ❌ Excluded (night-only)

---

## 5. Allocation Engine

> **Full specification:** See [SPEC.md](./SPEC.md) Section 2.

**Key points:**
- 8 Blocks: in-district callback → in-district non-callback → OOD callback → OOD non-callback → SO callback → SSO callback → SO non-callback → SSO non-callback
- Within each Block: sweep distance phases **globally** (0km → max). All stations move together — no station skips ahead.
- Within each distance phase: candidates sorted must/might → OT count → distance, assigned one-by-one
- Preferences filter candidates (district + station lists)
- Specialist fill after Block 2 (last in-district FF block), before Block 3
- `assignedThisRun` set prevents double-booking; specialist steals are the only reassignment exception

---

## 6. Test Scenario (`src/app/api/test/route.ts`)

**Seed Data:** 48 firefighters (12 per watch), 35 stations, 3 districts.

### Available Scenarios (POST `/api/test` with `{"scenario": "..."}`):

| Scenario ID | Description |
|-------------|-------------|
| `default` | Waitemata Day — 5 Stations, 11 slots |
| `known-result-simple` | Albany 2-slot single station |
| `known-result-complex` | Albany 2 + Silverdale(prt) + Takapuna |
| `3rs` | Albany(3) + Devonport(2) + Silverdale(2) = 7 slots |

**API response includes:** `watchMatrix`, `stationResults` (per-station assignments + trace logs), `allFirefightersDetail`, `availableOvertimes`, `knownResultCheck` (for known-result scenarios).

**Reset OT counts:** `POST /api/test` with `{"action": "reset_ot_counts"}`

---

## 7. File Structure

```
src/
├── engine/
│   ├── allocation-engine.ts    # Core cascade allocation
│   ├── allocation-debug.ts     # Standalone debug runner
│   └── watch-math.ts           # Shift cycle calculator
├── app/
│   ├── api/
│   │   ├── test/route.ts       # Test scenario API
│   │   ├── allocate/route.ts   # Production allocation endpoint
│   │   ├── seed/route.ts       # DB seeding endpoint
│   │   └── chat-test/route.ts  # AI chat test
│   ├── test/page.tsx           # Test dashboard UI
│   ├── dashboard/page.tsx      # Main dashboard
│   ├── firefighter/page.tsx    # FF management
│   ├── officer/page.tsx        # Officer management
│   ├── audit/page.tsx          # Audit trail viewer
│   ├── generate/page.tsx       # FF generator (stress testing)
│   └── chat/page.tsx           # AI chat interface
└── lib/
    ├── db.ts                   # Database connection pool
    ├── seed.ts                 # Seed data generator
    └── utils.ts                # Tailwind cn() helper
```

---

## 8. Development Commands

```bash
cd /home/ubuntu/fenz-ot-prototype
npm run build          # Production build
npm start              # Production server (port 3005)

# PM2
pm2 restart fenz-ot-web
pm2 logs fenz-ot-web

# Database
PGPASSWORD=fenz_dev_pass psql -h localhost -p 5433 -U postgres -d fenz_ot

# Seed
curl -X POST http://localhost:3005/api/seed

# Run test
curl -X POST http://localhost:3005/api/test

# Reset OT counts
curl -X POST -H "Content-Type: application/json" \
  -d '{"action":"reset_ot_counts"}' \
  http://localhost:3005/api/test
```

---

## 9. Known Bugs

### Fixed

- **Threshold tiebreaker ignored distance** — fixed with optional `distances` param to `computeMustMightWonThreshold()`
- **Distance=0 treated as 999km** — fixed with `?? 999` nullish coalescing throughout
- **Callback monopolizing all slots** — fixed by restricting Block 1 to in-district only
- **OT counters not separated** — fixed with dedicated callback/non-callback counters
- **OOD/SO/SSO ignoring watch eligibility** — fixed with universal `canDoOT()` guard in all phases
- **Duplicate seedDatabase() calls** — removed dead code duplicates in test route

### Open

- Test endpoint FK constraint on DELETE order — fixed by reordering: `ot_assignments` before `ot_requests` before `firefighters`
- Test not running due to the FK error — fixed once endpoint is rebuilt

---

## 10. Priority Task List

### Immediate
- [ ] Rebuild `src/engine/allocation-engine.ts` to match SPEC.md (new Block→Distance architecture)
- [ ] Verify test endpoint works (`POST /api/test` with known-result scenarios)
- [ ] Add `preferences` column to `firefighters` table and schema

### Short Term
- [ ] Update seed script to include `preferences` data
- [ ] Run the 3rs test and compare engine output against expected allocations
- [ ] Verify specialist fill works for officers (not just FFs)
- [ ] Implement SO/SSO preference filtering in allocation engine

### Medium Term
- [ ] Production allocation API (`/api/allocate`)
- [ ] Officer management page with preference setting UI
- [ ] Firefighter roster with qualification badges + preferences display
- [ ] Audit trail improvements

### Long Term
- [ ] Authentication (Supabase Auth with domain restriction)
- [ ] Real production deployment
- [ ] Historical analytics and reporting
```

## File: postcss.config.mjs
```mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

```

## File: README.md
```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

## File: run.js
```js
// Force env vars before loading Next.js
process.env.DATABASE_URL = 'postgresql://postgres:fenz_dev_pass@127.0.0.1:5433/fenz_ot';
process.env.DIRECT_URL = 'postgresql://postgres:fenz_dev_pass@127.0.0.1:5433/fenz_ot';
process.env.PORT = '3005';
process.env.NODE_ENV = 'production';
// Load the actual server
require('./.next/standalone/server.js');

```

## File: seed-runner.ts
```typescript
// Seed runner — uses tsx to execute TypeScript directly
import 'dotenv/config';
import { seedDatabase } from './src/lib/seed';

async function main() {
  console.log('🌱 Running database seed...');
  await seedDatabase();
  console.log('✅ Seed complete');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
```

## File: SELECTION_LOGIC.md
```md
# FENZ Overtime Allocation — Selection Logic

> **See also:** [SPEC.md](./SPEC.md) — the authoritative design specification.

## How a Round Works

A single overtime round fills all stations for a given date/shift.

### 1. Block → Distance → Group → Station

The round runs as a nested loop:

```
For BLOCK in [1..8]:
  For DISTANCE_PHASE in [0, 1, 2, ... max_km]:
    For STATION needing coverage:
      For each relevant GROUP:
        Collect eligible candidates at this distance
        Sort: must/might → OT count → distance
        Assign: must first, then might
        Mark each assigned FF as unavailable everywhere
    Advance to next distance ONLY when ALL stations are exhausted at current phase
  After Block 2: specialist fill pass
```

### 2. Blocks (Eligibility Tiers)

| Block | Who | Callback? | District |
|---|---|---|---|
| 1 | District FFs | Yes (callback-eligible) | In-district |
| 2 | District FFs | No (non-callback) | In-district |
| 3 | District FFs | Yes | Out-of-district (all other districts) |
| 4 | District FFs | No | Out-of-district (all other districts) |
| 5 | SO | Yes | All districts |
| 6 | SSO | Yes | All districts |
| 7 | SO | No | All districts |
| 8 | SSO | No | All districts |

### 3. Distance Phases

Starting at 0km and sweeping upward. **All stations and all groups move through the same distance phase simultaneously.** A station cannot skip ahead while another station still has candidates at the current distance.

At each distance phase, a candidate is included if:
- Their home station is exactly at that distance from the overtime station
- They are not already assigned to another station this round
- They pass watch eligibility (`canDoOT`)
- They pass the block-specific filter (callback or non-callback)
- They hold the required qualification (if any)
- The overtime station/district is in their preference list

### 4. Sorting and Assignment

Within each distance phase for each station:

1. Compute must/might thresholds using `computeMustMightWonThreshold()`
2. Sort: `must` before `might` → lowest OT count → smallest distance
3. Assign "must" candidates first, one by one
4. If slots remain, assign "might" candidates, one by one

Each assigned firefighter is immediately added to `assignedThisRun` and cannot be assigned again in the same round.

### 5. Specialist Fill (After Block 2)

After Block 2 (last in-district FF block) completes:

1. For each specialist station still short:
2. Find the nearest qualified firefighter from any non-specialist station that has spare capacity (≥1 assigned FF holding the required qualification)
3. Steal them from the donor station's assignment list
4. Add to specialist station, mark as `cascadePhase = 'specialist-steal'`
5. Repeat until full OR no more qualified candidates

### 6. Must / Might / Won't

Threshold is computed across **all candidates at the current distance phase for a given station**:

- **must** — there is room for this candidate before the slot threshold
- **might** — slots remain after all musts are assigned
- **won't** — past the threshold, not assigned this phase

Tied OT counts within a group are sorted by distance before assigning must/might status.

### 7. OT Counter Selection

| Block | Counter |
|---|---|
| 1, 3, 5, 6 (callback) | `ot_count_callback_days` / `ot_count_callback_nights` |
| 2, 4, 7, 8 (non-callback) | `ot_count_noncallback_days` / `ot_count_noncallback_nights` |

### 8. Preferences

Every firefighter has a `preferences` JSONB field:
```json
{
  "districts": ["Waitemata"],
  "stations": []
}
```

- Empty arrays mean "all"
- A non-empty list means "only these"
- Preferences are evaluated at allocation time, not stored permanently
- Officers (SO/SSO) use the same preference system to limit themselves to specific districts or stations
```

## File: SPEC.md
```md
# FENZ Overtime Allocation — Design Specification

> **⚠️ Engine redesign in progress — see ALGORITHM.md**
> The current engine uses an 8-block sequential cascade. A new single-pass algorithm with OOD re-rank is being designed.
> ALGORITHM.md is the draft design. Do NOT implement changes until Adam approves ALGORITHM.md.
>
> **For AI agents:** This is the authoritative source of truth for the allocation engine design.
> PLAN.md and SELECTION_LOGIC.md reference this document.
> Read ALGORITHM.md first for the new design. Keep this file as the baseline.
> Read this first for context. Keep this file accurate. Any code changes must be reflected here.

---

## 1. Concepts

### 1.1 Groups

Allocation runs with **four Groups running simultaneously**, each operating independently but synchronised on distance phases:

| Group | Eligibility | Districts | Blocks |
|---|---|---|---|
| **District FFs** | One group per configured district | N/A (same-district only for Blocks 1-2) | 1–4 |
| **Auckland FFs** | District group | Auckland only | 1–4 |
| **Counties Manukau FFs** | District group | Counties Manukau only | 1–4 |
| **SO** | Station Officers | All districts (any distance) | 1–2 |
| **SSO** | Senior Station Officers | All districts (any distance) | 1–2 |

> **Configurable districts:** The engine does not hardcode district names or count. Districts are loaded from the `areas` table at runtime. A deployment in a different region with a different number of districts works identically — the engine processes whatever districts exist.

### 1.2 Firefighter Ranks

| Rank | Belongs to Group |
|---|---|
| FF (Firefighter) | District FF Group |
| QFF (Qualified Firefighter) | District FF Group |
| SFF (Senior Firefighter) | District FF Group |
| SO (Station Officer) | SO Group |
| SSO (Senior Station Officer) | SSO Group |

### 1.3 Blocks

Each Group has eligibility tiers called **Blocks**:

| Block | District FF Groups | SO Group | SSO Group |
|---|---|---|---|
| **1** | In-district, callback-eligible | Any district, callback-eligible | Any district, callback-eligible |
| **2** | In-district, non-callback | Any district, non-callback | Any district, non-callback |
| **3** | Out-of-district, callback-eligible | — (not applicable) | — (not applicable) |
| **4** | Out-of-district, non-callback | — (not applicable) | — (not applicable) |

**Key notes:**
- For District FF Groups, "in-district" means the same district as the requesting station.
- For SO and SSO Groups, there is no in-district/out-of-district distinction — both Blocks 1 and 2 span all districts.
- When a District FF Group reaches Block 3 (out-of-district), it draws from **all other districts simultaneously** — not one at a time. Distance determines who is nearest.
- Blocks 3 and 4 do not exist for SO or SSO Groups.

### 1.4 Distance Phases

Within each Block, allocation happens in **distance sweeps**:

```
0km phase → 1km phase → 2km phase → ... → max_km phase
```

A **distance phase** is the physical road distance in kilometres between a firefighter's **home station** and the **overtime station**. The phase number represents the km threshold — all candidates whose home station is within exactly that distance are considered.

**The critical rule:** The current distance phase is **global across all Groups, all districts, all stations**. No station can advance to the next distance phase until **every station has exhausted its candidate pool at the current phase**.

### 1.5 Must / Might / Won't

Within each distance phase, eligible candidates are sorted by their **relevant OT count** (lowest first). The `computeMustMightWonThreshold()` function assigns each candidate a status:

- **must** — There is room for this firefighter before the slot threshold is reached. They are expected to take this OT.
- **might** — All "must" candidates have been assigned, and slots remain. They may be assigned if slots are still available after all "musts".
- **won't** — This firefighter is past the threshold. Not assigned this phase.

The threshold is computed across **all candidates in the current distance phase for a given station**, not across all candidates globally.

### 1.6 Preferences (All Firefighters)

Every firefighter — regardless of rank — may have a **preference list** specifying which districts and/or stations they are willing to work at. This is **not a qualification**:
- **Qualifications** are permanent (e.g., PRT certification)
- **Preferences** are dynamic and may change from day to day

The engine handles preferences the same way it handles qualifications: if a firefighter's preference list does not include the overtime station (or its district), they are filtered out of the candidate pool. Preferences are stored per-firefighter, loaded at allocation time, and evaluated against the current OT request.

### 1.7 Specialist Stations

Some stations require specific qualifications to fill certain slots — for example, Silverdale requires `prt`, Te Atatu requires `type4`. These are stored in `stations.specialist_type`.

A specialist slot can only be filled by a firefighter who holds the required qualification (checked via the qualifications map, same as other qualifications).

---

## 2. The Allocation Algorithm

### 2.1 Overview

For a given OT request date/shift across one or more stations:

```
For BLOCK in [1, 2, 3, 4, 5, 6]:
  For DISTANCE_PHASE in [0, 1, 2, ... max_km]:
    For each STATION needing coverage:
      For each GROUP processing this block:
        Collect all eligible candidates at this distance
        Sort by: must/might → OT count → distance
        Assign: must → might (one by one)
        Mark each assigned firefighter as unavailable for all other stations
    Advance to next distance phase only when ALL stations have exhausted this phase
  If BLOCK == 2 (last in-district FF block):
    Run specialist fill
  Move to next BLOCK
```

### 2.2 Step-by-Step

**Step 1 — Enter a new Block**

All Groups enter their next Block simultaneously. For District FF Groups, each Group operates within its own district for Blocks 1–2, then all districts combine for Blocks 3–4.

**Step 2 — Start at distance 0km**

The current distance phase applies to **every Group, every district, every station** simultaneously. You are always looking at the same distance across the entire system.

**Step 3 — Collect candidates at this distance**

For each station still needing coverage, collect all firefighters from every Group whose home station is **exactly at the current distance phase** from the overtime station, who pass:
- **Watch eligibility** — not on leave, callback status allows this shift, shift type matches
- **Qualification check** — holds required specialist qualification (if any)
- **Preference check** — overtime station (or its district) is in their preference list
- **Not already assigned** — not in the global `assignedThisRun` set

**Step 4 — Sort and assign**

For each station, within the candidates at this distance phase:
1. Sort by: must/might status → lowest relevant OT count → smallest distance (tiebreaker)
2. Assign "must" candidates first, one by one
3. If slots remain, assign "might" candidates, one by one
4. Each assigned firefighter is **immediately** added to `assignedThisRun` — they are now unavailable for all other stations at this and all future distance phases in this round

**Step 5 — Advance only when all stations are exhausted at this distance**

Once every station either has its full complement **or** has no more candidates at the current distance phase, advance to the next distance phase. Repeat from Step 3.

**Step 6 — Move to next Block**

When every distance phase has been swept and slots remain, move to the next Block. Repeat from Step 2.

**Step 7 — Specialist fill (after Block 2 only)**

After Block 2 (the last in-district FF block) is complete, but **before** moving to Block 3 (out-of-district):

If any specialist station has unfilled slots:
1. Identify every non-specialist station that has at least one assigned firefighter who holds the required qualification
2. For each unfilled specialist slot, steal the nearest-qualified firefighter from any non-specialist station with spare capacity
3. The stolen firefighter comes from the **already-assigned pool** — never from candidates still being considered for out-of-district blocks
4. Repeat until all specialist slots are filled OR no qualified candidates remain

> **Note on assignedIds and specialist fill:** The `assignedThisRun` set contains all firefighters assigned during the current round. Specialist steals draw from this set — the firefighter is reassigned from their original station to the specialist station. This is the **only exception** to the rule that "once assigned, a firefighter cannot be reassigned."

### 2.3 OT Counter Selection

Which OT counter is incremented depends on the Block and the shift type:

| Block | Counter Used |
|---|---|
| 1 (callback) | `ot_count_callback_days` or `ot_count_callback_nights` |
| 2 (non-callback) | `ot_count_noncallback_days` or `ot_count_noncallback_nights` |
| 3 (OOD callback) | `ot_count_callback_days` or `ot_count_callback_nights` |
| 4 (OOD non-callback) | `ot_count_noncallback_days` or `ot_count_noncallback_nights` |
| 5 (SO callback) | `ot_count_callback_days` or `ot_count_callback_nights` |
| 6 (SSO callback) | `ot_count_callback_days` or `ot_count_callback_nights` |
| 7 (SO non-callback) | `ot_count_noncallback_days` or `ot_count_noncallback_nights` |
| 8 (SSO non-callback) | `ot_count_noncallback_days` or `ot_count_noncallback_nights` |

---

## 3. Watch Eligibility

Every candidate must pass a **universal watch eligibility check** before being considered in any Block. This is encapsulated in `canDoOT()`:

```typescript
function canDoOT(ff: Firefighter, otDate: Date, requestShiftType: 'Day' | 'Night'): {
  pass: boolean;
  reason: string;
}
```

**Rules (in order):**

1. **On Leave** → fail, reason: "On Leave"
2. **#3-AfterLastNight + Day shift** → fail, reason: "#3-AfterLastNight is Night-only"
3. **#2a-EveningDay2 + Day shift** → fail, reason: "#2a-EveningDay2 excludes Day shift"
4. **#2b-DayOfNight1 + Day shift** → fail, reason: "#2b-DayOfNight1 is Night-only"
5. **Regular working shift mismatch** (no callback):
   - Day shift request + FF is on Night shift → fail
   - Night shift request + FF is on Day shift → fail
6. **Otherwise** → pass, reason: "Watch-eligible"

---

## 4. Callback Filter (Blocks 1, 3, 5, 6)

To be eligible for a callback Block, a firefighter must:
- Have an active callback type for this date/shift (see Section 4 of PLAN.md for callback rules)
- Pass the universal watch eligibility check above
- Not already be on a regular working shift of the opposite type

### 4.1 Non-Callback Filter (Blocks 2, 4)

To be eligible for a non-callback Block, a firefighter must:
- **Not** have an active callback
- Pass the universal watch eligibility check
- Either:
  - Be on an off-duty period (any shift type OK), OR
  - Be on a regular shift matching the OT type AND have `want_to_work_[day/night]` = true

---

## 5. Officer Preferences (SO / SSO)

Officers (SO and SSO) can restrict their availability to:
- A specific **district** (all stations in that district are eligible)
- A specific **station** (only that station is eligible)

This is stored as a preference list on the firefighter record, not as a qualification. The preference may change from one shift to the next.

For officers who have restricted their preferences, the allocation engine filters them out of any candidate pool where the overtime station is not on their preference list.

---

## 6. Specialist Station Fill (Post-Block 2)

Triggered: after Block 2 (last in-district FF block) is complete, before Block 3 begins.

```
For each specialist station still needing coverage:
  While slots remain unfilled:
    Find the nearest qualified firefighter from any non-specialist station
    that has at least 1 assigned firefighter with the required qualification
    AND where the donor station will retain at least 1 firefighter after the steal
    
    If such a candidate exists:
      Remove them from the donor station's assignment list
      Add them to the specialist station's assignment list
      Mark as: cascadePhase = 'specialist-steal', stolenFrom = [donor station]
    Else:
      Stop — no more qualified candidates available
```

Specialist steals are recorded as a distinct cascade phase (`specialist-steal`) in the trace logs, with entries in both the donor and recipient station logs.

---

## 7. Trace Logging

Each distance phase records a trace log entry per candidate:

| Type | Meaning |
|---|---|
| `header` | Phase/distance header |
| `pass` | Candidate is eligible and considered |
| `skip` | Candidate is ineligible (reason in detail) |
| `assign` | Candidate is assigned (shows OT count, distance) |

Specialist steals generate two trace entries: `STOLEN` in the specialist station log, `LOST` in the donor station log.

---

## 8. Full Block Sequence

```
Block 1: In-district FF, callback
  → Distance sweep 0km → max
  → All district FF groups run simultaneously

Block 2: In-district FF, non-callback
  → Distance sweep 0km → max
  → All district FF groups run simultaneously
  → [SPECIALIST FILL] after this block completes

Block 3: Out-of-district FF, callback
  → Distance sweep 0km → max
  → All districts combined, distance-sorted

Block 4: Out-of-district FF, non-callback
  → Distance sweep 0km → max
  → All districts combined, distance-sorted

Block 5: SO, callback
  → Distance sweep 0km → max
  → All districts, officer-qualified FFs and SSOs also eligible

Block 6: SSO, callback
  → Distance sweep 0km → max
  → All districts, SSO-qualified SOs also eligible

Block 7: SO, non-callback
  → Distance sweep 0km → max
  → All districts

Block 8: SSO, non-callback
  → Distance sweep 0km → max
  → All districts
```

---

## 9. Data Model Summary

### Firefighter record key fields:
- `id`, `first_name`, `last_name`, `station_id`, `watch`, `rank`
- `qualifications` (JSONB: `{"prt": true, "type4": true, ...}`)
- `preferences` (JSONB: `{"districts": ["Waitemata"], "stations": []}` or `{"districts": [], "stations": ["Albany"]}`)
- `want_to_work_day`, `want_to_work_night`
- `ot_count_days`, `ot_count_nights`
- `ot_count_callback_days`, `ot_count_callback_nights`
- `ot_count_noncallback_days`, `ot_count_noncallback_nights`
- `is_active`

### Station record key fields:
- `id`, `name`, `area_id` (FK → areas)
- `specialist_type` (nullable: `prt`, `type4`, etc.)

### Area (District) record:
- `id`, `name` (e.g., "Waitemata", "Auckland", "Counties Manukau")

### station_distances:
- `station_id`, `distances` (JSONB: `{"stationB_id": km, ...}`)

### ot_requests:
- `station_id`, `date`, `shift_type`, `specialist_type`, `number_of_slots`, `status`

---

## 10. Algorithm Summary

```
INPUT: Set of OT requests (station, date, shift, slots, specialist?)
OUTPUT: Assignment map (firefighter_id → station_id)

global_assigned = {}

For block in [1, 2, 3, 4, 5, 6, 7, 8]:
  max_distance = max(station_distances values)
  
  For distance from 0 to max_distance:
    For each station with unfilled slots:
      For each relevant group for this block:
        candidates = all FFs where:
          - FF.rank matches group (FFs/OOs/SOs/SOs)
          - FF.preferences allow this station
          - FF.qualifications allow this station
          - FF not in global_assigned
          - distance(FF.home_station, station) == current_distance
          - FF passes watch eligibility
          - FF passes block-specific filter (callback or non-callback)
        
        If no candidates at this distance:
          continue (station will try next distance phase)
        
        sorted = sort candidates by (must/might → OT count → distance)
        
        For each candidate in sorted:
          If slots remain:
            Assign: global_assigned[candidate.id] = station
            slots -= 1
            Record OT counter increment
        
        If all slots filled:
          Mark station as complete for this block
  
  After block 2: run specialist fill (see Section 6)

Return global_assigned
```
```

## File: start-server.js
```js
#!/usr/bin/env node
// PM2 startup script for FENZ OT server
process.env.DATABASE_URL = 'postgresql://postgres:fenz_dev_pass@127.0.0.1:5433/fenz_ot';
process.env.DIRECT_URL = 'postgresql://postgres:fenz_dev_pass@127.0.0.1:5433/fenz_ot';
process.env.PORT = '3005';
process.env.NODE_ENV = 'production';
require('./server.js');
```

## File: STATUS.md
```md
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
```

## File: test-alloc.mjs
```mjs
import { Pool } from 'pg';
import { runAllocation } from '/home/ubuntu/fenz-ot-prototype/src/engine/allocation-engine.ts';

const pool = new Pool({ host: '127.0.0.1', port: 5432, database: 'fenz_ot', user: 'postgres', password: 'postgres' });

try {
  const requests = [
    { station_id: 1485, station_name: 'Albany', district: 'Waitemata', date: '2026-04-22', shift_type: 'Day', slots: 2, specialist_type: null }
  ];
  const result = await runAllocation(requests, pool);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await pool.end();
}

```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules", "seed-fix.ts"]
}

```
