'use client';

import { useState } from 'react';
import { fetchAndDecodeTransaction } from '@/lib/ethereum';
import { Transaction } from '@/types/transaction';

interface Props {
  onSubmit: (transaction: Transaction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export default function TransactionInput({ onSubmit, setLoading, setError }: Props) {
  const [hash, setHash] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const transaction = await fetchAndDecodeTransaction(hash);
      onSubmit(transaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder="Enter transaction hash"
          className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
            rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
            text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400
            transition-colors"
          pattern="^0x[a-fA-F0-9]{64}$"
          title="Please enter a valid transaction hash (0x followed by 64 hexadecimal characters)"
          required
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg
            transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900"
        >
          Decode
        </button>
      </div>
    </form>
  );
} 