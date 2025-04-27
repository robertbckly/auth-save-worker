# AuthSave

## Overview

Simple learning project to implement a Cloudflare Worker that adds authentication in front of Cloudflare R2 object storage.

- Implements server-side verification steps of 'Sign in with Google'
- Issues access and refresh tokens via secure HTTP-only cookies
- Attempts to mitigate CSRF risk
- Allows client to GET and PUT a single object

## Code of Interest

- [index.ts](/src/index.ts) – this is the main request handler; it can be read top-to-bottom for a good overview
- [verify-google-jwt.ts](/src/verifiers/verify-google-jwt.ts) – uses the `jose` library to verify Google ID token (JWT) received after a user completes 'Sign in with Google'; also handles CSRF mitigation
- [create-unique-token.ts](/src/session/token/create-unique-token.ts) – for generating opaque 128-bit tokens, e.g. the access & refresh tokens issued to clients
- [create-session.ts](/src/session/create-session.ts) – creates new session stored in Cloudflare D1 and issues credentials to client
- [create-csrf-token.ts](src/common/utils/csrf/create-csrf-token.ts) – generates anti-CSRF tokens based on OWASP's 'Signed Double-Submit Cookie' pattern
