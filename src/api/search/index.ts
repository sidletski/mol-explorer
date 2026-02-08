import { env } from '@/env'

export type RequestOptions = {
  signal?: AbortSignal
}

export const searchRequest = async <T>(
  path: string,
  {
    method,
    body,
    signal
  }: {
    method: 'POST' | 'GET' | 'PUT' | 'DELETE'
    body: Record<string, unknown>
    signal?: AbortSignal
  }
): Promise<T> => {
  const response = await fetch(`${env.VITE_SEARCH_API_URL}${path}`, {
    method,
    body: method === 'POST' ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json'
    },
    signal
  })

  return response.json()
}
