import type { SessionId } from '../../common/types/session';
import type { UserId } from '../../common/types/user-id';
import { throwOnInvalidSessionId } from '../../session/throw-on-invalid-session-id';

type Params = {
  env: Env;
  privateId: SessionId;
  sessionId: SessionId;
  userId: UserId;
  userAgent: string;
};

export const createSession = async ({
  env,
  privateId,
  sessionId,
  userId,
  userAgent,
}: Params): Promise<void> => {
  // Validate first (overkill here, but better safe than sorry)
  throwOnInvalidSessionId(privateId);
  throwOnInvalidSessionId(sessionId);

  const { success } = await env.db
    .prepare(
      'INSERT INTO UserSessions (PrivateId, SessionId, UserId, UserAgent) VALUES (?, ?, ?, ?)'
    )
    .bind(privateId, sessionId, userId, userAgent)
    .run();
  if (!success) {
    throw Error();
  }
};
