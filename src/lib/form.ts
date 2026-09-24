import type { z } from 'zod'

/** The first message for each field, keyed by field name. */
export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {}

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? '')
    errors[field] ??= issue.message
  }

  return errors
}
