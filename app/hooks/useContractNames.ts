"use client";

import { ContractNames } from "@/types/transaction";
import { useState, useEffect, useCallback } from "react";

export function useContractNames(addresses: string[]) {
  const [contractNames, setContractNames] = useState<ContractNames>({});
  const [fetchedAddresses, setFetchedAddresses] = useState<Set<string>>(
    new Set(),
  );

  const fetchContractName = useCallback(
    async (address: string) => {
      if (
        fetchedAddresses.has(address) ||
        contractNames[address]?.isLoading ||
        contractNames[address]?.name
      ) {
        return;
      }

      setFetchedAddresses((prev) => new Set(prev).add(address));
      setContractNames((prev) => ({
        ...prev,
        [address]: { name: address, isLoading: true },
      }));

      try {
        const response = await fetch(`/api/contract-name?address=${address}`);
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        setContractNames((prev) => ({
          ...prev,
          [address]: {
            name: data.contractName || address,
            isLoading: false,
          },
        }));
      } catch (error) {
        console.error("Error fetching contract name:", error);
        setContractNames((prev) => ({
          ...prev,
          [address]: {
            name: address,
            isLoading: false,
            error: "Failed to fetch contract name",
          },
        }));
      }
    },
    [fetchedAddresses, contractNames],
  );

  useEffect(() => {
    addresses.forEach((address) => {
      if (address) fetchContractName(address);
    });
  }, [addresses, fetchContractName]);

  return contractNames;
}
