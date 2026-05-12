import { createClient } from "@supabase/supabase-js";
import { formatEther } from "viem";

// Registries (Synced from server.ts)
export const PROTOCOL_REGISTRY: Record<string, { name: string; category: string }> = {
  "0x0ca3a2fbc3d770b578223fbb6b062fa875a2ee75": { name: "MegaETH Native Bridge", category: "bridge" },
  "0x68b34591f662508076927803c567cc8006988a09": { name: "Kumbaya", category: "swap" },
  "0xf3393dc9e747225fca0d61bfe588ba2838afb077": { name: "Top Strike", category: "game" },
  "0xed62616a7c1dd354801f4e72389299a81493e004": { name: "Prism", category: "liquidity" },
  "0x57020375f4df37012a2f1c765d5a0f9a2bb77996": { name: "Xeet", category: "other" },
  "0x5b424c6ccba77b32b9625a6fd5a30d409d20d997": { name: "Mega Domains", category: "mint" },
  "0x8ca83c6243b7461ae24b5cb167912f5c055f80b0": { name: "GMX", category: "swap" },
  "0x5e3ae52eba0f9740364bd5dd39738e1336086a8b": { name: "World Markets", category: "swap" },
  "0x8aaf217a7a1534327234bd09474fc358e6e4d322": { name: "Showdown TCG", category: "game" },
  "0x955d56f6391a496231509134e0d2beadf82a223f": { name: "Teko Finance", category: "lend" },
};

export const SELECTOR_REGISTRY: Record<string, string> = {
  "0xa9059cbb": "transferred",
  "0x095ea7b3": "approved",
  "0x23b872dd": "transferred from",
  "0x38ed1739": "swapped exact tokens for tokens",
  "0x8803dbee": "swapped tokens for exact tokens",
  "0x7ff36ab5": "swapped exact ETH for tokens",
  "0x4a25d94a": "swapped tokens for exact ETH",
  "0x18cbafe5": "swapped exact tokens for ETH",
  "0x5c11d795": "swapped exact tokens for tokens (with fee)",
  "0x414bf389": "swapped on",
  "0xdb3e2198": "swapped on",
  "0xac9650d8": "executed multicall",
  "0x5ae401dc": "executed multicall",
  "0xe8e33700": "added liquidity",
  "0xf305d719": "added ETH liquidity",
  "0xbaa2abde": "removed liquidity",
  "0x02751cec": "removed ETH liquidity",
  "0xa34123a7": "minted position",
  "0x49404b7c": "burned position",
  "0xfc6f7865": "collected fees",
  "0x219f5d17": "increased liquidity",
  "0x0c49ccbe": "decreased liquidity",
  "0xe8eda9df": "deposited",
  "0x69328dec": "withdrew",
  "0xa415bcad": "borrowed",
  "0x573ade81": "repaid",
  "0x617ba037": "supplied",
  "0x8f112a52": "withdrew",
  "0x6a439be9": "borrowed",
  "0xd65dc7a1": "liquidated",
  "0xa694fc3a": "staked",
  "0x2e1a7d4d": "unstaked",
  "0x3d18b912": "claimed rewards",
  "0xe9fad8ee": "exited stake",
  "0x40c10f19": "minted",
  "0xa22cb465": "set approval",
  "0x42842e0e": "transferred NFT",
  "0xb88d4fde": "transferred NFT",
  "0x1249c58b": "minted NFT",
  "0x9f3d45ac": "bridged tokens",
  "0xd0e30db0": "deposited ETH",
};

// Supabase Setup
export const getSupabase = () => {
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    return supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
};

// Helper for time labels
export const getTimeLabel = (ts: number) => {
    const diffParams = (Date.now() / 1000) - ts;
    if (diffParams < 60) return `${Math.floor(diffParams)}s ago`;
    if (diffParams < 3600) return `${Math.floor(diffParams / 60)}m ago`;
    if (diffParams < 86400) return `${Math.floor(diffParams / 3600)}h ago`;
    return `${Math.floor(diffParams / 86400)}d ago`;
};

export { lookupSelector } from "../lib/decode.js";
