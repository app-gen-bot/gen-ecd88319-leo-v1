import { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { Button } from './Button';
import { Avatar } from './Avatar';

interface ImageUploadProps {
  currentImage?: string | null;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  isLoading?: boolean;
  maxSizeMB?: number;
  className?: string;
}

const DEFAULT_MAX_SIZE_MB = 5; // Match backend limit

/**
 * ImageUpload component
 * Upload and preview profile images with validation
 */
export function ImageUpload({
  currentImage,
  onUpload,
  onRemove,
  isLoading = false,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  className = '',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, WebP, or GIF image');
      return false;
    }

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call upload handler
    onUpload(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  const displayImage = preview || currentImage;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Image Preview */}
      <div className="relative">
        {displayImage ? (
          <div className="relative group">
            <Avatar
              src={displayImage}
              alt="Profile"
              size="3xl"
              className="ring-4 ring-primary-500/20"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!isLoading && onRemove && (
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-surface-secondary flex items-center justify-center">
            <Camera className="w-12 h-12 text-text-secondary" />
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div className="w-full max-w-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleChange}
          className="hidden"
          disabled={isLoading}
        />

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors
            ${dragActive
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-border-default hover:border-primary-500/50'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
          <p className="text-sm text-text-primary mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-text-secondary">
            JPEG, PNG, WebP, or GIF (max {maxSizeMB}MB)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Upload Button (Alternative to drag-drop) */}
        <Button
          onClick={handleClick}
          disabled={isLoading}
          variant="outline"
          className="w-full mt-4"
        >
          <Upload className="w-4 h-4 mr-2" />
          {displayImage ? 'Change Photo' : 'Choose Photo'}
        </Button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-text-secondary text-center max-w-xs">
        Recommended: Square image at least 400x400px for best quality
      </p>
    </div>
  );
}
