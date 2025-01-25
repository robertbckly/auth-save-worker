import { SecureResponse } from '../../common/utils/secure-response';

export const handleUnauthorised = (): Response => SecureResponse('Unauthorized', { status: 401 });
