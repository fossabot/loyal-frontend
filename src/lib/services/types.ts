export const IRYS_FILE_VERSION = "1.0.0" as const;

export type IrysFileKind = "table-of-contents" | "chat-turn";

export type ChatRole = "user" | "assistant";

export type IrysTableOfContentsEntry = {
  txId: string;
  conversationId: string;
  turnId: string;
  model?: string;
  createdAt: string;
};

export type IrysTableOfContents = {
  key: string | undefined;
  entries: IrysTableOfContentsEntry[];
};

export type IrysChatTurn = {
  kind: "chat-turn";
  version: typeof IRYS_FILE_VERSION;
  conversationId: string;
  turnId: string;
  createdAt: string;
  prompt: {
    role: ChatRole;
    text: string;
    model?: string;
    metadata?: Record<string, unknown>;
  };
  response?: {
    role: ChatRole;
    text: string;
    metadata?: Record<string, unknown>;
  };
  attachments?: string[];
};

export type IrysUploadFile = IrysTableOfContents | IrysChatTurn;
