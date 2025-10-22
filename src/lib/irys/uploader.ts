import { Uploader } from "@irys/upload";
import { Solana } from "@irys/upload-solana";
import { Keypair } from "@solana/web3.js";

export type GeneratedSolanaKeypair = {
  keypair: Keypair;
  publicKeyBase58: string;
  secretKey: Uint8Array;
};

export const generateSolanaKeypair = (): GeneratedSolanaKeypair => {
  const keypair = Keypair.generate();

  return {
    keypair,
    publicKeyBase58: keypair.publicKey.toBase58(),
    secretKey: keypair.secretKey,
  };
};

export const getIrysUploader = async (ephemeralPrivateKey: string) => {
  if (!ephemeralPrivateKey) {
    throw new Error("Ephemeral key is required");
  }
  // create a wallet from the ephemeral key
  const irysUploader = await Uploader(Solana).withWallet(ephemeralPrivateKey);
  return irysUploader;
};