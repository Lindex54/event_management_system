-- Event Staff / Attendee module database patch
-- Safe structural additions only: no DROP, TRUNCATE, or data deletion.
-- NOTE: these two tables already exist on the live development database (created ad hoc
-- prior to this patch); this file documents them under version control using
-- CREATE TABLE IF NOT EXISTS so it is safe to run against any environment.
USE event_management_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Assigns an Event Staff user to an event they may check attendees in for.
CREATE TABLE IF NOT EXISTS event_staff (
    event_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    assigned_by_user_id BIGINT UNSIGNED NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id),
    CONSTRAINT fk_event_staff_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_event_staff_user FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE,
    CONSTRAINT fk_event_staff_assigned_by FOREIGN KEY (assigned_by_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_event_staff_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Records a single check-in event for a registration. One row per registration
-- (a registration is either checked in or not — re-checking in is idempotent).
CREATE TABLE IF NOT EXISTS attendance_check_ins (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT UNSIGNED NOT NULL,
    checked_in_by_user_id BIGINT UNSIGNED NULL,
    checked_in_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_attendance_registration UNIQUE (registration_id),
    CONSTRAINT fk_attendance_registration FOREIGN KEY (registration_id) REFERENCES registrations (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_attendance_checked_in_by FOREIGN KEY (checked_in_by_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_attendance_checked_in_at (checked_in_at),
    INDEX idx_attendance_checked_in_by (checked_in_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
