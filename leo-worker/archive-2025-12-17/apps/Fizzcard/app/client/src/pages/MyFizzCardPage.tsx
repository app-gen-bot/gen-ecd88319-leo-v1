import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Plus, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { QRCodeDisplay } from '@/components/fizzcard/QRCodeDisplay';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { ProfileCompletionIndicator } from '@/components/profile/ProfileCompletionIndicator';
import { SocialShareButtons } from '@/components/share/SocialShareButtons';
import { MetaTags } from '@/components/seo/MetaTags';
import { apiClient } from '@/lib/api-client';
import { getAuthToken } from '@/lib/auth-helpers';
import type { FizzCard, SocialLink } from '@shared/schema.zod';

const SOCIAL_PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'facebook', label: 'Facebook', icon: '👥' },
  { value: 'github', label: 'GitHub', icon: '💻' },
  { value: 'custom', label: 'Custom', icon: '🔗' },
] as const;

/**
 * MyFizzCardPage component
 * Display user's FizzCard with QR code and editable profile
 */
export function MyFizzCardPage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editForm, setEditForm] = useState<Partial<FizzCard>>({});
  const [socialLinkForm, setSocialLinkForm] = useState<{
    platform: typeof SOCIAL_PLATFORMS[number]['value'];
    url: string;
  }>({ platform: 'linkedin', url: '' });
  const [showAddSocialLink, setShowAddSocialLink] = useState(false);

  // Fetch user's FizzCards
  const { data: fizzCards, isLoading: cardsLoading } = useQuery({
    queryKey: ['my-fizzcards'],
    queryFn: async () => {
      const result = await apiClient.fizzCards.getMyFizzCards();
      if (result.status !== 200) throw new Error('Failed to fetch FizzCards');
      return result.body;
    },
  });

  const primaryCard = fizzCards?.[0];

  // Fetch social links for primary card
  const { data: socialLinks, isLoading: socialLinksLoading } = useQuery({
    queryKey: ['social-links', primaryCard?.id],
    queryFn: async () => {
      if (!primaryCard?.id) return [];
      const result = await apiClient.socialLinks.getByFizzCardId({
        params: { fizzCardId: primaryCard.id },
      });
      if (result.status !== 200) return [];
      return result.body;
    },
    enabled: !!primaryCard?.id,
  });

  // Fetch crypto wallet for profile completion
  const { data: cryptoWallet } = useQuery({
    queryKey: ['cryptoWallet'],
    queryFn: async () => {
      const response = await apiClient.cryptoWallet.getMyWallet();
      if (response.status !== 200) return null;
      return response.body;
    },
  });

  // Create FizzCard mutation
  const createCardMutation = useMutation({
    mutationFn: async (data: Partial<FizzCard>) => {
      const result = await apiClient.fizzCards.create({
        body: {
          displayName: data.displayName || 'My FizzCard',
          title: data.title || null,
          company: data.company || null,
          phone: data.phone || null,
          email: data.email || null,
          website: data.website || null,
          address: data.address || null,
          bio: data.bio || null,
          avatarUrl: data.avatarUrl || null,
          themeColor: data.themeColor || null,
          isActive: true,
        },
      });
      if (result.status !== 201) throw new Error('Failed to create FizzCard');
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-fizzcards'] });
      toast.success('FizzCard created successfully!');
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create FizzCard');
    },
  });

  // Update FizzCard mutation
  const updateCardMutation = useMutation({
    mutationFn: async (data: {
      displayName?: string;
      title?: string;
      company?: string;
      phone?: string;
      email?: string;
      website?: string;
      address?: string;
      bio?: string;
      avatarUrl?: string;
      themeColor?: string;
      isActive?: boolean;
    }) => {
      if (!primaryCard?.id) throw new Error('No card to update');
      const result = await apiClient.fizzCards.update({
        params: { id: primaryCard.id },
        body: data,
      });
      if (result.status !== 200) throw new Error('Failed to update FizzCard');
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-fizzcards'] });
      toast.success('FizzCard updated successfully!');
      setIsEditing(false);
      setEditForm({});
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update FizzCard');
    },
  });

  // Add social link mutation
  const addSocialLinkMutation = useMutation({
    mutationFn: async (data: { platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'github' | 'custom'; url: string }) => {
      if (!primaryCard?.id) throw new Error('No card available');
      const result = await apiClient.socialLinks.create({
        params: { fizzCardId: primaryCard.id },
        body: data,
      });
      if (result.status !== 201) throw new Error('Failed to add social link');
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links', primaryCard?.id] });
      toast.success('Social link added!');
      setShowAddSocialLink(false);
      setSocialLinkForm({ platform: 'linkedin', url: '' });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add social link');
    },
  });

  // Delete social link mutation
  const deleteSocialLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await apiClient.socialLinks.delete({
        params: { id },
        body: {},
      });
      if (result.status !== 200) throw new Error('Failed to delete social link');
      return result.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links', primaryCard?.id] });
      toast.success('Social link removed!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete social link');
    },
  });

  // Upload avatar mutation
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('avatar', file);

      // Get auth token
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Upload using fetch (direct API call for multipart/form-data)
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const response = await fetch(`${baseUrl}/api/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();

      // Update FizzCard with new avatar URL
      if (primaryCard?.id) {
        await updateCardMutation.mutateAsync({ avatarUrl: data.avatarUrl });
        toast.success('Avatar updated successfully!');
      } else {
        // Store in edit form if creating new card
        setEditForm({ ...editForm, avatarUrl: data.avatarUrl });
        toast.success('Avatar uploaded! Save your card to apply.');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = () => {
    if (primaryCard?.id) {
      updateCardMutation.mutate({ avatarUrl: null });
    } else {
      setEditForm({ ...editForm, avatarUrl: null });
    }
  };

  const fizzCardUrl = primaryCard
    ? `${window.location.origin}/fizzcard/${primaryCard.id}`
    : '';

  const handleShare = async () => {
    if (navigator.share && primaryCard) {
      try {
        await navigator.share({
          title: `${primaryCard.displayName}'s FizzCard`,
          text: 'Connect with me on FizzCard!',
          url: fizzCardUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fizzCardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleSave = () => {
    // Convert null values to undefined for the API
    const cleanedForm = Object.fromEntries(
      Object.entries(editForm).map(([key, value]) => [key, value === null ? undefined : value])
    ) as typeof editForm;

    if (primaryCard) {
      updateCardMutation.mutate(cleanedForm);
    } else {
      createCardMutation.mutate(cleanedForm);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({});
    } else {
      setEditForm(primaryCard || {});
    }
    setIsEditing(!isEditing);
  };

  if (cardsLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">My FizzCard</h1>
          <GlassCard className="p-8 mb-8">
            <Skeleton className="h-64 w-full" />
          </GlassCard>
          <GlassCard className="p-8">
            <Skeleton className="h-96 w-full" />
          </GlassCard>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {primaryCard && (
        <MetaTags
          title={`${primaryCard.displayName || 'My'} FizzCard - Digital Business Card`}
          description={primaryCard.bio || `Connect with ${primaryCard.displayName} on FizzCard. ${primaryCard.title ? primaryCard.title : ''}`}
          image={primaryCard.avatarUrl || undefined}
          url={fizzCardUrl}
          type="profile"
        />
      )}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My FizzCard</h1>

        {/* QR Code Display */}
        {primaryCard && (
          <GlassCard className="p-8 mb-8">
            <QRCodeDisplay
              value={fizzCardUrl}
              size="lg"
              onShare={handleShare}
              onCopy={handleCopy}
            />

            {copied && (
              <div className="mt-4 text-center text-success-500 text-sm">
                Link copied to clipboard!
              </div>
            )}
          </GlassCard>
        )}

        {/* Profile Completion Indicator */}
        {primaryCard && (
          <div className="mb-8">
            <ProfileCompletionIndicator
              data={{
                fizzCard: primaryCard,
                socialLinks: socialLinks || [],
                cryptoWallet: cryptoWallet || null,
                hasAvatar: !!primaryCard.avatarUrl,
              }}
              onActionClick={(action) => {
                if (action === 'edit-fizzcard') {
                  setIsEditing(true);
                }
                if (action === 'connect-wallet') {
                  window.location.href = '/wallet';
                }
                if (action === 'add-social-links') {
                  setShowAddSocialLink(true);
                }
              }}
            />
          </div>
        )}

        {/* Social Share Section */}
        {primaryCard && (
          <GlassCard className="p-8 mb-8">
            <SocialShareButtons
              fizzCardId={String(primaryCard.id)}
              userName={primaryCard.displayName || 'FizzCard User'}
              userTitle={primaryCard.title || undefined}
            />
          </GlassCard>
        )}

        {/* Profile Section */}
        <GlassCard className="p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Profile</h2>
            <Button
              variant={isEditing ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleEditToggle}
              disabled={updateCardMutation.isPending || createCardMutation.isPending}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-6">
              {/* Avatar Upload Section */}
              <div className="pb-6 border-b border-border-default">
                <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
                <ImageUpload
                  currentImage={editForm.avatarUrl || primaryCard?.avatarUrl}
                  onUpload={handleAvatarUpload}
                  onRemove={handleAvatarRemove}
                  isLoading={isUploadingAvatar}
                  maxSizeMB={5}
                />
              </div>

              <Input
                label="Display Name"
                value={editForm.displayName || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, displayName: e.target.value })
                }
                placeholder="Your name"
              />
              <Input
                label="Title"
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Your title"
              />
              <Input
                label="Company"
                value={editForm.company || ''}
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                placeholder="Your company"
              />
              <Input
                label="Email"
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="your@email.com"
              />
              <Input
                label="Phone"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
              <Input
                label="Website"
                type="url"
                value={editForm.website || ''}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                placeholder="https://example.com"
              />
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  className="w-full px-4 py-2 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleSave}
                disabled={updateCardMutation.isPending || createCardMutation.isPending}
              >
                {updateCardMutation.isPending || createCardMutation.isPending
                  ? 'Saving...'
                  : 'Save Changes'}
              </Button>
            </div>
          ) : primaryCard ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary">Name</label>
                <p className="text-lg">{primaryCard.displayName}</p>
              </div>

              {primaryCard.title && (
                <div>
                  <label className="text-sm text-text-secondary">Title</label>
                  <p className="text-lg">{primaryCard.title}</p>
                </div>
              )}

              {primaryCard.company && (
                <div>
                  <label className="text-sm text-text-secondary">Company</label>
                  <p className="text-lg">{primaryCard.company}</p>
                </div>
              )}

              {primaryCard.email && (
                <div>
                  <label className="text-sm text-text-secondary">Email</label>
                  <p className="text-lg">{primaryCard.email}</p>
                </div>
              )}

              {primaryCard.phone && (
                <div>
                  <label className="text-sm text-text-secondary">Phone</label>
                  <p className="text-lg">{primaryCard.phone}</p>
                </div>
              )}

              {primaryCard.website && (
                <div>
                  <label className="text-sm text-text-secondary">Website</label>
                  <p className="text-lg">
                    <a
                      href={primaryCard.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:underline flex items-center gap-1"
                    >
                      {primaryCard.website}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </p>
                </div>
              )}

              {primaryCard.bio && (
                <div>
                  <label className="text-sm text-text-secondary">Bio</label>
                  <p className="text-lg">{primaryCard.bio}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-secondary mb-4">
                You don't have a FizzCard yet. Create one to get started!
              </p>
            </div>
          )}
        </GlassCard>

        {/* Social Links Section */}
        {primaryCard && (
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Social Links</h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddSocialLink(!showAddSocialLink)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>

            {showAddSocialLink && (
              <div className="mb-6 p-4 bg-background-glass border border-border-default rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform</label>
                  <select
                    className="w-full px-4 py-2 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={socialLinkForm.platform}
                    onChange={(e) =>
                      setSocialLinkForm({
                        ...socialLinkForm,
                        platform: e.target.value as typeof socialLinkForm.platform,
                      })
                    }
                  >
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.icon} {platform.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="URL"
                  type="url"
                  value={socialLinkForm.url}
                  onChange={(e) =>
                    setSocialLinkForm({ ...socialLinkForm, url: e.target.value })
                  }
                  placeholder="https://..."
                />
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setShowAddSocialLink(false);
                      setSocialLinkForm({ platform: 'linkedin', url: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => addSocialLinkMutation.mutate(socialLinkForm)}
                    disabled={
                      !socialLinkForm.url || addSocialLinkMutation.isPending
                    }
                  >
                    {addSocialLinkMutation.isPending ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </div>
            )}

            {socialLinksLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : socialLinks && socialLinks.length > 0 ? (
              <div className="space-y-3">
                {socialLinks.map((link: SocialLink) => {
                  const platform = SOCIAL_PLATFORMS.find(
                    (p) => p.value === link.platform
                  );
                  return (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 bg-background-glass border border-border-default rounded-lg"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 flex-1 text-primary-500 hover:underline"
                      >
                        <span>{platform?.icon}</span>
                        <span>{platform?.label}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSocialLinkMutation.mutate(link.id)}
                        disabled={deleteSocialLinkMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-error-500" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                No social links added yet.
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </AppLayout>
  );
}
