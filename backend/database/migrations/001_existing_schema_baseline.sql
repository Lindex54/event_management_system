-- Baseline marker for installations that already use the Evently core schema.
-- The core tables predate automated migrations and are intentionally not
-- recreated here. New installations must load database/event_management_system.sql
-- once before running the numbered migrations.
SELECT 1;
