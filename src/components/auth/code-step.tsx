import { REGEXP_ONLY_DIGITS } from 'input-otp'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import {
  useRequestCodeMutation,
  useVerifyCodeMutation,
} from '@/server/mutation'

export function CodeStep({
  pending: { email, userId },
  onChangeEmail,
}: {
  pending: PendingSignIn
  onChangeEmail: () => void
}) {
  const [code, setCode] = useState('')

  const verify = useVerifyCodeMutation()
  const resend = useRequestCodeMutation()

  const error =
    verify.data?.ok === false
      ? verify.data.message
      : resend.data?.ok === false
        ? resend.data.message
        : (verify.error || resend.error) &&
          'Something went wrong. Please try again.'

  const submit = (value: string) => {
    if (value.length === 6 && !verify.isPending) {
      verify.mutate(
        { userId, code: value },
        {
          onSuccess(result) {
            if (!result.ok) setCode('')
          },
        },
      )
    }
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl">Check your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to{' '}
          <span className="font-medium text-foreground">{email}</span>. It can
          take a minute, and may land in spam.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            submit(code)
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="code">Code</Label>
            <InputOTP
              id="code"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              autoFocus
              value={code}
              onChange={setCode}
              onComplete={submit}
              disabled={verify.isPending}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {resend.data?.ok && !error && (
            <p className="text-sm text-muted-foreground">
              A new code is on its way.
            </p>
          )}
          <Button type="submit" disabled={code.length < 6 || verify.isPending}>
            {verify.isPending && <Loader2 className="animate-spin" />}
            Sign in
          </Button>
          <div className="flex justify-between text-sm">
            <button
              type="button"
              className="text-muted-foreground underline-offset-4 hover:underline"
              onClick={onChangeEmail}
            >
              Use a different email
            </button>
            <button
              type="button"
              className="text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
              disabled={resend.isPending}
              onClick={() => resend.mutate(email)}
            >
              Resend code
            </button>
          </div>
        </form>
      </CardContent>
    </>
  )
}
