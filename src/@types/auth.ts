/** The signed-in Appwrite user, as much of it as the web app needs. */
export type CurrentUser = {
  id: string
  email: string
}

/** A code has been sent; the code step needs both to finish signing in. */
export type PendingSignIn = {
  email: string
  userId: string
}

/** What the sign-in server functions answer with. */
export type AuthResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; message: string }
