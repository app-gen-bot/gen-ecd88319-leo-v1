import { Client } from 'pg';

const connectionString = 'postgresql://postgres.luhlijxjiceeyjqdyyyx:rBXA2UxRRzPWTTI0@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

async function checkUsers() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    // Get latest users
    const result = await client.query(`
      SELECT id, email, name FROM users ORDER BY id DESC LIMIT 5;
    `);
    
    console.log('Latest Users:');
    console.table(result.rows);
    
    // Check for test users
    const testResult = await client.query(`
      SELECT u.id, u.email, u.name, cw.wallet_address, cw.pending_claim_amount
      FROM users u
      LEFT JOIN crypto_wallets cw ON u.id = cw.user_id
      WHERE u.email IN ('test1@example.com', 'test2@example.com', 'test3@example.com')
      ORDER BY u.id;
    `);
    
    console.log('\nTest Users with Wallets:');
    console.table(testResult.rows);
    
    // Count total users
    const countResult = await client.query('SELECT COUNT(*) as count FROM users;');
    console.log('\nTotal Users:', countResult.rows[0].count);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkUsers();
