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
- ~~COOKIE: bind to other client info, e.g. user-agent... and reject + remove session on fail~~

NEXT UP >>>>>

- implement short-lived (1h) session cookie w/ long-lived (30d) refresh cookie
- add path to refresh cookie so it's only sent to specific /refresh endpoint
- client should know to proactively hit refresh endpoint to ensure seamless UX
- refresh causes rotation of both tokens
- regen csrf token with every refresh token use (OWASP say don't both for every request)

- CSRF:
  https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#disallowing-simple-requests
  https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#dealing-with-client-side-csrf-attacks-important

- XSS: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

^ >>>>>

- AUTHN
  - decouple from authn providers
- PERF
  - speed up session db via index? or redis?
- SECURITY
  - COOKIE
    - anti-CSRF token
      - https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
      - ^ must use private session ID
      - must research how to expose token to JS
    - rolling renewal; rotation; absolute expiry NEXT UP <<<<
    - allow user to delete session (i.e. sign out from all devices)
    - add logging https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#logging-sessions-life-cycle-monitoring-creation-usage-and-destruction-of-session-ids
  - OBJECT PAYLOAD
    - max size
    - encryption
    - xss prevention
    - antivirus approach required?
  - CSP / XSS / CSRF / replay / ?
    - CSRF: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
    - fixation: https://developer.mozilla.org/en-US/docs/Web/Security/Types_of_attacks#session_fixation
- PIPELINE
  - add tests (use vite)
  - add ci/cd stuff instead of cli deploy
