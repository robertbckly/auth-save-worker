import { isValidUniqueToken } from './is-valid-session-token';

export const throwOnInvalidToken = (token: string) => {
  if (!isValidUniqueToken(token)) {
    throw Error('Throwing on invalid token');
  }
};
