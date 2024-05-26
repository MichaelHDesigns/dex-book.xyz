import { getOrders } from "../getOrders";
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

async function verifySignature(message: string, signature: string, publicKey: string) {
  // Decode the public key from base58
  const pubKey = new PublicKey(publicKey).toBytes();

  // Decode the signature from base58
  const signatureUint8 = bs58.decode(signature);

  // Convert the message to a Uint8Array
  const messageUint8 = new TextEncoder().encode(message);

  // Verify the signature
  return nacl.sign.detached.verify(messageUint8, signatureUint8, pubKey);
}

async function getSignerAddress(message: string, signature: string) {
  // Decode the signature from base58
  const signatureUint8 = bs58.decode(signature);

  // Convert the message to a Uint8Array
  const messageUint8 = new TextEncoder().encode(message);

  // Use tweetnacl to verify the signature against all possible public keys
  const keyPair = nacl.sign.keyPair.fromSecretKey(signatureUint8);

  // Return the public key as a Solana address
  return new PublicKey(keyPair.publicKey).toBase58();
}

// Usage
// (async () => {
//   const message = "Your message here";
//   const signature = "Base58EncodedSignatureHere";

//   try {
//       const signerAddress = await getSignerAddress(message, signature);
//       console.log(`The signer address is: ${signerAddress}`);
//   } catch (error) {
//       console.error(`Error verifying signature: ${error.message}`);
//   }
// })();
const getCurrentTimestamp = () => {
  const now = new Date();
  now.setSeconds(0, 0); // Round to the nearest minute
  return now;
};

export async function GET(request: Request, { params }: { params: { address: string, signature: string } }) {
  // const message = `Welcome to DEX-Book!\n\nToken Address: ${params.address}\n\nTimestamp: ${getCurrentTimestamp()}`
  // const signer = await getSignerAddress(message, params.signature);
  // console.log(signer);
  try {
    const response = await getOrders(params.address);
    return new Response(JSON.stringify({signature: params.signature, response: response}));
  } catch (error :any) {
    console.error('Request failed:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
