import { SESSION_ID_BYTES } from '../common/constants/config';
import type { SessionId } from '../common/types/session';
import { findSessionById } from '../data/db/find-session-by-id';
import { findSessionPrivateId } from '../data/db/find-session-private-id';
import { isValidSessionId } from './is-valid-session-id';

type Type = 'public' | 'private';

export const createSessionId = async (env: Env, type: Type, _i: number = 0): Promise<SessionId> => {
  // Limit recursion depth
  if (_i >= 8) {
    throw Error();
  }

  // Create hex ID using appropriate crypto method
  const array = new Uint8Array(SESSION_ID_BYTES);
  crypto.getRandomValues(array);
  const sessionId = Array.from(array, (v) => v.toString(16).padStart(2, '0')).join('');

  // Query for collision based on `type`
  let collision = false;
  if (type === 'private') {
    collision = !!(await findSessionPrivateId({ env, privateId: sessionId }));
  } else {
    collision = !!(await findSessionById({ env, sessionId }));
  }

  // Attempt again if collision found or invalid (somehow)
  if (collision || !isValidSessionId(sessionId)) {
    return await createSessionId(env, type, _i + 1);
  } else {
    return sessionId;
  }
};
