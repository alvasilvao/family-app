const requests = new Map<string, number[]>()
const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 15

export function checkRateLimit(userId: string): void {
  const now = Date.now()
  const timestamps = (requests.get(userId) || []).filter(t => t > now - WINDOW_MS)
  if (timestamps.length >= MAX_REQUESTS) {
    throw createError({ statusCode: 429, statusMessage: 'Too many import requests. Try again later.' })
  }
  timestamps.push(now)
  requests.set(userId, timestamps)
}
