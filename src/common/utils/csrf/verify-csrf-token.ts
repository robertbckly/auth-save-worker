import { CSRF_TOTAL_LENGTH } from '../../constants/config';
import { createCsrfToken } from './create-csrf-token';

type Params = {
  env: Env;
  privateSessionId: string;
  tokenFromBody: string;
  tokenFromCookie: string;
};

// Based on OWASP's Signed Double-Submit Cookie pattern
// "ensures that an attacker cannot create and inject their own, known,
// CSRF token into the victim's authenticated session"
export const verifyCsrfToken = async ({
  env,
  privateSessionId,
  tokenFromBody,
  tokenFromCookie,
}: Params): Promise<boolean> => {
  // Throw if token sized unexpectedly or tokens don't match
  if (
    !privateSessionId ||
    tokenFromBody.length !== CSRF_TOTAL_LENGTH ||
    tokenFromCookie.length !== CSRF_TOTAL_LENGTH ||
    tokenFromBody !== tokenFromCookie
  ) {
    throw Error();
  }

  // Tokens are equal; can now treat them as one
  const token = tokenFromCookie;

  // Split HMAC hash and random number
  const [hash, random] = token.split('.');
  if (!hash || !random) {
    throw Error();
  }

  // Create verifier token from the parts
  const verifierToken = await createCsrfToken({ env, privateSessionId, random });

  // Throw if verifier token doesn't match provided token
  if (verifierToken.length !== CSRF_TOTAL_LENGTH || verifierToken !== token) {
    throw Error();
  }

  // Success
  return true;
};
