# FizzCard Upload API

## Overview
The FizzCard Upload API provides endpoints for uploading and processing profile avatar images. Images are validated, resized, and converted to base64 data URIs for storage in the database.

## Endpoint

### POST /api/upload/avatar

Upload a profile avatar image and receive a data URI that can be stored in the `avatarUrl` field.

**Authentication:** Required (Bearer token)

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Field name: `avatar`

**Validation:**
- Maximum file size: 5MB
- Allowed MIME types:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`
- Images larger than 400x400px are automatically resized
- Aspect ratio is preserved during resize

**Response (200 OK):**
```json
{
  "avatarUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
  "size": 45821,
  "dimensions": {
    "width": 400,
    "height": 400
  },
  "mimeType": "image/jpeg"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid file type, missing file, or corrupted image
  ```json
  {
    "error": "No file uploaded. Please provide an image file in the 'avatar' field."
  }
  ```

- **401 Unauthorized** - Missing or invalid authentication token
  ```json
  {
    "error": "Authentication required"
  }
  ```

- **413 Payload Too Large** - File exceeds 5MB limit
  ```json
  {
    "error": "File too large. Maximum size is 5MB."
  }
  ```

- **500 Internal Server Error** - Server processing error
  ```json
  {
    "error": "Failed to upload avatar"
  }
  ```

## Usage Examples

### JavaScript (Fetch API)
```javascript
const formData = new FormData();
const fileInput = document.getElementById('avatarInput');
formData.append('avatar', fileInput.files[0]);

const response = await fetch('/api/upload/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Avatar uploaded:', result.avatarUrl);

// Use the avatarUrl in your user/fizzcard update
await fetch('/api/fizzcards/123', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    avatarUrl: result.avatarUrl
  })
});
```

### TypeScript (with ts-rest client)
```typescript
import { apiContract } from '@/shared/contracts';

// Note: ts-rest doesn't natively support multipart/form-data
// Use fetch or axios for file uploads, then use the returned URL
const formData = new FormData();
formData.append('avatar', avatarFile);

const response = await fetch('/api/upload/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { avatarUrl } = await response.json();

// Now update the FizzCard with the new avatar URL
await client.fizzCards.updateFizzCard({
  params: { id: fizzCardId },
  body: { avatarUrl }
});
```

### cURL
```bash
curl -X POST http://localhost:3000/api/upload/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

### React Component Example
```tsx
import React, { useState } from 'react';

function AvatarUploader() {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size on client side
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, WebP, or GIF.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      setAvatarUrl(result.avatarUrl);

      // Optionally, update the user/fizzcard immediately
      // await updateFizzCard({ avatarUrl: result.avatarUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {avatarUrl && (
        <img src={avatarUrl} alt="Avatar" style={{ width: 100, height: 100 }} />
      )}
    </div>
  );
}
```

## Implementation Details

### Image Processing Pipeline

1. **Upload** - File received via multer middleware
2. **Validation** - Check MIME type and file size
3. **Processing** - Use Sharp library to:
   - Validate image integrity
   - Get original dimensions
   - Resize if larger than 400x400px (preserving aspect ratio)
4. **Conversion** - Convert to base64 data URI
5. **Response** - Return data URI with metadata

### Storage Strategy

Since FizzCard is a demo app without S3/cloud storage:
- Images are stored as **base64 data URIs** in the database
- Data URIs are stored in the `avatarUrl` field (text column)
- Example: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...`

**Advantages:**
- No external storage dependencies
- Simple implementation
- Works in all environments
- Portable across deployments

**Limitations:**
- Larger database size
- Not suitable for production at scale
- 5MB limit per image

### Schema Changes

The `avatarUrl` field in both `users` and `fizzCards` schemas now accepts:
- HTTP/HTTPS URLs (existing functionality)
- Data URIs starting with `data:image/`

```typescript
// Before
avatarUrl: z.string().url().optional().nullable()

// After
avatarUrl: z.string().refine(
  (val) => {
    if (!val) return true;
    return val.startsWith('http://') ||
           val.startsWith('https://') ||
           val.startsWith('data:image/');
  },
  { message: 'Must be a valid URL or data URI' }
).optional().nullable()
```

## Security Considerations

1. **Authentication Required** - Only authenticated users can upload
2. **File Type Validation** - Only image MIME types allowed
3. **File Size Limit** - 5MB maximum prevents abuse
4. **Image Validation** - Sharp library validates image integrity
5. **Memory Storage** - Files processed in memory, never saved to disk
6. **Rate Limiting** - Consider adding rate limits in production

## Best Practices

1. **Client-Side Validation** - Validate file size/type before upload
2. **Progress Indicators** - Show upload progress to users
3. **Error Handling** - Display clear error messages
4. **Image Preview** - Show preview before upload
5. **Compression** - Consider client-side compression for large files
6. **Fallback** - Always provide a default avatar option

## Testing

### Manual Testing
```bash
# 1. Get authentication token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# 2. Upload avatar
curl -X POST http://localhost:3000/api/upload/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@test-image.jpg" \
  | jq

# 3. Test error cases
# Missing file
curl -X POST http://localhost:3000/api/upload/avatar \
  -H "Authorization: Bearer $TOKEN" \
  | jq

# Invalid file type
curl -X POST http://localhost:3000/api/upload/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@test.txt" \
  | jq

# No authentication
curl -X POST http://localhost:3000/api/upload/avatar \
  -F "avatar=@test-image.jpg" \
  | jq
```

## Future Enhancements

- [ ] Add support for multiple avatar sizes (thumbnail, medium, large)
- [ ] Implement image cropping/rotation
- [ ] Add WebP conversion for better compression
- [ ] Support for cover photos/banners
- [ ] Integration with cloud storage (S3, Cloudinary)
- [ ] Advanced image filters and effects
- [ ] Background removal
- [ ] Rate limiting per user
- [ ] Upload history/management
