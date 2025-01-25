import { throwOnInvalidSessionId } from './throw-on-invalid-session-id';

type Params = {
  env: Env;
  /**
   * Either public or private session ID works
   */
  anySessionId: string;
};

export const killSession = async ({ env, anySessionId }: Params): Promise<void> => {
  try {
    // Avoid hitting DB with invalid session ID
    throwOnInvalidSessionId(anySessionId);
    // Delete session
    await env.db
      .prepare('DELETE FROM UserSessions WHERE PrivateId = ? OR SessionId = ? LIMIT 1')
      .bind(anySessionId, anySessionId)
      .run();
  } catch {
    // Do nothing
  }
};
