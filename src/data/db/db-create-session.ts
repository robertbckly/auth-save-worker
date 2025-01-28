import type { UserId } from '../../common/types/user-id';
import { throwOnInvalidSessionToken } from '../../session/token/throw-on-invalid-session-token';

type Params = {
  env: Env;
  privateId: string;
  sessionToken: string;
  refreshToken: string;
  refreshExpiry: number;
  idleExpiry: number;
  userId: UserId;
  userAgent: string;
};

export const dbCreateSession = async ({
  env,
  privateId,
  sessionToken,
  refreshToken,
  refreshExpiry,
  idleExpiry,
  userId,
  userAgent,
}: Params): Promise<void> => {
  // Validate first (overkill here, but better safe than sorry)
  throwOnInvalidSessionToken(privateId);
  throwOnInvalidSessionToken(sessionToken);
  throwOnInvalidSessionToken(refreshToken);

  const { success } = await env.db
    .prepare(
      'INSERT INTO UserSessions (PrivateId, SessionToken, RefreshToken, RefreshExpiry, IdleExpiry, UserId, UserAgent) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(privateId, sessionToken, refreshToken, refreshExpiry, idleExpiry, userId, userAgent)
    .run();
  if (!success) {
    throw Error();
  }
};
