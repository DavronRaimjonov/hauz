export function FormError({ message }: { message?: string | null | false }) {
  if (!message) return null

  return <p className="text-sm text-destructive">{message}</p>
}
