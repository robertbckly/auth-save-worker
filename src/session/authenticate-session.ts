import { parse } from 'cookie';
import { CSRF_COOKIE_KEY, CSRF_HEADER, SESSION_COOKIE_KEY } from '../common/constants/config';
import { findSessionById } from '../data/db/find-session-by-id';
import type { Session } from '../common/types/session';
import { killSession } from './kill-session';
import { verifyCsrfToken } from '../common/utils/csrf/verify-csrf-token';

type Params = {
  request: Request;
  env: Env;
};

export const authenticateSession = async ({ request, env }: Params): Promise<Session> => {
  const currentUserAgent = request.headers.get('user-agent');
  const cookies = parse(request.headers.get('Cookie') || '');
  const sessionId = cookies[SESSION_COOKIE_KEY];
  const csrfTokenCookie = cookies[CSRF_COOKIE_KEY];
  const csrfTokenHeader = request.headers.get(CSRF_HEADER);

  // TODO: move CSRF check somewhere else
  // can't be here e.g. if the request is an auth'd GET

  console.log(csrfTokenCookie, csrfTokenHeader);

  if (!sessionId || !csrfTokenCookie || !csrfTokenHeader) {
    throw Error();
  }

  console.log(
    verifyCsrfToken({
      env,
      sessionId,
      tokenFromBody: csrfTokenHeader,
      tokenFromCookie: csrfTokenCookie,
    })
  );

  const session = await findSessionById({ env, sessionId });

  if (!session) {
    throw Error();
  }

  if (session.UserAgent !== currentUserAgent) {
    killSession({ env, sessionId });
    throw Error();
  }

  // Successfully authenticated session
  return session;
};
