/**
 * Tool implementation for marking a GitHub notification thread as read
 */
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { githubPatch } from "../utils/api.js";
import { successResponse, errorResponse } from "../utils/formatters.js";
import { threadIdSchema } from "../utils/schemas.js";

/**
 * Schema for mark-thread-read tool input parameters
 */
export const markThreadReadSchema = z.object({
  thread_id: threadIdSchema
});

/**
 * Tool implementation for marking a GitHub notification thread as read
 */
export async function markThreadReadHandler(args: z.infer<typeof markThreadReadSchema>) {
  try {
    await githubPatch(`/notifications/threads/${args.thread_id}`);
    return successResponse(`Successfully marked thread ${args.thread_id} as read.`);
  } catch (error: unknown) {
    return errorResponse(`Failed to mark thread ${args.thread_id} as read`, error);
  }
}

/**
 * Register this tool with the server
 */
export function registerMarkThreadReadTool(server: McpServer): void {
  server.tool(
    "mark-thread-read",
    "Mark a GitHub notification thread as read",
    markThreadReadSchema.shape,
    markThreadReadHandler
  );
}
