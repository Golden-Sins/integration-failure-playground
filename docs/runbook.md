# Debugging Runbook

## 401 UNAUTHORIZED
**Meaning:** Missing/invalid/expired token  
**Check:** Authorization header `Bearer <token>`  
**Fix:** Call `POST /auth/token` again (tokens expire quickly)

## 403 FORBIDDEN
**Meaning:** Token valid, missing scope  
**Fix:** Request token with scope including required permissions:
`orders:write` or `payments:write`

## 400 BAD REQUEST
**Meaning:** Validation error or missing headers  
**Fix:** Check JSON types and required fields (e.g. `amount` must be a number, not a string)

## 409 CONFLICT
**Meaning:** Duplicate Idempotency-Key  
**Fix:** Generate a new Idempotency-Key for each create request

## 429 TOO MANY REQUESTS
**Meaning:** Rate limited  
**Fix:** Respect `Retry-After` and retry with exponential backoff

## 500 UPSTREAM_ERROR (simulated)
**Meaning:** Flaky dependency  
**Fix:** Retry with backoff, compare successful vs failing requests, correlate using `X-Request-Id`