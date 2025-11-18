// Find when the automation account was created and closed
const { Connection, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

async function findAutomationHistory() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');

  const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY);
  const { Keypair } = require('@solana/web3.js');
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  const [automationPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('automation'), wallet.publicKey.toBuffer()],
    programId
  );

  console.log('=== Automation Account History ===');
  console.log('Automation PDA:', automationPDA.toBase58());
  console.log();

  // Get all transactions for this account
  console.log('Fetching transaction history...');
  const signatures = await connection.getSignaturesForAddress(automationPDA, { limit: 20 });

  console.log(`Found ${signatures.length} transactions\n`);

  for (let i = 0; i < signatures.length; i++) {
    const sig = signatures[i];
    const time = new Date(sig.blockTime * 1000).toLocaleString();
    const status = sig.err ? '❌ FAILED' : '✅ SUCCESS';

    console.log(`${i + 1}. ${status} - ${time}`);
    console.log(`   Signature: ${sig.signature}`);

    // Fetch full transaction
    const tx = await connection.getTransaction(sig.signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (tx) {
      const accountKeys = tx.transaction.message.staticAccountKeys;
      const automationIndex = accountKeys.findIndex(k => k.toBase58() === automationPDA.toBase58());

      if (automationIndex >= 0 && tx.meta) {
        const preBal = tx.meta.preBalances[automationIndex];
        const postBal = tx.meta.postBalances[automationIndex];

        if (preBal === 0 && postBal > 0) {
          console.log(`   🟢 CREATED automation account (balance: ${postBal / 1e9} SOL)`);
        } else if (preBal > 0 && postBal === 0) {
          console.log(`   🔴 CLOSED automation account (returned ${preBal / 1e9} SOL to wallet)`);
        } else if (preBal !== postBal) {
          console.log(`   💰 Balance changed: ${preBal / 1e9} -> ${postBal / 1e9} SOL`);
        }

        // Check instruction data
        const instructions = tx.transaction.message.compiledInstructions;
        for (const ix of instructions) {
          const programKey = accountKeys[ix.programIdIndex];
          if (programKey.toBase58() === programId.toBase58()) {
            const ixData = Buffer.from(ix.data);
            if (ixData.length === 34 && ixData.every(b => b === 0)) {
              if (preBal === 0 && postBal > 0) {
                console.log(`   📝 Called: Automate (START mining)`);
              } else if (preBal > 0 && postBal === 0) {
                console.log(`   📝 Called: Automate (STOP mining)`);
              }
            } else if (ixData.slice(0, 8).toString('hex') === '0040420f00000000') {
              console.log(`   📝 Called: Deploy (auto-deploy format)`);
            }
          }
        }
      }
    }

    console.log();
  }

  console.log('=== Summary ===');
  console.log('The automation account lifecycle:');
  console.log('1. Created when you click "Start Mining" on ORB frontend');
  console.log('2. Closed when you click "Stop Mining" or call Automate again');
  console.log('3. While it exists, deploys actually mine blocks');
  console.log('4. When it doesn\'t exist, deploys succeed but don\'t mine');
}

findAutomationHistory().catch(console.error);
