// Check the owner of the miner account
const { Connection, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

async function checkMinerOwner() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');

  const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY);
  const { Keypair } = require('@solana/web3.js');
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  const [minerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('miner'), wallet.publicKey.toBuffer()],
    programId
  );

  console.log('Checking Miner Account Owner');
  console.log('Miner PDA:', minerPDA.toBase58());
  console.log('Expected owner (ORB Program):', programId.toBase58());
  console.log();

  const minerAccount = await connection.getAccountInfo(minerPDA);

  if (!minerAccount) {
    console.log('❌ Miner account does not exist');
    return;
  }

  console.log('✓ Miner account exists');
  console.log('Actual owner:', minerAccount.owner.toBase58());
  console.log();

  if (minerAccount.owner.toBase58() === programId.toBase58()) {
    console.log('✅ Owner is CORRECT (ORB Program owns it)');
  } else {
    console.log('❌ Owner is WRONG!');
    console.log('   Expected:', programId.toBase58());
    console.log('   Got:', minerAccount.owner.toBase58());
    console.log();

    // Check if it's owned by System Program
    if (minerAccount.owner.toBase58() === '11111111111111111111111111111111') {
      console.log('   Account is owned by System Program!');
      console.log('   This means the miner was never properly initialized by ORB program.');
    }
  }
}

checkMinerOwner().catch(console.error);
