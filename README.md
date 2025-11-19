# Smart Autonomous ORB Mining Bot

A fully automated TypeScript bot for ORB mining on Solana with **advanced mathematical optimization**. Features Monte Carlo-optimized bet sizing (+139% avg ROI), real-time Expected Value (EV) analysis, Kelly Criterion-inspired bankroll management, and dynamic strategy adaptation. Set it up once, and let it mine autonomously with intelligent threshold-based operation.

## What is ORB Mining?

ORB is a **lottery-style mining game** on Solana where:
- Each round has a 5x5 grid (25 squares)
- Miners deploy SOL to squares to participate
- One random square wins the round
- Winners get SOL from losing miners + ORB tokens from the motherload (reward vault)
- This bot deploys to all 25 squares each round to maximize your chances

**Learn more:** https://ore.blue/

## Key Features

### Intelligence & Optimization
- **Monte Carlo Optimized** - 10,000-simulation analysis determines optimal bet sizing for each tier (+139% avg ROI vs +74% with naive strategies)
- **Kelly Criterion Bankroll Management** - Fractional betting (0.11% to 1.67% per round) prevents over-betting and minimizes ruin risk
- **Real-Time EV Analysis** - Calculates Expected Value using live on-chain competition data before every deployment
- **Dynamic Scaling** - Auto-restarts with optimal amounts when motherload changes 40-50%+ (adapts to market conditions)

### Automation & Convenience
- **Fully Autonomous** - One command starts everything, zero manual intervention needed
- **Auto-Setup** - Automatically creates and funds automation account on first run
- **Auto-Claim** - Collects your SOL and ORB rewards automatically when thresholds are met
- **Auto-Swap** - Converts ORB to SOL to refund the bot (with minimum price protection)
- **Auto-Stake** - Optional staking of excess ORB for additional yield

### Protection & Risk Management
- **Profitability Gating** - Only mines when EV > 0 (skips unprofitable rounds automatically)
- **Price Floor Protection** - Won't sell ORB below configurable minimum USD price
- **Multi-Layer Safety** - Motherload thresholds, minimum balances, safety reserves
- **Full Transparency** - Logs complete EV breakdown for every decision (verify the math yourself)

## Advanced Intelligence Features

### Monte Carlo Optimization

This bot uses **10,000-simulation Monte Carlo analysis** to determine optimal bet sizing for every motherload tier. Unlike simple bots that use fixed deployment amounts, this bot's strategy was mathematically optimized through extensive probabilistic modeling:

- **10,000+ Simulations Per Tier**: Each motherload tier (200-299 ORB, 300-399 ORB, etc.) was tested through 10,000 independent mining simulations
- **Multi-Strategy Testing**: Four different strategies (Conservative, Ultra Conservative, Extreme Conservative, etc.) were compared head-to-head
- **Risk-Adjusted Optimization**: The chosen tier configuration maximizes expected ROI while minimizing risk of ruin (< 5% chance of losing 80%+ of capital)
- **Proven Performance**: Monte Carlo analysis shows +139% average ROI with current settings vs +74% with naive fixed-bet strategies
- **Real Probability Modeling**: Accounts for 1/625 win chance, 95% SOL return rate, 10% refining fee, and variable competition levels

**Example Results from Monte Carlo Testing:**
- 700-799 ORB motherload: 240 rounds @ 0.42% budget/round = **+172% ROI** (peak performance tier)
- 1000-1099 ORB motherload: 120 rounds @ 0.83% budget/round = **+125% ROI**
- 200-299 ORB motherload: 440 rounds @ 0.23% budget/round = **+74% ROI** (ultra-conservative for low rewards)

Run the simulation yourself: `npx ts-node scripts/monte-carlo-simulation.ts`

### Kelly Criterion Principles

While not using the classical Kelly Criterion formula directly (due to the lottery-style mechanics), this bot implements **fractional Kelly bankroll management**:

- **Fractional Betting**: Never risks more than ~1.67% of total budget per round (even at max aggression)
- **Edge-Based Sizing**: Deploys larger amounts when "edge" is favorable (high motherload = higher EV)
- **Dynamic Position Sizing**: Automatically scales bet size up/down as motherload (reward pool) changes
- **Ruin Prevention**: Extreme conservative tiers (400+ rounds) when motherload is low to preserve capital
- **Optimal Growth**: Tier system balances between maximizing growth rate and minimizing bankruptcy risk

**Kelly-Inspired Tier Logic:**
- **High Edge** (1200+ ORB motherload): Aggressive 60 rounds = ~1.67% per round
- **Medium Edge** (700-799 ORB): Moderate 240 rounds = ~0.42% per round
- **Low Edge** (200-299 ORB): Conservative 440 rounds = ~0.23% per round
- **Minimal Edge** (0-199 ORB): Maximum conservation 880 rounds = ~0.11% per round

This fractional approach prevents over-betting (Kelly criterion's primary insight) while adapting to changing reward conditions.

### Real-Time Expected Value (EV) Calculation

The bot doesn't blindly deploy - it calculates profitability **for every single round** before committing capital:

1. **Fetches Live Competition**: Reads `totalDeployed` from on-chain Round account to get REAL current competition (not estimates)
2. **Calculates Your Share**: Determines your exact percentage of total deployment
   ```
   Your Share = Your Deployment / (Total Competition + Your Deployment)
   ```
3. **Gets Current ORB Price**: Fetches live ORB/SOL price from Jupiter DEX
4. **Computes Expected Value**:
   ```
   Base Reward Expected = Your Share × 4 ORB
   Motherload Expected = (1/625 chance) × Your Share × Motherload ORB
   Total ORB Expected = (Base + Motherload) × 0.9 (after 10% refining fee)
   SOL Expected Back = Your Deployment × 0.95

   EV = (ORB Expected × ORB Price) + SOL Expected Back - Your Deployment
   ```
5. **Only Mines When EV > 0**: Skips unprofitable rounds automatically

**Example EV Calculation:**
```
Your Deployment: 0.18 SOL
Total Competition: 7.77 SOL (from on-chain Round data)
Your Share: 2.3%
ORB Price: 0.124 SOL ($24.80)
Expected ORB: 0.112 ORB × 0.124 = 0.014 SOL
Expected SOL Back: 0.174 SOL
Expected Value: 0.014 + 0.174 - 0.18 = +0.008 SOL (4.4% ROI) ✅ PROFITABLE
```

This protects you from mining when competition is too high or ORB price crashes.

### Dynamic Scaling & Auto-Restart

The bot **continuously monitors motherload changes** and automatically adjusts strategy:

- **50%+ Motherload Increase**: Closes automation, reclaims SOL, recreates with larger deployments
  - Example: 300 ORB → 500 ORB = restart with 67% larger bets to maximize EV
- **40%+ Motherload Decrease**: Closes automation, recreates with smaller deployments to reduce risk
  - Example: 500 ORB → 280 ORB = restart with 44% smaller bets to preserve capital
- **Seamless Transitions**: No manual intervention needed - bot detects, closes, and restarts automatically
- **Capital Preservation**: Always reclaims remaining SOL before restart (nothing wasted)

This ensures you're **always betting optimally** for current market conditions, not using outdated strategy from hours ago.

### Risk Management Features

Multiple layers of protection prevent catastrophic losses:

1. **Motherload Threshold Gate**: Won't mine unless rewards >= configurable threshold (default: 100 ORB)
2. **Production Cost Check**: Skips rounds where EV < 0 (protects against high competition or low ORB price)
3. **Minimum Price Floor**: Won't swap ORB below configurable USD price (default: $30)
4. **Safety Reserve**: Always keeps minimum ORB balance (configurable, prevents selling everything)
5. **Minimum SOL Balance**: Maintains wallet SOL reserve for tx fees (default: 0.1 SOL)
6. **Fractional Bankroll**: Never risks more than small % of total capital per round
7. **Auto-Depletion Detection**: Closes automation immediately when budget exhausted (reclaims dust)

### Profitability Transparency

Unlike black-box bots, this shows you **exactly why** it's mining or waiting:

**When Profitable:**
```
[DEBUG] Production Cost Analysis (Profitable):
  Competition: REAL on-chain data (42.5x)
  Your Share: 2.30%
  Production Cost: 0.182800 SOL
  Expected ORB: 0.1123 ORB × 0.123706 SOL = 0.013894 SOL
  Expected SOL Back: 0.173660 SOL
  Expected Value (EV): +0.004754 SOL
  ROI: 2.60%
  Profitable: ✅ YES
```

**When Unprofitable:**
```
[WARNING] Unprofitable conditions (EV: -0.001234 SOL) - waiting...
[DEBUG] Motherload: 150.00 ORB, ORB Price: 0.050000 SOL
[DEBUG] Competition too high for current ORB price - skipping round
```

You can verify the math yourself - full breakdown logged for every decision.

## Development Fee

**This bot includes a 0.1% development fee on each mining deployment.**

- **Fee Amount:** 0.1% of each SOL deployment (10 basis points)
- **Purpose:** Supports ongoing development and maintenance of the bot
- **Transparency:** The fee is automatically deducted on each deployment transaction

Example: If you deploy 1 SOL to mine, 0.001 SOL (0.1%) goes to the development wallet, and 0.999 SOL is deployed for mining.

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **A Solana wallet** with some SOL for mining
4. **Your wallet's private key** (base58 format can be exported from any popular browser wallet)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/CryptoGnome/orb_miner.git
cd orb_miner
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Your Wallet

Create a `.env` file in the project root:

```bash
# Copy the example configuration file
cp .env.example .env
```

Edit the `.env` file and add your wallet's private key:

```env
PRIVATE_KEY=your_base58_private_key_here
```

**How to get your private key:**
- Phantom wallet: Settings → Show Private Key (exports in base58 format)
**Security Warning:** Never share your private key or commit the `.env` file to Git!

### 4. Fund Your Wallet

Make sure your wallet has enough SOL:
- Minimum: 1 SOL (for testing)
- Recommended: 5+ SOL (for sustained mining)

The bot will use 90% of your SOL balance by default to set up the automation account.

### 5. Review Configuration (Optional)

The `.env` file has sensible defaults, but you can customize:

```env
# Only mine when rewards are >= 100 ORB
MOTHERLOAD_THRESHOLD=100

# Production Cost Analysis (RECOMMENDED - uses real-time competition data)
ENABLE_PRODUCTION_COST_CHECK=true
MIN_EXPECTED_VALUE=0  # Minimum EV in SOL (0 = break-even or better)
ESTIMATED_COMPETITION_MULTIPLIER=20  # Fallback estimate

# Use 90% of wallet SOL for automation setup
INITIAL_AUTOMATION_BUDGET_PCT=90

# Auto-claim rewards when they reach these amounts
AUTO_CLAIM_SOL_THRESHOLD=0.1
AUTO_CLAIM_ORB_THRESHOLD=1.0

# Auto-swap settings to refund automation
AUTO_SWAP_ENABLED=true
WALLET_ORB_SWAP_THRESHOLD=10
MIN_ORB_TO_KEEP=5
MIN_ORB_PRICE_USD=30  # Won't sell below this price

# Optional: Enable auto-staking
AUTO_STAKE_ENABLED=false
STAKE_ORB_THRESHOLD=50
```

See [.env.example](.env.example) for all available options with detailed explanations.

## Running the Bot

### Start Mining

Simply run:

```bash
npm start
```

That's it! The bot will:
1. Check if automation account exists (if not, create it automatically)
2. Start monitoring for new mining rounds
3. Deploy to all 25 squares when profitable
4. Auto-claim rewards periodically
5. Auto-swap ORB to refund itself when low on SOL
6. Keep running until you stop it (Ctrl+C)

### Development Mode (Auto-reload on code changes)

```bash
npm run dev
```

## Monitoring Your Bot

### Watch Logs in Real-Time

```bash
# All logs
tail -f logs/combined.log

# Errors only
tail -f logs/error.log

# Transaction signatures only
tail -f logs/transactions.log
```

### Check Status Manually

While the bot is running, open a new terminal and run:

```bash
npx ts-node tests/test-query.ts
```

This shows:
- Your wallet balances (SOL, ORB)
- Automation account balance
- Claimable rewards
- Current round info
- Motherload size

## Understanding the Output

When running, you'll see messages like:

**Profitability Checking:**
```
[DEBUG] Round 3142: totalDeployed = 7.7691 SOL
[DEBUG] Production Cost Analysis (Profitable):
  Competition: REAL on-chain data (42.5x)
  Your Share: 2.30%
  Production Cost: 0.182800 SOL
  Expected ORB: 0.1123 ORB × 0.123706 SOL = 0.013894 SOL
  Expected SOL Back: 0.173660 SOL
  Expected Value (EV): +0.004754 SOL
  ROI: 2.60%
  Profitable: ✅ YES
```

**Mining:**
```
[INFO] Round 12345 detected (Motherload: 250.00 ORB)
[INFO] Deploying 0.18 SOL across 25 squares
[INFO] Deploy successful: https://solscan.io/tx/...
[INFO] Automation balance: 5.25 SOL remaining
```

**Auto-Claiming:**
```
[INFO] Claimable SOL: 0.15 SOL (>= 0.1 threshold)
[INFO] Claiming SOL rewards...
[INFO] Claimed 0.15 SOL successfully
```

**Unprofitable Conditions:**
```
[WARNING] Unprofitable conditions (EV: -0.001234 SOL) - waiting...
[DEBUG] Motherload: 150.00 ORB, ORB Price: 0.050000 SOL
[DEBUG] Competition too high for current ORB price - skipping round
```

## Stopping the Bot

Press `Ctrl+C` to gracefully stop the bot. It will finish the current operation and exit safely.

## Testing Before Real Mining

To test without spending real SOL:

1. Edit `.env` and set:
   ```env
   DRY_RUN=true
   ```

2. Run the bot:
   ```bash
   npm start
   ```

The bot will simulate all operations without sending actual transactions.

## Cost and Profitability

**Production Cost Analysis (Smart Mining):**

The bot features **intelligent profitability checking** that uses real-time blockchain data:

1. **Fetches actual Round data** - Reads `totalDeployed` from the current Round account
2. **Calculates your exact share** - Determines your percentage of total competition
3. **Gets current ORB price** - Fetches live ORB/SOL price from Jupiter
4. **Computes Expected Value (EV)** - Calculates if mining is profitable:
   ```
   EV = (Expected ORB × ORB Price) + Expected SOL Back - Production Cost
   ```
5. **Only mines when EV > 0** - Skips unprofitable rounds automatically

**Example Calculation:**
- Your deployment: 0.18 SOL/round
- Total competition: 7.77 SOL (from Round account)
- Your share: 2.3% of total deployment
- ORB price: 0.124 SOL ($17.40)
- Expected ORB: 0.112 ORB × 0.124 = 0.014 SOL
- Expected SOL back: 0.174 SOL
- **Expected Value: +0.0048 SOL (2.6% ROI) ✅ PROFITABLE**

**Configuration:**
```env
# Enable/disable production cost checking
ENABLE_PRODUCTION_COST_CHECK=true

# Minimum EV required (0 = break-even or better)
MIN_EXPECTED_VALUE=0

# Fallback estimate when Round data unavailable
ESTIMATED_COMPETITION_MULTIPLIER=20
```

**Costs per Round:**
- Deployment: Variable (bot scales based on motherload size)
- Transaction fees: ~0.001 SOL per deployment
- Swap fees: ~0.5% when converting ORB to SOL

**Key Benefits:**
- ✅ **Accurate decisions** - Uses real competition, not guesses
- ✅ **Protects against losses** - Won't mine when ORB price is too low
- ✅ **Adapts to market** - Automatically adjusts to current conditions
- ✅ **Maximizes EV** - Only deploys when mathematically profitable

## Troubleshooting

### "Insufficient funds" error
- Check your wallet has enough SOL
- Lower `INITIAL_AUTOMATION_BUDGET_PCT` in `.env`
- Fund your wallet with more SOL

### Bot not deploying
- **Profitability check failing** - Bot skips unprofitable rounds when ORB price is low or competition is high
  - Test profitability: `npx ts-node tests/test-live-profitability.ts`
  - Check logs for "Unprofitable conditions" warnings
  - Adjust `MIN_EXPECTED_VALUE` or disable `ENABLE_PRODUCTION_COST_CHECK` if needed
- Check if motherload is below `MOTHERLOAD_THRESHOLD`
- Verify automation account has balance: `npx ts-node tests/check-automation-account.ts`
- Check logs for errors: `tail -f logs/error.log`

### Automation account issues
```bash
# Check automation account status
npx ts-node tests/check-automation-account.ts

# Reset automation (WARNING: loses remaining balance)
npx ts-node tests/test-close-automation.ts
```

### Transaction failures
- Check RPC endpoint is working
- View transaction on [Solscan](https://solscan.io)
- Transaction signatures are logged in `logs/transactions.log`

## Advanced Usage

### Manual Commands

Test individual features:

```bash
# Check balances and status
npx ts-node tests/test-query.ts

# Test profitability analysis with REAL competition data
npx ts-node tests/test-live-profitability.ts

# View accurate profitability breakdown
npx ts-node tests/test-accurate-profitability.ts

# Manual deploy to all 25 squares
npx ts-node tests/test-deploy.ts

# Claim rewards manually
npx ts-node tests/test-claim.ts

# Swap ORB to SOL
npx ts-node tests/test-swap.ts

# Stake ORB tokens
npx ts-node tests/test-stake.ts
```

### Build TypeScript

```bash
# Compile TypeScript to JavaScript
npm run build

# Clean compiled files
npm run clean
```

## Project Structure

```
orb_miner/
├── src/
│   ├── index.ts              # Entry point
│   ├── commands/
│   │   └── smartBot.ts       # Main autonomous bot
│   ├── utils/                # Core utilities
│   └── types/                # TypeScript types
├── tests/                    # Test scripts
├── logs/                     # Log files
├── .env                      # Your configuration (create this)
├── .env.example              # Configuration template
└── package.json
```

## Technical Documentation

For developers and advanced users, see [CLAUDE.md](CLAUDE.md) for:
- Detailed architecture
- Manual account deserialization
- Instruction format reverse-engineering
- PDA derivation details
- Modifying bot behavior
- Adding new features

## Security Notes

- **Never commit your `.env` file** - It contains your private key
- **Use a dedicated wallet** for bot operations
- **Test with small amounts first** before deploying large sums
- **Keep a backup** of your private key in a secure location
- The `.gitignore` file already excludes `.env` for safety

## Support

- **Issues:** [Open an issue on GitHub](https://github.com/CryptoGnome/orb_miner/issues)
- **Questions:** Check [CLAUDE.md](CLAUDE.md) for technical details
- **Updates:** Watch this repo for updates

## Disclaimer

This bot interacts with the ORB mining program on Solana mainnet. Mining involves risk:
- You can lose SOL if you don't win rounds
- Smart contract risks (bugs, exploits)
- Network risks (transaction failures, congestion)

**Use at your own risk. Only mine with funds you can afford to lose.**

## License

[Your License Here]

---

**Happy Mining!** If this bot helps you win ORB, consider starring the repo!
