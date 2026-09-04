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

## 2. Frontend environment variables

| Variable | Local value | Production value | Required |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | `https://api.YOUR_DOMAIN` | Yes |

`NEXT_PUBLIC_API_URL` is public and is embedded into browser code during
`npm run build`. Set the production value in Hostinger before building. Do not
append `/api` or a trailing slash.

## 3. Backend environment variables

| Variable | Local/default example | Production guidance | Required |
| --- | --- | --- | --- |
| `NODE_ENV` | `development` | `production` | Yes |
| `PORT` | `5000` | Let Hostinger supply its assigned port | Host-dependent |
| `FRONTEND_URL` | `http://localhost:3000` | `https://YOUR_DOMAIN` | Yes |
| `COOKIE_DOMAIN` | blank | `.YOUR_DOMAIN` | Yes for subdomain sessions |
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

`COOKIE_DOMAIN` lets cookies issued by `api.YOUR_DOMAIN` also reach the Next.js
proxy at `YOUR_DOMAIN`. Leave it blank on localhost. In production, cookies are
HTTP-only, secure, and `SameSite=Lax`.

## 4. Hostinger frontend application

- Application root: `frontend/`
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm start`
- Environment: set `NEXT_PUBLIC_API_URL=https://api.YOUR_DOMAIN` before the build
- Public URL: `https://YOUR_DOMAIN`

This is a Next.js Node.js Web App and must not be configured as a static export.

## 5. Hostinger backend application

- Application root: `backend/`
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm start`
- Public URL/subdomain: `https://api.YOUR_DOMAIN`
- Entry point run by the start script: `dist/server.js`

The backend reads Hostinger's `PORT` at runtime and trusts the platform's first
reverse-proxy hop. Do not set a production database user to `root` unless that is
the actual restricted user Hostinger assigned.

## 6. API URL and CORS

Set the frontend's `NEXT_PUBLIC_API_URL` to the backend's HTTPS origin. Set the
backend's `FRONTEND_URL` to the frontend's HTTPS origin. Both are origins only:
no path such as `/api` and no wildcard. Credentialed CORS is enabled for exactly
`FRONTEND_URL`.

Example placeholders:

```text
NEXT_PUBLIC_API_URL=https://api.YOUR_DOMAIN
FRONTEND_URL=https://YOUR_DOMAIN
COOKIE_DOMAIN=.YOUR_DOMAIN
```

Replace every `YOUR_DOMAIN` placeholder with the real domain.

## 7. MySQL

Create the production MySQL database and user in Hostinger, import the existing
schema/data through the approved Hostinger database workflow, then set all five
`DB_*` variables. The application uses a `mysql2/promise` connection pool. It
does not hardcode `root` or log the database password.

## 8. Gmail mail delivery

Set all `MAIL_*` values in the backend application environment. For Gmail, use
an App Password rather than an account password. Keep the password only in
Hostinger's secret/environment settings. The frontend has no SMTP credentials.

## 9. Post-deployment checks

After both apps are deployed, test:

```text
https://api.YOUR_DOMAIN/api/health
https://api.YOUR_DOMAIN/api/db-health
```

The first confirms the Express process is reachable. The second confirms the
production MySQL connection. Then test login, page refresh while authenticated,
logout, and one mail-producing workflow over HTTPS.
