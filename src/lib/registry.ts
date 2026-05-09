import { Protocol, Token } from "../types";

export const PROTOCOLS: Record<string, Protocol> = {
  // Native Bridge
  "0x0ca3a2fbc3d770b578223fbb6b062fa875a2ee75": {
    name: "MegaETH Native Bridge",
    category: "bridge",
    isTerminalApproved: true,
  },
  // Teko Finance (Lending)
  "0x1234567890123456789012345678901234567890": {
    name: "Teko Finance",
    category: "lend",
    isTerminalApproved: true,
  },
  // Gutter (DEX)
  "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": {
    name: "Gutter",
    category: "swap",
    isTerminalApproved: true,
  },
  // The Fluffle (NFTs / Game)
  "0x9876543210987654321098765432109876543210": {
    name: "The Fluffle",
    category: "game",
    isTerminalApproved: true,
  },
  // Aave V3
  "0x617ba037e499630d70205183391456c06ad55123": {
    name: "Aave V3",
    category: "lend",
    isTerminalApproved: true,
  }
};

export const TOKENS: Record<string, Token> = {
  "0xusdm_token_address": { symbol: "USDm", decimals: 6 },
  "0xweth_token_address": { symbol: "WETH", decimals: 18 },
};

export const SELECTORS: Record<string, string> = {
  // ERC20
  "0xa9059cbb": "transferred",
  "0x095ea7b3": "approved",
  "0x23b872dd": "transferred from",

  // Uniswap-style swaps
  "0x38ed1739": "swapped exact tokens for tokens",
  "0x8803dbee": "swapped tokens for exact tokens",
  "0x7ff36ab5": "swapped exact ETH for tokens",
  "0x4a25d94a": "swapped tokens for exact ETH",
  "0x18cbafe5": "swapped exact tokens for ETH",
  "0x5c11d795": "swapped exact tokens for tokens (with fee)",
  "0x414bf389": "swapped exact input single (V3)",
  "0xdb3e2198": "swapped exact output single (V3)",
  "0xac9650d8": "executed multicall",
  "0x5ae401dc": "executed multicall (V3)",

  // Liquidity
  "0xe8e33700": "added liquidity",
  "0xf305d719": "added ETH liquidity",
  "0xbaa2abde": "removed liquidity",
  "0x02751cec": "removed ETH liquidity",
  "0xa34123a7": "minted liquidity position (V3)",
  "0x49404b7c": "burned liquidity position (V3)",
  "0xfc6f7865": "collected liquidity fees",
  "0x219f5d17": "increased liquidity",
  "0x0c49ccbe": "decreased liquidity",

  // Lending
  "0xe8eda9df": "deposited",
  "0x69328dec": "withdrew",
  "0xa415bcad": "borrowed",
  "0x573ade81": "repaid",
  "0x617ba037": "supplied",
  "0x8f112a52": "withdrew",
  "0x6a439be9": "borrowed",
  "0xd65dc7a1": "liquidated position",

  // Staking
  "0xa694fc3a": "staked",
  "0x2e1a7d4d": "unstaked / withdrew",
  "0x3d18b912": "claimed rewards",
  "0xe9fad8ee": "exited stake",

  // NFT
  "0x40c10f19": "minted",
  "0xa22cb465": "set approval for all",
  "0x42842e0e": "transferred NFT",
  "0xb88d4fde": "transferred NFT (safe)",
  "0x1249c58b": "minted NFT",

  // Bridges
  "0x9f3d45ac": "bridged tokens",
  "0xd0e30db0": "deposited ETH to bridge",

  // Generic
  "0x": "sent ETH",
};

export function getProtocol(address: string): Protocol {
  return PROTOCOLS[address.toLowerCase()] || { name: `Unknown (${address.slice(0, 6)}...${address.slice(-4)})`, category: "unknown" };
}

export function getAction(inputData: string): string {
  if (!inputData || inputData === "0x") return "sent ETH";
  const selector = inputData.slice(0, 10).toLowerCase();
  return SELECTORS[selector] || `called function ${selector}`;
}
