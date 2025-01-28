import { parse } from 'cookie';
import { REFRESH_COOKIE_KEY, SESSION_COOKIE_KEY } from '../common/constants/config';
import { findSessionByToken } from '../data/db/find-session-by-token';
import type { Session } from '../common/types/session';
import { killSession } from './kill-session';
import { findSessionByRefreshToken } from '../data/db/find-session-by-refresh-token';

type Params = {
  request: Request;
  env: Env;
  type?: 'session' | 'refresh';
};

export const authenticateSessionToken = async ({
  request,
  env,
  type = 'session',
}: Params): Promise<Session> => {
  const currentUserAgent = request.headers.get('user-agent');
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = type === 'session' ? cookies[SESSION_COOKIE_KEY] : cookies[REFRESH_COOKIE_KEY];

  if (!token) {
    throw Error(`No ${type} token`);
  }

  const session =
    type === 'session'
      ? await findSessionByToken({ env, sessionToken: token })
      : await findSessionByRefreshToken({ env, refreshToken: token });

  if (!session) {
    throw Error('Session not found');
  }

  if (session.UserAgent !== currentUserAgent) {
    killSession({ env, identifier: token });
    throw Error('User agent changed');
  }

  if (Date.now() > session.IdleExpiry) {
    killSession({ env, identifier: token });
    throw Error('Idle expiry exceeded');
  }

  // Successfully authenticated session
  return session;
};
