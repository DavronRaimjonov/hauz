/**
 * The Personal Account as the web app sees it. Mirrors the Function's rules so
 * forms can explain a problem before sending; the Function still validates
 * everything itself.
 */
import { z } from 'zod'

import type { Role } from '@/@types/personal-account'

export const ROLES = ['property_owner', 'realtor'] as const satisfies Role[]

export const ROLE_LABELS: Record<Role, string> = {
  property_owner: 'Property Owner',
  realtor: 'Realtor',
}

const name = z.string().trim().min(1, 'Required').max(100)

export const onboardingSchema = z.object({
  firstName: name,
  lastName: name,
  role: z.enum(ROLES, 'Choose a role'),
})

/**
 * A partial edit. A field left out keeps its stored value and null clears it.
 * There is deliberately no user id here: the Function takes the caller from
 * the session, never from the body.
 */
export const profileUpdateSchema = z
  .object({
    firstName: name.optional(),
    lastName: name.optional(),
    contactEmail: z.email('Enter a valid email').max(254).nullable().optional(),
    bio: z.string().trim().min(1).max(2000).nullable().optional(),
  })
  .refine((fields) => Object.keys(fields).length > 0, 'Nothing to update')
