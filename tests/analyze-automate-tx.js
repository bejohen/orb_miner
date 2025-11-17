// Analyze the "Setup Auto Mine" transaction from ORB frontend
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

async function analyzeAutomateTx() {
  const connection = new Connection(process.env.RPC_ENDPOINT);

  // The "Setup Auto Mine" success transaction
  const signature = '5FNSUXwmjYimFaWJQnUCgtpYL4h7czhyTxhwwMDLekybbzLH6KP3Ez4j9rt4mmwQMtGdSTSsi2PvE6d27ehmxHvo';

  console.log('=== Analyzing "Setup Auto Mine" Transaction ===');
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
      console.log(`=== Instruction ${i}: ORB Automate (Setup Auto Mining) ===`);
      console.log();

      const data = Buffer.from(ix.data);
      console.log('Instruction Data:');
      console.log('  Length:', data.length, 'bytes');
      console.log('  Hex:', data.toString('hex'));
      console.log();

      // Check if it's all zeros (Automate discriminator = 0 from ORE enum)
      const isAllZeros = data.every(byte => byte === 0);
      console.log('  All zeros?', isAllZeros ? 'YES (Automate instruction)' : 'NO');
      console.log();

      console.log('Accounts (' + ix.accountKeyIndexes.length + ' total):');
      ix.accountKeyIndexes.forEach((idx, j) => {
        const key = accountKeys[idx];
        console.log(`  ${j}: ${key.toBase58()}`);
      });

      // Identify accounts
      console.log();
      console.log('Account Identification:');
      console.log('  0: Wallet/Signer (9DTThTbggnp2P2ZGLFRfN1A3j5JUsXez1dRJak3TixB2)');
      console.log('  1: Automation PDA (6ZAGF8QjsrSuwtEr9Q8QLJCfs31gd8KRiu8a1zbdgGa3)');
      console.log('  2: System Program (11111111111111111111111111111111)');
      console.log('  3: Miner PDA (6x7J6b2aYC4jyF6BxjsZpaFJGRy8ksDbyJCG926Awkii)');
      console.log('  4: System Program (11111111111111111111111111111111)');
    } else {
      console.log(`Instruction ${i}: ${programKey.slice(0, 20)}... (${programKey === 'L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95' ? 'Memo' : 'Other'})`);
    }
  }

  console.log();
  console.log('Transaction Status:', tx.meta.err ? '❌ FAILED' : '✅ SUCCESS');
  console.log();

  console.log('=== Summary ===');
  console.log('This is the "Automate" instruction (discriminator = 0)');
  console.log('It sets up automated mining for the wallet');
  console.log('Format:');
  console.log('  - 34 bytes of zeros');
  console.log('  - 5 accounts: wallet, automation PDA, system program, miner PDA, system program');
  console.log();
  console.log('This is DIFFERENT from the Deploy instruction which:');
  console.log('  - Has discriminator 0040420f00000000');
  console.log('  - Includes amount, squares mask, etc.');
  console.log('  - Actually deploys SOL to the game board');
}

analyzeAutomateTx().catch(console.error);
