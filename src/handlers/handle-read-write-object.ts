import { getObject, putObject } from '../data/object/object-store';
import { handleDisallowedMethod } from './handle-disallowed-method';
import { authenticateSession } from '../session/authenticate-session';
import { handleUnauthorised } from './handle-unauthorised';
import { SecureResponse } from '../common/utils/secure-response';

export const handleReadWriteObject = async (request: Request, env: Env): Promise<Response> => {
  const method = request.method;
  handleDisallowedMethod({ method, allowed: ['GET'] });

  // Auth & get user ID
  let userId: string;
  try {
    userId = (await authenticateSession({ env, request })).UserId;
  } catch {
    return handleUnauthorised();
  }

  // User is now authorised to read/write their object...

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
