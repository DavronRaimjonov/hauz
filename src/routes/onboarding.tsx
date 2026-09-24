import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { OnboardingForm } from '@/components/onboarding/onboarding-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Welcome to HAUZ</CardTitle>
          <CardDescription>
            Tell us a little about yourself to finish setting up your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </main>
  )
}
