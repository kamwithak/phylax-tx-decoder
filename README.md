**Please come back EOD Friday December 27th for an updated README**

# Ethereum Transaction Decoder

A crypto app for decoding/visualizing ETH traces via a nested table visualization. 

[Preview](https://github.com/user-attachments/assets/2ecb704d-3064-4b6f-ad41-7c8ff7f28cb1).

Inspired by [Etherscan decoder tool](https://etherscan.io/tx-decoder?tx=0x3346fb99ba272d13dff23d17a045d491d5d55dd46b01cb5ee1ac7e4df7695746).

## Features

- Decode transaction input data and method calls
- Visualize nested contract interactions via a nested table
- Show contract names and addresses
- Display native ETH value transfers
- Support for common ERC standards (ERC20, ERC721, etc.) - requires further support for vault contract standards, etc...
- Fallback trace mechanism for broader node compatibility
- TODO: integrate wagmi and wallet connecting via the NavBar
- TODO: footer component
- TODO: documentation, analysis on trade-offs and improvements/optimizations - short-cuts taken in the name of expediency

## How It Works

The application attempts to fetch transaction trace data in two ways:

1. **Primary Method**: Uses the `debug_traceTransaction` RPC call with the `callTracer` configuration. This provides detailed execution traces including internal calls, but requires an archive node with debug APIs enabled.

2. **Fallback Method**: If the RPC call fails (e.g., using a node without debug APIs), the app automatically falls back to Etherscan's API to fetch internal transactions. While less detailed, this ensures basic trace functionality even with limited RPC capabilities.

```typescript
// Simplified trace fetching logic
try {
  // Try RPC provider first
  traceData = await provider.send('debug_traceTransaction', [hash, {
    tracer: 'callTracer'
  }]);
} catch (error) {
  // Fallback to Etherscan if RPC failed
  const etherscanTrace = await getTraceFromEtherscan(hash);
  traceData = convertEtherscanTrace(etherscanTrace);
}
```

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/ethereum-tx-decoder.git
cd ethereum-tx-decoder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_RPC_URL=your_ethereum_rpc_url
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── lib/                   # Utility functions and services
├── public/               # Static assets
└── types/               # Global type definitions
```

## Dependencies

```json
{
  "dependencies": {
    "ethers": "^6.13.4",
    "next": "15.1.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_RPC_URL | Ethereum RPC endpoint URL | Yes |
| NEXT_PUBLIC_ETHERSCAN_API_KEY | Etherscan API key | Yes |

## Usage

1. Enter an Ethereum transaction hash in the input field
2. Click "Decode" to fetch and decode the transaction
3. View the execution trace with expandable contract interactions
4. Click on rows to see detailed method parameters and return values

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
