-- The co-organizer distinction on event_staff (assignment_role) was previously only
-- ever applied via an ad hoc setup script (backend/src/database/setup-event-staff-schema.ts)
-- and a mis-named migration file (007_disccusion_migration_fix, missing the .sql
-- extension so the migration runner has always silently skipped it). Discussion
-- access checks (co-organizer open/close/moderate rights) depend on this column,
-- so a fresh install running only the numbered migrations would be broken without
-- this. Re-added here, safely, as a no-op where it already exists.
SET @assignment_role_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'event_staff' AND COLUMN_NAME = 'assignment_role'
);
SET @assignment_role_sql := IF(
    @assignment_role_exists = 0,
    'ALTER TABLE event_staff ADD COLUMN assignment_role VARCHAR(40) NOT NULL DEFAULT ''co_organizer'' AFTER user_id',
    'SELECT 1'
);
PREPARE assignment_role_statement FROM @assignment_role_sql;
EXECUTE assignment_role_statement;
DEALLOCATE PREPARE assignment_role_statement;
