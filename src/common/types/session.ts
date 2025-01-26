import type { UserId } from './user-id';

export type Session = {
  PrivateId: string;
  SessionToken: string;
  RefreshToken: string;
  RefreshExpiry: number;
  UserId: UserId;
  UserAgent: string;
};
