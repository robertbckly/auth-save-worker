import type { UserId } from '../../types/user-id';

type FindUserIdBySessionIdArgs = {
  env: Env;
  sessionId: string;
};

export const findUserIdBySessionId = async ({
  env,
  sessionId,
}: FindUserIdBySessionIdArgs): Promise<UserId | null> => {
  const { results, success } = await env.db
    .prepare('SELECT UserId FROM UserSessions WHERE SessionId = ?')
    .bind(sessionId)
    .run();

  // TODO: validate sessionId before querying...

  if (!success) {
    throw Error();
  }

  return (results[0]?.['UserId'] as UserId) || null;
};
