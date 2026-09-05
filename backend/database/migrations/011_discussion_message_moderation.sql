-- Lets an admin or an event's organizer/co-organizer delete an individual discussion
-- message (soft delete, so the audit trail of who removed what is kept) without
-- needing a brand new table — this extends the existing discussion_messages table.
SET @discussion_message_deleted_at_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'discussion_messages' AND COLUMN_NAME = 'deleted_at'
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
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'discussion_messages' AND COLUMN_NAME = 'deleted_by_user_id'
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
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'discussion_messages' AND CONSTRAINT_NAME = 'fk_discussion_messages_deleted_by'
);
SET @discussion_message_deleted_by_fk_sql := IF(
    @discussion_message_deleted_by_fk_exists = 0,
    'ALTER TABLE discussion_messages ADD CONSTRAINT fk_discussion_messages_deleted_by FOREIGN KEY (deleted_by_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT 1'
);
PREPARE discussion_message_deleted_by_fk_statement FROM @discussion_message_deleted_by_fk_sql;
EXECUTE discussion_message_deleted_by_fk_statement;
DEALLOCATE PREPARE discussion_message_deleted_by_fk_statement;
