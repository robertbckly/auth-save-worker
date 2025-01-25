import type { UserId } from '../../common/types/user-id';
import { throwOnInvalidSessionToken } from '../../session/throw-on-invalid-session-token';

type Params = {
  env: Env;
  privateId: string;
  sessionToken: string;
  userId: UserId;
  userAgent: string;
};

export const createSession = async ({
  env,
  privateId,
  sessionToken,
  userId,
  userAgent,
}: Params): Promise<void> => {
  // Validate first (overkill here, but better safe than sorry)
  throwOnInvalidSessionToken(privateId);
  throwOnInvalidSessionToken(sessionToken);

  const { success } = await env.db
    .prepare(
      'INSERT INTO UserSessions (PrivateId, SessionToken, UserId, UserAgent) VALUES (?, ?, ?, ?)'
    )
    .bind(privateId, sessionToken, userId, userAgent)
    .run();
  if (!success) {
    throw Error();
  }
};
