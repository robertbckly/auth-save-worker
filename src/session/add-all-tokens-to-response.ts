import {
  SESSION_COOKIE_KEY,
  SESSION_COOKIE_MAX_AGE,
  REFRESH_COOKIE_KEY,
  REFRESH_COOKIE_MAX_AGE,
  CSRF_COOKIE_KEY,
  CSRF_COOKIE_MAX_AGE,
  REFRESH_SESSION_PATH,
} from '../common/constants/config';
import type { SecureResponse } from '../common/responses/secure-response';

type Params = {
  response: SecureResponse;
  sessionToken: string;
  refreshToken: string;
  csrfToken: string;
};

// Effectively rotates all tokens
export const addAllTokensToResponse = ({
  response,
  sessionToken,
  refreshToken,
  csrfToken,
}: Params): SecureResponse => {
  // Append session token cookie
  response.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE_KEY}=${sessionToken}; Secure; HttpOnly; SameSite=Strict; Max-Age=${SESSION_COOKIE_MAX_AGE}; Path=/`
  );

  // Append refresh token cookie
  response.headers.append(
    'Set-Cookie',
    `${REFRESH_COOKIE_KEY}=${refreshToken}; Secure; HttpOnly; SameSite=Strict; Max-Age=${REFRESH_COOKIE_MAX_AGE}; Path=${REFRESH_SESSION_PATH}`
  );

  // Append CSRF token cookie
  // (Note: purposefully *not* using `HttpOnly`, as client needs access)
  response.headers.append(
    'Set-Cookie',
    `${CSRF_COOKIE_KEY}=${csrfToken}; Secure; SameSite=Strict; Max-Age=${CSRF_COOKIE_MAX_AGE}; Path=/`
  );

  return response;
};
