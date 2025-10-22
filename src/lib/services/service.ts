import { deriveDekFromCmk, generateCmk } from "../loyal/encryption";
import { createEmptyTableOfContents } from "./helpers";

export async function createAndUploadChat(
  // connection: Connection,
  // wallet: AnchorWallet,
  solanaWallet: GeneratedSolanaKeypair
  // query: string,
  // context: UserContext
) {
  console.log("Creating chat");

  const cmk = generateCmk();
  const dek = await deriveDekFromCmk(
    cmk,
    solanaWallet.keypair.publicKey.toBuffer()
  );

  const irysUploader = await getIrysUploader(solanaWallet.keypair);
  const emptyTableOfContents = createEmptyTableOfContents();

  const receipt = await irysUploader.upload(
    JSON.stringify(emptyTableOfContents)
  );

  const receiptId = receipt.id;

  console.log("Table of contents uploaded to Irys with receipt id:", receiptId);
  console.log(receipt);
}
