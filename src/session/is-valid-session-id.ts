import { SESSION_ID_BYTES } from '../common/constants/config';

export const isValidSessionId = (sessionId: string): boolean => {
  // Length check: hex-based ID must have x2 chars per byte
  if (sessionId.length !== SESSION_ID_BYTES * 2) {
    return false;
  }

  // Zero check: ID can't be zero, as could be assumed to be a test ID
  if (Number(sessionId) === 0) {
    return false;
  }

  return true;
};
