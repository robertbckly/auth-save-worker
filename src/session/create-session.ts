import {
  IDLE_TIMEOUT,
  REFRESH_COOKIE_MAX_AGE,
  UNKNOWN_USER_AGENT,
} from '../common/constants/config';
import type { UserId } from '../common/types/user-id';
import { createCsrfToken } from '../common/utils/csrf/create-csrf-token';
import { createSessionInDb } from '../data/db/create-session-in-db';
import { createUniqueToken } from './token/create-unique-token';

type Params = {
  request: Request;
  env: Env;
  userId: UserId;
  refreshExpiry?: number;
};

type Return = {
  sessionToken: string;
  refreshToken: string;
  csrfToken: string;
};

export const createSession = async ({
  request,
  env,
  userId,
  refreshExpiry: refreshExpiryInput,
}: Params): Promise<Return> => {
  const privateId = await createUniqueToken({ env, type: 'PrivateId' });
  const sessionToken = await createUniqueToken({ env, type: 'SessionToken' });
  const refreshToken = await createUniqueToken({ env, type: 'RefreshToken' });
  const csrfToken = await createCsrfToken({ env, privateSessionId: privateId });
  const userAgent = request.headers.get('user-agent') || UNKNOWN_USER_AGENT;

  const refreshExpiry = refreshExpiryInput ? new Date(refreshExpiryInput) : new Date();
  if (!refreshExpiryInput) {
    refreshExpiry.setSeconds(refreshExpiry.getSeconds() + REFRESH_COOKIE_MAX_AGE);
  }

  const idleExpiry = new Date();
  idleExpiry.setSeconds(idleExpiry.getSeconds() + IDLE_TIMEOUT);

  await createSessionInDb({
    env,
    privateId,
    sessionToken,
    refreshToken,
    refreshExpiry: refreshExpiry.valueOf(),
    idleExpiry: idleExpiry.valueOf(),
    userId,
    userAgent,
  });

  return {
    sessionToken,
    refreshToken,
    csrfToken,
  };
};
