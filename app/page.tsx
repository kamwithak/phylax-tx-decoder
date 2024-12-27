"use client";

import TransactionInput from "./components/TransactionInput";
import TransactionData from "./components/TransactionData";
import { Transaction } from "@/types/transaction";
import { useState } from "react";

export default function PhylaxTxDecoder() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background p-8">
      <main className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-lg border border-solid border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="border-b dark:border-gray-800 p-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Ethereum Transaction Decoder
            </h1>
          </div>
          <div className="p-6">
            <TransactionInput
              onSubmit={setTransaction}
              setLoading={setLoading}
              setError={setError}
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-solid border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-8 text-center text-gray-600 dark:text-gray-400">
            Loading transaction data...
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-lg border border-solid border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {transaction && <TransactionData transaction={transaction} />}
          </>
        )}
      </main>
    </div>
  );
}
