// Test the automate instruction
const { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

async function testAutomate() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');

  const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY);
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  console.log('Wallet:', wallet.publicKey.toBase58());
  console.log();

  // Get PDAs
  const [minerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('miner'), wallet.publicKey.toBuffer()],
    programId
  );
  const [automationPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('automation'), wallet.publicKey.toBuffer()],
    programId
  );

  console.log('Miner PDA:', minerPDA.toBase58());
  console.log('Automation PDA:', automationPDA.toBase58());
  console.log();

  // Check if automation account exists
  const automationAccount = await connection.getAccountInfo(automationPDA);
  if (automationAccount) {
    console.log('✓ Automation account already exists!');
    console.log('  Data length:', automationAccount.data.length, 'bytes');
    console.log('  Owner:', automationAccount.owner.toBase58());
    console.log();
    console.log('Automation is already set up. No need to call Automate instruction.');
    return;
  }

  console.log('✗ Automation account does not exist. Setting it up...');
  console.log();

  // Build Automate instruction (34 bytes of zeros)
  const data = Buffer.alloc(34);

  console.log('Instruction data:', data.toString('hex'));
  console.log();

  // 5 accounts based on successful transaction
  const ix = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: automationPDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: minerPDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: programId,
    data: data,
  });

  console.log('Accounts:');
  ix.keys.forEach((key, i) => {
    console.log(`  ${i}: ${key.pubkey.toBase58()} (${key.isSigner ? 'signer' : 'nosign'}, ${key.isWritable ? 'write' : 'read'})`);
  });
  console.log();

  const tx = new Transaction().add(ix);
  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  console.log('Simulating...\\n');

  const simulation = await connection.simulateTransaction(tx, [wallet]);

  if (simulation.value.err) {
    console.log('❌ Failed:', JSON.stringify(simulation.value.err, null, 2));
  } else {
    console.log('✅ SUCCESS!');
  }

  console.log('\\nLogs:');
  if (simulation.value.logs) {
    simulation.value.logs.forEach(log => console.log('  ', log));
  }
}

testAutomate().catch(console.error);
