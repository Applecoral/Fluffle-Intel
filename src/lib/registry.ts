import { Protocol, Token } from "../types";

export const PROTOCOLS: Record<string, Protocol> = {
  // Native Bridge
  "0x0ca3a2fbc3d770b578223fbb6b062fa875a2ee75": {
    name: "MegaETH Native Bridge",
    category: "bridge",
    isTerminalApproved: true,
  },
  // Kumbaya (Swap)
  "0x68b34591f662508076927803c567cc8006988a09": {
    name: "Kumbaya",
    category: "swap",
    isTerminalApproved: true,
  },
  // Top Strike (Game)
  "0xf3393dc9e747225fca0d61bfe588ba2838afb077": {
    name: "Top Strike",
    category: "game",
    isTerminalApproved: true,
  },
  // Prism (Liquidity)
  "0xed62616a7c1dd354801f4e72389299a81493e004": {
    name: "Prism",
    category: "liquidity",
    isTerminalApproved: true,
  },
  // Xeet (Other)
  "0x57020375f4df37012a2f1c765d5a0f9a2bb77996": {
    name: "Xeet",
    category: "other",
    isTerminalApproved: true,
  },
  // Mega Domains (Mint)
  "0x5b424c6ccba77b32b9625a6fd5a30d409d20d997": {
    name: "Mega Domains",
    category: "mint",
    isTerminalApproved: true,
  },
  // GMX (Swap)
  "0x8ca83c6243b7461ae24b5cb167912f5c055f80b0": {
    name: "GMX",
    category: "swap",
    isTerminalApproved: true,
  },
  // World Markets (Swap)
  "0x5e3ae52eba0f9740364bd5dd39738e1336086a8b": {
    name: "World Markets",
    category: "swap",
    isTerminalApproved: true,
  },
  // Showdown TCG (Game)
  "0x8aaf217a7a1534327234bd09474fc358e6e4d322": {
    name: "Showdown TCG",
    category: "game",
    isTerminalApproved: true,
  },
  // Teko Finance (Lending) - Identified high frequency
  "0x955d56f6391a496231509134e0d2beadf82a223f": {
    name: "Teko Finance",
    category: "lend",
    isTerminalApproved: true,
  },
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
  "0x414bf389": "Swapped on",
  "0xdb3e2198": "Swapped on",
  "0xac9650d8": "Executed multicall",
  "0x5ae401dc": "Executed multicall",

  // Liquidity
  "0xe8e33700": "Added liquidity to",
  "0xf305d719": "Added ETH liquidity to",
  "0xbaa2abde": "Removed liquidity from",
  "0x02751cec": "Removed ETH liquidity from",
  "0xa34123a7": "Minted position on",
  "0x49404b7c": "Burned position on",
  "0xfc6f7865": "Collected fees from",
  "0x219f5d17": "Increased liquidity on",
  "0x0c49ccbe": "Decreased liquidity from",

  // Lending
  "0xe8eda9df": "Deposited to",
  "0x69328dec": "Withdrew from",
  "0xa415bcad": "Borrowed from",
  "0x573ade81": "Repaid to",
  "0x617ba037": "Supplied on",
  "0x8f112a52": "Withdrew from",
  "0x6a439be9": "Borrowed from",
  "0xd65dc7a1": "Liquidated on",

  // Staking
  "0xa694fc3a": "Staked on",
  "0x2e1a7d4d": "Unstaked from",
  "0x3d18b912": "Claimed rewards from",
  "0xe9fad8ee": "Exited stake on",

  // NFT
  "0x40c10f19": "Minted on",
  "0xa22cb465": "Set approval on",
  "0x42842e0e": "Transferred NFT from",
  "0xb88d4fde": "Transferred NFT from",
  "0x1249c58b": "Minted NFT on",

  // Bridges
  "0x9f3d45ac": "Bridged tokens via",
  "0xd0e30db0": "Bridged to",

  // Generic
  "0x": "Sent ETH",
};

export function getProtocol(address: string | null | undefined): Protocol {
  if (!address) return { name: "Contract Creation", category: "other" };
  const addr = address.toLowerCase();
  return PROTOCOLS[addr] || { 
    name: `Unknown protocol (${address.slice(0, 6)}...${address.slice(-4)})`, 
    category: "unknown" 
  };
}

export function getAction(inputData: string): string {
  if (!inputData || inputData === "0x") return "sent ETH";
  const selector = inputData.slice(0, 10).toLowerCase();
  return SELECTORS[selector] || `called function ${selector}`;
}
