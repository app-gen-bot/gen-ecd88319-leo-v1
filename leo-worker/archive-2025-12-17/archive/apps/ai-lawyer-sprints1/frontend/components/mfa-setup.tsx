"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Shield, Smartphone, Copy, Check, AlertCircle } from 'lucide-react';
import { useNextAuth } from '@/contexts/nextauth-context';
import { apiClient } from '@/lib/api-client';
import QRCode from 'qrcode';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const { user } = useNextAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.enableMFA();
      
      // Generate QR code
      const qrUrl = await QRCode.toDataURL(
        `otpauth://totp/AI%20Tenant%20Rights:${user?.email}?secret=${response.secret}&issuer=AI%20Tenant%20Rights`
      );
      
      setQrCodeUrl(qrUrl);
      setSecret(response.secret);
      setBackupCodes(response.backup_codes);
      setStep('verify');
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message || "Failed to setup 2FA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.verifyMFA(verificationCode);
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled",
      });
      
      onComplete?.();
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'secret' | 'codes') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
    toast({
      title: "Copied",
      description: `${type === 'secret' ? 'Secret' : 'Backup codes'} copied to clipboard`,
    });
  };

  if (step === 'setup') {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enable Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Two-factor authentication (2FA) adds an additional layer of security to your account 
            by requiring a verification code from your phone in addition to your password.
          </p>
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              You'll need an authenticator app like Google Authenticator or Authy on your phone
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSetup} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              'Continue Setup'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Complete 2FA Setup</CardTitle>
        <CardDescription>
          Follow the steps below to finish setting up two-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr">QR Code</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="qr" className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app
              </p>
              {qrCodeUrl && (
                <img 
                  src={qrCodeUrl} 
                  alt="2FA QR Code" 
                  className="mx-auto border rounded-lg p-4 bg-white"
                />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <div>
              <Label>Secret Key</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  value={secret} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(secret, 'secret')}
                >
                  {copiedSecret ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Enter this key manually in your authenticator app
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Save these backup codes in a secure place. 
              You can use them to access your account if you lose your phone.
            </AlertDescription>
          </Alert>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Backup Codes</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(backupCodes.join('\n'), 'codes')}
              >
                {copiedCodes ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
              {backupCodes.map((code, index) => (
                <code key={index} className="text-sm font-mono">
                  {code}
                </code>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleVerify} 
          disabled={isLoading || verificationCode.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Enable 2FA'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}