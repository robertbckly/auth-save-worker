export const APP_URL = 'https://localhost:1234';
export const REFRESH_SESSION_PATH = '/refresh-session';

// Cookies prefixed with `__Host` for security
export const SESSION_COOKIE_KEY = '__Host-id';
export const REFRESH_COOKIE_KEY = '__Host-refresh';
export const CSRF_COOKIE_KEY = '__Host-csrf';

export const SESSION_COOKIE_MAX_AGE = 3600; // 1h in seconds
export const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 3600; // 30d in seconds
export const CSRF_COOKIE_MAX_AGE = SESSION_COOKIE_MAX_AGE; // same as session

export const SESSION_TOKEN_BYTES = 16; // 128-bit (IMPORTANT)
export const CSRF_RANDOM_BYTES = 2; // 16-bit (only to avoid same-second collision)

// CSRF token length = (random + SHA-256) * 2 chars for hex + 1 for dot separator
export const CSRF_TOTAL_LENGTH = (CSRF_RANDOM_BYTES + 32) * 2 + 1;
export const CSRF_HEADER = 'X-CSRF-Token';

export const UNKNOWN_USER_AGENT = 'nothing provided by client';
