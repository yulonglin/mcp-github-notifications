/**
 * Tool implementation for getting a GitHub notification thread
 */
import { z } from "zod";
import { githubGet } from "../utils/api.js";
import { formatNotification, successResponse, errorResponse } from "../utils/formatters.js";
import { NotificationResponse } from "../types/github-api.js";
import { threadIdSchema } from "../utils/schemas.js";

/**
 * Schema for get-thread tool input parameters
 */
export const getThreadSchema = z.object({
  thread_id: threadIdSchema
});

/**
 * Tool implementation for getting a GitHub notification thread
 */
export async function getThreadHandler(args: z.infer<typeof getThreadSchema>) {
  try {
    // Make request to GitHub API
    const thread = await githubGet<NotificationResponse>(`/notifications/threads/${args.thread_id}`);

    // Format the thread for better readability
    const formattedThread = formatNotification(thread);

    return successResponse(`Thread details:\n\n${formattedThread}`);
  } catch (error: unknown) {
    return errorResponse(`Failed to fetch thread ${args.thread_id}`, error);
  }
}

/**
 * Register this tool with the server
 */
export function registerGetThreadTool(server: any) {
  server.tool(
    "get-thread",
    "Get information about a GitHub notification thread",
    getThreadSchema.shape,
    getThreadHandler
  );
}
