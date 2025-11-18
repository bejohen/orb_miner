// Check the current state of automation and miner accounts
const { Connection, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

async function checkStatus() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');

  const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY);
  const { Keypair } = require('@solana/web3.js');
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  console.log('=== Checking Account Status ===');
  console.log('Wallet:', wallet.publicKey.toBase58());
  console.log();

  // Check Automation PDA
  const [automationPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('automation'), wallet.publicKey.toBuffer()],
    programId
  );

  console.log('Automation PDA:', automationPDA.toBase58());
  const automationAccount = await connection.getAccountInfo(automationPDA);

  if (automationAccount) {
    console.log('✓ Automation account EXISTS');
    console.log('  Owner:', automationAccount.owner.toBase58());
    console.log('  Data length:', automationAccount.data.length, 'bytes');
    console.log('  Lamports:', automationAccount.lamports);
    console.log();
    console.log('📊 Account Data (hex):');
    console.log('  ', automationAccount.data.toString('hex'));
    console.log();
    console.log('🟢 AUTOMINER IS ACTIVE on ORB frontend');
    console.log('   This account was created when you clicked "Start Mining" on the ORB website.');
    console.log('   If you want to stop it, you need to click "Stop Mining" on the ORB website.');
  } else {
    console.log('✗ Automation account DOES NOT exist');
    console.log();
    console.log('🔴 AUTOMINER IS NOT ACTIVE');
    console.log('   You either:');
    console.log('   1. Never started the autominer on ORB frontend, OR');
    console.log('   2. Already stopped it on the ORB frontend');
  }

  console.log();
  console.log('=== Miner Account ===');

  // Check Miner PDA
  const [minerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('miner'), wallet.publicKey.toBuffer()],
    programId
  );

  console.log('Miner PDA:', minerPDA.toBase58());
  const minerAccount = await connection.getAccountInfo(minerPDA);

  if (minerAccount) {
    console.log('✓ Miner account exists');
    console.log('  Data length:', minerAccount.data.length, 'bytes');

    // Parse miner data
    const data = minerAccount.data;
    if (data.length >= 48) {
      // Read rewards (assuming u64 at specific offsets)
      const rewardsSol = data.readBigUInt64LE(16); // Offset might vary
      const rewardsOrb = data.readBigUInt64LE(24); // Offset might vary

      console.log('  Rewards SOL (estimated):', Number(rewardsSol) / 1e9, 'SOL');
      console.log('  Rewards ORB (estimated):', Number(rewardsOrb) / 1e9, 'ORB');
    }
  } else {
    console.log('✗ Miner account does not exist yet');
    console.log('   (This gets created on first manual or auto deployment)');
  }

  console.log();
  console.log('=== Recommendation ===');
  if (automationAccount) {
    console.log('⚠️  The ORB frontend autominer is RUNNING');
    console.log('   Go to https://ore.bot and click "Stop Mining" if you want to use only your bot');
    console.log('   Otherwise, your bot and the frontend will compete for deployments');
  } else {
    console.log('✅ No conflicts - ORB frontend autominer is not running');
    console.log('   Your bot can safely handle all mining operations');
  }
}

checkStatus().catch(console.error);
