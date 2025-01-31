import type { Session } from '../../common/types/session';
import type { UserId } from '../../common/types/user-id';
import { throwOnInvalidToken } from '../../session/token/throw-on-invalid-token';

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

const FIELDS = [
  'PrivateId',
  'SessionToken',
  'RefreshToken',
  'RefreshExpiry',
  'IdleExpiry',
  'UserId',
  'UserAgent',
] satisfies (keyof Session)[];

export const createSessionInDb = async ({
  env,
  privateId,
  sessionToken,
  refreshToken,
  refreshExpiry,
  idleExpiry,
  userId,
  userAgent,
}: Params): Promise<void> => {
  // Validate user input, even when using prepared statement
  throwOnInvalidToken(privateId);
  throwOnInvalidToken(sessionToken);
  throwOnInvalidToken(refreshToken);

  const { success } = await env.db
    .prepare(`INSERT INTO UserSessions (${FIELDS}) VALUES (${FIELDS.map(() => '?')})`)
    .bind(privateId, sessionToken, refreshToken, refreshExpiry, idleExpiry, userId, userAgent)
    .run();
  if (!success) {
    throw Error();
  }
};
