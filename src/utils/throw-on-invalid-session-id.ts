import { isValidSessionId } from './is-valid-session-id';

export const throwOnInvalidSessionId = (sessionId: string) => {
  if (!isValidSessionId(sessionId)) {
    throw Error();
  }
};
