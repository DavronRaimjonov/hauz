import type { PersonalAccount } from '@/@types/personal-account'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS } from '@/lib/personal-account'

export function ProfileSummary({
  profile,
  email,
}: {
  profile: PersonalAccount
  email: string
}) {
  return (
    <div className="grid gap-1">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          {profile.firstName} {profile.lastName}
        </h1>
        <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">Signed in as {email}</p>
    </div>
  )
}
