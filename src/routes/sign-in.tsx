import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

import type { PendingSignIn } from '@/@types/auth'
import { CodeStep } from '@/components/auth/code-step'
import { EmailStep } from '@/components/auth/email-step'
import { Card } from '@/components/ui/card'
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
  const [pending, setPending] = useState<PendingSignIn>()

  return (
    <main className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        {pending ? (
          <CodeStep
            pending={pending}
            onChangeEmail={() => setPending(undefined)}
          />
        ) : (
          <EmailStep onSent={setPending} />
        )}
      </Card>
    </main>
  )
}
