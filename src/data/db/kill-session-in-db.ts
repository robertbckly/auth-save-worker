type Params = {
  env: Env;
  token: string;
};

export const killSessionInDb = async ({ env, token }: Params): Promise<void> => {
  await env.db
    .prepare(
      'DELETE FROM UserSessions WHERE PrivateId = ? OR SessionToken = ? OR RefreshToken = ? LIMIT 1'
    )
    .bind(token, token, token)
    .run();
};
