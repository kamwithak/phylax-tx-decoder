import { ExecutionTrace } from "@/types/transaction";

export function getAddressesFromTraces(traces: ExecutionTrace[]) {
  return Array.from(
    new Set(
      traces
        .filter((trace) => trace.contractAddress)
        .map((trace) => trace.contractAddress as string),
    ),
  );
}
