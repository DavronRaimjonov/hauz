import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

import { LogoutButton } from './logout-button'

export function UserNav({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/profile">{name}</Link>
      </Button>
      <LogoutButton />
    </div>
  )
}
