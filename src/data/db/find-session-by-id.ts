import { throwOnInvalidSessionId } from '../../utils/throw-on-invalid-session-id';

type FindSessionByIdArgs = {
  env: Env;
  sessionId: string;
};

export const findSessionById = async ({
  env,
  sessionId,
}: FindSessionByIdArgs): Promise<boolean> => {
  // Validate first
  throwOnInvalidSessionId(sessionId);

  const { results, success } = await env.db
    .prepare('SELECT UserId FROM UserSessions WHERE SessionId = ? LIMIT 1')
    .bind(sessionId)
    .run();

  if (!success) {
    throw Error();
  }

  return !!results[0]?.['UserId'];
};
