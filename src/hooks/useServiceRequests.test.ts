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

function makeClientAndWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
  return { queryClient, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useServiceRequests', () => {
  it('registers a query with key ["service-requests"]', () => {
    const { queryClient, wrapper } = makeClientAndWrapper();
    renderHook(() => useServiceRequests(), { wrapper });
    const keys = queryClient.getQueryCache().getAll().map(q => q.queryKey);
    expect(keys).toContainEqual(['service-requests']);
  });
});

describe('useTopPending', () => {
  it('registers a query with key ["service-requests", "top-pending"]', () => {
    const { queryClient, wrapper } = makeClientAndWrapper();
    renderHook(() => useTopPending(), { wrapper });
    const keys = queryClient.getQueryCache().getAll().map(q => q.queryKey);
    expect(keys).toContainEqual(['service-requests', 'top-pending']);
  });
});

describe('useServiceRequest', () => {
  it('has enabled: false when id is null (query does not fire)', async () => {
    const { getServiceRequest } = vi.mocked(await import('../services/api'));
    const { wrapper } = makeClientAndWrapper();
    const { result } = renderHook(() => useServiceRequest(null), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(getServiceRequest).not.toHaveBeenCalled();
  });

  it('has enabled: true when id is a string (query fires)', async () => {
    const { getServiceRequest } = vi.mocked(await import('../services/api'));
    const { wrapper } = makeClientAndWrapper();
    const { result } = renderHook(() => useServiceRequest('some-id'), { wrapper });
    expect(result.current.fetchStatus).not.toBe('idle');
    expect(getServiceRequest).toHaveBeenCalledWith('some-id');
  });
});
  