CREATE TABLE IF NOT EXISTS event_discussions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id BIGINT UNSIGNED NOT NULL,
  status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Closed',
  opened_by_user_id BIGINT UNSIGNED NULL,
  opened_at DATETIME NULL,
  closed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_event_discussions_event UNIQUE (event_id),
  CONSTRAINT fk_event_discussions_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_event_discussions_opened_by FOREIGN KEY (opened_by_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_event_discussions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS discussion_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  discussion_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_discussion_messages_discussion FOREIGN KEY (discussion_id) REFERENCES event_discussions (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_discussion_messages_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_discussion_messages_poll (discussion_id, id),
  INDEX idx_discussion_messages_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS discussion_typing (
  discussion_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  last_typed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (discussion_id, user_id),
  CONSTRAINT fk_discussion_typing_discussion FOREIGN KEY (discussion_id) REFERENCES event_discussions (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_discussion_typing_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_discussion_typing_expiry (last_typed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS discussion_participant_blocks (
  event_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  removed_by_user_id BIGINT UNSIGNED NOT NULL,
  removed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id, user_id),
  CONSTRAINT fk_discussion_blocks_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_discussion_blocks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_discussion_blocks_removed_by FOREIGN KEY (removed_by_user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_discussion_blocks_removed_by (removed_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
