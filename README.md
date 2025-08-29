# AuthSave (Cloudflare Worker)

## Overview

Learning project to implement a Cloudflare Worker that adds authentication & authorisation in front of Cloudflare R2 object storage.

- Implements server-side verification steps of 'Sign in with Google' (authentication)
- Issues access and refresh tokens via secure, HTTP-only cookies (part of authorisation)
- Attempts to mitigate CSRF risk
- Allows client to GET and PUT a single object (requires successful authorisation)

## Code of Interest

- [index.ts](/src/index.ts) – this is the main request handler; it can be read top-to-bottom for a good overview
- [verify-google-jwt.ts](/src/verifiers/verify-google-jwt.ts) – uses the `jose` library to verify Google ID token (JWT) received after a user completes 'Sign in with Google'; also handles CSRF mitigation
- [create-unique-token.ts](/src/session/token/create-unique-token.ts) – for generating opaque 128-bit tokens, e.g. the access & refresh tokens issued to clients
- [create-session.ts](/src/session/create-session.ts) – creates new session stored in Cloudflare D1 and issues credentials to client
- [create-csrf-token.ts](src/common/utils/csrf/create-csrf-token.ts) – generates anti-CSRF tokens based on OWASP's 'Signed Double-Submit Cookie' pattern

## Points for Improvement

- Architecturally, this _could_ be divided into two Workers:
  1. **Auth endpoint**: verify 3rd-party credentials (authn) and handle access & refresh tokens (authz)
  2. **Object endpoint**: verify access-token to authorise operations against objects
- Imports could be less cluttered (especially in [index.ts](src/index.ts)) by using grouped exports and/or path aliases
