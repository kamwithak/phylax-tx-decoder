import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock fetch globally
const mockFetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    headers: new Headers(),
  } as Response)
);

global.fetch = mockFetch as unknown as typeof fetch;

// Mock console methods
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
} as Console; 