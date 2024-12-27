"use client";

import { Transaction } from "@/types/transaction";
import ExecutionTrace from "./ExecutionTrace";

interface Props {
  transaction: Transaction;
}

export default function TransactionData({ transaction }: Props) {
  const formatCalldata = (input: string) => {
    if (!input || input === "0x") return null;
    const selector = input.slice(0, 10);
    const params = input.slice(10);
    return {
      selector,
      params: params.match(/.{1,64}/g) || [],
    };
  };

  const calldata = formatCalldata(transaction.input);

  return (
    <div className="space-y-8">
      {/* Execution Trace */}
      {transaction.trace && transaction.trace.length > 0 && (
        <ExecutionTrace traces={transaction.trace} />
      )}

      {/* Transaction Overview */}
      <div className="rounded-lg border border-solid border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="border-b dark:border-gray-800 p-4">
          <h2 className="text-lg font-semibold">Transaction Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              <tr>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                  {transaction.decodedInput?.methodName || "Transfer"}
                </td>
                <td className="px-6 py-4 font-mono text-sm text-gray-700 dark:text-gray-300">
                  {transaction.from}
                </td>
                <td className="px-6 py-4 font-mono text-sm text-gray-700 dark:text-gray-300">
                  {transaction.to}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                  {transaction.value} ETH
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Calldata Section */}
      {calldata && (
        <div className="rounded-lg border border-solid border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="border-b dark:border-gray-800 p-4">
            <h2 className="text-lg font-semibold">Transaction Data</h2>
          </div>
          <div className="divide-y dark:divide-gray-800">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Raw Calldata</h3>
              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Function Selector:
                  </span>
                  <span className="font-mono bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded text-gray-700 dark:text-gray-300">
                    {calldata.selector}
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Parameters:
                  </span>
                  {calldata.params.map((param, i) => (
                    <div
                      key={i}
                      className="font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded break-all text-gray-700 dark:text-gray-300"
                    >
                      {param}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {transaction.decodedInput && (
              <div className="p-4">
                <h3 className="font-semibold mb-4">Decoded Parameters</h3>
                <div className="space-y-2">
                  {transaction.decodedInput.params.map((param, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[120px,1fr] gap-4"
                    >
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        {param.name}:
                      </span>
                      <span className="font-mono text-gray-700 dark:text-gray-300 break-all">
                        {param.value.toString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
