/**
 * Tests for formatter utilities
 */
import { convertApiUrlToHtmlUrl, successResponse, errorResponse } from '../utils/formatters';

describe('URL Conversion Tests', () => {
  test('converts pull request API URLs to HTML URLs correctly', () => {
    const apiUrl = 'https://api.github.com/repos/nodejs/node/pulls/57557';
    const expectedHtmlUrl = 'https://github.com/nodejs/node/pull/57557';
    
    expect(convertApiUrlToHtmlUrl(apiUrl)).toBe(expectedHtmlUrl);
  });

  test('converts issue API URLs to HTML URLs correctly', () => {
    const apiUrl = 'https://api.github.com/repos/nodejs/node/issues/12345';
    const expectedHtmlUrl = 'https://github.com/nodejs/node/issues/12345';
    
    expect(convertApiUrlToHtmlUrl(apiUrl)).toBe(expectedHtmlUrl);
  });

  test('converts repository API URLs to HTML URLs correctly', () => {
    const apiUrl = 'https://api.github.com/repos/nodejs/node';
    const expectedHtmlUrl = 'https://github.com/nodejs/node';
    
    expect(convertApiUrlToHtmlUrl(apiUrl)).toBe(expectedHtmlUrl);
  });

  test('handles URLs with additional path segments', () => {
    const apiUrl = 'https://api.github.com/repos/nodejs/node/pulls/57557/comments';
    const expectedHtmlUrl = 'https://github.com/nodejs/node/pull/57557/comments';

    expect(convertApiUrlToHtmlUrl(apiUrl)).toBe(expectedHtmlUrl);
  });
});

describe('Response Helpers', () => {
  describe('successResponse', () => {
    test('creates success response with text content', () => {
      const result = successResponse('Operation completed');

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Operation completed' }]
      });
      expect(result.isError).toBeUndefined();
    });
  });

  describe('errorResponse', () => {
    test('creates error response from Error object', () => {
      const error = new Error('Something went wrong');
      const result = errorResponse('Failed to process', error);

      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Failed to process');
      expect(result.content[0].text).toContain('Something went wrong');
    });

    test('creates error response from string error', () => {
      const result = errorResponse('Failed to process', 'Network timeout');

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to process');
      expect(result.content[0].text).toContain('Network timeout');
    });

    test('creates error response from unknown error type', () => {
      const result = errorResponse('Failed to process', { code: 500 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to process');
    });
  });

  describe('Integration with tools', () => {
    test('response helpers work in tool handler pattern', () => {
      const simulateSuccess = () => successResponse('Task completed');
      const simulateError = () => errorResponse('Task failed', new Error('Network timeout'));

      expect(simulateSuccess()).toHaveProperty('content');
      expect(simulateSuccess().isError).toBeUndefined();
      expect(simulateError()).toHaveProperty('isError', true);
    });
  });
});
