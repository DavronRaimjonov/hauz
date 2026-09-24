# HAUZ sign-in

Sign in with an emailed code, onboarding, a profile page, and a server-rendered
header, built on TanStack Start and Appwrite. What was asked is in `TASK.md`;
the decisions behind it are in `NOTES.md`.

## What you need

- Node 22 or newer
- A free Appwrite Cloud account at https://cloud.appwrite.io

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Point the config at your Appwrite project

In the Appwrite Console, create a new project. From **Overview**, copy the
**Project ID** and the **API Endpoint** (region specific, for example
`https://fra.cloud.appwrite.io/v1`).

`appwrite.config.json` currently holds the project this was developed against.
Replace `projectId` and `endpoint` with yours.

### 3. Push the database, table and Function

```bash
npx appwrite login
npm run appwrite:push
```

This creates the `main` database, the `personal_accounts` table with its unique
index, and deploys the `personal-account` Function. In the Console the Function
should show a ready deployment with **Execute access** `users`.

`appwrite push table` deletes tables that are not in `appwrite.config.json`.
Only run it against a fresh project.

### 4. Create an API key

Console, **Overview**, **Integrations**, **API keys**, **Create API key**, with
these scopes:

- `sessions.write`
- `users.read`
- `users.write`
- `execution.write`

### 5. Fill in your environment

```bash
cp .env.example .env
```

Fill in `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID` and `APPWRITE_API_KEY`.
`.env` is git-ignored. The server validates these on the first request and
names any that are missing.

### 6. Run it

```bash
npm run dev
```

Open http://localhost:3000, click **Sign in**, and enter an email you can read.
Appwrite Cloud sends the code from its own mail server, so check spam. If
nothing arrives, wait a few minutes rather than resending: Cloud rate limits.

## Scripts

```bash
npm run dev             dev server on port 3000
npm run build           production build
npm run typecheck       tsc --noEmit
npm run appwrite:push   push the table and Function to Appwrite
```

## Pages

| Path | Who sees it |
|---|---|
| `/` | Everyone |
| `/sign-in` | Signed out. Takes `?redirect=` and returns there after sign-in (same-site paths only) |
| `/onboarding` | Signed in without a Personal Account. Everyone else is sent past it |
| `/profile` | Signed in. Signed-out visitors sign in first and come back |

## Where things are

```
src/
  @types/           shared types, one file per area
  server/           server functions, the Appwrite clients and the session
                    cookie, plus mutation.ts: the client hooks that call them
    appwrite.ts     Appwrite clients and the httpOnly session cookie
    auth.ts         request code, verify code, current user, log out
    attempts.ts     cap on wrong codes
    personal-account.ts   calls the Function with the user's session
    mutation.ts     React Query mutation hooks
  lib/              shared helpers: queries, schemas, safe redirect
  components/       UI, grouped by area (auth, layout, onboarding, profile, form)
  routes/           pages; the root route loads the user for every request
functions/personal-account/   the Appwrite Function (unchanged)
appwrite.config.json          database, table and Function definitions
```

## How a request flows

```
Browser  --server function-->  TanStack Start server  --node-appwrite-->  Appwrite
                               (API key and session secret live here only)
```

The browser never talks to Appwrite and never sees the API key or the session
secret. The secret is kept in an `httpOnly` cookie. Profile data is read and
written only by executing the `personal-account` Function with the user's
session, so the Function identifies the caller itself.

## The Function

One Appwrite Function with three routes, deployed with **Execute access:
users**.

| Route | Body | Result |
|---|---|---|
| `GET /personal-account` | | `200` with the account, `404` if the caller has none |
| `POST /personal-account` | `firstName`, `lastName`, `role` | `201` created, `200` if it already exists, `409` if it exists with a different role |
| `PATCH /personal-account` | any of `firstName`, `lastName`, `contactEmail`, `bio` | `200` with the updated account |

On `PATCH`, a field left out keeps its stored value and `null` clears it. Every
route answers `401` when the execution has no signed-in Appwrite user.
