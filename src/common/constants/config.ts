export const APP_URL = 'https://localhost:1234';
export const SET_COOKIE_PATH = '/redirect';
export const SESSION_COOKIE_KEY = '__Host-id'; // prefixed for security
export const CSRF_COOKIE_KEY = '__Host-csrf'; // prefixed for security
export const SESSION_ID_BYTES = 16; // 128-bit (IMPORTANT)
export const CSRF_LEN_CHECK_BYTES = 32; // 256-bit (due to SHA-256)
export const CSRF_RANDOM_BYTES = 2; // 16-bit (only to avoid same-second collision)
export const UNKNOWN_USER_AGENT = 'nothing provided by client';
