import type { Session } from '../../common/types/session';
import { isSession } from '../../common/utils/is-session';
import { throwOnInvalidSessionToken } from '../../session/throw-on-invalid-session-token';

type Params = {
  env: Env;
  sessionToken: string;
};

export const findSessionByToken = async ({
  env,
  sessionToken,
}: Params): Promise<Session | null> => {
  // Validate first
  throwOnInvalidSessionToken(sessionToken);

  const { results, success } = await env.db
    .prepare(
      'SELECT PrivateId, SessionToken, RefreshToken, RefreshExpiry, UserId, UserAgent FROM UserSessions WHERE SessionToken = ? LIMIT 1'
    )
    .bind(sessionToken)
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
