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
  contractName: string;
  methodId: string;
  methodName: string;
  depth: number;
  from: string;
  to: string;
  value: string;
  input: string;
  decodedInput?: DecodedInput;
  output?: string;
  error?: string;
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