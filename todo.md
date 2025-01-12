# TODO

- ~~generate 64-bit opaque session token~~
- ~~bind a D1 instance for session storage~~
- ~~add GET/PUT routing at root path~~
- ~~check authz for each route~~
- ~~bind an R2 instance for object storage~~
- ~~read/write object on request~~
- ~~read object in frontend app~~
- ~~write similar find-user-id fn that also checks length of session id~~
- ~~session listing for current user (new endpoint)~~
- ~~COOKIE: fix samesite / crossorigin~~

- AUTHN
  - decouple from authn providers
- PERF
  - speed up session db via index? or redis?
- SECURITY

  - COOKIE

    - bind to other client info, e.g. user-agent... and reject + remove session on fail
    - limit number of sessions (x4; FIFO)
    - allow user to delete session (i.e. sign out from all devices)
    - rolling renewal; rotation; absolute expiry
    - prevent fixation: https://developer.mozilla.org/en-US/docs/Web/Security/Types_of_attacks#session_fixation
    - add logging https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#logging-sessions-life-cycle-monitoring-creation-usage-and-destruction-of-session-ids

  - OBJECT PAYLOAD

    - max size
    - encryption
    - xss prevention
    - antivirus approach required?

  - CSP / XSS / CSRF / replay / ?

- PIPELINE
  - add tests (use vite)
  - add ci/cd stuff instead of cli deploy
