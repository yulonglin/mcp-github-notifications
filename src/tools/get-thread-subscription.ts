/**
 * Tool implementation for getting a GitHub thread subscription status
 */
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { githubGet } from "../utils/api.js";
import { formatSubscription, successResponse, errorResponse } from "../utils/formatters.js";
import { ThreadSubscription } from "../types/github-api.js";
import { threadIdSchema } from "../utils/schemas.js";

/**
 * Schema for get-thread-subscription tool input parameters
 */
export const getThreadSubscriptionSchema = z.object({
  thread_id: threadIdSchema
});

/**
 * Tool implementation for getting a thread subscription
 */
export async function getThreadSubscriptionHandler(args: z.infer<typeof getThreadSubscriptionSchema>) {
  try {
    // Make request to GitHub API
    const subscription = await githubGet<ThreadSubscription>(`/notifications/threads/${args.thread_id}/subscription`);

    // Format the subscription for better readability
    const formattedSubscription = formatSubscription(subscription);

    return successResponse(`Subscription status for thread ${args.thread_id}:\n\n${formattedSubscription}`);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("404")) {
      return successResponse(`You are not subscribed to thread ${args.thread_id}.`);
    }

    return errorResponse(`Failed to fetch subscription for thread ${args.thread_id}`, error);
  }
}

/**
 * Register this tool with the server
 */
export function registerGetThreadSubscriptionTool(server: McpServer): void {
  server.tool(
    "get-thread-subscription",
    "Get subscription status for a GitHub notification thread",
    getThreadSubscriptionSchema.shape,
    getThreadSubscriptionHandler
  );
}
