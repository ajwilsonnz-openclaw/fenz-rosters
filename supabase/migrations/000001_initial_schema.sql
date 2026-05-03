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
