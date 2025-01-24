import {
  SET_COOKIE_PATH,
  SESSION_COOKIE_KEY,
  UNKNOWN_USER_AGENT,
  CSRF_COOKIE_KEY,
} from '../common/constants/config';
import { PROVIDERS } from '../common/constants/providers';
import type { SessionId } from '../common/types/session';
import type { UserId } from '../common/types/user-id';
import { createCsrfToken } from '../common/utils/csrf/create-csrf-token';
import { SecureResponse } from '../common/utils/secure-response';
import { createSession } from '../data/db/create-session';
import { createSessionId } from '../session/create-session-id';

import { verifyGoogleJWT } from '../verifiers/verify-google-jwt';
import { handleDisallowedMethod } from './handle-disallowed-method';

export const handleCreateSession = async (
  incomingPathname: string,
  request: Request,
  env: Env
): Promise<Response> => {
  handleDisallowedMethod({
    method: request.method,
    allowed: ['GET'],
  });

  // Verify JWT ID-token depending on path & extract user's ID
  // NOTE: ensure verifiers involve CSRF protection
  let userId: UserId;
  let passedCsrfCheck = false;
  try {
    switch (incomingPathname) {
      case PROVIDERS.google.pathname: {
        const result = await verifyGoogleJWT(request);
        userId = result.userId;
        passedCsrfCheck = result.passedCsrfCheck;
        break;
      }
      default:
        throw Error();
    }

    // Fail safe
    if (!passedCsrfCheck) {
      throw Error();
    }
  } catch {
    return SecureResponse('Failed to authenticate', { status: 400 });
  }

  // Create and store new session
  let privateId: SessionId;
  let sessionId: SessionId;
  let csrfToken: string;
  try {
    privateId = await createSessionId(env, 'private');
    sessionId = await createSessionId(env, 'public');
    csrfToken = await createCsrfToken({ env, privateSessionId: privateId });
    const userAgent = request.headers.get('user-agent') || UNKNOWN_USER_AGENT;
    await createSession({ env, privateId, sessionId, userId, userAgent });
  } catch {
    return SecureResponse('Failed to create session', { status: 500 });
  }

  // Redirect to same origin to set session ID & CSRF token cookies...
  // (IMPORTANT: session token needs to use `Secure; HttpOnly; SameSite=Strict`)

  // Create response
  const response = SecureResponse(null, {
    status: 302,
    headers: { Location: SET_COOKIE_PATH },
  });

  // Append session ID cookie
  response.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE_KEY}=${sessionId}; Secure; HttpOnly; SameSite=Strict`
  );

  // Append CSRF token cookie
  // (Note: purposefully *not* using `HttpOnly`, as client needs access)
  response.headers.append('Set-Cookie', `${CSRF_COOKIE_KEY}=${csrfToken}; Secure; SameSite=Strict`);

  return response;
};
