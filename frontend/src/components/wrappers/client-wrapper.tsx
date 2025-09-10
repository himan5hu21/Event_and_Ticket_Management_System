'use client'

import { useEffect, useState } from 'react'

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return null
  }

  return <>{children}</>
}