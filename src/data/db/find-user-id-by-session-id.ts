import type { UserId } from '../../types/user-id';
import { throwOnInvalidSessionId } from '../../utils/throw-on-invalid-session-id';

type FindUserIdBySessionIdArgs = {
  env: Env;
  sessionId: string;
};

export const findUserIdBySessionId = async ({
  env,
  sessionId,
}: FindUserIdBySessionIdArgs): Promise<UserId | null> => {
  // Validate first
  throwOnInvalidSessionId(sessionId);

  const { results, success } = await env.db
    .prepare('SELECT UserId FROM UserSessions WHERE SessionId = ?')
    .bind(sessionId)
    .run();

  if (!success) {
    throw Error();
  }

  return (results[0]?.['UserId'] as UserId) || null;
};
