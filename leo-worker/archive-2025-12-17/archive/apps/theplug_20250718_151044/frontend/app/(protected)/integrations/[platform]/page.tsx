'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// Platform status mapping (matches the data in integrations page)
const platformStatus: Record<string, string> = {
  mlc: 'connected',
  soundexchange: 'disconnected',
  distribution: 'connected',
  pro: 'connected',
  copyright: 'disconnected',
}

export default function PlatformRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const platform = params.platform as string

  useEffect(() => {
    // Redirect based on platform status
    const status = platformStatus[platform] || 'disconnected'
    const path = status === 'connected' ? 'settings' : 'connect'
    router.replace(`/integrations/${platform}/${path}`)
  }, [platform, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Loading platform...</h2>
      </div>
    </div>
  )
}