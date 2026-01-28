import * as React from 'react';
import { KeyRound, ExternalLink, AlertCircle, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CredentialRequestMessage, CredentialValueEntry } from '@/lib/wsi-client';

export interface CredentialRequestModalProps {
  credentialRequest: CredentialRequestMessage | null;
  onSubmit: (credentialRequestId: string, credentials: CredentialValueEntry[], cancelled: boolean) => void;
  timeoutWarning?: { elapsed_seconds: number; remaining_seconds: number } | null;
}

/**
 * CredentialRequestModal - Modal for entering API keys/credentials mid-generation
 *
 * Displayed when Leo needs user-specific credentials (e.g., Stripe API key)
 * to continue with app generation.
 */
export function CredentialRequestModal({
  credentialRequest,
  onSubmit,
  timeoutWarning,
}: CredentialRequestModalProps) {
  // Form state: key -> value
  const [values, setValues] = React.useState<Record<string, string>>({});
  // Validation errors: key -> error message
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  // Submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset form when a new request comes in
  React.useEffect(() => {
    if (credentialRequest) {
      const initialValues: Record<string, string> = {};
      credentialRequest.credentials.forEach((spec) => {
        initialValues[spec.key] = '';
      });
      setValues(initialValues);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [credentialRequest?.id]);

  if (!credentialRequest) return null;

  const handleValueChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    credentialRequest.credentials.forEach((spec) => {
      const value = values[spec.key]?.trim() || '';

      // Check required
      if (spec.required && !value) {
        newErrors[spec.key] = 'This field is required';
        return;
      }

      // Check validation pattern
      if (value && spec.validation_pattern) {
        try {
          const regex = new RegExp(spec.validation_pattern);
          if (!regex.test(value)) {
            newErrors[spec.key] = 'Invalid format';
          }
        } catch {
          // Invalid regex - skip validation
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Build credentials array
    const credentials: CredentialValueEntry[] = credentialRequest.credentials
      .map((spec) => ({
        key: spec.key,
        value: values[spec.key]?.trim() || '',
      }))
      .filter((cred) => cred.value); // Only include non-empty values

    onSubmit(credentialRequest.id, credentials, false);
  };

  const handleCancel = () => {
    onSubmit(credentialRequest.id, [], true);
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-yellow-500" />
            Credentials Required
          </DialogTitle>
          <DialogDescription>
            {credentialRequest.context || 'Leo needs the following credentials to continue.'}
          </DialogDescription>
        </DialogHeader>

        {/* Timeout warning */}
        {timeoutWarning && (
          <Alert variant="destructive" className="border-yellow-500/50 bg-yellow-500/10">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              {Math.floor(timeoutWarning.remaining_seconds / 60)} minutes remaining to enter credentials
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {credentialRequest.credentials.map((spec) => (
            <div key={spec.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={spec.key} className="flex items-center gap-1">
                  {spec.label}
                  {spec.required && <span className="text-red-500">*</span>}
                </Label>
                {spec.help_url && (
                  <a
                    href={spec.help_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                  >
                    Get key <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <Input
                id={spec.key}
                type={spec.sensitive ? 'password' : 'text'}
                value={values[spec.key] || ''}
                onChange={(e) => handleValueChange(spec.key, e.target.value)}
                placeholder={spec.description || `Enter ${spec.label}`}
                className={errors[spec.key] ? 'border-red-500' : ''}
                autoComplete="off"
                disabled={isSubmitting}
              />

              {spec.description && !errors[spec.key] && (
                <p className="text-xs text-muted-foreground">{spec.description}</p>
              )}

              {errors[spec.key] && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors[spec.key]}
                </p>
              )}
            </div>
          ))}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Continue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
