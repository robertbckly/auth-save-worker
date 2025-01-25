import { SESSION_TOKEN_BYTES } from '../common/constants/config';

export const isValidSessionToken = (sessionToken: string): boolean => {
  // Length check: hex-based token must have x2 chars per byte
  if (sessionToken.length !== SESSION_TOKEN_BYTES * 2) {
    return false;
  }

  // Zero check: token can't equal zero, as could be assumed to be a test token
  if (Number(sessionToken) === 0) {
    return false;
  }

  return true;
};
