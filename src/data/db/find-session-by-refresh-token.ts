import type { Session } from '../../common/types/session';
import { isSession } from '../../common/utils/is-session';
import { throwOnInvalidSessionToken } from '../../session/throw-on-invalid-session-token';

type Params = {
  env: Env;
  refreshToken: string;
};

export const findSessionByRefreshToken = async ({
  env,
  refreshToken,
}: Params): Promise<Session | null> => {
  // Validate first
  throwOnInvalidSessionToken(refreshToken);

  const { results, success } = await env.db
    .prepare(
      'SELECT PrivateId, SessionToken, RefreshToken, UserId, UserAgent FROM UserSessions WHERE RefreshToken = ? LIMIT 1'
    )
    .bind(refreshToken)
    .run();

  if (!success) {
    throw Error('DB error');
  }

  const uncheckedSession = results[0];

  if (!uncheckedSession || !isSession(uncheckedSession)) {
    return null;
  }

  return uncheckedSession;
};
