import { APP_URL } from '../constants/config';

type Body = BodyInit | null;
type Options = ResponseInit;

export const SecureResponse = (body?: Body, options?: Options) => {
  const response = new Response(body, options);

  // HSTS
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // CORS
  response.headers.set('Access-Control-Allow-Origin', APP_URL);
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // CORB / MIME type
  // (assuming API will only respond with JSON)
  response.headers.set('Content-Type', 'application/json');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // CORP
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // No `Referer` (for the sake of it)
  response.headers.set('Referrer-Policy', 'no-referrer');

  return response;
};
