import { SESSION_TOKEN_BYTES } from '../../common/constants/config';
import { toPaddedHexString } from '../../common/utils/to-padded-hex-string';
import { findSessionByToken } from '../../data/db/find-session-by-token';
import { findSessionPrivateId } from '../../data/db/find-session-private-id';
import { isValidSessionToken } from './is-valid-session-token';

type Type = 'public' | 'private';

export const createSessionToken = async (env: Env, type: Type, _i: number = 0): Promise<string> => {
  // Limit recursion depth
  if (_i >= 8) {
    throw Error();
  }

  // Create hex token using appropriate crypto method
  const array = new Uint8Array(SESSION_TOKEN_BYTES);
  crypto.getRandomValues(array);
  const sessionToken = toPaddedHexString(array);

  // Query for collision based on `type`
  let collision = false;
  if (type === 'private') {
    collision = !!(await findSessionPrivateId({ env, privateId: sessionToken }));
  } else {
    collision = !!(await findSessionByToken({ env, sessionToken }));
  }

  // Attempt again if collision found or invalid (somehow)
  if (collision || !isValidSessionToken(sessionToken)) {
    return await createSessionToken(env, type, _i + 1);
  } else {
    return sessionToken;
  }
};
