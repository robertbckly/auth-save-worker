import type { SessionId } from '../../common/types/session';
import type { UserId } from '../../common/types/user-id';
import { throwOnInvalidSessionId } from '../../session/throw-on-invalid-session-id';

type CreateSessionArgs = {
  env: Env;
  sessionId: SessionId;
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
