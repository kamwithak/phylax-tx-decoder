'use client';

import { Transaction } from '@/types/transaction';
import { useState } from 'react';

interface Props {
  transaction: Transaction;
}

export default function TransactionData({ transaction }: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Format the calldata sections
  const formatCalldata = (input: string) => {
    if (!input || input === '0x') return null;
    
    // Split into function selector and parameters
    const selector = input.slice(0, 10);
    const params = input.slice(10);
    
    return {
      selector,
      params: params.match(/.{1,64}/g) || []
    };
  };

  const calldata = formatCalldata(transaction.input);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4">
                {transaction.decodedInput?.methodName || 'Transfer'}
              </td>
              <td className="px-6 py-4 font-mono text-sm">
                {transaction.from}
              </td>
              <td className="px-6 py-4 font-mono text-sm">
                {transaction.to}
              </td>
              <td className="px-6 py-4">
                {transaction.value} ETH
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {calldata && (
        <div className="rounded-lg border divide-y">
          <div className="p-4 bg-gray-50">
            <h3 className="font-semibold">Raw Calldata</h3>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <span className="font-medium">Function Selector:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {calldata.selector}
                </span>
              </div>
              <div className="space-y-1">
                <span className="font-medium">Parameters:</span>
                {calldata.params.map((param, i) => (
                  <div key={i} className="font-mono bg-gray-100 p-2 rounded break-all">
                    {param}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {transaction.decodedInput && (
            <div className="p-4 bg-white">
              <h3 className="font-semibold mb-2">Decoded Parameters</h3>
              <div className="space-y-2">
                {transaction.decodedInput.params.map((param, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="font-medium">{param.name}:</span>
                    <span className="font-mono">{param.value.toString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 