import { isSessionIdValid } from './is-session-id-valid';

export const throwOnInvalidSessionId = (sessionId: string) => {
  if (!isSessionIdValid(sessionId)) {
    throw Error();
  }
};
