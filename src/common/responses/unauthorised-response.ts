import { SecureResponse } from './secure-response';

export const unauthorisedResponse = () => new SecureResponse('Unauthorized', { status: 401 });
