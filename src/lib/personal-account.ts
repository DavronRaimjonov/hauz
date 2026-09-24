/**
 * The Personal Account as the web app sees it. Mirrors the Function's rules so
 * forms can explain a problem before sending; the Function still validates
 * everything itself.
 */
import { z } from 'zod'

export const ROLES = ['property_owner', 'realtor'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  property_owner: 'Property Owner',
  realtor: 'Realtor',
}

export type PersonalAccount = {
  personalAccountId: string
  firstName: string
  lastName: string
  role: Role
  contactEmail: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
}

const name = z.string().trim().min(1, 'Required').max(100)

export const onboardingSchema = z.object({
  firstName: name,
  lastName: name,
  role: z.enum(ROLES, 'Choose a role'),
})
export type OnboardingInput = z.infer<typeof onboardingSchema>

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
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
