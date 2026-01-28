"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  ChevronLeft,
  Shield,
  Key,
  Smartphone,
  AlertTriangle,
  Check,
  X,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Copy
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

const passwordRequirements = [
  { id: "length", label: "At least 12 characters", regex: /.{12,}/ },
  { id: "uppercase", label: "One uppercase letter", regex: /[A-Z]/ },
  { id: "lowercase", label: "One lowercase letter", regex: /[a-z]/ },
  { id: "number", label: "One number", regex: /\d/ },
  { id: "special", label: "One special character", regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

export default function ProfileSecurityPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const backupCodes = [
    "AB12-CD34",
    "EF56-GH78",
    "IJ90-KL12",
    "MN34-OP56",
    "QR78-ST90",
    "UV12-WX34",
    "YZ56-AB78",
    "CD90-EF12",
  ];

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    passwordRequirements.forEach(req => {
      if (req.regex.test(password)) strength += 20;
    });
    return strength;
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const getStrengthColor = (strength: number) => {
    if (strength <= 20) return "text-red-600";
    if (strength <= 40) return "text-orange-600";
    if (strength <= 60) return "text-yellow-600";
    if (strength <= 80) return "text-blue-600";
    return "text-green-600";
  };

  const getStrengthLabel = (strength: number) => {
    if (strength <= 20) return "Very Weak";
    if (strength <= 40) return "Weak";
    if (strength <= 60) return "Fair";
    if (strength <= 80) return "Good";
    return "Strong";
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (passwordStrength < 100) {
      toast.error("Password doesn't meet all requirements");
      return;
    }

    setIsChangingPassword(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Password changed successfully");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsChangingPassword(false);
  };

  const handle2FASetup = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTwoFactorEnabled(true);
    setShow2FAModal(false);
    setShowBackupCodes(true);
    toast.success("Two-factor authentication enabled successfully");
  };

  const handle2FADisable = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTwoFactorEnabled(false);
    toast.success("Two-factor authentication disabled");
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'identfy-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded");
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success("Backup codes copied to clipboard");
  };

  return (
    <>
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Security Settings</h1>
            <p className="text-muted-foreground">
              Manage your password and authentication methods
            </p>
          </div>
        </div>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Update your password regularly to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {passwordForm.newPassword && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Password Strength</span>
                    <span className={`text-sm font-medium ${getStrengthColor(passwordStrength)}`}>
                      {getStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className="h-2" />
                  
                  <div className="space-y-2">
                    {passwordRequirements.map((req) => {
                      const isMet = req.regex.test(passwordForm.newPassword);
                      return (
                        <div key={req.id} className="flex items-center gap-2 text-sm">
                          {isMet ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={isMet ? "text-green-600" : "text-muted-foreground"}>
                            {req.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">Passwords don't match</p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Link href="/auth/reset-password" className="text-sm text-primary hover:underline">
                Forgot your password?
              </Link>
              <Button 
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <CardTitle>Two-Factor Authentication</CardTitle>
              </div>
              <Badge variant={twoFactorEnabled ? "success" : "secondary"}>
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm">
                  Require authentication code from your mobile device
                </p>
                <p className="text-xs text-muted-foreground">
                  You'll need to enter a code from your authenticator app when signing in
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setShow2FAModal(true);
                  } else {
                    handle2FADisable();
                  }
                }}
              />
            </div>

            {twoFactorEnabled && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Backup Codes</p>
                      <p className="text-xs text-muted-foreground">
                        Use these codes if you lose access to your authenticator
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowBackupCodes(true)}>
                      View Codes
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Authenticator App</p>
                      <p className="text-xs text-muted-foreground">
                        Currently using Google Authenticator
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reconfigure
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Security Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Recent Security Activity</CardTitle>
            </div>
            <CardDescription>
              Recent security-related events on your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Password changed</p>
                  <p className="text-xs text-muted-foreground">Today at 2:45 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Two-factor authentication enabled</p>
                  <p className="text-xs text-muted-foreground">Yesterday at 10:15 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New device sign-in</p>
                  <p className="text-xs text-muted-foreground">3 days ago from Chrome on macOS</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/profile/login-history">View Full History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 2FA Setup Modal */}
      <AlertDialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Two-Factor Authentication</AlertDialogTitle>
            <AlertDialogDescription>
              Scan this QR code with your authenticator app, then enter the verification code below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded">
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">QR Code</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Or enter this code manually:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">ABCD-EFGH-IJKL-MNOP</code>
            </div>

            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg tracking-widest"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handle2FASetup}>
              Enable 2FA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Backup Codes Modal */}
      <AlertDialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Backup Codes</AlertDialogTitle>
            <AlertDialogDescription>
              Save these codes in a secure location. Each code can only be used once.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted rounded font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span>{code}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={copyBackupCodes}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={downloadBackupCodes}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                Store these codes securely. You won't be able to see them again.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction>I've Saved These Codes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}