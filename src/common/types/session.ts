import type { UserId } from './user-id';

export type SessionId = string;

export type Session = {
  SessionId: SessionId;
  UserId: UserId;
  UserAgent: string;
};
