import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { ethers } from 'ethers';
import { fetchAndDecodeTransaction, processTraceData } from '../ethereum';
import type { TraceCall } from '../types';
import { Network } from 'ethers';
import { TransactionResponse } from 'ethers';

interface MockProvider extends Partial<ethers.JsonRpcProvider> {
  getTransaction: jest.MockedFunction<() => Promise<TransactionResponse | null>>;
  send: jest.MockedFunction<() => Promise<unknown>>;
  getNetwork: jest.MockedFunction<() => Promise<Network>>;
}

jest.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: jest.fn(),
    formatEther: jest.fn((value: string | number) => value.toString()),
    getAddress: jest.fn((addr: string) => addr),
    AbiCoder: jest.fn(() => ({
      decode: jest.fn()
    }))
  }
}));

describe('ethereum.ts', () => {
  let mockProvider: MockProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockNetwork = {
      name: 'mainnet',
      chainId: BigInt(1),
      toJSON: () => ({ name: 'mainnet', chainId: 1 }),
      matches: (other: Network) => other.chainId === BigInt(1),
      attachPlugin: jest.fn(),
      plugins: {},
    } as unknown as Network;
    
    mockProvider = {
      getTransaction: jest.fn(),
      send: jest.fn(),
      getNetwork: jest.fn(() => Promise.resolve(mockNetwork))
    };

    (ethers.JsonRpcProvider as jest.Mock).mockImplementation(() => mockProvider);
  });

  describe('fetchAndDecodeTransaction', () => {
    const mockTx: Partial<TransactionResponse> = {
      hash: '0x123...',
      from: '0xsender',
      to: '0xrecipient',
      value: BigInt('1000000000000000000'), // 1 ETH
      data: '0xa9059cbb0000000000000000000000001234...', // ERC20 transfer
      chainId: BigInt(1),
      nonce: 0,
      gasLimit: BigInt(21000),
      gasPrice: BigInt(1000000000),
      blockNumber: 1,
      blockHash: '0x...',
      index: 0,
    };

    it('should fetch and decode a basic transaction', async () => {
      mockProvider.getTransaction.mockResolvedValue(mockTx as TransactionResponse);
      mockProvider.send.mockResolvedValue(null);

      const result = await fetchAndDecodeTransaction(mockTx.hash!);

      expect(result).toMatchObject({
        hash: mockTx.hash,
        from: mockTx.from,
        to: mockTx.to,
        value: mockTx.value?.toString()
      });
    });

    it('should handle RPC trace data when available', async () => {
      const mockTraceData: TraceCall = {
        from: '0xsender',
        to: '0xcontract',
        input: '0xa9059cbb000000000000000000000000...',
        value: '0',
        calls: []
      };

      mockProvider.getTransaction.mockResolvedValue(mockTx as TransactionResponse);
      mockProvider.send.mockResolvedValue(mockTraceData);

      const result = await fetchAndDecodeTransaction(mockTx.hash!);

      expect(result.trace).toBeDefined();
      expect(mockProvider.send).toHaveBeenCalledWith('debug_traceTransaction', [
        mockTx.hash,
        expect.any(Object)
      ]);
    });

    it('should handle invalid transaction hashes', async () => {
      await expect(fetchAndDecodeTransaction('invalid-hash'))
        .rejects
        .toThrow('Invalid transaction hash format');
    });

    it('should handle missing transactions', async () => {
      mockProvider.getTransaction.mockResolvedValue(null);

      await expect(fetchAndDecodeTransaction(mockTx.hash!))
        .rejects
        .toThrow('Transaction not found');
    });
  });

  describe('processTraceData', () => {
    const mockTrace: TraceCall = {
      from: '0xsender',
      to: '0xcontract',
      input: '0xa9059cbb000000000000000000000000...',
      value: '1000000000000000000',
      calls: [
        {
          from: '0xcontract',
          to: '0xtoken',
          input: '0x70a08231000000000000000000000000...',
          value: '0'
        }
      ]
    };

    it('should process trace data correctly', () => {
      if (!mockTrace.calls) {
        throw new Error('Missing calls in mockTrace');
      }

      const result = processTraceData(mockTrace);

      expect(result).toHaveLength(2); // Parent + child call
      expect(result[0]).toMatchObject({
        contractAddress: mockTrace.to,
        from: mockTrace.from,
        depth: 0
      });
      expect(result[1]).toMatchObject({
        contractAddress: mockTrace.calls[0].to,
        from: mockTrace.calls[0].from,
        depth: 1
      });
    });

    it('should handle trace data without calls', () => {
      const simpleTrace: TraceCall = {
        from: '0xsender',
        to: '0xcontract',
        input: '0xa9059cbb',
        value: '0'
      };

      const result = processTraceData(simpleTrace);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        contractAddress: simpleTrace.to,
        from: simpleTrace.from,
        depth: 0
      });
    });

    it('should handle invalid trace data', () => {
      expect(() => processTraceData(null as unknown as TraceCall))
        .toThrow('Invalid trace data format');
    });

    it('should handle missing input in trace call', () => {
      const invalidTrace: Partial<TraceCall> = {
        from: '0xsender',
        to: '0xcontract',
        value: '0'
      };

      expect(() => processTraceData(invalidTrace as TraceCall))
        .toThrow('Missing input in trace call');
    });
  });
}); 