**Please come back EOD Friday December 27th for a finalized tech doc

# Ethereum Transaction Decoder

A crypto app for decoding/visualizing ETH traces via a nested table visualization.

<img width="2049" alt="Screenshot 2024-12-27 at 10 26 23 AM" src="https://github.com/user-attachments/assets/6b819438-9645-4c2c-9a80-b5f1bba7c2db" />

[Etherescan decoder tool used as inspiration](https://etherscan.io/tx-decoder?tx=0x3346fb99ba272d13dff23d17a045d491d5d55dd46b01cb5ee1ac7e4df7695746)

## Features

- Decode transaction input data and method calls
- Visualize nested contract interactions (shows contract names and addresses) via a nested table ie) _Execution Trace_
- Display native `ETH` value transfers including `from` and `to` addresses ie) _Transaction Overview_
- Displays the hash of each function selector alongside their respective decoded parameters  ie) _Transaction Data_
- Support for common ERC standards (`ERC20`, `ERC721`, etc.) - requires further support for vault contract standards, etc...
- Fallback trace mechanism for broader node compatibility
- Wagmi integration and wallet connecting via the navigation bar - `ConnectButton`
- Layout, nagivation bar, main page, and footer components
- Testing coverage for core functionality -> mock tests using `jest` and `testing-library`
- In progress: documentation, analysis on trade-offs and improvements/optimizations - short-cuts taken in the name of expediency

## How It Works

The application attempts to fetch transaction trace data in two ways:

1. **Primary Method**: Uses the `debug_traceTransaction` RPC call with the `callTracer` configuration. This provides detailed execution traces including internal calls, but requires an archive node with debug APIs enabled.

2. **Fallback Method**: If the RPC call fails (e.g., using a node without debug APIs), the app automatically falls back to Etherscan's API to fetch internal transactions. While less detailed, this ensures basic trace functionality even with limited RPC capabilities.

```typescript
// Simplified trace fetching logic
try {
  // Try RPC provider first
  traceData = await provider.send("debug_traceTransaction", [
    hash,
    {
      tracer: "callTracer",
    },
  ]);
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
NEXT_PUBLIC_WC_PROJECT_ID=your_wallet_connect_project_id
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
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript type definitions
├── lib/                     # Utility functions and services
├── public/                  # Static assets
└── types/                   # Global type definitions
```

## Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.62.11",
    "ethers": "^6.13.4",
    "next": "15.1.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "viem": "2.x",
    "wagmi": "^2.14.6"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@types/node": "^22.10.2",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/react": "^14.0.0",
    "eslint": "^9",
    "eslint-config-next": "15.1.2",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "ts-jest": "^29.1.1",
    "typescript": "^5"
  }
}
```

Key dependencies:
- `wagmi` and `viem` for Web3 interactions
- `@tanstack/react-query` for data fetching
- `jest` and `@testing-library` for testing
- `tailwindcss` for styling

## Environment Variables

| Variable                      | Description               | Required |
| ----------------------------- | ------------------------- | -------- |
| NEXT_PUBLIC_RPC_URL           | Ethereum RPC endpoint URL | Yes      |
| NEXT_PUBLIC_ETHERSCAN_API_KEY | Etherscan API key         | Yes      |
| NEXT_PUBLIC_WC_PROJECT_ID     | WalletConnect Project ID  | Yes      |

## Usage

1. Enter a valid Ethereum transaction hash in the input field
2. Click "Decode" to fetch and decode the transaction
3. View the execution trace with expandable contract interactions
4. Click on rows to see detailed method parameters and return values

## Testing

The project uses Jest for testing with TypeScript support. Tests are located in `lib/__tests__/` directory. I was able to write tests for core features like decoding transactions, processing traces, and handling errors. Granted additional time, I would have liked to write more tests for the UI components, but I ran out of time.

### Running Tests

_Reminder to set your environment variables in the `.env` file._ If you want to use a different set of mock endpoints for testing, you can updated the environment variables in the `.env` file directly.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

- Unit tests for Ethereum transaction processing
- Mock implementations for ethers.js providers
- Type-safe test cases for trace data handling
- Error case coverage for invalid inputs

### Example Test Case

```typescript
it('should fetch and decode a basic transaction', async () => {
  mockProvider.getTransaction.mockResolvedValue(mockTx);
  mockProvider.send.mockResolvedValue(null);

  const result = await fetchAndDecodeTransaction(mockTx.hash!);

  expect(result).toMatchObject({
    hash: mockTx.hash,
    from: mockTx.from,
    to: mockTx.to,
    value: mockTx.value?.toString()
  });
});
```

### Test Coverage

- Transaction fetching and decoding
- Trace data processing
- Error handling
- Network interactions
- Contract name resolution

## Limitations

Will update today.

## Trade-offs

Will update today.

## Improvements

Will update today.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
