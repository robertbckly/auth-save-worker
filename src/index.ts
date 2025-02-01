import { CONTENT_TYPE, REFRESH_SESSION_PATH } from './common/constants/config';
import { PROVIDERS } from './common/constants/providers';
import { SecureResponse } from './common/responses/secure-response';
import { verifyCsrfToken } from './common/utils/csrf/verify-csrf-token';
import { unauthorisedResponse } from './common/responses/unauthorised-response';
import { handleCreateSession } from './handlers/public/handle-create-session';
import { handlePrivateRefreshSession } from './handlers/private/handle-private-refresh-session';
import { handlePrivateReadSessions } from './handlers/private/handle-private-read-sessions';
import { handlePrivateReadWriteObject } from './handlers/private/handle-private-read-write-object';
import { authenticateSessionToken } from './session/authenticate-session';
import { killSession } from './session/kill-session';
import { getProviderForRoute } from './common/utils/get-provider-for-route';
import { TRAILING_SLASH_REGEX } from './common/constants/regex';
import type { UserId } from './common/types/user-id';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const contentType = request.headers.get('Content-Type');

    // Treat path with trailing slash as same
    const path = url.pathname.replace(TRAILING_SLASH_REGEX, '');

    // Reject anything but HTTPS
    if (url.protocol !== 'https:') {
      return new SecureResponse('HTTPS required', { status: 403 });
    }

    // Reject simple request (but allow expected exception for provider, if applicable)
    const provider = getProviderForRoute(path);
    if (contentType !== CONTENT_TYPE && contentType !== provider?.expectedContentType) {
      return new SecureResponse('Content type not allowed', { status: 415 });
    }

    // Route session create/refresh request (CSRF protection included within)
    switch (path) {
      case PROVIDERS.google.pathname:
        return await handleCreateSession({ env, request, incomingPathname: url.pathname });
      case REFRESH_SESSION_PATH:
        return await handlePrivateRefreshSession({ env, request });
    }

    // Authenticate session
    let userId: UserId;
    let privateSessionId: string;
    try {
      const session = await authenticateSessionToken({ env, request, type: 'SessionToken' });
      userId = session.UserId;
      privateSessionId = session.PrivateId;
    } catch {
      return unauthorisedResponse();
    }

    // Verify CSRF token
    try {
      const passedCsrfCheck: boolean = await verifyCsrfToken({ request, env, privateSessionId });
      if (!passedCsrfCheck) throw Error();
    } catch {
      // Kill session on CSRF failure
      await killSession({ env, token: privateSessionId });
      return new SecureResponse('Forbidden', { status: 403 });
    }

    // Route private, session-requiring request
    switch (path) {
      case '/':
        return await handlePrivateReadWriteObject({ request, env, userId });
      case '/sessions':
        return await handlePrivateReadSessions({ request, env, userId });
      default:
        return new SecureResponse('Not found', { status: 404 });
    }
  },
} satisfies ExportedHandler<Env>;
