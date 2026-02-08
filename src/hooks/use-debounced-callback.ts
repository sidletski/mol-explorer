import { useRef } from 'react'

export const useDebouncedCallback = <T extends (..._args: never[]) => void>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)
  // eslint-disable-next-line react-hooks/refs
  callbackRef.current = callback

  return ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay)
  }) as T
}
