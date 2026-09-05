-- Additive catch-up for installations where migrations 001-004 may not have run.
-- 001 is a baseline marker and has no schema changes to reproduce.

-- 002: secure registration ticket tokens.
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

UPDATE registrations
SET ticket_token = REPLACE(CONCAT(UUID(), UUID()), '-', '')
WHERE ticket_token IS NULL;

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

ALTER TABLE registrations MODIFY COLUMN ticket_token CHAR(64) NOT NULL;

-- 003: event discussion rooms and messages.
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

-- 004: presentation data. Each row is inserted only when absent.
INSERT INTO venues(name,address,capacity,description,contact,status)
SELECT 'Kampala Serena Conference Centre','Kintu Road, Kampala',600,'Modern conference venue in central Kampala.','events@evently.ug','Available'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name='Kampala Serena Conference Centre' AND deleted_at IS NULL);

INSERT INTO venues(name,address,capacity,description,contact,status)
SELECT 'Motiv Innovation Hub','Old Port Bell Road, Kampala',220,'Collaborative venue for workshops and creative technology events.','events@evently.ug','Available'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name='Motiv Innovation Hub' AND deleted_at IS NULL);

INSERT INTO venues(name,address,capacity,description,contact,status)
SELECT 'Skyz Hotel Naguru','Plot 1 Water Lane, Naguru, Kampala',300,'Rooftop business and networking venue.','events@evently.ug','Available'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name='Skyz Hotel Naguru' AND deleted_at IS NULL);

INSERT INTO events(organizer_id,venue_id,name,slug,theme,description,event_date,start_time,end_time,timezone,capacity,status,image_url,image_alt,is_featured,registration_closes_at)
SELECT o.id,v.id,'East Africa Technology Leadership Summit','east-africa-technology-leadership-summit','Building responsible digital innovation','A practical gathering of technology leaders, founders and policy makers discussing AI, digital infrastructure, cybersecurity and the future of work in East Africa.',DATE_ADD(CURDATE(),INTERVAL 7 DAY),'09:00:00','17:00:00','Africa/Kampala',500,'Upcoming','https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85','Audience attending a technology leadership conference',TRUE,DATE_ADD(CURDATE(),INTERVAL 6 DAY)
FROM organizers o JOIN venues v ON v.name='Kampala Serena Conference Centre' AND v.deleted_at IS NULL WHERE o.status='Active' AND o.deleted_at IS NULL AND NOT EXISTS(SELECT 1 FROM events WHERE slug='east-africa-technology-leadership-summit') LIMIT 1;

INSERT INTO events(organizer_id,venue_id,name,slug,theme,description,event_date,start_time,end_time,timezone,capacity,status,image_url,image_alt,is_featured,registration_closes_at)
SELECT o.id,v.id,'Product Design and Innovation Workshop','product-design-innovation-workshop','From customer insight to working prototype','A hands-on workshop for product managers, designers and developers. Participants will work through research, prototyping, testing and product launch planning.',DATE_ADD(CURDATE(),INTERVAL 12 DAY),'10:00:00','16:30:00','Africa/Kampala',180,'Upcoming','https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85','Creative professionals collaborating in a workshop',TRUE,DATE_ADD(CURDATE(),INTERVAL 11 DAY)
FROM organizers o JOIN venues v ON v.name='Motiv Innovation Hub' AND v.deleted_at IS NULL WHERE o.status='Active' AND o.deleted_at IS NULL AND NOT EXISTS(SELECT 1 FROM events WHERE slug='product-design-innovation-workshop') LIMIT 1;

INSERT INTO events(organizer_id,venue_id,name,slug,theme,description,event_date,start_time,end_time,timezone,capacity,status,image_url,image_alt,is_featured,registration_closes_at)
SELECT o.id,v.id,'Founders and Investors Networking Night','founders-investors-networking-night','Capital, partnerships and meaningful connections','An evening connecting startup founders, investors, ecosystem builders and corporate innovation teams through curated introductions and practical founder conversations.',DATE_ADD(CURDATE(),INTERVAL 18 DAY),'18:00:00','21:00:00','Africa/Kampala',250,'Upcoming','https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=85','Professionals networking at an evening event',TRUE,DATE_ADD(CURDATE(),INTERVAL 17 DAY)
FROM organizers o JOIN venues v ON v.name='Skyz Hotel Naguru' AND v.deleted_at IS NULL WHERE o.status='Active' AND o.deleted_at IS NULL AND NOT EXISTS(SELECT 1 FROM events WHERE slug='founders-investors-networking-night') LIMIT 1;

INSERT INTO events(organizer_id,venue_id,name,slug,theme,description,event_date,start_time,end_time,timezone,capacity,status,image_url,image_alt,is_featured,registration_closes_at)
SELECT o.id,v.id,'Digital Marketing Growth Masterclass','digital-marketing-growth-masterclass','Measurable growth for modern brands','Learn campaign strategy, content systems, paid acquisition, analytics and customer retention from experienced growth practitioners.',DATE_ADD(CURDATE(),INTERVAL 22 DAY),'09:00:00','15:00:00','Africa/Kampala',160,'Upcoming','https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=85','Attendees participating in a learning session',FALSE,DATE_ADD(CURDATE(),INTERVAL 21 DAY)
FROM organizers o JOIN venues v ON v.name='Motiv Innovation Hub' AND v.deleted_at IS NULL WHERE o.status='Active' AND o.deleted_at IS NULL AND NOT EXISTS(SELECT 1 FROM events WHERE slug='digital-marketing-growth-masterclass') LIMIT 1;

INSERT INTO events(organizer_id,venue_id,name,slug,theme,description,event_date,start_time,end_time,timezone,capacity,status,image_url,image_alt,is_featured,registration_closes_at)
SELECT o.id,v.id,'Social Impact and Sustainability Forum','social-impact-sustainability-forum','Local solutions with lasting impact','Leaders from civil society, business and government share practical approaches to climate resilience, inclusive growth and sustainable community investment.',DATE_ADD(CURDATE(),INTERVAL 28 DAY),'08:30:00','16:00:00','Africa/Kampala',400,'Upcoming','https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85','Team discussing collaboration and social impact',FALSE,DATE_ADD(CURDATE(),INTERVAL 27 DAY)
FROM organizers o JOIN venues v ON v.name='Kampala Serena Conference Centre' AND v.deleted_at IS NULL WHERE o.status='Active' AND o.deleted_at IS NULL AND NOT EXISTS(SELECT 1 FROM events WHERE slug='social-impact-sustainability-forum') LIMIT 1;

INSERT INTO events(organizer_id,venue_id,name,slug,theme,description,event_date,start_time,end_time,timezone,capacity,status,image_url,image_alt,is_featured,registration_closes_at)
SELECT o.id,v.id,'Creative Economy Business Talks','creative-economy-business-talks','Turning creative talent into sustainable business','A focused forum for artists, producers, designers and creative entrepreneurs covering intellectual property, pricing, distribution and investment readiness.',DATE_ADD(CURDATE(),INTERVAL 34 DAY),'14:00:00','18:00:00','Africa/Kampala',200,'Upcoming','https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85','Guests gathering at a creative business event',FALSE,DATE_ADD(CURDATE(),INTERVAL 33 DAY)
FROM organizers o JOIN venues v ON v.name='Motiv Innovation Hub' AND v.deleted_at IS NULL WHERE o.status='Active' AND o.deleted_at IS NULL AND NOT EXISTS(SELECT 1 FROM events WHERE slug='creative-economy-business-talks') LIMIT 1;
