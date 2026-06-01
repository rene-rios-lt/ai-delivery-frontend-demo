import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios before importing api so the module-level axios.create() is intercepted
const mockGet = vi.fn();
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({ get: mockGet })),
  },
}));

// Import api AFTER mocking axios
const { getServiceRequests, getTopPending, getServiceRequest } = await import('./api');

beforeEach(() => {
  mockGet.mockClear();
});

describe('getServiceRequests', () => {
  it('calls GET /api/service-requests and returns data', async () => {
    const fakeData = [{ id: '1', title: 'Test' }];
    mockGet.mockResolvedValue({ data: fakeData });

    const result = await getServiceRequests();

    expect(mockGet).toHaveBeenCalledWith('/api/service-requests');
    expect(result).toEqual(fakeData);
  });
});

describe('getTopPending', () => {
  it('calls GET /api/service-requests/top-pending and returns data', async () => {
    const fakeData = [{ id: '2', title: 'Urgent' }];
    mockGet.mockResolvedValue({ data: fakeData });

    const result = await getTopPending();

    expect(mockGet).toHaveBeenCalledWith('/api/service-requests/top-pending');
    expect(result).toEqual(fakeData);
  });
});

describe('getServiceRequest', () => {
  it('calls GET /api/service-requests/:id and returns data', async () => {
    const fakeRequest = { id: 'abc', title: 'Single request' };
    mockGet.mockResolvedValue({ data: fakeRequest });

    const result = await getServiceRequest('abc');

    expect(mockGet).toHaveBeenCalledWith('/api/service-requests/abc');
    expect(result).toEqual(fakeRequest);
  });
});
