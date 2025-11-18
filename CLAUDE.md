# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Automated TypeScript CLI bot for ORB mining on Solana with Jupiter swap integration. ORB is a **lottery-style mining game** (not traditional proof-of-work) where miners deploy SOL to a 5x5 grid (25 squares), and a random square/miner wins the rewards each round.

**Key Concepts:**
- Each round has 25 squares (0-24)
- Miners deploy SOL to squares to participate
- Random square wins at round end
- Rewards = SOL from losing miners + ORB from motherload (vault)
- Bot deploys to all 25 squares each round to maximize chances

## Development Commands

```bash
# Run the bot (reads BOT_ACTION from .env)
npm start

# Development mode with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Clean compiled files
npm run clean
```

## Architecture

### Entry Point
- [src/index.ts](src/index.ts) - Simple router that reads `BOT_ACTION` from .env and dispatches to the appropriate command

### Command Layer
Commands are standalone operations in [src/commands/](src/commands/):
- **query.ts** - Check balances, rewards, round info, ORB price
- **deploy.ts** - Deploy SOL to all 25 squares once
- **claim.ts** - Claim SOL/ORB rewards from mining and/or staking
- **stake.ts** - Stake ORB tokens for yield
- **swap.ts** - Swap ORB to SOL via Jupiter
- **autoDeploy.ts** - Main automation loop (smart round management, auto-claim, auto-swap)

### Utilities Layer
Core utilities in [src/utils/](src/utils/):
- **accounts.ts** - PDA derivation and manual account deserialization for Board, Round, Miner, Stake, Treasury accounts
- **program.ts** - Instruction builders (deploy, claim, stake) and transaction sending with retry logic
- **jupiter.ts** - Jupiter API v6 integration for swaps and ORB price fetching
- **solana.ts** - Solana connection setup
- **wallet.ts** - Keypair loading from base58 private key
- **config.ts** - .env configuration loading and validation
- **logger.ts** - Winston-based logging (console + files)
- **retry.ts** - Exponential backoff retry logic

### Types
[src/types/index.ts](src/types/index.ts) - TypeScript interfaces for all on-chain accounts and API responses

## Critical Technical Details

### Manual Account Deserialization
The ORB program has no public IDL. All account structures are reverse-engineered from the ORE source code and real transactions:
- **Board**: roundId, startSlot, endSlot (tracks current round)
- **Round**: 25-element arrays for deployed amounts, motherload balance, totals
- **Miner**: 25-element arrays for deployments, claimable rewards (SOL + ORB), lifetime stats
- **Stake**: Staking balance and rewards
- **Treasury**: Global motherload and staking totals

Account deserialization uses manual buffer parsing with specific byte offsets. If account structures change on-chain, offsets in [accounts.ts:108-272](src/utils/accounts.ts#L108-L272) must be updated.

### Instruction Format (Reverse-Engineered)
All instructions are manually constructed by analyzing real ORB transactions:
- **Deploy**: 34-byte instruction with discriminator `0x0040420f00000000`, amount in lamports, squares mask (MUST be 0), and square count (25)
- **Claim SOL**: 1-byte discriminator `0x03` with 3 accounts (wallet, miner PDA, system program)
- **Claim ORB**: 1-byte discriminator `0x04` with 9 accounts (includes token accounts, treasury, SPL token programs)
- **Stake**: 16-byte instruction with discriminator and amount

See [program.ts:17-196](src/utils/program.ts#L17-L196) for instruction builders.

### Program-Derived Addresses (PDAs)
All accounts use PDAs derived from specific seeds:
- **Board**: `["board"]` - Singleton tracking current round
- **Round**: `["round", roundId]` - One per round
- **Miner**: `["miner", authority]` - One per wallet
- **Stake**: `["stake", authority]` - One per wallet
- **Treasury**: `["treasury"]` - Singleton for global state
- **Automation**: `["automation", authority]` - Used for deploy transactions

PDA derivation in [accounts.ts:8-77](src/utils/accounts.ts#L8-L77).

### Jupiter Integration
Jupiter API v6 is used for:
- Getting ORB/SOL swap quotes
- Executing swaps with configurable slippage
- Fetching ORB price in SOL and USD

The bot can auto-swap ORB to SOL when balance is low. See [jupiter.ts](src/utils/jupiter.ts) and [swap.ts](src/commands/swap.ts).

## Auto-Deploy Bot Logic

The [autoDeploy.ts](src/commands/autoDeploy.ts) command implements the main automation loop:

1. **Smart Round Management**:
   - Continuously monitors Board account for current round
   - Detects when round changes (new round starts)
   - Only deploys when motherload >= threshold (configurable)
   - Waits for new round before next deployment

2. **SOL Balance Management**:
   - Checks SOL balance before each deployment
   - If SOL < MIN_SOL_FOR_DEPLOYMENT, pauses and alerts user
   - If AUTO_SWAP_WHEN_LOW_SOL enabled, auto-swaps ORB to SOL
   - Resumes when SOL refilled

3. **Auto-Claiming**:
   - Periodically checks mining and staking rewards
   - Auto-claims when rewards >= thresholds (configurable)
   - Supports claiming SOL, ORB, or both from mining and/or staking

4. **Transaction Handling**:
   - Retries on failure with exponential backoff
   - Logs all transactions to `logs/transactions.log`
   - Graceful shutdown on Ctrl+C

## Configuration

All bot behavior is controlled by .env variables. Key settings:
- `BOT_ACTION`: Which command to run (query, deploy, claim, stake, swap, auto-deploy)
- `SOL_PER_DEPLOYMENT`: Amount of SOL to deploy per round
- `MOTHERLOAD_THRESHOLD`: Only deploy when motherload >= this value (profitability check)
- `MIN_SOL_FOR_DEPLOYMENT`: Pause if SOL drops below this
- `AUTO_CLAIM_ENABLED`: Enable/disable auto-claiming
- `AUTO_SWAP_WHEN_LOW_SOL`: Enable/disable auto-swapping ORB to SOL
- `DRY_RUN`: Simulate without sending transactions (testing)

See [.env.example](.env.example) for all options.

## Logging

Winston logger writes to:
- Console (INFO and above)
- `logs/combined.log` (all messages)
- `logs/error.log` (errors only)
- `logs/transactions.log` (transaction signatures)

## Testing Changes

When modifying the bot:
1. Set `DRY_RUN=true` in .env to test without sending real transactions
2. Use `BOT_ACTION=query` to inspect current state before/after changes
3. Test with small amounts first (`SOL_PER_DEPLOYMENT=0.001`)
4. Monitor `logs/error.log` for issues

## Common Tasks

### Add a new command
1. Create new file in [src/commands/](src/commands/)
2. Export async function (e.g., `export async function myCommand()`)
3. Add import and case to [src/index.ts](src/index.ts) switch statement
4. Add new BOT_ACTION value to .env

### Modify instruction format
If ORB program updates and instructions change:
1. Analyze a recent successful transaction on Solana explorer
2. Update discriminators and data layout in [program.ts](src/utils/program.ts)
3. Update account list if needed
4. Test with DRY_RUN first

### Update account structure
If on-chain account layouts change:
1. Locate the changed account type in [accounts.ts](src/utils/accounts.ts)
2. Update byte offsets in deserialize functions (fetchBoard, fetchRound, etc.)
3. Add/remove fields in corresponding TypeScript interface in [types/index.ts](src/types/index.ts)
4. Test thoroughly with query command

### Add new configuration option
1. Add to [.env.example](.env.example) with description
2. Add to [config.ts](src/utils/config.ts) with type and default value
3. Export from config object
4. Use via `config.yourNewOption` in code

## Project Context

- **ORB Program**: `boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk`
- **ORB Token Mint**: `orebyr4mDiPDVgnfqvF5xiu5gKnh94Szuz8dqgNqdJn`
- **Network**: Solana mainnet-beta
- **Based on**: ORE protocol (https://github.com/regolith-labs/ore)
- **Status**: See [AUTOMATION-STATUS.md](AUTOMATION-STATUS.md) for current deployment status and known issues
