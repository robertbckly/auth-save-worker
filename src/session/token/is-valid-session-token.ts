import { UNIQUE_TOKEN_BYTES } from '../../common/constants/config';

export const isValidUniqueToken = (token: string): boolean => {
  // Length check: hex-based token must have x2 chars per byte
  if (token.length !== UNIQUE_TOKEN_BYTES * 2) {
    return false;
  }

  // Zero check: token can't equal zero, as could be assumed to be a test token
  if (Number(token) === 0) {
    return false;
  }

  return true;
};
