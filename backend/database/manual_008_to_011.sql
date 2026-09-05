-- Evently production schema updates: migrations 008 through 011.
-- Run this file against the selected Evently MySQL database.
-- It is additive and does not delete or reset existing data.

-- ---------------------------------------------------------------------------
-- 008_attendance_scan_logs.sql
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_scan_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NOT NULL,
    registration_id BIGINT UNSIGNED NULL,
    scanned_by_user_id BIGINT UNSIGNED NULL,
    scan_method ENUM('Camera', 'Manual') NOT NULL DEFAULT 'Camera',
    result ENUM(
        'CHECKED_IN',
        'ALREADY_CHECKED_IN',
        'INVALID_TICKET',
        'EVENT_MISMATCH',
        'CANCELLED',
        'NOT_CONFIRMED',
        'NOT_ASSIGNED'
    ) NOT NULL,
    scanned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_scan_logs_event
        FOREIGN KEY (event_id) REFERENCES events (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_scan_logs_registration
        FOREIGN KEY (registration_id) REFERENCES registrations (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_scan_logs_scanned_by
        FOREIGN KEY (scanned_by_user_id) REFERENCES users (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_scan_logs_event (event_id),
    INDEX idx_scan_logs_registration (registration_id),
    INDEX idx_scan_logs_scanned_by (scanned_by_user_id),
    INDEX idx_scan_logs_scanned_at (scanned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 009_schedule_attribution.sql
-- ---------------------------------------------------------------------------
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
    CONSTRAINT chk_schedule_time_range
        CHECK (end_time IS NULL OR end_time > start_time),
    CONSTRAINT fk_schedule_event
        FOREIGN KEY (event_id) REFERENCES events (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_schedule_speaker
        FOREIGN KEY (speaker_id) REFERENCES speakers (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_schedule_event_date_time (event_id, item_date, start_time),
    INDEX idx_schedule_speaker (speaker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @created_by_user_column_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'event_schedule_items'
      AND COLUMN_NAME = 'created_by_user_id'
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
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'event_schedule_items'
      AND COLUMN_NAME = 'created_by_role'
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
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'event_schedule_items'
      AND CONSTRAINT_NAME = 'fk_schedule_created_by'
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
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'event_schedule_items'
      AND INDEX_NAME = 'idx_schedule_created_by'
);
SET @schedule_created_by_index_sql := IF(
    @schedule_created_by_index_exists = 0,
    'CREATE INDEX idx_schedule_created_by ON event_schedule_items(created_by_user_id)',
    'SELECT 1'
);
PREPARE schedule_created_by_index_statement FROM @schedule_created_by_index_sql;
EXECUTE schedule_created_by_index_statement;
DEALLOCATE PREPARE schedule_created_by_index_statement;

-- ---------------------------------------------------------------------------
-- 010_event_staff_assignment_role.sql
-- ---------------------------------------------------------------------------
SET @assignment_role_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'event_staff'
      AND COLUMN_NAME = 'assignment_role'
);
SET @assignment_role_sql := IF(
    @assignment_role_exists = 0,
    'ALTER TABLE event_staff ADD COLUMN assignment_role VARCHAR(40) NOT NULL DEFAULT ''co_organizer'' AFTER user_id',
    'SELECT 1'
);
PREPARE assignment_role_statement FROM @assignment_role_sql;
EXECUTE assignment_role_statement;
DEALLOCATE PREPARE assignment_role_statement;

-- ---------------------------------------------------------------------------
-- 011_discussion_message_moderation.sql
-- ---------------------------------------------------------------------------
SET @discussion_message_deleted_at_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'discussion_messages'
      AND COLUMN_NAME = 'deleted_at'
);
SET @discussion_message_deleted_at_sql := IF(
    @discussion_message_deleted_at_exists = 0,
    'ALTER TABLE discussion_messages ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER message',
    'SELECT 1'
);
PREPARE discussion_message_deleted_at_statement FROM @discussion_message_deleted_at_sql;
EXECUTE discussion_message_deleted_at_statement;
DEALLOCATE PREPARE discussion_message_deleted_at_statement;

SET @discussion_message_deleted_by_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'discussion_messages'
      AND COLUMN_NAME = 'deleted_by_user_id'
);
SET @discussion_message_deleted_by_sql := IF(
    @discussion_message_deleted_by_exists = 0,
    'ALTER TABLE discussion_messages ADD COLUMN deleted_by_user_id BIGINT UNSIGNED NULL DEFAULT NULL AFTER deleted_at',
    'SELECT 1'
);
PREPARE discussion_message_deleted_by_statement FROM @discussion_message_deleted_by_sql;
EXECUTE discussion_message_deleted_by_statement;
DEALLOCATE PREPARE discussion_message_deleted_by_statement;

SET @discussion_message_deleted_by_fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'discussion_messages'
      AND CONSTRAINT_NAME = 'fk_discussion_messages_deleted_by'
);
SET @discussion_message_deleted_by_fk_sql := IF(
    @discussion_message_deleted_by_fk_exists = 0,
    'ALTER TABLE discussion_messages ADD CONSTRAINT fk_discussion_messages_deleted_by FOREIGN KEY (deleted_by_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT 1'
);
PREPARE discussion_message_deleted_by_fk_statement FROM @discussion_message_deleted_by_fk_sql;
EXECUTE discussion_message_deleted_by_fk_statement;
DEALLOCATE PREPARE discussion_message_deleted_by_fk_statement;

SELECT 'Migrations 008 through 011 completed successfully.' AS migration_result;
