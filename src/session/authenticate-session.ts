import { parse } from 'cookie';
import { IDLE_TIMEOUT, REFRESH_COOKIE_KEY, SESSION_COOKIE_KEY } from '../common/constants/config';
import { findSessionByToken } from '../data/db/find-session-by-token';
import { killSession } from './kill-session';
import { updateSessionIdleExpiry } from '../data/db/update-session-idle-expiry';
import type { Session, TokenField } from '../common/types/session';

type Params = {
  request: Request;
  env: Env;
  type: Exclude<TokenField, 'PrivateId'>;
};

export const authenticateSessionToken = async ({
  request,
  env,
  type,
}: Params): Promise<Session> => {
  const currentUserAgent = request.headers.get('user-agent');
  const cookies = parse(request.headers.get('Cookie') || '');
  const token = type === 'SessionToken' ? cookies[SESSION_COOKIE_KEY] : cookies[REFRESH_COOKIE_KEY];

  if (!token) {
    throw Error(`No ${type} token`);
  }

  const session = await findSessionByToken({ env, tokenField: type, token });

  if (!session) {
    throw Error('Session not found');
  }

  if (session.UserAgent !== currentUserAgent) {
    killSession({ env, token });
    throw Error('User agent changed');
  }

  if (Date.now() > session.IdleExpiry) {
    killSession({ env, token });
    throw Error('Idle expiry exceeded');
  }

  // Success...

  // Bump idle timeout
  const idleExpiry = new Date();
  idleExpiry.setSeconds(idleExpiry.getSeconds() + IDLE_TIMEOUT);
  await updateSessionIdleExpiry({
    env,
    token,
    idleExpiry: idleExpiry.valueOf(),
  });

  // Return authenticated session
  return session;
};
