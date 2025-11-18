// Verify that mining is active after deployment
const { Connection, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

async function verifyActiveMining() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');

  const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY);
  const { Keypair } = require('@solana/web3.js');
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  console.log('=== Verifying Active Mining Status ===');
  console.log('Wallet:', wallet.publicKey.toBase58());
  console.log();

  // Get Miner PDA
  const [minerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('miner'), wallet.publicKey.toBuffer()],
    programId
  );

  console.log('Miner PDA:', minerPDA.toBase58());
  console.log();

  // Fetch miner account
  const minerAccount = await connection.getAccountInfo(minerPDA);

  if (!minerAccount) {
    console.log('❌ Miner account does NOT exist');
    console.log('   You need to deploy first before mining can start');
    return;
  }

  console.log('✅ Miner account EXISTS');
  console.log('   Data length:', minerAccount.data.length, 'bytes');
  console.log('   Lamports:', minerAccount.lamports);
  console.log();

  // Parse miner data to find active deployments
  const data = minerAccount.data;

  // Expected structure (from ORB reverse engineering):
  // - Authority (32 bytes)
  // - Rewards SOL (8 bytes, u64)
  // - Rewards ORE (8 bytes, u64)
  // - Total deployments (8 bytes, u64)
  // - 25 squares deployment data

  if (data.length < 48) {
    console.log('⚠️  Miner data too short, cannot parse');
    return;
  }

  // Read authority
  const authority = new PublicKey(data.slice(0, 32));
  console.log('🔐 Authority:', authority.toBase58());

  // Read rewards (approximate offsets)
  let offset = 32;
  const rewardsSolRaw = data.readBigUInt64LE(offset);
  offset += 8;
  const rewardsOrbRaw = data.readBigUInt64LE(offset);
  offset += 8;

  const rewardsSol = Number(rewardsSolRaw) / 1e9;
  const rewardsOrb = Number(rewardsOrbRaw) / 1e9;

  console.log('💰 Rewards SOL:', rewardsSol.toFixed(9), 'SOL');
  console.log('💰 Rewards ORB:', rewardsOrb.toFixed(2), 'ORB');
  console.log();

  // Read total deployments
  if (data.length >= offset + 8) {
    const totalDeployments = data.readBigUInt64LE(offset);
    console.log('📊 Total Deployments:', totalDeployments.toString());
    offset += 8;
  }

  console.log();

  // Get current board/round info
  const [boardPDA] = PublicKey.findProgramAddressSync([Buffer.from('board')], programId);
  const boardAccount = await connection.getAccountInfo(boardPDA);

  if (boardAccount) {
    const boardData = boardAccount.data;
    // Round ID is typically at offset 8 (after discriminator)
    const currentRoundId = boardData.readBigUInt64LE(8);
    console.log('🎯 Current Round:', currentRoundId.toString());

    // Get round PDA for this round
    const roundIdBuf = Buffer.alloc(8);
    roundIdBuf.writeBigUInt64LE(currentRoundId);
    const [roundPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('round'), roundIdBuf],
      programId
    );

    console.log('   Round PDA:', roundPDA.toBase58());

    // Check if round account exists (means we have active deployments)
    const roundAccount = await connection.getAccountInfo(roundPDA);

    if (roundAccount) {
      console.log('   ✅ Round account EXISTS - deployments are ACTIVE');
      console.log('   Data length:', roundAccount.data.length, 'bytes');
    } else {
      console.log('   ❌ Round account does NOT exist - no active deployments yet');
    }
  }

  console.log();

  // Get recent transactions for this miner
  console.log('=== Recent Deployment Transactions ===');
  const signatures = await connection.getSignaturesForAddress(minerPDA, { limit: 5 });

  if (signatures.length === 0) {
    console.log('No transactions found for this miner');
  } else {
    console.log(`Found ${signatures.length} recent transactions:`);
    console.log();

    for (let i = 0; i < Math.min(3, signatures.length); i++) {
      const sig = signatures[i];
      console.log(`${i + 1}. ${sig.signature}`);
      console.log(`   Status: ${sig.err ? '❌ FAILED' : '✅ SUCCESS'}`);
      console.log(`   Time: ${new Date(sig.blockTime * 1000).toLocaleString()}`);

      // Fetch and analyze the transaction
      const tx = await connection.getTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (tx && tx.meta && tx.meta.logMessages) {
        // Look for deploy-related logs
        const deployLogs = tx.meta.logMessages.filter(log =>
          log.toLowerCase().includes('deploy') ||
          log.toLowerCase().includes('square') ||
          log.toLowerCase().includes('mining')
        );

        if (deployLogs.length > 0) {
          console.log('   Logs:');
          deployLogs.forEach(log => console.log(`     ${log}`));
        }
      }

      console.log();
    }
  }

  console.log();
  console.log('=== Summary ===');

  let isActive = false;
  let status = '';

  if (minerAccount && signatures.length > 0 && !signatures[0].err) {
    isActive = true;
    status = '✅ MINING IS ACTIVE';
  } else if (minerAccount && signatures.length > 0 && signatures[0].err) {
    status = '⚠️  Last deployment FAILED - check errors above';
  } else if (minerAccount) {
    status = '⚠️  Miner exists but no recent deployments';
  } else {
    status = '❌ NOT MINING - miner account does not exist';
  }

  console.log(status);
  console.log();

  if (isActive) {
    console.log('Your miner is actively participating in the current round!');
    console.log('Rewards will accumulate over time and can be claimed when thresholds are met.');
    console.log();
    console.log('✨ Everything is working correctly! ✨');
  } else {
    console.log('Mining is not active. Try running:');
    console.log('  npm start');
  }

  return isActive;
}

verifyActiveMining().catch(console.error);
