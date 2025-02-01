import { PROVIDERS, type Provider } from '../constants/providers';
import { TRAILING_SLASH_REGEX } from '../constants/regex';

export const getProviderForRoute = (route: string): Provider | null => {
  const providerObjects = Object.values(PROVIDERS);
  const matchedProvider = providerObjects.find(
    (provider) =>
      // Ensure trailing slashes don't mess this up
      provider.pathname.replace(TRAILING_SLASH_REGEX, '') ===
      route.replace(TRAILING_SLASH_REGEX, '')
  );
  return matchedProvider || null;
};
