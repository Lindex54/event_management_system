-- Authentication queries require these account lockout fields. They previously
-- existed only when the optional local auth-security setup script was run.
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
