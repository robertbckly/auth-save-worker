DROP TABLE IF EXISTS UserSessions;
CREATE TABLE UserSessions (
  PrivateId TEXT PRIMARY KEY NOT NULL UNIQUE,
  SessionToken TEXT NOT NULL UNIQUE,
  RefreshToken TEXT NOT NULL UNIQUE,
  RefreshExpiry INTEGER NOT NULL,
  IdleExpiry INTEGER NOT NULL,
  UserId TEXT NOT NULL,
  UserAgent TEXT NOT NULL,
  CHECK (LENGTH(SessionToken) >= 32), -- 128-bit minimum
  CHECK (LENGTH(RefreshToken) >= 32)  -- 128-bit minimum
);