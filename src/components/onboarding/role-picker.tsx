import type { Role } from '@/@types/personal-account'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ROLES, ROLE_LABELS } from '@/lib/personal-account'

export function RolePicker({
  value,
  invalid,
  onChange,
}: {
  value: Role | ''
  invalid?: boolean
  onChange: (role: Role) => void
}) {
  return (
    <RadioGroup
      className="grid gap-3 sm:grid-cols-2"
      value={value}
      onValueChange={(role) => onChange(role as Role)}
      aria-invalid={invalid}
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
  )
}
