import { parse } from 'cookie';
import { CSRF_COOKIE_KEY, CSRF_HEADER, SESSION_COOKIE_KEY } from './common/constants/config';
import { PROVIDERS } from './common/constants/providers';
import { verifyCsrfToken } from './common/utils/csrf/verify-csrf-token';
import { SecureResponse } from './common/utils/secure-response';
import { handleCreateSession } from './handlers/handle-create-session';
import { handleReadSessions } from './handlers/handle-read-sessions';
import { handleReadWriteObject } from './handlers/handle-read-write-object';
import { killSession } from './session/kill-session';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Reject anything but HTTPS
    if (url.protocol !== 'https:') {
      return SecureResponse('HTTPS required', { status: 403 });
    }

    // Route any pre-session authentication routes
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
      await verifyCsrfToken({
        env,
        sessionId,
        tokenFromBody: csrfTokenHeader,
        tokenFromCookie: csrfTokenCookie,
      });
    } catch {
      // Kill session on CSRF failure
      // (causes CSRF failure on subsequent use)
      if (sessionId) {
        await killSession({ env, sessionId });
      }
      return SecureResponse('Forbidden', { status: 403 });
    }

    // Route request (authentication handled within)
    switch (url.pathname) {
      case '/':
        return await handleReadWriteObject(request, env);
      case '/sessions':
        return await handleReadSessions({ request, env });
      default:
        return SecureResponse('Not found', { status: 404 });
    }
  },
} satisfies ExportedHandler<Env>;
