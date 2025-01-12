import type { Session } from '../types/session';

export const isSession = (object: object): object is Session =>
  ('UserId' satisfies keyof Session) in object &&
  typeof object.UserId === 'string' &&
  ('SessionId' satisfies keyof Session) in object &&
  typeof object.SessionId === 'string';
