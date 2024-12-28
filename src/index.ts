const REQUIRED_METHOD = 'POST';
const REQUIRED_PROTOCOL = 'https';
const REQUIRED_LOCAL_HOSTNAME = 'localhost';

export default {
  async fetch(request) {
    // Reject methods other than POST
    if (request.method !== REQUIRED_METHOD) {
      return new Response('Method not allowed', { status: 405 });
    }

    // Reject HTTP unless running locally
    const url = new URL(request.url);
    if (url.protocol !== REQUIRED_PROTOCOL && url.hostname !== REQUIRED_LOCAL_HOSTNAME) {
      return new Response('HTTPS required', { status: 403 });
    }

    // Success
    return new Response(`Hello :-) ${request.url}`, { status: 200 });
  },
} satisfies ExportedHandler<Env>;
