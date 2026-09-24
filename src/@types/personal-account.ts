import type { z } from 'zod'

import type {
  onboardingSchema,
  profileUpdateSchema,
} from '@/lib/personal-account'

export type Role = 'property_owner' | 'realtor'

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

export type PersonalAccountLookup =
  | { status: 'found'; account: PersonalAccount }
  | { status: 'missing' }
  | { status: 'unavailable' }

export type PersonalAccountResult =
  | { ok: true; account: PersonalAccount }
  | { ok: false; message: string }

export type OnboardingInput = z.infer<typeof onboardingSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
