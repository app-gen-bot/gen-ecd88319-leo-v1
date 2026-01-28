import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Calendar, MapPin, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api-client';
import type { InsertEvent } from '@shared/schema.zod';

/**
 * CreateEventPage component
 * Form to create a new networking event
 */
export function CreateEventPage() {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    startDate: '',
    endDate: '',
    isExclusive: false,
    minFizzcoinRequired: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<InsertEvent, 'createdBy'>) => {
      const result = await apiClient.events.create({
        body: data,
      });
      if (result.status !== 201) {
        const errorData = result.body as { error?: string };
        throw new Error(errorData.error || 'Failed to create event');
      }
      return result.body;
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully!');
      navigate(`/events/${event.id}`);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      toast.error(errorMessage);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.isExclusive && formData.minFizzcoinRequired < 1) {
      newErrors.minFizzcoinRequired = 'Exclusive events must require at least 1 FizzCoin';
    }

    if (formData.latitude !== null && (formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (formData.longitude !== null && (formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Convert to ISO strings for datetime fields
    const eventData: Omit<InsertEvent, 'createdBy'> = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      location: formData.location.trim() || null,
      latitude: formData.latitude,
      longitude: formData.longitude,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      isExclusive: formData.isExclusive,
      minFizzcoinRequired: formData.isExclusive ? formData.minFizzcoinRequired : 0,
    };

    createMutation.mutate(eventData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        // Reset minFizzcoinRequired if unchecking isExclusive
        ...(name === 'isExclusive' && !checked && { minFizzcoinRequired: 0 }),
      }));
    } else if (type === 'number') {
      const numValue = value === '' ? null : parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <Link href="/events">
          <a>
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </a>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Create Event</h1>
          <p className="text-text-secondary">
            Organize a networking event for the FizzCard community
          </p>
        </div>

        <GlassCard className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Event Name <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg bg-background-glass border ${
                  errors.name ? 'border-error-500' : 'border-border-default'
                } focus:border-primary-500 focus:outline-none transition-colors`}
                placeholder="e.g., Tech Networking Meetup"
              />
              {errors.name && (
                <p className="text-error-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-background-glass border border-border-default focus:border-primary-500 focus:outline-none transition-colors resize-none"
                placeholder="Tell attendees what this event is about..."
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-background-glass border border-border-default focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="e.g., Tech Hub, 123 Main St, San Francisco"
              />
            </div>

            {/* Coordinates (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium mb-2">
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude ?? ''}
                  onChange={handleChange}
                  step="any"
                  min="-90"
                  max="90"
                  className={`w-full px-4 py-3 rounded-lg bg-background-glass border ${
                    errors.latitude ? 'border-error-500' : 'border-border-default'
                  } focus:border-primary-500 focus:outline-none transition-colors`}
                  placeholder="e.g., 37.7749"
                />
                {errors.latitude && (
                  <p className="text-error-500 text-sm mt-1">{errors.latitude}</p>
                )}
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium mb-2">
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude ?? ''}
                  onChange={handleChange}
                  step="any"
                  min="-180"
                  max="180"
                  className={`w-full px-4 py-3 rounded-lg bg-background-glass border ${
                    errors.longitude ? 'border-error-500' : 'border-border-default'
                  } focus:border-primary-500 focus:outline-none transition-colors`}
                  placeholder="e.g., -122.4194"
                />
                {errors.longitude && (
                  <p className="text-error-500 text-sm mt-1">{errors.longitude}</p>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date & Time <span className="text-error-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-background-glass border ${
                    errors.startDate ? 'border-error-500' : 'border-border-default'
                  } focus:border-primary-500 focus:outline-none transition-colors`}
                />
                {errors.startDate && (
                  <p className="text-error-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  End Date & Time <span className="text-error-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-background-glass border ${
                    errors.endDate ? 'border-error-500' : 'border-border-default'
                  } focus:border-primary-500 focus:outline-none transition-colors`}
                />
                {errors.endDate && (
                  <p className="text-error-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Exclusive Event Toggle */}
            <div className="p-4 rounded-lg bg-background-glass border border-border-default">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isExclusive"
                  checked={formData.isExclusive}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 rounded border-border-default text-primary-500 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <Lock className="w-4 h-4 text-fizzCoin-500" />
                    Make this an exclusive event
                  </div>
                  <p className="text-sm text-text-secondary">
                    Require attendees to have a minimum FizzCoin balance to register
                  </p>
                </div>
              </label>

              {/* FizzCoin Requirement */}
              {formData.isExclusive && (
                <div className="mt-4">
                  <label htmlFor="minFizzcoinRequired" className="block text-sm font-medium mb-2">
                    Minimum FizzCoins Required <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="minFizzcoinRequired"
                    name="minFizzcoinRequired"
                    value={formData.minFizzcoinRequired}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    className={`w-full px-4 py-3 rounded-lg bg-background-glass border ${
                      errors.minFizzcoinRequired ? 'border-error-500' : 'border-border-default'
                    } focus:border-primary-500 focus:outline-none transition-colors`}
                    placeholder="e.g., 100"
                  />
                  {errors.minFizzcoinRequired && (
                    <p className="text-error-500 text-sm mt-1">{errors.minFizzcoinRequired}</p>
                  )}
                  <p className="text-xs text-text-secondary mt-1">
                    Users must have at least this many FizzCoins to register
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Link href="/events">
                <a className="flex-1">
                  <Button variant="ghost" type="button" className="w-full">
                    Cancel
                  </Button>
                </a>
              </Link>
              <Button
                variant="primary"
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
