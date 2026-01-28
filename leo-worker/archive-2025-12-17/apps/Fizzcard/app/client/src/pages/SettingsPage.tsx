import { useState } from 'react';
import { useLocation } from 'wouter';
import { User, Bell, Lock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

/**
 * SettingsPage component
 * User settings and preferences
 */
export function SettingsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(true);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
          <p className="text-text-secondary">
            Manage your account and preferences
          </p>
        </div>

        {/* Account Settings */}
        <GlassCard className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-semibold">Account</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-text-secondary">Name</label>
              <p className="text-lg">{user?.name}</p>
            </div>

            <div>
              <label className="text-sm text-text-secondary">Email</label>
              <p className="text-lg">{user?.email}</p>
            </div>

            <div className="pt-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setLocation('/my-fizzcard')}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Privacy Settings */}
        <GlassCard className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-semibold">Privacy</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Email on FizzCard</p>
                <p className="text-sm text-text-secondary">
                  Allow others to see your email address
                </p>
              </div>
              <button
                onClick={() => setShowEmail(!showEmail)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showEmail ? 'bg-primary-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showEmail ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Phone on FizzCard</p>
                <p className="text-sm text-text-secondary">
                  Allow others to see your phone number
                </p>
              </div>
              <button
                onClick={() => setShowPhone(!showPhone)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showPhone ? 'bg-primary-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showPhone ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Notification Settings */}
        <GlassCard className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-semibold">Notifications</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-text-secondary">
                  Receive notifications for connection requests and messages
                </p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-primary-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard className="p-8 border-error-500/30">
          <h2 className="text-2xl font-semibold mb-4 text-error-500">Danger Zone</h2>
          <div className="space-y-4">
            <div>
              <p className="text-text-secondary mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button
                variant="ghost"
                size="lg"
                className="text-error-500 hover:bg-error-500/10"
                onClick={() => {
                  if (
                    confirm(
                      'Are you sure you want to delete your account? This action cannot be undone.'
                    )
                  ) {
                    alert('Account deletion would be implemented here');
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
