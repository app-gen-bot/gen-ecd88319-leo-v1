import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url' | 'date' | 'time' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  className?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  autoComplete?: string;
  disabled?: boolean;
  helpText?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: () => void;
}

export const FormField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  error,
  touched,
  className,
  options,
  rows = 3,
  autoComplete,
  disabled,
  helpText,
  value,
  onChange,
  onBlur,
  ...props
}, ref) => {
  const hasError = !!(error && touched);
  const fieldId = `field-${name}`;
  const errorId = `${name}-error`;
  const helpId = `${name}-help`;

  const baseInputClassName = cn(
    hasError && 'border-destructive focus:ring-destructive',
    className
  );

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={fieldId}
            name={name}
            placeholder={placeholder}
            required={required}
            rows={rows}
            disabled={disabled}
            className={baseInputClassName}
            aria-invalid={hasError}
            aria-describedby={cn(
              hasError && errorId,
              helpText && helpId
            )}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => {
              // Create a synthetic event
              const event = {
                target: {
                  name,
                  value: newValue,
                  type: 'select',
                },
              } as unknown as React.ChangeEvent<HTMLSelectElement>;
              onChange?.(event);
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id={fieldId}
              className={baseInputClassName}
              aria-invalid={hasError}
              aria-describedby={cn(
                hasError && errorId,
                helpText && helpId
              )}
              onBlur={onBlur}
            >
              <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            ref={ref as React.Ref<HTMLInputElement>}
            id={fieldId}
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            disabled={disabled}
            className={baseInputClassName}
            aria-invalid={hasError}
            aria-describedby={cn(
              hasError && errorId,
              helpText && helpId
            )}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={fieldId} 
        className={cn(
          required && "after:content-['*'] after:ml-0.5 after:text-destructive",
          hasError && 'text-destructive'
        )}
      >
        {label}
      </Label>
      
      {renderField()}
      
      {helpText && !hasError && (
        <p id={helpId} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
      
      {hasError && (
        <div id={errorId} className="flex items-center gap-1.5 text-sm text-destructive">
          <ExclamationCircleIcon className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';