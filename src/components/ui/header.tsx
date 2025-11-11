"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

import { useChatMode } from "@/contexts/chat-mode-context";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { isChatMode } = useChatMode();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="fixed top-6 right-6 z-[100]">
        {/* Placeholder to prevent layout shift */}
        <div style={{ width: "140px", height: "40px" }} />
      </header>
    );
  }

  return (
    <header
      className={`fixed top-6 right-6 z-[100] ${isChatMode ? "chat-mode-active" : ""}`}
    >
      <WalletMultiButton />
    </header>
  );
}
