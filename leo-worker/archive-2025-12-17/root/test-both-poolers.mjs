import postgres from 'postgres';

const PROJECT_REF = 'bhpmhohcfqijpalioqxo';
const PASSWORD = 'LIbbKH942DooBha9XWu37L2G';
const REGION = 'us-east-1';

// URL-encode password
const ENCODED_PASSWORD = encodeURIComponent(PASSWORD);

const poolerURLs = {
  'aws-0': `postgresql://postgres.${PROJECT_REF}:${ENCODED_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true`,
  'aws-1': `postgresql://postgres.${PROJECT_REF}:${ENCODED_PASSWORD}@aws-1-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true`,
};

async function testPooler(url, variant) {
  console.log(`\nTesting ${variant}...`);

  try {
    const client = postgres(url, {
      ssl: 'require',
      prepare: false,
      connect_timeout: 15,
      max: 1,
    });

    const result = await client`SELECT 1 as test`;
    await client.end();

    console.log(`✅ ${variant}: WORKS`);
    return true;
  } catch (error) {
    console.log(`❌ ${variant}: ${error.message}`);
    return false;
  }
}

console.log('Testing Supabase Pooler Variants');
console.log('Project:', PROJECT_REF);
console.log('Region:', REGION);

const results = {
  'aws-0': await testPooler(poolerURLs['aws-0'], 'aws-0'),
  'aws-1': await testPooler(poolerURLs['aws-1'], 'aws-1'),
};

console.log('\n' + '='.repeat(60));
console.log('RESULTS:');
console.log('='.repeat(60));

if (results['aws-0']) {
  console.log('✅ aws-0 variant WORKS');
  console.log('\nUse this pattern for autonomous setup:');
  console.log(`aws-0-\${REGION}.pooler.supabase.com`);
} else if (results['aws-1']) {
  console.log('✅ aws-1 variant WORKS');
  console.log('\nUse this pattern for autonomous setup:');
  console.log(`aws-1-\${REGION}.pooler.supabase.com`);
} else {
  console.log('❌ Neither variant works');
  console.log('May need to check:');
  console.log('  - Pooler enabled for project');
  console.log('  - Password is correct');
  console.log('  - Project is fully started');
}

console.log('='.repeat(60));
