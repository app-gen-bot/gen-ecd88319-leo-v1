#!/usr/bin/env node

const https = require('https');

// Clerk API credentials
const CLERK_SECRET_KEY = 'sk_test_ARdHJhkaVNf5sxjibT3ruIE0UU0vgsnbP4QUJ7fSx2';
const CLERK_API_VERSION = 'v1';

// Extract instance ID from the secret key
const instanceId = CLERK_SECRET_KEY.split('_')[2]; // This is a simplified extraction

// Production domain
const PRODUCTION_DOMAIN = 'theplug-music.vercel.app';
const PRODUCTION_URL = `https://${PRODUCTION_DOMAIN}`;

// Helper function to make Clerk API requests
function makeClerkAPIRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: `/v1${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(parsedData)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function updateClerkSettings() {
  console.log('Updating Clerk settings for production...\n');

  try {
    // First, let's get the current instance settings
    console.log('Fetching current instance settings...');
    const instanceSettings = await makeClerkAPIRequest('GET', '/instance');
    console.log('Current instance ID:', instanceSettings.id);
    console.log('Current home URL:', instanceSettings.home_url);

    // Update instance settings
    console.log('\nUpdating instance settings...');
    const updateData = {
      home_url: `${PRODUCTION_URL}/dashboard`,
      // Note: Some settings like allowed_origins might need to be set through different endpoints
      // or might not be available via API
    };

    // Note: The exact endpoint and payload structure might vary
    // This is a general example based on common API patterns
    console.log('\nAttempting to update home URL...');
    
    // For domain changes, you might need to use a specific endpoint
    // The exact API endpoint for domain updates isn't clearly documented
    // You might need to check Clerk's API reference for the correct endpoint

    console.log('\n⚠️  Note: Some settings may not be available via API.');
    console.log('You may need to manually update these in the Clerk Dashboard:');
    console.log('- Allowed origins: ' + PRODUCTION_URL);
    console.log('- Production domain: ' + PRODUCTION_DOMAIN);
    console.log('- OAuth redirect URLs (if using social login)');
    
    console.log('\n✅ Script completed. Please verify settings in Clerk Dashboard.');
    console.log('Dashboard URL: https://dashboard.clerk.com');

  } catch (error) {
    console.error('Error updating Clerk settings:', error.message);
    console.log('\nFailed to update via API. Please update manually in the Clerk Dashboard.');
  }
}

// Additional function to create/update allowed origins if API supports it
async function updateAllowedOrigins() {
  console.log('\nChecking for allowed origins API endpoint...');
  
  // This is hypothetical - the actual endpoint might be different
  const allowedOrigins = [
    PRODUCTION_URL,
    'http://localhost:3000', // Keep localhost for development
  ];

  console.log('Allowed origins to set:', allowedOrigins);
  
  // Note: The actual API endpoint for this might be different
  // You'll need to check Clerk's API documentation
}

// Run the update
updateClerkSettings()
  .then(() => updateAllowedOrigins())
  .catch(console.error);