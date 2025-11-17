// Try to find what PDA the unknown account is
const { PublicKey } = require('@solana/web3.js');

async function findUnknownPDA() {
  const programId = new PublicKey('boreXQWsKpsJz5RR9BMtN8Vk4ndAk23sutj8spWYhwk');
  const unknownAccount = new PublicKey('577HqbrnKM4micsY52rW8j6i9W8SmzV3FprfBCDneNpF');

  console.log('Searching for PDA matching:', unknownAccount.toBase58());
  console.log();

  // Try various single-seed PDAs
  const seeds = [
    'treasury',
    'Treasury',
    'TREASURY',
    'fee',
    'fees',
    'fee_collector',
    'collector',
    'vault',
    'pool',
    'pot',
    'jackpot',
    'prize',
    'reward',
    'rewards',
    'config',
    'state',
    'global',
    'authority',
    'admin',
  ];

  for (const seed of seeds) {
    try {
      const [pda, bump] = PublicKey.findProgramAddressSync([Buffer.from(seed)], programId);
      if (pda.equals(unknownAccount)) {
        console.log(`✓ MATCH FOUND!`);
        console.log(`  Seed: "${seed}"`);
        console.log(`  Bump: ${bump}`);
        return;
      }
    } catch (e) {
      // Ignore invalid seeds
    }
  }

  console.log('✗ Not found with single-seed PDAs');
  console.log();
  console.log('The account might be:');
  console.log('1. A multi-seed PDA');
  console.log('2. A hardcoded fee collector address');
  console.log('3. A treasury wallet (not a PDA)');
  console.log();
  console.log('For now, we can use it as a constant in our code.');
}

findUnknownPDA().catch(console.error);
