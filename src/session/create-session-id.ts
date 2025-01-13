import { SESSION_ID_BYTES } from '../common/constants/config';
import type { SessionId } from '../common/types/session';
import { findSessionById } from '../data/db/find-session-by-id';
import { isValidSessionId } from './is-valid-session-id';

export const createSessionId = async (env: Env, _i: number = 0): Promise<SessionId> => {
  // Limit recursion depth
  if (_i >= 8) {
    throw Error();
  }

  // Create hex ID using appropriate crypto method
  const array = new Uint8Array(SESSION_ID_BYTES);
  crypto.getRandomValues(array);
  const sessionId = Array.from(array, (v) => v.toString(16).padStart(2, '0')).join('');

  // Attempt again if collision found or invalid (somehow)
  if ((await findSessionById({ env, sessionId })) || !isValidSessionId(sessionId)) {
    return await createSessionId(env, _i + 1);
  } else {
    return sessionId;
  }
};
