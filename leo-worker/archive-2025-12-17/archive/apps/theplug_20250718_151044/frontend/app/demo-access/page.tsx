'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DemoAccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Set a temporary session flag
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo-access', 'true')
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to dashboard...</p>
    </div>
  )
}