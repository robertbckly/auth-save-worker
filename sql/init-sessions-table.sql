DROP TABLE IF EXISTS UserSessions;
CREATE TABLE IF NOT EXISTS UserSessions (
  SessionID TEXT PRIMARY KEY, 
  UserID TEXT,
  CHECK (LENGTH(SessionID) >= 32) -- 128-bit minimum
);