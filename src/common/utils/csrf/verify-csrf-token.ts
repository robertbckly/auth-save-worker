import { parse } from 'cookie';
import { CSRF_COOKIE_KEY, CSRF_HEADER, CSRF_TOTAL_LENGTH } from '../../constants/config';
import { createCsrfToken } from './create-csrf-token';

type Params = {
  request: Request;
  env: Env;
  privateSessionId: string;
};

// Based on OWASP's Signed Double-Submit Cookie pattern
// "ensures that an attacker cannot create and inject their own, known,
// CSRF token into the victim's authenticated session"
export const verifyCsrfToken = async ({
  request,
  env,
  privateSessionId,
}: Params): Promise<boolean> => {
  const cookies = parse(request.headers.get('Cookie') || '');
  const csrfTokenCookie = cookies[CSRF_COOKIE_KEY];
  const csrfTokenHeader = request.headers.get(CSRF_HEADER);

  // Throw if token sized unexpectedly or tokens don't match
  if (
    !privateSessionId ||
    csrfTokenCookie?.length !== CSRF_TOTAL_LENGTH ||
    csrfTokenHeader?.length !== CSRF_TOTAL_LENGTH ||
    csrfTokenCookie !== csrfTokenHeader
  ) {
    throw Error('Invalid CSRF verification args');
  }

  // Tokens are equal; can now treat them as one
  const token = csrfTokenCookie;

  // Split HMAC hash and random number
  const [hash, random] = token.split('.');
  if (!hash || !random) {
    throw Error('Invalid CSRF token');
  }

  // Create verifier token from the parts
  const verifierToken = await createCsrfToken({ env, privateSessionId, random });

  // Throw if verifier token doesn't match provided token
  if (verifierToken.length !== CSRF_TOTAL_LENGTH || verifierToken !== token) {
    throw Error('Failed CSRF check');
  }

  // Success
  return true;
};
