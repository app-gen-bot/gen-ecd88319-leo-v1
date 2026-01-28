import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: any) => string | undefined;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule;
}

export interface FormErrors {
  [fieldName: string]: string | undefined;
}

export interface TouchedFields {
  [fieldName: string]: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: FieldValidation
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  const validateField = useCallback(
    (fieldName: string, value: any): string | undefined => {
      const rules = validationRules[fieldName];
      if (!rules) return undefined;

      // Required validation
      if (rules.required) {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return typeof rules.required === 'string' 
            ? rules.required 
            : `${fieldName} is required`;
        }
      }

      // Min length validation
      if (rules.minLength && typeof value === 'string') {
        if (value.length < rules.minLength.value) {
          return rules.minLength.message;
        }
      }

      // Max length validation
      if (rules.maxLength && typeof value === 'string') {
        if (value.length > rules.maxLength.value) {
          return rules.maxLength.message;
        }
      }

      // Pattern validation
      if (rules.pattern && typeof value === 'string') {
        if (!rules.pattern.value.test(value)) {
          return rules.pattern.message;
        }
      }

      // Custom validation
      if (rules.validate) {
        return rules.validate(value);
      }

      return undefined;
    },
    [validationRules]
  );

  const handleChange = useCallback(
    (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : e.target.value;
      
      setValues(prev => ({ ...prev, [fieldName]: value }));
      
      // Validate on change if field has been touched
      if (touched[fieldName]) {
        const error = validateField(fieldName, value);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (fieldName: string) => () => {
      setTouched(prev => ({ ...prev, [fieldName]: true }));
      const error = validateField(fieldName, values[fieldName]);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    },
    [values, validateField]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    
    // Mark all fields as touched
    const allTouched: TouchedFields = {};
    Object.keys(validationRules).forEach(fieldName => {
      allTouched[fieldName] = true;
    });
    setTouched(allTouched);

    return isValid;
  }, [validationRules, values, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback(
    (fieldName: string) => ({
      value: values[fieldName] || '',
      onChange: handleChange(fieldName),
      onBlur: handleBlur(fieldName),
      'aria-invalid': !!(errors[fieldName] && touched[fieldName]),
      'aria-describedby': errors[fieldName] && touched[fieldName] ? `${fieldName}-error` : undefined,
    }),
    [values, handleChange, handleBlur, errors, touched]
  );

  const getFieldError = useCallback(
    (fieldName: string) => {
      return touched[fieldName] ? errors[fieldName] : undefined;
    },
    [errors, touched]
  );

  const hasFieldError = useCallback(
    (fieldName: string) => {
      return !!(errors[fieldName] && touched[fieldName]);
    },
    [errors, touched]
  );

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    getFieldProps,
    getFieldError,
    hasFieldError,
    setValues,
    setErrors,
    setTouched,
  };
}

// Common validation patterns
export const validationPatterns = {
  email: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    value: /^[\d\s()+-]+$/,
    message: 'Please enter a valid phone number',
  },
  url: {
    value: /^https?:\/\/.+/,
    message: 'Please enter a valid URL',
  },
  zipCode: {
    value: /^\d{5}(-\d{4})?$/,
    message: 'Please enter a valid ZIP code',
  },
};