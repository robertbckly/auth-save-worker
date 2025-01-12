import { SET_COOKIE_PATH, SESSION_COOKIE_KEY } from '../common/constants/config';
import { PROVIDERS } from '../common/constants/providers';
import type { SessionId } from '../common/types/session';
import type { UserId } from '../common/types/user-id';
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
  let sessionId: SessionId;
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
      'Set-Cookie': `${SESSION_COOKIE_KEY}=${sessionId}; Secure; HttpOnly`,
    },
  });
};
