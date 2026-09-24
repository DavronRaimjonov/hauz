import '@tanstack/react-start/server-only'

const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60 * 1000

const failures = new Map<string, number[]>()

function recent(userId: string) {
  const since = Date.now() - WINDOW_MS
  const times = (failures.get(userId) ?? []).filter((time) => time > since)

  if (times.length > 0) {
    failures.set(userId, times)
  } else {
    failures.delete(userId)
  }

  return times
}

export function tooManyAttempts(userId: string) {
  return recent(userId).length >= MAX_FAILURES
}

export function recordFailedAttempt(userId: string) {
  failures.set(userId, [...recent(userId), Date.now()])
}

export function resetAttempts(userId: string) {
  failures.delete(userId)
}
