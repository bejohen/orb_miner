// Identify the accounts in the manual mine transaction
const { PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

async function identifyAccounts() {
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');
  const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY);
  const { Keypair } = require('@solana/web3.js');
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  console.log('=== Identifying Manual Mine Transaction Accounts ===');
  console.log();

  // Accounts from the transaction
  const accounts = [
    'CPxC9bqDs811rdtPWrH9YVG6QUfQ7arcTAJEq98MoZdy',
    'Agr1igVEsQw8N4Ju1gGPoHP6v5x8vNkuQaNsL9VWymCY',
    '6aAGoVq9jKywWXyvWwoUtZFxbjR5aLBtfjhQXP1xezA',
    'FqGmrgS3stuhWYEGQCHM7QyFD3eEKdx9rS4tP47TR9cK',
  ];

  // Check PDAs
  const [boardPDA] = PublicKey.findProgramAddressSync([Buffer.from('board')], programId);
  const [treasuryPDA] = PublicKey.findProgramAddressSync([Buffer.from('treasury')], programId);

  console.log('Known PDAs:');
  console.log('  Board PDA:', boardPDA.toBase58());
  console.log('  Treasury PDA:', treasuryPDA.toBase58());
  console.log();

  // Try to find round PDAs
  console.log('Checking if accounts are Round PDAs...');
  for (let roundId = 2260; roundId < 2270; roundId++) {
    const roundIdBuf = Buffer.alloc(8);
    roundIdBuf.writeBigUInt64LE(BigInt(roundId));
    const [roundPDA] = PublicKey.findProgramAddressSync([Buffer.from('round'), roundIdBuf], programId);

    if (accounts.includes(roundPDA.toBase58())) {
      console.log(`  ✓ Found: Round ${roundId} PDA:`, roundPDA.toBase58());
    }
  }

  console.log();
  console.log('=== Instruction Analysis ===');
  console.log();
  console.log('Instruction 1 (Checkpoint - 1 byte discriminator 0x02):');
  console.log('  Accounts: 6 total');
  console.log('    0: Wallet (signer)');
  console.log('    1: Board PDA');
  console.log('    2: Miner PDA');
  console.log('    3: Unknown (possibly VAR or entropy)');
  console.log('    4: Unknown (possibly entropy program)');
  console.log('    5: System Program');
  console.log();
  console.log('Instruction 2 (Deploy - 13 bytes):');
  console.log('  Data: 0640420f0000000000ffffff01');
  console.log('  Breaking down as ORE-style Deploy:');
  console.log('    - Discriminator (1 byte): 0x06 (Deploy from ORE enum)');
  console.log('    - Amount (8 bytes LE): 0x000000000f4240 = 1,000,000 lamports = 0.001 SOL');
  console.log('    - Squares (4 bytes LE): 0x01ffffff = all 25 squares');
  console.log();
  console.log('  Accounts: 7 total');
  console.log('    0: Wallet (signer)');
  console.log('    1: Wallet (authority)');
  console.log('    2: Automation PDA');
  console.log('    3: Board PDA');
  console.log('    4: Miner PDA');
  console.log('    5: Round PDA (need to identify which round)');
  console.log('    6: System Program');
  console.log();
  console.log('=== Comparison ===');
  console.log();
  console.log('ORE-style Deploy (13 bytes, 7 accounts):');
  console.log('  - Used in manual mining on ORB frontend');
  console.log('  - Includes Board and Round PDAs');
  console.log('  - 1-byte discriminator (0x06)');
  console.log();
  console.log('ORB Auto-Deploy (34 bytes, 5 accounts):');
  console.log('  - Used by our bot and ORB auto-mine');
  console.log('  - Uses Fee Collector instead of Board/Round');
  console.log('  - 8-byte discriminator (0x0040420f00000000)');
  console.log();
  console.log('BOTH formats work! ORB supports two deploy methods.');
}

identifyAccounts().catch(console.error);
