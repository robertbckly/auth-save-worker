import { PROVIDERS } from './constants/providers';
import type { UserId } from './types/user-id';
import { createSessionID } from './utils/create-session-id';
import { verifyGoogleJWT } from './verifiers/verifyGoogleJWT';

const REQUIRED_METHOD = 'POST';
const REQUIRED_PROTOCOL = 'https:';
const SESSION_COOKIE = 'id';
const REDIRECT_URL = 'https://localhost:1234';

export default {
  async fetch(request, env) {
    // Reject unexpected methods
    if (request.method !== REQUIRED_METHOD) {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);

    // Reject anything but HTTPS
    if (url.protocol !== REQUIRED_PROTOCOL) {
      return new Response('HTTPS required', { status: 403 });
    }

    // Verify JWT ID-token depending on path
    // and extract user ID
    let userId: UserId | undefined;
    try {
      switch (url.pathname) {
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

      try {
        const { success } = await env.db
          .prepare('INSERT INTO UserSessions (SessionID, UserID) VALUES (?, ?)')
          .bind(sessionID, userId)
          .run();
        if (!success) {
          throw Error();
        }
      } catch (e) {
        console.log(e instanceof Error ? e.message : '');
        return new Response("Couldn't create session", { status: 500 });
      }

      return new Response(null, {
        status: 302,
        headers: {
          Location: REDIRECT_URL,
          // TODO: check this & add additional properties like domain, path, etc.
          'Set-Cookie': `${SESSION_COOKIE}=${sessionID}; Secure; HttpOnly; SameSite=Strict`,
        },
      });
    }

    // Not found
    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
