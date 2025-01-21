import type { UserId } from './user-id';

export type SessionId = string;

export type Session = {
  PrivateId: SessionId;
  SessionId: SessionId;
  UserId: UserId;
  UserAgent: string;
};
