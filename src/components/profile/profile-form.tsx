import { useState } from 'react'

import type { PersonalAccount } from '@/@types/personal-account'
import type { ProfileFormValues } from '@/@types/profile'
import { FormError } from '@/components/form/form-error'
import { FormField } from '@/components/form/form-field'
import { SubmitButton } from '@/components/form/submit-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { fieldErrors } from '@/lib/form'
import { profileUpdateSchema } from '@/lib/personal-account'
import { useUpdateProfileMutation } from '@/server/mutation'

function toValues(account: PersonalAccount): ProfileFormValues {
  return {
    firstName: account.firstName,
    lastName: account.lastName,
    contactEmail: account.contactEmail ?? '',
    bio: account.bio ?? '',
  }
}

function changes(account: PersonalAccount, values: ProfileFormValues) {
  const next = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    contactEmail: values.contactEmail.trim() || null,
    bio: values.bio.trim() || null,
  }

  const update: Partial<typeof next> = {}
  for (const field of Object.keys(next) as (keyof typeof next)[]) {
    if (next[field] !== account[field]) {
      Object.assign(update, { [field]: next[field] })
    }
  }

  return update
}

export function ProfileForm({
  account,
}: {
  account: PersonalAccount
}) {
  const [values, setValues] = useState(() => toValues(account))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const save = useUpdateProfileMutation()

  const update = changes(account, values)
  const dirty = Object.keys(update).length > 0

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!dirty || save.isPending) {
      return
    }

    const parsed = profileUpdateSchema.safeParse(update)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }

    setErrors({})
    save.mutate(parsed.data, {
      onSuccess(result) {
        if (result.ok) setValues(toValues(result.account))
      },
    })
  }

  const set = (field: keyof ProfileFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues({ ...values, [field]: event.target.value })
      save.reset()
    }

  const formError =
    save.data?.ok === false
      ? save.data.message
      : save.error && 'Something went wrong. Please try again.'

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" id="firstName" error={errors.firstName}>
          <Input
            id="firstName"
            autoComplete="given-name"
            value={values.firstName}
            aria-invalid={!!errors.firstName}
            onChange={set('firstName')}
          />
        </FormField>
        <FormField label="Last name" id="lastName" error={errors.lastName}>
          <Input
            id="lastName"
            autoComplete="family-name"
            value={values.lastName}
            aria-invalid={!!errors.lastName}
            onChange={set('lastName')}
          />
        </FormField>
      </div>

      <FormField
        label="Contact email"
        id="contactEmail"
        hint="Optional. Where buyers and renters can reach you."
        error={errors.contactEmail}
      >
        <Input
          id="contactEmail"
          type="email"
          autoComplete="email"
          value={values.contactEmail}
          aria-invalid={!!errors.contactEmail}
          onChange={set('contactEmail')}
        />
      </FormField>

      <FormField
        label="Bio"
        id="bio"
        hint="Optional. Up to 2000 characters."
        error={errors.bio}
      >
        <Textarea
          id="bio"
          rows={5}
          maxLength={2000}
          value={values.bio}
          aria-invalid={!!errors.bio}
          onChange={set('bio')}
        />
      </FormField>

      <FormError message={formError} />

      <div className="flex items-center gap-3">
        <SubmitButton pending={save.isPending} disabled={!dirty}>
          Save changes
        </SubmitButton>
        {dirty && !save.isPending && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setValues(toValues(account))
              setErrors({})
            }}
          >
            Discard
          </Button>
        )}
        {save.data?.ok && !dirty && (
          <p className="text-sm text-muted-foreground">Saved.</p>
        )}
      </div>
    </form>
  )
}
