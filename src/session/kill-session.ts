import { throwOnInvalidSessionId } from './throw-on-invalid-session-id';

type Params = {
  env: Env;
  sessionId: string;
};

export const killSession = async ({ env, sessionId }: Params): Promise<void> => {
  try {
    // Avoid hitting DB with invalid session ID
    throwOnInvalidSessionId(sessionId);
    // Delete session
    await env.db
      .prepare('DELETE FROM UserSessions WHERE SessionId = ? LIMIT 1')
      .bind(sessionId)
      .run();
  } catch {
    // Do nothing
  }
};
