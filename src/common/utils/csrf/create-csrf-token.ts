import { CSRF_TOKEN_BYTES } from '../../constants/config';
import type { SessionId } from '../../types/session';

type Params = {
  env: Env;
  sessionId: SessionId;
};

// TODO!!! >>> use private session ID, not the one sent to the client

// Based on OWASP's Signed Double-Submit Cookie pattern
export const createCsrfToken = async ({ env, sessionId }: Params): Promise<string> => {
  const encoder = new TextEncoder();
  const rawKey = encoder.encode(env.SECRET_KEY_DEV);

  // Create random hex number using appropriate crypto method
  const array = new Uint8Array(CSRF_TOKEN_BYTES);
  crypto.getRandomValues(array);
  const random = Array.from(array, (v) => v.toString(16).padStart(2, '0')).join('');

  // Create token & encode
  // = random number concatenated with session ID to bind to user
  const unsignedToken = encoder.encode(
    `${sessionId.length}!${sessionId}!${random.length}!${random}`
  );

  // Import HMAC key
  const key = await crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Sign token
  const signature = await crypto.subtle.sign('HMAC', key, unsignedToken);

  // Return signed token as hex
  return Array.from(new Uint8Array(signature), (v) => v.toString(16).padStart(2, '0')).join('');
};
