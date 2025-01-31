import { killSessionInDb } from '../data/db/kill-session-in-db';
import { throwOnInvalidToken } from './token/throw-on-invalid-token';

type Params = {
  env: Env;
  /**
   * Private session ID, session token, or refresh token
   */
  token: string;
};

export const killSession = async ({ env, token }: Params): Promise<void> => {
  try {
    // Avoid hitting DB with invalid session ID
    throwOnInvalidToken(token);
    // Delete session
    await killSessionInDb({ env, token });
  } catch {
    // Do nothing
  }
};
