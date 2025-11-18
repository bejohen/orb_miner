// Check the automate transaction that succeeded
const { Connection } = require('@solana/web3.js');
require('dotenv').config();

async function checkAutomateTx() {
  const connection = new Connection(process.env.RPC_ENDPOINT);

  //The automate transaction we found earlier
  const signature = '2BQvbvwgiVmhcdDtqXHL2WKHsAtcvPNezVKDD66n3WaA5n1pb2npLyD8mzxo8u73kJ8LXCh6EaueX9mtPf18C7oV';

  console.log('Analyzing Automate Transaction:', signature);
  console.log();

  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });

  if (!tx) {
    console.log('❌ Transaction not found');
    return;
  }

  console.log('Status:', tx.meta.err ? '❌ FAILED' : '✅ SUCCESS');
  console.log('Time:', new Date(tx.blockTime * 1000).toLocaleString());
  console.log();

  const instructions = tx.transaction.message.compiledInstructions;
  const accountKeys = tx.transaction.message.staticAccountKeys;

  console.log('Total instructions:', instructions.length);
  console.log();

  for (let i = 0; i < instructions.length; i++) {
    const ix = instructions[i];
    const programKey = accountKeys[ix.programIdIndex];
    const ixData = Buffer.from(ix.data);

    console.log(`Instruction ${i}:`);
    console.log('  Program:', programKey.toBase58());
    console.log('  Data length:', ixData.length, 'bytes');
    console.log('  Data (hex):', ixData.toString('hex'));
    console.log('  Accounts:');
    ix.accountKeyIndexes.forEach((idx, j) => {
      const key = accountKeys[idx];
      console.log(`    ${j}: ${key.toBase58()}`);
    });
    console.log();
  }

  console.log('Transaction Logs:');
  if (tx.meta && tx.meta.logMessages) {
    tx.meta.logMessages.forEach(log => console.log(' ', log));
  }

  // Check if automation account was created
  console.log();
  console.log('Post-transaction balances:');
  if (tx.meta && tx.meta.postBalances) {
    tx.meta.postBalances.forEach((balance, i) => {
      if (i < accountKeys.length) {
        console.log(`  ${accountKeys[i].toBase58()}: ${balance / 1e9} SOL`);
      }
    });
  }

  // Check for account creations
  console.log();
  console.log('Account changes (pre -> post):');
  if (tx.meta) {
    tx.meta.preBalances.forEach((preBal, i) => {
      const postBal = tx.meta.postBalances[i];
      if (preBal !== postBal && i < accountKeys.length) {
        const change = (postBal - preBal) / 1e9;
        console.log(`  ${accountKeys[i].toBase58()}: ${change > 0 ? '+' : ''}${change.toFixed(9)} SOL`);

        if (preBal === 0 && postBal > 0) {
          console.log('    ^ This account was CREATED');
        }
      }
    });
  }
}

checkAutomateTx().catch(console.error);
