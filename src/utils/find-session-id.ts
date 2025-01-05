import { SESSION_ID_BYTES } from '../constants/config';

export const findSessionID = async (env: Env, sessionID: string): Promise<boolean> => {
  // Length check: hex-based ID must have x2 chars per byte
  if (sessionID.length !== SESSION_ID_BYTES * 2) {
    throw Error();
  }

  const { results, success } = await env.db
    .prepare('SELECT UserId FROM UserSessions WHERE SessionID = ? LIMIT 1')
    .bind(sessionID)
    .run();

  if (!success) {
    throw Error();
  }

  return !!results[0]?.['UserID'];
};
