import { parse } from 'cookie';
import { APP_URL, SESSION_COOKIE } from '../constants/config';
import type { UserID } from '../types/user-id';

export const handleReadWrite = async (request: Request, env: Env): Promise<Response> => {
  const method = request.method;
  if (method !== 'GET' && method !== 'PUT') {
    return new Response('Method not allowed', { status: 405 });
  }

  const cookies = parse(request.headers.get('Cookie') || '');
  const sessionID = cookies[SESSION_COOKIE];

  if (!sessionID) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': APP_URL,
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  // Get user's ID by matching incoming session ID against session store
  let userID: UserID | undefined;
  try {
    const { results, success } = await env.db
      .prepare('SELECT UserId FROM UserSessions WHERE SessionID = ?')
      .bind(sessionID)
      .run();
    userID = results[0]?.['UserID'] as UserID | undefined;
    if (!success || !userID) {
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
    const object = await env.bucket.get(userID);
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
    await env.bucket.put(userID, text);
    return new Response(null, { status: 200 });
  }

  return new Response('Something went wrong', { status: 500 });
};
