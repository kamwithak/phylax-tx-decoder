'use client';

import { useState } from 'react';
import { Transaction } from '@/types/transaction';
import TransactionInput from './components/TransactionInput';
import TransactionData from './components/TransactionData';

export default function Home() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Ethereum Transaction Decoder
        </h1>
        
        <TransactionInput
          onSubmit={setTransaction}
          setLoading={setLoading}
          setError={setError}
        />

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center">
            Loading transaction data...
          </div>
        )}

        {transaction && (
          <TransactionData transaction={transaction} />
        )}
      </main>
    </div>
  );
}
