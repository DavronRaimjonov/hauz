import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

import type { PendingSignIn } from '@/@types/auth'
import { CodeStep } from '@/components/auth/code-step'
import { EmailStep } from '@/components/auth/email-step'
import { Card } from '@/components/ui/card'
import { currentUserQuery } from '@/lib/auth'
import { safeRedirect } from '@/lib/redirect'

export const Route = createFileRoute('/sign-in')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  beforeLoad: ({ context, search }) => {
    if (context.user) {
      throw redirect({ href: safeRedirect(search.redirect) })
    }
  },
  component: SignIn,
})

function SignIn() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const search = Route.useSearch()
  const [pending, setPending] = useState<PendingSignIn>()

  const onSignedIn = async () => {

    await queryClient.invalidateQueries({ queryKey: currentUserQuery.queryKey })
    await router.invalidate()
    await router.navigate({ href: safeRedirect(search.redirect), replace: true })
  }

  return (
    <main className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        {pending ? (
          <CodeStep
            pending={pending}
            onSignedIn={onSignedIn}
            onChangeEmail={() => setPending(undefined)}
          />
        ) : (
          <EmailStep onSent={setPending} />
        )}
      </Card>
    </main>
  )
}
