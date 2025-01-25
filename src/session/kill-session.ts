import { throwOnInvalidSessionToken } from './throw-on-invalid-session-token';

type Params = {
  env: Env;
  /**
   * Private session ID, session token, or refresh token
   */
  identifier: string;
};

export const killSession = async ({ env, identifier }: Params): Promise<void> => {
  try {
    // Avoid hitting DB with invalid session ID
    throwOnInvalidSessionToken(identifier);
    // Delete session
    await env.db
      .prepare(
        'DELETE FROM UserSessions WHERE PrivateId = ? OR SessionToken = ? OR RefreshToken = ? LIMIT 1'
      )
      .bind(identifier, identifier, identifier)
      .run();
  } catch {
    // Do nothing
  }
};
