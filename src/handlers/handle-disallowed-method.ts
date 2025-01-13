import { SecureResponse } from '../common/utils/secure-response';

type Params = {
  method: Request['method'];
  allowed: ('GET' | 'POST' | 'PUT' | 'DELETE' | (string & {}))[];
};

export const handleDisallowedMethod = ({ method, allowed }: Params): Response | void => {
  if (!method || !allowed.length || !allowed.includes(method)) {
    return SecureResponse('Method not allowed', { status: 405 });
  }
};
