"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Zap, Chrome, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";

const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirm_password: z.string(),
  workspace_name: z.string().min(2, "Workspace name must be at least 2 characters").optional(),
  invite_code: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords must match",
  path: ["confirm_password"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();

  const plan = searchParams.get("plan");
  const inviteCode = searchParams.get("invite");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      invite_code: inviteCode || "",
      terms: false,
    },
  });

  const password = watch("password");
  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= MIN_PASSWORD_LENGTH) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const getStrengthColor = () => {
    if (passwordStrength < 50) return "bg-destructive";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Medium";
    return "Strong";
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await apiClient.register(data);
      
      // Auto-login after registration
      await login(data.email, data.password);
      
      toast({
        title: "Welcome to TeamSync!",
        description: "Your account has been created successfully.",
      });
      
      // Navigate to onboarding or main app
      router.push("/app/onboarding");
    } catch (error: any) {
      if (error.code === "DUPLICATE_RESOURCE") {
        setError("An account with this email already exists");
      } else {
        setError(error.message || "An error occurred during registration");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthRegister = (provider: "google" | "microsoft") => {
    toast({
      title: "Coming Soon",
      description: `${provider} registration will be available soon.`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center space-x-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">TeamSync</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/90">
              Sign in
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Get started</CardTitle>
            <CardDescription>
              {inviteCode
                ? "You've been invited! Create your account to join the workspace."
                : "Create an account to start collaborating with your team"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  autoComplete="name"
                  disabled={isLoading}
                  {...register("full_name")}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...register("password")}
                />
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Progress value={passwordStrength} className="h-2" />
                      <span className={`text-xs ${getStrengthColor()}`}>
                        {getStrengthText()}
                      </span>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...register("confirm_password")}
                />
                {errors.confirm_password && (
                  <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
                )}
              </div>

              {!inviteCode && (
                <div className="space-y-2">
                  <Label htmlFor="workspace_name">Workspace Name</Label>
                  <Input
                    id="workspace_name"
                    placeholder="Acme Corp"
                    disabled={isLoading}
                    {...register("workspace_name")}
                  />
                  {errors.workspace_name && (
                    <p className="text-sm text-destructive">{errors.workspace_name.message}</p>
                  )}
                </div>
              )}

              {inviteCode && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You'll be joining an existing workspace after registration.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={watch("terms")}
                  onCheckedChange={(checked) =>
                    setValue("terms", checked as boolean)
                  }
                  disabled={isLoading}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="underline hover:text-primary">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline hover:text-primary">
                      Privacy Policy
                    </Link>
                  </Label>
                  {errors.terms && (
                    <p className="text-sm text-destructive">{errors.terms.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleOAuthRegister("google")}
                disabled={isLoading}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthRegister("microsoft")}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
                  />
                </svg>
                Microsoft
              </Button>
            </div>
          </CardContent>
        </Card>

        {plan && (
          <div className="text-center text-sm text-muted-foreground">
            <p>You selected the <span className="font-semibold capitalize">{plan}</span> plan.</p>
            <p>You can change this anytime from your account settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}