import { parse } from 'cookie';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PROVIDERS } from '../common/constants/providers';
import type { VerifierReturnType } from './verifier-return-type';

const PROVIDER = PROVIDERS.google;
const JWKS = createRemoteJWKSet(new URL(PROVIDER.jwt.urlForJWKS));

export const verifyGoogleJWT = async (request: Request): Promise<VerifierReturnType> => {
  const formData = await request.formData();
  const cookies = parse(request.headers.get('Cookie') || '');

  // Verify CSRF double-submit-cookie pattern
  let passedCsrfCheck = false;
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

  passedCsrfCheck = true;

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

  // Verify Google is authoritative for account's email address
  const email = jwtPayload[PROVIDER.jwt.keyForEmail];
  const emailVerified = jwtPayload[PROVIDER.jwt.keyForEmailVerified];
  if (
    typeof email !== 'string' ||
    typeof emailVerified !== 'boolean' ||
    !email.endsWith(PROVIDER.jwt.emailSuffix) ||
    !emailVerified
  ) {
    throw Error();
  }

  // Extract user ID
  const userId = jwtPayload[PROVIDER.jwt.keyForUserId];
  if (!userId) {
    throw Error();
  }

  return {
    userId: `${PROVIDER.prefix}--${userId}`,
    passedCsrfCheck,
  };
};
