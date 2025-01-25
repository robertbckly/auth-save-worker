import { parse } from 'cookie';
import { SESSION_COOKIE_KEY } from '../common/constants/config';
import { findSessionByToken } from '../data/db/find-session-by-token';
import type { Session } from '../common/types/session';
import { killSession } from './kill-session';

type Params = {
  request: Request;
  env: Env;
};

export const authenticateSession = async ({ request, env }: Params): Promise<Session> => {
  const currentUserAgent = request.headers.get('user-agent');
  const cookies = parse(request.headers.get('Cookie') || '');
  const sessionToken = cookies[SESSION_COOKIE_KEY];

  if (!sessionToken) {
    throw Error();
  }

  const session = await findSessionByToken({ env, sessionToken });

  if (!session) {
    throw Error();
  }

  if (session.UserAgent !== currentUserAgent) {
    killSession({ env, identifier: sessionToken });
    throw Error();
  }

  // Successfully authenticated session
  return session;
};
