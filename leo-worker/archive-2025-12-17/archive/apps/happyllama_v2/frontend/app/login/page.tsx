'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const errorParam = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid email or password. Try the demo account!')
      } else if (result?.ok) {
        // Verify session was created
        const session = await getSession()
        if (session) {
          router.push(callbackUrl)
          router.refresh()
        } else {
          setError('Authentication failed. Please try again.')
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: 'demo@example.com',
        password: 'DemoRocks2025!',
        redirect: false
      })

      if (result?.error) {
        setError('Demo login failed. Please try again.')
      } else if (result?.ok) {
        const session = await getSession()
        if (session) {
          router.push(callbackUrl)
          router.refresh()
        } else {
          setError('Demo authentication failed.')
        }
      }
    } catch (err) {
      setError('Demo login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🦙</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sign in to Happy Llama
          </h1>
          <p className="text-gray-600">
            Access your AI application factory
          </p>
        </div>

        {(error || errorParam) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">
              {error || 'Authentication failed. Please try again.'}
            </div>
          </div>
        )}

        {/* Demo Account Card */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Try Demo Account</h3>
          <p className="text-sm text-blue-700 mb-3">
            Experience Happy Llama with our demo account
          </p>
          <Button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Signing in...' : 'Sign in with Demo Account'}
          </Button>
          <p className="text-xs text-blue-600 mt-2">
            Credentials: demo@example.com / DemoRocks2025!
          </p>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign in manually</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
              required
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.email || !formData.password}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <div className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/beta-signup" className="text-blue-600 hover:text-blue-500 font-medium">
              Join the Beta
            </Link>
          </div>
          
          <div className="text-sm text-gray-600">
            <Link href="/" className="text-blue-600 hover:text-blue-500 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}