# TODO

## MAYBE

- switch to only storing token hashes to mitigate risk of leaking

## SECURITY

- ~~disallow simple requests (i.e. disallow text/plain)~~
- ~~mitigate client-side csrf~~
- ~~mitigate xss~~
- implement session deletion endpoint (user controlled)
- put limits on storage payloads (size, etc.)
- add logging https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#logging-sessions-life-cycle-monitoring-creation-usage-and-destruction-of-session-ids
- double check xss, injection, csp, csrf, replay, fixation, hijacking, etc.
  - e.g. check all queries are prepared statements

## ACCOUNTS

- decouple from authn providers (e.g. handle google account closure)

## DEPLOY

- measure / adapt db solution for performance
- add tests (use vite)
- add ci/cd stuff instead of cli deploy
