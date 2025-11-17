// Test with squares = 0 like the successful transaction
const { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

async function testSquaresZero() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');

  const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY);
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  console.log('Wallet:', wallet.publicKey.toBase58());
  const balance = await connection.getBalance(wallet.publicKey);
  console.log('Balance:', balance / LAMPORTS_PER_SOL, 'SOL');
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

  const amount = 0.01 * LAMPORTS_PER_SOL;
  const squaresMask = 0; // Set to 0 like successful transaction

  const data = Buffer.alloc(34);

  // Discriminator
  Buffer.from([0x00, 0x40, 0x42, 0x0f, 0x00, 0x00, 0x00, 0x00]).copy(data, 0);

  // Amount (u64 LE)
  data.writeBigUInt64LE(BigInt(amount), 8);

  // Squares mask (u32 LE) - SET TO ZERO
  data.writeUInt32LE(squaresMask, 16);

  // Unknown1 (u32 LE)
  data.writeUInt32LE(0, 20);

  // Square count (u32 LE)
  data.writeUInt32LE(25, 24);

  console.log('Instruction data (34 bytes):', data.toString('hex'));
  console.log('  Amount:', amount, 'lamports (', amount / LAMPORTS_PER_SOL, 'SOL )');
  console.log('  Squares mask:', squaresMask);
  console.log();

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

  const tx = new Transaction().add(ix);
  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  console.log('Simulating with squares = 0...\\n');

  const simulation = await connection.simulateTransaction(tx, [wallet]);

  if (simulation.value.err) {
    console.log('❌ Failed:', JSON.stringify(simulation.value.err, null, 2));
  } else {
    console.log('✅ SUCCESS!');
    console.log('\\n🎉 The instruction format is correct!');
    console.log('\\nNow we need to understand:');
    console.log('1. What account 577HqbrnKM4micsY52rW8j6i9W8SmzV3FprfBCDneNpF is (fee collector?)');
    console.log('2. What the squares mask actually means (0 = all squares?)');
    console.log('3. How to update our bot with the correct format');
  }

  console.log('\\nLogs:');
  if (simulation.value.logs) {
    simulation.value.logs.forEach(log => console.log('  ', log));
  }
}

testSquaresZero().catch(console.error);
