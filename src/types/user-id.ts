import type { PROVIDERS } from '../constants/providers';

export type UserId = `${(typeof PROVIDERS)[keyof typeof PROVIDERS]['prefix']}--${string}`;
