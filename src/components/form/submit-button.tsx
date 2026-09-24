import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function SubmitButton({
  pending,
  disabled,
  children,
}: {
  pending: boolean
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  )
}
