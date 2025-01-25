import { throwOnInvalidSessionToken } from '../../session/throw-on-invalid-session-token';

type Params = {
  env: Env;
  privateId: string;
};

const KEY = 'PrivateId';

export const findSessionPrivateId = async ({ env, privateId }: Params): Promise<string | null> => {
  // Validate first
  throwOnInvalidSessionToken(privateId);

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
