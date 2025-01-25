import { APP_URL, UNKNOWN_USER_AGENT } from '../../common/constants/config';
import { SecureResponse } from '../../common/responses/secure-response';
import { createCsrfToken } from '../../common/utils/csrf/create-csrf-token';
import { verifyCsrfToken } from '../../common/utils/csrf/verify-csrf-token';
import { createSession } from '../../data/db/create-session';
import { addAllTokensToResponse } from '../../session/add-all-tokens-to-response';
import { authenticateSessionToken } from '../../session/authenticate-session';
import { createSessionToken } from '../../session/create-session-token';
import type { UserId } from '../../common/types/user-id';
import { killSession } from '../../session/kill-session';

type Params = {
  request: Request;
  env: Env;
};

export const handlePrivateRefreshSession = async ({ request, env }: Params): Promise<Response> => {
  let privateSessionId: string;
  let userId: UserId;
  try {
    // Authenticate session using refresh token
    const session = await authenticateSessionToken({ request, env, type: 'refresh' });
    privateSessionId = session.PrivateId;
    userId = session.UserId;
    // TODO: check server-side timestamp for refresh hasn't been exceeded
    // ***
    // Verify CSRF token
    const passedCsrfCheck = await verifyCsrfToken({
      request,
      env,
      privateSessionId: session.PrivateId,
    });
    if (!passedCsrfCheck) {
      throw Error('CSRF failure');
    }
  } catch {
    return new SecureResponse('Forbidden', { status: 403 });
  }

  // Kill existing session
  await killSession({ env, identifier: privateSessionId });

  // Create and store new session
  let sessionToken: string;
  let refreshToken: string;
  let csrfToken: string;
  try {
    const privateId = await createSessionToken(env, 'private');
    sessionToken = await createSessionToken(env, 'public');
    refreshToken = await createSessionToken(env, 'public');
    csrfToken = await createCsrfToken({ env, privateSessionId: privateId });
    const userAgent = request.headers.get('user-agent') || UNKNOWN_USER_AGENT;
    await createSession({ env, privateId, sessionToken, refreshToken, userId, userAgent });
  } catch {
    return new SecureResponse('Failed to create session', { status: 500 });
  }

  // Create redirect response with token cookies
  const response = addAllTokensToResponse({
    response: new SecureResponse(null, { status: 200, headers: { Location: APP_URL } }),
    sessionToken,
    refreshToken,
    csrfToken,
  });

  return response;
};
