import type { Session } from '../../common/types/session';
import type { UserId } from '../../common/types/user-id';
import { isSession } from '../../common/utils/is-session';

type Params = {
  env: Env;
  userId: UserId;
};

export const findAllSessionsByUserId = async ({ env, userId }: Params): Promise<Session[]> => {
  // Validate first
  if (!userId) {
    throw Error();
  }

  const { results, success } = await env.db
    .prepare('SELECT SessionToken, UserId, UserAgent FROM UserSessions WHERE UserId = ?')
    .bind(userId)
    .run();

  if (!success) {
    throw Error();
  }

  // TODO: filtering below will fail because I'm not pulling all fields back
  // ... need to refactor `isSession` / `Session` type to allow maybe properties

  return results.filter((result) => isSession(result));
};
