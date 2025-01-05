import { SESSION_ID_BYTES } from '../constants/config';
import { findSessionID } from './find-session-id';

export const createSessionID = async (env: Env, _i: number = 0): Promise<string> => {
  // Limit to 8 attempts
  if (_i >= 8) {
    throw Error();
  }

  // Create hex ID using appropriate crypto method
  const array = new Uint8Array(SESSION_ID_BYTES);
  self.crypto.getRandomValues(array);
  const id = Array.from(array, (v) => v.toString(16).padStart(2, '0')).join('');

  // Length check: hex-based ID must have x2 chars per byte
  if (id.length !== SESSION_ID_BYTES * 2) {
    throw Error();
  }

  // Attempt again if collision found
  if (await findSessionID(env, id)) {
    return await createSessionID(env, _i + 1);
  } else {
    return id;
  }
};
