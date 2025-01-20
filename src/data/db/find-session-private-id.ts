import type { SessionId } from '../../common/types/session';
import { throwOnInvalidSessionId } from '../../session/throw-on-invalid-session-id';

type Params = {
  env: Env;
  privateId: SessionId;
};

const KEY = 'PrivateId';

export const findSessionPrivateId = async ({ env, privateId }: Params): Promise<string | null> => {
  // Validate first
  throwOnInvalidSessionId(privateId);

  const { results, success } = await env.db
    .prepare('SELECT ? FROM UserSessions WHERE ? = ? LIMIT 1')
    .bind(KEY, KEY, privateId)
    .run();

  if (!success) {
    throw Error();
  }

  const session = results[0];

  if (!session || !session[KEY] || typeof session[KEY] !== 'string') {
    return null;
  }

  return session[KEY];
};
