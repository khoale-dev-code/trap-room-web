# TRAP Room Production Admin Login V25.4

## Browser console interpretation

- `/api/auth/me` returning 401 before login is expected. It means there is no
  session cookie yet.
- React DevTools output is informational, not an authentication failure.
- `/api/auth/login` returning 500 is the real server error.

## Server hardening

V25.4 keeps owner and employee authentication separate. A wrong owner
password returns 401 immediately and never falls through to Employee lookup.

For a valid staff login, the old code changed `lastLoginAt` and then called
`employee.save()`. That validates the entire Employee document. Legacy
documents can fail validation when the schema has gained required fields,
causing an otherwise valid login to return 500.

V25.4 updates only the two activity timestamps with `Employee.updateOne()` and
`runValidators: false`.

Because Vercel reverse-proxies `/api` under the same browser origin, the
session cookie uses `SameSite=Lax`, `Secure` in production and `HttpOnly`.
This is more reliable on Safari than treating the cookie as third-party.

The patch never logs usernames, passwords, JWTs or cookies.
