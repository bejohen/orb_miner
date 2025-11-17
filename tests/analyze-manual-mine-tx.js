// Analyze the "Manual Mine" transaction from ORB frontend
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

async function analyzeManualMineTx() {
  const connection = new Connection(process.env.RPC_ENDPOINT);

  // The successful manual mine transaction
  const signature = '4AbeygbWADD31RPWF5jQKEwpetcYzP6rDHxVbw6SpBs8zUeTSZYB4C6LiDXgUg6YasyEQPoic6q2CM9zyXi7mbDp';

  console.log('=== Analyzing "Manual Mine" Transaction ===');
  console.log('Signature:', signature);
  console.log();

  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });

  if (!tx) {
    console.log('Transaction not found');
    return;
  }

  const programId = 'boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk';
  const instructions = tx.transaction.message.compiledInstructions;
  const accountKeys = tx.transaction.message.staticAccountKeys;

  console.log('Total Instructions:', instructions.length);
  console.log();

  for (let i = 0; i < instructions.length; i++) {
    const ix = instructions[i];
    const programKey = accountKeys[ix.programIdIndex].toBase58();

    if (programKey === programId) {
      console.log(`=== Instruction ${i}: ORB Mine (Manual Mine One Block) ===`);
      console.log();

      const data = Buffer.from(ix.data);
      console.log('Instruction Data:');
      console.log('  Length:', data.length, 'bytes');
      console.log('  Hex:', data.toString('hex'));
      console.log();

      if (data.length >= 8) {
        console.log('Breakdown:');
        console.log('  Discriminator:', data.slice(0, 8).toString('hex'));
      }

      if (data.length >= 16) {
        const amount = data.readBigUInt64LE(8);
        console.log('  Amount:', amount.toString(), 'lamports (', (Number(amount) / 1e9).toFixed(6), 'SOL )');
      }

      if (data.length >= 20) {
        const squareOrIndex = data.readUInt32LE(16);
        console.log('  Square/Index:', squareOrIndex);
      }

      if (data.length > 20) {
        console.log('  Additional data:', data.slice(20).toString('hex'));
      }

      console.log();
      console.log('Accounts (' + ix.accountKeyIndexes.length + ' total):');
      ix.accountKeyIndexes.forEach((idx, j) => {
        const key = accountKeys[idx];
        console.log(`  ${j}: ${key.toBase58()}`);
      });

      console.log();
      console.log('Account Identification:');
      const wallet = '9DTThTbggnp2P2ZGLFRfN1A3j5JUsXez1dRJak3TixB2';
      const automationPDA = '6ZAGF8QjsrSuwtEr9Q8QLJCfs31gd8KRiu8a1zbdgGa3';
      const feeCollector = '577HqbrnKM4micsY52rW8j6i9W8SmzV3FprfBCDneNpF';
      const minerPDA = '6x7J6b2aYC4jyF6BxjsZpaFJGRy8ksDbyJCG926Awkii';
      const systemProgram = '11111111111111111111111111111111';

      ix.accountKeyIndexes.forEach((idx, j) => {
        const key = accountKeys[idx].toBase58();
        let label = 'Unknown';
        if (key === wallet) label = 'Wallet (signer)';
        else if (key === automationPDA) label = 'Automation PDA';
        else if (key === feeCollector) label = 'Fee Collector';
        else if (key === minerPDA) label = 'Miner PDA';
        else if (key === systemProgram) label = 'System Program';
        console.log(`  ${j}: ${label}`);
      });
    } else {
      console.log(`Instruction ${i}: ${programKey.slice(0, 20)}...`);
    }
  }

  console.log();
  console.log('Transaction Status:', tx.meta.err ? '❌ FAILED' : '✅ SUCCESS');
  console.log();

  console.log('=== Summary ===');
  console.log('This is the "Manual Mine" instruction');
  console.log('It mines a SINGLE specific block/square instead of all 25');
  console.log();
  console.log('Comparison with Deploy:');
  console.log('  Deploy: 0040420f00000000 - mines all 25 squares at once');
  console.log('  Manual Mine: <different discriminator> - mines 1 specific square');
}

analyzeManualMineTx().catch(console.error);
