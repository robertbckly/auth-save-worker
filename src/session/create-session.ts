import { REFRESH_COOKIE_MAX_AGE, UNKNOWN_USER_AGENT } from '../common/constants/config';
import type { UserId } from '../common/types/user-id';
import { createCsrfToken } from '../common/utils/csrf/create-csrf-token';
import { dbCreateSession } from '../data/db/db-create-session';
import { createSessionToken } from './token/create-session-token';

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
  refreshExpiry,
}: Params): Promise<Return> => {
  const privateId = await createSessionToken(env, 'private');
  const sessionToken = await createSessionToken(env, 'public');
  const refreshToken = await createSessionToken(env, 'public');
  const csrfToken = await createCsrfToken({ env, privateSessionId: privateId });
  const userAgent = request.headers.get('user-agent') || UNKNOWN_USER_AGENT;

  let refreshExpiryTime = refreshExpiry;
  if (!refreshExpiryTime) {
    const now = new Date();
    refreshExpiryTime = now.setSeconds(now.getSeconds() + REFRESH_COOKIE_MAX_AGE);
  }

  // refresh expiry = carried from old session = starts at 30d from initial creation

  await dbCreateSession({
    env,
    privateId,
    sessionToken,
    refreshToken,
    refreshExpiry: refreshExpiryTime,
    userId,
    userAgent,
  });

  return {
    sessionToken,
    refreshToken,
    csrfToken,
  };
};
