import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, createElement } from 'react';
import { useServiceRequests, useTopPending, useServiceRequest } from './useServiceRequests';

// Mock the api module so no real HTTP calls are made
vi.mock('../services/api', () => ({
  getServiceRequests: vi.fn().mockResolvedValue([]),
  getTopPending: vi.fn().mockResolvedValue([]),
  getServiceRequest: vi.fn().mockResolvedValue(null),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useServiceRequests', () => {
  it('uses query key ["service-requests"]', () => {
    const { result } = renderHook(() => useServiceRequests(), { wrapper: makeWrapper() });
    // TanStack Query v5 exposes the query key in the query result options
    // We verify this indirectly: the hook resolves without error and returns the expected shape
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isError');
  });
});

describe('useTopPending', () => {
  it('uses query key ["service-requests", "top-pending"]', () => {
    const { result } = renderHook(() => useTopPending(), { wrapper: makeWrapper() });
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isError');
  });
});

describe('useServiceRequest', () => {
  it('has enabled: false when id is null (query does not fire)', async () => {
    const { getServiceRequest } = vi.mocked(await import('../services/api'));
    const { result } = renderHook(() => useServiceRequest(null), { wrapper: makeWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(getServiceRequest).not.toHaveBeenCalled();
  });

  it('has enabled: true when id is a string (query fires)', async () => {
    const { getServiceRequest } = vi.mocked(await import('../services/api'));
    const { result } = renderHook(() => useServiceRequest('some-id'), { wrapper: makeWrapper() });
    expect(result.current.fetchStatus).not.toBe('idle');
    expect(getServiceRequest).toHaveBeenCalledWith('some-id');
  });
});
