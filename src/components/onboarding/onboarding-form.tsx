import { useRef, useState } from 'react'

import type { Role } from '@/@types/personal-account'
import { FormError } from '@/components/form/form-error'
import { FormField } from '@/components/form/form-field'
import { SubmitButton } from '@/components/form/submit-button'
import { Input } from '@/components/ui/input'
import { fieldErrors } from '@/lib/form'
import { onboardingSchema } from '@/lib/personal-account'
import { useCreatePersonalAccountMutation } from '@/server/mutation'

import { RolePicker } from './role-picker'

export function OnboardingForm() {
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    role: '' as Role | '',
  })
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
        <FormField label="First name" id="firstName" error={errors.firstName}>
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
        </FormField>
        <FormField label="Last name" id="lastName" error={errors.lastName}>
          <Input
            id="lastName"
            autoComplete="family-name"
            value={values.lastName}
            aria-invalid={!!errors.lastName}
            onChange={(event) =>
              setValues({ ...values, lastName: event.target.value })
            }
          />
        </FormField>
      </div>

      <FormField
        label="I am a"
        hint="This cannot be changed later."
        error={errors.role}
      >
        <RolePicker
          value={values.role}
          invalid={!!errors.role}
          onChange={(role) => setValues({ ...values, role })}
        />
      </FormField>

      <FormError message={formError} />

      <SubmitButton pending={create.isPending}>Continue</SubmitButton>
    </form>
  )
}
