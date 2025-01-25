import { getObject, putObject } from '../../data/object/object-store';
import { handleDisallowedMethod } from '../public/handle-disallowed-method';
import { SecureResponse } from '../../common/utils/secure-response';
import type { UserId } from '../../common/types/user-id';

type Params = {
  request: Request;
  env: Env;
  userId: UserId;
};

export const handlePrivateReadWriteObject = async ({
  request,
  env,
  userId,
}: Params): Promise<Response> => {
  const method = request.method;
  handleDisallowedMethod({ method, allowed: ['GET'] });

  if (method === 'GET') {
    const object = await getObject({ env, key: userId });
    const text = await object?.text();
    return SecureResponse(text, { status: 200 });
  }

  if (method === 'PUT') {
    const text = await request.text();
    await putObject({
      env,
      key: userId,
      value: text,
    });
    return SecureResponse(null, { status: 200 });
  }

  return SecureResponse('Something went wrong', { status: 500 });
};
