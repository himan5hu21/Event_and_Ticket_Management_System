'use client'

import { useEffect } from 'react'

export function ExtensionCleanup() {
  useEffect(() => {
    // Remove attributes added by browser extensions that cause hydration mismatches
    document.body.removeAttribute('cz-shortcut-listen')
  }, [])

  return null
}