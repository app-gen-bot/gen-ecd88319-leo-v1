#!/bin/bash
# Monitor Generation 25 and verify Deploy button fix
# Run this script to watch the generation progress in real-time

echo "🔍 Monitoring Generation 25 - Deploy Button Fix Test"
echo "======================================================"
echo ""

DATABASE_URL="postgresql://postgres:9mq43IWobqB0tQQa@db.flhrcbbdmgflzgicgeua.supabase.co:5432/postgres"

check_status() {
    cd /home/jake/NEW/WORK/APP_GEN/app-gen-saas
    node -e "
    import('postgres').then(async ({ default: postgres }) => {
      const client = postgres('$DATABASE_URL');
      try {
        const result = await client\`
          SELECT id, status, github_url, download_url, error_message, completed_at
          FROM generation_requests
          WHERE id = 25
        \`;
        if (result.length > 0) {
          const gen = result[0];
          console.log('Generation 25 Status:', gen.status.toUpperCase());
          if (gen.status === 'completed') {
            console.log('✅ COMPLETED!');
            console.log('');
            console.log('GitHub URL:', gen.github_url || '❌ NULL - FIX FAILED');
            console.log('Download URL:', gen.download_url || '❌ NULL');
            console.log('Completed At:', gen.completed_at);
            if (gen.github_url) {
              console.log('');
              console.log('🎉 SUCCESS! GitHub URL is populated!');
              console.log('🚀 Deploy button fix is WORKING!');
              console.log('');
              console.log('Next steps:');
              console.log('1. Visit:', gen.github_url);
              console.log('2. Verify repository contains generated code');
              console.log('3. Check for fly.toml and README.md');
            } else {
              console.log('');
              console.log('❌ FAILED! GitHub URL is NULL');
              console.log('Check Docker logs for errors:');
              console.log('docker logs happy-llama | grep -i \"github.*25\"');
            }
            process.exit(0);
          } else if (gen.status === 'failed') {
            console.log('❌ FAILED!');
            console.log('');
            console.log('Error:', gen.error_message || 'Unknown error');
            console.log('Completed At:', gen.completed_at);
            console.log('');
            console.log('Check Docker logs:');
            console.log('docker logs happy-llama | tail -100 | grep -i \"25\"');
            process.exit(1);
          } else {
            console.log('⏳ Still generating...');
            console.log('Started:', result[0].created_at);
          }
        }
      } finally {
        await client.end();
      }
    });
    " 2>&1
}

echo "Starting monitoring loop (will check every 30 seconds)..."
echo "Press Ctrl+C to stop"
echo ""

COUNTER=0
while true; do
    COUNTER=$((COUNTER + 1))
    echo "[$COUNTER] $(date +%H:%M:%S)"
    check_status

    # Check if generation completed (script exits above)
    if [ $? -eq 0 ]; then
        break
    fi

    echo ""
    echo "Waiting 30 seconds before next check..."
    sleep 30
done

echo ""
echo "✅ Monitoring complete!"
echo ""
echo "To verify Deploy button fix manually:"
echo "1. docker logs happy-llama | grep -i \"github.*request 25\""
echo "2. Check GitHub repo exists at the URL above"
echo "3. Login to UI and verify Deploy button appears"
