import { SecureResponse } from '../../common/responses/secure-response';

export const handleRefreshSession = (): Response => {
  return new SecureResponse();
};
