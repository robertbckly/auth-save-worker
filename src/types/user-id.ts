import type { PROVIDERS } from '../constants/providers';

export type UserID = `${(typeof PROVIDERS)[keyof typeof PROVIDERS]['prefix']}--${string}`;
