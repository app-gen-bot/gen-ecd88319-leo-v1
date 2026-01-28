"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Hash, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import apiClient from "@/lib/api-client";
import { ErrorCode } from "@/lib/api-client";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation handled by auth context
    } catch (err) {
      const error = err as { code?: string; message?: string };
      if (error.code === ErrorCode.INVALID_CREDENTIALS) {
        setError("Invalid email or password");
      } else if (error.code === ErrorCode.UNAUTHORIZED) {
        setError("Invalid email or password");
      } else {
        setError(error.message || "An error occurred");
      }
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiClient.register({
        email,
        password,
        name: name || email.split('@')[0], // Use email prefix if name not provided
        workspace_name: workspaceName,
      });
      
      console.log("Registration successful:", response);
      
      // Login with the new credentials
      await login(email, password);
      // Navigation handled by auth context
    } catch (err) {
      setError((err as Error).message || "Failed to create workspace");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Mock Google OAuth for now
    setError("Google OAuth not implemented yet");
  };

  return (
    <div className="min-h-screen bg-[#1a1d21] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-[#5865f2] p-3 rounded">
            <Hash className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white ml-3">Slack Clone</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#2c2f33]">
            <TabsTrigger value="login" className="data-[state=active]:bg-[#5865f2]">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-[#5865f2]">
              Create Workspace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-[#2c2f33] border-[#404449]">
              <CardHeader>
                <CardTitle className="text-white">Sign in to your workspace</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your email and password to access your workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#1a1d21] border-[#404449] text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#1a1d21] border-[#404449] text-white"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#5865f2] hover:bg-[#4752c4]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full bg-[#404449]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#2c2f33] px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-[#404449] text-white hover:bg-[#404449]"
                  onClick={handleGoogleLogin}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card className="bg-[#2c2f33] border-[#404449]">
              <CardHeader>
                <CardTitle className="text-white">Create a new workspace</CardTitle>
                <CardDescription className="text-gray-400">
                  Set up a workspace for your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name" className="text-white">
                      Workspace Name
                    </Label>
                    <Input
                      id="workspace-name"
                      type="text"
                      placeholder="My Team"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="bg-[#1a1d21] border-[#404449] text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#1a1d21] border-[#404449] text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-white">
                      Your Email
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#1a1d21] border-[#404449] text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#1a1d21] border-[#404449] text-white"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#5865f2] hover:bg-[#4752c4]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating workspace..." : "Create Workspace"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}