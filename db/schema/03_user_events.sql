-- Drop and recreate Users table (Example)

DROP TABLE IF EXISTS user_events CASCADE;
CREATE TABLE user_events (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  music_event_id INTEGER REFERENCES music_events(id) ON DELETE CASCADE
);
