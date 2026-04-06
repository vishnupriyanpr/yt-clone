import { useEffect, useRef, useCallback } from 'react'

/**
 * Infinite scroll hook using IntersectionObserver.
 * Place a sentinel div as the last element and pass its ref.
 * Callback fires when sentinel is visible.
 */
export function useInfiniteScroll(callback, options = {}) {
  const sentinelRef = useRef(null)
  const { enabled = true, rootMargin = '200px' } = options

  const stableCallback = useCallback(callback, [callback])

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          stableCallback()
        }
      },
      { rootMargin }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [enabled, stableCallback, rootMargin])

  return sentinelRef
}

export default useInfiniteScroll
