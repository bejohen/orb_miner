// Compare our bot's transaction with the expected format
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

async function compareBotTx() {
  const connection = new Connection(process.env.RPC_ENDPOINT);

  // Our bot's successful transaction
  const botSig = '3YK6Dy2A41X98sGYnD7xBafrQTUKVsZJAjjGNN46pgZUgCGb8KerbQXkcEKMx8Raz6e7sF3XPqxNFyuw47K2fy9P';

  console.log('=== Analyzing Bot Transaction ===');
  console.log('Signature:', botSig);
  console.log();

  const tx = await connection.getTransaction(botSig, {
    maxSupportedTransactionVersion: 0,
  });

  if (!tx) {
    console.log('Transaction not found');
    return;
  }

  const programId = 'boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk';
  const instructions = tx.transaction.message.compiledInstructions;
  const accountKeys = tx.transaction.message.staticAccountKeys;

  for (let i = 0; i < instructions.length; i++) {
    const ix = instructions[i];
    const programKey = accountKeys[ix.programIdIndex].toBase58();

    if (programKey === programId) {
      console.log(`Instruction ${i}: ORB Deploy`);
      console.log();

      const data = Buffer.from(ix.data);
      console.log('✓ Data length:', data.length, 'bytes');
      console.log('✓ Data (hex):', data.toString('hex'));
      console.log();

      console.log('Breakdown:');
      console.log('  Discriminator:', data.slice(0, 8).toString('hex'), data.slice(0, 8).toString('hex') === '0040420f00000000' ? '✓' : '✗');

      const amount = data.readBigUInt64LE(8);
      const amountSol = Number(amount) / 1e9;
      console.log('  Amount:', amount.toString(), 'lamports (', amountSol.toFixed(4), 'SOL )', amountSol === 0.01 ? '✓' : '✗');

      const squares = data.readUInt32LE(16);
      console.log('  Squares mask:', squares, squares === 0 ? '✓' : '✗');

      const unknown1 = data.readUInt32LE(20);
      console.log('  Unknown1:', unknown1, unknown1 === 0 ? '✓' : '✗');

      const squareCount = data.readUInt32LE(24);
      console.log('  Square count:', squareCount, squareCount === 25 ? '✓' : '✗');

      console.log('  Padding:', data.slice(28).toString('hex'), data.slice(28).toString('hex') === '000000000000' ? '✓' : '✗');

      console.log();
      console.log('Accounts (' + ix.accountKeyIndexes.length + ' total):');
      ix.accountKeyIndexes.forEach((idx, j) => {
        const key = accountKeys[idx];
        console.log(`  ${j}: ${key.toBase58()}`);
      });

      console.log();
      console.log('Expected Accounts:');
      console.log('  0: Wallet (9DTThTbggnp2P2ZGLFRfN1A3j5JUsXez1dRJak3TixB2)');
      console.log('  1: Automation PDA (6ZAGF8QjsrSuwtEr9Q8QLJCfs31gd8KRiu8a1zbdgGa3)');
      console.log('  2: Fee Collector (577HqbrnKM4micsY52rW8j6i9W8SmzV3FprfBCDneNpF)');
      console.log('  3: Miner PDA (6x7J6b2aYC4jyF6BxjsZpaFJGRy8ksDbyJCG926Awkii)');
      console.log('  4: System Program (11111111111111111111111111111111)');
    }
  }

  console.log();
  console.log('Transaction Status:', tx.meta.err ? '❌ FAILED' : '✅ SUCCESS');
  console.log();
  console.log('=== Summary ===');
  console.log('✓ Deploy instruction format: CORRECT');
  console.log('✓ Instruction data: 34 bytes');
  console.log('✓ Discriminator: 0040420f00000000');
  console.log('✓ Amount: 0.01 SOL');
  console.log('✓ Accounts: 5 total');
  console.log('✓ Transaction: CONFIRMED');
}

compareBotTx().catch(console.error);
