import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { OnboardingCard } from '@/components/onboarding/onboarding-card'
import { safeRedirect } from '@/lib/redirect'

export const Route = createFileRoute('/onboarding')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  beforeLoad: ({ context, location, search }) => {
    if (!context.user) {
      throw redirect({ to: '/sign-in', search: { redirect: location.href } })
    }
    // Someone who already has an account skips this.
    if (context.account?.status === 'found') {
      throw redirect({ href: safeRedirect(search.redirect) })
    }

    return { user: context.user }
  },
  component: Onboarding,
})

function Onboarding() {
  return (
    <main className="mx-auto flex max-w-lg justify-center px-4 py-12">
      <OnboardingCard />
    </main>
  )
}
