import { parse } from 'cookie';
import { SESSION_COOKIE_KEY } from '../common/constants/config';
import { findSessionById } from '../data/db/find-session-by-id';
import type { Session } from '../common/types/session';

type Params = {
  request: Request;
  env: Env;
};

export const authenticateSession = async ({ request, env }: Params): Promise<Session> => {
  const cookies = parse(request.headers.get('Cookie') || '');
  const sessionId = cookies[SESSION_COOKIE_KEY];

  if (!sessionId) {
    throw Error();
  }

  const session = await findSessionById({ env, sessionId });
  console.log(session);
  if (!session) {
    throw Error();
  }

  // Successfully authenticated session
  return session;
};
