import { createPublicClient, http, defineChain } from 'viem';

// Define MegaETH Mainnet Chain
export const megaethMainnet = defineChain({
  id: 4326, 
  name: 'MegaETH',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.megaeth.com/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://mega.etherscan.io' },
  },
});

export const publicClient = createPublicClient({
  chain: megaethMainnet,
  transport: http(),
});
