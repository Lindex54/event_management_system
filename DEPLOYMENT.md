# Event Management System deployment

The frontend and backend are separate Node.js applications. Deploy `frontend/`
as the website and `backend/` as the API. Do not combine their application roots.

## 1. Local development

Prerequisites: a supported Node.js version, npm, and MySQL on
`localhost:3306`. Import the existing project schema using the project's current
database setup process; deployment preparation does not change that schema.

Create local environment files from the safe examples:

```powershell
Copy-Item frontend/.env.example frontend/.env.local
Copy-Item backend/.env.example backend/.env
```

Set the real local MySQL and Gmail values only in `backend/.env`. Never commit
either local environment file.

Install dependencies if needed, then start each app in its own terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

```powershell
Set-Location backend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`; the backend runs at
`http://localhost:5000`.

## 2. Two deployment shapes — pick based on your domains

**Shape A — you own one domain and can point both apps at subdomains of it**
(e.g. `app.example.com` + `api.example.com`). Use direct cross-origin calls:
set `NEXT_PUBLIC_API_URL` to the backend's origin and `COOKIE_DOMAIN` to the
shared parent (`.example.com`).

**Shape B — Hostinger's free auto-generated subdomains** (the
`xxxxx.hostingersite.com` pattern), or any case where the frontend and
backend end up on two domains that share no parent you control. This is the
common case when you haven't attached a custom domain yet. Two unrelated
`*.hostingersite.com` apps are **not** the same site for cookie purposes —
`hostingersite.com` itself is the shared platform domain, not something you
own, so a cookie's `Domain` attribute can never bridge them. Setting
`COOKIE_DOMAIN=.hostingersite.com` does not work — browsers silently reject a
cookie whose `Domain` is a public hosting-platform suffix. The symptom is
exactly "login shows success, then bounces straight back to the login page,"
because the session cookie never actually gets stored.

**Use Shape B unless you have confirmed both apps share a parent domain you
control.** It works everywhere, including Shape A's setup, so it's the safe
default.

### Shape B: the rewrite proxy

Leave `NEXT_PUBLIC_API_URL` empty and set a server-only `BACKEND_ORIGIN` on
the **frontend** app instead. `frontend/next.config.ts` then transparently
proxies `/api/*` and `/uploads/*` through the Next.js server to the backend,
so every request the browser makes is same-origin. The backend's session
cookie ends up scoped to the frontend's own domain (no `Domain` attribute
needed — leave `COOKIE_DOMAIN` blank), and it survives page navigations.

## 3. Frontend environment variables

| Variable | Local value | Shape A (shared domain) | Shape B (Hostinger default) |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | `https://api.YOUR_DOMAIN` | *(empty)* |
| `BACKEND_ORIGIN` | *(unset)* | *(unset)* | `https://api-xxxx.hostingersite.com` |

`NEXT_PUBLIC_API_URL` is public and is embedded into browser code during
`npm run build`. `BACKEND_ORIGIN` is server-only and never reaches the
browser. Set whichever pair applies **before** running the build — Next.js
bakes `NEXT_PUBLIC_*` values in at build time, so changing it later requires
a rebuild, not just a restart.

## 4. Backend environment variables

| Variable | Local/default example | Production guidance | Required |
| --- | --- | --- | --- |
| `NODE_ENV` | `development` | `production` | Yes |
| `PORT` | `5000` | Let Hostinger supply its assigned port | Host-dependent |
| `FRONTEND_URL` | `http://localhost:3000` | `https://YOUR_DOMAIN` (whatever the frontend app's real URL is) | Yes |
| `COOKIE_DOMAIN` | blank | Blank for Shape B. `.YOUR_DOMAIN` only for Shape A | Shape A only |
| `DB_HOST` | `localhost` | Hostinger MySQL hostname | Yes |
| `DB_PORT` | `3306` | Hostinger MySQL port | Yes |
| `DB_USER` | Local MySQL user | Hostinger MySQL user | Yes |
| `DB_PASSWORD` | Local MySQL password | Hostinger MySQL password | May be blank only locally |
| `DB_NAME` | `event_management_system` | Hostinger MySQL database name | Yes |
| `MAIL_HOST` | `smtp.gmail.com` | `smtp.gmail.com` | Yes for mail |
| `MAIL_PORT` | `465` | `465` | Yes for mail |
| `MAIL_SECURE` | `true` | `true` for port 465 | Yes for mail |
| `MAIL_USER` | Gmail address | Gmail address | Yes for mail |
| `MAIL_PASSWORD` | Gmail App Password | Gmail App Password | Yes for mail |
| `MAIL_FROM_NAME` | `Event Management System` | Public sender name | Yes for mail |
| `MAIL_FROM_ADDRESS` | Sender address | Authorized sender address | Yes for mail |

In production, cookies are always HTTP-only, secure, and `SameSite=Lax`.

## 5. Hostinger frontend application

- Application root: `frontend/`
- Install command: `npm install` (do **not** use a production-only/`--omit=dev`
  install — `package.json` now keeps every build-time package, including
  `typescript` and `tailwindcss`, in `dependencies` specifically so a
  production-only install still works, but a plain `npm install` is still the
  safest choice)
- Build command: `npm run build`
- Start command: `npm start`
- Environment (Shape B): `NEXT_PUBLIC_API_URL=` (empty) and
  `BACKEND_ORIGIN=https://api-xxxx.hostingersite.com`, set before the build
- Public URL: `https://YOUR_DOMAIN`

This is a Next.js Node.js Web App and must not be configured as a static export.

## 6. Hostinger backend application

- Application root: `backend/`
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm start`
- Public URL/subdomain: `https://api.YOUR_DOMAIN`
- Entry point run by the start script: `dist/server.js`
- Environment: `FRONTEND_URL=https://YOUR_DOMAIN` (the frontend app's real
  URL), `COOKIE_DOMAIN=` (empty, for Shape B)

The backend reads Hostinger's `PORT` at runtime and trusts the platform's first
reverse-proxy hop. Do not set a production database user to `root` unless that is
the actual restricted user Hostinger assigned.

## 7. API URL and CORS

For Shape B, set the backend's `FRONTEND_URL` to the frontend's real HTTPS
origin (used for the CORS allowlist — direct browser calls to the backend are
rare once the rewrite proxy is in place, but the backend still accepts them
from this exact origin). Both `FRONTEND_URL` and `BACKEND_ORIGIN` are origins
only: no path such as `/api` and no trailing slash.

Example placeholders (Shape B):

```text
# Frontend app environment
NEXT_PUBLIC_API_URL=
BACKEND_ORIGIN=https://api-xxxx.hostingersite.com

# Backend app environment
FRONTEND_URL=https://app-xxxx.hostingersite.com
COOKIE_DOMAIN=
```

Replace every placeholder with the real Hostinger-assigned (or custom) URLs.

## 8. MySQL

Create the production MySQL database and user in Hostinger, import the existing
schema/data through the approved Hostinger database workflow, then set all five
`DB_*` variables. The application uses a `mysql2/promise` connection pool. It
does not hardcode `root` or log the database password.

## 9. Gmail mail delivery

Set all `MAIL_*` values in the backend application environment. For Gmail, use
an App Password rather than an account password. Keep the password only in
Hostinger's secret/environment settings. The frontend has no SMTP credentials.

## 10. Post-deployment checks

After both apps are deployed, test:

```text
https://api-xxxx.hostingersite.com/api/health
https://api-xxxx.hostingersite.com/api/db-health
```

The first confirms the Express process is reachable. The second confirms the
production MySQL connection. Then test login, page refresh while authenticated,
logout, and one mail-producing workflow over HTTPS.
