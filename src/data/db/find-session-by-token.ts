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

  // Overkill check just to ensure value is never unrestricted,
  // given the use of SQL string concatenation
  if (
    tokenField !== 'PrivateId' &&
    tokenField !== 'SessionToken' &&
    tokenField !== 'RefreshToken'
  ) {
    throw Error('Invalid token field');
  }

  const { results, success } = await env.db
    .prepare(`SELECT ${FIELDS.join(',')} FROM UserSessions WHERE ${tokenField} = ? LIMIT 1`)
    .bind(token)
    .run();

  if (!success) {
    throw Error('DB error');
  }

  return (results[0] || null) as Result | null;
};
