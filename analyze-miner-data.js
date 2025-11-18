// Deep analysis of miner account data structure
const { Connection, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

async function analyzeMinerData() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');

  const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY);
  const { Keypair } = require('@solana/web3.js');
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  console.log('=== Deep Miner Account Analysis ===');
  console.log('Wallet:', wallet.publicKey.toBase58());
  console.log();

  // Get Miner PDA
  const [minerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('miner'), wallet.publicKey.toBuffer()],
    programId
  );

  console.log('Miner PDA:', minerPDA.toBase58());

  const minerAccount = await connection.getAccountInfo(minerPDA);

  if (!minerAccount) {
    console.log('❌ Miner account does NOT exist');
    return;
  }

  console.log('Account exists, data length:', minerAccount.data.length, 'bytes');
  console.log();

  const data = minerAccount.data;

  // Show raw hex data
  console.log('=== Raw Account Data (first 200 bytes) ===');
  console.log(data.slice(0, 200).toString('hex'));
  console.log();

  // Try to parse structure
  console.log('=== Parsing Miner Structure ===');

  let offset = 0;

  // Discriminator (8 bytes)
  if (data.length >= 8) {
    const discriminator = data.slice(0, 8);
    console.log('Discriminator:', discriminator.toString('hex'));
    offset = 8;
  }

  // Authority (32 bytes)
  if (data.length >= offset + 32) {
    const authority = new PublicKey(data.slice(offset, offset + 32));
    console.log('Authority:', authority.toBase58());
    offset += 32;
  }

  // Now let's check for the 25 squares structure
  // Each square might have: amount deployed, active flag, etc.
  console.log();
  console.log('=== Looking for Active Deployments in 25 Squares ===');

  // The miner data is 536 bytes
  // After discriminator (8) + authority (32) = 40 bytes used
  // Remaining: 496 bytes for other data
  // If there are 25 squares, that could be 496/25 = ~19.84 bytes per square

  // Let's look for non-zero deployment amounts
  let foundActiveDeployments = false;

  // Skip ahead and look for deployment data
  // Based on ORE/ORB structure, squares might start after some metadata
  // Let's scan for patterns

  console.log('Scanning for non-zero deployment amounts...');
  console.log();

  // Try reading 25 u64 values (8 bytes each) starting from different offsets
  const possibleOffsets = [40, 48, 56, 64, 72, 80];

  for (const startOffset of possibleOffsets) {
    console.log(`Trying offset ${startOffset}:`);
    let hasNonZero = false;

    if (data.length >= startOffset + (25 * 8)) {
      for (let i = 0; i < 25; i++) {
        const squareOffset = startOffset + (i * 8);
        const amount = data.readBigUInt64LE(squareOffset);

        if (amount > 0n) {
          console.log(`  Square ${i}: ${amount} lamports (${Number(amount) / 1e9} SOL)`);
          hasNonZero = true;
        }
      }

      if (!hasNonZero) {
        console.log('  All zeros - not the right offset');
      } else {
        foundActiveDeployments = true;
        break;
      }
    }
    console.log();
  }

  if (!foundActiveDeployments) {
    console.log('⚠️  NO ACTIVE DEPLOYMENTS FOUND in miner data');
    console.log('    All 25 squares appear to have zero deployed amounts');
  }

  // Now let's fetch the most recent transaction and see what it actually did
  console.log();
  console.log('=== Analyzing Most Recent Transaction ===');

  const signatures = await connection.getSignaturesForAddress(minerPDA, { limit: 1 });

  if (signatures.length > 0) {
    const sig = signatures[0];
    console.log('Signature:', sig.signature);
    console.log('Status:', sig.err ? '❌ FAILED' : '✅ SUCCESS');
    console.log();

    const tx = await connection.getTransaction(sig.signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (tx) {
      console.log('Transaction Logs:');
      if (tx.meta && tx.meta.logMessages) {
        tx.meta.logMessages.forEach((log, i) => {
          console.log(`  ${i}: ${log}`);
        });
      }

      console.log();
      console.log('Instructions in transaction:', tx.transaction.message.compiledInstructions.length);

      // Check if this was a deploy instruction
      const instructions = tx.transaction.message.compiledInstructions;
      const accountKeys = tx.transaction.message.staticAccountKeys;

      for (let i = 0; i < instructions.length; i++) {
        const ix = instructions[i];
        const programKey = accountKeys[ix.programIdIndex].toBase58();

        if (programKey === programId.toBase58()) {
          console.log();
          console.log(`ORB Instruction ${i}:`);
          const ixData = Buffer.from(ix.data);
          console.log('  Data length:', ixData.length, 'bytes');
          console.log('  Data (hex):', ixData.toString('hex'));

          if (ixData.length >= 8) {
            const discriminator = ixData.slice(0, 8);
            console.log('  Discriminator:', discriminator.toString('hex'));

            // Check if it's a deploy
            if (discriminator.toString('hex') === '0040420f00000000') {
              console.log('  ✅ This is a DEPLOY instruction');

              const amount = ixData.readBigUInt64LE(8);
              console.log('  Amount deployed:', Number(amount) / 1e9, 'SOL');

              const squaresMask = ixData.readUInt32LE(16);
              console.log('  Squares mask:', squaresMask);

              const squareCount = ixData.readUInt32LE(24);
              console.log('  Square count:', squareCount);
            }
          }

          console.log('  Accounts:');
          ix.accountKeyIndexes.forEach((idx, j) => {
            const key = accountKeys[idx];
            console.log(`    ${j}: ${key.toBase58()}`);
          });
        }
      }
    }
  }

  console.log();
  console.log('=== CONCLUSION ===');

  if (foundActiveDeployments) {
    console.log('✅ Found active deployments in miner account');
  } else {
    console.log('❌ NO active deployments found in miner account');
    console.log('   This means the deployments might have ended or were never started');
    console.log('   The transactions succeeded but the squares are empty');
  }
}

analyzeMinerData().catch(console.error);
