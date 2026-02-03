/**
 * Tool implementation for listing repository notifications
 */
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { githubGet } from "../utils/api.js";
import { formatNotification, successResponse, errorResponse } from "../utils/formatters.js";
import { NotificationResponse } from "../types/github-api.js";
import { repoIdentifierSchema, notificationFilterSchema } from "../utils/schemas.js";

/**
 * Schema for list-repo-notifications tool input parameters
 */
export const listRepoNotificationsSchema = z.object({
  ...repoIdentifierSchema,
  ...notificationFilterSchema
});

/**
 * Tool implementation for listing repository notifications
 */
export async function listRepoNotificationsHandler(args: z.infer<typeof listRepoNotificationsSchema>) {
  try {
    const perPage = args.per_page || 30;
    const page = args.page || 1;
    
    // Make request to GitHub API
    const notifications = await githubGet<NotificationResponse[]>(`/repos/${args.owner}/${args.repo}/notifications`, {
      params: {
        all: args.all,
        participating: args.participating,
        since: args.since,
        before: args.before,
        page: page,
        per_page: perPage,
      }
    });

    // If no notifications, return simple message
    if (notifications.length === 0) {
      return successResponse(`No notifications found for repository ${args.owner}/${args.repo} with the given criteria.`);
    }

    // Format the notifications for better readability
    const formattedNotifications = notifications.map(formatNotification).join("\n\n");

    // Check for pagination - simplified approach without headers
    let paginationInfo = "";

    if (notifications.length === perPage) {
      paginationInfo = "\n\nMore notifications may be available. You can view the next page by specifying 'page: " +
        (page + 1) + "' in the request.";
    }

    return successResponse(`${notifications.length} notifications found for repository ${args.owner}/${args.repo}:

${formattedNotifications}${paginationInfo}`);
  } catch (error: unknown) {
    return errorResponse(`Failed to fetch notifications for repository ${args.owner}/${args.repo}`, error);
  }
}

/**
 * Register this tool with the server
 */
export function registerListRepoNotificationsTool(server: McpServer): void {
  server.tool(
    "list-repo-notifications",
    "List GitHub notifications for a specific repository",
    listRepoNotificationsSchema.shape,
    listRepoNotificationsHandler
  );
}
