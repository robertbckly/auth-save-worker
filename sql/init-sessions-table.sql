DROP TABLE IF EXISTS UserSessions;
CREATE TABLE IF NOT EXISTS UserSessions (
  PrivateId TEXT PRIMARY KEY NOT NULL UNIQUE,
  SessionToken TEXT NOT NULL UNIQUE,
  RefreshToken TEXT NOT NULL UNIQUE,
  UserId TEXT NOT NULL,
  UserAgent TEXT NOT NULL,
  CHECK (LENGTH(SessionToken) >= 32), -- 128-bit minimum
  CHECK (LENGTH(RefreshToken) >= 32)  -- 128-bit minimum
);