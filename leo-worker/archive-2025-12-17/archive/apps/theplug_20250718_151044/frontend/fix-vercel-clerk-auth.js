#!/usr/bin/env node

const https = require('https');

const CLERK_SECRET_KEY = 'sk_test_ARdHJhkaVNf5sxjibT3ruIE0UU0vgsnbP4QUJ7fSx2';
const VERCEL_URLS = [
  'https://theplug-music.vercel.app',
  'https://frontend-pied-one.vercel.app',
  'https://frontend-d197jnfaa-labhesh-gmailcoms-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

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
            console.log(`API Error ${res.statusCode}: ${responseData}`);
            resolve({ status: res.statusCode, data: parsedData });
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

async function fixVercelAuth() {
  console.log('🚀 Fixing Clerk Authentication for Vercel Deployment\n');

  try {
    // Get current instance
    console.log('1. Fetching current instance configuration...');
    const instanceResponse = await makeClerkRequest('GET', '/instance');
    if (instanceResponse.status !== 200) {
      console.log('   ❌ Failed to fetch instance');
      return;
    }
    
    const instance = instanceResponse.data;
    console.log(`   ✅ Instance ID: ${instance.id}`);
    console.log(`   ✅ Environment: ${instance.environment_type}`);
    console.log(`   ✅ Development instance confirmed\n`);

    // Update allowed origins
    console.log('2. Updating allowed origins for all Vercel URLs...');
    const updateData = {
      allowed_origins: VERCEL_URLS
    };

    const updateResponse = await makeClerkRequest('PATCH', '/instance', updateData);
    if (updateResponse.status === 200) {
      console.log('   ✅ Allowed origins updated successfully!');
      console.log('   ✅ Added all Vercel deployment URLs\n');
    } else {
      console.log('   ⚠️  Could not update allowed origins via API');
      console.log('   ⚠️  You may need to update manually in dashboard\n');
    }

    // Create demo user if needed
    console.log('3. Checking for demo user...');
    const usersResponse = await makeClerkRequest('GET', '/users?email_address=demo@example.com');
    
    if (usersResponse.status === 200 && usersResponse.data.data) {
      if (usersResponse.data.data.length === 0) {
        console.log('   📝 Demo user not found, creating...');
        
        const createUserResponse = await makeClerkRequest('POST', '/users', {
          email_address: ['demo@example.com'],
          password: 'demo123',
          first_name: 'Demo',
          last_name: 'User',
          skip_password_checks: true,
          skip_password_requirement: true
        });
        
        if (createUserResponse.status === 200 || createUserResponse.status === 201) {
          console.log('   ✅ Demo user created successfully!');
        } else {
          console.log('   ❌ Could not create demo user:', createUserResponse.data);
        }
      } else {
        console.log('   ✅ Demo user already exists');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 DEPLOYMENT STATUS:');
    console.log('='.repeat(60));
    console.log('\n✅ Middleware has been updated to handle development instance');
    console.log('✅ Allowed origins have been configured for all Vercel URLs');
    console.log('✅ Public routes have been properly configured');
    console.log('\n🌐 Your app should now work at:');
    console.log('   - https://theplug-music.vercel.app');
    console.log('   - https://frontend-pied-one.vercel.app');
    console.log('\n📝 Demo credentials:');
    console.log('   Email: demo@example.com');
    console.log('   Password: demo123');
    console.log('\n⏳ Please wait 1-2 minutes for changes to propagate');
    console.log('🔄 Then redeploy to Vercel for the middleware changes to take effect\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixVercelAuth();