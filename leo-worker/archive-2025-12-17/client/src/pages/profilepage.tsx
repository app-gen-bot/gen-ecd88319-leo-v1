import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { apiClient } from '@/lib/api';
import {
  User,
  Lock,
  Check,
  Eye,
  EyeOff,
  Calendar,
  Heart,
  LogOut,
  Settings as SettingsIcon,
  Home,
  AlertCircle,
  X
} from 'lucide-react';

// Types
interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  preferences?: {
    emailNotifications?: {
      bookingReminders?: boolean;
      bookingUpdates?: boolean;
    };
    marketing?: {
      promotional?: boolean;
      newsletter?: boolean;
    };
  };
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  width: string;
}

type TabType = 'personal' | 'security' | 'preferences';
type ToastType = 'success' | 'error';

interface Toast {
  type: ToastType;
  message: string;
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  // Personal info state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Preferences state
  const [bookingReminders, setBookingReminders] = useState(true);
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [promotional, setPromotional] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  // Toast state
  const [toast, setToast] = useState<Toast | null>(null);

  // Fetch current user
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
  } = useQuery<UserData>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiClient.auth.getCurrentUser();
      return response.data;
    },
  });

  // Pre-fill form data when user data loads
  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setPhone(userData.phone || '');
      setBookingReminders(userData.preferences?.emailNotifications?.bookingReminders ?? true);
      setBookingUpdates(userData.preferences?.emailNotifications?.bookingUpdates ?? true);
      setPromotional(userData.preferences?.marketing?.promotional ?? false);
      setNewsletter(userData.preferences?.marketing?.newsletter ?? false);
    }
  }, [userData]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; phone: string }) => {
      if (!userData?.id) throw new Error('User ID not found');
      const response = await apiClient.users.updateUser({
        params: { id: userData.id },
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      showToast('success', 'Profile updated successfully');
    },
    onError: () => {
      showToast('error', 'Failed to update profile. Please try again.');
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      if (!userData?.id) throw new Error('User ID not found');
      const response = await apiClient.users.changePassword({
        params: { id: userData.id },
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      showToast('success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: () => {
      showToast('error', 'Failed to update password. Please check your current password.');
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: UserData['preferences']) => {
      if (!userData?.id) throw new Error('User ID not found');
      const response = await apiClient.users.updateUser({
        params: { id: userData.id },
        body: { preferences },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      showToast('success', 'Preferences saved successfully');
    },
    onError: () => {
      showToast('error', 'Failed to save preferences. Please try again.');
    },
  });

  // Toast helper
  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Password strength calculator
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (password.length === 0) {
      return { score: 0, label: '', color: '', width: 'w-0' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    const criteria = [hasUpperCase, hasLowerCase, hasNumber, isLongEnough];
    const score = criteria.filter(Boolean).length;

    if (score === 4) {
      return { score: 3, label: 'Strong password', color: 'bg-emerald-500 text-emerald-500', width: 'w-full' };
    } else if (score >= 3) {
      return { score: 2, label: 'Good password', color: 'bg-emerald-500 text-emerald-500', width: 'w-3/4' };
    } else if (score >= 2) {
      return { score: 1, label: 'Fair password', color: 'bg-amber-500 text-amber-500', width: 'w-1/2' };
    } else {
      return { score: 0, label: 'Weak password', color: 'bg-red-500 text-red-500', width: 'w-1/4' };
    }
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  // Form handlers
  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      showToast('error', 'First name and last name are required');
      return;
    }
    updateProfileMutation.mutate({ firstName, lastName, phone });
  };

  const handleCancelPersonalInfo = () => {
    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setPhone(userData.phone || '');
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast('error', 'Current password is required');
      return;
    }

    if (newPassword.length < 8) {
      showToast('error', 'Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }

    if (passwordStrength.score < 1) {
      showToast('error', 'Password is too weak. Use at least 8 characters with mixed case and numbers.');
      return;
    }

    updatePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleCancelPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferencesMutation.mutate({
      emailNotifications: {
        bookingReminders,
        bookingUpdates,
      },
      marketing: {
        promotional,
        newsletter,
      },
    });
  };

  const handleCancelPreferences = () => {
    if (userData?.preferences) {
      setBookingReminders(userData.preferences.emailNotifications?.bookingReminders ?? true);
      setBookingUpdates(userData.preferences.emailNotifications?.bookingUpdates ?? true);
      setPromotional(userData.preferences.marketing?.promotional ?? false);
      setNewsletter(userData.preferences.marketing?.newsletter ?? false);
    }
  };

  const handleSignOut = async () => {
    try {
      await apiClient.auth.logout();
      setLocation('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setLocation('/');
    }
  };

  // Loading skeleton
  if (userLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen bg-slate-950">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:flex lg:flex-col lg:w-60 bg-slate-800 border-r border-slate-700">
            <nav className="flex-1 p-4 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-700 rounded-lg animate-pulse" />
              ))}
            </nav>
          </aside>

          {/* Main content skeleton */}
          <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8">
              <div className="h-10 bg-slate-800 rounded w-64 mb-2 animate-pulse" />
              <div className="h-6 bg-slate-800 rounded w-96 animate-pulse" />
            </div>
            <div className="border-b border-slate-700 mb-8">
              <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-800 rounded w-40 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (userError) {
    return (
      <AppLayout>
        <div className="flex min-h-screen bg-slate-950 items-center justify-center">
          <div className="bg-slate-800 border border-red-500 rounded-xl p-8 max-w-md text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-50 mb-2">Unable to Load Profile</h3>
            <p className="text-slate-400 mb-6">Please try again or contact support if the problem persists.</p>
            <button
              onClick={() => setLocation('/dashboard')}
              className="px-6 py-3 bg-violet-500 text-slate-50 font-semibold rounded-lg hover:bg-violet-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex min-h-screen bg-slate-950">
        {/* Dashboard Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-60 bg-slate-800 border-r border-slate-700">
          <nav className="flex-1 p-4 space-y-2" aria-label="Dashboard navigation">
            <Link href="/dashboard">
              <a className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-50 hover:bg-slate-700 rounded-lg transition-colors">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </a>
            </Link>
            <Link href="/dashboard/bookings">
              <a className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-50 hover:bg-slate-700 rounded-lg transition-colors">
                <Calendar className="h-5 w-5" />
                <span>My Bookings</span>
              </a>
            </Link>
            <Link href="/dashboard/favorites">
              <a className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-50 hover:bg-slate-700 rounded-lg transition-colors">
                <Heart className="h-5 w-5" />
                <span>Favorite Chapels</span>
              </a>
            </Link>
            <Link href="/dashboard/profile">
              <a className="flex items-center gap-3 px-4 py-3 text-violet-500 bg-slate-700 rounded-lg border-l-4 border-violet-500 font-medium">
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </a>
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-slate-50 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Sign out of your account"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
          {/* Page Header */}
          <div className="mb-6">
            <h2 className="text-4xl font-bold text-slate-50 mb-2">Profile Settings</h2>
            <p className="text-slate-400">Manage your account information and preferences</p>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed top-4 right-4 z-50 bg-slate-800 border rounded-lg p-4 shadow-xl min-w-[400px] ${
                toast.type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500'
              }`}
              role="alert"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {toast.type === 'success' ? (
                    <Check className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <p className="text-slate-50">{toast.message}</p>
                </div>
                <button
                  onClick={() => setToast(null)}
                  className="text-slate-400 hover:text-slate-50"
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-slate-700 mb-6">
            <div className="flex gap-0" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'personal'}
                onClick={() => setActiveTab('personal')}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'personal'
                    ? 'text-violet-500 border-violet-500'
                    : 'text-slate-400 border-transparent hover:text-slate-50'
                }`}
              >
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'security'}
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'security'
                    ? 'text-violet-500 border-violet-500'
                    : 'text-slate-400 border-transparent hover:text-slate-50'
                }`}
              >
                <Lock className="h-5 w-5" />
                <span>Security</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'preferences'}
                onClick={() => setActiveTab('preferences')}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'preferences'
                    ? 'text-violet-500 border-violet-500'
                    : 'text-slate-400 border-transparent hover:text-slate-50'
                }`}
              >
                <SettingsIcon className="h-5 w-5" />
                <span>Preferences</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <form onSubmit={handleSavePersonalInfo}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-400 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      required
                      className="w-full bg-slate-800 border border-slate-700 text-slate-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-500"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-400 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      required
                      className="w-full bg-slate-800 border border-slate-700 text-slate-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-500"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={userData?.email || ''}
                      readOnly
                      className="w-full bg-slate-950 border border-slate-700 text-slate-500 rounded-lg px-4 py-3 cursor-not-allowed"
                    />
                    <p className="text-sm text-slate-500 mt-2">Email cannot be changed. Contact support if needed.</p>
                  </div>

                  {/* Phone */}
                  <div className="md:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-400 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full bg-slate-800 border border-slate-700 text-slate-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCancelPersonalInfo}
                    className="px-6 py-3 border-2 border-violet-500 text-violet-500 font-semibold rounded-lg hover:bg-violet-500 hover:text-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-500 text-slate-50 font-semibold rounded-lg hover:bg-violet-600 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    {updateProfileMutation.isPending ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="max-w-xl">
                <div className="space-y-6 mb-6">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-400 mb-2">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        required
                        className="w-full bg-slate-800 border border-slate-700 text-slate-50 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-50"
                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-400 mb-2">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="w-full bg-slate-800 border border-slate-700 text-slate-50 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-50"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-2">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${passwordStrength.color.split(' ')[0]} ${passwordStrength.width}`}
                          />
                        </div>
                        <p className={`text-sm mt-1 ${passwordStrength.color.split(' ')[1]}`}>
                          {passwordStrength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-400 mb-2">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className={`w-full bg-slate-800 border ${
                          confirmPassword && newPassword !== confirmPassword
                            ? 'border-red-500'
                            : 'border-slate-700'
                        } text-slate-50 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-500`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-50"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCancelPassword}
                    className="px-6 py-3 border-2 border-violet-500 text-violet-500 font-semibold rounded-lg hover:bg-violet-500 hover:text-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-500 text-slate-50 font-semibold rounded-lg hover:bg-violet-600 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    {updatePasswordMutation.isPending ? (
                      <>Updating...</>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <form onSubmit={handleSavePreferences} className="max-w-xl">
                {/* Email Notifications Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-slate-50 mb-4">Email Notifications</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Choose what updates you'd like to receive via email.
                  </p>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bookingReminders}
                        onChange={(e) => setBookingReminders(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-slate-700 bg-slate-700 text-violet-500 focus:ring-2 focus:ring-violet-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-slate-50 block">Receive booking reminders</span>
                        <span className="text-sm text-slate-500 block mt-1">
                          Get email reminders 48 hours and 24 hours before your ceremony.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bookingUpdates}
                        onChange={(e) => setBookingUpdates(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-slate-700 bg-slate-700 text-violet-500 focus:ring-2 focus:ring-violet-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-slate-50 block">Receive booking updates</span>
                        <span className="text-sm text-slate-500 block mt-1">
                          Stay informed about any changes or updates to your bookings.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-700 my-8" />

                {/* Marketing Communications Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-slate-50 mb-4">Marketing Communications</h3>
                  <p className="text-sm text-slate-400 mb-4">Manage promotional and marketing emails.</p>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promotional}
                        onChange={(e) => setPromotional(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-slate-700 bg-slate-700 text-violet-500 focus:ring-2 focus:ring-violet-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-slate-50 block">Receive promotional emails</span>
                        <span className="text-sm text-slate-500 block mt-1">
                          Get special offers, new chapel announcements, and exclusive deals.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newsletter}
                        onChange={(e) => setNewsletter(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-slate-700 bg-slate-700 text-violet-500 focus:ring-2 focus:ring-violet-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-slate-50 block">Subscribe to newsletter</span>
                        <span className="text-sm text-slate-500 block mt-1">
                          Monthly wedding planning tips and inspiration.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCancelPreferences}
                    className="px-6 py-3 border-2 border-violet-500 text-violet-500 font-semibold rounded-lg hover:bg-violet-500 hover:text-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatePreferencesMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-500 text-slate-50 font-semibold rounded-lg hover:bg-violet-600 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    {updatePreferencesMutation.isPending ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Save Preferences
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
