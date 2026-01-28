const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.luhlijxjiceeyjqdyyyx:rBXA2UxRRzPWTTI0@aws-1-us-east-1.pooler.supabase.com:5432/postgres'
});

async function checkDatabase() {
  try {
    // Check current max user ID
    const userResult = await pool.query('SELECT COUNT(*) as count, MAX(id) as max_id FROM users');
    console.log('Users table:', userResult.rows[0]);
    
    // Check last 5 users
    const lastUsers = await pool.query('SELECT id, email, created_at FROM users ORDER BY id DESC LIMIT 5');
    console.log('\nLast 5 users:');
    lastUsers.rows.forEach(row => {
      console.log(`ID: ${row.id}, Email: ${row.email}, Created: ${row.created_at}`);
    });
    
    // Check crypto_wallets
    const walletsResult = await pool.query('SELECT COUNT(*) as count FROM crypto_wallets');
    console.log('\nCrypto wallets count:', walletsResult.rows[0].count);
    
    const lastWallets = await pool.query(`
      SELECT w.id, w.user_id, w.wallet_address, w.wallet_type, w.created_at,
             u.email
      FROM crypto_wallets w
      JOIN users u ON w.user_id = u.id
      ORDER BY w.id DESC LIMIT 5
    `);
    console.log('\nLast 5 wallets:');
    lastWallets.rows.forEach(row => {
      const addr = row.wallet_address ? row.wallet_address.substring(0, 10) + '...' : 'null';
      console.log(`ID: ${row.id}, User: ${row.email}, Address: ${addr}, Type: ${row.wallet_type}`);
    });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();
