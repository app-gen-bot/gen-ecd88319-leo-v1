'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ArrowLeft, Phone } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

const COUNTRIES = [
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
];

export default function VerifyPhonePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if user has completed step 1
  useEffect(() => {
    const email = sessionStorage.getItem('registration_email');
    if (!email) {
      router.push('/register');
    }
  }, [router]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await apiClient.sendVerificationCode(`${countryCode}${phoneNumber}`);
      sessionStorage.setItem('registration_phone', `${countryCode}${phoneNumber}`);
      setStep('code');
      setResendTimer(60);
    } catch (error: any) {
      setError('Failed to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newCode.every(digit => digit) && newCode.join('').length === 6) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
    
    const newCode = [...verificationCode];
    digits.forEach((digit, index) => {
      if (index < 6) newCode[index] = digit;
    });
    setVerificationCode(newCode);

    if (digits.length === 6) {
      handleVerifyCode(digits.join(''));
    }
  };

  const handleVerifyCode = async (code?: string) => {
    const fullCode = code || verificationCode.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const phone = sessionStorage.getItem('registration_phone');
      await apiClient.verifyPhone(phone!, fullCode);
      router.push('/register/kyc');
    } catch (error: any) {
      setError('Invalid code. Please try again.');
      setVerificationCode(['', '', '', '', '', '']);
      codeInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      await apiClient.sendVerificationCode(`${countryCode}${phoneNumber}`);
      setResendTimer(60);
      toast({
        title: 'Code sent',
        description: 'A new verification code has been sent to your phone.',
      });
    } catch (error) {
      toast({
        title: 'Failed to resend code',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Step 2 of 4</span>
            <span className="text-muted-foreground">Phone Verification</span>
          </div>
          <Progress value={50} className="h-2" />
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => step === 'code' ? setStep('phone') : router.push('/register')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl">
                {step === 'phone' ? 'Verify your phone' : 'Enter verification code'}
              </CardTitle>
            </div>
            <CardDescription>
              {step === 'phone' 
                ? "We'll send a code to verify your phone number"
                : `We sent a code to ${countryCode} ${phoneNumber}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'phone' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      placeholder="123 456 7890"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value.replace(/\D/g, ''));
                        setError('');
                      }}
                      className={`flex-1 ${error ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSendCode}
                  className="w-full"
                  disabled={isLoading || !phoneNumber}
                >
                  {isLoading ? 'Sending code...' : 'Send Code'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Verification Code</Label>
                  <div className="flex gap-2 justify-center">
                    {verificationCode.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => {
                          codeInputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-12 text-center text-lg"
                      />
                    ))}
                  </div>
                  {error && (
                    <p className="text-sm text-destructive flex items-center gap-1 text-center">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <button
                    onClick={handleResendCode}
                    disabled={resendTimer > 0 || isLoading}
                    className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                  >
                    {resendTimer > 0 
                      ? `Resend code in ${resendTimer}s`
                      : 'Resend code'
                    }
                  </button>
                </div>

                <Button
                  onClick={() => handleVerifyCode()}
                  className="w-full"
                  disabled={isLoading || verificationCode.some(d => !d)}
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}