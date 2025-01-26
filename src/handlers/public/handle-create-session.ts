import { APP_URL } from '../../common/constants/config';
import { PROVIDERS } from '../../common/constants/providers';
import { methodNotAllowedResponse } from '../../common/responses/method-not-allowed-response';
import type { UserId } from '../../common/types/user-id';
import { SecureResponse } from '../../common/responses/secure-response';
import { verifyGoogleJWT } from '../../verifiers/verify-google-jwt';
import { addAllTokensToResponse } from '../../session/add-all-tokens-to-response';
import { createSession } from '../../session/create-session';

type Params = {
  incomingPathname: string;
  request: Request;
  env: Env;
};

// Considered "public" because this is used before a session has been established,
// i.e. the user hasn't been authenticated upon hitting this
export const handleCreateSession = async ({
  incomingPathname,
  request,
  env,
}: Params): Promise<Response> => {
  if (request.method !== 'POST') {
    return methodNotAllowedResponse();
  }

  // Verify JWT ID-token depending on path & extract user's ID
  // NOTE: ensure verifiers involve CSRF protection
  let userId: UserId;
  let passedCsrfCheck = false;
  try {
    switch (incomingPathname) {
      case PROVIDERS.google.pathname: {
        const result = await verifyGoogleJWT(request);
        userId = result.userId;
        passedCsrfCheck = result.passedCsrfCheck;
        break;
      }
      default:
        throw Error();
    }

    // Fail safe
    if (!passedCsrfCheck) {
      throw Error();
    }
  } catch {
    return new SecureResponse('Failed to authenticate', { status: 400 });
  }

  // Create new session and redirect with token cookies
  try {
    const { sessionToken, refreshToken, csrfToken } = await createSession({ request, env, userId });
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
