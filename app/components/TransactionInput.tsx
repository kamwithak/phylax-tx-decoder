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
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          pattern="^0x[a-fA-F0-9]{64}$"
          title="Please enter a valid transaction hash (0x followed by 64 hexadecimal characters)"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Decode
        </button>
      </div>
    </form>
  );
} 