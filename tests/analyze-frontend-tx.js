// Analyze the successful transaction from ORB frontend
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

async function analyzeFrontendTx() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const signature = '5FNSUXwmjYimFaWJQnUCgtpYL4h7czhyTxhwwMDLekybbzLH6KP3Ez4j9rt4mmwQMtGdSTSsi2PvE6d27ehmxHvo';

  console.log('Fetching transaction:', signature);
  console.log();

  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });

  if (!tx) {
    console.log('Transaction not found');
    return;
  }

  console.log('✅ Transaction found!');
  console.log();

  // Find the deploy instruction (to the ORB program)
  const programId = 'boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk';

  const instructions = tx.transaction.message.compiledInstructions;
  const accountKeys = tx.transaction.message.staticAccountKeys;

  console.log('Instructions:', instructions.length);
  console.log();

  for (let i = 0; i < instructions.length; i++) {
    const ix = instructions[i];
    const programKey = accountKeys[ix.programIdIndex].toBase58();

    if (programKey === programId) {
      console.log(`=== Instruction ${i}: ORB Deploy ===`);
      console.log();

      const data = Buffer.from(ix.data);
      console.log('Instruction Data:');
      console.log('  Length:', data.length, 'bytes');
      console.log('  Hex:', data.toString('hex'));
      console.log();

      console.log('Breakdown:');
      console.log('  Discriminator:', data.slice(0, 8).toString('hex'));

      if (data.length >= 16) {
        const amount = data.readBigUInt64LE(8);
        console.log('  Amount:', amount.toString(), 'lamports (', (Number(amount) / 1e9).toFixed(4), 'SOL )');
      }

      if (data.length >= 20) {
        const squares = data.readUInt32LE(16);
        console.log('  Squares mask:', squares, '(0x' + squares.toString(16) + ')');
      }

      if (data.length >= 24) {
        const unknown1 = data.readUInt32LE(20);
        console.log('  Unknown1:', unknown1);
      }

      if (data.length >= 28) {
        const squareCount = data.readUInt32LE(24);
        console.log('  Square count:', squareCount);
      }

      if (data.length > 28) {
        console.log('  Padding:', data.slice(28).toString('hex'));
      }

      console.log();
      console.log('Accounts:');
      ix.accountKeyIndexes.forEach((idx, j) => {
        const key = accountKeys[idx];
        console.log(`  ${j}: ${key.toBase58()}`);
      });

      console.log();
      console.log('=== Comparison with Our Bot Format ===');
      console.log('✓ Discriminator: 0040420f00000000');
      console.log('✓ Data length: 34 bytes');
      console.log('✓ Accounts: 5 total');
      console.log('  - Wallet (signer)');
      console.log('  - Automation PDA');
      console.log('  - Fee Collector');
      console.log('  - Miner PDA');
      console.log('  - System Program');
    } else {
      console.log(`Instruction ${i}: ${programKey.slice(0, 20)}...`);
    }
  }

  console.log();
  console.log('Transaction Status:', tx.meta.err ? '❌ FAILED' : '✅ SUCCESS');
  if (tx.meta.err) {
    console.log('Error:', JSON.stringify(tx.meta.err, null, 2));
  }
}

analyzeFrontendTx().catch(console.error);
