# Agent prompts

> **Note:** this is not a full exported session. The prompts were
> reconstructed from the commit history, and each one links to the commit it
> produced. If the original session export is available, it should go here
> instead of, or next to, this file.

## 1. Understanding and setting up the project

**Prompt:**

> Read `TASK.md` and `README.md`. Explain the project structure, the API of
> the Appwrite Function (`functions/personal-account`), and how the starter
> sets up the router and queries. Don't change anything yet. If you see
> anything that goes against the task rules or looks unsafe, call it out
> separately.

**Prompt:**

> Add Tailwind CSS and shadcn/ui to the project. For now I only need the
> `button` component. Don't break the existing routes.

Commit: `3b718ec` feat: added tailwind css and shadcn

## 2. Shared QueryClient during SSR

**Prompt:**

> In `src/router.tsx` the `QueryClient` is created at module level. During
> SSR, doesn't that mean every visitor shares one cache? Check it. If so,
> create a separate client per request and add a short comment in the code
> explaining why.

Commit: `ad109d4` fix: create QueryClient per request instead of sharing one across SSR requests

## 3. Sign in with an email code

**Prompt:**

> Build sign-in with an email code: enter an email, get a code, enter the
> code, you're in. New and returning people see the same screens.
>
> Rules:
> - Every call to Appwrite goes through TanStack Start server functions. The
>   API key and the session secret must never reach the browser.
> - Store the session secret in an `httpOnly`, `SameSite=Lax` cookie, plus
>   `Secure` in production.
> - Make `src/server/appwrite.ts` server-only, so the build fails if browser
>   code imports it.
> - Use the shadcn `input-otp` component for entering the code.

**Prompt:**

> Isn't sending people to whatever page the `redirect` query parameter names
> an open redirect? Write a `safeRedirect` that only accepts paths on this
> site. Handle cases like `//evil.example` and `/\evil.example` too.

**Prompt:**

> Codes are verified with the API key, and Appwrite doesn't rate limit
> requests made with an API key. Limit wrong codes to 5 per 15 minutes.
> Requesting a new code must not reset the count.

Commit: `6d2b5ec` feat: sign in with an email code, session in an httpOnly cookie

## 4. Onboarding

**Prompt:**

> Build an onboarding page for people without a Personal Account: first
> name, last name, and a role (Property Owner or Realtor). The account must
> be created only through the Function. The web app must never touch the
> `personal_accounts` table directly. Call the Function with the user's
> session, not the API key, so Appwrite adds `x-appwrite-user-id` itself.

**Prompt:**

> Double-clicking "Continue" must never create two accounts. How do you
> guard against it on the client, and what guarantees it on the Function
> side?

**Prompt:**

> Treat a 404 from the Function (no account) differently from any other
> error (Function is down). Only send people to onboarding on a 404.

Commit: `8c30538` feat: onboarding creates the personal account through the Function

## 5. Profile page

**Prompt:**

> Build a `/profile` page to view and edit first name, last name, contact
> email and bio. Show the role but don't allow changing it. Contact email and
> bio are optional: clearing one should send `null`, not an empty string. A
> signed-out visitor who opens `/profile` should land back on `/profile`
> after signing in.

**Prompt:**

> The brief says the profile form should send the user's id along with the
> changes. Is that safe? Where does the Function get the user from? If it's
> unsafe, don't send the id.

Commit: `c4e60cb` feat: profile page to view and edit the personal account

## 6. Header and log out

**Prompt:**

> Every page needs a header showing either "Sign in", or the person's first
> name and a "Log out" button. It has to be right on the first paint after a
> hard refresh, so load the user on the server in the root route. Log out
> should delete the session and clear the cookie.

**Prompt:**

> The brief says to delete the cookie if loading the current user fails for
> any reason. Is that right? What happens if Appwrite is down for a moment?
> Only delete the cookie on a 401.

Commit: `99ba1bc` feat: server-rendered header with log out, onboarding redirect in root

## 7. Understanding the code

**Prompt:**

> Walk me through `src/server/auth.ts` and `src/server/attempts.ts` line by
> line, in Uzbek. I need to be able to explain them on the call without an
> agent.

The result was written to `lesson.md` and removed later.

Commit: `6af1b77` feat: create pages onboarding signin and profile

## 8. Refactoring

**Prompt:**

> Move the types into a `src/@types/` folder. Delete the unused `useAxios`
> and `useQuery` hooks.

Commit: `a23855f` refactor: reorganize types and delete hooks

**Prompt:**

> Move the mutations out of the components into self-contained hooks in
> `src/server/mutation.ts`. Behavior must not change.

Commit: `2478138` refactor: move mutations into self-contained hooks in src/server/mutation.ts

**Prompt:**

> Split the header, onboarding and profile UI into small components: form
> field, submit button, role picker, profile card, and so on.

Commit: `1fc0a6d` refactor: split header, onboarding and profile UI into components

## 9. Docs

**Prompt:**

> Write `NOTES.md`, one page at most: the main decisions, which parts of the
> brief I didn't follow and why, and next steps for production. Update the
> run steps in `README.md`.

Commit: `8d31853` feat: added NOTES.md

## Three things the agent got wrong that I caught

<!-- Only list things that actually happened, each linked to the commit that fixed it. -->

1. **TODO:** what the agent got wrong and how you caught it. Fix: `commit`
2. **TODO:** ...
3. **TODO:** ...
