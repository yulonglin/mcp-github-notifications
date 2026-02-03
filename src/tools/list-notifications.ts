/**
 * Tool implementation for listing GitHub notifications
 */
import { z } from "zod";
import { githubGet } from "../utils/api.js";
import { formatNotification, successResponse, errorResponse } from "../utils/formatters.js";
import { NotificationResponse } from "../types/github-api.js";
import { notificationFilterSchema } from "../utils/schemas.js";

/**
 * Schema for list-notifications tool input parameters
 */
export const listNotificationsSchema = z.object(notificationFilterSchema);

/**
 * Tool implementation for listing GitHub notifications
 */
export async function listNotificationsHandler(args: z.infer<typeof listNotificationsSchema>) {
  try {
    const perPage = args.per_page || 50;
    const page = args.page || 1;
    
    // Make request to GitHub API
    const notifications = await githubGet<NotificationResponse[]>("/notifications", {
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
      return successResponse("No notifications found with the given criteria.");
    }

    // Format the notifications for better readability
    const formattedNotifications = notifications.map(formatNotification).join("\n\n");

    // Check for pagination - simplified approach without headers
    let paginationInfo = "";

    if (notifications.length === perPage) {
      paginationInfo = "\n\nMore notifications may be available. You can view the next page by specifying 'page: " +
        (page + 1) + "' in the request.";
    }

    return successResponse(`${notifications.length} notifications found:

${formattedNotifications}${paginationInfo}`);
  } catch (error: unknown) {
    return errorResponse("Failed to fetch notifications", error);
  }
}

/**
 * Register this tool with the server
 */
export function registerListNotificationsTool(server: any) {
  server.tool(
    "list-notifications",
    "List GitHub notifications for the authenticated user",
    listNotificationsSchema.shape,
    listNotificationsHandler
  );
}
