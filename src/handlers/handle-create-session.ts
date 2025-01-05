import { SET_COOKIE_PATH, SESSION_COOKIE } from '../constants/config';
import { PROVIDERS } from '../constants/providers';
import type { UserID } from '../types/user-id';
import { createSessionID } from '../utils/create-session-id';
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
  let userID: UserID;
  try {
    switch (incomingPathname) {
      case PROVIDERS.google.pathname:
        userID = (await verifyGoogleJWT(request)).userID;
        break;
      default:
        throw Error();
    }
  } catch {
    return new Response('Failed to authenticate', { status: 400 });
  }

  // Create and store new session
  let sessionID: string;
  try {
    sessionID = await createSessionID(env);
    const { success } = await env.db
      .prepare('INSERT INTO UserSessions (SessionID, UserID) VALUES (?, ?)')
      .bind(sessionID, userID)
      .run();
    if (!success) {
      throw Error();
    }
  } catch {
    return new Response('Failed to create session', { status: 500 });
  }

  // Redirect to same origin to set session ID cookie
  return new Response(null, {
    status: 302,
    headers: {
      Location: SET_COOKIE_PATH,
      // TODO: add additional properties like domain, path, samesite, etc.
      // 'Set-Cookie': `${SESSION_COOKIE}=${sessionID}; Secure; HttpOnly; SameSite=Strict`,
      'Set-Cookie': `${SESSION_COOKIE}=${sessionID}; Secure; HttpOnly`,
    },
  });
};
