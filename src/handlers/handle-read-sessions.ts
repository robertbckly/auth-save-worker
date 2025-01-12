import type { Session } from '../common/types/session';
import type { UserId } from '../common/types/user-id';
import { findAllSessionsByUserId } from '../data/db/find-all-sessions-by-user-id';
import { authenticateSession } from '../session/authenticate-session';
import { handleDisallowedMethod } from './handle-disallowed-method';
import { handleUnauthorised } from './handle-unauthorised';

type Params = {
  request: Request;
  env: Env;
};

export const handleReadSessions = async ({ env, request }: Params): Promise<Response> => {
  handleDisallowedMethod({
    method: request.method,
    allowed: ['GET'],
  });

  let userId: UserId;
  try {
    userId = (await authenticateSession({ env, request })).UserId;
  } catch {
    return handleUnauthorised();
  }

  // Get sessions
  // IMPORTANT: don't send raw session IDs to client! Avoid spread syntax.
  try {
    const sessions = await findAllSessionsByUserId({ env, userId });
    const sessionsWithoutIds = sessions.map(
      (session, index): Session => ({
        SessionId: index.toString(),
        UserId: session.UserId,
        UserAgent: session.UserAgent,
      })
    );
    return new Response(JSON.stringify(sessionsWithoutIds), { status: 200 });
  } catch {
    return new Response('Something went wrong', { status: 500 });
  }
};
