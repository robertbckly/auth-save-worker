import { UNIQUE_TOKEN_BYTES } from '../../common/constants/config';
import { toPaddedHexString } from '../../common/utils/to-padded-hex-string';
import { findSessionByToken } from '../../data/db/find-session-by-token';
import { isValidUniqueToken } from './is-valid-session-token';
import type { TokenField } from '../../common/types/session';

type Params = {
  env: Env;
  type: TokenField;
  _i?: number;
};

export const createUniqueToken = async ({ env, type, _i = 0 }: Params): Promise<string> => {
  // Limit recursion depth
  if (_i >= 8) {
    throw Error();
  }

  // Create hex token using appropriate crypto method
  const array = new Uint8Array(UNIQUE_TOKEN_BYTES);
  crypto.getRandomValues(array);
  const token = toPaddedHexString(array);

  // Query for collision based on `type`
  const collision = !!(await findSessionByToken({ env, tokenField: type, token }));

  // Attempt again if collision found or invalid (somehow)
  if (collision || !isValidUniqueToken(token)) {
    return await createUniqueToken({ env, type, _i: _i + 1 });
  } else {
    return token;
  }
};
