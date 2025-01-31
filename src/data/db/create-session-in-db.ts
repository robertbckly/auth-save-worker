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

  // Doing this manually to ensure fields cannot possibly be dynamic,
  // given the use of SQL string concatenation. Also keeps sync below.
  const session: Session = {
    PrivateId: privateId,
    SessionToken: sessionToken,
    RefreshToken: refreshToken,
    RefreshExpiry: refreshExpiry,
    IdleExpiry: idleExpiry,
    UserId: userId,
    UserAgent: userAgent,
  };

  const fields = Object.keys(session);

  const { success } = await env.db
    .prepare(`INSERT INTO UserSessions (${fields}) VALUES (${fields.map(() => '?')})`)
    .bind(...Object.values(session))
    .run();
  if (!success) {
    throw Error();
  }
};
