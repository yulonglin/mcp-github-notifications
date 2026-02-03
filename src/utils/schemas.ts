import { z } from "zod";

/**
 * Common pagination parameters used across list endpoints
 */
export const paginationSchema = {
  page: z.number()
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .max(100, "GitHub API limits pagination to 100 pages")
    .optional()
    .describe("Page number for pagination (1-100)"),
  per_page: z.number()
    .int("Items per page must be a whole number")
    .min(1, "Must request at least 1 item per page")
    .max(100, "GitHub API maximum is 100 items per page")
    .optional()
    .describe("Number of results per page (1-100, default 30)")
};

/**
 * GitHub repository identifier with strict validation and security checks
 */
export const repoIdentifierSchema = {
  owner: z.string()
    .min(1, "Owner cannot be empty")
    .max(39, "GitHub username maximum length is 39 characters")
    .regex(
      /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
      "Owner must start and end with alphanumeric characters, may contain hyphens"
    )
    .describe("The account owner of the repository"),
  repo: z.string()
    .min(1, "Repository name cannot be empty")
    .max(100, "Repository name maximum length is 100 characters")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Repository name can only contain alphanumeric characters, dots, underscores, and hyphens"
    )
    .refine(
      val => {
        const decoded = decodeURIComponent(val);
        return !decoded.includes('..') &&
               !decoded.includes('\0') &&
               !decoded.includes('/') &&
               !decoded.includes('\\') &&
               !decoded.startsWith('.');
      },
      "Repository name contains invalid characters or path traversal attempts"
    )
    .describe("The name of the repository")
};

/**
 * GitHub notification thread ID validation
 */
export const threadIdSchema = z.string()
  .min(1, "Thread ID cannot be empty")
  .max(20, "Thread ID too long")
  .regex(/^\d+$/, "Thread ID must be numeric")
  .describe("GitHub notification thread ID");

/**
 * ISO 8601 timestamp validation
 */
export const timestampSchema = z.string()
  .max(64, "Timestamp exceeds maximum length")
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/,
    "Must be a valid ISO 8601 timestamp (e.g., 2024-01-15T10:30:00Z)"
  )
  .describe("ISO 8601 formatted timestamp");

/**
 * Common notification filtering parameters
 */
export const notificationFilterSchema = {
  all: z.boolean()
    .optional()
    .describe("If true, show notifications marked as read (default: false)"),
  participating: z.boolean()
    .optional()
    .describe("If true, only show notifications for threads you're directly participating in"),
  since: timestampSchema
    .optional()
    .describe("Only show notifications updated after this time"),
  before: timestampSchema
    .optional()
    .describe("Only show notifications updated before this time"),
  ...paginationSchema
};
