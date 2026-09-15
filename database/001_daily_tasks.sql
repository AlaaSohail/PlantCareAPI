-- =====================================================
-- Plant Care - Daily Tasks
-- Run this once on the PostgreSQL / Neon database.
-- =====================================================

BEGIN;

CREATE TABLE IF NOT EXISTS plant_care_schedules (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,
    plant_id INTEGER NOT NULL,

    task_type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,

    interval_days INTEGER NOT NULL CHECK (interval_days > 0),
    next_due_date DATE NOT NULL,
    reminder_time TIME NOT NULL DEFAULT '09:00:00',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT plant_care_schedules_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT plant_care_schedules_plant_fk
        FOREIGN KEY (plant_id)
        REFERENCES plants(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_plant_care_schedules_user
    ON plant_care_schedules(user_id);

CREATE INDEX IF NOT EXISTS idx_plant_care_schedules_plant
    ON plant_care_schedules(plant_id);

CREATE INDEX IF NOT EXISTS idx_plant_care_schedules_due
    ON plant_care_schedules(next_due_date);

CREATE INDEX IF NOT EXISTS idx_plant_care_schedules_user_due
    ON plant_care_schedules(user_id, next_due_date);

-- One active task of the same type per plant.
-- Disabled schedules do not prevent creating a new one later.
CREATE UNIQUE INDEX IF NOT EXISTS uq_plant_care_active_task_type
    ON plant_care_schedules(plant_id, task_type)
    WHERE is_active = TRUE;

COMMIT;
