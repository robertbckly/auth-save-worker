import {
  SESSION_COOKIE_KEY,
  SESSION_COOKIE_MAX_AGE,
  REFRESH_COOKIE_KEY,
  REFRESH_COOKIE_MAX_AGE,
  REFRESH_SESSION_PATH,
  CSRF_COOKIE_KEY,
  CSRF_COOKIE_MAX_AGE,
  APP_URL,
} from '../constants/config';
import { SecureResponse } from './secure-response';

type Params = {
  sessionToken: string;
  refreshToken: string;
  csrfToken: string;
};

export class SessionResponse extends SecureResponse {
  constructor({ sessionToken, refreshToken, csrfToken }: Params) {
    // Redirect to app
    super(undefined, {
      status: 302,
      headers: { Location: APP_URL },
    });

    // Append session token cookie
    this.headers.append(
      'Set-Cookie',
      `${SESSION_COOKIE_KEY}=${sessionToken}; Secure; HttpOnly; SameSite=Strict; Max-Age=${SESSION_COOKIE_MAX_AGE}; Path=/`
    );

    // Append refresh token cookie
    this.headers.append(
      'Set-Cookie',
      `${REFRESH_COOKIE_KEY}=${refreshToken}; Secure; HttpOnly; SameSite=Strict; Max-Age=${REFRESH_COOKIE_MAX_AGE}; Path=${REFRESH_SESSION_PATH}`
    );

    // Append CSRF token cookie
    // (Note: purposefully *not* using `HttpOnly`, as client needs access)
    this.headers.append(
      'Set-Cookie',
      `${CSRF_COOKIE_KEY}=${csrfToken}; Secure; SameSite=Strict; Max-Age=${CSRF_COOKIE_MAX_AGE}; Path=/`
    );
  }
}
