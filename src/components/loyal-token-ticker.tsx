"use client";

import { useEffect, useState } from "react";
import {
  Ticker,
  TickerIcon,
  TickerPrice,
  TickerPriceChange,
  TickerSymbol,
} from "@/components/kibo-ui/ticker";
import Image from "next/image";

const LOYAL_TOKEN_ADDRESS = "LYLikzBQtpa9ZgVrJsqYGQpR3cC1WMJrBHaXGrQmeta";

type TokenData = {
  symbol: string;
  icon: string;
  usdPrice: number;
  stats1h: {
    priceChange: number;
  };
};

export function LoyalTokenTicker() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const response = await fetch(
          `https://lite-api.jup.ag/tokens/v2/search?query=${LOYAL_TOKEN_ADDRESS}`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const token = data[0];
          setTokenData({
            symbol: token.symbol,
            icon: token.icon,
            usdPrice: token.usdPrice,
            stats1h: {
              priceChange: token.stats1h.priceChange,
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch token data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchTokenData, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-1">
        {/* Icon skeleton */}
        <div
          className="rounded-full bg-white/10 animate-pulse"
          style={{ width: "16px", height: "16px" }}
        />
        {/* Text skeletons */}
        <div
          className="h-3 bg-white/10 rounded animate-pulse"
          style={{ width: "45px" }}
        />
        <div
          className="h-3 bg-white/10 rounded animate-pulse"
          style={{ width: "35px" }}
        />
        <div
          className="h-3 bg-white/10 rounded animate-pulse"
          style={{ width: "40px" }}
        />
      </div>
    );
  }

  if (!tokenData) {
    return null;
  }

  return (
    <Ticker
      className="gap-1 text-xs cursor-pointer transition-opacity hover:opacity-80"
      onClick={() =>
        window.open(
          "https://jup.ag/tokens/LYLikzBQtpa9ZgVrJsqYGQpR3cC1WMJrBHaXGrQmeta",
          "_blank",
          "noopener,noreferrer"
        )
      }
    >
      <TickerIcon asChild>
        <Image
          alt={tokenData.symbol}
          height={16}
          src={tokenData.icon}
          width={16}
        />
      </TickerIcon>
      <TickerSymbol symbol={tokenData.symbol} className="text-white text-xs font-medium" />
      <TickerPrice price={tokenData.usdPrice} className="text-white/80 text-xs" />
      <TickerPriceChange change={tokenData.stats1h.priceChange} isPercent className="text-xs" />
    </Ticker>
  );
}
