import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouteContext, useRouter, useSearch } from '@tanstack/react-router'

import type {
  OnboardingInput,
  ProfileUpdateInput,
} from '@/@types/personal-account'
import { cachePersonalAccount, currentUserQuery } from '@/lib/auth'
import { safeRedirect } from '@/lib/redirect'

import { logout, requestEmailCode, verifyEmailCode } from './auth'
import {
  createPersonalAccount,
  updatePersonalAccount,
} from './personal-account'

export const useRequestCodeMutation = () => {
  return useMutation({
    mutationKey: ['request-code'],
    mutationFn: (email: string) => requestEmailCode({ data: { email } }),
  })
}

export const useVerifyCodeMutation = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const search = useSearch({ from: '/sign-in' })

  return useMutation({
    mutationKey: ['verify-code'],
    mutationFn: (data: { userId: string; code: string }) =>
      verifyEmailCode({ data }),
    async onSuccess(result) {
      if (!result.ok) return

      await queryClient.invalidateQueries({
        queryKey: currentUserQuery.queryKey,
      })
      await router.invalidate()
      await router.navigate({
        href: safeRedirect(search.redirect),
        replace: true,
      })
    },
  })
}

export const useLogoutMutation = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['logout'],
    mutationFn: () => logout(),
    async onSuccess() {
      queryClient.clear()
      await router.navigate({ to: '/' })
    },
  })
}

export const useCreatePersonalAccountMutation = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useRouteContext({ from: '/onboarding' })
  const search = useSearch({ from: '/onboarding' })

  return useMutation({
    mutationKey: ['create-personal-account'],
    mutationFn: (data: OnboardingInput) => createPersonalAccount({ data }),
    async onSuccess(result) {
      if (!result.ok) return

      cachePersonalAccount(queryClient, user.id, result.account)
      await router.navigate({
        href: safeRedirect(search.redirect),
        replace: true,
      })
    },
  })
}

export const useUpdateProfileMutation = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useRouteContext({ from: '/profile' })

  return useMutation({
    mutationKey: ['update-profile'],
    mutationFn: (data: ProfileUpdateInput) => updatePersonalAccount({ data }),
    async onSuccess(result) {
      if (!result.ok) return

      cachePersonalAccount(queryClient, user.id, result.account)
      await router.invalidate()
    },
  })
}
