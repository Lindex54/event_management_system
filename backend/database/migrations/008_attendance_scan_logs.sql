-- Records every ticket scan attempt made by event staff/organizers via the check-in
-- camera scanner (or manual entry), independent of attendance_check_ins (which only
-- tracks the final checked-in state, one row per registration). This gives admins a
-- full audit trail of who scanned which attendee, when, and with what result.
CREATE TABLE IF NOT EXISTS attendance_scan_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NOT NULL,
    registration_id BIGINT UNSIGNED NULL,
    scanned_by_user_id BIGINT UNSIGNED NULL,
    scan_method ENUM('Camera', 'Manual') NOT NULL DEFAULT 'Camera',
    result ENUM('CHECKED_IN', 'ALREADY_CHECKED_IN', 'INVALID_TICKET', 'EVENT_MISMATCH', 'CANCELLED', 'NOT_CONFIRMED', 'NOT_ASSIGNED') NOT NULL,
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
