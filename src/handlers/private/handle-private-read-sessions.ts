import type { Session } from '../../common/types/session';
import type { UserId } from '../../common/types/user-id';
import { SecureResponse } from '../../common/utils/secure-response';
import { findAllSessionsByUserId } from '../../data/db/find-all-sessions-by-user-id';
import { handleDisallowedMethod } from '../public/handle-disallowed-method';

type Params = {
  request: Request;
  env: Env;
  userId: UserId;
};

export const handlePrivateReadSessions = async ({
  env,
  request,
  userId,
}: Params): Promise<Response> => {
  handleDisallowedMethod({
    method: request.method,
    allowed: ['GET'],
  });

  // Get sessions
  // IMPORTANT: don't send raw session IDs to client! Avoid spread syntax.
  try {
    const sessions = await findAllSessionsByUserId({ env, userId });
    const sessionsWithoutIds = sessions.map(
      (session, index): Partial<Session> => ({
        SessionId: index.toString(),
        UserId: session.UserId,
        UserAgent: session.UserAgent,
      })
    );
    return SecureResponse(JSON.stringify(sessionsWithoutIds), { status: 200 });
  } catch {
    return SecureResponse('Something went wrong', { status: 500 });
  }
};
