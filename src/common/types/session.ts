import type { UserId } from './user-id';

// Manually keep this in sync with SQL
export type Session = {
  PrivateId: string;
  SessionToken: string;
  RefreshToken: string;
  RefreshExpiry: number;
  IdleExpiry: number;
  UserId: UserId;
  UserAgent: string;
};

export type TokenField = keyof Pick<Session, 'PrivateId' | 'SessionToken' | 'RefreshToken'>;
