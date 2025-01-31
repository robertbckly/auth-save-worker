import { throwOnInvalidToken } from '../../session/token/throw-on-invalid-token';
import type { Session, TokenField } from '../../common/types/session';

type Params = {
  env: Env;
  tokenField: TokenField;
  token: string;
};

type Result = Pick<Session, (typeof FIELDS)[number]>;

const FIELDS = [
  'PrivateId',
  'SessionToken',
  'RefreshToken',
  'RefreshExpiry',
  'IdleExpiry',
  'UserId',
  'UserAgent',
] satisfies (keyof Session)[];

export const findSessionByToken = async ({
  env,
  tokenField,
  token,
}: Params): Promise<Result | null> => {
  // Validate user input, even when using prepared statement
  throwOnInvalidToken(token);

  const { results, success } = await env.db
    .prepare(`SELECT ${FIELDS.join(',')} FROM UserSessions WHERE ? = ? LIMIT 1`)
    .bind(tokenField, token)
    .run();

  if (!success) {
    throw Error('DB error');
  }

  return (results[0] || null) as Result | null;
};
