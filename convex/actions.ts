import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const sendDiscordNotification = internalAction({
    args: {
        message: v.string(),
        webhookUrl: v.string(),
    },
    handler: async (ctx, args) => {
        try {
            await fetch(args.webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: args.message,
                }),
            });
        } catch (error) {
            console.error("Discord notification failed", error);
        }
    },
});
