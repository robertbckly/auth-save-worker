import { SecureResponse } from './secure-response';

export const methodNotAllowedResponse = () =>
  new SecureResponse('Method not allowed', { status: 405 });
