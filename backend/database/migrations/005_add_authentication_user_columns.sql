-- Authentication user fields previously created only by optional local setup scripts.
-- Every operation is additive and safe when some or all fields already exist.
SET @username_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'username'
);
SET @username_sql := IF(
  @username_exists = 0,
  'ALTER TABLE users ADD COLUMN username VARCHAR(100) NULL AFTER person_id',
  'SELECT 1'
);
PREPARE username_statement FROM @username_sql;
EXECUTE username_statement;
DEALLOCATE PREPARE username_statement;

SET @username_index_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'uq_users_username'
);
SET @username_index_sql := IF(
  @username_index_exists = 0,
  'CREATE UNIQUE INDEX uq_users_username ON users(username)',
  'SELECT 1'
);
PREPARE username_index_statement FROM @username_index_sql;
EXECUTE username_index_statement;
DEALLOCATE PREPARE username_index_statement;

SET @failed_login_attempts_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'failed_login_attempts'
);
SET @failed_login_attempts_sql := IF(
  @failed_login_attempts_exists = 0,
  'ALTER TABLE users ADD COLUMN failed_login_attempts INT UNSIGNED NOT NULL DEFAULT 0 AFTER password_hash',
  'SELECT 1'
);
PREPARE failed_login_attempts_statement FROM @failed_login_attempts_sql;
EXECUTE failed_login_attempts_statement;
DEALLOCATE PREPARE failed_login_attempts_statement;

SET @locked_at_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'locked_at'
);
SET @locked_at_sql := IF(
  @locked_at_exists = 0,
  'ALTER TABLE users ADD COLUMN locked_at DATETIME NULL DEFAULT NULL AFTER failed_login_attempts',
  'SELECT 1'
);
PREPARE locked_at_statement FROM @locked_at_sql;
EXECUTE locked_at_statement;
DEALLOCATE PREPARE locked_at_statement;

SET @welcome_email_sent_at_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'welcome_email_sent_at'
);
SET @welcome_email_sent_at_sql := IF(
  @welcome_email_sent_at_exists = 0,
  'ALTER TABLE users ADD COLUMN welcome_email_sent_at DATETIME NULL DEFAULT NULL AFTER last_active_at',
  'SELECT 1'
);
PREPARE welcome_email_sent_at_statement FROM @welcome_email_sent_at_sql;
EXECUTE welcome_email_sent_at_statement;
DEALLOCATE PREPARE welcome_email_sent_at_statement;
