/**
 * Tool implementation for setting a GitHub thread subscription
 */
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { githubPut } from "../utils/api.js";
import { formatSubscription, successResponse, errorResponse } from "../utils/formatters.js";
import { ThreadSubscription } from "../types/github-api.js";
import { threadIdSchema } from "../utils/schemas.js";

/**
 * Schema for set-thread-subscription tool input parameters
 */
export const setThreadSubscriptionSchema = z.object({
  thread_id: threadIdSchema,
  ignored: z.boolean().optional().default(false).describe("If true, notifications will be ignored")
});

/**
 * Tool implementation for setting a thread subscription
 */
export async function setThreadSubscriptionHandler(args: z.infer<typeof setThreadSubscriptionSchema>) {
  try {
    // Prepare request body
    const requestBody = {
      ignored: args.ignored
    };

    // Make request to GitHub API
    const subscription = await githubPut<ThreadSubscription>(
      `/notifications/threads/${args.thread_id}/subscription`, 
      requestBody
    );

    // Format the subscription for better readability
    const formattedSubscription = formatSubscription(subscription);
    const status = args.ignored ? "ignoring" : "subscribing to";

    return successResponse(`Successfully updated subscription by ${status} thread ${args.thread_id}:\n\n${formattedSubscription}`);
  } catch (error: unknown) {
    return errorResponse(`Failed to update subscription for thread ${args.thread_id}`, error);
  }
}

/**
 * Register this tool with the server
 */
export function registerSetThreadSubscriptionTool(server: McpServer): void {
  server.tool(
    "set-thread-subscription",
    "Subscribe to a GitHub notification thread",
    setThreadSubscriptionSchema.shape,
    setThreadSubscriptionHandler
  );
}
