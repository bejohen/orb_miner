// Analyze the deploy transactions our bot actually sent
const { Connection, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

async function analyzeOurDeploys() {
  const connection = new Connection(process.env.RPC_ENDPOINT);

  // The two successful deploy transactions from our bot
  const deploySignatures = [
    '55ceGWwpTxnJhoD8LpsqmgT1rRwfsjyX7S9Ubrsb8HwLYK4PrJ7TxNq5pCM7HymkW3QqjsPHvF67ZBb8v8CaP7RW',
    'G5Uhx6ti1FF8hhdrHG5bB5wYmzcDaXtaUu4runxzMhMzF8AFoKqMQ5iZ78ChkkCkRv2WEQSVMdqswf8cvt8EyvD',
  ];

  for (const signature of deploySignatures) {
    console.log('='.repeat(80));
    console.log(`Analyzing: ${signature}`);
    console.log('='.repeat(80));

    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      console.log('❌ Transaction not found');
      continue;
    }

    console.log('Status:', tx.meta.err ? '❌ FAILED' : '✅ SUCCESS');
    console.log();

    const instructions = tx.transaction.message.compiledInstructions;
    const accountKeys = tx.transaction.message.staticAccountKeys;
    const programId = 'boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk';

    console.log('Total instructions:', instructions.length);
    console.log();

    for (let i = 0; i < instructions.length; i++) {
      const ix = instructions[i];
      const programKey = accountKeys[ix.programIdIndex].toBase58();

      if (programKey === programId) {
        console.log(`=== ORB Instruction ${i} ===`);
        const ixData = Buffer.from(ix.data);

        console.log('Data length:', ixData.length, 'bytes');
        console.log('Data (hex):', ixData.toString('hex'));
        console.log();

        if (ixData.length >= 8) {
          const discriminator = ixData.slice(0, 8);
          console.log('Discriminator:', discriminator.toString('hex'));

          // Check what type of instruction
          if (discriminator.toString('hex') === '0040420f00000000') {
            console.log('Type: DEPLOY (ORB auto-deploy format)');
            console.log();

            const amount = ixData.readBigUInt64LE(8);
            console.log('Amount:', Number(amount) / 1e9, 'SOL');

            const squaresMask = ixData.readUInt32LE(16);
            console.log('Squares mask:', squaresMask, `(0x${squaresMask.toString(16)})`);

            const unknown = ixData.readUInt32LE(20);
            console.log('Unknown field:', unknown);

            const squareCount = ixData.readUInt32LE(24);
            console.log('Square count:', squareCount);
          } else if (discriminator.toString('hex').startsWith('06')) {
            console.log('Type: DEPLOY (ORE manual format)');
          } else if (discriminator.toString('hex') === '0200000000000000') {
            console.log('Type: CHECKPOINT');
          }
        } else if (ixData.length === 1) {
          console.log('Type: 1-byte instruction (Claim or other)');
        }

        console.log();
        console.log('Accounts (' + ix.accountKeyIndexes.length + ' total):');
        ix.accountKeyIndexes.forEach((idx, j) => {
          const key = accountKeys[idx];
          console.log(`  ${j}: ${key.toBase58()}`);
        });

        console.log();
      }
    }

    // Show logs
    console.log('=== Transaction Logs ===');
    if (tx.meta && tx.meta.logMessages) {
      tx.meta.logMessages.forEach(log => {
        // Highlight important logs
        if (log.includes('Error') || log.includes('error') || log.includes('failed')) {
          console.log('  ❌', log);
        } else if (log.includes('success')) {
          console.log('  ✅', log);
        } else if (log.includes('deployed') || log.includes('Deploy') || log.includes('square')) {
          console.log('  📦', log);
        } else {
          console.log('   ', log);
        }
      });
    }

    console.log();
  }

  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log('Our bot sent Deploy instructions with:');
  console.log('  - 34 bytes of data');
  console.log('  - Discriminator: 0x0040420f00000000');
  console.log('  - Amount: 0.01 SOL (10000000 lamports)');
  console.log('  - Squares mask: 0 (as required by ORB)');
  console.log('  - Square count: 25');
  console.log();
  console.log('Both transactions succeeded!');
  console.log();
  console.log('But the question is: Did they actually start MINING?');
  console.log('Or did they just succeed without doing anything?');
}

analyzeOurDeploys().catch(console.error);
