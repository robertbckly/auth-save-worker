import { SecureResponse } from '../../common/responses/secure-response';
import { verifyCsrfToken } from '../../common/utils/csrf/verify-csrf-token';
import { authenticateSessionToken } from '../../session/authenticate-session';
import { killSession } from '../../session/kill-session';
import { createSession } from '../../session/create-session';
import { SessionResponse } from '../../session/session-response';
import type { UserId } from '../../common/types/user-id';

type Params = {
  request: Request;
  env: Env;
};

export const handlePrivateRefreshSession = async ({ request, env }: Params): Promise<Response> => {
  let privateSessionId: string | undefined;
  let userId: UserId;
  let refreshExpiry: number;

  // Authenticate session using refresh token & check CSRF
  try {
    const session = await authenticateSessionToken({ request, env, type: 'RefreshToken' });
    privateSessionId = session.PrivateId;
    userId = session.UserId;
    refreshExpiry = session.RefreshExpiry;

    if (Date.now() > refreshExpiry) {
      throw Error('Refresh token expired');
    }

    const passedCsrfCheck = await verifyCsrfToken({
      request,
      env,
      privateSessionId: session.PrivateId,
    });

    // Fail safe
    if (!passedCsrfCheck) {
      throw Error('CSRF failure');
    }
  } catch {
    return new SecureResponse('Forbidden', { status: 403 });
  } finally {
    // Kill existing session
    // (applicable whether authn successful or not)
    if (privateSessionId) {
      await killSession({ env, token: privateSessionId });
    }
  }

  // Create new session and redirect with token cookies
  try {
    const session = await createSession({
      request,
      env,
      userId,
      // Carry forward expiry to ensure absolute timeout
      refreshExpiry,
    });
    return new SessionResponse(session);
  } catch {
    return new SecureResponse('Failed to create session', { status: 500 });
  }
};
