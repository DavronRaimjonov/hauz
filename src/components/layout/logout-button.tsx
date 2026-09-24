import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useLogoutMutation } from '@/server/mutation'

export function LogoutButton() {
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
