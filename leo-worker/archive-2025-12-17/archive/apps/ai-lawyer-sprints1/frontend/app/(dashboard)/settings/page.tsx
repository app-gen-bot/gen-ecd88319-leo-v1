"use client"

import { useState } from 'react';
import { useNextAuth } from '@/contexts/nextauth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { AuthCheck } from '@/components/auth-check';
import {
  Shield,
  Key,
  Smartphone,
  Mail,
  AlertCircle,
  Loader2,
  Check,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MFASetup } from '@/components/mfa-setup';

export default function SettingsPage() {
  const { user, enableTOTP, verifyTOTP, requestPasswordReset } = useNextAuth();
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQRCode, setMfaQRCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnablingMFA, setIsEnablingMFA] = useState(false);
  const [isVerifyingMFA, setIsVerifyingMFA] = useState(false);

  const handleEnableMFA = async () => {
    setIsEnablingMFA(true);
    try {
      const { secret, qrCode } = await enableTOTP();
      setMfaSecret(secret);
      setMfaQRCode(qrCode);
      setShowMFASetup(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable two-factor authentication",
        variant: "destructive",
      });
    } finally {
      setIsEnablingMFA(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingMFA(true);
    try {
      await verifyTOTP(verificationCode);
      setShowMFASetup(false);
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled for your account",
      });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingMFA(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      await requestPasswordReset(user.email);
      toast({
        title: "Password reset email sent",
        description: "Check your email for reset instructions",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthCheck>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account security and authentication settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Security Status */}
          <Card>
            <CardHeader>
              <CardTitle>Security Status</CardTitle>
              <CardDescription>
                Overview of your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Email Verified</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user?.emailVerified ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-600">Verified</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-red-600">Not Verified</span>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user?.mfaEnabled ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-600">Enabled</span>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEnableMFA}
                      disabled={isEnablingMFA}
                    >
                      {isEnablingMFA ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        'Enable 2FA'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Management */}
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Manage your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Account Password</p>
                      <p className="text-sm text-gray-500">Last changed: Never tracked</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handlePasswordReset}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Recommendations */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="h-5 w-5" />
                Security Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-amber-800">
                {!user?.emailVerified && (
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Verify your email address to secure your account</span>
                  </li>
                )}
                {!user?.mfaEnabled && (
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Enable two-factor authentication for enhanced security</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Use a strong, unique password for your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Regularly review your account activity</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* MFA Setup Dialog */}
        <Dialog open={showMFASetup} onOpenChange={setShowMFASetup}>
          <DialogContent className="sm:max-w-3xl">
            <MFASetup 
              onComplete={() => {
                setShowMFASetup(false);
                window.location.reload(); // Reload to update security status
              }}
              onCancel={() => setShowMFASetup(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AuthCheck>
  );
}