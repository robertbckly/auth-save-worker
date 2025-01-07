import type { UserId } from '../../types/user-id';

type CreateSessionArgs = {
  env: Env;
  sessionId: string;
  userId: UserId;
};

export const createSession = async ({
  env,
  sessionId,
  userId,
}: CreateSessionArgs): Promise<void> => {
  const { success } = await env.db
    .prepare('INSERT INTO UserSessions (SessionId, UserId) VALUES (?, ?)')
    .bind(sessionId, userId)
    .run();
  if (!success) {
    throw Error();
  }
};
