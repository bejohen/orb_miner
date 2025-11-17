// Analyze the successful claim transaction
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

async function analyzeClaimTx() {
  const connection = new Connection(process.env.RPC_ENDPOINT);

  // The successful claim transaction
  const signature = '2c7GBbNQ33fwNNtVa5zeYubTLCg3NvJG1er3MCd73o43HB4W8QoRpwLUrVYbooBASEesxqNRz4SDQqunCHt9aYMY';

  console.log('=== Analyzing Claim Transaction ===');
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

  let claimInstructionCount = 0;

  for (let i = 0; i < instructions.length; i++) {
    const ix = instructions[i];
    const programKey = accountKeys[ix.programIdIndex].toBase58();

    if (programKey === programId) {
      claimInstructionCount++;
      console.log(`=== Instruction ${i}: ORB Claim #${claimInstructionCount} ===`);
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

      if (data.length > 8) {
        console.log('  Additional data:', data.slice(8).toString('hex'));
      }

      console.log();
      console.log('Accounts (' + ix.accountKeyIndexes.length + ' total):');
      ix.accountKeyIndexes.forEach((idx, j) => {
        const key = accountKeys[idx];
        console.log(`  ${j}: ${key.toBase58()}`);
      });

      // Identify accounts
      console.log();
      console.log('Account Identification:');
      const wallet = '9DTThTbggnp2P2ZGLFRfN1A3j5JUsXez1dRJak3TixB2';
      const minerPDA = '6x7J6b2aYC4jyF6BxjsZpaFJGRy8ksDbyJCG926Awkii';
      const systemProgram = '11111111111111111111111111111111';
      const tokenProgram = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

      ix.accountKeyIndexes.forEach((idx, j) => {
        const key = accountKeys[idx].toBase58();
        let label = 'Unknown';
        if (key === wallet) label = 'Wallet';
        else if (key === minerPDA) label = 'Miner PDA';
        else if (key === systemProgram) label = 'System Program';
        else if (key === tokenProgram) label = 'Token Program';
        console.log(`  ${j}: ${label}`);
      });

      console.log();
    } else if (programKey === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
      console.log(`Instruction ${i}: Token Program (likely token transfer)`);
    } else {
      console.log(`Instruction ${i}: ${programKey.slice(0, 20)}...`);
    }
  }

  console.log();
  console.log('Transaction Status:', tx.meta.err ? '❌ FAILED' : '✅ SUCCESS');

  // Check logs for claim amounts
  console.log();
  console.log('Transaction Logs:');
  if (tx.meta && tx.meta.logMessages) {
    tx.meta.logMessages.forEach(log => {
      if (log.includes('Claiming') || log.includes('claim')) {
        console.log('  📝', log);
      }
    });
  }

  console.log();
  console.log('=== Summary ===');
  console.log('Found', claimInstructionCount, 'ORB claim instruction(s)');
  console.log();
  console.log('This will tell us the correct claim discriminators to use in the bot.');
}

analyzeClaimTx().catch(console.error);
