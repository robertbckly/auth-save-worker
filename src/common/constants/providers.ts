export type Provider = {
  prefix: string;
  pathname: `/${string}`;
  expectedContentType: string;
  csrf: {
    keyInBody: string;
    keyInCookie: string;
  };
  jwt: {
    keyInBody: string;
    urlForJWKS: string;
    issuer: string;
    audience: string;
    emailSuffix: string;
    keyForUserId: string;
    keyForEmail?: string;
    keyForEmailVerified?: string;
  };
};

export const PROVIDERS = {
  google: {
    prefix: 'google',
    pathname: '/google',
    expectedContentType: 'application/x-www-form-urlencoded',
    csrf: {
      keyInBody: 'g_csrf_token',
      keyInCookie: 'g_csrf_token',
    },
    jwt: {
      keyInBody: 'credential',
      urlForJWKS: 'https://www.googleapis.com/oauth2/v3/certs',
      issuer: 'https://accounts.google.com',
      audience: '316817011021-b176pu0pre4vjqlt0uiro9gr25gfbfce.apps.googleusercontent.com',
      emailSuffix: '@gmail.com',
      keyForUserId: 'sub',
      keyForEmail: 'email',
      keyForEmailVerified: 'email_verified',
    },
  },
} as const satisfies Record<string, Provider>;
