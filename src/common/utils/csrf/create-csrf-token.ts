import { CSRF_RANDOM_BYTES } from '../../constants/config';
import { toPaddedHexString } from '../to-padded-hex-string';

type Params = {
  env: Env;
  privateSessionId: string;
  /**
   * Optional; used for verifying
   */
  random?: string;
};

// Based on OWASP's Signed Double-Submit Cookie pattern
//  - Adds protection compared to simply checking for a custom header,
//    even though that's possibly sufficient
export const createCsrfToken = async ({
  env,
  privateSessionId,
  random: randomInput,
}: Params): Promise<string> => {
  const encoder = new TextEncoder();
  const rawKey = encoder.encode(env.SECRET_KEY_DEV);

  // Create random hex number using appropriate crypto method
  let random = randomInput;
  if (!random) {
    const array = new Uint8Array(CSRF_RANDOM_BYTES);
    crypto.getRandomValues(array);
    random = toPaddedHexString(array);
  }

  // Create token & encode
  // = random number concatenated with private session ID to bind to user
  const rawToken = encoder.encode(
    `${privateSessionId.length}!${privateSessionId}!${random.length}!${random}`
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

  // Hash token
  const hashBuffer = await crypto.subtle.sign('HMAC', key, rawToken);
  const hashHex = toPaddedHexString(hashBuffer);

  // Return hashed token as hex
  return `${hashHex}.${random}`;
};
