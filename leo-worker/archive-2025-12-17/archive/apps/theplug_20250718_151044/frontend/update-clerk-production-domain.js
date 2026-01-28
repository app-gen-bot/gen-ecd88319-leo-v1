#!/usr/bin/env node

const https = require('https');

const CLERK_SECRET_KEY = 'sk_test_ARdHJhkaVNf5sxjibT3ruIE0UU0vgsnbP4QUJ7fSx2';
const PRODUCTION_DOMAIN = 'theplug-music.vercel.app';
const PRODUCTION_URL = `https://${PRODUCTION_DOMAIN}`;

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
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsedData });
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${responseData}`));
          }
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

async function updateClerkForProduction() {
  console.log('🚀 Updating Clerk for production deployment\n');

  try {
    // 1. Get current instance info
    console.log('1. Fetching current instance...');
    const instanceResponse = await makeClerkRequest('GET', '/instance');
    const instance = instanceResponse.data;
    console.log(`   Instance ID: ${instance.id}`);
    console.log(`   Environment: ${instance.environment_type}`);
    console.log(`   Current allowed origins: ${instance.allowed_origins || 'none'}\n`);

    // 2. Get current domains
    console.log('2. Fetching current domains...');
    const domainsResponse = await makeClerkRequest('GET', '/domains');
    const domains = domainsResponse.data.data;
    console.log(`   Found ${domains.length} domain(s):`);
    domains.forEach(d => {
      console.log(`   - ${d.name} (${d.is_satellite ? 'satellite' : 'primary'})`);
    });

    // 3. Try to update instance with allowed origins
    console.log('\n3. Attempting to update instance settings...');
    try {
      const updateData = {
        allowed_origins: [PRODUCTION_URL, 'http://localhost:3000']
      };
      const updateResponse = await makeClerkRequest('PATCH', '/instance', updateData);
      console.log('   ✅ Instance updated successfully!');
    } catch (error) {
      console.log('   ❌ Could not update via API:', error.message);
    }

    // 4. Check for domain-specific endpoints
    console.log('\n4. Checking domain configuration options...');
    console.log('   Note: Domain changes typically require dashboard access');

    console.log('\n' + '='.repeat(60));
    console.log('📋 MANUAL STEPS REQUIRED IN CLERK DASHBOARD:');
    console.log('='.repeat(60));
    console.log('\n1. Go to: https://dashboard.clerk.com');
    console.log('2. Select your application\n');
    
    console.log('3. Update these settings:');
    console.log('   Production Domains:');
    console.log('   - Add: theplug-music.vercel.app');
    console.log('   - Set as primary domain\n');
    
    console.log('   Allowed Origins:');
    console.log('   - https://theplug-music.vercel.app');
    console.log('   - http://localhost:3000 (for development)\n');
    
    console.log('   Home URL:');
    console.log('   - https://theplug-music.vercel.app/dashboard\n');
    
    console.log('4. If using Google OAuth:');
    console.log('   - Ensure Google is enabled in Social Connections');
    console.log('   - OAuth callbacks are handled automatically by Clerk\n');
    
    console.log('5. Set instance to Production mode for HTTPS enforcement\n');
    
    console.log('🎉 Your app is live at: https://theplug-music.vercel.app');
    console.log('   (Authentication will work after dashboard updates)\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Also create a helper to verify production setup
async function verifyProductionSetup() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 VERIFYING PRODUCTION SETUP:');
  console.log('='.repeat(60) + '\n');

  try {
    // Test if the production URL is accessible
    const testUrl = `${PRODUCTION_URL}/sign-in`;
    console.log(`Testing production URL: ${testUrl}`);
    
    https.get(testUrl, (res) => {
      console.log(`✅ Production site is accessible (Status: ${res.statusCode})`);
    }).on('error', (err) => {
      console.log(`❌ Could not reach production site: ${err.message}`);
    });

  } catch (error) {
    console.error('Verification error:', error.message);
  }
}

// Run the update
updateClerkForProduction()
  .then(() => verifyProductionSetup())
  .catch(console.error);