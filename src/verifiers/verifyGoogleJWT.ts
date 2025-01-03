import { parse } from 'cookie';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PROVIDERS } from '../constants/providers';
import type { UserID } from '../types/user-id';

const PROVIDER = PROVIDERS.google;
const JWKS = createRemoteJWKSet(new URL(PROVIDER.jwt.urlForJWKS));

export const verifyGoogleJWT = async (request: Request): Promise<UserID> => {
  const formData = await request.formData();
  const cookies = parse(request.headers.get('Cookie') || '');

  // Verify CSRF double-submit-cookie pattern
  const bodyCSRF = formData.get(PROVIDER.csrf.keyInBody);
  const cookieCSRF = cookies[PROVIDER.csrf.keyInCookie];
  if (
    typeof bodyCSRF !== 'string' ||
    typeof cookieCSRF !== 'string' ||
    !bodyCSRF.length ||
    !cookieCSRF.length ||
    bodyCSRF !== cookieCSRF
  ) {
    throw Error();
  }

  // Extract JWT
  const jwt = formData.get(PROVIDER.jwt.keyInBody);
  if (typeof jwt !== 'string') {
    throw Error();
  }

  // Verify JWT
  const { payload: jwtPayload } = await jwtVerify(jwt, JWKS, {
    issuer: PROVIDER.jwt.issuer,
    audience: PROVIDER.jwt.audience,
  });

  // TODO check email verified property of JWT...

  // Verify Google is authoritative for account's email address
  const email = jwtPayload[PROVIDER.jwt.keyForEmail];
  if (typeof email !== 'string' || !email.endsWith(PROVIDER.jwt.emailSuffix)) {
    throw Error();
  }

  // Extract user ID
  const userId = jwtPayload[PROVIDER.jwt.keyForUserID];
  if (!userId) {
    throw Error();
  }

  return `${PROVIDER.prefix}--${userId}`;
};
