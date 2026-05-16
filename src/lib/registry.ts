import { Protocol, Token } from "../types";

export const PROTOCOLS: Protocol[] = [
  {
    name: "Aave V3",
    slug: "aave-v3",
    website: "https://app.aave.com",
    category: "lending",
    contracts: {
      pool: "0x7e324AbC5De01d112AfC03a584966ff199741C28"
    },
    verified: true
  },
  {
    name: "AveForge",
    slug: "aveforge",
    website: "https://www.aveforge.gg/",
    category: "dex",
    contracts: { SafeProxy: "0xb12e49a4CDB83eac29C759ffC64DF818fBa8e28b" },
    verified: true
  },
  {
    name: "Blackhaven",
    slug: "blackhaven",
    website: "https://app.blackhaven.xyz",
    category: "other",
    contracts: {
      bond: "0xe5C0836bcd3A37627Fa95A432C7Dbb1b9c79e3df",
    },
    verified: true
  },
  {
    name: "Brix",
    slug: "brix",
    website: "https://brix.money",
    category: "yield and credit",
    contracts: {
      router: "0x15b271d9012b5820fc42b1c495b4c1e206547de5"
    },
    verified: true
  },
  {
    name: "Canonic",
    slug: "canonic",
    website: "https://canonic.trade",
    category: "dex",
    contracts: {
      vault1: "0x11469caf743C2bFBD663C42A2E339A75E053075C",
      vault2: "0xcC32b639767126f08A51ca5284F9a72150F418D5",
      vault3: "0xC397f8ffd517EDA78da4dE59c53516B65846a82A",
      vault4: "0x26F35fcbA3C1387dBaC477d82Bb8a66fA2eDfb4E"
    },
    verified: true
  },
  {
    name: "Cap",
    slug: "cap",
    website: "https://www.cap.app",
    category: "yield",
    contracts: {
      token1: "0xcCcc62962d17b8914c62D74FfB843d73B2a3cccC",
      token2: "0x88887bE419578051FF9F4eb6C858A951921D8888"
    },
    verified: true
  },
  {
    name: "Chisino",
    slug: "chisino",
    website: "https://app.chisino.io",
    category: "gaming",
    contracts: {
      primary: "0x4fd02a1A80923cE1D7E70A8719421431Ea286941"
    },
    verified: true
  },
  {
    name: "GMX",
    slug: "gmx",
    website: "https://app.gmx.io",
    category: "perps",
    contracts: {
      router: "0x3782d91C5888dE31F627495e6aAAC3f09499fe72"
    },
    verified: true
  },
  {
    name: "Gains Network",
    slug: "gains-network",
    website: "https://gains.trade",
    category: "perps",
    contracts: {
      primary: "0x46344456f130e9dcdeA7F98cDb0E02fB9F4ab72D"
    },
    verified: true
  },
  {
    name: "Ferdy",
    slug: "ferdy",
    website: "https://ferdy.bet",
    category: "gaming",
    contracts: {
      dice: "0xf9baBEb6e0013e91E669A4872907c19Aa78826Ce",
      keno: "0xfAe58cfD2b2F372229B3610F98BbaE7Cc4c12Ab4",
      coinflip: "0xfac05d5F67BD01850378C0C08FB2bC7117045Aa6",
      rockpaperscissors: "0xB9e036F8d3129179c9eb15615F7a711c4f1Cc413",
      pvpflip: "0xcf9A3e1635D02bc2B6294591607A9B43fcb1B901",
      plinko: "0x062355a2f867724C96F6c1CEf08ea03E74B80f49",
      horserace: "0x11B8f71a3EB3eB6C04B53F7020538a2F501aB6b5",
      slots: "0x03C5433E91AdDEcf3cD9B9167d598f882A05e46f",
      slide: "0x9F40194914a3116C095B7304c859dA0359d4e3B6"
    },
    verified: true
  },
  {
    name: "Kumbaya",
    slug: "kumbaya",
    website: "https://www.kumbaya.xyz",
    category: "dex",
    contracts: {
      primary: "0x0BE268Ebb2114C39Ca817FFf66503d4785eD019a",
      secondary: "0xE5BbEF8De2DB447a7432A47EBa58924d94eE470e",
      tertiary: "0xF9f676066eB7BaEEED93E859BC26a41663F277A8",
      quaternary: "0x05f6d632d5ac8cEAc09AECdc9Fb8bf990B4a2732",
      nftPositionManager: "0x2b781C57e6358f64864Ff8EC464a03Fdaf9974bA"
    },
    verified: true
  },
  {
    name: "Offshore Protocol",
    slug: "offshore-protocol",
    website: "https://app.offshoreprotocol.fun",
    category: "gaming",
    contracts: {
      configRegistry: "0xCD8e5aaee73730347d8a3568D57510158a07b4A6"
    },
    verified: true
  },
  {
    name: "Hit One",
    slug: "hit-one",
    website: "https://app.hit.one",
    category: "perps",
    contracts: {
      treasury: "0xdf248bafe6fe9a73f201a125641e5c8bb20472f7"
    },
    verified: true
  },
  {
    name: "World Markets",
    slug: "world-markets",
    website: "https://world.inc",
    category: "perps",
    contracts: {
      primary: "0x5e3Ae52EbA0F9740364Bd5dd39738e1336086A8b"
    },
    verified: true
  },
  {
    name: "Prism",
    slug: "prism",
    website: "https://prismfi.cc",
    category: "dex",
    contracts: {
      primary: "0x955d56F6391a496231509134e0d2Beadf82a223f"
    },
    verified: true
  }
];

export function getProtocolByAddress(address: string | null | undefined): Protocol | null {
  if (!address) return null;
  const addr = address.toLowerCase();
  
  for (const protocol of PROTOCOLS) {
    const contractAddresses = Object.values(protocol.contracts).map(a => a.toLowerCase());
    if (contractAddresses.includes(addr)) {
      return protocol;
    }
  }
  
  return null;
}

export function getProtocolBySlug(slug: string): Protocol | null {
  return PROTOCOLS.find(p => p.slug === slug) || null;
}

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
  "0x414bf389": "swapped on",
  "0xdb3e2198": "swapped on",
  "0xac9650d8": "executed multicall",
  "0x5ae401dc": "executed multicall",

  // Liquidity
  "0xe8e33700": "added liquidity",
  "0xf305d719": "added ETH liquidity",
  "0xbaa2abde": "removed liquidity",
  "0x02751cec": "removed ETH liquidity",
  "0xa34123a7": "minted position",
  "0x49404b7c": "burned position",
  "0xfc6f7865": "collected fees",
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
  "0xd65dc7a1": "liquidated",

  // Staking
  "0xa694fc3a": "staked",
  "0x2e1a7d4d": "unstaked",
  "0x3d18b912": "claimed rewards",
  "0xe9fad8ee": "exited stake",

  // NFT
  "0x40c10f19": "minted",
  "0xa22cb465": "set approval",
  "0x42842e0e": "transferred NFT",
  "0xb88d4fde": "transferred NFT",
  "0x1249c58b": "minted NFT",

  // Bridges
  "0x9f3d45ac": "bridged tokens",
  "0xd0e30db0": "deposited ETH",

  // Generic
  "0x": "sent ETH",
};

export function getProtocol(address: string | null | undefined): { name: string; category: string; website?: string } {
  const protocol = getProtocolByAddress(address);
  if (protocol) return protocol;
  
  if (!address) return { name: "Contract Creation", category: "other" };
  
  return { 
    name: `${address.slice(0, 6)}...${address.slice(-4)}`, 
    category: "unknown" 
  };
}

export function getAction(inputData: string): string {
  if (!inputData || inputData === "0x") return "sent ETH";
  const selector = inputData.slice(0, 10).toLowerCase();
  return SELECTORS[selector] || `called function ${selector}`;
}
