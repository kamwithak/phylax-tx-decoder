# Phylax Systems - Transaction Decoder

A crypto app for decoding/visualizing ETH traces via a nested table visualization.

<img width="2049" alt="Screenshot 2024-12-27 at 4 32 43 PM" src="https://github.com/user-attachments/assets/e6ba6b8e-2689-4ab9-a294-70654a4590c7" />
<img width="1057" alt="Screenshot 2024-12-27 at 4 33 50 PM" src="https://github.com/user-attachments/assets/f4997291-9134-453f-b313-5eb87e711c3a" />

[Etherescan decoder tool used as inspiration](https://etherscan.io/tx-decoder?tx=0x3346fb99ba272d13dff23d17a045d491d5d55dd46b01cb5ee1ac7e4df7695746)

## Features

- Decode transaction data and method calls via a user inputed transaction address
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
git clone https://github.com/kamwithak/phylax-tx-decoder
cd phylax-tx-decoder
```

2. Install dependencies:

```bash
yarn install
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
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/                  # API routes
│   ├── components/           # React components
│   │   ├── AddressDisplay    # Wallet address formatting
│   │   ├── ConnectButton     # Wallet connection UI
│   │   ├── ExecutionTrace    # Transaction trace visualization
│   │   ├── Footer            # Site footer
│   │   ├── NavBar            # Navigation with external links
│   │   ├── TransactionData   # Transaction details display
│   │   └── TransactionInput  # Hash input form
│   ├── hooks/                # Custom React hooks
│   │   └── useContractNames  # Contract name fetching
│   ├── config.ts             # Wagmi configuration
│   ├── providers.tsx         # React providers setup
│   └── layout.tsx            # Root layout with providers
├── lib/
│   ├── __tests__/            # Jest test files
│   ├── ethereum.ts           # Core transaction processing
│   └── types.ts              # Shared type definitions
├── types/
│   └── transaction.ts        # Transaction-specific types
├── jest.setup.ts             # Test configuration
└── package.json              # Project dependencies
```

Key directories:
- `app/`: Next.js 13+ app directory structure
- `lib/`: Core business logic and utilities
- `types/`: TypeScript type definitions
- `__tests__/`: Jest test files and mocks

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

_Reminder to set your environment variables in the `.env` file._ If you'd like to use a different set of mock endpoints for testing, you may update the `.env` file directly with your mock env variables.

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test -- --coverage
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

### Core Test Coverage

- Transaction fetching and decoding
- Trace data processing
- Error handling
- Network interactions
- Contract name resolution

## UI manual tests

**Success:**
- Transfer ownership call on ERC721: `0xd03bd194e881853df4d56c2a11291dd48fcce39cb0f1e1eaac0d3f0864534d33`
- Approve call on ERC20: `0x318b46e4556528137abf377475d6f082b377997a25ac6c849b9b4b0da5f16aab`
- Transfer call on ERC20: `0x3346fb99ba272d13dff23d17a045d491d5d55dd46b01cb5ee1ac7e4df7695746`
- Transfer call on ERC20: `0x5fbb01c81068a3cbd69a4fa696db3bafd0afc4dfb7313f2dfbd2ea3be73fb710`

**Failure:**
- Flash loan: `0x59405648254f43df953137df40000abcc4193e948fe2d8f7c971213a0d236102`
- Withdraw: `0xef2af67c7b1d2d08d11f25238eead77a77e5f93e742025d32ec6cf9357343fed`

I am pasting these ^ failed tx addresses to bring clarity to the cases where the application breaks.

To understand why, please read below. Granted more time, I'd want to gracefully handle these cases to provide a better UX.

## Limitations and Improvements

You will notice that the more complicated transactions are not fully decoded. This is due to the fact that we define KNOWN_SIGNATURES in the `ethereum.ts` file. We hardcode a map of known signatures for common ERC20, ERC721, etc. transactions. This is not a comprehensive list and will not work for all transactions

Another limitation is that not all nodes support the `debug_traceTransaction` RPC call. This could be addressed in the future by using a different method to fetch transaction traces. For instance, we could use a more sophisticated method to decode transactions that go beyond the known signatures by using a third-party tool or api service for retrieving a longer list of known signatures.

Given the fallback method, we are using Etherscan's API to fetch transaction traces. This inherently poses a limitation in that we are limited to the number of requests we can make to the Etherscan API, ie) hitting a rate limit. Or perhaps, if the endpoint is down, we are unable to fetch the transaction traces via our fallback mechanism.

A fourth limitation is that the application is not fully responsive. It is a single-page application and does not support mobile views. This is a known limitation and could be addressed in the future by giving breakpoints and further consideration for mobile v.s tablet v.s desktop views. This application is not fully responsive to all screen sizes, and was generally built purely as a desktop web application. Granted more time, I would just want to restrict users to use their desktop to view and make use of the application. Skipping that for sake of expediency.

I think it is obvious that I skipped the part of creating my own base components and base styling for commonly used components. In a production application, I would want to use a styled component library like `MUI` or `Shadcn` (or) perhaps `TailwindCSS` + unstyled components such as `HeadlessUI` or `RadixUI`. I think that defining base components such as buttons, selectors, dialogs, forms, inputs - etc. is a good way to ensure consistency and maintainability of the application. If I approached this application similiarly to [REPOSITORY](https://github.com/kamwithak/arrakis-vaults-flow/tree/main/app/pages/DepositPage) - I would have created a base component library for the application, respective pages to take advantage of server-side rendering that we get from NextJS, and then consume my client-side base components within each respective page to ensure server-side rendering performance and maintainability of the application across pages generally.

Future proofing us in the event that we want to publicly share our own components library with the community. In the interest of time, I decided to skip that step and reference that this was a trade-off for expediency. But most definitely, important to address where components are being reused/redefined and where we could instead avoid repeating ourselves. I would suggest stateless components and a proper state management system such as `Zustand` or `Redux` to manage and persist state across the application. In our current application, we are not persisting state across sessions [ie) reading/writing to localstorage], nor taking advantage of caching mechanisms (that we get with NextJS) to improve performance given our two required endpoints defined in `/app/api/*`.

For sake of expediency, I did not introduce a proper form validation system. I would suggest using `react-hook-form` w/ `zod` to validate the input fields and provide feedback to the user. For instance, string/number validation, length validation, etc. Granted more time, I would have liked to implement a proper form validation system to ensure that the user enters a valid Ethereum transaction hash. For the time being, I have added a basic check to ensure that the user strictly enters a valid Ethereum transaction hash using REGEX and directly display a tooltip message to the user in the case that they haven't. `RHF` is a well known library and would have been a great choice to implement a proper form validation system.

I had the time to include basic wallet connect functionality, however, it is not a required feature for this application and also out of scope given the problem requirements. Though, for completion - it was a good exercise to implement and demonstrate the use of `wagmi` w/ `viem`. The user's injected provider ie) `MetaMask` and `WalletConnect` are supported in this application as per our `config.ts`. It is relatively easy to integrate `RainbowKit` from this point, however, I decided to skip that for sake of expediency. If you are curious to discuss more about `RainbowKit` and other interesting social (web2) wallet integrations [ie) `Web3Auth` and `Magic`], I'd be happy to discuss in our follow-up interview. It is also possible to feature gate the main page application from those who are not able to successfully connect their wallets. Skipping that for sake of expediency.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
