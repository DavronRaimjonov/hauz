import { createFileRoute, redirect } from '@tanstack/react-router'

import { ProfileCard } from '@/components/profile/profile-card'
import { ProfileLoadError } from '@/components/profile/profile-load-error'
import { ProfileSummary } from '@/components/profile/profile-summary'

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
  const { user, account } = Route.useRouteContext()

  return (
    <main className="mx-auto grid max-w-2xl gap-6 px-4 py-12">
      {account?.status === 'found' ? (
        <>
          <ProfileSummary profile={account.account} email={user.email} />
          <ProfileCard profile={account.account} />
        </>
      ) : (
        <ProfileLoadError userId={user.id} />
      )}
    </main>
  )
}
