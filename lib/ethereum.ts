import { ethers } from "ethers";
import { Transaction, ExecutionTrace, DecodedParam } from "@/types/transaction";
import {
  KnownSignature,
  ConvertedTrace,
  EtherscanTrace,
  TraceCall,
  DecodedResult,
} from "./types";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

if (!RPC_URL) {
  throw new Error("RPC_URL is a required environment variable");
}

if (!ETHERSCAN_API_KEY) {
  throw new Error("ETHERSCAN_API_KEY is a required environment variable");
}

// Provider initialization with error handling
let provider: ethers.JsonRpcProvider;
try {
  provider = new ethers.JsonRpcProvider(RPC_URL);
} catch (error) {
  throw new Error(
    `Failed to initialize provider: ${error instanceof Error ? error.message : "Unknown error"}`,
  );
}

// Validate provider connection
provider.getNetwork().catch((error) => {
  console.error("Failed to connect to provider:", error);
  throw new Error("Failed to connect to Ethereum network");
});

// Common function signatures for ERC20, ERC721, ERC1155, and other popular standards
const KNOWN_SIGNATURES: Record<string, KnownSignature> = {
  "0xa9059cbb": {
    name: "transfer",
    types: ["address", "uint256"],
    params: ["to", "amount"],
  },
  "0x23b872dd": {
    name: "transferFrom",
    types: ["address", "address", "uint256"],
    params: ["from", "to", "amount"],
  },
  "0x095ea7b3": {
    name: "approve",
    types: ["address", "uint256"],
    params: ["spender", "amount"],
  },
  "0x70a08231": { name: "balanceOf", types: ["address"] },
  "0x18160ddd": { name: "totalSupply", types: [] },
  "0x313ce567": { name: "decimals", types: [] },
  "0x06fdde03": { name: "name", types: [] },
  "0x95d89b41": { name: "symbol", types: [] },
  "0xdd62ed3e": { name: "allowance", types: ["address", "address"] },
  "0x40c10f19": { name: "mint", types: ["address", "uint256"] },
  "0x42966c68": { name: "burn", types: ["uint256"] },
  "0x79cc6790": { name: "burnFrom", types: ["address", "uint256"] },
  "0x3644e515": { name: "DOMAIN_SEPARATOR", types: [] },
  "0x7ecebe00": { name: "nonces", types: ["address"] },
  "0xf2fde38b": {
    name: "transferOwnership",
    types: ["address"],
    params: ["newOwner"],
  },
  // Add more as needed
};

function decodeParameters(types: string[], data: string): DecodedResult[] {
  const abiCoder = new ethers.AbiCoder();
  try {
    return abiCoder.decode(types, "0x" + data);
  } catch (error) {
    console.error("Failed to decode parameters:", error);
    return [];
  }
}

export async function fetchAndDecodeTransaction(
  hash: string,
): Promise<Transaction> {
  if (!hash.match(/^0x[a-fA-F0-9]{64}$/)) {
    throw new Error("Invalid transaction hash format");
  }

  try {
    const tx = await provider.getTransaction(hash);
    if (!tx) throw new Error("Transaction not found");

    // Basic transaction data
    const transaction: Transaction = {
      hash: tx.hash,
      from: tx.from,
      to: tx.to || "",
      value: ethers.formatEther(tx.value),
      input: tx.data,
    };

    // Try RPC trace first, then fallback to Etherscan
    let traceData = null;

    // Try RPC provider first
    try {
      console.log("Fetching trace data from RPC for:", hash);
      traceData = await provider.send("debug_traceTransaction", [
        hash,
        {
          tracer: "callTracer",
          tracerConfig: {
            onlyTopCall: false,
            withLog: true,
          },
        },
      ]);
      console.log("RPC trace data type:", typeof traceData);
      console.log("RPC trace data:", JSON.stringify(traceData, null, 2));
    } catch (error) {
      console.warn("RPC trace failed, trying Etherscan:", error);
    }

    // Fallback to Etherscan if RPC failed or returned no data
    if (!traceData && ETHERSCAN_API_KEY) {
      try {
        console.log("Fetching trace data from Etherscan");
        const rawEtherscanData = await getTraceFromEtherscan(hash);
        console.log(
          "Raw Etherscan data:",
          JSON.stringify(rawEtherscanData, null, 2),
        );
        traceData = convertEtherscanTrace(rawEtherscanData);
        console.log(
          "Converted Etherscan trace:",
          JSON.stringify(traceData, null, 2),
        );
      } catch (error) {
        console.error("Etherscan trace failed:", error);
      }
    }

    // Process trace data if we got it from either source
    if (traceData) {
      try {
        const traces = processTraceData(traceData);
        console.log("Processed traces:", traces);
        if (traces.length > 0) {
          transaction.trace = traces;
        }
      } catch (error) {
        console.error("Failed to process trace data:", error);
      }
    } else {
      console.warn("No trace data available from any source");
    }

    // Decode input data
    if (tx.data && tx.data !== "0x") {
      try {
        const selector = tx.data.slice(0, 10).toLowerCase();
        const params = tx.data.slice(10);

        const signature = KNOWN_SIGNATURES[selector];
        if (signature) {
          transaction.decodedInput = {
            methodName: signature.name,
            params: signature.params
              ? decodeCallParams(signature.types, signature.params, params)
              : [],
          };
        } else {
          transaction.decodedInput = {
            methodName: `Unknown (${selector})`,
            params: [],
          };
        }
      } catch (error) {
        console.error("Failed to decode input data:", error);
      }
    }

    return transaction;
  } catch (error) {
    throw new Error(
      `Failed to fetch transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export function processTraceData(trace: TraceCall): ExecutionTrace[] {
  if (!trace || typeof trace !== "object") {
    throw new Error("Invalid trace data format");
  }

  const processCall = (call: TraceCall, depth: number = 0): ExecutionTrace => {
    try {
      if (!call.input) {
        throw new Error("Missing input in trace call");
      }

      const selector = safeHexDecode(call.input, 0, 10).toLowerCase();
      const signature = KNOWN_SIGNATURES[selector];

      return {
        contractAddress: call.to ? validateAddress(call.to) : "0x",
        methodId: selector,
        methodName: signature?.name || `Unknown (${selector})`,
        depth,
        from: validateAddress(call.from),
        to: call.to ? validateAddress(call.to) : "",
        value: ethers.formatEther(call.value || "0"),
        input: call.input,
        output: call.output,
        error: call.error,
        decodedInput: signature
          ? {
              methodName: signature.name,
              params: signature.params
                ? decodeCallParams(
                    signature.types,
                    signature.params,
                    call.input.slice(10),
                  )
                : [],
            }
          : undefined,
      };
    } catch (error) {
      throw new Error(
        `Failed to process call: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const flattenCalls = (
    call: TraceCall,
    depth: number = 0,
  ): ExecutionTrace[] => {
    const current = processCall(call, depth);
    const childCalls =
      call.calls?.flatMap((c) => flattenCalls(c, depth + 1)) || [];
    return [current, ...childCalls];
  };

  return flattenCalls(trace);
}

function decodeCallParams(
  types: string[],
  paramNames: string[],
  data: string,
): DecodedParam[] {
  try {
    const decodedParams = decodeParameters(types, data);
    return types.map((type, index) => ({
      name: paramNames[index] || `param${index + 1}`,
      type,
      value: decodedParams[index],
    }));
  } catch (error) {
    console.error("Failed to decode parameters:", error);
    return [];
  }
}

async function getTraceFromEtherscan(hash: string): Promise<EtherscanTrace[]> {
  try {
    const response = await fetch(`/api/tx-trace?hash=${hash}`);
    const data = await response.json();

    console.log("Etherscan API response:", data);

    if (data.status === "1" && Array.isArray(data.result)) {
      return data.result;
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch trace data:", error);
    return [];
  }
}

function convertEtherscanTrace(
  etherscanTrace: EtherscanTrace[],
): ConvertedTrace | null {
  if (!Array.isArray(etherscanTrace) || etherscanTrace.length === 0) {
    return null;
  }

  return {
    from: etherscanTrace[0].from,
    to: etherscanTrace[0].to,
    value: etherscanTrace[0].value,
    input: "0x",
    calls: etherscanTrace.slice(1).map((trace) => ({
      from: trace.from,
      to: trace.to,
      value: trace.value,
      input: "0x",
      type: trace.type,
      traceId: trace.traceId,
    })),
  };
}

// Helper function to safely decode hex values
function safeHexDecode(hex: string, start: number, length: number): string {
  try {
    if (!hex.startsWith("0x")) {
      throw new Error("Input must start with 0x");
    }
    return hex.slice(start, start + length);
  } catch (error) {
    throw new Error(
      `Failed to decode hex: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Helper function to validate and normalize addresses
function validateAddress(address: string): string {
  try {
    return ethers.getAddress(address);
  } catch (error) {
    throw new Error(
      `Invalid Ethereum address: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
