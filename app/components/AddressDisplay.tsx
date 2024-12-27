"use client";

interface AddressDisplayProps {
  address: string;
}

export default function AddressDisplay({ address }: AddressDisplayProps) {
  return (
    <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-sm">
      {address.slice(0, 6)}...{address.slice(-4)}
    </span>
  );
}
