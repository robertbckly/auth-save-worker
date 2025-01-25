import { isValidSessionToken } from './is-valid-session-token';

export const throwOnInvalidSessionToken = (sessionToken: string) => {
  if (!isValidSessionToken(sessionToken)) {
    throw Error();
  }
};
