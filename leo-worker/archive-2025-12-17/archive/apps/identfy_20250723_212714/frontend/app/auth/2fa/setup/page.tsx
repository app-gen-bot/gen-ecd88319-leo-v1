"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { QrCode, Smartphone, Shield, Copy, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function TwoFactorSetupPage() {
  const [method, setMethod] = useState<"authenticator" | "sms">("authenticator");
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [codesDownloaded, setCodesDownloaded] = useState(false);
  const [codesSaved, setCodesSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Mock data
  const qrCodeUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZmZmZiIvPgogIDwhLS0gU2ltcGxpZmllZCBRUiBjb2RlIHBhdHRlcm4gLS0+CiAgPGcgZmlsbD0iIzAwMDAwMCI+CiAgICA8IS0tIFBvc2l0aW9uIGRldGVjdGlvbiBwYXR0ZXJucyAtLT4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIi8+CiAgICA8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iMzAiIHk9IjMwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz4KICAgIAogICAgPHJlY3QgeD0iMTMwIiB5PSIxMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIi8+CiAgICA8cmVjdCB4PSIxNDAiIHk9IjIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmZmZmZmYiLz4KICAgIDxyZWN0IHg9IjE1MCIgeT0iMzAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIvPgogICAgCiAgICA8cmVjdCB4PSIxMCIgeT0iMTMwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiLz4KICAgIDxyZWN0IHg9IjIwIiB5PSIxNDAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI2ZmZmZmZiIvPgogICAgPHJlY3QgeD0iMzAiIHk9IjE1MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+CiAgICAKICAgIDwhLS0gRGF0YSBwYXR0ZXJuIC0tPgogICAgPHJlY3QgeD0iOTAiIHk9IjMwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz4KICAgIDxyZWN0IHg9IjExMCIgeT0iMzAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPgogICAgPHJlY3QgeD0iOTAiIHk9IjUwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz4KICAgIDxyZWN0IHg9IjExMCIgeT0iNTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPgogICAgPHJlY3QgeD0iOTAiIHk9IjcwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz4KICAgIDxyZWN0IHg9IjExMCIgeT0iNzAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPgogICAgPHJlY3QgeD0iOTAiIHk9IjkwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz4KICAgIDxyZWN0IHg9IjExMCIgeT0iOTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPgogIDwvZz4KPC9zdmc+";
  const manualEntryCode = "JBSWY3DPEHPK3PXP";
  const mockBackupCodes = [
    "A1B2-C3D4",
    "E5F6-G7H8",
    "I9J0-K1L2",
    "M3N4-O5P6",
    "Q7R8-S9T0",
    "U1V2-W3X4",
    "Y5Z6-A7B8",
    "C9D0-E1F2",
    "G3H4-I5J6",
    "K7L8-M9N0"
  ];

  const handleMethodSelect = () => {
    if (method === "authenticator") {
      setStep(2);
    } else {
      setStep(5); // Skip to phone number input for SMS
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (verificationCode === "123456") { // Mock verification
        setBackupCodes(mockBackupCodes);
        setStep(method === "authenticator" ? 4 : 6);
        toast.success("2FA enabled successfully!");
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(manualEntryCode);
    toast.success("Code copied to clipboard");
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied to clipboard");
  };

  const handleDownloadBackupCodes = () => {
    const content = `Identfy 2FA Backup Codes\n\nThese codes can be used to access your account if you lose access to your authenticator.\nEach code can only be used once.\n\n${backupCodes.join("\n")}\n\nGenerated: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "identfy-2fa-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCodesDownloaded(true);
    toast.success("Backup codes downloaded");
  };

  const handleComplete = () => {
    if (!codesSaved) {
      toast.error("Please confirm you have saved the backup codes");
      return;
    }
    router.push("/profile/security");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Why enable 2FA?</AlertTitle>
              <AlertDescription>
                Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
              </AlertDescription>
            </Alert>
            
            <RadioGroup value={method} onValueChange={(value) => setMethod(value as "authenticator" | "sms")}>
              <div className="space-y-2">
                <div className="flex items-start space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="authenticator" id="authenticator" />
                  <Label htmlFor="authenticator" className="flex-1 cursor-pointer">
                    <div className="font-medium">Authenticator App</div>
                    <div className="text-sm text-muted-foreground">
                      Use an app like Google Authenticator or Authy
                    </div>
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms" className="flex-1 cursor-pointer">
                    <div className="font-medium">SMS Text Message</div>
                    <div className="text-sm text-muted-foreground">
                      Receive codes via text message to your phone
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertTitle>Set up your authenticator app</AlertTitle>
              <AlertDescription>
                Scan the QR code below with your authenticator app, or enter the code manually.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">QR Code</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>
              <TabsContent value="qr" className="space-y-4">
                <div className="flex justify-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                  <div className="relative w-48 h-48">
                    <Image
                      src={qrCodeUrl}
                      alt="2FA QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app
                </p>
              </TabsContent>
              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label>Account name</Label>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    Identfy (demo@example.com)
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secret key</Label>
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm bg-muted p-2 rounded flex-1">
                      {manualEntryCode}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Alert>
              <QrCode className="h-4 w-4" />
              <AlertTitle>Verify your setup</AlertTitle>
              <AlertDescription>
                Enter the 6-digit code from your authenticator app to verify it's working correctly.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl font-mono tracking-widest"
                autoComplete="off"
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                Enter the code from your authenticator app
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Alert className="border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>2FA is now enabled!</AlertTitle>
              <AlertDescription>
                Your account is now protected with two-factor authentication.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Save your backup codes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index}>{code}</div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyBackupCodes}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadBackupCodes}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Each backup code can only be used once. When you use a code, it will be invalidated.
                </AlertDescription>
              </Alert>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saved"
                  checked={codesSaved}
                  onCheckedChange={(checked) => setCodesSaved(checked as boolean)}
                />
                <Label htmlFor="saved" className="text-sm font-normal cursor-pointer">
                  I have saved these backup codes in a secure location
                </Label>
              </div>
            </div>
          </div>
        );

      case 5: // SMS setup
        return (
          <div className="space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertTitle>Enter your phone number</AlertTitle>
              <AlertDescription>
                We'll send verification codes to this number when you sign in.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoComplete="tel"
              />
              <p className="text-sm text-muted-foreground">
                Include your country code
              </p>
            </div>
          </div>
        );

      case 6: // SMS backup codes
        return (
          <div className="space-y-4">
            <Alert className="border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>SMS 2FA is now enabled!</AlertTitle>
              <AlertDescription>
                We'll send verification codes to {phoneNumber} when you sign in.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Save your backup codes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Store these codes in a safe place. You can use them if you can't receive SMS messages.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index}>{code}</div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyBackupCodes}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadBackupCodes}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saved"
                  checked={codesSaved}
                  onCheckedChange={(checked) => setCodesSaved(checked as boolean)}
                />
                <Label htmlFor="saved" className="text-sm font-normal cursor-pointer">
                  I have saved these backup codes in a secure location
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Choose 2FA Method";
      case 2: return "Set Up Authenticator";
      case 3: return "Verify Setup";
      case 4: return "Save Backup Codes";
      case 5: return "Enter Phone Number";
      case 6: return "Save Backup Codes";
      default: return "";
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return true;
      case 2: return true;
      case 3: return verificationCode.length === 6;
      case 4: return codesSaved;
      case 5: return phoneNumber.length > 0;
      case 6: return codesSaved;
      default: return false;
    }
  };

  const handleNext = () => {
    switch (step) {
      case 1: handleMethodSelect(); break;
      case 2: setStep(3); break;
      case 3: handleVerifyCode(); break;
      case 4: handleComplete(); break;
      case 5: setStep(3); break; // Go to verification
      case 6: handleComplete(); break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
          <CardDescription>
            Step {step} of {method === "authenticator" ? 4 : 3}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
        <CardFooter className="flex gap-2">
          {step > 1 && step !== 4 && step !== 6 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={isLoading}
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            className="flex-1"
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
          >
            {isLoading ? "Verifying..." : 
             step === 4 || step === 6 ? "Complete Setup" : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}