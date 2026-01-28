"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Heart, Lock, CheckCircle } from "lucide-react"
import { VALIDATION } from "@/lib/constants"

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      })
      return
    }
    
    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      toast({
        title: "Password too short",
        description: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters.`,
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsLoading(true)
      // In real app, this would call the API
      // await apiClient.resetPassword(params.token as string, password)
      
      // Mock success
      setIsSuccess(true)
      
      toast({
        title: "Password reset successful! 🎉",
        description: "You can now sign in with your new password."
      })
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Invalid or expired reset link. Please request a new one.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: "" }
    if (pwd.length < 6) return { strength: 25, label: "Weak" }
    
    let strength = 25
    if (pwd.length >= 8) strength += 25
    if (/[A-Z]/.test(pwd)) strength += 25
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) strength += 25
    
    const labels = ["Weak", "Fair", "Good", "Strong"]
    const label = labels[Math.floor((strength - 1) / 25)]
    
    return { strength, label }
  }

  const passwordStrength = getPasswordStrength(password)

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Password reset complete!</CardTitle>
            <CardDescription>
              Your password has been successfully reset. Redirecting to login...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">
                Go to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Heart className="h-8 w-8 text-primary" />
            <span className="ml-2 text-2xl font-bold">LoveyTasks</span>
          </Link>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Choose a new password to secure your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Enter new password"
                  required
                  minLength={VALIDATION.PASSWORD_MIN_LENGTH}
                />
              </div>
              {password && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Password strength:</span>
                    <span className={
                      passwordStrength.strength === 100 ? "text-green-600" :
                      passwordStrength.strength >= 75 ? "text-yellow-600" :
                      passwordStrength.strength >= 50 ? "text-orange-600" :
                      "text-red-600"
                    }>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength.strength === 100 ? "bg-green-600" :
                        passwordStrength.strength >= 75 ? "bg-yellow-600" :
                        passwordStrength.strength >= 50 ? "bg-orange-600" :
                        "bg-red-600"
                      }`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="showPassword" className="text-sm font-normal cursor-pointer">
                Show password
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Remember your password? </span>
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}