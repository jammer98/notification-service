CREATE TYPE notification_channel AS ENUM ('in_app', 'email');
CREATE TYPE delivery_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  key_prefix VARCHAR(12) NOT NULL,
  key_hash CHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_key_id INTEGER NOT NULL REFERENCES api_keys(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  idempotency_key VARCHAR(100),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notifications_data_is_object CHECK (jsonb_typeof(data) = 'object'),
  CONSTRAINT notifications_idempotency_unique UNIQUE (api_key_id, idempotency_key)
);

CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  status delivery_status NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (notification_id, channel)
);

CREATE TABLE notification_preferences (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  channel notification_channel NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (user_id, type, channel)
);

-- Inbox listing: "my notifications, newest first"
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Unread badge: a partial index that only contains unread rows, so it stays tiny
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;