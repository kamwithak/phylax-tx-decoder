'use client';

import { useState } from 'react';
import type { ExecutionTrace } from '@/types/transaction';
import { useContractNames } from '../hooks/useContractNames';

export default function ExecutionTrace({ traces }: { traces: ExecutionTrace[] }) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Get unique addresses from traces
  const addresses = Array.from(new Set(
    traces
      .filter(trace => trace.contractAddress)
      .map(trace => trace.contractAddress as string)
  ));
  
  const contractNames = useContractNames(addresses);

  const toggleRow = (traceId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(traceId)) {
      newExpanded.delete(traceId);
    } else {
      newExpanded.add(traceId);
    }
    setExpandedRows(newExpanded);
  };

  const formatValue = (value: string) => {
    return parseFloat(value) > 0 ? `${value} ETH` : '';
  };

  const renderContractName = (address: string | undefined) => {
    if (!address) return 'Contract';
    
    const contractInfo = contractNames[address];
    if (!contractInfo) return address;

    return (
      <span className="flex items-center gap-2">
        {contractInfo.isLoading ? (
          <>
            <span className="animate-pulse">Loading...</span>
            <span className="text-xs text-gray-400">{address}</span>
          </>
        ) : (
          <>
            <span>{contractInfo.name}</span>
            {contractInfo.name !== address && (
              <span className="text-xs text-gray-400">({address.slice(0, 6)}...{address.slice(-4)})</span>
            )}
          </>
        )}
      </span>
    );
  };

  const renderTrace = (trace: ExecutionTrace) => {
    if (!trace.decodedInput) {
      console.error('Decoded input is undefined for trace:', trace);
      return null;
    }

    const traceId = `${trace.depth}-${trace.methodId}-${trace.to}`;
    const isExpanded = expandedRows.has(traceId);
    const paddingLeft = `${trace.depth * 1.5}rem`;
    const isTopLevel = trace.depth === 0;

    return (
      <div 
        key={traceId} 
        style={{ paddingLeft }}
        className={`border-l-2 ${trace.depth > 0 ? 'border-gray-200 dark:border-gray-700' : 'border-transparent'}`}
      >
        <div 
          className={`
            flex items-center gap-2 py-2 px-4 
            cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800
            ${trace.error ? 'bg-red-50 dark:bg-red-900/20' : ''}
          `}
          onClick={() => toggleRow(traceId)}
        >
          <span className="text-gray-500 dark:text-gray-400 w-4">
            {isExpanded ? '▼' : '▶'}
          </span>
          <div className="font-mono text-sm flex-1">
            <span className="text-blue-600 dark:text-blue-400">
              {renderContractName(trace.contractAddress)}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              .{trace.methodId}()
            </span>
          </div>
          {formatValue(trace.value) && (
            <span className="text-green-600 dark:text-green-400 ml-2">
              {formatValue(trace.value)}
            </span>
          )}
        </div>

        {isExpanded && (
          <div className="ml-8 mt-2 mb-4 text-sm font-mono">
            <div className="flex items-center gap-2">
                {/* TODO: CallType component for Call, DelegateCall, StaticCall and Event */}
              <span className="text-green-500 px-2 border border-green-500 rounded">
                {trace.type || 'CALL'}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {trace.contractAddress}.{trace.decodedInput.methodName}(
                {trace.decodedInput?.params.map((param, i) => (
                  <span key={i} className="text-gray-700 dark:text-gray-300">
                    {i > 0 && ', '}
                    {param.name}: {param.type} = {formatParam(param.value)}
                  </span>
                ))}
                )
                {trace.output && !trace.error && (
                    <span className="text-green-600 dark:text-green-400 px-2">
                    → {formatOutput(trace.output)}
                    </span>
                )}
              </span>
              {trace.error && (
                <span className="text-red-600 dark:text-red-400">
                  ⚠️ {trace.error}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatParam = (value: string | number | bigint | boolean): string => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value.toString();
  };

  const formatOutput = (output: string): string => {
    if (output.length > 20) {
      return `${output.slice(0, 10)}...${output.slice(-8)}`;
    }
    return output;
  };

  return (
    <div className="rounded-lg border border-solid border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="border-b dark:border-gray-800 p-4">
        <h2 className="text-lg font-semibold">Execution Trace</h2>
      </div>
      <div className="divide-y dark:divide-gray-800">
        {traces.map(renderTrace)}
      </div>
    </div>
  );
} 