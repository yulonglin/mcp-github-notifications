import { mock, beforeEach, afterEach, describe, test, expect } from 'bun:test';
import { githubGet, githubPut, githubPatch, githubDelete } from '../utils/api';
import { createMockResponse } from './test-helpers';

describe('API Utilities', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    process.env.GITHUB_TOKEN = 'test_token_123';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('githubGet parameter handling', () => {
    test('accepts string params', async () => {
      const mockFetch = mock(() => Promise.resolve(createMockResponse(
        { data: 'test' },
        200,
        {
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-reset': '1234567890'
        }
      )));
      global.fetch = mockFetch as any;

      await githubGet('/test', { params: { filter: 'all', page: '1' } });

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('filter=all');
      expect(callUrl).toContain('page=1');
    });

    test('accepts number params', async () => {
      const mockFetch = mock(() => Promise.resolve(createMockResponse({ data: 'test' }, 200, {
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4999',
        'x-ratelimit-reset': '1234567890'
      })));
      global.fetch = mockFetch as any;

      await githubGet('/test', { params: { per_page: 50, page: 2 } });

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('per_page=50');
      expect(callUrl).toContain('page=2');
    });

    test('accepts boolean params', async () => {
      const mockFetch = mock(() => Promise.resolve(createMockResponse({ data: 'test' }, 200, {
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4999',
        'x-ratelimit-reset': '1234567890'
      })));
      global.fetch = mockFetch as any;

      await githubGet('/test', { params: { all: true, participating: false } });

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('all=true');
      expect(callUrl).toContain('participating=false');
    });

    test('skips undefined params', async () => {
      const mockFetch = mock(() => Promise.resolve(createMockResponse({ data: 'test' }, 200, {
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4999',
        'x-ratelimit-reset': '1234567890'
      })));
      global.fetch = mockFetch as any;

      await githubGet('/test', { params: { filter: 'all', empty: undefined } });

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('filter=all');
      expect(callUrl).not.toContain('empty');
    });

    test('encodes special characters', async () => {
      const mockFetch = mock(() => Promise.resolve(createMockResponse({ data: 'test' }, 200, {
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4999',
        'x-ratelimit-reset': '1234567890'
      })));
      global.fetch = mockFetch as any;

      await githubGet('/test', { params: { query: 'foo bar' } });

      const callUrl = mockFetch.mock.calls[0][0] as string;
      // URL encoding uses + for spaces in query strings (both + and %20 are valid)
      expect(callUrl).toContain('query=foo+bar');
    });
  });

  describe('Error Handling', () => {
    test('handles 404 errors', async () => {
      const mockFetch = mock(() => Promise.resolve(createMockResponse(
        { message: 'Not Found' },
        404,
        {
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-reset': '1234567890'
        }
      )));
      global.fetch = mockFetch as any;

      await expect(githubGet('/test')).rejects.toThrow('Resource not found: Not Found');
    });

    test('handles 401 errors', async () => {
      const mockFetch = mock(() => Promise.resolve(createMockResponse(
        { message: 'Unauthorized' },
        401,
        {
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-reset': '1234567890'
        }
      )));
      global.fetch = mockFetch as any;

      await expect(githubGet('/test')).rejects.toThrow('Authentication failed');
    });

    test('handles rate limiting', async () => {
      const mockFetch = mock(() => Promise.resolve(createMockResponse(
        { message: 'API rate limit exceeded' },
        403,
        {
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '1234567890'
        }
      )));
      global.fetch = mockFetch as any;

      await expect(githubGet('/test')).rejects.toThrow('GitHub API rate limit exceeded');
    });
  });
});
