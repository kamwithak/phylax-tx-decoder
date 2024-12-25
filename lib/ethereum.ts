import { ethers } from 'ethers';
import { Transaction } from '@/types/transaction';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.public-rpc.com';
const provider = new ethers.JsonRpcProvider(RPC_URL);


// Common ERC20 and other frequently used function signatures
const KNOWN_SIGNATURES: Record<string, { name: string, types: string[] }> = {
  '0xa9059cbb': { name: 'transfer', types: ['address', 'uint256'] },
  '0x23b872dd': { name: 'transferFrom', types: ['address', 'address', 'uint256'] },
  '0x095ea7b3': { name: 'approve', types: ['address', 'uint256'] },
  '0x70a08231': { name: 'balanceOf', types: ['address'] },
  // Add more common signatures as needed
  // TODO: use API to get common signatures across contracts
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