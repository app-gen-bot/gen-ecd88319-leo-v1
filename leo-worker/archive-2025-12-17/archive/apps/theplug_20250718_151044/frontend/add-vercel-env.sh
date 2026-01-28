#!/bin/bash

# Add environment variables to Vercel

echo "Adding environment variables to Vercel..."

# Clerk Authentication
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production < <(echo "pk_test_bW9kZXN0LWR1Y2tsaW5nLTMuY2xlcmsuYWNjb3VudHMuZGV2JA")
vercel env add CLERK_SECRET_KEY production < <(echo "sk_test_ARdHJhkaVNf5sxjibT3ruIE0UU0vgsnbP4QUJ7fSx2")
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production < <(echo "/sign-in")
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production < <(echo "/sign-up")
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production < <(echo "/dashboard")
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production < <(echo "/dashboard")
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL production < <(echo "/dashboard")
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL production < <(echo "/dashboard")

# Update API URLs for production (you'll need to update these when backend is deployed)
vercel env add NEXT_PUBLIC_API_URL production < <(echo "https://your-backend-api.com/api/v1")
vercel env add NEXT_PUBLIC_WS_URL production < <(echo "wss://your-backend-api.com")

# Application Configuration
vercel env add NEXT_PUBLIC_APP_NAME production < <(echo "The Plug")
vercel env add NEXT_PUBLIC_APP_URL production < <(echo "https://theplug-music.vercel.app")

echo "Environment variables added successfully!"
echo "Now deploy to production with: vercel --prod"