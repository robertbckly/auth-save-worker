import { APP_URL } from '../../common/constants/config';
import { SecureResponse } from '../../common/responses/secure-response';
import { verifyCsrfToken } from '../../common/utils/csrf/verify-csrf-token';
import { addAllTokensToResponse } from '../../session/add-all-tokens-to-response';
import { authenticateSessionToken } from '../../session/authenticate-session';
import type { UserId } from '../../common/types/user-id';
import { killSession } from '../../session/kill-session';
import { createSession } from '../../session/create-session';

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
    const session = await authenticateSessionToken({ request, env, type: 'refresh' });
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
      await killSession({ env, identifier: privateSessionId });
    }
  }

  // Create new session and redirect with token cookies
  try {
    const { sessionToken, refreshToken, csrfToken } = await createSession({
      request,
      env,
      userId,
      // Carry forward refresh expiry to ensure absolute timeout
      refreshExpiry,
    });
    const response = addAllTokensToResponse({
      response: new SecureResponse(null, { status: 302, headers: { Location: APP_URL } }),
      sessionToken,
      refreshToken,
      csrfToken,
    });
    return response;
  } catch {
    return new SecureResponse('Failed to create session', { status: 500 });
  }
};
