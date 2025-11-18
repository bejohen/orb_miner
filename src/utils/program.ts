import {
  SystemProgram,
  TransactionInstruction,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import BN from 'bn.js';
import { config } from './config';
import { getWallet } from './wallet';
import { getConnection } from './solana';
import { getMinerPDA, getStakePDA, getAutomationPDA } from './accounts';
import logger from './logger';
import { retry } from './retry';

// Instruction discriminators (extracted from real ORB transactions)
const DEPLOY_DISCRIMINATOR = Buffer.from([0x00, 0x40, 0x42, 0x0f, 0x00, 0x00, 0x00, 0x00]);
// ORB uses simple 1-byte discriminators from ORE enum
// ClaimSOL = 3, ClaimORE = 4 (defined inline in functions)
const STAKE_DISCRIMINATOR = Buffer.from([0xce, 0xb0, 0xca, 0x12, 0xc8, 0xd1, 0xb3, 0x6c]);

// Convert deployment strategy to 25-bit mask
// NOTE: Based on reverse engineering, ORB requires squares mask to be 0, not a bitmask!
// The actual square deployment is controlled by other parameters.
export function getSquareMask(): number {
  // Always return 0 - this is required by ORB's deploy instruction
  return 0;
}

// Build Deploy instruction (reverse engineered from ORB transactions)
export async function buildDeployInstruction(
  amount: number
): Promise<TransactionInstruction> {
  const wallet = getWallet();
  const [minerPDA] = getMinerPDA(wallet.publicKey);
  const [automationPDA] = getAutomationPDA(wallet.publicKey);

  // Convert SOL amount to lamports
  const amountLamports = new BN(amount * LAMPORTS_PER_SOL);

  // Build instruction data (34 bytes total):
  // - 8 bytes: discriminator (0x0040420f00000000)
  // - 8 bytes: amount (u64 LE)
  // - 4 bytes: squares mask (u32 LE) - MUST BE 0
  // - 4 bytes: unknown field (u32 LE) - always 0
  // - 4 bytes: square count (u32 LE) - always 25
  // - 6 bytes: padding (all zeros)
  const data = Buffer.alloc(34);
  DEPLOY_DISCRIMINATOR.copy(data, 0);              // Discriminator (8 bytes)
  amountLamports.toArrayLike(Buffer, 'le', 8).copy(data, 8); // Amount (8 bytes)
  data.writeUInt32LE(0, 16);                       // Squares mask - MUST BE 0 (4 bytes)
  data.writeUInt32LE(0, 20);                       // Unknown field (4 bytes)
  data.writeUInt32LE(25, 24);                      // Square count (4 bytes)
  // Padding bytes 28-33 are already 0 from Buffer.alloc

  logger.debug(`Deploy instruction: amount=${amount} SOL (${amountLamports.toString()} lamports)`);

  // Account keys (5 accounts):
  // 0. signer - Wallet (signer, writable)
  // 1. automation - Automation PDA (writable)
  // 2. fee_collector - Fee collector address (writable)
  // 3. miner - Miner PDA (writable)
  // 4. system_program - System program (read-only)
  const keys = [
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: automationPDA, isSigner: false, isWritable: true },
    { pubkey: config.orbFeeCollector, isSigner: false, isWritable: true },
    { pubkey: minerPDA, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: config.orbProgramId,
    data,
  });
}

// Build Automate instruction (setup automated mining)
export function buildAutomateInstruction(): TransactionInstruction {
  const wallet = getWallet();
  const [minerPDA] = getMinerPDA(wallet.publicKey);
  const [automationPDA] = getAutomationPDA(wallet.publicKey);

  // Automate instruction: 34 bytes of zeros (discriminator 0x00)
  const data = Buffer.alloc(34);

  // 5 accounts: wallet, automation PDA, system program, miner PDA, system program (duplicate)
  const keys = [
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: automationPDA, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: minerPDA, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: config.orbProgramId,
    data,
  });
}

// Build Claim SOL instruction (based on reverse engineered transaction)
export function buildClaimSolInstruction(): TransactionInstruction {
  const wallet = getWallet();
  const [minerPDA] = getMinerPDA(wallet.publicKey);

  // ClaimSOL instruction: 1 byte discriminator (0x03)
  const data = Buffer.from([0x03]);

  // 3 accounts: wallet, miner PDA, system program
  const keys = [
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: minerPDA, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: config.orbProgramId,
    data,
  });
}

// Build Claim ORE instruction (based on reverse engineered transaction)
export async function buildClaimOreInstruction(): Promise<TransactionInstruction> {
  const wallet = getWallet();
  const [minerPDA] = getMinerPDA(wallet.publicKey);

  // ClaimORE instruction: 1 byte discriminator (0x04)
  const data = Buffer.from([0x04]);

  // Get Treasury PDA
  const [treasuryPDA] = PublicKey.findProgramAddressSync([Buffer.from('treasury')], config.orbProgramId);

  // Get token accounts
  const walletOrbAta = await getAssociatedTokenAddress(config.orbTokenMint, wallet.publicKey);
  const treasuryOrbAta = await getAssociatedTokenAddress(config.orbTokenMint, treasuryPDA, true);

  // 9 accounts based on successful transaction analysis:
  // 0: Wallet (signer, writable)
  // 1: Miner PDA (writable)
  // 2: ORB Token Mint
  // 3: Wallet ORB Token Account (writable)
  // 4: Treasury PDA (writable)
  // 5: Treasury ORB Token Account (writable)
  // 6: System Program
  // 7: Token Program
  // 8: Associated Token Program
  const keys = [
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: minerPDA, isSigner: false, isWritable: true },
    { pubkey: config.orbTokenMint, isSigner: false, isWritable: false },
    { pubkey: walletOrbAta, isSigner: false, isWritable: true },
    { pubkey: treasuryPDA, isSigner: false, isWritable: true },
    { pubkey: treasuryOrbAta, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: config.orbProgramId,
    data,
  });
}

// Build Stake instruction
export function buildStakeInstruction(amount: number): TransactionInstruction {
  const wallet = getWallet();
  const [stakePDA] = getStakePDA(wallet.publicKey);

  // Convert ORB amount to lamports (9 decimals)
  const amountLamports = new BN(amount * 1e9);

  const data = Buffer.alloc(8 + 8);
  STAKE_DISCRIMINATOR.copy(data, 0);
  amountLamports.toArrayLike(Buffer, 'le', 8).copy(data, 8);

  const keys = [
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: stakePDA, isSigner: false, isWritable: true },
    { pubkey: config.orbTokenMint, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: config.orbProgramId,
    data,
  });
}

// Send and confirm transaction with retries
export async function sendAndConfirmTransaction(
  instructions: TransactionInstruction[],
  context: string
): Promise<string> {
  const connection = getConnection();
  const wallet = getWallet();

  return await retry(
    async () => {
      // Create transaction
      const transaction = new Transaction();
      instructions.forEach(ix => transaction.add(ix));

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign transaction
      transaction.sign(wallet);

      // Send transaction with detailed error logging
      let signature: string;
      try {
        signature = await connection.sendRawTransaction(transaction.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        });
      } catch (error: any) {
        // Log detailed error information
        logger.error(`${context}: Transaction simulation failed`);
        if (error.logs) {
          logger.error(`${context}: Simulation logs:`, error.logs);
        }
        if (error.message) {
          logger.error(`${context}: Error message:`, error.message);
        }
        throw error;
      }

      logger.info(`${context}: Transaction sent: ${signature}`);

      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');

      logger.info(`${context}: Transaction confirmed: ${signature}`);
      return signature;
    },
    { maxRetries: config.deployMaxRetries },
    context
  );
}

export default {
  getSquareMask,
  buildDeployInstruction,
  buildAutomateInstruction,
  buildClaimSolInstruction,
  buildClaimOreInstruction,
  buildStakeInstruction,
  sendAndConfirmTransaction,
};
