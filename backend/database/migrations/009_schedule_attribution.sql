-- event_schedule_items was previously only defined in database/organizer_module.sql
-- (outside the migrations folder), so a fresh install running only numbered
-- migrations would never get it. Recreate it here, safely, as a no-op where it
-- already exists.
CREATE TABLE IF NOT EXISTS event_schedule_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NOT NULL,
    speaker_id BIGINT UNSIGNED NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    item_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NULL,
    room VARCHAR(180) NULL,
    sort_order INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT chk_schedule_time_range CHECK (end_time IS NULL OR end_time > start_time),
    CONSTRAINT fk_schedule_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_schedule_speaker FOREIGN KEY (speaker_id) REFERENCES speakers (id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_schedule_event_date_time (event_id, item_date, start_time),
    INDEX idx_schedule_speaker (speaker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Records who added each schedule item (admin, organizer, or staff) so admins can
-- see everyone's schedule in one place, and organizers/staff can see items an
-- admin added on their behalf, all through the existing event-scoped queries.
SET @created_by_user_column_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_schedule_items' AND COLUMN_NAME = 'created_by_user_id'
);
SET @created_by_user_column_sql := IF(
    @created_by_user_column_exists = 0,
    'ALTER TABLE event_schedule_items ADD COLUMN created_by_user_id BIGINT UNSIGNED NULL AFTER sort_order',
    'SELECT 1'
);
PREPARE created_by_user_column_statement FROM @created_by_user_column_sql;
EXECUTE created_by_user_column_statement;
DEALLOCATE PREPARE created_by_user_column_statement;

SET @created_by_role_column_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_schedule_items' AND COLUMN_NAME = 'created_by_role'
);
SET @created_by_role_column_sql := IF(
    @created_by_role_column_exists = 0,
    'ALTER TABLE event_schedule_items ADD COLUMN created_by_role ENUM(''Admin'',''Organizer'',''Staff'') NULL AFTER created_by_user_id',
    'SELECT 1'
);
PREPARE created_by_role_column_statement FROM @created_by_role_column_sql;
EXECUTE created_by_role_column_statement;
DEALLOCATE PREPARE created_by_role_column_statement;

SET @schedule_created_by_fk_exists := (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_schedule_items' AND CONSTRAINT_NAME = 'fk_schedule_created_by'
);
SET @schedule_created_by_fk_sql := IF(
    @schedule_created_by_fk_exists = 0,
    'ALTER TABLE event_schedule_items ADD CONSTRAINT fk_schedule_created_by FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT 1'
);
PREPARE schedule_created_by_fk_statement FROM @schedule_created_by_fk_sql;
EXECUTE schedule_created_by_fk_statement;
DEALLOCATE PREPARE schedule_created_by_fk_statement;

SET @schedule_created_by_index_exists := (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_schedule_items' AND INDEX_NAME = 'idx_schedule_created_by'
);
SET @schedule_created_by_index_sql := IF(
    @schedule_created_by_index_exists = 0,
    'CREATE INDEX idx_schedule_created_by ON event_schedule_items(created_by_user_id)',
    'SELECT 1'
);
PREPARE schedule_created_by_index_statement FROM @schedule_created_by_index_sql;
EXECUTE schedule_created_by_index_statement;
DEALLOCATE PREPARE schedule_created_by_index_statement;
