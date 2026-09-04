-- Add secure ticket tokens without disturbing existing registrations.
SET @ticket_column_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'ticket_token'
);
SET @ticket_column_sql := IF(
  @ticket_column_exists = 0,
  'ALTER TABLE registrations ADD COLUMN ticket_token CHAR(64) NULL DEFAULT NULL AFTER reference_code',
  'SELECT 1'
);
PREPARE ticket_column_statement FROM @ticket_column_sql;
EXECUTE ticket_column_statement;
DEALLOCATE PREPARE ticket_column_statement;

SET @ticket_index_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations' AND INDEX_NAME = 'uq_registrations_ticket_token'
);
SET @ticket_index_sql := IF(
  @ticket_index_exists = 0,
  'CREATE UNIQUE INDEX uq_registrations_ticket_token ON registrations(ticket_token)',
  'SELECT 1'
);
PREPARE ticket_index_statement FROM @ticket_index_sql;
EXECUTE ticket_index_statement;
DEALLOCATE PREPARE ticket_index_statement;

UPDATE registrations
SET ticket_token = REPLACE(CONCAT(UUID(), UUID()), '-', '')
WHERE ticket_token IS NULL;

ALTER TABLE registrations MODIFY COLUMN ticket_token CHAR(64) NOT NULL;
