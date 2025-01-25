import { getObject, putObject } from '../../data/object/object-store';
import { SecureResponse } from '../../common/responses/secure-response';
import type { UserId } from '../../common/types/user-id';
import { methodNotAllowedResponse } from '../../common/responses/method-not-allowed-response';

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

  if (method === 'GET') {
    const object = await getObject({ env, key: userId });
    const text = await object?.text();
    return new SecureResponse(text, { status: 200 });
  }

  if (method === 'PUT') {
    const text = await request.text();
    await putObject({
      env,
      key: userId,
      value: text,
    });
    return new SecureResponse(null, { status: 200 });
  }

  return methodNotAllowedResponse();
};
