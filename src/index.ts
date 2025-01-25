import { parse } from 'cookie';
import { CSRF_COOKIE_KEY, CSRF_HEADER, SESSION_COOKIE_KEY } from './common/constants/config';
import { PROVIDERS } from './common/constants/providers';
import { verifyCsrfToken } from './common/utils/csrf/verify-csrf-token';
import { SecureResponse } from './common/utils/secure-response';
import { handleCreateSession } from './handlers/public/handle-create-session';
import { handlePrivateReadSessions } from './handlers/private/handle-private-read-sessions';
import { handlePrivateReadWriteObject } from './handlers/private/handle-private-read-write-object';
import { killSession } from './session/kill-session';
import type { UserId } from './common/types/user-id';
import { authenticateSession } from './session/authenticate-session';
import { handleUnauthorised } from './handlers/public/handle-unauthorised';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Reject anything but HTTPS
    if (url.protocol !== 'https:') {
      return SecureResponse('HTTPS required', { status: 403 });
    }

    // Route any public pre-session authentication requests
    // (login-CSRF protection included within)
    switch (url.pathname) {
      case PROVIDERS.google.pathname:
        return await handleCreateSession(url.pathname, request, env);
    }

    // Verify CSRF token
    const cookies = parse(request.headers.get('Cookie') || '');
    const sessionId = cookies[SESSION_COOKIE_KEY];
    const csrfTokenCookie = cookies[CSRF_COOKIE_KEY];
    const csrfTokenHeader = request.headers.get(CSRF_HEADER);
    try {
      if (!sessionId || !csrfTokenCookie || !csrfTokenHeader) {
        throw Error();
      }
      const passedCsrfCheck: boolean = await verifyCsrfToken({
        env,
        sessionId,
        tokenFromBody: csrfTokenHeader,
        tokenFromCookie: csrfTokenCookie,
      });
      if (!passedCsrfCheck) {
        throw Error();
      }
    } catch {
      // Kill session on CSRF failure
      // (causes CSRF failure on subsequent use)
      if (sessionId) {
        await killSession({ env, sessionId });
      }
      return SecureResponse('Forbidden', { status: 403 });
    }

    // Authenticate session
    let userId: UserId;
    try {
      userId = (await authenticateSession({ env, request })).UserId;
    } catch {
      return handleUnauthorised();
    }

    // Route any private requests
    // (after successful anti-CSRF & session authentication)
    switch (url.pathname) {
      case '/':
        return await handlePrivateReadWriteObject({ request, env, userId });
      case '/sessions':
        return await handlePrivateReadSessions({ request, env, userId });
      default:
        return SecureResponse('Not found', { status: 404 });
    }
  },
} satisfies ExportedHandler<Env>;
