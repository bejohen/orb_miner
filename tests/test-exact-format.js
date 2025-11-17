// Test with the EXACT format from the successful transaction
const { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

async function testExactFormat() {
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

  console.log('Automation PDA:', automationPDA.toBase58());
  console.log('Miner PDA:', minerPDA.toBase58());
  console.log();

  // Use EXACT 34-byte format from successful transaction:
  // Discriminator: 0040420f00000000 (8 bytes)
  // Amount: u64 (8 bytes)
  // Squares: u32 (4 bytes)
  // Unknown1: u32 = 0 (4 bytes)
  // Square_count: u32 = 25 (4 bytes)
  // Padding: 6 bytes = 0 (6 bytes)

  const amount = 0.01 * LAMPORTS_PER_SOL; // 10000000 lamports
  const squaresMask = 0x1FFFFFF; // All 25 squares

  const data = Buffer.alloc(34);

  // Discriminator
  Buffer.from([0x00, 0x40, 0x42, 0x0f, 0x00, 0x00, 0x00, 0x00]).copy(data, 0);

  // Amount (u64 LE)
  data.writeBigUInt64LE(BigInt(amount), 8);

  // Squares mask (u32 LE)
  data.writeUInt32LE(squaresMask, 16);

  // Unknown1 (u32 LE) - always 0?
  data.writeUInt32LE(0, 20);

  // Square count (u32 LE) - always 25?
  data.writeUInt32LE(25, 24);

  // Padding (6 bytes) - already zeroed by Buffer.alloc

  console.log('Instruction data (34 bytes):', data.toString('hex'));
  console.log('  Discriminator:', data.slice(0, 8).toString('hex'));
  console.log('  Amount:', amount, 'lamports');
  console.log('  Squares mask: 0x' + squaresMask.toString(16));
  console.log('  Unknown1:', data.readUInt32LE(20));
  console.log('  Square count:', data.readUInt32LE(24));
  console.log('  Padding:', data.slice(28).toString('hex'));
  console.log();

  // Use the SAME 5 accounts as successful transaction:
  // 0. Wallet (signer)
  // 1. Automation PDA
  // 2. Unknown account (577HqbrnKM4micsY52rW8j6i9W8SmzV3FprfBCDneNpF)
  // 3. Miner PDA
  // 4. System Program

  // For now, try without the unknown account to see what error we get
  const unknownAccount = new PublicKey('577HqbrnKM4micsY52rW8j6i9W8SmzV3FprfBCDneNpF');

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: automationPDA, isSigner: false, isWritable: true },
      { pubkey: unknownAccount, isSigner: false, isWritable: true },
      { pubkey: minerPDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: programId,
    data: data,
  });

  console.log('Accounts (5 total):');
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

testExactFormat().catch(console.error);
