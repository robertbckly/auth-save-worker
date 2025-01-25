import { parse } from 'cookie';
import { SESSION_COOKIE_KEY } from '../common/constants/config';
import { findSessionById } from '../data/db/find-session-by-id';
import type { Session } from '../common/types/session';
import { killSession } from './kill-session';

type Params = {
  request: Request;
  env: Env;
};

export const authenticateSession = async ({ request, env }: Params): Promise<Session> => {
  const currentUserAgent = request.headers.get('user-agent');
  const cookies = parse(request.headers.get('Cookie') || '');
  const sessionId = cookies[SESSION_COOKIE_KEY];

  if (!sessionId) {
    throw Error();
  }

  const session = await findSessionById({ env, sessionId });

  if (!session) {
    throw Error();
  }

  if (session.UserAgent !== currentUserAgent) {
    killSession({ env, anySessionId: sessionId });
    throw Error();
  }

  // Successfully authenticated session
  return session;
};
