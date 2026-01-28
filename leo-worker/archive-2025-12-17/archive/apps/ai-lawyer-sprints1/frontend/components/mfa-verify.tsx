"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface MFAVerifyProps {
  email: string;
  onSuccess: (token: string, refreshToken: string) => void;
  onCancel?: () => void;
}

export function MFAVerify({ email, onSuccess, onCancel }: MFAVerifyProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== (useBackupCode ? 8 : 6)) {
      toast({
        title: "Invalid code",
        description: `Please enter a ${useBackupCode ? '8' : '6'}-digit code`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.verifyMFALogin(code, useBackupCode);
      
      toast({
        title: "Success",
        description: "Two-factor authentication verified",
      });
      
      onSuccess(response.access_token, response.refresh_token);
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

  return (
    <Card className="max-w-md">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Enter the verification code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Signing in to {email}
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="code">
              {useBackupCode ? 'Backup Code' : 'Verification Code'}
            </Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={useBackupCode ? 8 : 6}
              placeholder={useBackupCode ? "00000000" : "000000"}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="mt-2"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              {useBackupCode 
                ? "Enter one of your 8-digit backup codes"
                : "Enter the 6-digit code from your authenticator app"
              }
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode('');
              }}
            >
              {useBackupCode ? 'Use authenticator app' : "Use backup code"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit"
            disabled={isLoading || code.length !== (useBackupCode ? 8 : 6)}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}