import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { z } from 'zod'

import type { PersonalAccount } from '@/@types/personal-account'
import { OnboardingForm } from '@/components/onboarding/onboarding-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cachePersonalAccount } from '@/lib/auth'
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
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = Route.useRouteContext()
  const search = Route.useSearch()

  const onCreated = async (account: PersonalAccount) => {
    cachePersonalAccount(queryClient, user.id, account)
    await router.navigate({ href: safeRedirect(search.redirect), replace: true })
  }

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
          <OnboardingForm onCreated={onCreated} />
        </CardContent>
      </Card>
    </main>
  )
}
