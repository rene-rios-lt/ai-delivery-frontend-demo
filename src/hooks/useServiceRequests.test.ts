import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
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

  it('calls getServiceRequests as its queryFn', async () => {
    const { getServiceRequests } = vi.mocked(await import('../services/api'));
    const { wrapper } = makeClientAndWrapper();
    renderHook(() => useServiceRequests(), { wrapper });
    await waitFor(() => expect(getServiceRequests).toHaveBeenCalled());
  });
});

describe('useTopPending', () => {
  it('registers a query with key ["service-requests", "top-pending"]', () => {
    const { queryClient, wrapper } = makeClientAndWrapper();
    renderHook(() => useTopPending(), { wrapper });
    const keys = queryClient.getQueryCache().getAll().map(q => q.queryKey);
    expect(keys).toContainEqual(['service-requests', 'top-pending']);
  });

  it('calls getTopPending as its queryFn', async () => {
    const { getTopPending } = vi.mocked(await import('../services/api'));
    const { wrapper } = makeClientAndWrapper();
    renderHook(() => useTopPending(), { wrapper });
    await waitFor(() => expect(getTopPending).toHaveBeenCalled());
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

  it('calls getServiceRequest with the id when id is a string', async () => {
    const { getServiceRequest } = vi.mocked(await import('../services/api'));
    const { wrapper } = makeClientAndWrapper();
    renderHook(() => useServiceRequest('some-id'), { wrapper });
    await waitFor(() => expect(getServiceRequest).toHaveBeenCalledWith('some-id'));
  });
});
  