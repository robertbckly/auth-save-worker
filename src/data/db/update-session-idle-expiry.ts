import { throwOnInvalidSessionToken } from '../../session/token/throw-on-invalid-session-token';

type Params = {
  env: Env;
  token: string;
  idleExpiry: number;
};

export const updateSessionIdleExpiry = async ({
  env,
  token,
  idleExpiry,
}: Params): Promise<boolean> => {
  // Validate first
  throwOnInvalidSessionToken(token);

  const { success } = await env.db
    .prepare(
      'UPDATE UserSessions SET IdleExpiry = ? WHERE SessionToken = ? OR RefreshToken = ? LIMIT 1'
    )
    .bind(idleExpiry, token, token)
    .run();

  if (!success) {
    throw Error('DB error');
  }

  return true;
};
