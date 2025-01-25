import { methodNotAllowedResponse } from '../../common/responses/method-not-allowed-response';
import type { Session } from '../../common/types/session';
import type { UserId } from '../../common/types/user-id';
import { SecureResponse } from '../../common/responses/secure-response';
import { findAllSessionsByUserId } from '../../data/db/find-all-sessions-by-user-id';

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
  if (request.method !== 'GET') {
    return methodNotAllowedResponse();
  }

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
    return new SecureResponse(JSON.stringify(sessionsWithoutIds), { status: 200 });
  } catch {
    return new SecureResponse('Something went wrong', { status: 500 });
  }
};
