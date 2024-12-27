import { http, createConfig } from "wagmi";
import { arbitrum, mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

if (!WC_PROJECT_ID) {
  throw new Error("WC_PROJECT_ID is a required environment variable");
}

export const config = createConfig({
  chains: [mainnet, sepolia, arbitrum],
  connectors: [
    injected(),
    walletConnect({ projectId: WC_PROJECT_ID }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
  },
});
