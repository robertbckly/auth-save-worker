# TODO

- ~~generate 64-bit opaque session token~~
- ~~bind a D1 instance for session storage~~
- ~~add GET/PUT routing at root path~~
- ~~check authz for each route~~
- ~~bind an R2 instance for object storage~~
- ~~read/write object on request~~
- ~~read object in frontend app~~
- ~~write similar find-user-id fn that also checks length of session id~~
- cookie:
  - investigate samesite / crossorigin
  - handle session expiry (IMPORTANT)
- decouple from authn providers
- write tests (use vite)
- add ci/cd stuff instead of cli deploy
- speed up session db via index?
