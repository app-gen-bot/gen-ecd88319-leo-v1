// Test MSW setup
// Run with: node test_msw.js

console.log('Testing MSW setup...');

// Test authentication
async function testAuth() {
  console.log('\n--- Testing Authentication ---');
  
  // Test login
  const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@example.com',
      password: 'DemoRocks2025!'
    })
  });
  
  const loginData = await loginResponse.json();
  console.log('Login response:', loginResponse.status);
  console.log('Access token received:', !!loginData.access_token);
  
  return loginData.access_token;
}

// Test chat
async function testChat(token) {
  console.log('\n--- Testing Chat ---');
  
  const chatResponse = await fetch('http://localhost:3000/api/v1/chat/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'What are my rights as a tenant?'
    })
  });
  
  const chatData = await chatResponse.json();
  console.log('Chat response:', chatResponse.status);
  console.log('AI response received:', !!chatData.message);
}

// Run tests
async function runTests() {
  try {
    const token = await testAuth();
    await testChat(token);
    console.log('\n✅ MSW tests passed!');
  } catch (error) {
    console.error('\n❌ MSW test failed:', error.message);
  }
}

// Wait for server to be ready
setTimeout(runTests, 2000);