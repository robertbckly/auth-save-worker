import { SecureResponse } from '../../common/responses/secure-response';

type Params = {
  request: Request;
  env: Env;
};

export const handlePrivateRefreshSession = ({ env, request }: Params): Response => {
  // find session by refresh token
  // check refresh period hasn't lapsed
  // check csrf cookie + header
  // create new: session token; refresh token; csrf token
  // issue new tokens to client

  return new SecureResponse();
};
