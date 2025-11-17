// Identify the unknown account from the successful transaction
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

async function identifyAccount() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');

  // From the successful transaction
  const unknownAccount = new PublicKey('577HqbrnKM4micsY52rW8j6i9W8SmzV3FprfBCDneNpF');

  console.log('Unknown account:', unknownAccount.toBase58());
  console.log();

  // Check if it's a PDA
  const seeds = ['board', 'round', 'treasury', 'miner', 'automation'];

  for (const seed of seeds) {
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from(seed)], programId);
    if (pda.equals(unknownAccount)) {
      console.log(`✓ Match! This is the ${seed.toUpperCase()} PDA`);
      return;
    }
  }

  // Check if it's a round PDA with different round IDs
  for (let roundId = 2240; roundId < 2260; roundId++) {
    const roundIdBuf = Buffer.alloc(8);
    roundIdBuf.writeBigUInt64LE(BigInt(roundId));
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from('round'), roundIdBuf], programId);
    if (pda.equals(unknownAccount)) {
      console.log(`✓ Match! This is the ROUND PDA for round ID ${roundId}`);
      return;
    }
  }

  console.log('✗ Not a standard PDA');

  // Get account info
  const accountInfo = await connection.getAccountInfo(unknownAccount);
  if (accountInfo) {
    console.log();
    console.log('Account info:');
    console.log('  Owner:', accountInfo.owner.toBase58());
    console.log('  Data length:', accountInfo.data.length);
    console.log('  Lamports:', accountInfo.lamports);
  }
}

identifyAccount().catch(console.error);
