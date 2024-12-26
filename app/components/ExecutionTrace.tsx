'use client';

import { useState } from 'react';
import type { ExecutionTrace } from '@/types/transaction';

interface Props {
  traces: ExecutionTrace[];
}

export default function ExecutionTrace({ traces }: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const renderTrace = (trace: ExecutionTrace) => {
    if (!trace.decodedInput) {
      console.error('Decoded input is undefined for trace:', trace);
      return null;
    }

    const traceId = `${trace.depth}-${trace.methodId}-${trace.to}`;
    const isExpanded = expandedRows.has(traceId);
    const hasDecodedInput = trace.decodedInput.params.length > 0;
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
            ${hasDecodedInput ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
            ${trace.error ? 'bg-red-50 dark:bg-red-900/20' : ''}
            ${isTopLevel ? 'bg-gray-50 dark:bg-gray-800' : ''}
          `}
          onClick={() => hasDecodedInput && toggleRow(traceId)}
        >
          {hasDecodedInput && (
            <span className="text-gray-500 dark:text-gray-400 w-4">
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          <div className="font-mono text-sm flex-1">
            <span className={`text-blue-600 dark:text-blue-400 ${isTopLevel ? 'text-base' : ''}`}>
              {trace.contractName}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              .{trace.methodId}(
            </span>
            {trace.decodedInput?.params.map((param, i) => (
              <span key={i} className="text-gray-700 dark:text-gray-300">
                {i > 0 && ', '}
                {param.name}={formatParam(param.value)}
              </span>
            ))}
            <span className="text-gray-500 dark:text-gray-400">)</span>
            {formatValue(trace.value) && (
              <span className="text-green-600 dark:text-green-400 ml-2">
                {formatValue(trace.value)}
              </span>
            )}
            {trace.output && !trace.error && (
              <span className="text-green-600 dark:text-green-400 ml-2">
                → {formatOutput(trace.output)}
              </span>
            )}
            {trace.error && (
              <span className="text-red-500 dark:text-red-400 ml-2">
                ⚠️ {trace.error}
              </span>
            )}
          </div>
        </div>

        {isExpanded && hasDecodedInput && (
          <div className="ml-8 mt-2 mb-4 space-y-2 text-sm">
            <div className="text-gray-500 dark:text-gray-400">
              Method: {trace.methodName || trace.methodId}
            </div>
            {trace.decodedInput.params.map((param, index) => (
              <div key={index} className="grid grid-cols-[120px,1fr] gap-4">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  {param.name}:
                </span>
                <span className="font-mono break-all">
                  {formatParam(param.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const formatParam = (value: any): string => {
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
    <div className="rounded-lg border bg-white dark:bg-gray-900 overflow-hidden">
      <div className="border-b dark:border-gray-800 p-4">
        <h2 className="text-lg font-semibold">Execution Trace</h2>
      </div>
      <div className="divide-y dark:divide-gray-800">
        {traces.map(renderTrace)}
      </div>
    </div>
  );
} 