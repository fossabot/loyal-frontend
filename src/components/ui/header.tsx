"use client";

import { useAccounts, useModal, usePhantom } from "@phantom/react-sdk";
import { useEffect, useState } from "react";

import { useChatMode } from "@/contexts/chat-mode-context";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { isChatMode } = useChatMode();
  const { isConnected } = usePhantom();
  const { open } = useModal();
  const accounts = useAccounts();
  const solanaAddress = accounts?.find(
    (acc) => acc.addressType === "Solana"
  )?.address;

  // Truncate wallet address for display
  const truncatedAddress = solanaAddress
    ? `${solanaAddress.slice(0, 4)}...${solanaAddress.slice(-4)}`
    : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide when: chat mode AND connected (wallet button is in sidebar)
  const shouldHide = isChatMode && isConnected;

  if (!mounted || shouldHide) {
    return null;
  }

  return (
    <header className="fixed top-6 right-6 z-[100]">
      <button
        onClick={() => open()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(48px)",
          border: "none",
          borderRadius: "32px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow:
            "0px 4px 8px 0px rgba(0, 0, 0, 0.04), 0px 2px 4px 0px rgba(0, 0, 0, 0.02)",
          mixBlendMode: "lighten",
          padding: "4px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.06)",
            borderRadius: "9999px",
          }}
        >
          <img alt="Wallet" height={28} src="/Wallet-Icon.svg" width={28} />
        </div>
        <span
          style={{
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "20px",
            color: "#fff",
            paddingRight: "12px",
          }}
        >
          {isConnected && truncatedAddress
            ? truncatedAddress
            : "Connect Wallet"}
        </span>
      </button>
    </header>
  );
}
