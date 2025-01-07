import type { UserId } from '../../types/user-id';
import { throwOnInvalidSessionId } from '../../utils/throw-on-invalid-session-id';

type CreateSessionArgs = {
  env: Env;
  sessionId: string;
  userId: UserId;
};

export const createSession = async ({
  env,
  sessionId,
  userId,
}: CreateSessionArgs): Promise<void> => {
  // Validate first (overkill here, but better safe than sorry)
  throwOnInvalidSessionId(sessionId);

  const { success } = await env.db
    .prepare('INSERT INTO UserSessions (SessionId, UserId) VALUES (?, ?)')
    .bind(sessionId, userId)
    .run();
  if (!success) {
    throw Error();
  }
};
