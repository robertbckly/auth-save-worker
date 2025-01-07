import { SET_COOKIE_PATH, SESSION_COOKIE } from '../constants/config';
import { PROVIDERS } from '../constants/providers';
import { createSession } from '../data/db/create-session';
import type { UserId } from '../types/user-id';
import { createSessionId } from '../utils/create-session-id';
import { verifyGoogleJWT } from '../verifiers/verify-google-jwt';

export const handleCreateSession = async (
  incomingPathname: string,
  request: Request,
  env: Env
): Promise<Response> => {
  // Reject unexpected methods
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Verify JWT ID-token depending on path,
  // and extract user's ID
  let userId: UserId;
  try {
    switch (incomingPathname) {
      case PROVIDERS.google.pathname:
        userId = (await verifyGoogleJWT(request)).userId;
        break;
      default:
        throw Error();
    }
  } catch {
    return new Response('Failed to authenticate', { status: 400 });
  }

  // Create and store new session
  let sessionId: string;
  try {
    sessionId = await createSessionId(env);
    await createSession({ env, sessionId, userId });
  } catch {
    return new Response('Failed to create session', { status: 500 });
  }

  // Redirect to same origin to set session ID cookie
  return new Response(null, {
    status: 302,
    headers: {
      Location: SET_COOKIE_PATH,
      // TODO: add additional properties like domain, path, samesite, etc.
      // 'Set-Cookie': `${SESSION_COOKIE}=${sessionId}; Secure; HttpOnly; SameSite=Strict`,
      'Set-Cookie': `${SESSION_COOKIE}=${sessionId}; Secure; HttpOnly`,
    },
  });
};
