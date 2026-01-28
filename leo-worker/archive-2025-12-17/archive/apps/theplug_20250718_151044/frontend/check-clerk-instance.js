#!/usr/bin/env node

const https = require('https');

const CLERK_SECRET_KEY = 'sk_test_ARdHJhkaVNf5sxjibT3ruIE0UU0vgsnbP4QUJ7fSx2';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: `/v1${path}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}\n`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function checkClerkEndpoints() {
  console.log('Checking Clerk API endpoints...\n');

  // Try different possible endpoints
  const endpoints = [
    '/instance',
    '/instances',
    '/beta_features',
    '/instance_settings',
    '/domains',
    '/allowed_origins',
  ];

  for (const endpoint of endpoints) {
    console.log(`Trying endpoint: ${endpoint}`);
    try {
      await makeRequest(endpoint);
    } catch (error) {
      console.log(`Error: ${error.message}\n`);
    }
  }
}

checkClerkEndpoints();