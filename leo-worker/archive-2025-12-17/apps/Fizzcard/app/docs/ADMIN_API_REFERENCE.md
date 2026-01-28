# Admin API Reference

Quick reference for FizzCard admin monitoring endpoints.

## 📊 Monitoring Endpoints

All endpoints are prefixed with `/api/admin/`

### 1. Wallet Status

**Endpoint**: `GET /api/admin/wallet-status`

**Description**: Get backend wallet ETH balance and transaction capacity.

**Example**:
```bash
curl http://localhost:5013/api/admin/wallet-status | jq '.'
```

**Response**:
```json
{
  "balance": "0.003198",
  "transactionsRemaining": 63,
  "isHealthy": false,
  "monitoring": true,
  "lastAlert": {
    "severity": "critical",
    "currentBalance": "0.003198",
    "threshold": "0.005",
    "transactionsRemaining": 63,
    "message": "CRITICAL: Backend wallet running low...",
    "timestamp": "2025-10-25T23:57:57.652Z"
  }
}
```

---

### 2. Reward Statistics

**Endpoint**: `GET /api/admin/reward-stats`

**Description**: Get user wallet statistics and pending claims.

**Example**:
```bash
curl http://localhost:5013/api/admin/reward-stats | jq '.'
```

**Response**:
```json
{
  "totalUsers": 57,
  "usersWithWallets": 6,
  "usersWithoutWallets": 51,
  "totalPendingClaims": 0,
  "walletDetails": [
    {
      "userId": 78,
      "email": "labhesh@gmail.com",
      "walletAddress": "0x7cd5716cef0ef60296f4bb958c2a3c3b7b9e7032",
      "pendingClaims": 0,
      "lastClaimAt": null
    }
  ]
}
```

---

### 3. System Health

**Endpoint**: `GET /api/admin/system-health`

**Description**: Comprehensive health check for all system components.

**Example**:
```bash
curl http://localhost:5013/api/admin/system-health | jq '.'
```

**Response**:
```json
{
  "status": "healthy|degraded|error",
  "timestamp": "2025-10-26T00:00:30.369Z",
  "components": {
    "backendWallet": {
      "status": "healthy|warning",
      "balance": "0.003198",
      "transactionsRemaining": 63
    },
    "database": {
      "status": "healthy",
      "mode": "database"
    },
    "blockchain": {
      "status": "healthy",
      "network": "Base Sepolia"
    },
    "rewards": {
      "totalUsers": 57,
      "walletsCreated": 6,
      "pendingClaims": 0
    }
  },
  "alerts": [...]
}
```

---

### 4. Manual Wallet Check

**Endpoint**: `POST /api/admin/check-wallet-balance`

**Description**: Trigger immediate wallet balance check.

**Example**:
```bash
curl -X POST http://localhost:5013/api/admin/check-wallet-balance | jq '.'
```

**Response**:
```json
{
  "message": "Wallet balance checked",
  "alert": {
    "severity": "critical|warning|urgent",
    "currentBalance": "0.003198",
    "threshold": "0.005",
    "transactionsRemaining": 63,
    "message": "CRITICAL: Backend wallet running low...",
    "timestamp": "2025-10-26T00:00:18.845Z"
  }
}
```

---

## 📝 Logging Endpoints

### 5. Recent Logs

**Endpoint**: `GET /api/admin/logs`

**Description**: Get recent application logs with filtering.

**Query Parameters**:
- `level`: Filter by log level (`debug|info|warn|error|critical`)
- `category`: Filter by category (`auth|blockchain|database|api|wallet|reward|transaction|network|system|general`)
- `limit`: Max logs to return (default: 100)

**Examples**:
```bash
# All recent logs
curl 'http://localhost:5013/api/admin/logs?limit=10' | jq '.'

# Auth errors only
curl 'http://localhost:5013/api/admin/logs?category=auth&level=error' | jq '.'

# Last 5 blockchain logs
curl 'http://localhost:5013/api/admin/logs?category=blockchain&limit=5' | jq '.'
```

**Response**:
```json
{
  "count": 1,
  "logs": [
    {
      "timestamp": "2025-10-26T00:04:22.339Z",
      "level": "warn",
      "category": "auth",
      "message": "Auth failed: Login failed: labhesh@gmail.com",
      "context": {
        "error": "Invalid credentials"
      }
    }
  ]
}
```

---

### 6. Logging Statistics

**Endpoint**: `GET /api/admin/logs/stats`

**Description**: Get aggregate logging statistics.

**Example**:
```bash
curl http://localhost:5013/api/admin/logs/stats | jq '.'
```

**Response**:
```json
{
  "total": 1,
  "byLevel": {
    "debug": 0,
    "info": 0,
    "warn": 1,
    "error": 0,
    "critical": 0
  },
  "byCategory": {
    "auth": 1,
    "blockchain": 0,
    "database": 0,
    "api": 0,
    "wallet": 0,
    "reward": 0,
    "transaction": 0,
    "network": 0,
    "system": 0,
    "general": 0
  },
  "recentErrors": 0
}
```

---

## ⛽ Gas Analytics Endpoints

### 7. Gas Usage Analytics

**Endpoint**: `GET /api/admin/gas-analytics`

**Description**: Get blockchain transaction gas usage and costs.

**Query Parameters**:
- `operation`: Filter by operation type (e.g., `creditReward`)
- `userId`: Filter by user ID
- `since`: Filter by date (ISO 8601 format)
- `limit`: Max recent transactions to include (default: 50)

**Examples**:
```bash
# All gas analytics
curl http://localhost:5013/api/admin/gas-analytics | jq '.'

# creditReward operations only
curl 'http://localhost:5013/api/admin/gas-analytics?operation=creditReward' | jq '.'

# Last 10 transactions
curl 'http://localhost:5013/api/admin/gas-analytics?limit=10' | jq '.'

# Transactions since yesterday
curl 'http://localhost:5013/api/admin/gas-analytics?since=2025-10-25T00:00:00Z' | jq '.'
```

**Response**:
```json
{
  "totalTransactions": 15,
  "successfulTransactions": 14,
  "failedTransactions": 1,
  "totalGasUsed": "750000",
  "totalCost": "37500000000000",
  "totalCostEth": "0.0000375",
  "averageGasPerTx": "50000",
  "averageCostPerTx": "2500000000000",
  "averageCostPerTxEth": "0.0000025",
  "byOperation": {
    "creditReward": {
      "count": 15,
      "totalGas": "750000",
      "totalCost": "37500000000000",
      "avgGas": "50000"
    }
  },
  "recentTransactions": [...]
}
```

---

### 8. Cost Projection

**Endpoint**: `GET /api/admin/gas-projection`

**Description**: Estimate future blockchain costs based on historical usage.

**Query Parameters**:
- `transactionsPerDay`: Estimated daily transaction volume (default: 100)

**Examples**:
```bash
# Default projection (100 tx/day)
curl http://localhost:5013/api/admin/gas-projection | jq '.'

# Custom projection (50 tx/day)
curl 'http://localhost:5013/api/admin/gas-projection?transactionsPerDay=50' | jq '.'
```

**Response**:
```json
{
  "estimatedTransactionsPerDay": 50,
  "dailyCost": "0.00125",
  "weeklyCost": "0.00875",
  "monthlyCost": "0.0375"
}
```

---

## 🛠️ Common Use Cases

### Check System Health

```bash
#!/bin/bash
# health-check.sh - Run daily health check

curl -s http://localhost:5013/api/admin/system-health | jq '{
  status,
  wallet: .components.backendWallet,
  alerts
}'
```

### Monitor Wallet Balance

```bash
#!/bin/bash
# wallet-alert.sh - Check if wallet needs funding

BALANCE=$(curl -s http://localhost:5013/api/admin/wallet-status | jq -r '.balance')
THRESHOLD=0.01

if (( $(echo "$BALANCE < $THRESHOLD" | bc -l) )); then
  echo "⚠️ WARNING: Wallet balance low ($BALANCE ETH)"
  echo "Please fund wallet immediately!"
fi
```

### Review Recent Errors

```bash
#!/bin/bash
# error-review.sh - Review recent errors

echo "=== Recent Errors ==="
curl -s 'http://localhost:5013/api/admin/logs?level=error&limit=10' | \
  jq '.logs[] | {timestamp, category, message}'

echo -e "\n=== Error Statistics ==="
curl -s http://localhost:5013/api/admin/logs/stats | \
  jq '{total, recentErrors, errorsByCategory: .byCategory}'
```

### Gas Cost Analysis

```bash
#!/bin/bash
# gas-analysis.sh - Analyze gas costs for budgeting

echo "=== Gas Usage Summary ==="
curl -s http://localhost:5013/api/admin/gas-analytics | \
  jq '{
    totalTransactions,
    totalCostEth,
    averageCostPerTxEth,
    byOperation
  }'

echo -e "\n=== Monthly Cost Projection (100 tx/day) ==="
curl -s 'http://localhost:5013/api/admin/gas-projection?transactionsPerDay=100' | \
  jq '.'
```

---

## 🔐 Security Notes

**Current Status**: Endpoints are open for development testing.

**Production Requirements**:
1. Add admin authentication middleware
2. Implement IP whitelisting
3. Add rate limiting
4. Use HTTPS only
5. Implement API key rotation

**Example Production Setup**:
```typescript
// server/middleware/admin-auth.ts
export function adminAuthMiddleware() {
  return async (req, res, next) => {
    const apiKey = req.headers['x-admin-api-key'];
    const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];

    // Verify API key
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify IP whitelist
    const clientIP = req.ip;
    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}
```

---

## 📊 Monitoring Dashboard Integration

These endpoints can be integrated with monitoring dashboards:

### Grafana
- Use JSON API data source
- Create panels for wallet balance, transaction counts, error rates
- Set up alerts based on thresholds

### Custom Dashboard
- Poll `/api/admin/system-health` every 30 seconds
- Display real-time metrics
- Show recent errors from logs endpoint

### Automated Alerts
- Cron job checking wallet balance every hour
- Send email/Slack notification on CRITICAL alerts
- Daily summary reports via gas analytics

---

## 🎯 Quick Reference Table

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/wallet-status` | GET | Backend wallet balance |
| `/api/admin/reward-stats` | GET | User reward statistics |
| `/api/admin/system-health` | GET | Overall system health |
| `/api/admin/check-wallet-balance` | POST | Manual wallet check |
| `/api/admin/logs` | GET | Recent application logs |
| `/api/admin/logs/stats` | GET | Log statistics |
| `/api/admin/gas-analytics` | GET | Gas usage analytics |
| `/api/admin/gas-projection` | GET | Cost projections |

---

**Last Updated**: October 26, 2025
**API Version**: 1.0
**Base URL**: `http://localhost:5013` (dev) | `https://api.fizzcard.app` (prod)
