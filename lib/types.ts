export interface EtherscanTrace {
  from: string;
  to: string;
  value: string;
  type?: string;
  traceId?: string;
}

export interface TraceCall {
  input: string;
  from: string;
  to?: string;
  value?: string;
  output?: string;
  error?: string;
  calls?: TraceCall[];
}

export interface DecodedResult {
  value: string | number | bigint | boolean;
}

export interface KnownSignature {
  name: string;
  types: string[];
  params?: string[];
}

export interface ConvertedTrace {
  from: string;
  to: string;
  value: string;
  input: string;
  calls: {
    from: string;
    to: string;
    value: string;
    input: string;
    type?: string;
    traceId?: string;
  }[];
} 