import { APP_URL } from './constants/config';
import { PROVIDERS } from './constants/providers';
import { handleCreateSession } from './handlers/handle-create-session';
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
      case PROVIDERS.google.pathname:
        return await handleCreateSession(url.pathname, request, env);
      case '/redirect':
        // Go back to app
        return Response.redirect(APP_URL, 302);
      default:
        return await handleReadWrite(request, env);
    }
  },
} satisfies ExportedHandler<Env>;
