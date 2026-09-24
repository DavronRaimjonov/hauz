import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import type { PendingSignIn } from '@/@types/auth'
import { Button } from '@/components/ui/button'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRequestCodeMutation } from '@/server/mutation'

export function EmailStep({
  onSent,
}: {
  onSent: (pending: PendingSignIn) => void
}) {
  const [email, setEmail] = useState('')

  const send = useRequestCodeMutation()

  const error =
    send.data?.ok === false
      ? send.data.message
      : send.error && 'Something went wrong. Please try again.'

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl">Sign in to HAUZ</CardTitle>
        <CardDescription>
          Enter your email and we will send you a sign-in code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            const value = email.trim()
            send.mutate(value, {
              onSuccess(result) {
                if (result.ok) onSent({ email: value, userId: result.data.userId })
              },
            })
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={send.isPending}>
            {send.isPending && <Loader2 className="animate-spin" />}
            Continue
          </Button>
        </form>
      </CardContent>
    </>
  )
}
