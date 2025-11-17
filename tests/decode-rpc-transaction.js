// Decode the transaction from the ORB network RPC call
const bs58 = require('bs58');

const base64Tx = "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQADBnoOYkXsvDPH1tsamWVBVUUNP3mB4f3uhUL7IQRiXqyJWGh/JAYZMTuaTaRUOdgLaDzKy7VJj+jTaxz1Yo0Oj99Sh354hjBXCkA1kv5wLobEw9X7tPx83L+WF1KR4oUxcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPP9YVD4FJCnYrAFLWt0wpX5t4feiaAsp9EpWRfcB74AI6rpM8Y6bebdPghTwqVSPo5Gh7pjZEQS3wj7aIVvSDwvEtdTivaRlPWq+LpPCNFMhc2RU+gx82tzyUHD4WoQ9AQUFAAIEAQMiAEBCDwAAAAAAQHh9AQAAAAAAAAAAAAAAABkAAAAAAAAAAAA=";

const txBuffer = Buffer.from(base64Tx, 'base64');

console.log('Transaction decoded:');
console.log('Total length:', txBuffer.length, 'bytes');
console.log();

// The instruction data is typically at the end
// Looking at the pattern "IEBCDwAAAAAAQHh9AQAAAAAAAAAAAAAAABkAAAAAAAAAAAA="
const instructionDataBase64 = "IEBCDwAAAAAAQHh9AQAAAAAAAAAAAAAAABkAAAAAAAAAAAA=";
const instructionData = Buffer.from(instructionDataBase64, 'base64');

console.log('Instruction data from RPC:');
console.log('Length:', instructionData.length, 'bytes');
console.log('Hex:', instructionData.toString('hex'));
console.log();

console.log('Breaking down:');
console.log('  Discriminator:', instructionData.slice(0, 8).toString('hex'));
console.log('  Amount:', instructionData.readBigUInt64LE(8).toString(), 'lamports');
console.log('  Squares mask:', instructionData.readUInt32LE(16));
console.log('  Unknown1:', instructionData.readUInt32LE(20));
console.log('  Square count:', instructionData.readUInt32LE(24));
console.log('  Padding:', instructionData.slice(28).toString('hex'));

// Let me also try to parse the full transaction
console.log();
console.log('Full transaction analysis:');

// Solana transaction format:
// - Signature count (1 byte)
// - Signatures (64 bytes each)
// - Message
let offset = 0;

// Signature count
const sigCount = txBuffer[offset];
console.log('Signature count:', sigCount);
offset += 1;

// Skip signatures
offset += sigCount * 64;

// Message starts here
console.log('Message starts at offset:', offset);

// Message format:
// - Header (3 bytes)
// - Accounts count (compact-u16)
// - Accounts (32 bytes each)
// - Blockhash (32 bytes)
// - Instructions count
// - Instructions

const header = txBuffer.slice(offset, offset + 3);
console.log('Header:', header);
offset += 3;

// For simplicity, let's just look for our discriminator in the transaction
const discriminatorHex = '0040420f00000000';
const discriminatorIndex = txBuffer.toString('hex').indexOf(discriminatorHex);
console.log();
console.log('Discriminator position in transaction:', discriminatorIndex / 2);

if (discriminatorIndex >= 0) {
  const dataStart = discriminatorIndex / 2;
  const extractedData = txBuffer.slice(dataStart, dataStart + 34);
  console.log('Extracted 34 bytes from transaction:');
  console.log('  Hex:', extractedData.toString('hex'));
  console.log('  Amount:', extractedData.readBigUInt64LE(8).toString(), 'lamports');
}
