# Fee Optimization & Dynamic Fee Estimation

## Overview

The ORB Mining Bot now includes **intelligent dynamic fee estimation** that automatically optimizes transaction fees based on real-time network congestion. This helps you:

- ✅ **Save money** during quiet network periods
- ✅ **Ensure reliable transaction landing** during busy periods
- ✅ **Automatically adapt** without manual intervention
- ✅ **Support multiple RPC providers** (Helius, Triton, standard Solana RPCs)

## How It Works

### 1. RPC Capability Detection (Automatic)

On startup, the bot automatically detects if your RPC supports fee estimation:

- **Helius-style API**: `getPriorityFeeEstimate` (most accurate, account-specific)
- **Standard Solana API**: `getRecentPrioritizationFees` (percentile-based)
- **Fallback**: Static configuration if RPC doesn't support fee APIs

This detection happens once per session and is cached for performance.

### 2. Dynamic Fee Calculation

For each transaction, the bot:

1. Queries your RPC for current network fees
2. Calculates the appropriate fee based on your configured level (low/medium/high/veryHigh)
3. Applies min/max bounds to protect against extreme values
4. Uses transaction-specific compute unit limits for accuracy

### 3. Transaction Type Optimization

Different transaction types have different compute requirements:

| Transaction Type | Compute Units | Typical Fee (medium, $150 SOL) |
|------------------|---------------|--------------------------------|
| Deploy/Mining    | 300,000 CU    | ~$0.001 - $0.002              |
| Claim SOL        | 50,000 CU     | ~$0.0002 - $0.0004            |
| Claim ORB        | 150,000 CU    | ~$0.0006 - $0.001             |
| Stake            | 100,000 CU    | ~$0.0004 - $0.0008            |
| Swap (Jupiter)   | 400,000 CU    | ~$0.0015 - $0.003             |
| Checkpoint       | 200,000 CU    | ~$0.0008 - $0.0015            |

## Configuration

### Fee Level Settings (.env)

```env
# Transaction landing speed preference
# Options: 'low' (cheap, may be slower), 'medium' (balanced), 'high' (fast), 'veryHigh' (guaranteed fast)
PRIORITY_FEE_LEVEL=medium

# Minimum priority fee (micro-lamports per compute unit)
# Bot will never go below this, even if network is uncongested
MIN_PRIORITY_FEE_MICRO_LAMPORTS=100

# Maximum priority fee (micro-lamports per compute unit)
# Bot will never exceed this, even during extreme congestion
MAX_PRIORITY_FEE_MICRO_LAMPORTS=50000
```

### Understanding the Levels

| Level     | Network Percentile | Use Case                           | Relative Cost |
|-----------|-------------------|-------------------------------------|---------------|
| `low`     | 25th percentile   | Cost-conscious, can wait           | 💰            |
| `medium`  | 50th percentile   | Balanced speed/cost (recommended)  | 💰💰          |
| `high`    | 75th percentile   | Priority transactions              | 💰💰💰        |
| `veryHigh`| 95th percentile   | Guaranteed fast landing            | 💰💰💰💰      |

### Swap-Specific Settings

For Jupiter swaps, you can override the dynamic fee estimation:

```env
# Priority fee for swap transactions (lamports)
# Options:
#   - 'auto': Let Jupiter decide (recommended)
#   - 0 or negative: Use dynamic fee estimation
#   - Positive number: Use static fee (e.g., 100000 lamports)
SWAP_PRIORITY_FEE_LAMPORTS=auto
```

## Testing Your Setup

Run the fee estimation test to verify your RPC supports dynamic fees:

```bash
npx ts-node tests/test-fee-estimation.ts
```

### Sample Output

```
✅ RPC supports standard getRecentPrioritizationFees

Transaction Type: Deploy/Mining
  low        →    100 μ-lamports/CU | Total:     30 lamports (~0.000000 SOL)
  medium     →  25050 μ-lamports/CU | Total:   7515 lamports (~0.000008 SOL)
  high       →  37500 μ-lamports/CU | Total:  11250 lamports (~0.000011 SOL)
  veryHigh   →  50000 μ-lamports/CU | Total:  15000 lamports (~0.000015 SOL)

✅ Fee is within configured range (dynamic estimation active)
```

## RPC Provider Recommendations

### Best for Fee Estimation

1. **Helius** (https://www.helius.dev/)
   - ✅ Supports `getPriorityFeeEstimate` (most accurate)
   - ✅ Account-specific fee recommendations
   - ✅ Fast and reliable
   - 💰 Free tier: 100,000 requests/day

2. **Triton** (https://triton.one/)
   - ✅ Supports `getPriorityFeeEstimate`
   - ✅ High performance
   - 💰 Competitive pricing

3. **QuickNode** (https://www.quicknode.com/)
   - ✅ Supports standard Solana APIs
   - ✅ Global infrastructure
   - 💰 Free tier available

### Standard RPCs (Fallback Mode)

If using standard Solana RPC endpoints (e.g., `api.mainnet-beta.solana.com`):
- ⚠️ Limited to `getRecentPrioritizationFees` API
- ⚠️ Less accurate than Helius-style estimation
- ✅ Still better than static fees
- ✅ Bot will automatically adapt

## Cost Savings Examples

### Scenario: Quiet Network Period

Without dynamic fees (static 100,000 lamports):
- Mining deployment: **100,000 lamports** (~$0.015)
- Daily cost (100 rounds): **10,000,000 lamports** (~$1.50)

With dynamic fees (25,050 micro-lamports/CU):
- Mining deployment: **7,515 lamports** (~$0.0011)
- Daily cost (100 rounds): **751,500 lamports** (~$0.11)

**Savings: ~$1.39/day = $42/month** 💰

### Scenario: Congested Network

Without dynamic fees (static 100,000 lamports):
- ❌ Transactions may fail to land
- ❌ Miss profitable rounds
- ❌ Retry costs add up

With dynamic fees (auto-adjusts to 150,000 micro-lamports/CU):
- ✅ Transactions land reliably
- ✅ Capture profitable opportunities
- ✅ Optimal cost for conditions

## Advanced Configuration

### For High-Frequency Operations

If you're running aggressive mining (many rounds per day):

```env
PRIORITY_FEE_LEVEL=high
MIN_PRIORITY_FEE_MICRO_LAMPORTS=1000
MAX_PRIORITY_FEE_MICRO_LAMPORTS=100000
```

### For Cost-Conscious Operation

If you want to minimize costs and can tolerate occasional delays:

```env
PRIORITY_FEE_LEVEL=low
MIN_PRIORITY_FEE_MICRO_LAMPORTS=100
MAX_PRIORITY_FEE_MICRO_LAMPORTS=25000
```

### For Maximum Reliability

If you need guaranteed transaction landing (e.g., high-value motherloads):

```env
PRIORITY_FEE_LEVEL=veryHigh
MIN_PRIORITY_FEE_MICRO_LAMPORTS=5000
MAX_PRIORITY_FEE_MICRO_LAMPORTS=200000
```

## Monitoring Fee Performance

### Check Current Fees

The bot logs fee information for each transaction:

```
Fee estimate (medium): 25050 μ-lamports/CU, limit: 300000 CU, total: 7515 lamports (~0.000008 SOL)
```

### Analyze Patterns

Watch `logs/combined.log` to understand fee patterns:

```bash
# View fee estimates
grep "Fee estimate" logs/combined.log

# Check if hitting min/max bounds
grep "at MINIMUM\|at MAXIMUM" logs/combined.log
```

### Optimization Tips

1. **If always at minimum**: Your RPC might not support fee estimation, or network is very quiet
   - Consider switching to Helius/Triton for better estimation

2. **If always at maximum**: Network is consistently congested
   - Increase `MAX_PRIORITY_FEE_MICRO_LAMPORTS`
   - Or reduce `PRIORITY_FEE_LEVEL` to save costs

3. **If fees vary**: Dynamic estimation is working! 🎉
   - Bot is adapting to network conditions
   - You're getting optimal fees

## Troubleshooting

### "Using fallback static fee estimation"

**Cause**: Your RPC doesn't support fee estimation APIs

**Solutions**:
1. Switch to Helius, Triton, or QuickNode
2. Manually set reasonable static fees in `.env`
3. Accept fallback mode (still better than guessing)

### Transactions failing with "insufficient fee"

**Cause**: Network is more congested than your max fee allows

**Solutions**:
1. Increase `MAX_PRIORITY_FEE_MICRO_LAMPORTS`
2. Switch to `PRIORITY_FEE_LEVEL=high` or `veryHigh`
3. Wait for less congested periods

### Fees seem too high

**Cause**: Network congestion or overly aggressive settings

**Solutions**:
1. Verify with fee estimation test: `npx ts-node tests/test-fee-estimation.ts`
2. Lower `PRIORITY_FEE_LEVEL` to `low` or `medium`
3. Reduce `MAX_PRIORITY_FEE_MICRO_LAMPORTS`
4. Check if you need such fast landing times

## Technical Details

### Fee Calculation Formula

```
Total Fee (lamports) = (computeUnitPrice * computeUnitLimit) / 1,000,000

Where:
- computeUnitPrice: micro-lamports per compute unit (from RPC or fallback)
- computeUnitLimit: transaction-specific (e.g., 300,000 for mining)
```

### RPC API Methods Used

1. **Helius-style** (`getPriorityFeeEstimate`):
   ```json
   {
     "jsonrpc": "2.0",
     "method": "getPriorityFeeEstimate",
     "params": [{
       "accountKeys": ["<account1>", "<account2>"],
       "options": { "recommended": true }
     }]
   }
   ```

2. **Standard Solana** (`getRecentPrioritizationFees`):
   ```javascript
   const fees = await connection.getRecentPrioritizationFees();
   // Returns recent fee samples, bot calculates percentile
   ```

### Caching & Performance

- RPC capabilities detected **once per session** (cached for 1 hour)
- Fee estimates fetched **per transaction** (real-time)
- No noticeable performance impact (<50ms overhead)

## Best Practices

1. ✅ **Use Helius or Triton** for best fee estimation accuracy
2. ✅ **Start with `medium` level** and adjust based on monitoring
3. ✅ **Set reasonable min/max bounds** to protect against extremes
4. ✅ **Test with `test-fee-estimation.ts`** before running bot
5. ✅ **Monitor logs** to understand your fee patterns
6. ⚠️ **Don't set max too low** if you need guaranteed landing
7. ⚠️ **Don't use `veryHigh` unless necessary** (costs add up)

## Summary

The dynamic fee estimation system automatically optimizes transaction costs while ensuring reliable landing. By detecting your RPC's capabilities and adapting to real-time network conditions, the bot can save significant amounts on fees during quiet periods while ensuring transactions land during busy periods.

**Recommended Setup for Most Users:**
```env
PRIORITY_FEE_LEVEL=medium
MIN_PRIORITY_FEE_MICRO_LAMPORTS=100
MAX_PRIORITY_FEE_MICRO_LAMPORTS=50000
SWAP_PRIORITY_FEE_LAMPORTS=auto
```

For questions or issues, check `logs/combined.log` or run the fee estimation test script.
