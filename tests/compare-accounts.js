// Compare expected accounts with actual transaction
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
require('dotenv').config();

async function compareAccounts() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');

  const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY);
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  console.log('Expected accounts:');
  console.log('================');

  // Get board
  const [boardPDA] = PublicKey.findProgramAddressSync([Buffer.from('board')], programId);
  console.log('0. Signer (wallet):', wallet.publicKey.toBase58());
  console.log('1. Authority (wallet):', wallet.publicKey.toBase58());

  // Get automation
  const [automationPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('automation'), wallet.publicKey.toBuffer()],
    programId
  );
  console.log('2. Automation PDA:', automationPDA.toBase58());

  console.log('3. Board PDA:', boardPDA.toBase58());

  // Get miner
  const [minerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('miner'), wallet.publicKey.toBuffer()],
    programId
  );
  console.log('4. Miner PDA:', minerPDA.toBase58());

  // Get round
  const boardData = await connection.getAccountInfo(boardPDA);
  const roundId = boardData.data.readBigUInt64LE(8);
  const roundIdBuf = Buffer.alloc(8);
  roundIdBuf.writeBigUInt64LE(roundId);
  const [roundPDA] = PublicKey.findProgramAddressSync([Buffer.from('round'), roundIdBuf], programId);
  console.log('5. Round PDA (round', roundId.toString() + '):', roundPDA.toBase58());

  console.log('6. System Program:', '11111111111111111111111111111111');

  // VAR account
  console.log('7. VAR:', 'BWCaDY96Xe4WkFq1M7UiCCRcChsJ3p51L5KrGzhxgm2E');

  // Check if account 577HqbrnKM4micsY52rW8j6i9W8SmzV3FprfBCDneNpF is the VAR
  const varAddress = new PublicKey('BWCaDY96Xe4WkFq1M7UiCCRcChsJ3p51L5KrGzhxgm2E');
  const unknownAddress = new PublicKey('577HqbrnKM4micsY52rW8j6i9W8SmzV3FprfBCDneNpF');

  console.log();
  console.log('Actual transaction accounts:');
  console.log('===========================');
  console.log('0. Wallet:', wallet.publicKey.toBase58());
  console.log('1. Automation PDA:', automationPDA.toBase58());
  console.log('2. Unknown:', unknownAddress.toBase58(), unknownAddress.equals(varAddress) ? '(IS VAR!)' : '(not VAR)');
  console.log('3. Miner PDA:', minerPDA.toBase58());
  console.log('4. System Program:', '11111111111111111111111111111111');

  console.log();
  console.log('Missing from transaction:');
  console.log('- Board PDA:', boardPDA.toBase58());
  console.log('- Round PDA:', roundPDA.toBase58());
}

compareAccounts().catch(console.error);
