import { ethers } from 'ethers';
import { Transaction, ExecutionTrace, DecodedParam } from '@/types/transaction';

// TODO: force environment file to be set and proper error handling if otherwise
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.public-rpc.com';
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Common function signatures for ERC20, ERC721, ERC1155, and other popular standards
const KNOWN_SIGNATURES: Record<string, { name: string, types: string[], params?: string[] }> = {
  '0xa9059cbb': { 
    name: 'transfer', 
    types: ['address', 'uint256'],
    params: ['to', 'amount']
  },
  '0x23b872dd': { 
    name: 'transferFrom', 
    types: ['address', 'address', 'uint256'],
    params: ['from', 'to', 'amount']
  },
  '0x095ea7b3': { 
    name: 'approve', 
    types: ['address', 'uint256'],
    params: ['spender', 'amount']
  },
  '0x70a08231': { name: 'balanceOf', types: ['address'] },
  '0x18160ddd': { name: 'totalSupply', types: [] },
  '0x313ce567': { name: 'decimals', types: [] },
  '0x06fdde03': { name: 'name', types: [] },
  '0x95d89b41': { name: 'symbol', types: [] },
  '0xdd62ed3e': { name: 'allowance', types: ['address', 'address'] },
  '0x40c10f19': { name: 'mint', types: ['address', 'uint256'] },
  '0x42966c68': { name: 'burn', types: ['uint256'] },
  '0x79cc6790': { name: 'burnFrom', types: ['address', 'uint256'] },
  '0x3644e515': { name: 'DOMAIN_SEPARATOR', types: [] },
  '0x7ecebe00': { name: 'nonces', types: ['address'] },
  // Add more as needed
};

function decodeParameters(types: string[], data: string): any[] {
  const abiCoder = new ethers.AbiCoder();
  try {
    return abiCoder.decode(types, '0x' + data);
  } catch (error) {
    console.error('Failed to decode parameters:', error);
    return [];
  }
}

export async function fetchAndDecodeTransaction(hash: string): Promise<Transaction> {
  const tx = await provider.getTransaction(hash);
  if (!tx) throw new Error('Transaction not found');

  // Basic transaction data
  const transaction: Transaction = {
    hash: tx.hash,
    from: tx.from,
    to: tx.to || '',
    value: ethers.formatEther(tx.value),
    input: tx.data,
  };

  // Fetch trace data
  try {
    const trace = await provider.send('debug_traceTransaction', [hash, {
      tracer: 'callTracer',
      tracerConfig: {
        onlyTopCall: false,
        withLog: true,
      },
    }]);

    // Process trace into our format
    transaction.trace = processTraceData(trace);
  } catch (error) {
    console.error('Failed to fetch trace data:', error);
  }

  // Try to decode the input data if it exists
  if (tx.data && tx.data !== '0x') {
    try {
      const selector = tx.data.slice(0, 10).toLowerCase();
      const params = tx.data.slice(10);
      
      const signature = KNOWN_SIGNATURES[selector];
      if (signature) {
        const decodedParams = decodeParameters(signature.types, params);
        
        transaction.decodedInput = {
          methodName: signature.name,
          params: signature.types.map((type, index) => ({
            name: `param${index + 1}`,
            type,
            value: decodedParams[index]
          }))
        };
      } else {
        transaction.decodedInput = {
          methodName: `Unknown (${selector})`,
          params: []
        };
      }
    } catch (error) {
      console.error('Failed to decode input data:', error);
    }
  }

  return transaction;
}

function processTraceData(trace: any): ExecutionTrace[] {
  const processCall = (call: any, depth: number = 0): ExecutionTrace => {
    const selector = call.input.slice(0, 10).toLowerCase();
    const signature = KNOWN_SIGNATURES[selector];

    return {
      contractName: call.to || 'Unknown Contract',
      methodId: selector,
      methodName: signature?.name || `Unknown (${selector})`,
      depth,
      from: call.from,
      to: call.to,
      value: ethers.formatEther(call.value || '0'),
      input: call.input,
      output: call.output,
      error: call.error,
      decodedInput: signature ? {
        methodName: signature.name,
        params: signature.params ? decodeCallParams(signature.types, signature.params, call.input.slice(10)) : []
      } : undefined
    };
  };

  const flattenCalls = (call: any, depth: number = 0): ExecutionTrace[] => {
    const current = processCall(call, depth);
    const childCalls = call.calls?.flatMap((c: any) => flattenCalls(c, depth + 1)) || [];
    return [current, ...childCalls];
  };

  return flattenCalls(trace);
}

function decodeCallParams(types: string[], paramNames: string[], data: string): DecodedParam[] {
  try {
    const decodedParams = decodeParameters(types, data);
    return types.map((type, index) => ({
      name: paramNames[index] || `param${index + 1}`,
      type,
      value: decodedParams[index]
    }));
  } catch (error) {
    console.error('Failed to decode parameters:', error);
    return [];
  }
} 