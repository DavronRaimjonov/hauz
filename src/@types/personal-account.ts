import type { z } from 'zod'

import type {
  onboardingSchema,
  profileUpdateSchema,
} from '@/lib/personal-account'

export type Role = 'property_owner' | 'realtor'

/** The Personal Account as the Function returns it. */
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

/**
 * "missing" means the person has not onboarded yet, which is normal.
 * "unavailable" means we could not find out; callers must not treat that as
 * missing, or a Function outage would send everyone back to onboarding.
 */
export type PersonalAccountLookup =
  | { status: 'found'; account: PersonalAccount }
  | { status: 'missing' }
  | { status: 'unavailable' }

/** What creating or updating the account answers with. */
export type PersonalAccountResult =
  | { ok: true; account: PersonalAccount }
  | { ok: false; message: string }

// Derived from the schemas so the types and the validation cannot drift apart.
export type OnboardingInput = z.infer<typeof onboardingSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
