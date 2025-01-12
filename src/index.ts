import { APP_URL, SET_COOKIE_PATH } from './common/constants/config';
import { PROVIDERS } from './common/constants/providers';
import { handleCreateSession } from './handlers/handle-create-session';
import { handleReadSessions } from './handlers/handle-read-sessions';
import { handleReadWrite } from './handlers/handle-read-write';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Reject anything but HTTPS
    if (url.protocol !== 'https:') {
      return new Response('HTTPS required', { status: 403 });
    }

    // Route request
    switch (url.pathname) {
      case '/':
        return await handleReadWrite(request, env);
      case '/sessions':
        return await handleReadSessions({ request, env });
      case PROVIDERS.google.pathname:
        return await handleCreateSession(url.pathname, request, env);
      case SET_COOKIE_PATH:
        // Redirect back to app after cookie has been set for this origin
        return Response.redirect(APP_URL, 302);
      default:
        return new Response('Not found', { status: 404 });
    }
  },
} satisfies ExportedHandler<Env>;
