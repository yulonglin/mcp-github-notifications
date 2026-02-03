import { z } from 'zod';
import {
  paginationSchema,
  repoIdentifierSchema,
  notificationFilterSchema,
  timestampSchema,
  threadIdSchema
} from '../utils/schemas';

describe('Shared Schemas', () => {
  describe('paginationSchema', () => {
    test('accepts valid page and per_page', () => {
      const schema = z.object(paginationSchema);
      const result = schema.safeParse({ page: 2, per_page: 50 });
      expect(result.success).toBe(true);
    });

    test('accepts optional pagination params', () => {
      const schema = z.object(paginationSchema);
      const result = schema.safeParse({});
      expect(result.success).toBe(true);
    });

    test('accepts exactly 1 page (lower bound)', () => {
      const schema = z.object(paginationSchema);
      const result = schema.safeParse({ page: 1 });
      expect(result.success).toBe(true);
    });

    test('accepts exactly 100 page (upper bound)', () => {
      const schema = z.object(paginationSchema);
      const result = schema.safeParse({ page: 100 });
      expect(result.success).toBe(true);
    });

    test('rejects negative page numbers', () => {
      const schema = z.object(paginationSchema);
      const result = schema.safeParse({ page: -1 });
      expect(result.success).toBe(false);
    });

    test('rejects page > 100', () => {
      const schema = z.object(paginationSchema);
      const result = schema.safeParse({ page: 101 });
      expect(result.success).toBe(false);
    });

    test('rejects per_page > 100', () => {
      const schema = z.object(paginationSchema);
      const result = schema.safeParse({ per_page: 150 });
      expect(result.success).toBe(false);
    });
  });

  describe('repoIdentifierSchema', () => {
    test('accepts valid owner and repo', () => {
      const schema = z.object(repoIdentifierSchema);
      const result = schema.safeParse({ owner: 'nodejs', repo: 'node' });
      expect(result.success).toBe(true);
    });

    test('accepts repo names with hyphens', () => {
      const schema = z.object(repoIdentifierSchema);
      const result = schema.safeParse({ owner: 'my-org', repo: 'my-repo' });
      expect(result.success).toBe(true);
    });

    test('rejects empty strings', () => {
      const schema = z.object(repoIdentifierSchema);
      const result = schema.safeParse({ owner: '', repo: 'node' });
      expect(result.success).toBe(false);
    });

    test('rejects owner/repo with path traversal attempts', () => {
      const schema = z.object(repoIdentifierSchema);
      const result = schema.safeParse({ owner: '../etc', repo: 'passwd' });
      expect(result.success).toBe(false);
    });

    test('rejects owner starting with dot', () => {
      const schema = z.object(repoIdentifierSchema);
      const result = schema.safeParse({ owner: '.hidden', repo: 'test' });
      expect(result.success).toBe(false);
    });

    test('rejects encoded path traversal', () => {
      const schema = z.object(repoIdentifierSchema);
      const result = schema.safeParse({ owner: '%2e%2e%2fetc', repo: 'test' });
      expect(result.success).toBe(false);
    });
  });

  describe('threadIdSchema', () => {
    test('accepts valid numeric thread IDs', () => {
      const result = threadIdSchema.safeParse('1234567890');
      expect(result.success).toBe(true);
    });

    test('rejects non-numeric thread IDs', () => {
      const result = threadIdSchema.safeParse('abc123');
      expect(result.success).toBe(false);
    });

    test('rejects empty thread ID', () => {
      const result = threadIdSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    test('rejects thread ID > 20 chars', () => {
      const result = threadIdSchema.safeParse('123456789012345678901');
      expect(result.success).toBe(false);
    });
  });

  describe('timestampSchema', () => {
    test('accepts valid ISO 8601 timestamp', () => {
      const result = timestampSchema.safeParse('2024-01-15T10:30:00Z');
      expect(result.success).toBe(true);
    });

    test('accepts timestamp with milliseconds', () => {
      const result = timestampSchema.safeParse('2024-01-15T10:30:00.123Z');
      expect(result.success).toBe(true);
    });

    test('accepts timestamp with timezone offset', () => {
      const result = timestampSchema.safeParse('2024-01-15T10:30:00+05:30');
      expect(result.success).toBe(true);
    });

    test('rejects invalid date format', () => {
      const result = timestampSchema.safeParse('2024-13-45');
      expect(result.success).toBe(false);
    });

    test('rejects non-ISO format', () => {
      const result = timestampSchema.safeParse('Jan 15, 2024');
      expect(result.success).toBe(false);
    });
  });

  describe('notificationFilterSchema', () => {
    test('accepts all valid filter combinations', () => {
      const schema = z.object(notificationFilterSchema);
      const result = schema.safeParse({
        all: true,
        participating: false,
        since: '2024-01-01T00:00:00Z',
        before: '2024-12-31T23:59:59Z',
        page: 1,
        per_page: 50
      });
      expect(result.success).toBe(true);
    });

    test('accepts empty filter object', () => {
      const schema = z.object(notificationFilterSchema);
      const result = schema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('Schema Composition', () => {
    test('composed schemas preserve all validations', () => {
      const composedSchema = z.object({
        ...repoIdentifierSchema,
        ...notificationFilterSchema
      });

      // Should reject invalid repo + valid filters
      expect(composedSchema.safeParse({
        owner: '../etc',
        repo: 'passwd',
        page: 1
      }).success).toBe(false);

      // Should accept valid repo + valid filters
      expect(composedSchema.safeParse({
        owner: 'nodejs',
        repo: 'node',
        page: 2,
        per_page: 50
      }).success).toBe(true);
    });
  });
});
