"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react"
import { ApiError } from "@/lib/api-client"
import { VALIDATION } from "@/lib/constants"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState<'tenant' | 'landlord'>('tenant')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const { toast } = useToast()

  const getPasswordStrength = (pass: string) => {
    let strength = 0
    if (pass.length >= VALIDATION.PASSWORD_MIN_LENGTH) strength++
    if (/[A-Z]/.test(pass)) strength++
    if (/[0-9]/.test(pass)) strength++
    if (/[^A-Za-z0-9]/.test(pass)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const passwordStrengthText = ["Weak", "Fair", "Good", "Strong"][passwordStrength] || "Weak"
  const passwordStrengthColor = ["text-destructive", "text-orange-500", "text-yellow-500", "text-green-500"][passwordStrength] || "text-destructive"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and privacy policy to continue.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
        phone: phone || undefined,
      })
      toast({
        title: "Welcome to AI Tenant Rights Advisor!",
        description: "Your account has been created successfully.",
      })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === "DUPLICATE_RESOURCE") {
          toast({
            title: "Email Already Registered",
            description: "This email is already registered. Try signing in instead.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Registration Failed",
            description: error.message,
            variant: "destructive",
          })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    }
    return value
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">AI Tenant Rights</span>
          </Link>
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Get started with your legal protection
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Choose your account type and enter your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label>I am a...</Label>
                <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'tenant' | 'landlord')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tenant" id="tenant" />
                    <Label htmlFor="tenant" className="font-normal cursor-pointer">
                      Tenant (Renter)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="landlord" id="landlord" />
                    <Label htmlFor="landlord" className="font-normal cursor-pointer">
                      Landlord (Property Owner)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Name Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Phone (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  maxLength={14}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={VALIDATION.PASSWORD_MIN_LENGTH}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {password && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordStrength === 0 ? "w-1/4 bg-destructive" :
                          passwordStrength === 1 ? "w-2/4 bg-orange-500" :
                          passwordStrength === 2 ? "w-3/4 bg-yellow-500" :
                          "w-full bg-green-500"
                        }`}
                      />
                    </div>
                    <span className={`text-xs ${passwordStrengthColor}`}>
                      {passwordStrengthText}
                    </span>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary underline underline-offset-4">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary underline underline-offset-4">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/signin" className="text-primary underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}