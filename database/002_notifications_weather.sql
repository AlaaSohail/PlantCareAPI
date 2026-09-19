-- =====================================================
-- Plant Care - Push notifications, task reminders,
-- weather alerts, notification preferences
-- Safe to run more than once.
-- =====================================================

BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS task_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS weather_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) NOT NULL DEFAULT 'UTC';

ALTER TABLE reminders
    ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ;

ALTER TABLE plant_care_schedules
    ADD COLUMN IF NOT EXISTS last_notified_due_date DATE;

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL DEFAULT 'general',
    ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS dedupe_key VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS uq_notifications_dedupe_key
    ON notifications(dedupe_key)
    WHERE dedupe_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS weather_alert_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    alert_key VARCHAR(255) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'warning',
    forecast_date DATE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,

    CONSTRAINT weather_alert_events_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT weather_alert_events_user_key_unique
        UNIQUE(user_id, alert_key)
);

CREATE INDEX IF NOT EXISTS idx_weather_alert_events_user
    ON weather_alert_events(user_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_weather_alert_events_expires
    ON weather_alert_events(expires_at);

COMMIT;
