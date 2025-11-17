// Calculate Anchor discriminators for various instructions
const crypto = require('crypto');

function calculateDiscriminator(name) {
  const hash = crypto.createHash('sha256');
  hash.update(`global:${name}`);
  const fullHash = hash.digest();
  return fullHash.slice(0, 8);
}

const instructions = [
  'deploy',
  'wager',
  'submit',
  'bet',
  'stake',
  'claim',
  'unstake',
  'initialize',
  'mine',
  'enter',
  'exit',
  'register',
  'automation_deploy',
  'auto_deploy',
];

console.log('Anchor Discriminators:');
console.log('======================');

instructions.forEach(name => {
  const disc = calculateDiscriminator(name);
  console.log(`${name.padEnd(20)} ${disc.toString('hex')}`);
});

console.log();
console.log('Target discriminator: 0040420f00000000');
console.log();

// Check if any match
const target = Buffer.from([0x00, 0x40, 0x42, 0x0f, 0x00, 0x00, 0x00, 0x00]);
instructions.forEach(name => {
  const disc = calculateDiscriminator(name);
  if (disc.equals(target)) {
    console.log(`✓ MATCH FOUND: ${name}`);
  }
});
