import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres.luhlijxjiceeyjqdyyyx:rBXA2UxRRzPWTTI0@aws-1-us-east-1.pooler.supabase.com:5432/postgres'
});

async function testWalletAPI() {
  try {
    // Test creating wallet for test1@example.com (ID 82)
    const walletAddress = '0x' + 'a'.repeat(40);
    
    console.log('Testing wallet creation for user ID 82...');
    
    // First, manually create a wallet in the database to simulate what the API should do
    const result = await pool.query(`
      INSERT INTO crypto_wallets (user_id, wallet_address, wallet_type, created_at)
      VALUES (82, $1, 'embedded', NOW())
      ON CONFLICT (user_id) DO NOTHING
      RETURNING id, user_id, wallet_address, wallet_type, created_at
    `, [walletAddress]);
    
    if (result.rows.length > 0) {
      console.log('Wallet created:', result.rows[0]);
    } else {
      console.log('Wallet already exists for this user');
    }
    
    // Verify it exists
    const check = await pool.query(`
      SELECT id, user_id, wallet_address, wallet_type FROM crypto_wallets
      WHERE user_id = 82
    `);
    
    console.log('Verification:', check.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testWalletAPI();
