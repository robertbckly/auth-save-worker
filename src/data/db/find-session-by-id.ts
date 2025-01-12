import type { Session, SessionId } from '../../common/types/session';
import { isSession } from '../../common/utils/is-session';
import { throwOnInvalidSessionId } from '../../session/throw-on-invalid-session-id';

type Params = {
  env: Env;
  sessionId: SessionId;
};

export const findSessionById = async ({ env, sessionId }: Params): Promise<Session | null> => {
  // Validate first
  throwOnInvalidSessionId(sessionId);

  const { results, success } = await env.db
    .prepare('SELECT SessionId, UserId FROM UserSessions WHERE SessionId = ? LIMIT 1')
    .bind(sessionId)
    .run();

  if (!success) {
    throw Error();
  }

  const uncheckedSession = results[0];

  if (!uncheckedSession || !isSession(uncheckedSession)) {
    console.log(uncheckedSession);
    return null;
  }

  return uncheckedSession;
};
