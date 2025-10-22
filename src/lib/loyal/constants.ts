import { PublicKey } from "@solana/web3.js";

import loyalOracleIdl from "@/program/idl/loyal_oracle.json";

export const PROGRAM_ID = new PublicKey(loyalOracleIdl.address);
export const CONTEXT_SEED = Buffer.from("context");
export const CHAT_SEED = Buffer.from("chat");
