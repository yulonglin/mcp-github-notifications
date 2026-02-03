/**
 * Tool implementation for deleting a GitHub thread subscription
 */
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { githubDelete } from "../utils/api.js";
import { successResponse, errorResponse } from "../utils/formatters.js";
import { threadIdSchema } from "../utils/schemas.js";

/**
 * Schema for delete-thread-subscription tool input parameters
 */
export const deleteThreadSubscriptionSchema = z.object({
  thread_id: threadIdSchema
});

/**
 * Tool implementation for deleting a thread subscription
 */
export async function deleteThreadSubscriptionHandler(args: z.infer<typeof deleteThreadSubscriptionSchema>) {
  try {
    await githubDelete(`/notifications/threads/${args.thread_id}/subscription`);
    return successResponse(`Successfully unsubscribed from thread ${args.thread_id}.`);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("404")) {
      return successResponse(`You were not subscribed to thread ${args.thread_id}.`);
    }

    return errorResponse(`Failed to unsubscribe from thread ${args.thread_id}`, error);
  }
}

/**
 * Register this tool with the server
 */
export function registerDeleteThreadSubscriptionTool(server: McpServer): void {
  server.tool(
    "delete-thread-subscription",
    "Unsubscribe from a GitHub notification thread",
    deleteThreadSubscriptionSchema.shape,
    deleteThreadSubscriptionHandler
  );
}
