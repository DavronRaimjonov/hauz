import { queryOptions, type QueryClient } from '@tanstack/react-query'

import type {
  PersonalAccount,
  PersonalAccountLookup,
} from '@/@types/personal-account'
import { getCurrentUser } from '@/server/auth'
import { getPersonalAccount } from '@/server/personal-account'

export const currentUserQuery = queryOptions({
  queryKey: ['current-user'],
  queryFn: () => getCurrentUser(),
})

/** Keyed by user, so one person's account is never served to the next. */
export const personalAccountQuery = (userId: string) =>
  queryOptions({
    queryKey: ['personal-account', userId],
    queryFn: () => getPersonalAccount(),
  })

/** Store an account the Function just returned, without another round trip. */
export function cachePersonalAccount(
  queryClient: QueryClient,
  userId: string,
  account: PersonalAccount,
) {
  const lookup: PersonalAccountLookup = { status: 'found', account }
  queryClient.setQueryData(personalAccountQuery(userId).queryKey, lookup)
}
