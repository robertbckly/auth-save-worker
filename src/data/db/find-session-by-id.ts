import { SESSION_ID_BYTES } from '../../constants/config';

type FindSessionByIdArgs = {
  env: Env;
  sessionId: string;
};

export const findSessionById = async ({
  env,
  sessionId,
}: FindSessionByIdArgs): Promise<boolean> => {
  // Length check: hex-based Id must have x2 chars per byte
  if (sessionId.length !== SESSION_ID_BYTES * 2) {
    throw Error();
  }

  const { results, success } = await env.db
    .prepare('SELECT UserId FROM UserSessions WHERE SessionId = ? LIMIT 1')
    .bind(sessionId)
    .run();

  if (!success) {
    throw Error();
  }

  return !!results[0]?.['UserId'];
};
