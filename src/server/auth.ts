import { createServerFn } from '@tanstack/react-start'
import { AppwriteException, ID } from 'node-appwrite'
import { z } from 'zod'

import type { AuthResult, CurrentUser } from '@/@types/auth'

import {
  clearSessionCookie,
  createAdminClient,
  createSessionClient,
  getSessionSecret,
  setSessionCookie,
} from './appwrite'
import { recordFailedAttempt, resetAttempts, tooManyAttempts } from './attempts'

export const requestEmailCode = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.email() }))
  .handler(async ({ data }): Promise<AuthResult<{ userId: string }>> => {
    const { account } = createAdminClient()

    try {
      const token = await account.createEmailToken({
        userId: ID.unique(),
        email: data.email,
      })

      return { ok: true, data: { userId: token.userId } }
    } catch (error) {
      console.error('createEmailToken failed', error)

      return {
        ok: false,
        message: 'We could not send a code right now. Please try again.',
      }
    }
  })

export const verifyEmailCode = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      userId: z.string().min(1).max(36),
      code: z.string().regex(/^\d{6}$/),
    }),
  )
  .handler(async ({ data }): Promise<AuthResult> => {
    if (tooManyAttempts(data.userId)) {
      return {
        ok: false,
        message: 'Too many wrong codes. Wait 15 minutes and try again.',
      }
    }

    const { account } = createAdminClient()

    try {
      // Created with the API key, so the response includes the session
      // secret. It goes straight into an httpOnly cookie.
      const session = await account.createSession({
        userId: data.userId,
        secret: data.code,
      })

      resetAttempts(data.userId)
      setSessionCookie(session.secret, new Date(session.expire))

      return { ok: true, data: undefined }
    } catch (error) {
      if (error instanceof AppwriteException && error.code === 401) {
        recordFailedAttempt(data.userId)

        return { ok: false, message: 'That code is wrong or has expired.' }
      }

      console.error('createSession failed', error)

      return {
        ok: false,
        message: 'We could not sign you in right now. Please try again.',
      }
    }
  })

/**
 * The signed-in user, or null.
 *
 * Only a 401 from Appwrite means the session is gone, so only then is the
 * cookie deleted. Any other failure (Appwrite down, a timeout) is treated as
 * signed out for this request but keeps the cookie, so a blip does not log
 * everyone out.
 */
export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CurrentUser | null> => {
    const secret = getSessionSecret()
    if (!secret) {
      return null
    }

    try {
      const user = await createSessionClient(secret).account.get()

      return { id: user.$id, email: user.email }
    } catch (error) {
      if (error instanceof AppwriteException && error.code === 401) {
        clearSessionCookie()
      } else {
        console.error('Loading the current user failed', error)
      }

      return null
    }
  },
)

/**
 * Ends the Appwrite session as well as deleting the cookie, so the secret is
 * useless even if it was copied somewhere. The cookie goes either way.
 */
export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const secret = getSessionSecret()

  if (secret) {
    try {
      await createSessionClient(secret).account.deleteSession({
        sessionId: 'current',
      })
    } catch (error) {
      // Already expired or deleted: nothing left to end.
      if (!(error instanceof AppwriteException && error.code === 401)) {
        console.error('deleteSession failed', error)
      }
    }
  }

  clearSessionCookie()
})
