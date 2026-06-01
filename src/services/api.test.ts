import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockCreate = vi.fn(() => ({ get: mockGet }));

vi.mock('axios', () => ({
  default: { create: mockCreate },
}));

// Import after mock so the module-level axios.create() call is intercepted
const { getServiceRequests, getTopPending, getServiceRequest } = await import('./api');

beforeEach(() => {
  mockGet.mockClear();
});

describe('client configuration', () => {
  it('creates the axios instance with the base URL from VITE_API_BASE_URL', () => {
    // VITE_API_BASE_URL is pinned to this value in vite.config.ts test.env
    expect(mockCreate).toHaveBeenCalledWith({ baseURL: 'http://test-api.example.com' });
  });
});

describe('getServiceRequests', () => {
  it('calls the correct path and returns the response data', async () => {
    const fakeData = [{ id: '1', title: 'Test' }];
    mockGet.mockResolvedValue({ data: fakeData });

    const result = await getServiceRequests();

    expect(mockGet).toHaveBeenCalledWith('/api/service-requests');
    expect(result).toEqual(fakeData);
  });
});

describe('getTopPending', () => {
  it('calls the correct path and returns the response data', async () => {
    const fakeData = [{ id: '2', title: 'Urgent' }];
    mockGet.mockResolvedValue({ data: fakeData });

    const result = await getTopPending();

    expect(mockGet).toHaveBeenCalledWith('/api/service-requests/top-pending');
    expect(result).toEqual(fakeData);
  });
});

describe('getServiceRequest', () => {
  it('interpolates the id into the path and returns the response data', async () => {
    const fakeRequest = { id: 'abc', title: 'Single request' };
    mockGet.mockResolvedValue({ data: fakeRequest });

    const result = await getServiceRequest('abc');

    expect(mockGet).toHaveBeenCalledWith('/api/service-requests/abc');
    expect(result).toEqual(fakeRequest);
  });
});
