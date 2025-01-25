import type { Session } from '../types/session';

export const isSession = (object: object): object is Session =>
  ('PrivateId' satisfies keyof Session) in object &&
  typeof object.PrivateId === 'string' &&
  ('SessionToken' satisfies keyof Session) in object &&
  typeof object.SessionToken === 'string' &&
  ('RefreshToken' satisfies keyof Session) in object &&
  typeof object.RefreshToken === 'string' &&
  ('UserId' satisfies keyof Session) in object &&
  typeof object.UserId === 'string' &&
  ('UserAgent' satisfies keyof Session) in object &&
  typeof object.UserAgent === 'string';
