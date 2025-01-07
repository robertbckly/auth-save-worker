import { SESSION_ID_BYTES } from '../constants/config';

export const isSessionIdValid = (sessionId: string): boolean => {
  // Length check: hex-based Id must have x2 chars per byte
  if (sessionId.length !== SESSION_ID_BYTES * 2) {
    return false;
  }

  return true;
};
