import { APP_URL } from '../common/constants/config';
import { getObject, putObject } from '../data/object/object-store';
import { handleDisallowedMethod } from './handle-disallowed-method';
import { authenticateSession } from '../session/handle-authenticate-session';
import { handleUnauthorised } from './handle-unauthorised';

export const handleReadWrite = async (request: Request, env: Env): Promise<Response> => {
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
    return new Response(text, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': APP_URL,
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  if (method === 'PUT') {
    const text = await request.text();
    await putObject({
      env,
      key: userId,
      value: text,
    });
    return new Response(null, { status: 200 });
  }

  return new Response('Something went wrong', { status: 500 });
};
