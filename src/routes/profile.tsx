import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'

import { ProfileForm } from '@/components/profile/profile-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { personalAccountQuery } from '@/lib/auth'
import { ROLE_LABELS } from '@/lib/personal-account'

export const Route = createFileRoute('/profile')({
  beforeLoad: ({ context, location }) => {
    // Signed out: sign in, then come straight back here.
    if (!context.user) {
      throw redirect({ to: '/sign-in', search: { redirect: location.href } })
    }

    return { user: context.user }
  },
  component: Profile,
})

function Profile() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, account } = Route.useRouteContext()

  if (account?.status !== 'found') {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>We could not load your profile</CardTitle>
            <CardDescription>This is on our side. Please try again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={async () => {
                await queryClient.invalidateQueries({
                  queryKey: personalAccountQuery(user.id).queryKey,
                })
                await router.invalidate()
              }}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const profile = account.account

  return (
    <main className="mx-auto grid max-w-2xl gap-6 px-4 py-12">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          {profile.firstName} {profile.lastName}
        </h1>
        <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
      </div>
      <p className="-mt-4 text-sm text-muted-foreground">
        Signed in as {user.email}
      </p>

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
    </main>
  )
}
