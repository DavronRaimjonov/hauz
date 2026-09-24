import { Link, useRouteContext, useRouterState } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useLogoutMutation } from '@/server/mutation'

/**
 * Reads the user from the root route context, which the server fills before
 * rendering. That is why the header is right on the first paint after a hard
 * refresh, with no "loading" state and no client-side flip.
 */
export function SiteHeader() {
  const { user, account } = useRouteContext({ from: '__root__' })
  const location = useRouterState({ select: (state) => state.location })

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="text-lg font-bold tracking-tight">
          HAUZ
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/profile">
                {account?.status === 'found'
                  ? account.account.firstName
                  : user.email}
              </Link>
            </Button>
            <LogoutButton />
          </div>
        ) : (
          location.pathname !== '/sign-in' && (
            <Button size="sm" asChild>
              <Link to="/sign-in" search={{ redirect: location.href }}>
                Sign in
              </Link>
            </Button>
          )
        )}
      </div>
    </header>
  )
}

function LogoutButton() {
  const logOut = useLogoutMutation()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={logOut.isPending}
      onClick={() => logOut.mutate()}
    >
      {logOut.isPending && <Loader2 className="animate-spin" />}
      Log out
    </Button>
  )
}
