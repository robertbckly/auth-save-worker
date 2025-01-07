DROP TABLE IF EXISTS UserSessions;
CREATE TABLE IF NOT EXISTS UserSessions (
  SessionId TEXT PRIMARY KEY, 
  UserId TEXT,
  CHECK (LENGTH(SessionId) >= 32) -- 128-bit minimum
);