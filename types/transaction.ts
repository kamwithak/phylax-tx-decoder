export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  input: string;
  decodedInput?: DecodedInput;
  trace?: ExecutionTrace[];
}

export interface ExecutionTrace {
  contractAddress: string;
  methodId: string;
  methodName?: string;
  depth: number;
  from: string;
  to: string;
  value: string;
  input: string;
  output?: string;
  error?: string;
  decodedInput?: {
    methodName: string;
    params: DecodedParam[];
  };
  type?: string;
}

export interface DecodedInput {
  methodName: string;
  params: DecodedParam[];
  childCalls?: DecodedInput[];
}

export interface DecodedParam {
  name: string;
  type: string;
  value: any;
}

export interface ContractNames {
  [key: string]: {
    name: string;
    isLoading: boolean;
    error?: string;
  };
}