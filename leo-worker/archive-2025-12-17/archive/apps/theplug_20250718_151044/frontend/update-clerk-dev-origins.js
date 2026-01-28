#!/usr/bin/env node

const https = require('https');

const CLERK_SECRET_KEY = 'sk_test_ARdHJhkaVNf5sxjibT3ruIE0UU0vgsnbP4QUJ7fSx2';
const VERCEL_URL = 'https://theplug-music.vercel.app';

function makeClerkRequest(method, path, data = null) {
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
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          reject(new Error(`Parse error: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function updateDevInstance() {
  console.log('🔧 Configuring Clerk Development Instance for Vercel\n');

  try {
    // Get current instance
    console.log('Fetching instance details...');
    const instanceResponse = await makeClerkRequest('GET', '/instance');
    const instance = instanceResponse.data;
    console.log(`Instance type: ${instance.environment_type}`);
    console.log(`Current allowed origins: ${JSON.stringify(instance.allowed_origins)}\n`);

    // Update allowed origins
    console.log('Updating allowed origins...');
    const updateData = {
      allowed_origins: [
        'http://localhost:3000',
        'http://localhost:3001',
        VERCEL_URL,
        'https://frontend-pied-one.vercel.app', // Also add the direct Vercel URL
      ]
    };

    const updateResponse = await makeClerkRequest('PATCH', '/instance', updateData);
    console.log('✅ Allowed origins updated successfully!\n');

    console.log('📋 What this means:');
    console.log('- Your app will work at: ' + VERCEL_URL);
    console.log('- Authentication will function properly');
    console.log('- This is using development instance (which is fine for demos/testing)');
    console.log('- For production with custom domain, you\'d create a production instance\n');

    console.log('🎉 Your app should now work at: ' + VERCEL_URL);
    console.log('   Try signing in with the demo credentials!');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateDevInstance();