import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { personalAccountQuery } from '@/lib/auth'

/** The Function could not be reached; the account may well exist. */
export function ProfileLoadError({ userId }: { userId: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const retry = async () => {
    await queryClient.invalidateQueries({
      queryKey: personalAccountQuery(userId).queryKey,
    })
    await router.invalidate()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>We could not load your profile</CardTitle>
        <CardDescription>This is on our side. Please try again.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={retry}>Try again</Button>
      </CardContent>
    </Card>
  )
}
