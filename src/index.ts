import { parse } from 'cookie';
import { CSRF_COOKIE_KEY, CSRF_HEADER, REFRESH_SESSION_PATH } from './common/constants/config';
import { PROVIDERS } from './common/constants/providers';
import { SecureResponse } from './common/responses/secure-response';
import { verifyCsrfToken } from './common/utils/csrf/verify-csrf-token';
import { unauthorisedResponse } from './common/responses/unauthorised-response';
import { handleCreateSession } from './handlers/public/handle-create-session';
import { handlePrivateRefreshSession } from './handlers/private/handle-private-refresh-session';
import { handlePrivateReadSessions } from './handlers/private/handle-private-read-sessions';
import { handlePrivateReadWriteObject } from './handlers/private/handle-private-read-write-object';
import { authenticateSession } from './session/authenticate-session';
import { killSession } from './session/kill-session';
import type { UserId } from './common/types/user-id';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Reject anything but HTTPS
    if (url.protocol !== 'https:') {
      return new SecureResponse('HTTPS required', { status: 403 });
    }

    // Route any authentication requests
    // (CSRF protection included within)
    switch (url.pathname) {
      case REFRESH_SESSION_PATH:
        return handlePrivateRefreshSession({ env, request });
      case PROVIDERS.google.pathname:
        return await handleCreateSession({ env, request, incomingPathname: url.pathname });
    }

    // Authenticate session
    let userId: UserId;
    let privateSessionId: string;
    try {
      const session = await authenticateSession({ env, request });
      userId = session.UserId;
      privateSessionId = session.PrivateId;
    } catch {
      return unauthorisedResponse();
    }

    // Verify CSRF token
    const cookies = parse(request.headers.get('Cookie') || '');
    const csrfTokenCookie = cookies[CSRF_COOKIE_KEY];
    const csrfTokenHeader = request.headers.get(CSRF_HEADER);
    try {
      if (!csrfTokenCookie || !csrfTokenHeader) {
        throw Error();
      }
      const passedCsrfCheck: boolean = await verifyCsrfToken({
        env,
        privateSessionId,
        tokenFromBody: csrfTokenHeader,
        tokenFromCookie: csrfTokenCookie,
      });
      if (!passedCsrfCheck) {
        throw Error();
      }
    } catch {
      // Kill session on CSRF failure
      // (causes CSRF failure on subsequent use)
      await killSession({ env, identifier: privateSessionId });
      return new SecureResponse('Forbidden', { status: 403 });
    }

    // Route primary private API requests
    // (after successful session authentication & anti-CSRF above)
    switch (url.pathname) {
      case '/':
        return await handlePrivateReadWriteObject({ request, env, userId });
      case '/sessions':
        return await handlePrivateReadSessions({ request, env, userId });
      default:
        return new SecureResponse('Not found', { status: 404 });
    }
  },
} satisfies ExportedHandler<Env>;
