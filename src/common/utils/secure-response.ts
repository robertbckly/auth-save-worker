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

  return response;
};
