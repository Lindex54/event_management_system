-- Admin-invitation onboarding + event agenda module database patch
-- Safe structural additions only: no DROP, TRUNCATE, or data deletion.
-- MariaDB 10.4+ supports ADD COLUMN/CREATE TABLE IF NOT EXISTS, so this file is safely re-runnable.
USE event_management_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Single-use, hashed setup tokens issued when an admin creates a System Administrator,
-- Event Organizer, or Event Staff account. The plaintext token is only ever emailed once;
-- only its SHA-256 hash is stored here.
CREATE TABLE IF NOT EXISTS account_setup_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL,
    created_by_user_id BIGINT UNSIGNED NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_account_setup_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_account_setup_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_account_setup_tokens_created_by FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_account_setup_tokens_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tracks whether the one-time "Welcome" email has already been sent, so it fires only
-- after a user's first successful login and never again.
ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_email_sent_at DATETIME NULL DEFAULT NULL AFTER last_active_at;

-- Event agenda: an organizer/admin picks EITHER an uploaded file (PDF/JPG/PNG/WebP) OR an
-- external URL, never both. agenda_file_type stores the uploaded file's MIME type so the
-- public event page knows whether to preview it inline (image) or offer a download (PDF).
ALTER TABLE events ADD COLUMN IF NOT EXISTS agenda_type ENUM('None','File','Url') NOT NULL DEFAULT 'None' AFTER registration_closes_at;
ALTER TABLE events ADD COLUMN IF NOT EXISTS agenda_url VARCHAR(2048) NULL DEFAULT NULL AFTER agenda_type;
ALTER TABLE events ADD COLUMN IF NOT EXISTS agenda_file_name VARCHAR(255) NULL DEFAULT NULL AFTER agenda_url;
ALTER TABLE events ADD COLUMN IF NOT EXISTS agenda_file_type VARCHAR(120) NULL DEFAULT NULL AFTER agenda_file_name;
