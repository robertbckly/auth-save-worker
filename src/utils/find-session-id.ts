export const findSessionID = async (env: Env, sessionID: string): Promise<boolean> => {
  const { results, success } = await env.db
    .prepare('SELECT UserId FROM UserSessions WHERE SessionID = ? LIMIT 1')
    .bind(sessionID)
    .run();

  if (!success) {
    throw Error();
  }

  return !!results[0]?.['UserID'];
};
