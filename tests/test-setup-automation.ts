import { getWallet, getSolBalance } from '../src/utils/wallet';
import { getAutomationPDA } from '../src/utils/accounts';
import { buildAutomateInstruction, sendAndConfirmTransaction, AutomationStrategy } from '../src/utils/program';
import { getConnection } from '../src/utils/solana';
import { config } from '../src/utils/config';

/**
 * Test script to setup on-chain automation using the automate instruction
 * This creates an automation account that allows the ORB program to automatically
 * deploy to all 25 squares each round without manual transactions.
 *
 * Run with: npx ts-node tests/test-setup-automation.ts
 */

async function main() {
  console.log('============================================================');
  console.log('Setting Up On-Chain Automation');
  console.log('============================================================\n');

  try {
    const wallet = getWallet();
    const connection = getConnection();
    const [automationPDA] = getAutomationPDA(wallet.publicKey);

    console.log(`Wallet: ${wallet.publicKey.toBase58()}`);
    console.log(`Automation PDA: ${automationPDA.toBase58()}\n`);

    // Check if automation account already exists
    const existingAccount = await connection.getAccountInfo(automationPDA);
    if (existingAccount) {
      console.log('⚠️  Automation account already exists!');
      console.log('To modify automation settings, you need to close the existing account first.\n');
      return;
    }

    // Check SOL balance
    const solBalance = await getSolBalance();
    console.log(`Current SOL Balance: ${solBalance.toFixed(4)} SOL\n`);

    // Configuration for automation
    const amountPerSquare = config.solPerDeployment; // SOL per square per round
    const deposit = 1.0; // Initial deposit to fund automation (in SOL)
    const feePerExecution = 0.0001; // Fee for executor (self-execution, so minimal)
    const strategy = AutomationStrategy.Random; // Deploy to all squares randomly
    const squareMask = 25n; // Deploy to 25 squares

    console.log('Automation Configuration:');
    console.log(`  Amount per square: ${amountPerSquare} SOL`);
    console.log(`  Total per round: ${amountPerSquare * 25} SOL`);
    console.log(`  Initial deposit: ${deposit} SOL`);
    console.log(`  Fee per execution: ${feePerExecution} SOL`);
    console.log(`  Strategy: ${strategy === AutomationStrategy.Random ? 'Random' : 'Preferred'}`);
    console.log(`  Squares: ${squareMask.toString()}`);
    console.log(`  Executor: ${wallet.publicKey.toBase58()} (self)`);
    console.log('');

    const totalCost = deposit + 0.01; // deposit + rent + fees
    if (solBalance < totalCost) {
      console.log(`❌ Insufficient SOL balance. Need at least ${totalCost} SOL`);
      return;
    }

    // Dry run check
    if (config.dryRun) {
      console.log('[DRY RUN] Would create automation account with above settings');
      console.log('✅ Dry run completed');
      return;
    }

    console.log('Creating automation account...');
    const instruction = buildAutomateInstruction(
      amountPerSquare,
      deposit,
      feePerExecution,
      strategy,
      squareMask,
      wallet.publicKey // Self-execute
    );

    console.log('Sending transaction...');
    const signature = await sendAndConfirmTransaction([instruction], 'Setup Automation');

    console.log('\n✅ Automation setup successful!');
    console.log(`Transaction: ${signature}`);
    console.log(`\nAutomation is now active. The ORB program will automatically`);
    console.log(`deploy ${amountPerSquare} SOL to all 25 squares each round.`);
    console.log(`\nYou can fund the automation account anytime to keep it running.`);
  } catch (error) {
    console.error('\n❌ Automation setup failed:', error);
    process.exit(1);
  }
}

main();
