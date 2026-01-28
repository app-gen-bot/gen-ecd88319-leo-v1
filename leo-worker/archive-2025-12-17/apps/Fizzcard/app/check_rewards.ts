import { Client } from 'pg';

const connectionString = 'postgresql://postgres.luhlijxjiceeyjqdyyyx:rBXA2UxRRzPWTTI0@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

async function checkRewards() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    // Check crypto wallet for user 86 (rewardtest)
    const result1 = await client.query(`
      SELECT id, user_id, wallet_address, pending_claim_amount, last_claim_at
      FROM crypto_wallets WHERE user_id IN (86, 87)
      ORDER BY user_id;
    `);
    
    console.log('Crypto Wallets:');
    console.table(result1.rows);
    
    // Check FizzCoin transactions
    const result2 = await client.query(`
      SELECT id, user_id, amount, transaction_type, reason, tx_hash, block_number, created_at
      FROM fizzcointransactions 
      WHERE user_id IN (86, 87)
      ORDER BY user_id, created_at DESC;
    `);
    
    console.log('\nFizzCoin Transactions:');
    console.table(result2.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkRewards();
