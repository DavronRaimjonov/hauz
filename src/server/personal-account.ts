import { createServerFn } from '@tanstack/react-start'
import { AppwriteException, ExecutionMethod } from 'node-appwrite'

import type { FunctionResponse } from '@/@types/appwrite'
import type {
  PersonalAccount,
  PersonalAccountLookup,
  PersonalAccountResult,
} from '@/@types/personal-account'
import { onboardingSchema, profileUpdateSchema } from '@/lib/personal-account'

import { FUNCTION_ID, createSessionClient, getSessionSecret } from './appwrite'

async function callFunction(
  method: ExecutionMethod,
  body?: unknown,
): Promise<FunctionResponse> {
  const secret = getSessionSecret()
  if (!secret) {
    return { status: 401, body: null }
  }

  try {
    const execution = await createSessionClient(secret).functions.createExecution({
      functionId: FUNCTION_ID,
      xpath: '/personal-account',
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      async: false,
    })

    return {
      status: execution.responseStatusCode,
      body: execution.responseBody ? JSON.parse(execution.responseBody) : null,
    }
  } catch (error) {
    // Appwrite refuses to execute for a dead session.
    if (error instanceof AppwriteException && error.code === 401) {
      return { status: 401, body: null }
    }
    throw error
  }
}

function errorMessage(body: unknown) {
  if (body && typeof body === 'object' && 'message' in body) {
    return String(body.message)
  }
  return 'Something went wrong. Please try again.'
}

export const getPersonalAccount = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PersonalAccountLookup> => {
    try {
      const response = await callFunction(ExecutionMethod.GET)

      if (response.status === 200) {
        return { status: 'found', account: response.body as PersonalAccount }
      }
      if (response.status === 404) {
        return { status: 'missing' }
      }

      console.error('GET /personal-account answered', response)
    } catch (error) {
      console.error('GET /personal-account failed', error)
    }

    return { status: 'unavailable' }
  },
)

async function send(
  method: ExecutionMethod,
  body: unknown,
): Promise<PersonalAccountResult> {
  try {
    const response = await callFunction(method, body)

    if (response.status === 200 || response.status === 201) {
      return { ok: true, account: response.body as PersonalAccount }
    }
    if (response.status === 401) {
      return { ok: false, message: 'Your session has ended. Sign in again.' }
    }

    return { ok: false, message: errorMessage(response.body) }
  } catch (error) {
    console.error(`${method} /personal-account failed`, error)

    return { ok: false, message: 'Something went wrong. Please try again.' }
  }
}


export const createPersonalAccount = createServerFn({ method: 'POST' })
  .validator(onboardingSchema)
  .handler(({ data }) => send(ExecutionMethod.POST, data))

export const updatePersonalAccount = createServerFn({ method: 'POST' })
  .validator(profileUpdateSchema)
  .handler(({ data }) => send(ExecutionMethod.PATCH, data))
