import { parse } from 'cookie';
import { SESSION_COOKIE } from '../constants/config';
import type { UserID } from '../types/user-id';

const VALID_METHODS = ['GET', 'PUT'] as const;

const isValidMethod = (method: string): method is (typeof VALID_METHODS)[number] =>
  (VALID_METHODS as Readonly<string[]>).includes(method);

export const handleReadWrite = async (request: Request, env: Env): Promise<Response> => {
  const method = request.method;
  if (!isValidMethod(method)) {
    return new Response('Method not allowed', { status: 405 });
  }

  const cookies = parse(request.headers.get('Cookie') || '');
  const sessionID = cookies[SESSION_COOKIE];

  let userID: UserID | undefined;

  try {
    // Get `UserID` via matching `SessionID`
    const { results, success } = await env.db
      .prepare('SELECT UserId FROM UserSessions WHERE SessionID = ?')
      .bind(sessionID)
      .run();
    userID = results[0]?.['UserID'] as UserID | undefined;
    if (!success || !userID) {
      throw Error();
    }
  } catch {
    // Forbidden if no SessionID <-> UserID match found
    return new Response('Forbidden', {
      status: 403,
      headers: {
        'Access-Control-Allow-Origin': 'https://localhost:1234',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  // User at `userID` is now authorised...

  if (method === 'GET') {
    const object = await env.bucket.get(userID);
    const text = await object?.text();
    return new Response(text, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://localhost:1234',
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
