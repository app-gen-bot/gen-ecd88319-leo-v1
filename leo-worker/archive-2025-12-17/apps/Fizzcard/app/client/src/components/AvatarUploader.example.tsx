/**
 * AvatarUploader Component
 *
 * Example React component for uploading avatar images using the FizzCard Upload API
 * This is an EXAMPLE implementation - customize as needed for your UI
 */

import React, { useState, useRef } from 'react';

interface AvatarUploaderProps {
  currentAvatarUrl?: string | null;
  onUploadSuccess: (avatarUrl: string) => void;
  onUploadError?: (error: string) => void;
}

interface UploadResponse {
  avatarUrl: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  mimeType: string;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  onUploadSuccess,
  onUploadError,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadInfo, setUploadInfo] = useState<UploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setError(null);
    setUploadInfo(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onUploadError?.(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      // Get auth token from localStorage (adjust based on your auth implementation)
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload to API
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: UploadResponse = await response.json();
      console.log('Upload successful:', result);

      // Update state
      setUploadInfo(result);
      setPreviewUrl(result.avatarUrl);

      // Notify parent component
      onUploadSuccess(result.avatarUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      console.error('Upload error:', err);
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setUploadInfo(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="avatar-uploader">
      <div className="avatar-preview">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Avatar preview"
            className="avatar-image"
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #e2e8f0',
            }}
          />
        ) : (
          <div
            className="avatar-placeholder"
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#718096',
              fontSize: '48px',
            }}
          >
            👤
          </div>
        )}
      </div>

      <div className="avatar-controls" style={{ marginTop: '1rem' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />

        <button
          onClick={handleButtonClick}
          disabled={uploading}
          className="upload-button"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
            marginRight: '0.5rem',
          }}
        >
          {uploading ? 'Uploading...' : 'Choose Photo'}
        </button>

        {previewUrl && !uploading && (
          <button
            onClick={handleRemove}
            className="remove-button"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        )}
      </div>

      {uploading && (
        <div className="upload-progress" style={{ marginTop: '0.5rem', color: '#3b82f6' }}>
          <span>Processing image...</span>
        </div>
      )}

      {error && (
        <div
          className="upload-error"
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '0.375rem',
            color: '#dc2626',
          }}
        >
          {error}
        </div>
      )}

      {uploadInfo && !error && (
        <div
          className="upload-success"
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            backgroundColor: '#d1fae5',
            border: '1px solid #a7f3d0',
            borderRadius: '0.375rem',
            color: '#059669',
          }}
        >
          <div>✓ Upload successful!</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {uploadInfo.dimensions.width}x{uploadInfo.dimensions.height} • {Math.round(uploadInfo.size / 1024)}KB
          </div>
        </div>
      )}

      <div
        className="upload-help"
        style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: '#6b7280',
        }}
      >
        Max file size: 5MB. Allowed formats: JPEG, PNG, WebP, GIF.
        <br />
        Images larger than 400x400px will be automatically resized.
      </div>
    </div>
  );
};

// Usage example:
/*
import { AvatarUploader } from '@/components/AvatarUploader';

function ProfileEditPage() {
  const [fizzCard, setFizzCard] = useState<FizzCard | null>(null);

  const handleAvatarUpload = async (avatarUrl: string) => {
    // Update FizzCard with new avatar
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/fizzcards/${fizzCard.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatarUrl,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setFizzCard(updated);
        alert('Avatar updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  return (
    <div>
      <h1>Edit Profile</h1>
      <AvatarUploader
        currentAvatarUrl={fizzCard?.avatarUrl}
        onUploadSuccess={handleAvatarUpload}
        onUploadError={(error) => console.error(error)}
      />
    </div>
  );
}
*/
