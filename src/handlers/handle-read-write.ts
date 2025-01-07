import { parse } from 'cookie';
import { APP_URL, SESSION_COOKIE } from '../constants/config';
import type { UserId } from '../types/user-id';
import { findUserIdBySessionId } from '../data/db/find-user-id-by-session-id';
import { getObject, putObject } from '../data/object/object-store';

export const handleReadWrite = async (request: Request, env: Env): Promise<Response> => {
  const method = request.method;
  if (method !== 'GET' && method !== 'PUT') {
    return new Response('Method not allowed', { status: 405 });
  }

  const cookies = parse(request.headers.get('Cookie') || '');
  const sessionId = cookies[SESSION_COOKIE];

  if (!sessionId) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': APP_URL,
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  // Get user's ID
  let userId: UserId | null;
  try {
    userId = await findUserIdBySessionId({ env, sessionId });
    if (!userId) {
      throw Error();
    }
  } catch {
    // Unauthorized if no match found
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': APP_URL,
        'Access-Control-Allow-Credentials': 'true',
      },
    });
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
