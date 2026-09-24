import type { PersonalAccount } from '@/@types/personal-account'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { ProfileForm } from './profile-form'

export function ProfileCard({ profile }: { profile: PersonalAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Your role was set when you joined and cannot be changed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm account={profile} />
      </CardContent>
    </Card>
  )
}
