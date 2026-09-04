# Event Management System deployment

Deploy `frontend/` and `backend/` as separate Node.js applications. The
frontend is a Next.js server application, not a static export.

## Local development

The backend defaults to `http://localhost:5000` and the frontend runs at
`http://localhost:3000`. Browser API requests still use `/api/*`; Next.js
proxies them to Express, matching production behavior.

Copy the example environment files, fill in the backend database and mail
secrets, then run `npm install` and `npm run dev` in each application.

## Hostinger frontend application

- Application root: `frontend/`
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm start`
- Public URL: `https://lightsalmon-rail-268280.hostingersite.com`
- Environment:

```text
BACKEND_ORIGIN=https://darkorchid-pheasant-216565.hostingersite.com
```

Remove `NEXT_PUBLIC_API_URL` if it is currently configured. It is intentionally
not used: all browser login, logout, session, and application API requests must
stay on the frontend origin so `Set-Cookie` creates a frontend-origin cookie.

## Hostinger backend application

- Application root: `backend/`
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm start`
- Public URL: `https://darkorchid-pheasant-216565.hostingersite.com`
- Required authentication environment:

```text
NODE_ENV=production
FRONTEND_URL=https://lightsalmon-rail-268280.hostingersite.com
COOKIE_DOMAIN=
```

Keep `COOKIE_DOMAIN` unset or empty. Do not set it to `.hostingersite.com`;
the browser must receive a host-only cookie through the frontend proxy.
Hostinger may supply `PORT`; use its assigned value if the platform requires
you to configure it.

The backend also needs the existing production `DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`, and `DB_NAME` values. Mail workflows need the existing
`MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASSWORD`,
`MAIL_FROM_NAME`, and `MAIL_FROM_ADDRESS` values.

## Verification after redeployment

Confirm the backend health endpoints first:

```text
https://darkorchid-pheasant-216565.hostingersite.com/api/health
https://darkorchid-pheasant-216565.hostingersite.com/api/db-health
```

Then sign in through the frontend, verify the login response contains a
`Set-Cookie` header, refresh the appropriate dashboard, and sign out. Browser
requests should target the frontend URL under `/api/*`, never the backend URL.
