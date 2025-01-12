import { APP_URL } from '../common/constants/config';

export const handleUnauthorised = (): Response =>
  new Response('Unauthorized', {
    status: 401,
    headers: {
      'Access-Control-Allow-Origin': APP_URL,
      'Access-Control-Allow-Credentials': 'true',
    },
  });
