import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  form?: string;
}

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong' | null;

export function SignupPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // TanStack Query mutation for registration
  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
      const response = await apiClient.auth.register({ body: data });
      return response;
    },
    onSuccess: () => {
      // Show success message
      setShowSuccess(true);

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        setLocation('/dashboard');
      }, 1000);
    },
    onError: (error: any) => {
      if (error.status === 409) {
        setErrors({ email: 'An account with this email already exists' });
      } else if (error.status === 400) {
        setErrors({ form: error.message || 'Please check your information and try again' });
      } else {
        setErrors({ form: 'Unable to create account. Please try again later.' });
      }
    },
  });

  // Password strength calculation
  const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password || password.length < 8) return 'weak';

    let criteriaCount = 0;
    if (/[A-Z]/.test(password)) criteriaCount++;
    if (/[a-z]/.test(password)) criteriaCount++;
    if (/[0-9]/.test(password)) criteriaCount++;

    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (criteriaCount >= 3 && hasSpecialChar && password.length >= 8) return 'strong';
    if (criteriaCount >= 3 && password.length >= 8) return 'good';
    if (criteriaCount >= 2 && password.length >= 8) return 'fair';

    return 'weak';
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getStrengthStyles = (strength: PasswordStrength) => {
    switch (strength) {
      case 'weak':
        return { width: '25%', color: '#EF4444', text: 'Weak' };
      case 'fair':
        return { width: '50%', color: '#F59E0B', text: 'Fair' };
      case 'good':
        return { width: '75%', color: '#3B82F6', text: 'Good' };
      case 'strong':
        return { width: '100%', color: '#10B981', text: 'Strong' };
      default:
        return { width: '0%', color: '', text: '' };
    }
  };

  const strengthStyles = getStrengthStyles(passwordStrength);

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'First name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters, spaces, and hyphens';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Last name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters, spaces, and hyphens';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email must be less than 100 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear form-level error
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.form;
      return newErrors;
    });

    // Validate form
    if (!validateForm()) {
      // Focus first invalid field
      const firstErrorField = Object.keys(errors)[0];
      document.getElementsByName(firstErrorField)[0]?.focus();
      return;
    }

    // Use mutation to register
    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
    });
  };

  // Handle blur for individual field validation
  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const newErrors: FormErrors = {};

    switch (name) {
      case 'firstName':
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        }
        break;
      case 'lastName':
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        break;
      case 'email':
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        break;
      case 'confirmPassword':
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
  };

  return (
    <AppLayout>
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-slate-800 border border-slate-700 border-l-4 border-l-emerald-500 rounded-lg shadow-2xl px-5 py-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <p className="text-neutral-50 text-base">Account created successfully! Redirecting...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-950">
        <div className="w-full max-w-[480px]">
          {/* Card Container */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-neutral-50 mb-2">
                Create Your Account
              </h2>
              <p className="text-base text-slate-400">
                Start planning your perfect wedding day
              </p>
            </div>

            {/* Form-level Error */}
            {errors.form && (
              <div
                className="bg-red-500/10 border-l-4 border-l-red-500 rounded-lg p-4 mb-6 flex items-start gap-3"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-base">{errors.form}</p>
              </div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                {/* First Name Input */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-slate-400 mb-2"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your first name"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                    disabled={registerMutation.isPending}
                    className={`w-full bg-slate-800 border ${
                      errors.firstName ? 'border-red-500' : 'border-slate-700'
                    } text-neutral-50 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-50`}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name Input */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-slate-400 mb-2"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your last name"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                    disabled={registerMutation.isPending}
                    className={`w-full bg-slate-800 border ${
                      errors.lastName ? 'border-red-500' : 'border-slate-700'
                    } text-neutral-50 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-50`}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-400 mb-2"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="your.email@example.com"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    disabled={registerMutation.isPending}
                    className={`w-full bg-slate-800 border ${
                      errors.email ? 'border-red-500' : 'border-slate-700'
                    } text-neutral-50 px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-50`}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-400 mb-2"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Create a strong password"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'password-error' : passwordStrength ? 'password-strength' : undefined}
                      disabled={registerMutation.isPending}
                      className={`w-full bg-slate-800 border ${
                        errors.password ? 'border-red-500' : 'border-slate-700'
                      } text-neutral-50 px-4 py-3 pr-12 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-50`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={registerMutation.isPending}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-neutral-50 transition-colors disabled:cursor-not-allowed"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.password}
                    </p>
                  )}

                  {/* Password Strength Indicator */}
                  {passwordStrength && formData.password && (
                    <div id="password-strength" className="mt-2" aria-label={`Password strength: ${strengthStyles.text}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-2 bg-[#334155] rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-300 rounded-full"
                            style={{
                              width: strengthStyles.width,
                              backgroundColor: strengthStyles.color,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium" style={{ color: strengthStyles.color }}>
                          {strengthStyles.text}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-400 mb-2"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Re-enter your password"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                      disabled={registerMutation.isPending}
                      className={`w-full bg-slate-800 border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-slate-700'
                      } text-neutral-50 px-4 py-3 pr-12 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-50`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      disabled={registerMutation.isPending}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-neutral-50 transition-colors disabled:cursor-not-allowed"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirmPassword-error" className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.agreeToTerms}
                      aria-describedby={errors.agreeToTerms ? 'terms-error' : undefined}
                      disabled={registerMutation.isPending}
                      className="mt-1 h-5 w-5 rounded border-2 border-slate-700 bg-slate-800 text-violet-500 focus:ring-2 focus:ring-violet-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <span className="text-base text-neutral-50">
                      I agree to the{' '}
                      <Link
                        href="/terms"
                        target="_blank"
                        className="text-violet-500 font-medium hover:text-violet-600 hover:underline focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded"
                      >
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="text-violet-500 font-medium hover:text-violet-600 hover:underline focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p id="terms-error" className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  aria-busy={registerMutation.isPending}
                  aria-label={registerMutation.isPending ? 'Creating account, please wait' : 'Create account'}
                  className="w-full mt-6 bg-violet-500 text-neutral-50 px-6 py-3 rounded-lg text-base font-semibold hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {registerMutation.isPending && (
                    <div className="h-5 w-5 border-3 border-neutral-50 border-t-transparent rounded-full animate-spin" />
                  )}
                  {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                </button>

                {/* Already Have Account Link */}
                <p className="text-center text-base mt-4">
                  <span className="text-slate-400">Already have an account?</span>{' '}
                  <Link
                    href="/sign-in"
                    className="text-violet-500 font-medium hover:text-violet-600 hover:underline focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-slate-400 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="hover:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded transition-colors"
            >
              Back to Home
            </Link>
            <span className="text-slate-500">|</span>
            <Link
              href="/privacy"
              target="_blank"
              className="hover:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-500">|</span>
            <Link
              href="/terms"
              target="_blank"
              className="hover:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default SignupPage;
