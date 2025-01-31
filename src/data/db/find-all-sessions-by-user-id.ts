import type { Session } from '../../common/types/session';
import type { UserId } from '../../common/types/user-id';

type Params = {
  env: Env;
  userId: UserId;
};

type Result = Pick<Session, (typeof FIELDS)[number]>;

const FIELDS = ['RefreshExpiry', 'UserId', 'UserAgent'] satisfies (keyof Session)[];

export const findAllSessionsByUserId = async ({ env, userId }: Params): Promise<Result[]> => {
  if (!userId) {
    throw Error();
  }

  const { results, success } = await env.db
    .prepare(`SELECT ${FIELDS} FROM UserSessions WHERE UserId = ?`)
    .bind(userId)
    .run();

  if (!success) {
    throw Error();
  }

  return results as Result[];
};
