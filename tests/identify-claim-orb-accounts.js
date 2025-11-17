// Identify the accounts in Claim ORB instruction
const { Connection, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress } = require('@solana/spl-token');
const bs58 = require('bs58');
require('dotenv').config();

async function identifyClaimOrbAccounts() {
  const connection = new Connection(process.env.RPC_ENDPOINT);
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');
  const orbTokenMint = new PublicKey(process.env.ORB_TOKEN_MINT);

  const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY);
  const { Keypair } = require('@solana/web3.js');
  const wallet = Keypair.fromSecretKey(privateKeyBytes);

  console.log('=== Identifying Claim ORB Accounts ===');
  console.log();

  // Accounts from the transaction
  console.log('Accounts from successful claim ORB transaction:');
  console.log('  0: 9DTThTbggnp2P2ZGLFRfN1A3j5JUsXez1dRJak3TixB2 (wallet)');
  console.log('  1: 6x7J6b2aYC4jyF6BxjsZpaFJGRy8ksDbyJCG926Awkii (miner PDA)');
  console.log('  2: orebyr4mDiPDVgnfqvF5xiu5gKnh94Szuz8dqgNqdJn');
  console.log('  3: 6uTiXBpUZsE1JUo2hnkPNG3PycMheUQKaW3FZogZMLL1');
  console.log('  4: 6aAGoVq9jKywWXyvWwoUtZFxbjR5aLBtfjhQXP1xezA');
  console.log('  5: 7c91ihC27njwfyupmatmYfjiVNmsZC6DBJVj9fRSV9QM');
  console.log('  6: 11111111111111111111111111111111 (system program)');
  console.log('  7: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA (token program)');
  console.log('  8: ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL (associated token program)');
  console.log();

  // Check if account 2 is the ORB token mint
  console.log('Checking ORB Token Mint:', orbTokenMint.toBase58());
  if (orbTokenMint.toBase58() === 'orebyr4mDiPDVgnfqvF5xiu5gKnh94Szuz8dqgNqdJn') {
    console.log('  ✓ Account 2 is ORB Token Mint');
  }
  console.log();

  // Get wallet's ORB token account
  const walletOrbAta = await getAssociatedTokenAddress(orbTokenMint, wallet.publicKey);
  console.log('Wallet ORB ATA:', walletOrbAta.toBase58());
  if (walletOrbAta.toBase58() === '6uTiXBpUZsE1JUo2hnkPNG3PycMheUQKaW3FZogZMLL1') {
    console.log('  ✓ Account 3 is wallet ORB token account');
  }
  console.log();

  // Get miner's ORB token account
  const [minerPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('miner'), wallet.publicKey.toBuffer()],
    programId
  );
  const minerOrbAta = await getAssociatedTokenAddress(orbTokenMint, minerPDA, true);
  console.log('Miner ORB ATA:', minerOrbAta.toBase58());
  if (minerOrbAta.toBase58() === '6aAGoVq9jKywWXyvWwoUtZFxbjR5aLBtfjhQXP1xezA') {
    console.log('  ✓ Account 4 is miner ORB token account');
  }
  console.log();

  // Check account 5 - might be treasury token account
  const [treasuryPDA] = PublicKey.findProgramAddressSync([Buffer.from('treasury')], programId);
  const treasuryOrbAta = await getAssociatedTokenAddress(orbTokenMint, treasuryPDA, true);
  console.log('Treasury PDA:', treasuryPDA.toBase58());
  console.log('Treasury ORB ATA:', treasuryOrbAta.toBase58());
  if (treasuryOrbAta.toBase58() === '7c91ihC27njwfyupmatmYfjiVNmsZC6DBJVj9fRSV9QM') {
    console.log('  ✓ Account 5 is treasury ORB token account');
  }
  console.log();

  console.log('=== Summary ===');
  console.log('Claim ORB instruction requires 9 accounts:');
  console.log('  0: Wallet (signer, writable)');
  console.log('  1: Miner PDA (writable)');
  console.log('  2: ORB Token Mint');
  console.log('  3: Wallet ORB Token Account (writable)');
  console.log('  4: Miner ORB Token Account (writable)');
  console.log('  5: Treasury ORB Token Account (writable)');
  console.log('  6: System Program');
  console.log('  7: Token Program');
  console.log('  8: Associated Token Program');
}

identifyClaimOrbAccounts().catch(console.error);
