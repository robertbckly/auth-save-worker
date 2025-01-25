import {
  SESSION_COOKIE_KEY,
  UNKNOWN_USER_AGENT,
  CSRF_COOKIE_KEY,
  APP_URL,
} from '../../common/constants/config';
import { PROVIDERS } from '../../common/constants/providers';
import { methodNotAllowedResponse } from '../../common/responses/method-not-allowed-response';
import type { UserId } from '../../common/types/user-id';
import { createCsrfToken } from '../../common/utils/csrf/create-csrf-token';
import { SecureResponse } from '../../common/responses/secure-response';
import { createSession } from '../../data/db/create-session';
import { createSessionToken } from '../../session/create-session-token';
import { verifyGoogleJWT } from '../../verifiers/verify-google-jwt';

type Params = {
  incomingPathname: string;
  request: Request;
  env: Env;
};

// Considered "public" because this is used before a session has been established,
// i.e. the user hasn't been authenticated upon hitting this
export const handleCreateSession = async ({
  incomingPathname,
  request,
  env,
}: Params): Promise<Response> => {
  if (request.method !== 'POST') {
    return methodNotAllowedResponse();
  }

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
    return new SecureResponse('Failed to authenticate', { status: 400 });
  }

  // Create and store new session
  let privateId: string;
  let sessionToken: string;
  let csrfToken: string;
  try {
    privateId = await createSessionToken(env, 'private');
    sessionToken = await createSessionToken(env, 'public');
    csrfToken = await createCsrfToken({ env, privateSessionId: privateId });
    const userAgent = request.headers.get('user-agent') || UNKNOWN_USER_AGENT;
    await createSession({ env, privateId, sessionToken, userId, userAgent });
  } catch {
    return new SecureResponse('Failed to create session', { status: 500 });
  }

  // Redirect and set session & CSRF token cookies...
  // (IMPORTANT: session token needs to use `Secure; HttpOnly; SameSite=Strict`)

  // Create response
  const response = new SecureResponse(null, {
    status: 302,
    headers: { Location: APP_URL },
  });

  // Append session token cookie
  response.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE_KEY}=${sessionToken}; Secure; HttpOnly; SameSite=Strict`
  );

  // Append CSRF token cookie
  // (Note: purposefully *not* using `HttpOnly`, as client needs access)
  response.headers.append('Set-Cookie', `${CSRF_COOKIE_KEY}=${csrfToken}; Secure; SameSite=Strict`);

  return response;
};
