import { Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { fieldErrors } from '@/lib/form'
import { ROLES, ROLE_LABELS, onboardingSchema } from '@/lib/personal-account'
import { useCreatePersonalAccountMutation } from '@/server/mutation'

export function OnboardingForm() {
  const [values, setValues] = useState({ firstName: '', lastName: '', role: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submitting = useRef(false)
  const create = useCreatePersonalAccountMutation()

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting.current) {
      return
    }

    const parsed = onboardingSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }

    setErrors({})
    submitting.current = true
    create.mutate(parsed.data, {
      onSettled() {
        submitting.current = false
      },
    })
  }

  const formError =
    create.data?.ok === false
      ? create.data.message
      : create.error && 'Something went wrong. Please try again.'

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            autoFocus
            value={values.firstName}
            aria-invalid={!!errors.firstName}
            onChange={(event) =>
              setValues({ ...values, firstName: event.target.value })
            }
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            value={values.lastName}
            aria-invalid={!!errors.lastName}
            onChange={(event) =>
              setValues({ ...values, lastName: event.target.value })
            }
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>I am a</Label>
        <RadioGroup
          className="grid gap-3 sm:grid-cols-2"
          value={values.role}
          onValueChange={(role) => setValues({ ...values, role })}
          aria-invalid={!!errors.role}
        >
          {ROLES.map((role) => (
            <Label
              key={role}
              htmlFor={`role-${role}`}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"
            >
              <RadioGroupItem id={`role-${role}`} value={role} />
              {ROLE_LABELS[role]}
            </Label>
          ))}
        </RadioGroup>
        <p className="text-sm text-muted-foreground">
          This cannot be changed later.
        </p>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role}</p>
        )}
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" disabled={create.isPending}>
        {create.isPending && <Loader2 className="animate-spin" />}
        Continue
      </Button>
    </form>
  )
}
