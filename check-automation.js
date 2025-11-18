// Check if automation account exists
const { Connection, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

async function checkAutomation() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');

  const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY);
  const { Keypair } = require('@solana/web3.js');
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  const [automationPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('automation'), wallet.publicKey.toBuffer()],
    programId
  );

  console.log('Wallet:', wallet.publicKey.toBase58());
  console.log('Automation PDA:', automationPDA.toBase58());
  console.log();

  const account = await connection.getAccountInfo(automationPDA);

  if (account) {
    console.log('✓ Automation account EXISTS!');
    console.log('  Owner:', account.owner.toBase58());
    console.log('  Data length:', account.data.length, 'bytes');
    console.log('  Lamports:', account.lamports);
    console.log();
    console.log('Automation is already set up from the ORB frontend!');
    console.log('No need to call Automate instruction.');
  } else {
    console.log('✗ Automation account does NOT exist');
    console.log('Need to call Automate instruction to set it up.');
  }
}

checkAutomation().catch(console.error);
