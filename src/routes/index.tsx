import { Link, createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { user, account } = Route.useRouteContext()
  const firstName =
    account?.status === 'found' ? account.account.firstName : undefined

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {firstName ? `Welcome back, ${firstName}` : 'HAUZ'}
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        Find your next home in Uzbekistan
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Buy, sell and rent property with verified owners and realtors.
      </p>
      <Button size="lg" className="mt-8" asChild>
        {user ? (
          <Link to="/profile">Your profile</Link>
        ) : (
          <Link to="/sign-in">Get started</Link>
        )}
      </Button>
    </main>
  )
}
