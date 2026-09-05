-- Hostinger application files may be replaced between deployments. Store new
-- event images and agenda documents in MySQL so their URLs remain valid after
-- a restart or redeploy. Existing event rows and legacy URLs are unchanged.
CREATE TABLE IF NOT EXISTS uploaded_files (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    storage_key CHAR(48) NOT NULL,
    category ENUM('EventImage', 'EventAgenda') NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(120) NOT NULL,
    file_size INT UNSIGNED NOT NULL,
    file_data MEDIUMBLOB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_uploaded_files_storage_key UNIQUE (storage_key),
    INDEX idx_uploaded_files_category_created (category, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
