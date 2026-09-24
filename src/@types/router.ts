import type { QueryClient } from '@tanstack/react-query'

/** Available to every route's beforeLoad and loader. */
export interface RouterContext {
  queryClient: QueryClient
}
