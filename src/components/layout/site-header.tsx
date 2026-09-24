import { Link, useRouteContext, useRouterState } from '@tanstack/react-router'

import { SignInButton } from './sign-in-button'
import { UserNav } from './user-nav'

/**
 * Reads the user from the root route context, which the server fills before
 * rendering. That is why the header is right on the first paint after a hard
 * refresh, with no "loading" state and no client-side flip.
 */
export function SiteHeader() {
  const { user, account } = useRouteContext({ from: '__root__' })
  const location = useRouterState({ select: (state) => state.location })

  const name =
    account?.status === 'found' ? account.account.firstName : user?.email

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="text-lg font-bold tracking-tight">
          HAUZ
        </Link>

        {user && name ? (
          <UserNav name={name} />
        ) : (
          location.pathname !== '/sign-in' && (
            <SignInButton redirect={location.href} />
          )
        )}
      </div>
    </header>
  )
}
