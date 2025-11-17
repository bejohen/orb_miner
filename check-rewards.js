// Quick script to check current rewards
const { Connection, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

async function checkRewards() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');

  const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY);
  const { Keypair } = require('@solana/web3.js');
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  console.log('Wallet:', wallet.publicKey.toBase58());
  console.log();

  // Get Miner PDA
  const [minerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('miner'), wallet.publicKey.toBuffer()],
    programId
  );

  console.log('Miner PDA:', minerPDA.toBase58());
  console.log();

  const minerData = await connection.getAccountInfo(minerPDA);
  if (!minerData) {
    console.log('❌ Miner account not found');
    return;
  }

  console.log('✅ Miner account found');
  console.log('Data length:', minerData.data.length, 'bytes');
  console.log();

  // Try to deserialize rewards
  // Based on ORE Miner struct, rewards are typically at specific offsets
  console.log('Attempting to read rewards...');
  console.log('Raw data (hex):', minerData.data.toString('hex'));
  console.log();

  // Try reading at different offsets
  console.log('Checking various offsets for reward data:');

  // SOL rewards might be at offset 16-24
  if (minerData.data.length >= 24) {
    const solRewards = minerData.data.readBigUInt64LE(16);
    console.log('  Offset 16 (possible SOL rewards):', solRewards.toString(), 'lamports (', (Number(solRewards) / 1e9).toFixed(6), 'SOL )');
  }

  // ORB rewards might be at offset 24-32
  if (minerData.data.length >= 32) {
    const orbRewards = minerData.data.readBigUInt64LE(24);
    console.log('  Offset 24 (possible ORB rewards):', orbRewards.toString(), 'tokens (', (Number(orbRewards) / 1e9).toFixed(6), 'ORB )');
  }

  // Try other common offsets
  if (minerData.data.length >= 40) {
    const value1 = minerData.data.readBigUInt64LE(32);
    console.log('  Offset 32:', value1.toString());
  }

  if (minerData.data.length >= 48) {
    const value2 = minerData.data.readBigUInt64LE(40);
    console.log('  Offset 40:', value2.toString());
  }

  console.log();
  console.log('To properly decode rewards, we need to know the exact Miner struct layout.');
  console.log('Let me analyze a successful claim transaction to understand the format.');
}

checkRewards().catch(console.error);
