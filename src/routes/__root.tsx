import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  redirect,
} from '@tanstack/react-router'

import type { RouterContext } from '@/@types/router'
import { SiteHeader } from '@/components/layout/site-header'
import { currentUserQuery, personalAccountQuery } from '@/lib/auth'

import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<RouterContext>()({
  // Resolved on the server for the first request, so the page (and the
  // header in it) is rendered already knowing who is signed in.
  //
  // fetchQuery, not ensureQueryData: it refetches once a query is stale or
  // invalidated, so signing in or out is picked up on the next navigation.
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.fetchQuery(currentUserQuery)
    if (!user) {
      return { user, account: null }
    }

    const account = await context.queryClient.fetchQuery(
      personalAccountQuery(user.id),
    )

    // Signed in without a Personal Account: onboarding first, then on to
    // wherever they were going.
    if (account.status === 'missing' && location.pathname !== '/onboarding') {
      throw redirect({ to: '/onboarding', search: { redirect: location.href } })
    }

    return { user, account }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'HAUZ' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <SiteHeader />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
