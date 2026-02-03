/**
 * Helper to create mock Response for API testing
 * IMPORTANT: Uses Headers object (not Map) to match actual Response interface
 */
export function createMockResponse(
  body: any,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  const mockHeaders = new Headers();
  Object.entries(headers).forEach(([k, v]) => mockHeaders.set(k, v));

  return {
    ok: status >= 200 && status < 300,
    status,
    headers: mockHeaders,
    url: 'https://api.github.com/test',
    json: async () => body,
  } as Response;
}
