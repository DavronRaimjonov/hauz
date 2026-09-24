import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

/** Brings the visitor back to `redirect` after signing in. */
export function SignInButton({ redirect }: { redirect: string }) {
  return (
    <Button size="sm" asChild>
      <Link to="/sign-in" search={{ redirect }}>
        Sign in
      </Link>
    </Button>
  )
}
