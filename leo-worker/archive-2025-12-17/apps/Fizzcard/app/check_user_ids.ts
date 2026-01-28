import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres.luhlijxjiceeyjqdyyyx:rBXA2UxRRzPWTTI0@aws-1-us-east-1.pooler.supabase.com:5432/postgres'
});

async function checkUserIds() {
  try {
    // Check the newly created users
    const result = await pool.query(`
      SELECT id, email, created_at FROM users 
      WHERE email IN ('test1@example.com', 'test2@example.com', 'test3@example.com')
      ORDER BY id DESC
    `);
    
    console.log('Test users:');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, Email: ${row.email}, Created: ${row.created_at}`);
    });

    // Check their wallets
    const walletsResult = await pool.query(`
      SELECT w.id, w.user_id, w.wallet_address, w.wallet_type,
             u.email
      FROM crypto_wallets w
      JOIN users u ON w.user_id = u.id
      WHERE u.email IN ('test1@example.com', 'test2@example.com', 'test3@example.com')
      ORDER BY w.user_id
    `);
    
    console.log('\nWallets for test users:');
    if (walletsResult.rows.length === 0) {
      console.log('No wallets found yet');
    } else {
      walletsResult.rows.forEach(row => {
        const addr = row.wallet_address ? row.wallet_address.substring(0, 20) + '...' : 'null';
        console.log(`User ID: ${row.user_id}, Email: ${row.email}, Address: ${addr}, Type: ${row.wallet_type}`);
      });
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

checkUserIds();
