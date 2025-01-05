import { SET_COOKIE_PATH, SESSION_COOKIE } from '../constants/config';
import { PROVIDERS } from '../constants/providers';
import type { UserID } from '../types/user-id';
import { createSessionID } from '../utils/create-session-id';
import { verifyGoogleJWT } from '../verifiers/verifyGoogleJWT';

export const handleCreateSession = async (
  incomingPathname: string,
  request: Request,
  env: Env
): Promise<Response> => {
  // Reject unexpected methods
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Verify JWT ID-token depending on path
  // and extract user ID
  let userId: UserID | undefined;
  try {
    switch (incomingPathname) {
      case PROVIDERS.google.pathname:
        userId = await verifyGoogleJWT(request);
        break;
      default:
        break;
    }
  } catch {
    // TODO: improve this; e.g. use 400 if CSRF check failed
    return new Response('Uh oh :-(', { status: 500 });
  }

  // Success
  if (userId) {
    const sessionID = createSessionID();

    // TODO: add lookup-first logic to avoid collisions
    try {
      const { success } = await env.db
        .prepare('INSERT INTO UserSessions (SessionID, UserID) VALUES (?, ?)')
        .bind(sessionID, userId)
        .run();
      if (!success) {
        throw Error();
      }
    } catch {
      return new Response("Couldn't create session", { status: 500 });
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: SET_COOKIE_PATH,
        // TODO: add additional properties like domain, path, samesite, etc.
        // 'Set-Cookie': `${SESSION_COOKIE}=${sessionID}; Secure; HttpOnly; SameSite=Strict`,
        'Set-Cookie': `${SESSION_COOKIE}=${sessionID}; Secure; HttpOnly`,
      },
    });
  }

  return new Response("Couldn't create session", { status: 500 });
};
