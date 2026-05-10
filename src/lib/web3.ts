import { createPublicClient, http, defineChain } from 'viem';

// Define MegaETH Mainnet Chain
export const megaethMainnet = defineChain({
  id: 13370, 
  name: 'MegaETH',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_MEGAETH_RPC_URL || 'https://rpc.megaeth.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://mega.etherscan.io' },
  },
});

export const publicClient = createPublicClient({
  chain: megaethMainnet,
  transport: http(),
});
